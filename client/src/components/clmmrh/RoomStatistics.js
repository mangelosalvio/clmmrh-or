import React, { Component } from "react";
import { connect } from "react-redux";
import axios from "axios";
import {
  Layout,
  Breadcrumb,
  Table,
  Icon,
  Row,
  Col,
  Button,
  PageHeader,
  message,
  Divider
} from "antd";
import { formItemLayout, smallFormItemLayout } from "./../../utils/Layouts";
import round from "./../../utils/round";
import RangeDatePickerFieldGroup from "../../commons/RangeDatePickerFieldGroup";
import moment from "moment";
import SelectFieldGroup from "../../commons/SelectFieldGroup";
import RadioGroupFieldGroup from "../../commons/RadioGroupFieldGroup";
import TextFieldGroup from "../../commons/TextFieldGroup";
import SimpleSelectFieldGroup from "../../commons/SimpleSelectFieldGroup";
import {
  operating_room_number_options,
  classification_options
} from "../../utils/Options";
import { sumBy } from "lodash";
import numeral from "numeral";
import ReactToPrint from "react-to-print";
const { Content } = Layout;

const collection_name = "surgeons";

const form_data = {
  [collection_name]: [],
  _id: "",
  records: [],
  period_covered: [],
  errors: {}
};

class RoomStatistics extends Component {
  state = {
    title: "Operating Room Statistics",
    url: "/api/surgeons/",
    search_keyword: "",
    ...form_data,
    options: {
      surgeons: [],
      anesthesiologists: [],
      nurses: [],
      rvs: [],
      patients: []
    },

    search_period_covered: [null, null],
    search_procedure: "",
    search_operating_room_number: "",
    search_main_anes: "",
    search_surgeon: "",
    search_classification: ""
  };

  componentDidMount() {}

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  onHide = () => {
    this.setState({ message: "" });
  };

  getRecords = () => {
    const {
      search_period_covered,
      search_operating_room_number,
      search_surgeon,
      search_procedure,
      search_classification,
      search_main_anes
    } = this.state;

    const form_data = {
      search_period_covered,
      search_operating_room_number,
      search_surgeon,
      search_procedure,
      search_classification,
      search_main_anes
    };
    const loading = message.loading("Loading...");

    axios
      .post("/api/operating-room-slips/room-statistics", form_data)
      .then(response => {
        loading();
        this.setState({
          records: response.data
        });
      })
      .catch(err => {
        loading();
        message.error("There was an error processing your request");
      });
  };

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

  onSurgeonSearch = value => {
    axios
      .get(`/api/surgeons/?s=${value}`)
      .then(response =>
        this.setState({
          options: {
            ...this.state.options,
            surgeons: response.data
          }
        })
      )
      .catch(err => console.log(err));
  };

