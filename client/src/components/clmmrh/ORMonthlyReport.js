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
  Divider,
} from "antd";
import { smallFormItemLayout } from "./../../utils/Layouts";
import RangeDatePickerFieldGroup from "../../commons/RangeDatePickerFieldGroup";
import moment from "moment";
import SelectFieldGroup from "../../commons/SelectFieldGroup";
import RadioGroupFieldGroup from "../../commons/RadioGroupFieldGroup";
import TextFieldGroup from "../../commons/TextFieldGroup";
import SimpleSelectFieldGroup from "../../commons/SimpleSelectFieldGroup";
import {
  operating_room_number_options,
  classification_options,
} from "../../utils/Options";
import { sumBy } from "lodash";

const { Content } = Layout;

const collection_name = "surgeons";

const form_data = {
  [collection_name]: [],
  _id: "",
  major_records: [],
  minor_records: [],
  period_covered: [],
  errors: {},
};

class ORMonthlyReport extends Component {
  state = {
    title: "OR Monthly Report",
    url: "/api/surgeons/",
    search_keyword: "",
    ...form_data,
    options: {
      surgeons: [],
      anesthesiologists: [],
      nurses: [],
      rvs: [],
      patients: [],
    },

    search_period_covered: [null, null],
    search_procedure: "",
    search_operating_room_number: "",
    search_main_anes: "",
    search_surgeon: "",
    search_classification: "",
  };

  componentDidMount() {
    this.getRecords();
  }

  onChange = (e) => {
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
      search_main_anes,
    } = this.state;

    const form_data = {
      search_period_covered,
      search_operating_room_number,
      search_surgeon,
      search_procedure,
      search_classification,
      search_main_anes,
    };
    const loading = message.loading("Loading...");

    axios
      .post("/api/operating-room-slips/or-monthly-report", form_data)
      .then((response) => {
        loading();
        this.setState({
          major_records: response.data.major_records,
          minor_records: response.data.minor_records,
        });
      })
      .catch((err) => {
        loading();
        message.error("There was an error processing your request");
      });
  };

  onAnesSearch = (value) => {
    axios
      .get(`/api/anesthesiologists/?s=${value}`)
      .then((response) =>
        this.setState({
          options: {
            ...this.state.options,
            anesthesiologists: response.data,
          },
        })
      )
      .catch((err) => console.log(err));
  };

  onSurgeonSearch = (value) => {
    axios
      .get(`/api/surgeons/?s=${value}`)
      .then((response) =>
        this.setState({
          options: {
            ...this.state.options,
            surgeons: response.data,
          },
        })
      )
      .catch((err) => console.log(err));
  };

  render() {
    const records_column = [
      {
        title: "",
        dataIndex: "label",
        align: "center",
      },
      {
        title: "Male",
        dataIndex: "male",
        align: "center",
      },
      {
        title: "Female",
        dataIndex: "female",
        align: "center",
      },
      {
        title: "Total",
        dataIndex: "total",
        align: "center",
      },
    ];

    let major_records = [...this.state.major_records];

    const major_summary = {
      label: "Total",
      male: sumBy(major_records, (o) => o.male),
      female: sumBy(major_records, (o) => o.female),
      total: sumBy(major_records, (o) => o.total),
    };

    major_records = [
      ...major_records,
      {
        ...major_summary,
        footer: 1,
      },
    ];

    let minor_records = [...this.state.minor_records];

    const minor_summary = {
      label: "Total",
      male: sumBy(minor_records, (o) => o.male),
      female: sumBy(minor_records, (o) => o.female),
      total: sumBy(minor_records, (o) => o.total),
    };

    minor_records = [
      ...minor_records,
      {
        ...minor_summary,
        footer: 1,
      },
    ];

    const { errors } = this.state;

    return (
      <Content style={{ padding: "0 50px" }}>
        <div className="columns is-marginless">
          <div className="column">
            <Breadcrumb style={{ margin: "16px 0" }}>
              <Breadcrumb.Item>Home</Breadcrumb.Item>
              <Breadcrumb.Item>Reports</Breadcrumb.Item>
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
                  border: "1px solid rgb(235, 237, 240)",
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
                        onChange={(dates) =>
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
                        onChange={(value) =>
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
                        onChange={(index) =>
                          this.setState({
                            search_surgeon: this.state.options.surgeons[index],
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
                        onChange={(index) =>
                          this.setState({
                            search_main_anes: this.state.options
                              .anesthesiologists[index],
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
                            type="primary"
                            size="small"
                            icon="search"
                            onClick={() => this.getRecords()}
                          >
                            Search
                          </Button>
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
          <div style={{ overflow: "auto" }}>
            <div className="or-report-heading has-text-centered">
              NUMBER OF PATIENTS: MAJOR OPERATIONS
            </div>
            <Table
              className="is-scrollable  or-slip-table"
              bordered={true}
              dataSource={major_records}
              columns={records_column}
              rowKey={(record) => record._id}
              pagination={false}
              rowClassName={(record, index) => {
                if (record.footer === 1) {
                  return "footer-summary has-text-weight-bold";
                }
              }}
            />
            <Divider />
            <div className="or-report-heading has-text-centered">
              NUMBER OF PATIENTS: MINOR OPERATIONS
            </div>
            <Table
              className="is-scrollable  or-slip-table"
              bordered={true}
              dataSource={minor_records}
              columns={records_column}
              rowKey={(record) => record._id}
              pagination={false}
              rowClassName={(record, index) => {
                if (record.footer === 1) {
                  return "footer-summary has-text-weight-bold";
                }
              }}
            />
          </div>
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

export default connect(mapToState)(ORMonthlyReport);
