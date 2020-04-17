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

const { Content } = Layout;

const collection_name = "surgeons";

const form_data = {
  [collection_name]: [],
  _id: "",
  records: [],
  period_covered: [],
  errors: {},
};

class ORLogs extends Component {
  state = {
    title: "Operating Room Logs",
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
    //this.getRecords();
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
      .post("/api/operating-room-slips/logs", form_data)
      .then((response) => {
        loading();
        this.setState({
          records: response.data,
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
        title: "Date/Hospital #/Classification",
        dataIndex: "date_time_of_surgery",
        render: (value, record) => (
          <div>
            {moment(record.date_time_of_surgery).format("LL")} <br />
            {record.hospital_number} <br />
            {record.classification} <br />
            {record.operating_room_number}
          </div>
        ),
      },
      {
        title: "Name of Patient/Age/Sex/Birthday/Address",
        dataIndex: "name",
        render: (value, record) => (
          <div>
            {value} <br />
            {record.age} {record.sex} {moment(record.date_of_birth).format("l")}{" "}
            <br />
            {record.address}
          </div>
        ),
      },
      {
        title: "Operation Performed",
        dataIndex: "operation_performed",
      },
      {
        title: "Tentative Diagnosis",
        dataIndex: "tentative_diagnosis",
      },
      {
        title: "Final Diagnosis",
        dataIndex: "final_diagnosis",
      },
      {
        title: "Surgeon",
        dataIndex: "surgeon.full_name",
      },
      {
        title: "Asst.",
        dataIndex: "assistant_surgeon.full_name",
      },
      {
        title: "Anaesth",
        dataIndex: "main_anes.full_name",
      },
      {
        title: "Scrub",
        dataIndex: "sponge_nurse.full_name",
      },
      {
        title: "Circulating",
        dataIndex: "instrument_nurse.full_name",
      },
      {
        title: "Time Ward Informed",
        dataIndex: "time_ward_informed",
        render: (value) => <span>{value && moment(value).format("lll")}</span>,
      },
      {
        title: "Arrival Time",
        dataIndex: "arrival_time",
        render: (value) => <span>{value && moment(value).format("lll")}</span>,
      },
      {
        title: "Room is Ready",
        dataIndex: "room_is_ready",
        render: (value) => <span>{value && moment(value).format("lll")}</span>,
      },
      {
        title: "Equip/Inst Ready",
        dataIndex: "equip_ready",
        render: (value) => <span>{value && moment(value).format("lll")}</span>,
      },
      {
        title: "Patient Placed in OR Table",
        dataIndex: "patient_placed_in_or_table",
        render: (value) => <span>{value && moment(value).format("lll")}</span>,
      },
      {
        title: "Time Anes Arrived",
        dataIndex: "time_anes_arrived",
        render: (value) => <span>{value && moment(value).format("lll")}</span>,
      },
      {
        title: "Induction Time",
        dataIndex: "induction_time",
        render: (value) => <span>{value && moment(value).format("lll")}</span>,
      },

      {
        title: "Induction Completed",
        dataIndex: "induction_completed",
        render: (value) => <span>{value && moment(value).format("lll")}</span>,
      },
      {
        title: "Time OR Started",
        dataIndex: "time_or_started",
        render: (value) => <span>{value && moment(value).format("lll")}</span>,
      },
      {
        title: "OR Ended",
        dataIndex: "or_ended",
        render: (value) => <span>{value && moment(value).format("lll")}</span>,
      },
      {
        title: "Trans Out from OR",
        dataIndex: "trans_out_from_or",
        render: (value) => <span>{value && moment(value).format("lll")}</span>,
      },
      {
        title: "Surgical Safety Checklist",
        dataIndex: "surgical_safety_checklist",
        render: (value) => <span>{value ? <Icon type="check" /> : ""}</span>,
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
            <Table
              className="is-scrollable small-table or-slip-table"
              dataSource={this.state.records}
              columns={records_column}
              rowKey={(record) => record._id}
              pagination={false}
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

export default connect(mapToState)(ORLogs);
