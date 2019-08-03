const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateInput(data) {
  let errors = {};

  if (isEmpty(data.research_title)) {
    errors.research_title = "Research title is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
