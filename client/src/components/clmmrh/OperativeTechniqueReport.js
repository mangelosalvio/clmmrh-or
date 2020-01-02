import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import axios from "axios";
import { Layout, message, Col, Row, Input } from "antd";
import { debounce } from "lodash";

import moment from "moment";

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
  laterality: "",
  operating_room_number: "",

  assistant_surgeon: "",
  instrument_nurse: "",
  sponge_nurse: "",
  anes_method: "",
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

  errors: {},

  ob_operative_technique: {
    anes: "",
    cervix: "",
    uterus: "",
    adnexae: "",
    discharges: "",
    ligation_equipment: ""
  }
};

class OperativeTechinqueReport extends Component {
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

  constructor(props) {
    super(props);
    this.updateRecord = debounce(this.updateRecord, 500);
  }

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

  onChange = e => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;

    this.setState(
      {
        ob_operative_technique: {
          ...this.state.ob_operative_technique,
          [e.target.name]: value
        }
      },
      this.updateRecord
    );
  };

  updateRecord = () => {
    const { ob_operative_technique } = this.state;
    const form_data = {
      ob_operative_technique
    };

    axios
      .post(
        `${this.state.url}${this.state._id}/operative-technique/ob`,
        form_data
      )
      .then(response => {
        console.log("Updated");
      })
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

  render() {
    return (
      <Content className="content report operative-technique-container">
        <div className="has-text-centered has-text-weight-bold surgical-memo-heading">
          OPERATIVE TECHNIQUE
        </div>
        <Row style={{ marginTop: "3rem" }}>
          <Col span={3}>Name of Patient</Col>
          <Col span={13} className="b-b-1">
            {this.state.name || ""} &nbsp;
          </Col>
          <Col span={3}>Hospital No.</Col>
          <Col span={5} className="b-b-1">
            {this.state.hospital_number || ""} &nbsp;
          </Col>
        </Row>
        <Row>
          <Col span={3}>Address</Col>
          <Col span={13} className="b-b-1">
            {this.state.address} &nbsp;
          </Col>
          <Col span={3}>Ward/Room</Col>
          <Col span={5} className="b-b-1">
            {this.state.ward} &nbsp;
          </Col>
        </Row>
        <Row>
          <Col span={3}>Age</Col>
          <Col span={3} className="b-b-1">
            {this.state.age} &nbsp;
          </Col>
          <Col span={2}>Sex</Col>
          <Col span={2} className="b-b-1">
            {this.state.sex} &nbsp;
          </Col>
          <Col span={3}>Admission Date</Col>
          <Col span={3} className="b-b-1">
            {this.state.registration_date &&
              this.state.registration_date.format("MM-DD-YY")}{" "}
            &nbsp;
          </Col>
          <Col span={3}>Date of OR</Col>
          <Col span={5} className="b-b-1">
            {this.state.date_time_of_surgery &&
              this.state.date_time_of_surgery.format("MM-DD-YY")}{" "}
            &nbsp;
          </Col>
        </Row>
        <div style={{ marginTop: "3rem" }}>
          <span className="has-text-weight-bold surgical-memo-heading">
            OPERATION DONE
          </span>
          <div
            style={{
              minHeight: "150px",
              marginTop: "1rem"
            }}
          >
            {this.state.rvs.map(r => (
              <div>
                {r.rvs_description} - {r.rvs_laterality} - {r.rvs_code}
              </div>
            ))}
          </div>
        </div>

        <div>
          <ul>
            <li>
              Patient is supine position under{" "}
              <input
                type="text"
                name="anes"
                onChange={this.onChange}
                value={this.state.ob_operative_technique.anes}
              />
              Anesthesia.
            </li>
            <li>Insertion of Foley Catheter.</li>
            <li>
              Pelvic Examination under anesthesia done:
              <div style={{ padding: "0rem 1rem" }}>
                <Row>
                  <Col span={2}>Cervix</Col>
                  <Col span={4}>
                    <input
                      type="text"
                      name="cervix"
                      onChange={this.onChange}
                      value={this.state.ob_operative_technique.cervix}
                    />
                  </Col>

                  <Col span={2} offset={2}>
                    Adnexae
                  </Col>
                  <Col span={4}>
                    <input
                      type="text"
                      name="adnexae"
                      onChange={this.onChange}
                      value={this.state.ob_operative_technique.adnexae}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={2}>Uterus</Col>
                  <Col span={4}>
                    <input
                      type="text"
                      name="uterus"
                      onChange={this.onChange}
                      value={this.state.ob_operative_technique.uterus}
                    />
                  </Col>

                  <Col span={2} offset={2}>
                    Discharges
                  </Col>
                  <Col span={4}>
                    <input
                      type="text"
                      name="discharges"
                      onChange={this.onChange}
                      value={this.state.ob_operative_technique.discharges}
                    />
                  </Col>
                </Row>
              </div>
            </li>
            <li>Asepsis/Antisepsis.</li>
            <li>Drapings placed leaving the operative site exposed.</li>
            <li>
              Midline vertical suprapubic incision done and was carried down to
              the peritoneum.
            </li>
            <li>Abdominopelvic organs inspected and palpated.</li>
            <li>Bladder retractor/center blade positioned in place.</li>
            <li>
              Self-retaining retractor inserted exposing pelvic structures.
            </li>
            <li>
              Bowels packed wway with visceral packs for satisfactory exposure
              of the pelvis.
            </li>
            <li>
              Round ligaments on both sides grasped with straight Kelly clamp,
              cut, and suture ligated using{" "}
              <input
                type="text"
                name="ligation_equipment"
                onChange={this.onChange}
                value={this.state.ob_operative_technique.ligation_equipment}
              />
              .
            </li>
            <li>
              The anterior leaves of the broad ligaments opened to the point of
              reflection of the bladder peritoneum on the uterus.
            </li>
            <li>
              The peritoneal incision was extended superior and lateral to the
              ovaries, parallel wit the infundibulopelvic ligaments.
              Retroperitoneal exploration done to identify vessels and ureters
              on both sides.
            </li>
            <li>
              Triple clamping of the infundibulopelvic ligaments on both sides
              followed by cutting beneath the most medical clamp, doubly tying
              beneath the most lateral clamp using Silk 0, and suture ligation
              beneath the middle clamp using Vicryl 0 sutures.{" "}
            </li>
            <li>
              Bladder was dissected away from the lower uterine segment and
              anterior aspect of the cervix by careful dissection using a peanut
              or cherry sponge.
            </li>
            <li>
              Posterior leaves of the broad ligaments incised to the point of
              origin of the uterosacral ligaments.
            </li>
            <li>
              Uterine vessels on both sides were triply clamped with Heaney
              clamps, cut beneath the most medical clamp and doubly suture
              ligated using Vicryl 0.
            </li>
            <li>
              Sequence of straight Heaney clamps were placed across the right
              cardinal ligament, cut and suture-ligated using Vicryl 0. The
              procedure was repeated until the level of cervico-vaginal
              junction. The same procedure was done on the left side.
            </li>
            <li>
              Uterosacral ligaments on both sides were clamped, cut, and
              suture-ligated using Vicryl 0.
            </li>
            <li>
              The vagina was grasped with two (2) Allis forceps and entered by a
              stab wound in between the Allis forceps using scalpel and the
              uterus was removed by circumferential cutting closely beneath the
              cervix.
            </li>
            <li>Betadinized OS was then placed in the vaginal vault.</li>
          </ul>
        </div>

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

export default connect(mapToState)(withRouter(OperativeTechinqueReport));
