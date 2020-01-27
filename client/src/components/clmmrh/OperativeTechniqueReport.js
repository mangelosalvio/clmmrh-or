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

class OperativeTechinqueReport extends Component {
  state = {
    title: "Operating Room Form",
    url: "/api/operating-room-slips/",
    search_keyword: "",
    values: [],
    rvs: []
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
      .get(
        `${this.state.url}${this.props.match.params.id}/operative-technique/${this.props.match.params.index}`
      )
      .then(response => {
        if (response.data && response.data.values) {
          this.setState({
            values: response.data.values
          });
        }
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

  render() {
    return (
      <Content className="content report operative-technique-container">
        <OptechHeader id={this.props.match.params.id} />

        <div>
          <ul>
            <li>
              Patient is supine position under{" "}
              <input
                type="text"
                onChange={e => this.onChange(e, 1)}
                value={this.state.values[1]}
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
                      onChange={e => this.onChange(e, 2)}
                      value={this.state.values[2]}
                    />
                  </Col>

                  <Col span={2} offset={2}>
                    Adnexae
                  </Col>
                  <Col span={4}>
                    <input
                      type="text"
                      onChange={e => this.onChange(e, 3)}
                      value={this.state.values[3]}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={2}>Uterus</Col>
                  <Col span={4}>
                    <input
                      type="text"
                      onChange={e => this.onChange(e, 4)}
                      value={this.state.values[4]}
                    />
                  </Col>

                  <Col span={2} offset={2}>
                    Discharges
                  </Col>
                  <Col span={4}>
                    <input
                      type="text"
                      onChange={e => this.onChange(e, 5)}
                      value={this.state.values[5]}
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
                onChange={e => this.onChange(e, 6)}
                value={this.state.values[6]}
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
