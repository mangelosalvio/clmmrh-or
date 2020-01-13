const Validator = require("validator");
const isEmpty = require("./is-empty");
const constants = require("./../config/constants");

module.exports = function validateInput(data) {
  let errors = {};

  if (data.form === constants.RECEIVING_MODULE) {
    /* if (isEmpty(data.name)) {
      errors.name = "Patient name is required";
    }

    if (isEmpty(data.date_of_birth)) {
      errors.date_of_birth = "Date of Birth is required";
    }

    if (isEmpty(data.age)) {
      errors.age = "Age is required";
    }

    if (isEmpty(data.sex)) {
      errors.sex = "Sex is required";
    }

    if (isEmpty(data.weight)) {
      errors.weight = "Weight is required";
    }

    if (isEmpty(data.weight_unit)) {
      errors.weight_unit = "Weight unit is required";
    }

    if (isEmpty(data.address)) {
      errors.address = "Address is required";
    }

    if (isEmpty(data.registration_date)) {
      errors.registration_date = "Registration Date is required";
    }

    if (isEmpty(data.hospital_number)) {
      errors.hospital_number = "Hospital # is required";
    }

    if (isEmpty(data.ward)) {
      errors.ward = "Ward is required";
    } */

    if (isEmpty(data.service)) {
      errors.service = "Service is required";
    }

    if (isEmpty(data.diagnosis)) {
      errors.diagnosis = "Diagnosis is required";
    }

    if (isEmpty(data.procedure)) {
      errors.procedure = "Procedure is required";
    }

    if (isEmpty(data.case)) {
      errors.case = "Case is required";
    }

    /* if (isEmpty(data.classification)) {
      errors.classification = "Classification is required";
    }

    if (isEmpty(data.surgeon)) {
      errors.surgeon = "Surgeon is required";
    }

    if (isEmpty(data.date_time_ordered)) {
      errors.date_time_ordered = "Date/Time Ordered is required";
    }

    if (isEmpty(data.date_time_received)) {
      errors.date_time_received = "Date/Time Received is required";
    }

    if (isEmpty(data.date_time_of_surgery)) {
      errors.date_time_of_surgery = "Date of Surgery is required";
    }

    if (isEmpty(data.case_order)) {
      errors.case_order = "Case Order is required";
    }

    if (isEmpty(data.received_by)) {
      errors.received_by = "Received by is required";
    }
  } else if (data.form === constants.PRE_OPERATION_MODULE) {
    if (isEmpty(data.diagnosis)) {
      errors.diagnosis = "Diagnosis is required";
    }

    if (isEmpty(data.procedure)) {
      errors.procedure = "Procedure is required";
    }

    if (isEmpty(data.main_anes)) {
      errors.main_anes = "Main Anes is required";
    }

    if (isEmpty(data.operation_type)) {
      errors.operation_type = "Operation Type is required";
    }

    if (isEmpty(data.operating_room_number)) {
      errors.operating_room_number = "OR Number is required";
    } */
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
