const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateInput(data) {
  let errors = {};

  if (isEmpty(data.member)) {
    errors.member = "Member is required";
  }

  if (isEmpty(data.billing_date)) {
    errors.billing_date = "Billing date is required";
  }

  if (data.period_covered.length !== 2) {
    errors.period_covered = "Period covered is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
