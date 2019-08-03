const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FacultySchema = new Schema({
  name: String,
  logs: [
    {
      user: Object,
      datetime: Date,
      log: String
    }
  ]
});

module.exports = mongoose.model("faculties", FacultySchema);
