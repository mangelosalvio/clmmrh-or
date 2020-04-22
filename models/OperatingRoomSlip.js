const mongoose = require("mongoose");
const mongoose_paginate = require("mongoose-paginate");
const Schema = mongoose.Schema;

const OperatingRoomSlipSchema = new Schema({
  name: String,
  age: String,
  address: String,
  sex: String,
  date_of_birth: Date,
  weight: String,
  weight_unit: String,
  hospital_number: String,
  ward: String,
  registration_date: Date,
  service: String,
  diagnosis: String,
  procedure: String,
  or_elec_notes: String,
  case: String,
  surgeon: Object,
  other_surgeon: Object,
  other_surgeons: [Object],
  classification: String,
  date_time_ordered: Date,
  date_time_received: Date,
  surgery_is_date: Boolean,
  date_time_of_surgery: Date,
  stat_time_limit: Number,
  case_order: String,
  received_by: Object,

  /**
   * PRE OPERATION
   */
  operation_type: String,
  operation_status: String,
  main_anes: Object,
  other_anes: [Object],
  laterality: String,
  operating_room_number: String,
  bed_number: String,
  special_equipment_needed: [String],
  other_special_equipment_needed: String,
  infectious_control_measures: [String],
  other_infectious_control_measures: String,

  /**
   * POST OPERATION
   */

  assistant_surgeon: Object,
  instrument_nurse: Object,
  other_inst_nurses: [Object],
  sponge_nurse: Object,
  other_sponge_nurses: [Object],
  anes_methods: [
    {
      method: String,
    },
  ],
  anes_used: String,
  anes_quantity: String,
  anes_quantity_unit: String,
  anes_route: String,

  anesthetics: [
    {
      anes_used: String,
      anes_quantity: String,
      anes_quantity_unit: String,
      anes_route: String,
    },
  ],

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

  time_ward_informed: Date,
  arrival_time: Date,
  room_is_ready: Date,
  equip_ready: Date,
  patient_placed_in_or_table: Date,
  time_anes_arrived: Date,
  time_surgeon_arrived: Date,
  induction_time: Date,
  induction_completed: Date,
  time_or_started: Date,
  or_ended: Date,
  trans_out_from_or: Date,
  surgical_safety_checklist: Boolean,
  remarks: String,

  rvs: [
    {
      rvs_code: String,
      rvs_description: String,
      rvs_laterality: String,
    },
  ],

  surgical_memos: [
    {
      service: String,
      surgeon: Object,
      assistant_surgeon: Object,
      other_surgeons: [Object],
      instrument_nurse: Object,
      other_inst_nurses: [Object],
      sponge_nurse: Object,
      other_sponge_nurses: [Object],
      main_anes: Object,
      other_anes: [Object],
      anes_methods: [
        {
          method: String,
        },
      ],
      anes_used: String,
      anes_quantity: String,
      anes_quantity_unit: String,
      anes_route: String,

      anesthetics: [
        {
          anes_used: String,
          anes_quantity: String,
          anes_quantity_unit: String,
          anes_route: String,
        },
      ],

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
      rvs: [
        {
          rvs_code: String,
          rvs_description: String,
          rvs_laterality: String,
        },
      ],
      optech: Object,
      optech_content: String,
    },
  ],

  logs: [
    {
      user: Object,
      datetime: Date,
      log: String,
    },
  ],

  ob_operative_technique: {
    anes: String,
    cervix: String,
    uterus: String,
    adnexae: String,
    discharges: String,
    ligation_equipment: String,
  },
  optech: Object,
  optech_content: String,
  optech_others: [
    {
      optech: Object,
      optech_content: String,
    },
  ],
});

OperatingRoomSlipSchema.plugin(mongoose_paginate);
module.exports = mongoose.model(
  "operating_room_slips",
  OperatingRoomSlipSchema
);
