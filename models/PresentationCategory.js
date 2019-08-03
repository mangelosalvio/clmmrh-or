const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PresentationCategorySchema = new Schema({
  desc: String,
  logs: [
    {
      user: Object,
      datetime: Date,
      log: String
    }
  ]
});

module.exports = mongoose.model(
  "presentation_categories",
  PresentationCategorySchema
);
