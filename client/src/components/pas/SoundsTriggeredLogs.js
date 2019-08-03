import React, { Component } from "react";
import axios from "axios";

import { DatePicker, Divider, Alert, Button } from "antd";
import { connect } from "react-redux";
import moment from "moment";
import ReactToPrint from "react-to-print";
const { RangePicker } = DatePicker;

const form_data = {};

class SoundsTriggeredLogs extends Component {
  state = {
    title: "Sounds Trigger Logs",
    url: "/api/logs/",
    search_keyword: "",
    errors: {},
    dates: [],
    records: [],
    ...form_data
  };

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  onSelectChange = name => {
    return value => {
      this.setState({ [name]: value });
    };
  };

  onSearch = e => {
    e.preventDefault();

    const form_data = {
      dates: this.state.dates
    };

    axios
      .post(`${this.state.url}/sounds-trigger`, form_data)
      .then(response =>
        this.setState({
          records: response.data,
          errors: {}
        })
      )
      .catch(err => this.setState({ errors: err.response.data }));
  };

  onDateRangeChange = (date, dateString) => {
    this.setState({
      dates: date
    });
  };

  playSound = record => {
    new Audio(`/${record.sound.location.path}`).play();
  };

  render() {
    const { errors } = this.state;

    return (
      <div className="container">
        <div style={{ marginTop: "1rem", marginRight: "1rem" }}>
          <span className="is-size-5 has-text-weight-bold">
            {this.state.title}
          </span>{" "}
          <div className="columns">
            <div className="column is-6">
              <Divider>SELECT DATE(S)</Divider>
              <RangePicker
                onChange={this.onDateRangeChange}
                value={this.state.dates}
              />
              <Button
                type="primary"
                className="m-l-1"
                icon="search"
                onClick={this.onSearch}
              >
                Search
              </Button>
              <ReactToPrint
                trigger={() => (
                  <Button type="primary" className="m-l-1" icon="printer">
                    Print
                  </Button>
                )}
                content={() => this.printableRef}
                bodyClass="print"
              />

              {errors.dates && (
                <Alert message={errors.dates} type="error" className="m-t-1" />
              )}
            </div>
          </div>
          <div ref={el => (this.printableRef = el)}>
            <div className="columns">
              <div className="column has-text-centered">
                SOUNDS TRIGGER LOGS
                {this.state.dates.length === 2 && (
                  <div>
                    from {moment(this.state.dates[0]).format("LL")} to{" "}
                    {moment(this.state.dates[1]).format("LL")}
                  </div>
                )}
              </div>
            </div>
            <div className="columns">
              <table className="table min-table full-width">
                <thead>
                  <tr>
                    <th>DATE</th>
                    <th>LOG</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {this.state.records.map(record => (
                    <tr key={record._id}>
                      <td>{moment(record.datetime_triggered).format("LLL")}</td>
                      <td>{record.log}</td>
                      <td>
                        <Button
                          shape="circle"
                          icon="sound"
                          onClick={() => this.playSound(record)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapToState = state => {
  return {
    auth: state.auth
  };
};

export default connect(mapToState)(SoundsTriggeredLogs);
