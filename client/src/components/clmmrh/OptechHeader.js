import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import axios from "axios";
import { message, Col, Row } from "antd";

import moment from "moment";
import { NOT_APPLICABLE } from "../../utils/constants";
import isEmpty from "../../validation/is-empty";

class OperativeTechinqueReport extends Component {
  state = {
    title: "Operating Room Form",
    url: "/api/operating-room-slips/",
    search_keyword: "",
    values: [],
    rvs: [],
  };

  componentDidMount() {
    this.getRecord();
  }

  getRecord = () => {
    const id = this.props.id;

    /**
     * get patient information from or slip
     */
    axios
      .get(this.state.url + id)
      .then((response) => {
        const record = response.data;
        const {
          date_of_birth,
          registration_date,
          date_time_of_surgery,
          operation_started,
        } = response.data;
        this.setState(
          (prevState) => {
            return {
              ...record,
              date_of_birth: date_of_birth ? moment(date_of_birth) : null,
              registration_date: registration_date
                ? moment(registration_date)
                : null,
              date_time_of_surgery: date_time_of_surgery
                ? moment(date_time_of_surgery)
                : null,
              operation_started: operation_started
                ? moment(operation_started)
                : null,
              errors: {},
            };
          },
          () => {
            //window.print();
          }
        );
      })
      .catch((err) => {
        message.error("An error has occurred");
        console.log(err);
      });
  };

  render() {
    return (
      <div>
        <div className="has-text-centered has-text-weight-bold surgical-memo-heading">
          CORAZON LOCSIN MONTELIBANO MEMORIAL REGIONAL HOSPITAL
        </div>
        <div className="has-text-centered surgical-memo-heading">
          Lacson - Burgos Streets, Bacolod City
        </div>
        <div className="has-text-centered has-text-weight-bold surgical-memo-heading optech-heading-margin">
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
            {this.state.operation_started &&
              this.state.operation_started.format("MM-DD-YY")}{" "}
            &nbsp;
          </Col>
        </Row>
        <div style={{ marginTop: "1rem" }}>
          <span className="has-text-weight-bold surgical-memo-heading">
            OPERATION DONE
          </span>
          <div
            style={{
              margin: "1rem 0rem",
            }}
          >
            {this.state.rvs.map((r) => (
              <div>
                {r.rvs_description}{" "}
                {!isEmpty(r.rvs_laterality) &&
                  r.rvs_laterality !== NOT_APPLICABLE &&
                  `- ${r.rvs_laterality}`}{" "}
                - {r.rvs_code}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

const mapToState = (state) => {
  return {
    auth: state.auth,
    map: state.map,
  };
};

export default connect(mapToState)(withRouter(OperativeTechinqueReport));
