const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ScheduledLogSchema = new Schema({
  zones_selected: [String],
  sound: Object,
  datetime_triggered: Date,
  trigger: String,
  user: Object,
  log: String
});

module.exports = mongoose.model("triggered_logs", ScheduledLogSchema);
