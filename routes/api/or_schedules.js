const express = require("express");
const router = express.Router();
const ORSchedule = require("./../../models/ORSchedule");
const Counter = require("./../../models/Counter");
const isEmpty = require("./../../validators/is-empty");
const filterId = require("./../../utils/filterId");
const validateInput = require("./../../validators/or_schedules");
const multer = require("multer");
const fs = require("fs");
const moment = require("moment-timezone");
const round = require("./../../utils/round");
const numberFormat = require("./../../utils/numberFormat");
const numeral = require("numeral");

const net = require("net");

const Model = ORSchedule;

router.get("/:code/code", (req, res) => {
  Model.findOne({ code: req.params.code })
    .then(record => res.json(record))
    .catch(err => console.log(err));
});

router.get("/listings", (req, res) => {
  const form_data = isEmpty(req.query)
    ? {}
    : {
        $or: [
          {
            description: {
              $regex: new RegExp(req.query.s, "i")
            }
          }
        ]
      };

  Model.find(form_data)
    .limit(20)
    .sort({ description: 1 })
    .then(records => {
      return res.json(records);
    })
    .catch(err => console.log(err));
});

router.get("/:id", (req, res) => {
  Model.findById(req.params.id)
    .then(record => res.json(record))
    .catch(err => console.log(err));
});

router.get("/", (req, res) => {
  Model.find({})
    .sort({ code: 1 })
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

  const newRecord = new Model({
    ...body,
    logs
  });
  newRecord
    .save()
    .then(record => {
      const io = req.app.get("socketio");
      io.emit("refresh-display", true);

      return res.json(record);
    })
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
          const io = req.app.get("socketio");
          io.emit("refresh-display", true);
          return res.json(record);
        })
        .catch(err => console.log(err));
    } else {
      console.log("ID not found");
    }
  });
});

router.delete("/:id", (req, res) => {
  Model.findByIdAndRemove(req.params.id)
    .then(response => {
      const io = req.app.get("socketio");
      io.emit("refresh-display", true);
      return res.json({ success: 1 });
    })
    .catch(err => console.log(err));
});

module.exports = router;
