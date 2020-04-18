import React, { Component } from "react";
import TextFieldGroup from "../../commons/TextFieldGroup";
import axios from "axios";
import isEmpty from "../../validation/is-empty";
import MessageBoxInfo from "../../commons/MessageBoxInfo";
import Searchbar from "../../commons/Searchbar";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { USER_ADMIN } from "../../utils/constants";
import { Breadcrumb, Layout } from "antd";
import { roles_options } from "./../../utils/Options";
import SimpleSelectFieldGroup from "../../commons/SimpleSelectFieldGroup";

const { Content } = Layout;

const form_data = {
  _id: "",
  name: "",
  username: "",
  role: "",
  password: "",
  password_confirmation: "",
  logs: [],
};

const collection_field = "users";

class Users extends Component {
  state = {
    title: "Users Master File",
    url: "/api/users/",
    search_keyword: "",
    errors: {},

    [collection_field]: [],

    ...form_data,
  };

  componentDidMount() {
    if (
      this.props.auth.user.role !== USER_ADMIN &&
      this.props.auth.user.username !== "msalvio"
    ) {
      this.props.history.push("/");
    }

    axios
      .get(this.state.url + "?s=" + this.state.search_keyword)
      .then((response) =>
        this.setState({
          users: response.data,
          message: isEmpty(response.data) ? "No rows found" : "",
        })
      )
      .catch((err) => console.log(err));
  }

  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  onSelectChange = (name) => {
    return (value) => {
      this.setState({ [name]: value });
    };
  };

  onSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...this.state,
      user: this.props.auth.user,
    };

    if (isEmpty(this.state._id)) {
      axios
        .put(this.state.url, data)
        .then(({ data }) =>
          this.setState({
            ...data,
            errors: {},
            message: "Transaction Saved",
          })
        )
        .catch((err) => this.setState({ errors: err.response.data }));
    } else {
      axios
        .post(this.state.url + this.state._id, data)
        .then(({ data }) =>
          this.setState({
            ...data,
            errors: {},
            message: "Transaction Updated",
          })
        )
        .catch((err) => this.setState({ errors: err.response.data }));
    }
  };

  onSearch = (value, e) => {
    e.preventDefault();

    axios
      .get(this.state.url + "?s=" + this.state.search_keyword)
      .then((response) =>
        this.setState({
          users: response.data,
          message: isEmpty(response.data) ? "No rows found" : "",
        })
      )
      .catch((err) => console.log(err));
  };

  addNew = () => {
    console.log("here");
    this.setState({
      users: [],

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
        this.setState({
          [collection_field]: [],
          ...record,
          password: "",
          password_confirmation: "",
          role: record.role ? record.role : null,
        });
      })
      .catch((err) => console.log(err));
  };

  onDelete = () => {
    axios
      .delete(this.state.url + this.state._id)
      .then((response) => {
        this.setState({
          ...form_data,
          message: "Transaction Deleted",
        });
      })
      .catch((err) => console.log(err));
  };

  onHide = () => {
    this.setState({ message: "" });
  };

  render() {
    const { errors } = this.state;

    return (
      <Content
        style={{
          background: "#fff",
          padding: 24,
        }}
        className="is-full-height-vh"
      >
        <div className="columns is-marginless">
          <div className="column">
            <Breadcrumb style={{ margin: "16px 0" }}>
              <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
              <Breadcrumb.Item>Users</Breadcrumb.Item>
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
        <span className="is-size-5">{this.state.title}</span> <hr />
        <MessageBoxInfo message={this.state.message} onHide={this.onHide} />
        {isEmpty(this.state[collection_field]) ? (
          <form onSubmit={this.onSubmit}>
            <div>
              <TextFieldGroup
                label="Name"
                name="name"
                value={this.state.name}
                onChange={this.onChange}
                error={errors.name}
              />

              <TextFieldGroup
                label="Username"
                name="username"
                value={this.state.username}
                onChange={this.onChange}
                error={errors.username}
              />

              <SimpleSelectFieldGroup
                label="Role"
                name="role"
                value={this.state.role}
                onChange={(value) => this.setState({ role: value })}
                error={errors.role}
                options={roles_options}
              />

              <TextFieldGroup
                label="Password"
                name="password"
                type="password"
                value={this.state.password}
                onChange={this.onChange}
                error={errors.password}
              />

              <TextFieldGroup
                label="Password Confirmation"
                type="password"
                name="password_confirmation"
                value={this.state.password_confirmation}
                onChange={this.onChange}
                error={errors.password_confirmation}
              />

              <div className="field is-grouped">
                <div className="control">
                  <button className="button is-primary">Save</button>
                </div>

                {!isEmpty(this.state._id) ? (
                  <span
                    className="button is-danger is-outlined"
                    onClick={this.onDelete}
                  >
                    <span>Delete</span>
                    <span className="icon is-small">
                      <i className="fas fa-times" />
                    </span>
                  </span>
                ) : null}
              </div>
            </div>
          </form>
        ) : (
          <table className="table is-fullwidth is-striped is-hoverable min-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Latest Log</th>
              </tr>
            </thead>
            <tbody>
              {this.state.users.map((user, index) => (
                <tr key={user._id} onClick={() => this.edit(user)}>
                  <td>{index + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.username}</td>
                  <td>{user.role}</td>
                  <td>
                    {!isEmpty(user.logs) && (
                      <div>{user.logs[user.logs.length - 1].log}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Content>
    );
  }
}

const mapToState = (state) => {
  return {
    auth: state.auth,
  };
};

export default connect(mapToState)(withRouter(Users));
