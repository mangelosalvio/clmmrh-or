import React, { Component } from "react";

import axios from "axios";
import { connect } from "react-redux";
import "../../styles/Autosuggest.css";

import { Layout } from "antd";

const { Content } = Layout;

const form_data = {
  errors: {},
  purging_months_recording: ""
};

class SettingForm extends Component {
  state = {
    title: "Settings",
    ...form_data
  };

  componentDidMount = () => {
    axios.get("/api/settings").then(response => {
      const settings = response.data;
      settings.forEach(setting => {
        console.log(setting);
        this.setState({
          [setting.key]: setting.value
        });
      });
    });
  };

  onChange = e => {
    const form_data = {
      key: e.target.name,
      value: e.target.value
    };
    axios.post("/api/settings", form_data).then(response => {
      this.setState({ [response.data.key]: response.data.value });
    });
  };

  render() {
    return (
      <Content
        style={{
          background: "#fff",
          padding: 24,
          minHeight: 280
        }}
      >
        <div className="columns">
          <div className="column">
            <span className="is-size-5">{this.state.title}</span>
          </div>
        </div>
      </Content>
    );
  }
}

const mapToState = state => {
  return {
    auth: state.auth
  };
};

export default connect(mapToState)(SettingForm);
