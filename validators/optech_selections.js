const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateInput(data) {
  let errors = {};

  if (isEmpty(data.service)) {
    errors.service = "Service is required";
  }

  if (isEmpty(data.description)) {
    errors.description = "Description is required";
  }

  if (isEmpty(data.tag)) {
    errors.tag = "Tag is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
