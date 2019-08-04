import React, { Component } from "react";
import { connect } from "react-redux";
import TextFieldGroup from "../../commons/TextFieldGroup";
import axios from "axios";
import isEmpty from "../../validation/is-empty";
import MessageBoxInfo from "../../commons/MessageBoxInfo";
import Searchbar from "../../commons/Searchbar";
import "../../styles/Autosuggest.css";

import { Layout, Breadcrumb, Form, Table, Icon, message } from "antd";

import { formItemLayout, tailFormItemLayout } from "./../../utils/Layouts";
import { gender_options, service_options } from "../../utils/Options";
import RadioGroupFieldGroup from "../../commons/RadioGroupFieldGroup";
import SelectFieldGroup from "../../commons/SelectFieldGroup";
import SimpleSelectFieldGroup from "../../commons/SimpleSelectFieldGroup";
import RangeDatePickerFieldGroup from "../../commons/RangeDatePickerFieldGroup";
import moment from "moment";

const { Content } = Layout;

const collection_name = "surgeons";

const form_data = {
  [collection_name]: [],
  _id: "",
  records: [],
  period_covered: [],
  errors: {}
};

class ORLogs extends Component {
  state = {
    title: "Operating Room Logs",
    url: "/api/surgeons/",
    search_keyword: "",
    ...form_data
  };

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  onHide = () => {
    this.setState({ message: "" });
  };

  getRecords = () => {
    const form_data = {
      period_covered: this.state.period_covered
    };
    axios.post("/api/operating-room-slips/logs", form_data).then(response =>
      this.setState({
        records: response.data
      })
    );
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
        )
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
        )
      },
      {
        title: "Operation Performed",
        dataIndex: "operation_performed"
      },
      {
        title: "Tentative Diagnosis",
        dataIndex: "tentative_diagnosis"
      },
      {
        title: "Final Diagnosis",
        dataIndex: "final_diagnosis"
      },
      {
        title: "Surgeon",
        dataIndex: "surgeon.full_name"
      },
      {
        title: "Asst.",
        dataIndex: "assistant_surgeon.full_name"
      },
      {
        title: "Anaesth",
        dataIndex: "main_anes.full_name"
      },
      {
        title: "Scrub",
        dataIndex: "sponge_nurse.full_name"
      },
      {
        title: "Circulating",
        dataIndex: "instrument_nurse.full_name"
      },
      {
        title: "Time Ward Informed",
        dataIndex: "time_ward_informed",
        render: value => <span>{moment(value).format("lll")}</span>
      },
      {
        title: "Arrival Time",
        dataIndex: "arrival_time",
        render: value => <span>{moment(value).format("lll")}</span>
      },
      {
        title: "Room is Ready",
        dataIndex: "room_is_ready",
        render: value => <span>{moment(value).format("lll")}</span>
      },
      {
        title: "Equip/Inst Ready",
        dataIndex: "equip_ready",
        render: value => <span>{moment(value).format("lll")}</span>
      },
      {
        title: "Patient Placed in OR Table",
        dataIndex: "patient_placed_in_or_table",
        render: value => <span>{moment(value).format("lll")}</span>
      },
      {
        title: "Time Anes Arrived",
        dataIndex: "time_anes_arrived",
        render: value => <span>{moment(value).format("lll")}</span>
      },
      {
        title: "Induction Time",
        dataIndex: "induction_time",
        render: value => <span>{moment(value).format("lll")}</span>
      },

      {
        title: "Induction Completed",
        dataIndex: "induction_completed",
        render: value => <span>{moment(value).format("lll")}</span>
      },
      {
        title: "Time OR Started",
        dataIndex: "time_or_started",
        render: value => <span>{moment(value).format("lll")}</span>
      },
      {
        title: "OR Ended",
        dataIndex: "or_ended",
        render: value => <span>{moment(value).format("lll")}</span>
      },
      {
        title: "Trans Out from OR",
        dataIndex: "trans_out_from_or",
        render: value => <span>{moment(value).format("lll")}</span>
      },
      {
        title: "Surgical Safety Checklist",
        dataIndex: "surgical_safety_checklist",
        render: value => <span>{moment(value).format("lll")}</span>
      }
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
          <RangeDatePickerFieldGroup
            label="Date of Surgery"
            name="period_covered"
            value={this.state.period_covered}
            onChange={dates =>
              this.setState({ period_covered: dates }, this.getRecords)
            }
            error={errors.period_covered}
            formItemLayout={formItemLayout}
          />
          <div style={{ overflow: "auto" }}>
            <Table
              className="is-scrollable"
              dataSource={this.state.records}
              columns={records_column}
              rowKey={record => record._id}
              pagination={false}
            />
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

export default connect(mapToState)(ORLogs);
