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
    const id = this.props.match.params.id;

    axios
      .get(`${this.state.url}${this.props.match.params.id}`)
      .then(response => {
        if (response.data) {
          const optech_content = `<div>${response.data.optech_content}</div>`;

          this.setState({
            ...response.data,
            optech_content
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

  renderHTML = content => (
    <div dangerouslySetInnerHTML={{ __html: content }}></div>
  );

  render() {
    return (
      <Content className="content report operative-technique-container">
        <OptechHeader id={this.props.match.params.id} />

        {this.renderHTML(this.state.optech_content)}

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

export default connect(mapToState)(withRouter(OperativeTechinqueReport));
