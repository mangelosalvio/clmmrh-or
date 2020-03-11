import React, { Component } from "react";
import { connect } from "react-redux";

import axios from "axios";
import isEmpty from "../../validation/is-empty";
import MessageBoxInfo from "../../commons/MessageBoxInfo";
import Searchbar from "../../commons/Searchbar";
import "../../styles/Autosuggest.css";
import { Layout, Breadcrumb, Form, Table, Icon, message, Divider } from "antd";
import { formItemLayout } from "./../../utils/Layouts";

import RangeDatePickerFieldGroup from "../../commons/RangeDatePickerFieldGroup";
import SelectFieldGroup from "../../commons/SelectFieldGroup";
import moment from "moment-timezone";
import {
  assignment_options,
  room_status_options,
  operating_room_number_options
} from "../../utils/Options";
import SimpleSelectFieldGroup from "../../commons/SimpleSelectFieldGroup";

const { Content } = Layout;

const collection_name = "rvs";

const form_data = {
  [collection_name]: [],
  _id: "",

  team_captain_anes: "",
  pacu_anes: "",
  on_duty_anes: "",

  period: [null, null],
  team_captains: [],
  pacu: [],
  on_duty: [],

  errors: {},
  room_schedule: []
};

class ORScheduleForm extends Component {
  state = {
    title: "OR Schedule",
    url: "/api/or-schedules/",
    search_keyword: "",
    ...form_data,
    options: {
      anesthesiologists: []
    }
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
            period: [moment(data.period[0]), moment(data.period[1])],
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
            period: [moment(data.period[0]), moment(data.period[1])],
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
            period: [moment(record.period[0]), moment(record.period[1])],
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

  updateOnDuty = (record, index) => {
    const on_duty = record.on_duty ? !record.on_duty : true;
    const form_data = {
      on_duty
    };
    const loading = message.loading("Processing...");
    axios
      .post(`/api/nurses/${record._id}/on-duty`, form_data)
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

  onChangeAssignment = (value, record, index) => {
    const form_data = {
      assignment: value,
      user: this.props.auth.user
    };
    const loading = message.loading("Processing...");
    axios
      .post(`/api/nurses/${record._id}/assignment`, form_data)
      .then(response => {
        loading();
        const records = [...this.state[collection_name]];
        records[index] = { ...response.data };
        this.setState({
          [collection_name]: records
        });
      });
  };

  /**
   * ANESTHESIOLOGISTS
   */

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

  onAnesChange = ({ index, field }) => {
    const records = [
      ...this.state[field],
      {
        ...this.state.options.anesthesiologists[index]
      }
    ];

    this.setState({
      [field]: records
    });
  };

  onDeleteAnes = ({ index, field }) => {
    const records = [...this.state[field]];
    records.splice(index, 1);
    this.setState({
      [field]: records
    });
  };

  getRoomStatus = room => {
    const room_schedule = [...this.state.room_schedule];
    const obj = room_schedule.find(o => o.room === room);
    if (obj) {
      return obj.status;
    }

    return null;
  };

  render() {
    const records_column = [
      {
        title: "Period",
        dataIndex: "period",
        render: period => (
          <span>
            {moment(period[0]).format("MM/DD/YYYY")} -{" "}
            {moment(period[1]).format("MM/DD/YYYY")}
          </span>
        )
      },
      {
        title: "Team Captain",
        dataIndex: "team_captains",
        render: records => (
          <span>{records.map(o => o.full_name).join("/")}</span>
        )
      },
      {
        title: "PACU",
        dataIndex: "pacu",
        render: records => (
          <span>{records.map(o => o.full_name).join("/")}</span>
        )
      },
      {
        title: "On Duty",
        dataIndex: "on_duty",
        render: records => (
          <span>{records.map(o => o.full_name).join("/")}</span>
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

    const team_anes_column = [
      {
        title: "Name",
        dataIndex: "full_name"
      },
      {
        title: "",
        key: "action",
        width: 10,
        render: (text, record, index) => (
          <span>
            <Icon
              type="delete"
              theme="filled"
              className="pointer"
              onClick={() =>
                this.onDeleteAnes({
                  index,
                  field: "team_captains"
                })
              }
            />
          </span>
        )
      }
    ];

    const pacu_anes_column = [
      {
        title: "Name",
        dataIndex: "full_name"
      },
      {
        title: "",
        key: "action",
        width: 10,
        render: (text, record, index) => (
          <span>
            <Icon
              type="delete"
              theme="filled"
              className="pointer"
              onClick={() =>
                this.onDeleteAnes({
                  index,
                  field: "pacu"
                })
              }
            />
          </span>
        )
      }
    ];

    const on_duty_column = [
      {
        title: "Name",
        dataIndex: "full_name"
      },
      {
        title: "",
        key: "action",
        width: 10,
        render: (text, record, index) => (
          <span>
            <Icon
              type="delete"
              theme="filled"
              className="pointer"
              onClick={() =>
                this.onDeleteAnes({
                  index,
                  field: "on_duty"
                })
              }
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
              <Breadcrumb.Item>OR Schedule</Breadcrumb.Item>
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
              <RangeDatePickerFieldGroup
                label="Period"
                name="period"
                value={this.state.period}
                onChange={dates => this.setState({ period: dates })}
                error={errors.period}
                formItemLayout={formItemLayout}
              />

              <Divider orientation="left">Team Captain</Divider>

              <SelectFieldGroup
                label="Team Captain"
                name="team_captain"
                value={
                  this.state.team_captain_anes &&
                  this.state.team_captain_anes.full_name
                }
                onChange={index =>
                  this.onAnesChange({
                    index,
                    field: "team_captains"
                  })
                }
                onSearch={this.onAnesSearch}
                error={errors.team_captain_anes}
                formItemLayout={formItemLayout}
                data={this.state.options.anesthesiologists}
                column="full_name"
              />

              <Table
                dataSource={this.state.team_captains}
                columns={team_anes_column}
                rowKey={record => record._id}
                pagination={false}
              />

              <Divider orientation="left">PACU</Divider>

              <SelectFieldGroup
                label="PACU"
                name="pacu"
                value={this.state.pacu_anes && this.state.pacu_anes.full_name}
                onChange={index =>
                  this.onAnesChange({
                    index,
                    field: "pacu"
                  })
                }
                onSearch={this.onAnesSearch}
                error={errors.pacu_anes}
                formItemLayout={formItemLayout}
                data={this.state.options.anesthesiologists}
                column="full_name"
              />

              <Table
                dataSource={this.state.pacu}
                columns={pacu_anes_column}
                rowKey={record => record._id}
                pagination={false}
              />

              <Divider orientation="left">On Duty</Divider>
              <SelectFieldGroup
                label="On Duty"
                name="on_duty"
                value={
                  this.state.on_duty_anes && this.state.on_duty_anes.full_name
                }
                onChange={index =>
                  this.onAnesChange({
                    index,
                    field: "on_duty"
                  })
                }
                onSearch={this.onAnesSearch}
                error={errors.on_duty_anes}
                formItemLayout={formItemLayout}
                data={this.state.options.anesthesiologists}
                column="full_name"
              />

              <Table
                dataSource={this.state.on_duty}
                columns={on_duty_column}
                rowKey={record => record._id}
                pagination={false}
              />

              <Divider orientation="left">Room Availability</Divider>

              {operating_room_number_options.map((room, index) => {
                return (
                  <SimpleSelectFieldGroup
                    key={index}
                    label={room}
                    name="room"
                    value={this.getRoomStatus(room)}
                    onChange={value => {
                      let room_schedule = [...this.state.room_schedule];

                      let obj = room_schedule.find(o => o.room === room);

                      if (obj) {
                        obj.status = value;
                      } else {
                        room_schedule = [
                          ...room_schedule,
                          {
                            room,
                            status: value
                          }
                        ];
                      }
                      this.setState({ room_schedule });
                    }}
                    formItemLayout={formItemLayout}
                    options={room_status_options}
                  />
                );
              })}

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

export default connect(mapToState)(ORScheduleForm);
