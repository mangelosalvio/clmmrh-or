const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ScheduledLogSchema = new Schema({
  label: String,
  zones_selected: [String],
  sound: Object,
  days_of_week_selected: [Number],
  time: Date,
  dates: [Date],
  log: String,
  datetime_triggered: Date
});

module.exports = mongoose.model("scheduled_logs", ScheduledLogSchema);
