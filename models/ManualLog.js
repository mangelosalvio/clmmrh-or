const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ManualLogSchema = new Schema({
  zones_selected: [String],
  trigger: String,
  user: Object,
  log: String,
  datetime_triggered: Date
});

module.exports = mongoose.model("manual_logs", ManualLogSchema);
