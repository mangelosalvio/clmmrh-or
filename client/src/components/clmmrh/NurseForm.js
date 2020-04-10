import React, { Component } from "react";
import { connect } from "react-redux";
import TextFieldGroup from "../../commons/TextFieldGroup";
import axios from "axios";
import isEmpty from "../../validation/is-empty";
import MessageBoxInfo from "../../commons/MessageBoxInfo";
import Searchbar from "../../commons/Searchbar";
import "../../styles/Autosuggest.css";

import { Layout, Breadcrumb, Form, Table, Icon, message } from "antd";

import { formItemLayout, tailFormItemLayout } from "./../../utils/Layouts";
import {
  gender_options,
  job_status_options,
  nurse_assignment_options,
} from "../../utils/Options";
import RadioGroupFieldGroup from "../../commons/RadioGroupFieldGroup";
import SimpleSelectFieldGroup from "../../commons/SimpleSelectFieldGroup";
import SimpleSelect from "../../commons/SimpleSelect";

const { Content } = Layout;

const collection_name = "nurses";

const form_data = {
  [collection_name]: [],
  _id: "",

  last_name: "",
  first_name: "",
  middle_name: "",
  sex: "",
  contact_number: "",
  assignment: "",
  job_status: "",

  errors: {},
};

class NurseForm extends Component {
  state = {
    title: "Nurse Form",
    url: "/api/nurses/",
    search_keyword: "",
    ...form_data,

    /**
     * PAGINATION VARIABLES
     */

    current_page: 1,
    total_records: 0,
  };

  componentDidMount() {
    this.onSearch();
  }

  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  onSubmit = (e) => {
    e.preventDefault();

    const form_data = {
      ...this.state,
      user: this.props.auth.user,
    };

    if (isEmpty(this.state._id)) {
      axios
        .put(this.state.url, form_data)
        .then(({ data }) => {
          message.success("Transaction Saved");
          this.setState({
            ...data,
            errors: {},
            message: "Transaction Saved",
          });
        })
        .catch((err) => {
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
            message: "Transaction Updated",
          });
        })
        .catch((err) => this.setState({ errors: err.response.data }));
    }
  };

  onSearch = ({ page = 1 } = { page: 1 }) => {
    const loading = message.loading("Loading...", 0);

    const form_data = {
      page,
      s: this.state.search_keyword,
    };

    axios
      .post(this.state.url + "paginate", form_data)
      .then((response) => {
        loading();
        this.setState({
          [collection_name]: [...response.data.docs],
          total_records: response.data.total,
          current_page: page,
        });

        if (response.data.total <= 0) {
          message.success("No records found");
        }
      })
      .catch((err) => {
        loading();
        message.error("There was an error processing your request");
      });
  };

  addNew = () => {
    this.setState({
      ...form_data,
      errors: {},
      message: "",
    });
  };

  edit = (record) => {
    axios
      .get(this.state.url + record._id)
      .then((response) => {
        const record = response.data;
        this.setState((prevState) => {
          return {
            ...form_data,
            [collection_name]: [],
            ...record,
            errors: {},
          };
        });
      })
      .catch((err) => console.log(err));
  };

  onDelete = () => {
    axios
      .delete(this.state.url + this.state._id)
      .then((response) => {
        message.success("Transaction Deleted");
        this.setState({
          ...form_data,
          message: "Transaction Deleted",
        });
      })
      .catch((err) => {
        message.error(err.response.data.message);
      });
  };

  onHide = () => {
    this.setState({ message: "" });
  };

  updateOnDuty = (record, index) => {
    const on_duty = record.on_duty ? !record.on_duty : true;
    const form_data = {
      on_duty,
    };
    const loading = message.loading("Processing...");
    axios
      .post(`/api/nurses/${record._id}/on-duty`, form_data)
      .then((response) => {
        loading();
        const records = [...this.state[collection_name]];
        records[index] = { ...response.data };
        this.setState({
          [collection_name]: records,
        });
      })
      .catch((err) => {
        loading();
        message.error("An error has occurred");
      });
  };

  onChangeAssignment = (value, record, index) => {
    const form_data = {
      assignment: value,
      user: this.props.auth.user,
    };
    const loading = message.loading("Processing...");
    axios
      .post(`/api/nurses/${record._id}/assignment`, form_data)
      .then((response) => {
        loading();
        const records = [...this.state[collection_name]];
        records[index] = { ...response.data };
        this.setState({
          [collection_name]: records,
        });
      });
  };

  onChangePage = (current_page) => {
    this.setState(
      {
        current_page,
      },
      () => {
        this.onSearch({ page: current_page });
      }
    );
  };

  render() {
    const records_column = [
      {
        title: "Name",
        dataIndex: "full_name",
      },
      {
        title: "Assignment",
        dataIndex: "assignment",
        render: (value, record, index) => (
          <SimpleSelect
            value={value}
            onChange={(value) => this.onChangeAssignment(value, record, index)}
            options={nurse_assignment_options}
            style={{ width: 200 }}
          />
        ),
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
        ),
      },
    ];

    const { errors } = this.state;

    return (
      <Content style={{ padding: "0 50px" }}>
        <div className="columns is-marginless">
          <div className="column">
            <Breadcrumb style={{ margin: "16px 0" }}>
              <Breadcrumb.Item>Home</Breadcrumb.Item>
              <Breadcrumb.Item>Faculties</Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="column">
            <Searchbar
              name="search_keyword"
              onSearch={(value, e) => {
                e.preventDefault();
                this.onSearch();
              }}
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
                onChange={(value) => this.setState({ assignment: value })}
                error={errors.assignment}
                formItemLayout={formItemLayout}
                options={nurse_assignment_options}
              />

              <SimpleSelectFieldGroup
                label="Job Status"
                name="job_status"
                value={this.state.job_status}
                onChange={(value) => this.setState({ job_status: value })}
                error={errors.job_status}
                formItemLayout={formItemLayout}
                options={job_status_options}
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
              rowKey={(record) => record._id}
              pagination={{
                current: this.state.current_page,
                defaultCurrent: this.state.current_page,
                onChange: this.onChangePage,
                total: this.state.total_records,
                pageSize: 10,
              }}
            />
          )}
        </div>
      </Content>
    );
  }
}

const mapToState = (state) => {
  return {
    auth: state.auth,
  };
};

export default connect(mapToState)(NurseForm);
