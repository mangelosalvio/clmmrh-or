const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateInput(data) {
  let errors = {};

  /* if (isEmpty(data.lot)) {
    errors.lot = "Lot is required";
  }

  if (isEmpty(data.last_name)) {
    errors.last_name = "Last Name is required";
  }

  if (isEmpty(data.first_name)) {
    errors.first_name = "First Name is required";
  } */

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
