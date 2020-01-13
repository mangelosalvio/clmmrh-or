import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import axios from "axios";
import { Layout, message, Col, Row } from "antd";
import classnames from "classnames";

import moment from "moment";
import isEmpty from "../../validation/is-empty";
import { NOT_APPLICABLE } from "../../utils/constants";

const { Content } = Layout;

const collection_name = "slips";

const form_data = {
  [collection_name]: [],
  _id: "",

  name: "",
  age: "",
  address: "",
  sex: "",
  weight: "",
  hospital_number: "",
  ward: "",
  date_of_birth: null,
  registration_date: null,
  service: "",
  diagnosis: "",
  procedure: "",
  case: "",
  surgeon: "",
  classification: "",
  date_time_ordered: null,
  date_time_received: null,
  surgery_is_date: false,
  date_time_of_surgery: null,
  case_order: "",
  received_by: "",

  operation_type: "",
  operation_status: "",
  main_anes: "",
  other_anes: [],
  laterality: "",
  operating_room_number: "",

  assistant_surgeon: "",
  other_surgeons: [],
  instrument_nurse: "",
  other_inst_nurses: [],
  other_sponge_nurses: [],
  sponge_nurse: "",
  anes_method: "",
  anes_methods: [],

  anesthetics: [],
  anes_used: "",
  anes_quantity: "",
  anes_route: "",

  anes_start: null,
  operation_started: null,
  operation_finished: null,
  tentative_diagnosis: "",
  final_diagnosis: "",
  before_operation: "",
  during_operation: "",
  after_operation: "",
  complications_during_operation: "",
  complications_after_operation: "",
  operation_performed: "",
  position_in_bed: "",
  proctoclysis: "",
  hypodermoclysis: "",
  nutrition: "",
  stimulant: "",
  asa: "",

  time_ward_informed: null,
  arrival_time: null,
  room_is_ready: null,
  equip_ready: null,
  patient_placed_in_or_table: null,
  time_anes_arrived: null,
  time_surgeon_arrived: null,
  induction_time: null,
  induction_completed: null,
  time_or_started: null,
  or_ended: null,
  trans_out_from_or: null,
  surgical_safety_checklist: null,
  remarks: "",

  rvs_code: "",
  rvs_description: "",

  rvs: [],

  errors: {}
};

class SurgicalMemorandumReport extends Component {
  state = {
    title: "Operating Room Form",
    url: "/api/operating-room-slips/",
    search_keyword: "",
    ...form_data,
    options: {
      surgeons: [],
      anesthesiologists: [],
      nurses: [],
      rvs: []
    }
  };

  componentDidMount() {
    this.getRecord();
  }

  getRecord = () => {
    const id = this.props.match.params.id;

    axios
      .get(this.state.url + id)
      .then(response => {
        const record = response.data;
        const {
          date_of_birth,
          registration_date,
          date_time_ordered,
          date_time_of_surgery,
          date_time_received,
          anes_start,
          operation_started,
          operation_finished,
          time_ward_informed,
          arrival_time,
          room_is_ready,
          equip_ready,
          patient_placed_in_or_table,
          time_anes_arrived,
          time_surgeon_arrived,
          induction_time,
          induction_completed,
          time_or_started,
          or_ended,
          trans_out_from_or,
          surgical_safety_checklist
        } = response.data;
        this.setState(
          prevState => {
            return {
              ...form_data,
              [collection_name]: [],
              ...record,
              date_of_birth: date_of_birth ? moment(date_of_birth) : null,
              registration_date: registration_date
                ? moment(registration_date)
                : null,
              date_time_ordered: date_time_ordered
                ? moment(date_time_ordered)
                : null,
              date_time_received: date_time_received
                ? moment(date_time_received)
                : null,
              date_time_of_surgery: date_time_of_surgery
                ? moment(date_time_of_surgery)
                : null,
              anes_start: anes_start ? moment(anes_start) : null,
              operation_started: operation_started
                ? moment(operation_started)
                : null,
              operation_finished: operation_finished
                ? moment(operation_finished)
                : null,

              time_ward_informed: time_ward_informed
                ? moment(time_ward_informed)
                : null,
              arrival_time: arrival_time ? moment(arrival_time) : null,
              room_is_ready: room_is_ready ? moment(room_is_ready) : null,
              equip_ready: equip_ready ? moment(equip_ready) : null,
              patient_placed_in_or_table: patient_placed_in_or_table
                ? moment(patient_placed_in_or_table)
                : null,
              time_anes_arrived: time_anes_arrived
                ? moment(time_anes_arrived)
                : null,
              time_surgeon_arrived: time_surgeon_arrived
                ? moment(time_surgeon_arrived)
                : null,
              induction_time: induction_time ? moment(induction_time) : null,
              induction_completed: induction_completed
                ? moment(induction_completed)
                : null,
              time_or_started: time_or_started ? moment(time_or_started) : null,
              or_ended: or_ended ? moment(or_ended) : null,
              trans_out_from_or: trans_out_from_or
                ? moment(trans_out_from_or)
                : null,
              surgical_safety_checklist: surgical_safety_checklist
                ? moment(surgical_safety_checklist)
                : null,
              errors: {}
            };
          },
          () => {
            //window.print();
          }
        );
      })
      .catch(err => {
        message.error("An error has occurred");
        console.log(err);
      });
  };

