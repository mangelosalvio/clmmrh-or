const express = require("express");
const router = express.Router();
const Anesthesiologist = require("./../../models/Anesthesiologist");
const OperatingRoomSlip = require("./../../models/OperatingRoomSlip");
const Counter = require("./../../models/Counter");
const isEmpty = require("./../../validators/is-empty");
const filterId = require("./../../utils/filterId");
const validateInput = require("./../../validators/anesthesiologists");
const multer = require("multer");
const fs = require("fs");
const moment = require("moment-timezone");
const round = require("./../../utils/round");
const numberFormat = require("./../../utils/numberFormat");
const numeral = require("numeral");

const net = require("net");

const Model = Anesthesiologist;

router.get("/:id", (req, res) => {
  Model.findById(req.params.id)
    .then(record => res.json(record))
    .catch(err => console.log(err));
});

router.get("/", (req, res) => {
  const form_data = isEmpty(req.query)
    ? {}
    : {
        last_name: {
          $regex: new RegExp(req.query.s, "i")
        }
      };

  Model.find(form_data)
    .sort({ last_name: 1, first_name: 1 })
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

  Model.findOne({
    last_name: body.last_name,
    first_name: body.first_name,
    middle_name: body.middle_name
  }).then(record => {
    if (record) {
      errors["last_name"] = "Name already exists";
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
    }
  });
});

router.post("/:id/on-duty", (req, res) => {
  Anesthesiologist.findById(req.params.id).then(anes => {
    if (anes) {
      anes.on_duty = req.body.on_duty;
      anes.save().then(anes => {
        const io = req.app.get("socketio");
        io.emit("refresh-display", true);
        return res.json(anes);
      });
    }
  });
});

router.post("/:id/assignments", (req, res) => {
  Model.findById(req.params.id).then(record => {
    record.assignments = req.body.assignments;
    record
      .save()
      .then(record => {
        const io = req.app.get("socketio");
        io.emit("refresh-display", true);
        return res.json(record);
      })
      .catch(err => console.log(err));
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
          const io = req.app.get("socketio");
          io.emit("refresh-display", true);

          OperatingRoomSlip.update(
            {
              "main_anes._id": record._id.toString()
            },
            {
              main_anes: {
                ...record.toObject(),
                _id: record._id.toString()
              }
            },
            {
              multi: true
            }
          ).exec();

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
