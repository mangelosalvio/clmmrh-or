const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AttachmentCategorySchema = new Schema({
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
  "attachment_categories",
  AttachmentCategorySchema
);
