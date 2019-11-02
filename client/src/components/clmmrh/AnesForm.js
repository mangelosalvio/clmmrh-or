import React, { Component } from "react";
import { connect } from "react-redux";
import TextFieldGroup from "../../commons/TextFieldGroup";
import axios from "axios";
import isEmpty from "../../validation/is-empty";
import MessageBoxInfo from "../../commons/MessageBoxInfo";
import Searchbar from "../../commons/Searchbar";
import "../../styles/Autosuggest.css";

import { Layout, Breadcrumb, Form, Table, Icon, message, Button } from "antd";

import { formItemLayout, tailFormItemLayout } from "./../../utils/Layouts";
import {
  gender_options,
  assignment_options,
  year_level_options
} from "../../utils/Options";
import RadioGroupFieldGroup from "../../commons/RadioGroupFieldGroup";
import SimpleSelectFieldGroup from "../../commons/SimpleSelectFieldGroup";
import SimpleSelect from "../../commons/SimpleSelect";

const { Content } = Layout;

const collection_name = "anesthesiologists";

const form_data = {
  [collection_name]: [],
  _id: "",

  last_name: "",
  first_name: "",
  middle_name: "",
  sex: "",
  contact_number: "",
  assignment: "",
  year_level: "",

  errors: {}
};

class AnesForm extends Component {
  state = {
    title: "Anesthesiologist Form",
    url: "/api/anesthesiologists/",
    search_keyword: "",
    ...form_data
  };

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  onSubmit = e => {
    e.preventDefault();

    const form_data = {
      ...this.state,
      user: this.props.auth.user
    };

    if (isEmpty(this.state._id)) {
      axios
        .put(this.state.url, form_data)
        .then(({ data }) => {
          message.success("Transaction Saved");
          this.setState({
            ...data,
            errors: {},
            message: "Transaction Saved"
          });
        })
        .catch(err => {
          message.error("You have an invalid input");
          this.setState({ errors: err.response.data });
        });
    } else {
      axios
        .post(this.state.url + this.state._id, form_data)
        .then(({ data }) => {
          message.success("Transaction Updated");
          this.setState({
            ...data,
            errors: {},
            message: "Transaction Updated"
          });
        })
        .catch(err => this.setState({ errors: err.response.data }));
    }
  };

  onSearch = (value, e) => {
    e.preventDefault();

    axios
      .get(this.state.url + "?s=" + this.state.search_keyword)
      .then(response =>
        this.setState({
          [collection_name]: response.data,
          message: isEmpty(response.data) ? "No rows found" : ""
        })
      )
      .catch(err => console.log(err));
  };

  addNew = () => {
    this.setState({
      ...form_data,
      errors: {},
      message: ""
    });
  };

  edit = record => {
    axios
      .get(this.state.url + record._id)
      .then(response => {
        const record = response.data;
        this.setState(prevState => {
          return {
            ...form_data,
            [collection_name]: [],
            ...record,
            errors: {}
          };
        });
      })
      .catch(err => console.log(err));
  };

  onDelete = () => {
    axios
      .delete(this.state.url + this.state._id)
      .then(response => {
        message.success("Transaction Deleted");
        this.setState({
          ...form_data,
          message: "Transaction Deleted"
        });
      })
      .catch(err => {
        message.error(err.response.data.message);
      });
  };

  onHide = () => {
    this.setState({ message: "" });
  };

  onChangeAssignment = (value, record, index) => {
    const form_data = {
      assignment: value
    };
    const loading = message.loading("Processing...");
    axios
      .post(`/api/anesthesiologists/${record._id}/assignment`, form_data)
      .then(response => {
        loading();
        const records = [...this.state[collection_name]];
        records[index] = { ...response.data };
        this.setState({
          [collection_name]: records
        });
      });
  };

  updateOnDuty = (record, index) => {
    const on_duty = record.on_duty ? !record.on_duty : true;
    const form_data = {
      on_duty
    };
    const loading = message.loading("Processing...");
    axios
      .post(`/api/anesthesiologists/${record._id}/on-duty`, form_data)
      .then(response => {
        loading();
        const records = [...this.state[collection_name]];
        records[index] = { ...response.data };
        this.setState({
          [collection_name]: records
        });
      })
      .catch(err => {
        loading();
        message.error("An error has occurred");
      });
  };

