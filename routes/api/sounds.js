const express = require("express");
const router = express.Router();
const SoundAlarm = require("./../../models/SoundAlarm");
const TriggeredLog = require("./../../models/TriggeredLog");
const RecordedLog = require("./../../models/RecordedLog");
const isEmpty = require("./../../validators/is-empty");
const filterId = require("./../../utils/filterId");
const validateInput = require("./../../validators/sounds");
const multer = require("multer");
const fs = require("fs");
const player = require("play-sound")((opts = {}));
const moment = require("moment-timezone");

const Model = SoundAlarm;
let audio;
let is_on_loop = false;

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
        label: {
          $regex: new RegExp("^" + req.query.s, "i")
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

router.put("/", upload.single("location"), (req, res) => {
  const { isValid, errors } = validateInput(req);

  if (!isValid) {
    return res.status(401).json(errors);
  }
  const body = filterId(req);
  const location = req.file ? req.file : null;
  const user = JSON.parse(req.body.user);

  Model.findOne({
    label: req.body.label
  }).then(record => {
    if (record) {
      errors["label"] = "Label already exists";
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
        location,
        logs
      });
      newRecord
        .save()
        .then(record => res.json(record))
        .catch(err => console.log(err));
    }
  });
});

router.post("/play/:id", (req, res) => {
  const current_time = moment.tz(moment(), process.env.TIMEZONE);
  const log_desc = `${req.body.user.name} triggered ${
    req.body.sound.label
  } in ${getStringZones(req.body.zones_selected)} on ${current_time.format(
    "LLL"
  )}`;
  const log = new TriggeredLog({
    zones_selected: req.body.zones_selected,
    sound: req.body.sound,
    trigger: "ON",
    user: req.body.user,
    datetime_triggered: current_time,
    log: log_desc
  });
  log.save();

  SoundAlarm.findById(req.params.id).then(sound => {
    res.json(sound);

    if (req.body.on_loop) {
      is_on_loop = true;
    }
    playSound({ path: sound.location.path, req, res });
  });
});

router.post("/stop", (req, res) => {
  if (is_on_loop) {
    audio.kill();
    is_on_loop = false;
  }

  return res.json({ success: 1 });
});

const playSound = ({ path, req, res }) => {
  audio = player.play(path, err => {
    if (err) console.log("Error :" + err);

    if (req.body.on_loop && is_on_loop) {
      playSound({ path, req, res });
    }
  });
};

router.post("/:id", upload.single("location"), (req, res) => {
  /* const { isValid, errors } = validateInput(req);

  if (!isValid) {
    return res.status(401).json(errors);
  } */

  const filtered_body = filterId(req);
  const location = req.file ? req.file : null;
  const user = JSON.parse(req.body.user);

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
        location,
        logs
      };

      if (isEmpty(body["location"])) {
        delete body["location"];
      }

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
