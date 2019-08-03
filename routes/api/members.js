const express = require("express");
const router = express.Router();
const Member = require("./../../models/Member");
const isEmpty = require("./../../validators/is-empty");
const filterId = require("./../../utils/filterId");
const validateInput = require("./../../validators/members");
const multer = require("multer");
const fs = require("fs");
const moment = require("moment-timezone");

const Model = Member;

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
        name: {
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
    name: req.body.name
  }).then(record => {
    if (record) {
      errors["name"] = "Name already exists";
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
        .then(record => res.json(record))
        .catch(err => console.log(err));
    }
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
