import React, { Component } from "react";
import { connect } from "react-redux";
import axios from "axios";
import "../../styles/Autosuggest.css";
import sitemap from "./../../images/map.png";
import classnames from "classnames";
import moment from "moment";
import isEmpty from "./../../validation/is-empty";
import {
  Layout,
  Breadcrumb,
  Divider,
  TimePicker,
  DatePicker,
  notification,
  Icon,
  Alert
} from "antd";

import TextFieldGroup from "../../commons/TextFieldGroup";
import Searchbar from "../../commons/Searchbar";
const { RangePicker } = DatePicker;

const { Content } = Layout;

const days_of_week = [
  {
    value: 0,
    label: "Sunday"
  },
  {
    value: 1,
    label: "Monday"
  },
  {
    value: 2,
    label: "Tuesday"
  },
  {
    value: 3,
    label: "Wednesday"
  },
  {
    value: 4,
    label: "Thursday"
  },
  {
    value: 5,
    label: "Friday"
  },
  {
    value: 6,
    label: "Saturday"
  }
];

let zones = [
  {
    name: "zone_1",
    label: "MOTHER AND CHILD AREA"
  },
  {
    name: "zone_2",
    label: "ADMIN AREA"
  },
  {
    name: "zone_3",
    label: "REODICA HALL AREA"
  },
  {
    name: "zone_4",
    label: "HERITAGE AREA"
  },
  {
    name: "zone_5",
    label: "WEST TOWER AREA"
  }
];

const collection_name = "schedules";

const form_data = {
  _id: "",
  label: "",
  sound: null,
  days_of_week_selected: [],
  zones_selected: [],
  dates: [],
  time: null,
  selected_sound_index: "",
  [collection_name]: [],
  errors: {}
};

class Schedule extends Component {
  state = {
    title: "Schedules",
    url: "/api/schedules/",
    ...form_data,
    search_keyword: "",
    sound_options: []
  };

  componentDidMount = () => {
    axios
      .get("/api/sounds")
      .then(response =>
        this.setState({
          sound_options: response.data
        })
      )
      .catch(err => console.log(err));
  };

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  getDayOfWeek = value => {
    const day = days_of_week.find(day => value === day.value);
    return day.label;
  };

  getDays = days_of_week_selected => {
    const days = days_of_week_selected.map(day => this.getDayOfWeek(day));
    return days.join(", ");
  };

  onCheckboxZoneChange = e => {
    let zones_selected;
    if (e.target.checked) {
      zones_selected = [...this.state.zones_selected, e.target.value];
    } else {
      zones_selected = [...this.state.zones_selected];
      const index = zones_selected.indexOf(e.target.value);
      zones_selected.splice(index, 1);
    }

    this.setState({ zones_selected });
  };

  onSelectMap = zone => {
    let zones_selected;
    if (this.state.zones_selected.includes(zone)) {
      //remove zone
      zones_selected = [...this.state.zones_selected];
      const index = zones_selected.indexOf(zone);
      zones_selected.splice(index, 1);
    } else {
      //add zone
      zones_selected = [...this.state.zones_selected, zone];
    }

    this.setState({ zones_selected });
  };

