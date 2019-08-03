const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AssociationBillingLedger = new Schema({
  date: Date,
  member: Object,
  reference: String,
  kind: String,
  item: {
    type: Schema.Types.ObjectId,
    refPath: "kind"
  },
  transaction: Object,
  amount: Number,
  running: Number,
  old_running: Number
});

module.exports = mongoose.model(
  "association_billing_ledger",
  AssociationBillingLedger
);
