const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MemberSchema = new Schema({
  name: String,
  address: String,
  home_contact_number: String,
  mobile_phone_number: String,
  fax: String,
  email: String,
  occupation: String,
  business_phone: String,
  dob: Date,
  civil_status: String,
  birth_place: String,
  citizenship: String,
  remarks: String,
  lots: [
    {
      lot_status: String,
      lot_number: String,
      lot_area: Number,
      floor_area: Number,
      expected_monthly_dues: Number,
      active_status: String,
      date_acquired: Date,
      occupancy_date: Date,
      occupancy_permit: String
    }
  ],
  meters: [
    {
      lot_number: String,
      meter_number: String
    }
  ],
  logs: [
    {
      user: Object,
      datetime: Date,
      log: String
    }
  ]
});

module.exports = mongoose.model("members", MemberSchema);
