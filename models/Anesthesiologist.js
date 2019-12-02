const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AnesSchema = new Schema({
  last_name: String,
  middle_name: String,
  first_name: String,
  sex: String,
  contact_number: String,
  assignments: [String],
  year_level: String,
  on_duty: {
    type: Boolean,
    default: false
  },
  logs: [
    {
      user: Object,
      datetime: Date,
      log: String
    }
  ],
  license_number: String
});

AnesSchema.set("toObject", {
  virtuals: true
});
AnesSchema.set("toJSON", {
  virtuals: true
});

AnesSchema.virtual("full_name").get(function() {
  return `${this.last_name}, ${this.first_name} ${this.middle_name}`;
});

module.exports = mongoose.model("anesthesiologists", AnesSchema);
