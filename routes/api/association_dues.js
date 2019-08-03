const express = require("express");
const router = express.Router();
const AssociationDues = require("./../../models/AssociationDues");
const AssociationBillingLedger = require("./../../models/AssociationBillingLedger");
const Member = require("./../../models/Member");
const Counter = require("./../../models/Counter");
const isEmpty = require("./../../validators/is-empty");
const filterId = require("./../../utils/filterId");
const numberFormat = require("./../../utils/numberFormat");
const validateInput = require("./../../validators/association_dues");
const multer = require("multer");
const fs = require("fs");
const moment = require("moment-timezone");
const Constants = require("./../../config/constants");
const round = require("./../../utils/round");
const sumBy = require("lodash/sumBy");
const numeral = require("numeral");
const mongoose = require("mongoose");
const Model = AssociationDues;

const net = require("net");
const HOST = "192.168.254.1";
const PORT = 9100;
const client = new net.Socket();

client.on("error", err => {
  console.log("Unable to Connect");
});

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

router.put("/", (req, res) => {
  const { isValid, errors } = validateInput(req.body);

  if (!isValid) {
    return res.status(401).json(errors);
  }
  const body = filterId(req);
  const user = req.body.user;

  //Get all asssociation dues from given billing date and due date

  AssociationDues.find({
    billing_date: {
      $gte: moment(body.billing_date)
        .startOf("day")
        .toDate(),
      $lte: moment(body.billing_date)
        .endOf("day")
        .toDate()
    },
    due_date: {
      $gte: moment(body.due_date)
        .startOf("day")
        .toDate(),
      $lte: moment(body.due_date)
        .endOf("day")
        .toDate()
    }
  })
    .then(billed_association_dues => {
      Member.find({
        lots: {
          $exists: true,
          $ne: []
        }
      }).then(members => {
        let unbilled_members = members.filter(member => {
          //remove billed members
          return (
            billed_association_dues.find(o => {
              return member._id.equals(o.member._id);
            }) === undefined
          );
        });

        unbilled_members = unbilled_members.map(member => {
          const datetime = moment.tz(moment(), process.env.TIMEZONE);
          const log = `Added by ${user.name} on ${datetime.format("LLL")}`;

          const logs = [
            {
              user,
              datetime,
              log
            }
          ];

          const lots = member.lots.map(lot => {
            let amount;
            let unit_price = "";
            if (lot.lot_status === Constants.LOT_OWNER) {
              unit_price = `${body.association_dues_lot_owner} per lot`;
              amount = round(body.association_dues_lot_owner);
            } else {
              unit_price = `${body.association_dues_home_owner} per sq.m`;
              amount = round(body.association_dues_home_owner * lot.lot_area);
            }

            return {
              ...lot.toObject(),
              unit_price,
              amount
            };
          });

          const grand_total = sumBy(lots, o => o.amount);

          return {
            member: {
              ...member.toObject(),
              _id: member._id.toString()
            },
            billing_date: body.billing_date,
            due_date: body.due_date,
            association_dues_lot_owner: body.association_dues_lot_owner,
            association_dues_home_owner: body.association_dues_home_owner,
            late_charges_penalty: body.late_charges_penalty,
            lots,
            logs,
            grand_total
          };
        });

        unbilled_members.forEach(o => {
          Counter.increment("soa_no").then(result => {
            // get previous balance
            AssociationBillingLedger.findOne({
              "member._id": o.member._id
            })
              .sort({ _id: -1 })
              .then(latest_ledger => {
                if (latest_ledger !== null) {
                  if (latest_ledger.kind === "payments") {
                    o.payment = {
                      desc: `${moment(latest_ledger.date).format(
                        "ll"
                      )} (${numberFormat(latest_ledger.amount)})`,
                      amount: numberFormat(latest_ledger.amount),
                      previous_balance: latest_ledger.old_running
                    };
                  }
                }

                const old_running = latest_ledger ? latest_ledger.running : 0;
                o.previous_balance = old_running;
                o.late_charges = round(
                  (o.previous_balance * body.late_charges_penalty) / 100
                );
                o.grand_total = round(
                  numeral(o.grand_total)
                    .add(o.late_charges)
                    .value()
                );

                //save to dues
                new AssociationDues({
                  ...o,
                  soa_no: result.next
                })
                  .save()
                  .then(association_due => {
                    saveToLedgerAssociationDue(association_due, latest_ledger);
                  });
              });
          });
        });

        return res.json(unbilled_members);
      });
    })
    .catch(err => console.log(err));
});

