const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ResearchCategorySchema = new Schema({
  desc: String,
  logs: [
    {
      user: Object,
      datetime: Date,
      log: String
    }
  ]
});

module.exports = mongoose.model("research_categories", ResearchCategorySchema);
