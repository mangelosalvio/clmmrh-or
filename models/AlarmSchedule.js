const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AlarmScheduleSchema = new Schema({
  label: String,
  zones_selected: [String],
  sound: Object,
  days_of_week_selected: [Number],
  time: Date,
  dates: [Date],
  logs: [
    {
      user: Object,
      datetime: Date,
      log: String
    }
  ]
});

module.exports = mongoose.model("schedules", AlarmScheduleSchema);
