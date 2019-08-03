import React, { Component } from "react";
import { Form, Input, Modal, message } from "antd";
import axios from "axios";
import isEmpty from "./../../validation/is-empty";

let callback;
export default class AcademicYearModalForm extends Component {
  state = {
    desc: "",
    visible: false
  };

  open = c => {
    this.setState({ visible: true });
    callback = c;
  };

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  onSubmit = e => {
    e.preventDefault();

    if (isEmpty(this.state.desc)) {
      message.error("Description empty");
      return;
    }

    const form_data = {
      desc: this.state.desc
    };

    axios
      .put(`/api/academic-years`, form_data)
      .then(response => {
        callback(response.data);
        this.setState({ visible: false, desc: "" });
      })
      .catch(err => {
        message.error("An error has occured");
      });
  };

  render() {
    return (
      <div>
        <Modal
          title="Faculty Research Program Form"
          visible={this.state.visible}
          onOk={this.onSubmit}
          onCancel={() => this.setState({ visible: false })}
        >
          <div>
            <Form onSubmit={this.onSubmit} className="login-form">
              <Form.Item>
                <Input
                  name="desc"
                  value={this.state.desc}
                  onChange={this.onChange}
                />
              </Form.Item>
            </Form>
          </div>
        </Modal>
      </div>
    );
  }
}
