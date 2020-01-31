const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OptechSelectionSchema = new Schema({
  service: String,
  description: String,
  content: String
});

module.exports = mongoose.model("optech_selections", OptechSelectionSchema);
