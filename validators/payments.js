const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateInput(data) {
  let errors = {};

  if (isEmpty(data.member)) {
    errors.member = "Member is required";
  }

  if (isEmpty(data.date)) {
    errors.date = "Date is required";
  }

  if (isEmpty(data.transaction)) {
    errors.transaction = "Transaction is required";
  }

  if (isEmpty(data.payment_type)) {
    errors.payment_type = "Payment Type for is required";
  }

  if (isEmpty(data.amount)) {
    errors.amount = "Amount is required";
  }

  if (isEmpty(data.or_number)) {
    errors.or_number = "OR# is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
