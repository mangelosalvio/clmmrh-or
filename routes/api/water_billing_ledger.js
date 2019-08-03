const express = require("express");
const router = express.Router();
const WaterBillingLedger = require("./../../models/WaterBillingLedger");
const Counter = require("./../../models/Counter");
const isEmpty = require("./../../validators/is-empty");
const filterId = require("./../../utils/filterId");

const moment = require("moment-timezone");

const Model = WaterBillingLedger;

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

router.post("/ledger", (req, res) => {
  WaterBillingLedger.find({
    "member._id": req.body.member._id
  })
    .sort({ _id: 1 })
    .then(ledger => res.json(ledger));
});

router.post("/ar", (req, res) => {
  WaterBillingLedger.aggregate([
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

router.post("/latest", (req, res) => {
  WaterBillingLedger.findOne({
    "member._id": req.body.member._id
  })
    .sort({
      _id: -1
    })
    .then(ledger => res.json(ledger));
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
        .then(record => res.json(record))
        .catch(err => console.log(err));
    } else {
      console.log("ID not found");
    }
  });
});

router.delete("/:id", (req, res) => {
  Model.findByIdAndRemove(req.params.id)
    .then(response => res.json({ success: 1 }))
    .catch(err => console.log(err));
});

module.exports = router;
