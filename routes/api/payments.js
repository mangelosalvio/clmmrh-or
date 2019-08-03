const express = require("express");
const router = express.Router();
const Payment = require("./../../models/Payment");
const WaterBilling = require("./../../models/WaterBilling");
const WaterBillingLedger = require("./../../models/WaterBillingLedger");
const AssociationBillingLedger = require("./../../models/AssociationBillingLedger");
const Counter = require("./../../models/Counter");
const isEmpty = require("./../../validators/is-empty");
const filterId = require("./../../utils/filterId");
const validateInput = require("./../../validators/payments");
const multer = require("multer");
const fs = require("fs");
const moment = require("moment-timezone");
const round = require("./../../utils/round");
const Constants = require("./../../config/constants");
const mongoose = require("mongoose");

const Model = Payment;

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

  const datetime = moment.tz(moment(), process.env.TIMEZONE);
  const log = `Added by ${user.name} on ${datetime.format("LLL")}`;

  const logs = [
    {
      user,
      datetime,
      log
    }
  ];

  Counter.increment("si_number").then(result => {
    const newRecord = new Model({
      ...body,
      si_number: result.next,
      logs
    });
    newRecord
      .save()
      .then(record => {
        savePaymentToLedger(record);
        return res.json(record);
      })
      .catch(err => console.log(err));
  });
});

router.post("/latest", (req, res) => {
  WaterBilling.findOne({
    "member._id": req.body.member._id
  })
    .sort({
      _id: -1
    })
    .then(billing => res.json(billing.meters));
});

router.post("/:id", (req, res) => {
  const { isValid, errors } = validateInput(req.body);

  if (!isValid) {
    return res.status(401).json(errors);
  }

  const filtered_body = filterId(req);
  const user = req.body.user;

  Model.findById(req.params.id).then(record => {
    updateLedgerIfLatestPayment(record)
      .then(() => {
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
              updatePaymentsLedger(record);
              return res.json(record);
            })
            .catch(err => console.log(err));
        } else {
          console.log("ID not found");
        }
      })
      .catch(err => {
        return res.status(401).json({
          message: "Unable to update payment, not latest transaction"
        });
      });
  });
});

router.delete("/:id", (req, res) => {
  Model.findById(req.params.id).then(payment => {
    let LedgerModel;
    if (payment.transaction === Constants.WATER_BILLING) {
      LedgerModel = WaterBillingLedger;
    } else if (payment.transaction === Constants.ASSOCIATION_DUES) {
      LedgerModel = AssociationBillingLedger;
    }

    //check latest billing in ledger
    LedgerModel.findOne({
      "member._id": payment.member._id
    })
      .sort({
        _id: -1
      })
      .then(latest_ledger => {
        if (latest_ledger) {
          if (latest_ledger.item.equals(payment._id)) {
            payment.delete();
            latest_ledger.delete();
            return res.json({ success: 1 });
          } else {
            return res.status(401).json({
              message: "Unable to delete payment, not latest transaction"
            });
          }
        }
      });
  });
});

const updatePaymentsLedger = record => {
  if (record.transaction === Constants.WATER_BILLING) {
    LedgerModel = WaterBillingLedger;
  } else if (record.transaction === Constants.ASSOCIATION_DUES) {
    LedgerModel = AssociationBillingLedger;
  }

  LedgerModel.findOne({
    item: record._id
  }).then(ledger => {
    if (ledger) {
      const newRunning = round(
        parseFloat(ledger.old_running) - parseFloat(record.amount)
      );
      ledger.amount = record.amount;
      ledger.running = newRunning;

      ledger.save();
    }
  });
};

const savePaymentToLedger = record => {
  let LedgerModel;
  if (record.transaction === Constants.WATER_BILLING) {
    LedgerModel = WaterBillingLedger;
  } else if (record.transaction === Constants.ASSOCIATION_DUES) {
    LedgerModel = AssociationBillingLedger;
  }
  LedgerModel.findOne({
    "member._id": record.member._id
  })
    .sort({
      _id: -1
    })
    .then(ledger => {
      let running = ledger ? ledger.running : 0;
      const newRunning = round(parseFloat(running) - parseFloat(record.amount));

      const newLedger = new LedgerModel({
        date: record.date,
        member: record.member,
        reference: `OR#: ${record.or_number}`,
        kind: "payments",
        item: record._id,
        amount: record.amount,
        transaction: record,
        running: newRunning,
        old_running: running
      });

      newLedger.save();
    });
};

const updateLedgerIfLatestPayment = record => {
  return new Promise((resolve, reject) => {
    if (record.transaction === Constants.WATER_BILLING) {
      LedgerModel = WaterBillingLedger;
    } else if (record.transaction === Constants.ASSOCIATION_DUES) {
      LedgerModel = AssociationBillingLedger;
    }

    //check latest billing in ledger
    LedgerModel.findOne({
      "member._id": record.member._id
    })
      .sort({
        _id: -1
      })
      .then(latest_ledger => {
        if (latest_ledger) {
          if (latest_ledger.item.equals(record._id)) {
            resolve(record);
          } else {
            reject(record);
          }
        }
      });
  });
};

module.exports = router;
