const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateInput(data) {
  let errors = {};

  if (isEmpty(data.body.label)) {
    errors.label = "Label is required";
  }

  if (isEmpty(data.file)) {
    errors.location = "Sound file is required";
  }

  if (data.file && data.file.mimetype !== "audio/mp3") {
    errors.location = "mp3 file is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
