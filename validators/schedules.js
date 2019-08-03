const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateInput(data) {
  let errors = {};

  if (isEmpty(data.label)) {
    errors.name = "Label is required";
  }

  if (data.zones_selected.length <= 0) {
    errors.zones_selected = "Must select at least 1 zone";
  }

  if (isEmpty(data.sound)) {
    errors.sound = "Sound is required";
  }

  if (data.days_of_week_selected.length <= 0) {
    errors.days_of_week_selected = "Must select at least 1 day";
  }

  if (data.dates.length != 2) {
    errors.dates = "Must select at date range";
  }

  if (isEmpty(data.time)) {
    errors.time = "Time is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
