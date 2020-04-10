import React, { Component } from "react";

import axios from "axios";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import "../../styles/Autosuggest.css";

import { Layout, Form, Row, Col, Button } from "antd";
import DatePickerFieldGroup from "../../commons/DatePickerFieldGroup";
import { formItemLayout, tailFormItemLayout } from "../../utils/Layouts";
import moment from "moment";

const { Content } = Layout;

const form_data = {
  errors: {},
  purging_months_recording: "",
  or_elec_date: moment(),
};

class SettingForm extends Component {
  state = {
    title: "OR Elective Operations",
    ...form_data,
  };

  componentDidMount = () => {
    axios.get("/api/settings").then((response) => {
      const settings = response.data;
      settings.forEach((setting) => {
        console.log(setting);
        this.setState({
          [setting.key]: setting.value,
        });
      });
    });
  };

  onChange = (e) => {
    const form_data = {
      key: e.target.name,
      value: e.target.value,
    };
    axios.post("/api/settings", form_data).then((response) => {
      this.setState({ [response.data.key]: response.data.value });
    });
  };

  render() {
    return (
      <Content
        style={{
          background: "#fff",
          padding: 24,
          minHeight: 280,
        }}
      >
        <div className="columns">
          <div className="column">
            <span className="is-size-5">{this.state.title}</span>
          </div>
        </div>
        <Form>
          <Row>
            <Col span={12}>
              <DatePickerFieldGroup
                label="OR Elective Op"
                name="or_elec_date"
                value={this.state.or_elec_date}
                onChange={(value) => this.setState({ or_elec_date: value })}
                formItemLayout={formItemLayout}
              />
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item className="m-t-1" {...tailFormItemLayout}>
                <div className="control">
                  <Link
                    to={`/or-elective-operations/${this.state.or_elec_date.valueOf()}`}
                    target="_blank"
                  >
                    <Button className="button is-small is-outlined is-info">
                      <span className="icon is-small">
                        <i className="fas fa-print" />
                      </span>
                      Print
                    </Button>
                  </Link>
                </div>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Content>
    );
  }
}

const mapToState = (state) => {
  return {
    auth: state.auth,
  };
};

export default connect(mapToState)(SettingForm);
