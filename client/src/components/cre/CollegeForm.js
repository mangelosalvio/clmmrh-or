import React, { Component } from "react";
import { connect } from "react-redux";
import TextFieldGroup from "../../commons/TextFieldGroup";
import axios from "axios";
import isEmpty from "../../validation/is-empty";
import MessageBoxInfo from "../../commons/MessageBoxInfo";
import Searchbar from "../../commons/Searchbar";
import "../../styles/Autosuggest.css";

import {
  Layout,
  Breadcrumb,
  Form,
  Divider,
  Table,
  Icon,
  message,
  List,
  Input
} from "antd";

import { formItemLayout } from "./../../utils/Layouts";

const { Content } = Layout;

const collection_name = "colleges";

const form_data = {
  [collection_name]: [],
  _id: "",
  name: "",
  college_agenda: "",
  college_department: "",
  college_agendas: [],
  college_departments: [],
  department_agenda: "",

  errors: {}
};

class CollegeForm extends Component {
  state = {
    title: "Colleges",
    url: "/api/colleges/",
    search_keyword: "",
    ...form_data
  };

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  onDepartmentAgendaChange = (e, i) => {
    const college_departments = [...this.state.college_departments];
    college_departments[i].department_agenda = e.target.value;
    this.setState({ college_departments });
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

  onAddCollegeAgenda = e => {
    e.preventDefault();
    const college_agendas = [
      ...this.state.college_agendas,
      this.state.college_agenda
    ];
    this.setState({
      college_agendas,
      college_agenda: ""
    });
  };

  onAddDepartmentAgenda = (e, i) => {
    e.preventDefault();

    let college_departments = [...this.state.college_departments];
    college_departments[i] = {
      ...college_departments[i],
      department_agendas: [
        ...college_departments[i].department_agendas,
        college_departments[i].department_agenda
      ]
    };

    college_departments[i].department_agenda = "";

    this.setState({
      college_departments,
      department_agenda: ""
    });
  };

  onAddCollegeDepartment = e => {
    e.preventDefault();
    const college_departments = [
      ...this.state.college_departments,
      {
        name: this.state.college_department,
        department_agendas: []
      }
    ];
    this.setState({
      college_departments,
      college_department: ""
    });
  };

  onDeleteCollegeDepartment = index => {
    const college_departments = [...this.state.college_departments];

    college_departments.splice(index, 1);

    this.setState({
      college_departments
    });
  };

  onDeleteCollegeAgenda = index => {
    let college_agendas = [...this.state.college_agendas];
    college_agendas.splice(index, 1);
    this.setState({
      college_agendas
    });
  };

  onDeleteDepartmentAgenda = (department_index, agenda_index) => {
    let college_departments = [...this.state.college_departments];
    college_departments[department_index].department_agendas.splice(
      agenda_index,
      1
    );
    this.setState({
      college_departments
    });
  };
  render() {
    const records_column = [
      {
        title: "Name",
        dataIndex: "name"
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
              <Breadcrumb.Item>Colleges</Breadcrumb.Item>
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
                label="Name"
                name="name"
                value={this.state.name}
                error={errors.name}
                formItemLayout={formItemLayout}
                onChange={this.onChange}
              />

              <Divider orientation="left">Agendas</Divider>

              <TextFieldGroup
                label="Agenda"
                name="college_agenda"
                value={this.state.college_agenda}
                error={errors.college_agenda}
                formItemLayout={formItemLayout}
                onChange={this.onChange}
                onPressEnter={this.onAddCollegeAgenda}
              />

              <List
                dataSource={this.state.college_agendas}
                renderItem={(item, i) => (
                  <List.Item>
                    <Icon
                      type="delete"
                      theme="filled"
                      className="pointer"
                      onClick={() => this.onDeleteCollegeAgenda(i)}
                    />{" "}
                    {item}
                  </List.Item>
                )}
              />

              <Divider orientation="left">Departments</Divider>

              <TextFieldGroup
                label="Name"
                name="college_department"
                value={this.state.college_department}
                error={errors.college_department}
                formItemLayout={formItemLayout}
                onChange={this.onChange}
                onPressEnter={this.onAddCollegeDepartment}
              />

              <List
                dataSource={this.state.college_departments}
                itemLayout="horizontal"
                renderItem={(item, i) => (
                  <List.Item>
                    <div className="column">
                      <Icon
                        type="delete"
                        theme="filled"
                        className="pointer"
                        onClick={() => this.onDeleteCollegeDepartment(i)}
                      />{" "}
                      {item.name}
                    </div>

                    <div className="column is-4">
                      <Input
                        name="department_agenda"
                        placeholder="Department Agenda"
                        size="small"
                        onChange={e => this.onDepartmentAgendaChange(e, i)}
                        value={item.department_agenda}
                        onPressEnter={e => this.onAddDepartmentAgenda(e, i)}
                      />
                      <List
                        dataSource={item.department_agendas}
                        renderItem={(agenda, n) => (
                          <List.Item>
                            <Icon
                              type="delete"
                              theme="filled"
                              className="pointer"
                              onClick={() =>
                                this.onDeleteDepartmentAgenda(i, n)
                              }
                            />{" "}
                            {agenda}
                          </List.Item>
                        )}
                      />
                    </div>
                  </List.Item>
                )}
              />

              <Form.Item className="m-t-1" {...formItemLayout}>
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

export default connect(mapToState)(CollegeForm);
