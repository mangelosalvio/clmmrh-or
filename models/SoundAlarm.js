const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SoundAlarmSchema = new Schema({
  label: String,
  location: Object,
  logs: [
    {
      user: Object,
      datetime: Date,
      log: String
    }
  ]
});

module.exports = mongoose.model("sounds", SoundAlarmSchema);
