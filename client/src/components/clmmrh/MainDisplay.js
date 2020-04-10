import React, { Component } from "react";
import { connect } from "react-redux";
import axios from "axios";
import isEmpty from "../../validation/is-empty";
import moment from "moment";
import { message, Row, Col, notification } from "antd";
import classnames from "classnames";
import { sortBy } from "lodash";
import {
  EMERGENCY_PROCEDURE,
  SOCKET_ENDPOINT,
  CANCEL,
} from "./../../utils/constants";
import socketIoClient from "socket.io-client";
import { year_level_order } from "../../utils/Options";

const collection_name = "anesthesiologists";

const form_data = {
  [collection_name]: [],
  _id: "",
  current_time: null,
  on_going: [],
  pacu: [],
  in_holding_room: [],
  elective_list: [],
  emergency_list: [],
  charge_nurse: [],
  receiving_nurse: [],
  holding_room_nurse: [],
  on_duty_nurse: [],
  on_duty_anes: [],
  pacu_anes: [],
  team_captain_anes: [],
  errors: {},
};

class MainDisplay extends Component {
  state = {
    title: "Anesthesiologist Form",
    url: "/api/anesthesiologists/",
    search_keyword: "",
    ...form_data,
  };

  componentDidMount() {
    const socket = socketIoClient(SOCKET_ENDPOINT);
    socket.on("refresh-display", (data) => {
      //this.props.getTables();
      this.getOrData();
    });

    socket.on("new-or", (data) => {
      notification.open({
        message: `Patient Added`,
        description: `${data.name} was added.`,
        duration: 5,
      });
    });

    setInterval(() => {
      const current_time = moment().format("dddd, MMMM D, YYYY h:mm:ss A");
      this.setState({
        current_time,
      });
    }, 1000);

    this.getOrData();
  }

  getOrData = () => {
    axios.post("/api/operating-room-slips/display-monitor").then((response) => {
      this.setState({
        ...response.data,
      });
    });
  };

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

