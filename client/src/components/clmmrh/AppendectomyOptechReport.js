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

class AppendectomyOptechReport extends Component {
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
        <div className="has-text-centered has-text-weight-bold surgical-memo-heading optech-heading-margin">
          APPENDECTOMY
        </div>
        <div>
          <ol>
            <li>Patient placed in a supine position.</li>
            <li>Induction of anesthesia.</li>
            <li>Asepsis/antisepsis.</li>
            <li>Drapings placed.</li>
            <li>Rocky-Davis incision was made.</li>
            <li>
              Aponeurosis of the external oblique was incised along the lines of
              its fibers.
            </li>
            <li>
              Opening on both the internal oblique and transversus abdominis
              muscles was made using a curved Kelly clamp.{" "}
            </li>
            <li>
              Transversalis fascia, flat muscles and preperitoneal fat were
              pushed laterally to reveal the peritoneum.
            </li>
            <li>
              Peritoneum was elevated and a small opening was made with a knife.
              Opening was enlarged by both index fingers. Retactors were placed.{" "}
            </li>
            <li>
              Cecum was pulled out of the incision. Mesentery of the appendix
              was examined and cecum was reinserted into the peritoneal cavity.
              Mesoappendix was divided between the clamps.
            </li>
            <li>Mesoappendix ligated with 0 silk. Hemostasis.</li>
            <li>
              Appendix lifted straight up and two clamps were attached to its
              base. The clamp close to the cecum was removed and appendiceal
              base was doubly ligated with 0 silk.{" "}
            </li>
            <li>
              Appendix between the clamp and ligatures was divided using a
              knife.{" "}
            </li>
            <li>
              Abdominal wall closed in layers; fascia closed using absorbable
              0-vicryl suture, skin with 3-0 nylon/ skin staples
            </li>
            <li>Dressing done.</li>
            <li>End of Procedure</li>
          </ol>
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

export default connect(mapToState)(withRouter(AppendectomyOptechReport));
