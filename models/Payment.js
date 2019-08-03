const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
  date: Date,
  si_number: Number,
  member: Object,
  transaction: String,
  payment_type: String,
  amount: Number,
  check_date: Date,
  check_number: String,
  account_name: String,
  or_number: String,
  received_from: String,
  logs: [
    {
      user: Object,
      datetime: Date,
      log: String
    }
  ]
});

module.exports = mongoose.model("payments", PaymentSchema);
