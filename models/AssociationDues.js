const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AssociationDuesSchema = new Schema({
  soa_no: Number,
  member: Object,
  billing_date: Date,
  due_date: Date,
  previous_balance: Number,
  adjustments: Number,
  late_charges: Number,
  grand_total: Number,
  payment: {
    desc: String,
    amount: Number,
    previous_balance: Number
  },
  lots: [
    {
      lot_status: String,
      lot_number: String,
      lot_area: String,
      amount: Number,
      unit_price: String
    }
  ],
  logs: [
    {
      user: Object,
      datetime: Date,
      log: String
    }
  ],

  association_dues_lot_owner: Number,
  association_dues_home_owner: Number,
  late_charges_penalty: Number
});

module.exports = mongoose.model("association_dues", AssociationDuesSchema);
