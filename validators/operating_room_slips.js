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

  if (
    data.operation_status &&
    data.operation_status === constants.ON_GOING &&
    isEmpty(data.operating_room_number)
  ) {
    errors.operating_room_number = "OR Number is required";
  }

  if (
    data.operation_status &&
    data.operation_status === constants.ON_RECOVERY &&
    isEmpty(data.bed_number)
  ) {
    errors.bed_number = "Bed Number is required";
  }

  if (data.form === constants.TIME_LOGS_MODULE) {
    if (isEmpty(data.time_ward_informed)) {
      errors.time_ward_informed = "Time Ward Informed required";
    }

    if (isEmpty(data.arrival_time)) {
      errors.arrival_time = "Arrival Time required";
    }
    if (isEmpty(data.room_is_ready)) {
      errors.room_is_ready = "Room is ready required";
    }
    if (isEmpty(data.equip_ready)) {
      errors.equip_ready = "Equip/Inst ready required";
    }
    if (isEmpty(data.patient_placed_in_or_table)) {
      errors.patient_placed_in_or_table = "Patient placed in OR Table required";
    }
    if (isEmpty(data.time_anes_arrived)) {
      errors.time_anes_arrived = "Time Anes arrived required";
    }
    if (isEmpty(data.time_surgeon_arrived)) {
      errors.time_surgeon_arrived = "Time Surgeon required";
    }

    if (isEmpty(data.induction_time)) {
      errors.induction_time = "Induction time required";
    }

    if (isEmpty(data.induction_completed)) {
      errors.induction_completed = "Induction completed required";
    }

    if (isEmpty(data.time_or_started)) {
      errors.time_or_started = "Time OR started required";
    }

    if (isEmpty(data.or_ended)) {
      errors.or_ended = "OR ended required";
    }

    if (isEmpty(data.trans_out_from_or)) {
      errors.trans_out_from_or = "Trans out from OR required";
    }
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
