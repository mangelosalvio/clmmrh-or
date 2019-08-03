const express = require("express");
const router = express.Router();
const WaterBilling = require("./../../models/WaterBilling");
const WaterBillingLedger = require("./../../models/WaterBillingLedger");
const Counter = require("./../../models/Counter");
const isEmpty = require("./../../validators/is-empty");
const filterId = require("./../../utils/filterId");
const validateInput = require("./../../validators/water_billings");
const multer = require("multer");
const fs = require("fs");
const moment = require("moment-timezone");
const round = require("./../../utils/round");
const numberFormat = require("./../../utils/numberFormat");
const numeral = require("numeral");

const net = require("net");
const HOST = "192.168.254.1";
const PORT = 9100;
const client = new net.Socket();

client.on("error", err => {
  console.log("Unable to Connect");
});

const Model = WaterBilling;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/sounds/uploads");
  },
  filename: (req, file, cb) => {
    const fileFormat = file.originalname.split(".");
    const ext = fileFormat[fileFormat.length - 1];
    cb(null, file.fieldname + "-" + Date.now() + "." + ext);
  }
});

const recorded_storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/sounds/recorded");
  },
  filename: (req, file, cb) => {
    const fileFormat = file.originalname.split(".");
    const ext = fileFormat[fileFormat.length - 1];
    cb(null, file.fieldname + "-" + Date.now() + "." + ext);
  }
});

const upload = multer({ storage: storage });
const recorded_upload = multer({ storage: recorded_storage });

router.get("/:id", (req, res) => {
  Model.findById(req.params.id)
    .then(record => res.json(record))
    .catch(err => console.log(err));
});

router.get("/", (req, res) => {
  const form_data = isEmpty(req.query)
    ? {}
    : {
        "member.name": {
          $regex: new RegExp(req.query.s, "i")
        }
      };

  Model.find(form_data)
    .sort({ _id: -1 })
    .then(records => {
      return res.json(records);
    })
    .catch(err => console.log(err));
});

router.put("/recorded", recorded_upload.single("recorded_file"), (req, res) => {
  const current_datetime = moment.tz(moment(), process.env.TIMEZONE);
  const zones_selected = JSON.parse(req.body.zones_selected);
  const strZones = getStringZones(zones_selected);

  const user = JSON.parse(req.body.user);
  const newRecordedLog = new RecordedLog({
    zones_selected,
    path: req.file.path,
    user,
    log: `${
      user.name
    } triggered ${strZones} and made an announcement on ${current_datetime.format(
      "LLL"
    )}`,
    datetime_triggered: current_datetime
  });

  newRecordedLog
    .save()
    .then(recordedLog => {
      const data = getTriggerString(recordedLog.zones_selected);
      trigger(data).then(() => {
        //delay before playing sound
        setTimeout(() => {
          player.play(recordedLog.path, err => {
            if (err) console.log("Error :" + err);
            const off_data = getTriggerString([]);
            //do not turn reset
            return res.json(recordedLog);

            /* trigger(off_data).then(() => {
              return res.json(recordedLog);
            }); */
          });
        }, 2000);
      });
    })
    .catch(err => console.log(err));
});