  render() {
    const records_column = [
      {
        title: "Name",
        dataIndex: "full_name"
      },

      {
        title: "Contact #",
        dataIndex: "contact_number"
      },

      {
        title: "Assignment",
        dataIndex: "assignment",
        render: (value, record, index) => (
          <SimpleSelect
            value={value}
            onChange={value => this.onChangeAssignment(value, record, index)}
            options={assignment_options}
            style={{ width: 150 }}
          />
        )
      },
      {
        title: "Year Level",
        dataIndex: "year_level"
      },
      {
        title: "On Duty",
        dataIndex: "on_duty",
        render: (value, record, index) => (
          <Button onClick={() => this.updateOnDuty(record, index)}>
            {value ? "YES" : "NO"}
          </Button>
        )
      },
      {
        title: "",
        key: "action",
        width: 10,
        render: (text, record) => (
          <span>
            <Icon
              type="edit"
              theme="filled"
              className="pointer"
              onClick={() => this.edit(record)}
            />
          </span>
        )
      }
    ];

    const { errors } = this.state;

    return (
      <Content style={{ padding: "0 50px" }}>
        <div className="columns is-marginless">
          <div className="column">
            <Breadcrumb style={{ margin: "16px 0" }}>
              <Breadcrumb.Item>Home</Breadcrumb.Item>
              <Breadcrumb.Item>Anesthesiologists</Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="column">
            <Searchbar
              name="search_keyword"
              onSearch={this.onSearch}
              onChange={this.onChange}
              value={this.state.search_keyword}
              onNew={this.addNew}
            />
          </div>
        </div>

        <div style={{ background: "#fff", padding: 24, minHeight: 280 }}>
          <span className="is-size-5">{this.state.title}</span> <hr />
          <MessageBoxInfo message={this.state.message} onHide={this.onHide} />
          {isEmpty(this.state[collection_name]) ? (
            <Form onSubmit={this.onSubmit}>
              <TextFieldGroup
                label="Last Name"
                name="last_name"
                value={this.state.last_name}
                error={errors.last_name}
                formItemLayout={formItemLayout}
                onChange={this.onChange}
              />

              <TextFieldGroup
                label="First Name"
                name="first_name"
                value={this.state.first_name}
                error={errors.first_name}
                formItemLayout={formItemLayout}
                onChange={this.onChange}
              />

              <TextFieldGroup
                label="Middle Name"
                name="middle_name"
                value={this.state.middle_name}
                error={errors.middle_name}
                formItemLayout={formItemLayout}
                onChange={this.onChange}
              />

              <RadioGroupFieldGroup
                label="Sex"
                name="sex"
                value={this.state.sex}
                onChange={this.onChange}
                error={errors.sex}
                formItemLayout={formItemLayout}
                options={gender_options}
              />

              <TextFieldGroup
                label="Contact Number"
                name="contact_number"
                value={this.state.contact_number}
                error={errors.contact_number}
                formItemLayout={formItemLayout}
                onChange={this.onChange}
              />

              <SimpleSelectFieldGroup
                label="Assignment"
                name="assignment"
                value={this.state.assignment}
                onChange={value => this.setState({ assignment: value })}
                error={errors.assignment}
                formItemLayout={formItemLayout}
                options={assignment_options}
              />

              <SimpleSelectFieldGroup
                label="Year Level"
                name="year_level"
                value={this.state.year_level}
                onChange={value => this.setState({ year_level: value })}
                error={errors.year_level}
                formItemLayout={formItemLayout}
                options={year_level_options}
              />

              <Form.Item className="m-t-1" {...tailFormItemLayout}>
                <div className="field is-grouped">
                  <div className="control">
                    <button className="button is-small is-primary">Save</button>
                  </div>
                  {!isEmpty(this.state._id) ? (
                    <a
                      className="button is-danger is-outlined is-small"
                      onClick={this.onDelete}
                    >
                      <span>Delete</span>
                      <span className="icon is-small">
                        <i className="fas fa-times" />
                      </span>
                    </a>
                  ) : null}
                </div>
              </Form.Item>
            </Form>
          ) : (
            <Table
              dataSource={this.state[collection_name]}
              columns={records_column}
              rowKey={record => record._id}
            />
          )}
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

export default connect(mapToState)(AnesForm);
