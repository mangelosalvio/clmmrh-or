import React, { Component } from "react";
import { connect } from "react-redux";
import TextFieldGroup from "../../commons/TextFieldGroup";
import axios from "axios";
import isEmpty from "../../validation/is-empty";
import MessageBoxInfo from "../../commons/MessageBoxInfo";
import Searchbar from "../../commons/Searchbar";
import "../../styles/Autosuggest.css";

import { Layout, Breadcrumb } from "antd";
import FileFieldGroup from "../../commons/FileFieldGroup";
const { Content } = Layout;

const collection_name = "sounds";

const form_data = {
  _id: "",
  label: "",
  location: "",
  [collection_name]: [],
  is_uploading: false,

  errors: {}
};

class Sounds extends Component {
  state = {
    title: "Sounds",
    url: "/api/sounds/",
    search_keyword: "",
    ...form_data
  };

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  onSubmit = e => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("location", this.state.location, this.state.location.name);
    fd.append("_id", this.state._id);
    fd.append("label", this.state.label);
    fd.append("user", JSON.stringify(this.props.auth.user));

    if (isEmpty(this.state._id)) {
      axios
        .put(this.state.url, fd)
        .then(({ data }) => {
          if (data.location) {
            data.location = {
              ...data.location,
              name: data.location.originalname
            };
          }

          this.setState({
            ...data,
            location: data.location,
            errors: {},
            message: "Transaction Saved"
          });
        })
        .catch(err => this.setState({ errors: err.response.data }));
    } else {
      axios
        .post(this.state.url + this.state._id, fd)
        .then(({ data }) => {
          if (data.location) {
            data.location = {
              ...data.location,
              name: data.location.originalname
            };
          }

          this.setState({
            ...data,
            errors: {},
            message: "Transaction Updated"
          });
        })
        .catch(err => this.setState({ errors: err.response.data }));
    }
  };

  onSearch = e => {
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

  onFileSelected = e => {
    console.log("here");
    console.log(e.target.files[0] instanceof File);
    console.log(e.target.files[0]);
    this.setState({
      [e.target.name]: e.target.files[0]
    });
  };

  onUpload = event => {
    event.preventDefault();
    this.setState(
      {
        is_uploading: true
      },
      () => {
        const fd = new FormData();
        fd.append("location", this.state.location, this.state.location.name);
        fd.append("id", this.state._id);

        axios
          .post("/api/customers/upload", fd)
          .then(response => {
            const customer = response.data;
            this.edit(customer);
            this.fileCustomerPic.value = null;
          })
          .catch(err => console.log(err));
      }
    );
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

        if (record.location) {
          record.location = {
            ...record.location,
            name: record.location.originalname
          };
        }

        this.setState(prevState => {
          return {
            [collection_name]: [],
            ...record,
            location: record.location,
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
        this.setState({
          ...form_data,
          message: "Transaction Deleted"
        });
      })
      .catch(err => console.log(err));
  };

  onPlay = () => {
    new Audio(`/${this.state.location.path}`).play();
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
          minHeight: 280
        }}
      >
        <div className="columns is-marginless">
          <div className="column">
            <Breadcrumb style={{ margin: "16px 0" }}>
              <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
              <Breadcrumb.Item>Sounds</Breadcrumb.Item>
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
        {isEmpty(this.state[collection_name]) ? (
          <form onSubmit={this.onSubmit}>
            <div>
              <TextFieldGroup
                label="Label"
                name="label"
                value={this.state.label}
                onChange={this.onChange}
                error={errors.label}
                placeholder="Label"
              />

              <FileFieldGroup
                label="Audio"
                name="location"
                onChange={this.onFileSelected}
                error={errors.location}
                inputRef={input => (this.fileCustomerPic = input)}
                file={this.state.location}
                filename={this.state.location && this.state.location.name}
                onPlay={this.onPlay}
              />

              <div className="field is-grouped">
                <div className="control">
                  <button className="button is-primary ">Save</button>
                </div>

                {!isEmpty(this.state._id) ? (
                  <a
                    className="button is-danger is-outlined "
                    onClick={this.onDelete}
                  >
                    <span>Delete</span>
                    <span className="icon ">
                      <i className="fas fa-times" />
                    </span>
                  </a>
                ) : null}
              </div>
            </div>
          </form>
        ) : (
          <table className="table is-fullwidth is-striped is-hoverable min-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Label</th>
                <th>Lastest Log</th>
              </tr>
            </thead>
            <tbody>
              {this.state[collection_name].map((record, index) => (
                <tr key={record._id} onClick={() => this.edit(record)}>
                  <td>{index + 1}</td>
                  <td>{record.label}</td>
                  <td>
                    {!isEmpty(record.logs) && (
                      <div>{record.logs[record.logs.length - 1].log}</div>
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

const mapToState = state => {
  return {
    auth: state.auth
  };
};

export default connect(mapToState)(Sounds);
