const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OperatingRoomSlipSchema = new Schema({
  name: String,
  age: String,
  address: String,
  sex: String,
  weight: String,
  hospital_number: String,
  ward: String,
  registration_date: Date,
  service: String,
  diagnosis: String,
  procedure: String,
  case: String,
  surgeon: Object,
  classification: String,
  date_time_ordered: Date,
  date_time_received: Date,
  date_time_of_surgery: Date,
  case_order: String,
  received_by: String,

  /**
   * PRE OPERATION
   */
  operation_type: String,
  operation_status: String,
  main_anes: Object,
  laterality: String,
  operating_room_number: String,

  /**
   * POST OPERATION
   */

  assistant_surgeon: Object,
  instrument_nurse: Object,
  sponge_nurse: Object,
  anes_method: String,
  anes_used: String,
  anes_quantity: Number,
  anes_route: String,
  anes_start: Date,
  operation_started: Date,
  operation_finished: Date,
  tentative_diagnosis: String,
  final_diagnosis: String,
  before_operation: String,
  during_operation: String,
  after_operation: String,
  complications_during_operation: String,
  complications_after_operation: String,
  operation_performed: String,
  position_in_bed: String,
  proctoclysis: String,
  hypodermoclysis: String,
  nutrition: String,
  stimulant: String,
  asa: String,

  logs: [
    {
      user: Object,
      datetime: Date,
      log: String
    }
  ]
});

module.exports = mongoose.model(
  "operating_room_slips",
  OperatingRoomSlipSchema
);
