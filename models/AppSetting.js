const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AppSettingSchema = new Schema({
  key: String,
  value: String
});

module.exports = mongoose.model("settings", AppSettingSchema);