  render() {
    const { errors } = this.state;
    const horizontal_total = numeral(0);

    return (
      <Content style={{ padding: "0 50px" }}>
        <div className="columns is-marginless">
          <div className="column">
            <Breadcrumb style={{ margin: "16px 0" }}>
              <Breadcrumb.Item>Home</Breadcrumb.Item>
              <Breadcrumb.Item>Room Statistics</Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </div>

        <div style={{ background: "#fff", padding: 24, minHeight: 280 }}>
          <span className="is-size-5">{this.state.title}</span> <hr />
          <Row>
            <Col span={24} className="m-b-1">
              <PageHeader
                backIcon={false}
                style={{
                  border: "1px solid rgb(235, 237, 240)"
                }}
                onBack={() => null}
                title="Advance Filter"
                subTitle="Enter appropriate data to filter records"
              >
                <div className="or-slip-form">
                  <Row>
                    <Col span={8}>
                      <RangeDatePickerFieldGroup
                        label="Date of Surgery"
                        name="period_covered"
                        value={this.state.search_period_covered}
                        onChange={dates =>
                          this.setState({ search_period_covered: dates })
                        }
                        error={errors.period_covered}
                        formItemLayout={smallFormItemLayout}
                      />
                    </Col>
                    <Col span={8}>
                      <SimpleSelectFieldGroup
                        label="OR Number"
                        name="search_operating_room_number"
                        value={this.state.search_operating_room_number}
                        onChange={value =>
                          this.setState({ search_operating_room_number: value })
                        }
                        formItemLayout={smallFormItemLayout}
                        error={errors.operating_room_number}
                        options={operating_room_number_options}
                      />
                    </Col>
                    <Col span={8}>
                      <SelectFieldGroup
                        label="Surgeon"
                        name="search_surgeon"
                        value={
                          this.state.search_surgeon &&
                          this.state.search_surgeon.full_name
                        }
                        onChange={index =>
                          this.setState({
                            search_surgeon: this.state.options.surgeons[index]
                          })
                        }
                        onSearch={this.onSurgeonSearch}
                        error={errors.search_surgeon}
                        formItemLayout={smallFormItemLayout}
                        data={this.state.options.surgeons}
                        column="full_name"
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <TextFieldGroup
                        label="Procedure"
                        name="search_procedure"
                        value={this.state.search_procedure}
                        error={errors.search_procedure}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                      />
                    </Col>
                    <Col span={8}>
                      <RadioGroupFieldGroup
                        label="Classification"
                        name="search_classification"
                        value={this.state.search_classification}
                        onChange={this.onChange}
                        error={errors.search_classification}
                        formItemLayout={smallFormItemLayout}
                        options={["All", ...classification_options]}
                      />
                    </Col>
                    <Col span={8}>
                      <SelectFieldGroup
                        label="Main Anes"
                        name="search_main_anes"
                        value={
                          this.state.search_main_anes &&
                          this.state.search_main_anes.full_name
                        }
                        onChange={index =>
                          this.setState({
                            search_main_anes: this.state.options
                              .anesthesiologists[index]
                          })
                        }
                        onSearch={this.onAnesSearch}
                        error={errors.search_main_anes}
                        formItemLayout={smallFormItemLayout}
                        data={this.state.options.anesthesiologists}
                        column="full_name"
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <Row>
                        <Col offset={8} span={12}>
                          <Button
                            style={{
                              marginRight: "8px"
                            }}
                            type="primary"
                            size="small"
                            icon="search"
                            onClick={() => this.getRecords()}
                          >
                            Search
                          </Button>
                          <ReactToPrint
                            trigger={() => (
                              <Button
                                type="primary"
                                size="small"
                                icon="printer"
                              >
                                Print
                              </Button>
                            )}
                            content={() => this.printableRef}
                            bodyClass="print"
                          />
                        </Col>
                      </Row>
                    </Col>
                    <Col span={8}></Col>
                    <Col span={8}></Col>
                  </Row>
                </div>
              </PageHeader>
            </Col>
          </Row>
          <div
            className="room-statistics"
            style={{ overflow: "auto" }}
            ref={el => (this.printableRef = el)}
          >
            <Row>
              <Col span={1}></Col>
              {operating_room_number_options.map(or_number => (
                <Col span={2} className="has-text-centered">
                  {or_number}
                </Col>
              ))}
            </Row>
            <Row>
              <Col span={1}>Date</Col>
              {operating_room_number_options.map(or_number => [
                <Col span={2}>
                  <Row>
                    <Col span={8} className="has-text-right">
                      IN
                    </Col>

                    <Col span={8} className="has-text-right">
                      OUT
                    </Col>

                    <Col span={8} className="has-text-right">
                      MINS
                    </Col>
                  </Row>
                </Col>
              ])}
            </Row>
            {this.state.records.map(record => {
              let total_room_mins = numeral(0);
              return [
                <Row gutter={8}>
                  <Col span={1}>{moment(record.date).format("MM/DD/YYYY")}</Col>
                  {operating_room_number_options.map(or_number => {
                    const item = record.items.find(
                      o => o.operating_room_number === or_number
                    );

                    if (item && item.times && item.times.length > 0) {
                      return (
                        <Col span={2}>
                          {item.times.map(time => {
                            return (
                              <Row gutter={8}>
                                <Col span={8} className="has-text-right">
                                  {moment(time.patient_in).format("h:mm A")}
                                </Col>
                                <Col span={8} className="has-text-right">
                                  {moment(time.patient_out).format("h:mm A")}
                                </Col>
                                <Col span={8} className="has-text-right">
                                  {round(time.mins)}
                                </Col>
                              </Row>
                            );
                          })}
                        </Col>
                      );
                    } else {
                      return <Col span={2}></Col>;
                    }
                  })}
                </Row>,
                <Row>
                  <Col span={24}>&nbsp;</Col>
                </Row>,
                <Row>
                  <Col span={1}></Col>
                  {operating_room_number_options.map(or_number => {
                    let total_mins = 0;
                    const item = record.items.find(
                      o => o.operating_room_number === or_number
                    );

                    if (item && item.times && item.times.length > 0) {
                      total_mins = round(sumBy(item.times, o => o.mins));
                      total_room_mins.add(total_mins);
                    }
                    return (
                      <Col span={2} className="subtotal">
                        {total_mins}
                      </Col>
                    );
                  })}
                  <Col span={1} className="subtotal">
                    {round(total_room_mins.value())}
                  </Col>
                </Row>,
                <Row>
                  <Col span={24}>&nbsp;</Col>
                </Row>
              ];
            })}
            <Row>
              <Col span={1}></Col>
              {operating_room_number_options.map(or_number => {
                const total = sumBy(this.state.records || [], o => {
                  return sumBy(
                    o.items.filter(
                      or => or.operating_room_number === or_number
                    ) || [],
                    item => {
                      return sumBy(item.times || [], o => o.mins);
                    }
                  );
                });
                horizontal_total.add(total);

                return (
                  <Col span={2} className="grandtotal">
                    {round(total)}
                  </Col>
                );
              })}
              <Col span={1} className="grandtotal">
                {round(horizontal_total.value())}
              </Col>
            </Row>
            ,
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

export default connect(mapToState)(RoomStatistics);
