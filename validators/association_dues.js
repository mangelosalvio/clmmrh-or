const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateInput(data) {
  let errors = {};

  if (isEmpty(data.billing_date)) {
    errors.billing_date = "Billing date is required";
  }

  if (isEmpty(data.due_date)) {
    errors.due_date = "Due date is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
