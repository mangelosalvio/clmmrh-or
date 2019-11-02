const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateInput(data) {
  let errors = {};

  if (isEmpty(data.period[0]) && isEmpty(data.period[1])) {
    errors.period = "Period is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
