const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SurgeonSchema = new Schema({
  last_name: String,
  middle_name: String,
  first_name: String,
  sex: String,
  contact_number: String,
  department: String,
  logs: [
    {
      user: Object,
      datetime: Date,
      log: String
    }
  ]
});

SurgeonSchema.set("toObject", {
  virtuals: true
});
SurgeonSchema.set("toJSON", {
  virtuals: true
});

SurgeonSchema.virtual("full_name").get(function() {
  return `${this.last_name}, ${this.first_name} ${this.middle_name}`;
});

module.exports = mongoose.model("surgeons", SurgeonSchema);
