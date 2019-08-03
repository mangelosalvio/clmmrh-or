const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AcademicYearSchema = new Schema({
  desc: String
});

module.exports = mongoose.model("academic_years", AcademicYearSchema);
