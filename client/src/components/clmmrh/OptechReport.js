import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import axios from "axios";
import { Layout, message, Col, Row, Input } from "antd";
import { debounce } from "lodash";

import moment from "moment";
import OptechHeader from "./OptechHeader";

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
  optech_others: [],

  errors: {}
};

class OptechReport extends Component {
  state = {
    title: "Operating Room Form",
    url: "/api/operating-room-slips/",
    search_keyword: "",
    values: [],
    rvs: [],
    optech_content: "<div></div>"
  };

  constructor(props) {
    super(props);
    this.updateRecord = debounce(this.updateRecord, 500);
  }

  componentDidMount() {
    this.getRecord();
  }

  getRecord = () => {
    let promise = null;
    const id = this.props.match.params.id;
    const surg_memo_id = this.props.match.params.surg_memo_id;

    if (surg_memo_id) {
      /**
       * from additional surgical memo
       */
      promise = axios.get(
        `${this.state.url}${id}/surgical-memorandum/${surg_memo_id}`
      );
    } else {
      /**
       * from current post operation
       */
      promise = axios.get(this.state.url + id);
    }

    promise
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

  onChange = (e, i) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;

    const values = [...this.state.values];
    values[i] = value;

    this.setState({ values }, () => {
      this.updateRecord();
    });
  };

  updateRecord = () => {
    const index = this.props.match.params.index;
    const id = this.props.match.params.id;

    const form_data = {
      id,
      index,
      values: this.state.values
    };

    axios
      .post(`${this.state.url}${this.state._id}/operative-technique`, form_data)
      .then(response => {})
      .catch(err => {
        message.error("There was an error updating your transaction");
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

  renderHTML = content => (
    <div dangerouslySetInnerHTML={{ __html: content }}></div>
  );

  render() {
    let optech_content;
    const optech_index = this.props.match.params.optech_index;
    if (
      optech_index &&
      this.state.optech_others &&
      this.state.optech_others[optech_index]
    ) {
      optech_content = this.state.optech_others[optech_index].optech_content;
    } else {
      optech_content = this.state.optech_content;
    }

    return (
      <Content className="content report operative-technique-container">
        <OptechHeader id={this.props.match.params.id} />

        {this.renderHTML(optech_content)}

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
        </Row>
        <Row>
          <Col offset={2} span={8} className="has-text-centered">
            Surgeon
          </Col>
        </Row>

        <div className="print-iso-footer">
          Operative Technique <br />
          CLMMRH-MRS.F.044 <br />
          Issued: 6/9/15
          <br />
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

export default connect(mapToState)(withRouter(OptechReport));