router.post("/soa", (req, res) => {
  AssociationDues.find({
    billing_date: {
      $gte: moment(req.body.billing_date)
        .startOf("day")
        .toDate(),
      $lte: moment(req.body.billing_date)
        .endOf("day")
        .toDate()
    },
    due_date: {
      $gte: moment(req.body.due_date)
        .startOf("day")
        .toDate(),
      $lte: moment(req.body.due_date)
        .endOf("day")
        .toDate()
    }
  })
    .sort({
      "member.name": 1
    })
    .then(records => {
      res.json({ success: 1 });
      printAssociationDuesSoA(records);
      return null;
    });
});

router.post("/ledger", (req, res) => {
  AssociationBillingLedger.find({
    "member._id": req.body.member._id
  })
    .sort({ _id: 1 })
    .then(ledger => res.json(ledger));
});

router.post("/ar", (req, res) => {
  AssociationBillingLedger.aggregate([
    {
      $group: {
        _id: "$member.name",
        running: {
          $last: "$running"
        }
      }
    },
    {
      $sort: {
        _id: 1
      }
    }
  ])
    .then(records => res.json(records))
    .catch(err => console.log(err));
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
          updateAssociationBillingLedger(record);
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
    AssociationBillingLedger.findOne({
      "member._id": billing.member._id
    })
      .sort({
        _id: -1
      })
      .then(latest_ledger => {
        console.log(latest_ledger);
        if (latest_ledger) {
          if (latest_ledger.item.equals(billing._id)) {
            console.log("delete");
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

const saveToLedgerAssociationDue = (association_due, latest_ledger) => {
  //get association dues 1 month before

  let old_running = latest_ledger ? latest_ledger.running : 0;

  const new_running = round(
    numeral(old_running).add(association_due.grand_total)
  );

  new AssociationBillingLedger({
    date: association_due.billing_date,
    member: association_due.member,
    reference: `SOA# : ${association_due.soa_no}`,
    kind: "association_dues",
    item: association_due._id,
    transaction: association_due,
    amount: association_due.grand_total,
    running: new_running,
    old_running
  }).save();
};

const updateAssociationBillingLedger = record => {
  AssociationBillingLedger.findOne({
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

const printAssociationDuesSoA = records => {
  const record = records[0];
  client.connect(PORT, HOST, () => {
    records.forEach(record => {
      client.write("\x1b\x40");
      client.write("\x1b\x61\x01");
      client.write("TOWN AND COUNTRY-NEGROS\n");
      client.write("HOME OWNERS/LOT OWNERS ASSOCIATION, INC.\n");
      client.write("TALISAY CITY - TEL.NO. 435-1046\n");
      client.write("email add: tcn_6115talisay@yahoo.com\n\n");

      client.write("STATEMENT OF ACCOUNT\n");
      client.write("MONTHLY ASSOCIATION DUES\n\n");

      client.write("\x1b\x61\x00");

      client.write(record.member.name + "\n");
      client.write(record.member.address + "\n\n");

      client.write(`   SOA#           : ${record.soa_no}\n`);
      client.write(
        `   Billing Date   : ${moment(record.billing_date).format("ll")}\n`
      );
      client.write(
        `   Due Date       : ${moment(record.due_date).format("ll")}\n\n`
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

      record.lots.forEach(lot => {
        client.write(`${lot.lot_number}\n`);
        client.write(`   Lot Area    : ${lot.lot_area}\n`);
        client.write(`   Unit Price  : ${lot.unit_price}\n`);
        client.write(
          `   Amount      :\x0d\x1b\x61\x02${numberFormat(
            lot.amount
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
