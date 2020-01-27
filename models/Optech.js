const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OptechSchema = new Schema({
  or_slip_id: mongoose.Schema.Types.ObjectId,
  index: Number,
  values: [String]
});

module.exports = mongoose.model("optech", OptechSchema);