router.put("/", (req, res) => {
  const { isValid, errors } = validateInput(req.body);

  if (!isValid) {
    return res.status(401).json(errors);
  }
  const body = filterId(req);
  const user = req.body.user;

  Model.findOne({
    "member._id": body.member._id,
    billing_date: {
      $gte: moment(body.billing_date)
        .startOf("day")
        .toDate(),
      $lte: moment(body.billing_date)
        .endOf("day")
        .toDate()
    },
    "period_covered.0": {
      $gte: moment(body.period_covered[0])
        .startOf("day")
        .toDate(),
      $lte: moment(body.period_covered[0])
        .endOf("day")
        .toDate()
    },
    "period_covered.1": {
      $gte: moment(body.period_covered[1])
        .startOf("day")
        .toDate(),
      $lte: moment(body.period_covered[1])
        .endOf("day")
        .toDate()
    }
  }).then(record => {
    if (record) {
      errors["member"] = "Transaction already exists";
      return res.status(401).json(errors);
    } else {
      const datetime = moment.tz(moment(), process.env.TIMEZONE);
      const log = `Added by ${user.name} on ${datetime.format("LLL")}`;

      const logs = [
        {
          user,
          datetime,
          log
        }
      ];

      Counter.increment("soa_no").then(result => {
        const newRecord = new Model({
          ...body,
          soa_no: result.next,
          logs
        });
        newRecord
          .save()
          .then(record => {
            saveWaterBillingToLedger(record);
            return res.json(record);
          })
          .catch(err => console.log(err));
      });
    }
  });
});

router.post("/latest", (req, res) => {
  WaterBilling.findOne({
    "member._id": req.body.member._id
  })
    .sort({
      _id: -1
    })
    .then(billing => {
      if (billing) {
        return res.json(billing.meters);
      } else {
        return res.json(null);
      }
    });
});

router.post("/soa", (req, res) => {
  WaterBilling.find({
    "period_covered.0": {
      $gte: moment(req.body.period_covered[0])
        .startOf("day")
        .toDate(),
      $lte: moment(req.body.period_covered[1])
        .endOf("day")
        .toDate()
    },
    "period_covered.1": {
      $gte: moment(req.body.period_covered[0])
        .startOf("day")
        .toDate(),
      $lte: moment(req.body.period_covered[1])
        .endOf("day")
        .toDate()
    }
  })
    .sort({
      "member.name": 1
    })
    .then(records => {
      res.json({ success: 1 });
      printWaterBillingSoA(records);
      return null;
    });
});

router.post("/:id", (req, res) => {
  const { isValid, errors } = validateInput(req.body);

  if (!isValid) {
    return res.status(401).json(errors);
  }

  const filtered_body = filterId(req);

  const user = req.body.user;

  Model.findById(req.params.id).then(record => {
    if (record) {
      const datetime = moment.tz(moment(), process.env.TIMEZONE);
      const log = `Modified by ${user.name} on ${datetime.format("LLL")}`;

      const logs = [
        ...record.logs,
        {
          user,
          datetime,
          log
        }
      ];

      const body = {
        ...filtered_body,
        logs
      };

      record.set({
        ...body
      });

      record
        .save()
        .then(record => {
          updateWaterBillingLedger(record);
          return res.json(record);
        })
        .catch(err => console.log(err));
    } else {
      console.log("ID not found");
    }
  });
});

router.delete("/:id", (req, res) => {
  Model.findById(req.params.id).then(billing => {
    //check latest billing in ledger
    WaterBillingLedger.findOne({
      "member._id": billing.member._id
    })
      .sort({
        _id: -1
      })
      .then(latest_ledger => {
        if (latest_ledger) {
          if (latest_ledger.item.equals(billing._id)) {
            billing.delete();
            latest_ledger.delete();
            return res.json({ success: 1 });
          } else {
            return res.status(401).json({
              message: "Unable to delete billing, not latest transaction"
            });
          }
        }
      });
  });
});

const updateWaterBillingLedger = record => {
  WaterBillingLedger.findOne({
    item: record._id
  }).then(ledger => {
    if (ledger) {
      const newRunning = round(
        parseFloat(ledger.old_running) + parseFloat(record.grand_total)
      );
      ledger.amount = record.grand_total;
      ledger.running = newRunning;
      ledger.save();
    }
  });
};

const saveWaterBillingToLedger = record => {
  WaterBillingLedger.findOne({
    "member._id": record.member._id
  })
    .sort({
      _id: -1
    })
    .then(ledger => {
      let running = ledger ? ledger.running : 0;
      const newRunning = round(
        parseFloat(running) + parseFloat(record.grand_total)
      );

      const newLedger = new WaterBillingLedger({
        date: record.date,
        member: record.member,
        reference: `SOA#: ${record.soa_no}`,
        kind: "water_billings",
        item: record._id,
        amount: record.grand_total,
        transaction: record,
        running: newRunning,
        old_running: running
      });

      newLedger.save();
    });
};

