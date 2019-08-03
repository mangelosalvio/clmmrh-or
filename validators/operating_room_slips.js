const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateInput(data) {
  let errors = {};

  if (isEmpty(data.name)) {
    errors.name = "Patient name is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
