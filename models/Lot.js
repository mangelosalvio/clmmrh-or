const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LotSchema = new Schema({
  lot: String,
  last_name: String,
  first_name: String,
  middle_name: String,
  date_of_birth: Date,
  religion: String,

  spouse_last_name: String,
  spouse_first_name: String,
  spouse_middle_name: String,
  spouse_date_of_birth: Date,
  spouse_religion: String,

  home_address: String,
  home_telephone_number: String,
  office_address: String,
  office_telephone_number: String,

  beneficiary_name: String,
  beneficiary_relation: String,
  beneficiary_address: String,

  payment_type: String,
  initial_payment: Number,
  processing_fee: Number,
  equity: Number,
  gross_monthly_payment: Number,
  rebate: Number,
  net_monthly_payment: Number,

  sales_agent: String,
  sales_manager: String,

  sales_code: String,

  first_due_date: Date,
  last_due_date: Date,

  lot_name: String,
  lot_area: String,
  lot_address: String,
  lot_status: String,

  logs: [
    {
      user: Object,
      datetime: Date,
      log: String
    }
  ]
});

module.exports = mongoose.model("lots", LotSchema);