const printWaterBillingSoA = records => {
  client.connect(PORT, HOST, () => {
    records.forEach(record => {
      client.write("\x1b\x40");
      client.write("\x1b\x61\x01");
      client.write("TOWN AND COUNTRY-NEGROS\n");
      client.write("HOME OWNERS/LOT OWNERS ASSOCIATION, INC.\n");
      client.write("TALISAY CITY - TEL.NO. 435-1046\n");
      client.write("email add: tcn_6115talisay@yahoo.com\n\n");

      client.write("STATEMENT OF ACCOUNT\n");
      client.write("MONTHLY WATER BILLING\n\n");

      client.write("\x1b\x61\x00");

      client.write(record.member.name + "\n");
      client.write(record.member.address + "\n\n");

      client.write(`   SOA#            : ${record.soa_no}\n`);
      client.write(
        `   Billing Date    : ${moment(record.billing_date).format("ll")}\n`
      );
      client.write(
        `   Starting Period : ${moment(record.period_covered[0]).format(
          "ll"
        )}\n`
      );

      client.write(
        `   Ending Period   : ${moment(record.period_covered[1]).format(
          "ll"
        )}\n\n`
      );

      client.write(
        `Balance Forwarded \x0d\x1b\x61\x02${numberFormat(
          record.payment.previous_balance
        )}\n\x1b\x61\x00`
      );
      client.write(
        `Payment ` +
          (record.payment.desc !== undefined ? record.payment.desc : "") +
          `\x0d\x1b\x61\x02${numberFormat(
            0 - record.payment.amount
          )}\n\x1b\x61\x00`
      );

      client.write(
        `Balance \x0d\x1b\x61\x02${numberFormat(
          record.previous_balance
        )}\n\x1b\x61\x00`
      );

      client.write("\n");

      record.meters.forEach(meter => {
        client.write(`Lot No.   ${meter.lot_number}\n`);
        client.write(`Meter No. ${meter.meter_number}\n`);
        client.write(`   Prev Rdg    : ${meter.previous_reading}\n`);
        client.write(`   Current Rdg : ${meter.current_reading}\n`);
        client.write(`   Usage       : ${meter.usage}\n`);
        client.write(
          `   Rate        : Php ${record.water_billing_rate} / cu.m.\n`
        );
        client.write(
          `   Amount      :\x0d\x1b\x61\x02${numberFormat(
            meter.amount
          )}\n\x1b\x61\x00`
        );
      });

      client.write("\n");
      client.write(
        `Late Charges \x0d\x1b\x61\x02${numberFormat(
          record.late_charges
        )}\n\x1b\x61\x00`
      );
      client.write(
        `Grand Total \x0d\x1b\x61\x02\x1b\x21\x1c${numberFormat(
          numeral(record.grand_total)
            .add(record.previous_balance)
            .value()
        )}\n\n\x1b\x61\x00`
      );

      client.write("\x1b\x40");
      client.write("\x1b\x61\x01");
      client.write("Note\n");
      client.write(
        "Please present this statement together \nwith your remittance\n\n"
      );
      client.write("Please pay on or before the payment due date\n\n");
      client.write(
        "Please disregard this statement if \npayment has been made\n\n"
      );
      client.write(
        "Please make check payment payable to\nTOWN & COUNTRY - NEGROS \nHOME OWNERS/LOT OWNERS ASSN., INC.\n"
      );
      client.write("-".repeat(40));
      client.write("\n\n");
    });

    client.write("\x1b\x40");
    client.write("\x1b\x61\x00");
    client.write("\n\n\n\n");
    client.destroy();
  });
};

module.exports = router;