  onSearch = (value, e) => {
    e.preventDefault();

    axios
      .get(this.state.url + "?s=" + this.state.search_keyword)
      .then((response) =>
        this.setState({
          [collection_name]: response.data,
          message: isEmpty(response.data) ? "No rows found" : "",
        })
      )
      .catch((err) => console.log(err));
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

  onChangeAssignment = (value, record, index) => {
    const form_data = {
      assignment: value,
    };
    const loading = message.loading("Processing...");
    axios
      .post(`/api/anesthesiologists/${record._id}/assignment`, form_data)
      .then((response) => {
        loading();
        const records = [...this.state[collection_name]];
        records[index] = { ...response.data };
        this.setState({
          [collection_name]: records,
        });
      });
  };

  filterProcedure = (procedure) => {
    let max_characters = 60;
    if (procedure.length > max_characters) {
      return `${procedure.substring(0, max_characters - 1)}...`;
    }

    return procedure;
  };

  getScreenName = (record) => {
    const { first_name, last_name } = record;
    const fname = first_name
      .split(" ")
      .map((o) => o[0])
      .join("");
    return `${fname} ${last_name}`;
  };

  render() {
    const charge_nurse = this.state.charge_nurse
      .map((o) => this.getScreenName(o))
      .join("/");

    const holding_room_nurse = this.state.holding_room_nurse
      .map((o) => this.getScreenName(o))
      .join("/");

    const receiving_nurse = this.state.receiving_nurse
      .map((o) => this.getScreenName(o))
      .join("/");

    /**
     * ON DUTY ANES
     */

    let on_duty_anes = sortBy(this.state.on_duty_anes, [
      (o) => {
        let order = year_level_order[o.year_level];
        return isEmpty(order) ? 10 : order;
      },
    ]);

    on_duty_anes = on_duty_anes.map((o) => this.getScreenName(o)).join("/");

    /**
     * PACU ANES
     */

    let pacu_anes = sortBy(this.state.pacu_anes, [
      (o) => {
        let order = year_level_order[o.year_level];
        return isEmpty(order) ? 10 : order;
      },
    ]);

    pacu_anes = pacu_anes.map((o) => this.getScreenName(o)).join("/");

    /**
     * TEAM CAPTAIN ANES
     */

    let team_captain_anes = sortBy(this.state.team_captain_anes, [
      (o) => {
        let order = year_level_order[o.year_level];
        return isEmpty(order) ? 10 : order;
      },
    ]);

    team_captain_anes = team_captain_anes
      .map((o) => this.getScreenName(o))
      .join("/");

    return (
      <div
        className="is-full-height is-flex-column is-flex or-display"
        style={{ backgroundColor: "#22301E" }}
      >
        <div
          className="time-wrapper"
          onClick={() => this.props.history.push("/")}
        >
          {this.state.current_time}
        </div>
        <div className="is-flex is-flex-column" style={{ flex: "16 auto" }}>
          <div className="outline-full-bordered is-flex is-flex-1">
            <div className=" accent outline-full-bordered is-flex">
              <div className="display-wrapper-accent">ONGOING</div>
            </div>
            <div className="is-flex" style={{ flex: "8" }}>
              {this.state.on_going.map((record) => {
                const time_finished = record.operation_finished
                  ? moment(record.operation_finished)
                  : moment();
                const backlog_hours = moment
                  .duration(
                    time_finished.diff(moment(record.date_time_ordered))
                  )
                  .asHours();
                const is_backlog =
                  !isEmpty(record.date_time_ordered) &&
                  backlog_hours > 24 &&
                  record.case === EMERGENCY_PROCEDURE &&
                  record.operation_status !== CANCEL;

                return (
                  <div className="outline-full-bordered is-flex-1 is-flex">
                    <div
                      className={classnames("display-wrapper", {
                        "is-emergency":
                          record && record.case === EMERGENCY_PROCEDURE,
                        "is-backlog": is_backlog,
                      })}
                    >
                      <div className="is-flex">
                        <div className="has-text-weight-bold or-room-number-display">
                          {record.operating_room_number}
                        </div>
                        <div className="is-flex-1">
                          {record.service} {record.case_order}{" "}
                          {record.classification} <br />{" "}
                          <span className="has-text-weight-bold">
                            {record.name}
                          </span>{" "}
                          <br />
                          {record.age}/{record.sex && record.sex.charAt(0)}
                          <br />
                          {record.ward}
                          <br />
                        </div>
                      </div>
                      {record.procedure}
                      <br />
                      {record.surgeon && (
                        <span>{this.getScreenName(record.surgeon)}</span>
                      )}{" "}
                      {record.main_anes && (
                        <span> / {this.getScreenName(record.main_anes)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="outline-full-bordered is-flex is-flex-1">
            <div className="outline-full-bordered accent is-flex">
              <div className="display-wrapper-accent">PACU</div>
            </div>
            {this.state.pacu.map((record) => (
              <div className="outline-full-bordered is-flex-1 is-flex">
                <div
                  className={classnames("display-wrapper", {
                    "is-emergency":
                      record && record.case === EMERGENCY_PROCEDURE,
                  })}
                >
                  {record && (
                    <div>
                      <div className="is-flex">
                        <div className="has-text-weight-bold or-room-number-display">
                          {record.bed_number}
                        </div>
                        <div className="is-flex-1">
                          {record.service} {record.case_order}{" "}
                          {record.classification} <br />{" "}
                          <span className="has-text-weight-bold">
                            {record.name}
                          </span>{" "}
                          <br />
                          {record.age}/{record.sex && record.sex.charAt(0)}
                          <br />
                          {record.ward}
                          <br />
                        </div>
                      </div>
                      {record.procedure}
                      <br />
                      {record.surgeon && (
                        <span>{this.getScreenName(record.surgeon)}</span>
                      )}{" "}
                      {record.main_anes && (
                        <span> / {this.getScreenName(record.main_anes)}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="outline-full-bordered is-flex is-flex-1">
            <div className="outline-full-bordered accent is-flex">
              <div className="display-wrapper-accent">HOLDING</div>
            </div>
            {this.state.in_holding_room.map((record) => (
              <div className="outline-full-bordered is-flex-1 is-flex">
                <div
                  className={classnames("display-wrapper", {
                    "is-emergency":
                      record && record.case === EMERGENCY_PROCEDURE,
                  })}
                >
                  {record && (
                    <p>
                      {record.service} {record.case_order}{" "}
                      {record.classification} <br />{" "}
                      <span className="has-text-weight-bold">
                        {record.name}
                      </span>{" "}
                      <br />
                      {record.age} /{record.sex && record.sex.charAt(0)}
                      <br />
                      {record.ward}
                      <br />
                      {this.filterProcedure(record.procedure)}
                      <br />
                      {record.surgeon && (
                        <span>{this.getScreenName(record.surgeon)}</span>
                      )}{" "}
                      {record.main_anes && (
                        <span> / {this.getScreenName(record.main_anes)}</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="outline-full-bordered is-flex is-flex-2">
            <div className="outline-full-bordered accent is-flex">
              <div className="display-wrapper-accent">ELECTIVE OR</div>
            </div>
            <div
              className="outline-full-bordered is-flex"
              style={{
                flex: 8,
                flexFlow: "column  !important",
                flexWrap: "wrap",
              }}
            >
              {this.state.elective_list.map((record) => (
                <div
                  className="outline-full-bordered is-flex"
                  style={{ width: `${100 / 8}%`, height: "50%" }}
                >
                  <div
                    className={classnames("display-wrapper", {
                      "is-emergency":
                        record && record.case === EMERGENCY_PROCEDURE,
                    })}
                  >
                    {record && (
                      <div className="is-flex flex-column">
                        <div className="is-flex-1">
                          {record.service} {record.case_order}{" "}
                          {record.classification} <br />{" "}
                          <span className="has-text-weight-bold">
                            {record.name}
                          </span>{" "}
                          <br />
                          {record.age} / {record.sex && record.sex.charAt(0)}
                          <br />
                          {record.ward}
                        </div>
                        <div
                          className="is-flex-1"
                          style={{
                            overflow: "hidden",
                          }}
                        >
                          {this.filterProcedure(record.procedure)}
                        </div>
                        <div className="is-flex-1">
                          {record.surgeon && (
                            <span>{this.getScreenName(record.surgeon)}</span>
                          )}{" "}
                          {record.main_anes && (
                            <span>
                              {" "}
                              / {this.getScreenName(record.main_anes)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="outline-full-bordered is-flex is-flex-2">
            <div className="outline-full-bordered accent is-flex">
              <div className="display-wrapper-accent">EMERGENCY OR</div>
            </div>
            <div
              className="outline-full-bordered is-flex"
              style={{
                flex: 8,
                flexFlow: "column  !important",
                flexWrap: "wrap",
              }}
            >
              {this.state.emergency_list.map((record) => {
                const backlog_hours =
                  record &&
                  record.date_time_ordered &&
                  moment
                    .duration(moment().diff(moment(record.date_time_ordered)))
                    .asHours();
                const is_backlog =
                  backlog_hours > 24 && record.case === EMERGENCY_PROCEDURE;
                return (
                  <div
                    className="outline-full-bordered is-flex"
                    style={{ width: `${100 / 8}%`, height: "50%" }}
                  >
                    <div
                      className={classnames("display-wrapper", {
                        "is-emergency":
                          record && record.case === EMERGENCY_PROCEDURE,
                        "is-backlog": is_backlog,
                      })}
                    >
                      {record && (
                        <div className="is-flex flex-column">
                          <div>
                            {record.service} {record.case_order}{" "}
                            {record.classification} <br />{" "}
                            <span className="has-text-weight-bold">
                              {record.name}
                            </span>{" "}
                            <br />
                            {record.age} / {record.sex && record.sex.charAt(0)}
                            <br />
                            {record.ward}
                          </div>
                          <div>{this.filterProcedure(record.procedure)}</div>
                          <div>
                            {record.surgeon && (
                              <span>{this.getScreenName(record.surgeon)}</span>
                            )}{" "}
                            {record.main_anes && (
                              <span>
                                {" "}
                                / {this.getScreenName(record.main_anes)}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="is-flex-1" style={{ margin: "1rem 0rem" }}>
          <Row>
            <Col span={1} className="display-footer-label">
              Charge Nurse:
            </Col>
            <Col span={3} className="display-footer-accent">
              {charge_nurse}
            </Col>

            <Col span={1} className="display-footer-label">
              Receiving Nurse:
            </Col>
            <Col span={3} className="display-footer-accent">
              {receiving_nurse}
            </Col>

            <Col span={1} className="display-footer-label">
              Holding Room Nurse:
            </Col>
            <Col span={3} className="display-footer-accent">
              {holding_room_nurse}
            </Col>

            <Col span={1} className="display-footer-label">
              24 hour duty:
            </Col>
            <Col span={3} className="display-footer-accent">
              {on_duty_anes}
            </Col>

            <Col span={1} className="display-footer-label">
              Team Captain:
            </Col>
            <Col span={3} className="display-footer-accent">
              {team_captain_anes}
            </Col>
            <Col span={1} className="display-footer-label">
              PACU:
            </Col>
            <Col span={3} className="display-footer-accent">
              {pacu_anes}
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

const mapToState = (state) => {
  return {
    auth: state.auth,
  };
};

export default connect(mapToState)(MainDisplay);
