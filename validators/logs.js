const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateDateRange(data) {
  let errors = {};

  if (data.dates.length != 2) {
    errors.dates = "Must select at date range";
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
};
