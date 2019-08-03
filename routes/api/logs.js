const express = require("express");
const router = express.Router();
const AlarmSchedule = require("./../../models/AlarmSchedule");
const TriggeredLog = require("./../../models/TriggeredLog");
const RecordedLog = require("./../../models/RecordedLog");
const ManualLog = require("./../../models/ManualLog");
const ScheduledLog = require("./../../models/ScheduledLog");

const isEmpty = require("./../../validators/is-empty");
const filterId = require("./../../utils/filterId");
const validateDateRange = require("./../../validators/logs");
const moment = require("moment");
const moment_tz = require("moment-timezone");

router.put("/manual-override-switch", (req, res) => {
  console.log(req.body);
  const newManualLog = new ManualLog({
    ...req.body
  });

  newManualLog.save().then(log => res.json(log));
});

router.post("/manual-override", (req, res) => {
  const { isValid, errors } = validateDateRange(req.body);

  if (!isValid) {
    return res.status(401).json(errors);
  }

  const from_date = moment(req.body.dates[0]).startOf("day");
  const to_date = moment(req.body.dates[1]).endOf("day");

  ManualLog.find({
    datetime_triggered: {
      $gte: from_date.toDate(),
      $lte: to_date.toDate()
    }
  })
    .sort({
      datetime_triggered: -1
    })
    .then(logs => {
      return res.json(logs);
    });
});

router.post("/manual-trigger", (req, res) => {
  const { isValid, errors } = validateDateRange(req.body);

  if (!isValid) {
    return res.status(401).json(errors);
  }

  const from_date = moment(req.body.dates[0]).startOf("day");
  const to_date = moment(req.body.dates[1]).endOf("day");

  RecordedLog.find({
    datetime_triggered: {
      $gte: from_date.toDate(),
      $lte: to_date.toDate()
    }
  })
    .sort({
      datetime_triggered: -1
    })
    .then(logs => {
      return res.json(logs);
    });
});

router.post("/sounds-trigger", (req, res) => {
  const { isValid, errors } = validateDateRange(req.body);

  if (!isValid) {
    return res.status(401).json(errors);
  }

  const from_date = moment(req.body.dates[0]).startOf("day");
  const to_date = moment(req.body.dates[1]).endOf("day");

  TriggeredLog.find({
    datetime_triggered: {
      $gte: from_date.toDate(),
      $lte: to_date.toDate()
    }
  })
    .sort({
      datetime_triggered: -1
    })
    .then(logs => {
      return res.json(logs);
    });
});

router.post("/schedule-trigger", (req, res) => {
  const { isValid, errors } = validateDateRange(req.body);

  if (!isValid) {
    return res.status(401).json(errors);
  }

  const from_date = moment(req.body.dates[0]).startOf("day");
  const to_date = moment(req.body.dates[1]).endOf("day");

  ScheduledLog.find({
    datetime_triggered: {
      $gte: from_date.toDate(),
      $lte: to_date.toDate()
    }
  })
    .sort({
      datetime_triggered: -1
    })
    .then(logs => {
      return res.json(logs);
    });
});

router.get("/date", (req, res) => {
  const date = moment_tz.tz(moment(), process.env.TIMEZONE);
  return res.json({ date });
});

module.exports = router;
