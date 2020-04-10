const mongoose = require("mongoose");
const mongoose_paginate = require("mongoose-paginate");
const Schema = mongoose.Schema;

const NurseSchema = new Schema({
  last_name: String,
  middle_name: String,
  first_name: String,
  sex: String,
  contact_number: String,
  assignment: String,
  job_status: String,
  on_duty: {
    type: Boolean,
    default: false,
  },
  logs: [
    {
      user: Object,
      datetime: Date,
      log: String,
    },
  ],
});

NurseSchema.set("toObject", {
  virtuals: true,
});
NurseSchema.set("toJSON", {
  virtuals: true,
});

NurseSchema.virtual("full_name").get(function () {
  return `${this.last_name}, ${this.first_name} ${this.middle_name}`;
});

NurseSchema.plugin(mongoose_paginate);

module.exports = mongoose.model("nurses", NurseSchema);