  onTimeChange = (time, timeString) => {
    this.setState({
      time
    });
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
          notification.open({
            message: "Success!",
            description: "Schedule saved",
            icon: <Icon type="check" style={{ color: "#108ee9" }} />
          });

          const time = moment(data.time);
          let dates = [];
          if (data.dates.length > 0) {
            dates = [moment(data.dates[0]), moment(data.dates[1])];
          }

          this.setState({
            ...data,
            time,
            dates,
            errors: {}
          });
        })
        .catch(err => this.setState({ errors: err.response.data }));
    } else {
      axios
        .post(this.state.url + this.state._id, form_data)
        .then(({ data }) => {
          notification.open({
            message: "Success!",
            description: "Schedule Updated",
            icon: <Icon type="check" style={{ color: "#108ee9" }} />
          });

          const time = moment(data.time);
          let dates = [];
          if (data.dates.length > 0) {
            dates = [moment(data.dates[0]), moment(data.dates[1])];
          }

          this.setState({
            ...data,
            time,
            dates,
            errors: {}
          });
        })
        .catch(err => this.setState({ errors: err.response.data }));
    }
  };

  onPlay = e => {
    e.preventDefault();
    new Audio(`/${this.state.sound.location.path}`).play();
  };

  onSelectChange = e => {
    console.log(e.target.value);
    const selected_option = this.state.sound_options[e.target.value];
    const selected_sound_index = e.target.value;
    this.setState({ [e.target.name]: selected_option, selected_sound_index });
  };

  isInDaysOfWeek = value => {
    return this.state.days_of_week_selected.includes(value);
  };

  onDayOfWeekChange = e => {
    let days_of_week_selected;
    if (e.target.checked) {
      days_of_week_selected = [
        ...this.state.days_of_week_selected,
        parseInt(e.target.value, 10)
      ];
    } else {
      days_of_week_selected = [...this.state.days_of_week_selected];
      const index = days_of_week_selected.indexOf(parseInt(e.target.value, 10));
      days_of_week_selected.splice(index, 1);
    }

    this.setState({ days_of_week_selected });
  };

  onDateRangeChange = (date, dateString) => {
    this.setState({
      dates: date
    });
  };

  addNew = () => {
    this.setState({
      ...form_data,
      errors: {}
    });
  };

  onSearch = e => {
    e.preventDefault();

    axios
      .get(this.state.url + "?s=" + this.state.search_keyword)
      .then(response => {
        if (isEmpty(response.data)) {
          notification.open({
            message: "Empty",
            description: "No rows found",
            icon: <Icon type="exclamation" style={{ color: "#108ee9" }} />
          });
        }

        this.setState({
          [collection_name]: response.data,
          message: isEmpty(response.data) ? "No rows found" : ""
        });
      })
      .catch(err => console.log(err));
  };

  onDelete = () => {
    axios
      .delete(this.state.url + this.state._id)
      .then(response => {
        notification.open({
          message: "Success!",
          description: "Schedule deleted",
          icon: <Icon type="check" style={{ color: "#108ee9" }} />
        });
        this.setState({
          ...form_data
        });
      })
      .catch(err => console.log(err));
  };

  edit = record => {
    axios
      .get(this.state.url + record._id)
      .then(response => {
        const record = response.data;

        const time = moment(record.time);
        let dates = [];
        if (record.dates.length > 0) {
          dates = [moment(record.dates[0]), moment(record.dates[1])];
        }

        const selected_sound_index = this.state.sound_options.findIndex(
          sound => {
            return sound.label === record.sound.label;
          }
        );

        this.setState(prevState => {
          return {
            [collection_name]: [],
            ...record,
            time,
            dates,
            selected_sound_index,
            errors: {}
          };
        });
      })
      .catch(err => console.log(err));
  };

  render() {
    const { errors } = this.state;

    return (
      <Content
        style={{
          background: "#fff",
          padding: 24
        }}
        className="is-full-height-vh"
      >
        <div className="columns is-marginless">
          <div className="column">
            <Breadcrumb style={{ margin: "16px 0" }}>
              <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
              <Breadcrumb.Item>Schedule</Breadcrumb.Item>
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
        {this.state[collection_name].length > 0 && (
          <table className="table is-fullwidth is-striped is-hoverable min-table">
            <thead>
              <tr>
                <th>#</th>
                <th>LABEL</th>
                <th>SOUND</th>
                <th>DAY OF WEEK</th>
                <th>DATE(S)</th>
                <th>TIME</th>
                <th>LATEST LOG</th>
              </tr>
            </thead>
            <tbody>
              {this.state[collection_name].map((record, index) => (
                <tr key={record._id} onClick={() => this.edit(record)}>
                  <td>{index + 1}</td>
                  <td>{record.label}</td>
                  <td>{record.sound.label}</td>
                  <td>{this.getDays(record.days_of_week_selected)}</td>
                  <td>
                    {moment(record.dates[0]).format("ll")} -{" "}
                    {moment(record.dates[1]).format("ll")}
                  </td>
                  <td>{moment(record.time).format("HH:mm")}</td>
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
        {this.state[collection_name].length <= 0 && (
          <div className="columns">
            <div className="column">
              <div
                className="img-overlay-wrap"
                style={{
                  backgroundImage: `url(${sitemap})`,
                  width: 550,
                  height: 534
                }}
              >
                <svg width="550" height="534" viewBox="0 0 366.66666 356">
                  {/* WEST TOWER */}
                  <path
                    d="m 169.85461,128.26432 -30.94006,72.61443 9.68193,3.99905 c 7.65975,-5.21129 11.77918,-4.85923 15.57527,-3.99905 l 3.36762,-6.94573 3.78858,1.05238 c 2.94973,-1.94007 5.53625,-2.60891 7.36668,-0.63143 l 3.15715,-5.47239 -3.36762,-9.68192 10.52383,-23.3629 -4.42001,-2.7362 6.73525,-15.78575 -2.31524,-1.89428 2.31524,-6.10383 -12.20765,-0.21047 -0.8419,3.15715 z"
                    className={classnames({
                      is_selected: this.state.zones_selected.includes("zone_5")
                    })}
                    onClick={() => this.onSelectMap("zone_5")}
                    fill="#000"
                    fillOpacity="0.1"
                    stroke="#000"
                  />

                  {/* REODICA HALL AREA */}
                  <path
                    d="m 95.977329,131.00052 38.727691,15.78574 -1.89429,3.78858 17.04861,7.1562 -27.57244,61.66965 -7.1562,-8.20859 -16.838129,-7.78763 -6.945727,5.47239 -1.683813,5.05144 -5.682868,-4.84097 15.154315,-38.30674 -4.420009,-11.99716 -8.208587,-3.78858 z"
                    id="path27"
                    className={classnames({
                      is_selected: this.state.zones_selected.includes("zone_3")
                    })}
                    onClick={() => this.onSelectMap("zone_3")}
                    fill="#000"
                    fillOpacity="0.1"
                    stroke="#000"
                  />

                  {/* MOTHER AND CHILD */}
                  <path
                    d="m 112.81271,217.88629 -26.193982,59.23411 158.949832,64.29432 13.69231,-41.67224 -22.02676,-20.24081 -21.13378,-12.20401 -21.72909,-16.37124 -23.2174,-10.1204 z"
                    id="path29"
                    className={classnames({
                      is_selected: this.state.zones_selected.includes("zone_1")
                    })}
                    onClick={() => this.onSelectMap("zone_1")}
                    fill="#000"
                    fillOpacity="0.1"
                    stroke="#000"
                  />

                  {/* HERITAGE */}
                  <path
                    d="m 205.68227,159.24749 -14.58528,36.01673 -5.0602,-1.78596 -5.65552,15.1806 2.97659,2.38128 -5.0602,11.60869 2.97659,1.78595 -6.25084,14.88295 31.25418,13.39465 24.11037,14.58528 35.4214,-88.10702 z"
                    id="path31"
                    className={classnames({
                      is_selected: this.state.zones_selected.includes("zone_4")
                    })}
                    onClick={() => this.onSelectMap("zone_4")}
                    fill="#000"
                    fillOpacity="0.1"
                    stroke="#000"
                  />

                  {/* ADMIN AREA */}
                  <path
                    d="m 100.60869,90.488297 3.27425,26.789293 34.52843,-2.67893 8.33445,2.67893 35.71906,7.14382 25.00335,3.86956 27.38461,-10.71572 33.63545,-47.030096 -6.25083,-9.822743 -4.16723,-1.488294 -19.94314,-27.682274 -35.42141,-5.357859 -40.77926,2.083612 -2.38127,11.311036 10.71572,18.752509 19.64548,7.73913 -6.25083,22.919732 -48.22074,-4.167224 z"
                    id="path33"
                    className={classnames({
                      is_selected: this.state.zones_selected.includes("zone_2")
                    })}
                    onClick={() => this.onSelectMap("zone_2")}
                    fill="#000"
                    fillOpacity="0.1"
                    stroke="#000"
                  />
                </svg>
              </div>
            </div>
            <div className="column is-5">
              <form onSubmit={this.onSubmit}>
                <TextFieldGroup
                  label="Label"
                  name="label"
                  value={this.state.label}
                  onChange={this.onChange}
                  error={errors.label}
                  placeholder="Schedule Name"
                />

                <Divider>SELECT ZONE</Divider>
                <div className="field">
                  {zones.map(zone => (
                    <div className="control" key={zone.name}>
                      <label className="checkbox">
                        <input
                          type="checkbox"
                          value={zone.name}
                          checked={this.state.zones_selected.includes(
                            zone.name
                          )}
                          onChange={this.onCheckboxZoneChange}
                        />
                        <span style={{ paddingLeft: "8px" }}>{zone.label}</span>
                      </label>
                    </div>
                  ))}

                  {errors.zones_selected && (
                    <Alert
                      message={errors.zones_selected}
                      type="error"
                      className="m-t-1"
                    />
                  )}
                </div>

                <Divider>SELECT AUDIO FILE</Divider>
                <div className="field has-addons">
                  <div className="control is-expanded">
                    <div className="select is-fullwidth">
                      <select
                        name="sound"
                        onChange={this.onSelectChange}
                        value={this.state.selected_sound_index}
                      >
                        <option value={null}>Select Option</option>
                        {this.state.sound_options.map((option, index) => (
                          <option key={index} value={index}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {this.state.sound && (
                    <div className="control">
                      <button
                        type="submit"
                        className="button is-primary"
                        onClick={this.onPlay}
                      >
                        Play
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  {errors.sound && (
                    <Alert
                      message={errors.sound}
                      type="error"
                      className="m-t-1"
                    />
                  )}
                </div>
                <div className="columns">
                  <div className="column">
                    <Divider>SELECT DAY OF WEEK</Divider>
                    <div className="field">
                      {days_of_week.map((day, index) => (
                        <div key={index}>
                          <label className="checkbox">
                            <input
                              type="checkbox"
                              value={day.value}
                              checked={this.isInDaysOfWeek(day.value)}
                              onChange={this.onDayOfWeekChange}
                            />
                            {day.label}
                          </label>
                        </div>
                      ))}
                    </div>

                    {errors.days_of_week_selected && (
                      <Alert
                        message={errors.days_of_week_selected}
                        type="error"
                        className="m-t-1"
                      />
                    )}
                  </div>
                  <div className="column has-text-centered">
                    <Divider>SELECT DATE(S)</Divider>
                    <RangePicker
                      onChange={this.onDateRangeChange}
                      value={this.state.dates}
                    />
                    {errors.dates && (
                      <Alert
                        message={errors.dates}
                        type="error"
                        className="m-t-1"
                      />
                    )}
                    <Divider>SELECT TIME</Divider>
                    <TimePicker
                      onChange={this.onTimeChange}
                      format="HH:mm"
                      value={this.state.time}
                    />
                    {errors.time && (
                      <Alert
                        message={errors.time}
                        type="error"
                        className="m-t-1"
                      />
                    )}
                  </div>
                </div>

                <div className="field is-grouped">
                  <div className="control">
                    <button className="button is-primary ">Save</button>
                  </div>
                  {!isEmpty(this.state._id) && (
                    <a
                      className="button is-danger is-outlined "
                      onClick={this.onDelete}
                    >
                      <span>Delete</span>
                      <span className="icon ">
                        <i className="fas fa-times" />
                      </span>
                    </a>
                  )}
                </div>
              </form>
            </div>
          </div>
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

export default connect(mapToState)(Schedule);