  onSurgeonSearch = value => {
    axios
      .get(`/api/surgeons/?s=${value}`)
      .then(response =>
        this.setState({
          options: {
            ...this.state.options,
            surgeons: response.data
          }
        })
      )
      .catch(err => console.log(err));
  };

  onAnesSearch = value => {
    axios
      .get(`/api/anesthesiologists/?s=${value}`)
      .then(response =>
        this.setState({
          options: {
            ...this.state.options,
            anesthesiologists: response.data
          }
        })
      )
      .catch(err => console.log(err));
  };

  render() {
    let inst_nurses = [];

    if (this.state.instrument_nurse && this.state.instrument_nurse.full_name) {
      inst_nurses.push(this.state.instrument_nurse.full_name);
    }

    this.state.other_inst_nurses.forEach(item => {
      inst_nurses.push(item.full_name);
    });

    let sponge_nurses = [];

    if (this.state.sponge_nurse && this.state.sponge_nurse.full_name) {
      sponge_nurses.push(this.state.sponge_nurse.full_name);
    }

    this.state.other_sponge_nurses.forEach(item => {
      sponge_nurses.push(item.full_name);
    });

    let other_surgeons = [];

    if (
      this.state.assistant_surgeon &&
      this.state.assistant_surgeon.full_name
    ) {
      other_surgeons.push(this.state.assistant_surgeon.full_name);
    }

    this.state.other_surgeons.forEach(item => {
      other_surgeons.push(item.full_name);
    });

    let other_anes = [];

    if (this.state.main_anes && this.state.main_anes.full_name) {
      other_anes.push(this.state.main_anes.full_name);
    }

    this.state.other_anes.forEach(item => {
      other_anes.push(item.full_name);
    });

    return (
      <Content className="content report">
        <div className="has-text-centered has-text-weight-bold surgical-memo-heading">
          CORAZON LOCSIN MONTELIBANO MEMORIAL REGIONAL HOSPITAL
        </div>
        <div className="has-text-centered surgical-memo-heading">
          Lacson - Burgos Streets, Bacolod City
        </div>
        <div
          className="has-text-centered has-text-weight-bold surgical-memo-heading"
          style={{ marginTop: "32px" }}
        >
          SURGICAL MEMORANDUM
        </div>
        <Row className="m-t-16">
          <Col span={3}>Name of Patient</Col>
          <Col span={7} className="b-b-1">
            {this.state.name}
          </Col>
          <Col span={3}>ASA</Col>
          <Col span={3} className="b-b-1">
            {this.state.asa}
          </Col>
          <Col span={3}>Hospital No.</Col>
          <Col span={5} className="b-b-1">
            {this.state.hospital_number}
          </Col>
        </Row>
        <Row>
          <Col span={3}>Address</Col>
          <Col span={13} className="b-b-1">
            {this.state.address}
          </Col>
          <Col span={3}>Ward/Room</Col>
          <Col span={5} className="b-b-1">
            {this.state.ward}
          </Col>
        </Row>
        <Row>
          <Col span={3}>Age</Col>
          <Col span={5} className="b-b-1">
            {this.state.age}
          </Col>
          <Col span={3}>Sex</Col>
          <Col span={5} className="b-b-1">
            {this.state.sex}
          </Col>
          <Col span={3}>Admission Date</Col>
          <Col span={5} className="b-b-1">
            {this.state.registration_date &&
              this.state.registration_date.format("MM-DD-YY")}
          </Col>
        </Row>
        <Row>
          <Col span={3}>Date of OR</Col>
          <Col span={3} className="b-b-1">
            {this.state.date_time_of_surgery &&
              this.state.date_time_of_surgery.format("MM-DD-YY")}
          </Col>
          <Col span={3}>Surgeon</Col>
          <Col span={6} className="b-b-1">
            {this.state.surgeon && this.state.surgeon.full_name}
          </Col>
          <Col span={3}>Assistant</Col>
          <Col span={6} className="b-b-1">
            {" "}
            &nbsp;
            {other_surgeons.join("/")}
          </Col>
        </Row>
        <Row>
          <Col span={3}>Instrument Nurse</Col>
          <Col span={9} className="b-b-1">
            {" "}
            &nbsp;
            {inst_nurses.join("/")}
          </Col>
          <Col span={3}>Sponge Nurse</Col>
          <Col span={9} className="b-b-1">
            {" "}
            &nbsp;
            {sponge_nurses.join("/")}
          </Col>
        </Row>
        <div className="m-t-1">
          <div className="has-text-weight-bold surgical-memo-heading">
            TENTATIVE DIAGNOSIS
          </div>
          <div className="p-8 " style={{ minHeight: "80px" }}>
            {this.state.tentative_diagnosis}
          </div>
        </div>
        <div className="m-t-1">
          <span className="has-text-weight-bold surgical-memo-heading">
            FINAL DIAGNOSIS
          </span>
          <p className="p-8 " style={{ minHeight: "80px" }}>
            {this.state.final_diagnosis}
          </p>
        </div>
        <Row className="m-t-16">
          <Col span={3}>Anesthesiologist</Col>
          <Col span={7} className="b-b-1">
            &nbsp;{other_anes.join("/")}
          </Col>
          <Col span={5}>Anesthetic Method</Col>
          <Col span={9} className="b-b-1">
            {this.state.anes_methods.map(o => o.method).join("/") || `\xa0`}
          </Col>
        </Row>
        {this.state.anesthetics.map((o, index) => {
          return (
            <Row>
              <Col
                className={classnames({
                  "has-text-right": index > 0,
                  "p-r-1": index > 0
                })}
                span={3}
              >
                {index === 0 ? "Anesthetic Used" : "Others"}
              </Col>
              <Col span={12} className="b-b-1">
                {o.anes_used || `\xa0`}
              </Col>
              <Col span={2}>Quantity</Col>
              <Col span={3} className="b-b-1">
                &nbsp;
                {o.anes_quantity} {o.anes_quantity_unit}
              </Col>
              <Col span={2}>Route</Col>
              <Col span={2} className="b-b-1">
                {o.anes_route || `\xa0`}
              </Col>
            </Row>
          );
        })}

        <Row>
          <Col span={4}>Anesthesia Began</Col>
          <Col span={4} className="b-b-1">
            &nbsp;
            {this.state.anes_start &&
              moment(this.state.anes_start).format("hh:mm A")}
          </Col>
          <Col span={4}>Operation Started</Col>
          <Col span={4} className="b-b-1">
            &nbsp;
            {this.state.operation_started &&
              moment(this.state.operation_started).format("hh:mm A")}
          </Col>
          <Col span={4}>Operation Finished</Col>
          <Col span={4} className="b-b-1">
            &nbsp;
            {this.state.operation_finished &&
              moment(this.state.operation_finished).format("hh:mm A")}
          </Col>
        </Row>
        <div className="m-t-16 has-text-weight-bold surgical-memo-heading">
          TREATMENT IN THE OPERATING ROOM
        </div>
        <Row>
          <Col span={5} offset={2}>
            Before Operation
          </Col>
          <Col
            span={13}
            className={classnames("b-b-1", {
              "has-text-centered": isEmpty(this.state.after_operation)
            })}
          >
            &nbsp;{this.state.before_operation || "See anesthesia record"}
          </Col>
        </Row>
        <Row>
          <Col span={5} offset={2}>
            During Operation
          </Col>
          <Col
            span={13}
            className={classnames("b-b-1", {
              "has-text-centered": isEmpty(this.state.after_operation)
            })}
          >
            &nbsp;{this.state.during_operation || "See anesthesia record"}
          </Col>
        </Row>
        <Row>
          <Col span={5} offset={2}>
            After operation
          </Col>
          <Col
            span={13}
            className={classnames("b-b-1", {
              "has-text-centered": isEmpty(this.state.after_operation)
            })}
          >
            &nbsp;{this.state.after_operation || "See anesthesia record"}
          </Col>
        </Row>
        <Row>
          <Col span={6} offset={2}>
            Complications during operation
          </Col>
          <Col
            span={12}
            className={classnames("b-b-1", {
              "has-text-centered": isEmpty(this.state.after_operation)
            })}
          >
            &nbsp;
            {this.state.complications_during_operation ||
              "See anesthesia record"}
          </Col>
        </Row>
        <Row>
          <Col span={6} offset={2}>
            Complications after operation
          </Col>
          <Col
            span={12}
            className={classnames("b-b-1", {
              "has-text-centered": isEmpty(this.state.after_operation)
            })}
          >
            &nbsp;
            {this.state.complications_after_operation ||
              "See anesthesia record"}
          </Col>
        </Row>
        <div className="m-t-1">
          <span className="has-text-weight-bold surgical-memo-heading">
            OPERATION PERFORMED
          </span>
          {this.state.rvs.map(r => (
            <div>
              {r.rvs_description}{" "}
              {!isEmpty(r.rvs_laterality) &&
                r.rvs_laterality !== NOT_APPLICABLE &&
                `- ${r.rvs_laterality}`}{" "}
              - {r.rvs_code}
            </div>
          ))}
        </div>
        <div className="m-t-16 has-text-weight-bold surgical-memo-heading">
          IMMEDIATE POST OPERATIVE TREATMENT
        </div>
        <Row>
          <Col span={4} offset={2}>
            Position in bed
          </Col>
          <Col
            span={14}
            className={classnames("b-b-1", {
              "has-text-centered": isEmpty(this.state.hypodermoclysis)
            })}
          >
            &nbsp;{this.state.position_in_bed || "See post-operative records"}
          </Col>
        </Row>
        <Row>
          <Col span={4} offset={2}>
            Proctoclysis
          </Col>
          <Col
            span={14}
            className={classnames("b-b-1", {
              "has-text-centered": isEmpty(this.state.hypodermoclysis)
            })}
          >
            &nbsp;{this.state.proctoclysis || "See post-operative records"}
          </Col>
        </Row>
        <Row>
          <Col span={4} offset={2}>
            Hypodermoclysis
          </Col>
          <Col
            span={14}
            className={classnames("b-b-1", {
              "has-text-centered": isEmpty(this.state.hypodermoclysis)
            })}
          >
            &nbsp;{this.state.hypodermoclysis || "See post-operative records"}
          </Col>
        </Row>
        <Row>
          <Col span={4} offset={2}>
            Nutrition
          </Col>
          <Col
            span={14}
            className={classnames("b-b-1", {
              "has-text-centered": isEmpty(this.state.hypodermoclysis)
            })}
          >
            &nbsp;{this.state.nutrition || "See post-operative records"}
          </Col>
        </Row>
        <Row>
          <Col span={7} offset={2}>
            Stimulant and other medications
          </Col>
          <Col
            span={11}
            className={classnames("b-b-1", {
              "has-text-centered": isEmpty(this.state.hypodermoclysis)
            })}
          >
            &nbsp;{this.state.stimulant || "See post-operative records"}
          </Col>
        </Row>

        <Row style={{ marginTop: "64px" }}>
          <Col
            offset={2}
            span={8}
            className="b-b-1 has-text-centered"
            style={{ height: "52px" }}
          >
            {this.state.surgeon && this.state.surgeon.full_name}
            {this.state.surgeon &&
              this.state.surgeon.license_number && [
                <br />,
                `Lic. No.${this.state.surgeon.license_number}`
              ]}
            {this.state.surgeon &&
              this.state.surgeon.department && [
                <br />,
                this.state.surgeon.department
              ]}
          </Col>
          <Col span={1} className="is-flex" style={{ height: "48px" }}>
            <span
              style={{
                alignSelf: "flex-end"
              }}
            >
              M.D.
            </span>
          </Col>
          <Col
            offset={2}
            span={8}
            className="b-b-1 has-text-centered"
            style={{ height: "52px" }}
          >
            <br />
            {this.state.main_anes && this.state.main_anes.full_name}
            {this.state.main_anes &&
              this.state.main_anes.license_number && [
                <br />,
                `Lic. No.${this.state.main_anes.license_number}`
              ]}
          </Col>
          <Col span={1} className="is-flex" style={{ height: "48px" }}>
            <span
              style={{
                alignSelf: "flex-end"
              }}
            >
              M.D.
            </span>
          </Col>
        </Row>
        <Row>
          <Col offset={2} span={8} className="has-text-centered">
            Surgeon
          </Col>

          <Col offset={3} span={8} className="has-text-centered">
            Anesthesiologist
          </Col>
        </Row>

        <div className="print-iso-footer">
          Surgical Memorandum <br />
          CLMMRH-MRS.F.043 <br />
          Issued: 2/5/14 <br />
          Issue No. 001
        </div>
      </Content>
    );
  }
}

const mapToState = state => {
  return {
    auth: state.auth,
    map: state.map
  };
};

export default connect(mapToState)(withRouter(SurgicalMemorandumReport));
