import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import axios from "axios";
import { Layout, message, Col, Row } from "antd";
import clmmrh_logo from "./../../images/clmmrh-report-logo.png";
import clmmrh_footer_logo from "./../../images/clmmrh-report-footer-logo.png";

import moment from "moment";

const { Content } = Layout;

const collection_name = "slips";

const form_data = {
  [collection_name]: []
};

class ORElectiveOperations extends Component {
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
    },
    electives: [],
    on_duty_anes: [],
    pacu_anes: [],
    team_captain_anes: []
  };

  componentDidMount() {
    this.getRecord();
  }

  getRecord = () => {
    const id = this.props.match.params.id;

    axios
      .post("/api/operating-room-slips/or-elective-operations")
      .then(response => {
        this.setState({ ...response.data }, () => {
          window.print();
        });
      })
      .catch(err => {
        message.error("An error has occurred");
        console.log(err);
      });
  };

  render() {
    const on_duty_anes = this.state.on_duty_anes
      .map(o => o.last_name)
      .join("/");

    const pacu_anes = this.state.pacu_anes.map(o => o.last_name).join("/");

    const team_captain_anes = this.state.team_captain_anes
      .map(o => o.last_name)
      .join("/");

    return (
      <Content className="report or-report">
        <div>
          <table>
            <thead>
              <tr>
                <td colSpan="10">
                  <div className="has-text-centered has-text-weight-bold">
                    <img
                      src={clmmrh_logo}
                      alt="logo"
                      style={{ width: "8.61in" }}
                    />
                  </div>
                  <div
                    className="has-text-centered"
                    style={{
                      backgroundColor: "#BFBFBF",
                      borderBottom: "1px solid #000"
                    }}
                  >
                    OR SCHEDULE OF ELECTIVE OPERATIONS
                  </div>
                  <div className="has-text-centered">
                    {moment()
                      .add({ day: 1 })
                      .format("dddd, MMMM D, YYYY")}
                  </div>

                  <Row>
                    <Col span={18} className="has-text-right">
                      Team Captain:
                    </Col>
                    <Col span={6} className="has-text-centered">
                      {team_captain_anes}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={18} className="has-text-right">
                      PACU/Pain:
                    </Col>
                    <Col span={6} className="has-text-centered">
                      {pacu_anes}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={18} className="has-text-right">
                      24 Hours Duty:
                    </Col>
                    <Col span={6} className="has-text-centered">
                      {on_duty_anes}
                    </Col>
                  </Row>
                </td>
              </tr>
            </thead>
            <tbody>
              <tr className="or-report-heading">
                <td
                  style={{
                    width: "51px"
                  }}
                >
                  Hospital #
                </td>
                <td style={{ width: "47px" }}>Ward</td>
                <td style={{ width: "120px" }}>Patient Name</td>
                <td style={{ width: "21px" }}>Age</td>
                <td style={{ width: "21px" }}>Sex</td>
                <td>Diagnosis</td>
                <td style={{ width: "240px" }}>Procedure</td>
                <td style={{ width: "69px" }}>Surgeon</td>
                <td style={{ width: "82px" }}>Anesthesiologist</td>
                <td style={{ width: "73px" }}>Classification</td>
              </tr>

              {this.state.electives.map(record => [
                <tr>
                  <td colSpan="10" className="or-room">
                    {record._id}
                  </td>
                </tr>,
                record.items.map(item => (
                  <tr>
                    <td>{item.hospital_number}</td>
                    <td>{item.ward}</td>
                    <td>{item.name}</td>
                    <td>{item.age}</td>
                    <td>{item.sex.charAt(0)}</td>
                    <td>{item.diagnosis}</td>
                    <td>{item.procedure}</td>
                    <td>{item.surgeon && item.surgeon.last_name}</td>
                    <td>{item.main_anes && item.main_anes.last_name}</td>
                    <td>{item.classification}</td>
                  </tr>
                ))
              ])}
            </tbody>
            <tfoot>
              <td colSpan="10">
                <div className="signatories-container">
                  <Row gutter={48}>
                    <Col offset={1} span={8}>
                      Prepared by:
                    </Col>

                    <Col offset={6} span={8}>
                      Approved by:
                    </Col>
                  </Row>
                  <Row gutter={48}>
                    <Col offset={1} span={8}>
                      <div className="signatory">
                        <div>Krejmer R. Magalona, RN </div>
                        <div>OR/PACU Supervisor</div>
                      </div>
                    </Col>
                    <Col offset={6} span={8}>
                      <div className="signatory">
                        <div>Jose Dominador J. Nalumen, MD</div>
                        <div>Manager, OR Complex</div>
                      </div>
                    </Col>
                  </Row>
                </div>
                <Row className="m-t-1">
                  <Col span={16}>
                    OR SCHEDULE OF ELECTIVE OPERATIONS <br />
                    CLMMRH-MRS.F.001 <br />
                    Issue Date: 09/15/2016 <br />
                    Issue No. 004
                  </Col>
                  <Col span={8}>
                    <div className="has-text-centered">
                      <img
                        src={clmmrh_footer_logo}
                        style={{
                          width: "1.41in"
                        }}
                        alt="footer"
                      />
                    </div>
                  </Col>
                </Row>
              </td>
            </tfoot>
          </table>
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

export default connect(mapToState)(withRouter(ORElectiveOperations));
