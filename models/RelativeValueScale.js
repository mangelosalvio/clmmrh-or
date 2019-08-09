const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RvsSchema = new Schema({
  code: String,
  description: String,
  logs: [
    {
      user: Object,
      datetime: Date,
      log: String
    }
  ]
});

module.exports = mongoose.model("relative_value_scales", RvsSchema);
