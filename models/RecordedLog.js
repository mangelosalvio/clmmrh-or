const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RecordedLogSchema = new Schema({
  zones_selected: [String],
  path: String,
  user: Object,
  log: String,
  datetime_triggered: Date
});

module.exports = mongoose.model("recorded_logs", RecordedLogSchema);
