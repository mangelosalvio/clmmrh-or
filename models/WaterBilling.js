const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WaterBillingSchema = new Schema({
  soa_no: Number,
  member: Object,
  billing_date: Date,
  period_covered: [Date],
  previous_balance: Number,
  adjustments: Number,
  late_charges: Number,
  grand_total: Number,
  payment: {
    desc: String,
    amount: Number,
    previous_balance: Number
  },
  meters: [
    {
      lot_number: String,
      meter_number: String,
      previous_reading: Number,
      current_reading: Number,
      usage: Number,
      amount: Number
    }
  ],
  logs: [
    {
      user: Object,
      datetime: Date,
      log: String
    }
  ],

  water_billing_flat_rate: Number,
  water_billing_rate: Number,
  late_charges_penalty: Number
});

module.exports = mongoose.model("water_billings", WaterBillingSchema);
