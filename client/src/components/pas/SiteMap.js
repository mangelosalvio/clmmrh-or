import React, { Component } from "react";

import axios from "axios";
import { connect } from "react-redux";
import "../../styles/Autosuggest.css";
import sitemap from "./../../images/map.png";
import classnames from "classnames";
import logo from "./../../images/CISS.jpg";
import clmmrh_logo from "./../../images/clmmrh_logo.png";
import RecordRTC from "recordrtc";

import { Layout, Divider, Switch, notification, Icon } from "antd";

const delay = 1000;

const { Content } = Layout;

const form_data = {
  sound: null,
  errors: {},
  is_loading: false,
  is_recording: false,
  is_manually_switched: false,
  on_loop: false
};

let mediaRecorder;

/* let zones = [
  {
    name: "zone_1",
    label: "ADMIN AREA"
  },
  {
    name: "zone_2",
    label: "WEST TOWER AREA"
  },
  {
    name: "zone_3",
    label: "HERITAGE AREA"
  },
  {
    name: "zone_4",
    label: "MOTHER AND CHILD AREA"
  },
  {
    name: "zone_5",
    label: "REODICA HALL AREA"
  }
]; */
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

class SiteMap extends Component {
  state = {
    title: "Site Map",
    zones_selected: ["zone_1", "zone_2", "zone_3", "zone_4", "zone_5"],
    sound_options: [],
    ...form_data
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

  onSelectChange = e => {
    const selected_option = this.state.sound_options[e.target.value];

    this.setState({ [e.target.name]: selected_option });
  };

  onCheckboxChange = e => {
    const checked = e.target.checked ? true : false;
    this.setState({ [e.target.name]: checked });
  };

  onSelectChange = e => {
    const selected_option = this.state.sound_options[e.target.value];

    this.setState({ [e.target.name]: selected_option });
  };

  onManualSwitch = checked => {
    if (checked) {
      this.setState(
        {
          is_loading: false,
          is_recording: true,
          is_manually_switched: false
        },
        () => {
          this.handleAudio();
        }
      );
    } else {
      this.stopRecording();
      this.setState({
        is_loading: false,
        is_recording: false,
        is_manually_switched: false
      });
    }
  };

  onManualOverrideSwitch = checked => {
    this.turnOn()
      .then(data => {
        axios.put("/api/logs/manual-override-switch", data).then(response => {
          setTimeout(() => {
            this.setState({
              is_loading: false,
              is_recording: false,
              is_manually_switched: false
            });
          }, 500);
        });
      })
      .catch(err => console.log(err));
  };

  stopRecording = () => {
    mediaRecorder.stopRecording(audioURL => {
      var recordedBlob = mediaRecorder.getBlob();

      const fd = new FormData();
      fd.append("recorded_file", recordedBlob, "recorded.wav");
      fd.append("zones_selected", JSON.stringify(this.state.zones_selected));
      fd.append("user", JSON.stringify(this.props.auth.user));

      axios
        .put("/api/sounds/recorded", fd)
        .then(response => {
          console.log(response.data);
        })
        .catch(err => console.log(err));
    });
  };

  onStop = () => {
    axios
      .post(`/api/sounds/stop`)
      .then(() => {
        notification.open({
          message: "Success!",
          description: "Sound stopped",
          icon: <Icon type="check" style={{ color: "#108ee9" }} />
        });
      })
      .catch(err => console.log(err));
  };

  onPlay = () => {
    const form_data = {
      ...this.state,
      user: this.props.auth.user
    };

    this.setState(
      {
        is_loading: true,
        is_recording: false,
        is_manually_switched: false
      },
      () => {
        this.turnOn().then(response => {
          setTimeout(() => {
            axios
              .post(`/api/sounds/play/${this.state.sound._id}`, form_data)
              .then(sound => {
                notification.open({
                  message: "Success!",
                  description: "Sound played",
                  icon: <Icon type="check" style={{ color: "#108ee9" }} />
                });

                this.setState({
                  is_loading: false,
                  is_recording: false,
                  is_manually_switched: false
                });

                /* setTimeout(() => {
                  this.turnOff()
                    .then(response => {   
                    })
                    .catch(err => console.log(err));
                }, delay); */
              })
              .catch(err => console.log(err));
          }, delay);
        });
      }
    );
  };

  turnOn = () => {
    return new Promise((resolve, reject) => {
      const form_data = {
        zones_selected: this.state.zones_selected,
        user: this.props.auth.user,
        trigger: "ON"
      };

      axios
        .post("/zones", form_data)
        .then(response => resolve(response.data))
        .catch(err => reject(err));
    });
  };

  turnOff = () => {
    return new Promise((resolve, reject) => {
      const form_data = {
        zones_selected: [],
        user: this.props.auth.user,
        trigger: "OFF"
      };
      axios
        .post("/zones", form_data)
        .then(response => resolve(response.data))
        .catch(err => reject(err));
    });
  };

  handleAudio = () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: false
      })
      .then(this.handleSuccess)
      .catch(this.handleError);
  };

  handleSuccess = stream => {
    stream.oninactive = () => {
      console.log("Stream ended");
    };

    mediaRecorder = new RecordRTC(stream, {
      type: "audio",
      recorderType: RecordRTC.StereoAudioRecorder,
      mimeType: "audio/wav"
    });
    mediaRecorder.startRecording();
  };

  handleError = error => {
    console.log("navigator.getUserMedia error: ", error);
  };

  render() {
    return (
      <Content
        style={{
          background: "#fff",
          padding: 24,
          minHeight: 280
        }}
      >
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

            <div className="has-text-centered">
              <img src={clmmrh_logo} alt="Logo" style={{ height: "150px" }} />
            </div>
          </div>
          <div className="column is-5">
            <div className="field">
              {zones.map(zone => (
                <div className="control" key={zone.name}>
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      value={zone.name}
                      checked={this.state.zones_selected.includes(zone.name)}
                      onChange={this.onCheckboxZoneChange}
                    />
                    <span style={{ paddingLeft: "8px" }}>{zone.label}</span>
                  </label>
                </div>
              ))}
            </div>

            <Divider
              style={{
                marginTop: "68px"
              }}
            >
              PLAY AUDIO
            </Divider>

            <div className="field has-addons">
              <div className="control is-expanded">
                <div className="select is-fullwidth">
                  <select name="sound" onChange={this.onSelectChange}>
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
                    disabled={
                      this.state.is_loading ||
                      this.state.is_recording ||
                      this.state.is_manually_switched
                    }
                  >
                    Play
                  </button>
                </div>
              )}

              {this.state.sound && this.state.on_loop && (
                <div className="control">
                  <button
                    type="submit"
                    className="button is-danger"
                    onClick={this.onStop}
                    disabled={
                      this.state.is_loading ||
                      this.state.is_recording ||
                      this.state.is_manually_switched
                    }
                  >
                    Stop
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="checkbox">
                <input
                  type="checkbox"
                  name="on_loop"
                  checked={this.state.on_loop}
                  onChange={this.onCheckboxChange}
                  disabled={
                    this.state.is_loading ||
                    this.state.is_recording ||
                    this.state.is_manually_switched
                  }
                />
                <span style={{ paddingLeft: "8px" }}>Loop</span>
              </label>
            </div>

            <Divider
              style={{
                marginTop: "68px"
              }}
            >
              RECORDED AUDIO
            </Divider>

            <div className="field">
              <Switch
                checkedChildren="RECORD"
                unCheckedChildren="OFF"
                size="large"
                onChange={this.onManualSwitch}
                disabled={
                  this.state.is_loading || this.state.is_manually_switched
                }
              />

              <audio ref={input => (this.audioInput = input)} />
            </div>

            <Divider
              style={{
                marginTop: "68px"
              }}
            >
              MANUAL SWITCH
            </Divider>

            <div className="field">
              <input
                type="button"
                className="button"
                onClick={this.onManualOverrideSwitch}
                disabled={this.state.is_loading || this.state.is_recording}
                value="Activate Zones"
              />

              <audio ref={input => (this.audioInput = input)} />
            </div>
            <div className="has-text-centered">
              <img src={logo} alt="Logo" style={{ height: "60px" }} />
            </div>
          </div>
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

export default connect(mapToState)(SiteMap);
