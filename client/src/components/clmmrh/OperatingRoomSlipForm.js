import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import TextFieldGroup from "../../commons/TextFieldGroup";
import axios from "axios";
import isEmpty from "../../validation/is-empty";
import MessageBoxInfo from "../../commons/MessageBoxInfo";
import Searchbar from "../../commons/Searchbar";
import "../../styles/Autosuggest.css";
import {
  Layout,
  Breadcrumb,
  Form,
  Table,
  Icon,
  message,
  Divider,
  Tabs
} from "antd";
import { formItemLayout, tailFormItemLayout } from "./../../utils/Layouts";
import DatePickerFieldGroup from "../../commons/DatePickerFieldGroup";
import TextAreaGroup from "../../commons/TextAreaGroup";
import RadioGroupFieldGroup from "../../commons/RadioGroupFieldGroup";
import {
  payment_types,
  lot_status,
  case_options,
  classification_options,
  gender_options,
  service_options,
  case_order_options,
  operation_type_options,
  laterality_options,
  operating_room_number_options,
  operation_status_options
} from "../../utils/Options";
import moment from "moment";
import SelectFieldGroup from "../../commons/SelectFieldGroup";
import SimpleSelectFieldGroup from "../../commons/SimpleSelectFieldGroup";

const { Content } = Layout;
const TabPane = Tabs.TabPane;

const collection_name = "slips";

const form_data = {
  [collection_name]: [],
  _id: "",

  name: "",
  age: "",
  address: "",
  sex: "",
  weight: "",
  hospital_number: "",
  ward: "",
  registration_date: null,
  service: "",
  diagnosis: "",
  procedure: "",
  case: "",
  surgeon: "",
  classification: "",
  date_time_ordered: null,
  date_time_received: null,
  date_time_of_surgery: null,
  case_order: "",
  received_by: "",

  operation_type: "",
  operation_status: "",
  main_anes: "",
  laterality: "",
  operating_room_number: "",

  assistant_surgeon: "",
  instrument_nurse: "",
  sponge_nurse: "",
  anes_method: "",
  anes_used: "",
  anes_quantity: "",
  anes_route: "",
  anes_start: null,
  operation_started: null,
  operation_finished: null,
  tentative_diagnosis: "",
  final_diagnosis: "",
  before_operation: "",
  during_operation: "",
  after_operation: "",
  complications_during_operation: "",
  complications_after_operation: "",
  operation_performed: "",
  position_in_bed: "",
  proctoclysis: "",
  hypodermoclysis: "",
  nutrition: "",
  stimulant: "",
  asa: "",

  errors: {}
};

class OperatingRoomSlipForm extends Component {
  state = {
    title: "Operating Room Form",
    url: "/api/operating-room-slips/",
    search_keyword: "",
    ...form_data,
    options: {
      surgeons: [],
      anesthesiologists: [],
      nurses: []
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

    const loading = message.loading("Processing...");
    if (isEmpty(this.state._id)) {
      axios
        .put(this.state.url, form_data)
        .then(({ data }) => {
          const {
            registration_date,
            date_time_ordered,
            date_time_of_surgery,
            date_time_received,
            anes_start,
            operation_started,
            operation_finished
          } = data;

          message.success("Transaction Saved");
          loading();
          this.setState({
            ...form_data,
            ...data,
            registration_date: registration_date
              ? moment(registration_date)
              : null,
            date_time_ordered: date_time_ordered
              ? moment(date_time_ordered)
              : null,
            date_time_received: date_time_received
              ? moment(date_time_received)
              : null,
            date_time_of_surgery: date_time_of_surgery
              ? moment(date_time_of_surgery)
              : null,
            anes_start: anes_start ? moment(anes_start) : null,
            operation_started: operation_started
              ? moment(operation_started)
              : null,
            operation_finished: operation_finished
              ? moment(operation_finished)
              : null,
            errors: {}
          });
        })
        .catch(err => {
          loading();
          message.error("You have an invalid input");
          this.setState({ errors: err.response.data });
        });
    } else {
      axios
        .post(this.state.url + this.state._id, form_data)
        .then(({ data }) => {
          const {
            registration_date,
            date_time_ordered,
            date_time_received,
            date_time_of_surgery,
            anes_start,
            operation_started,
            operation_finished
          } = data;

          loading(0);
          message.success("Transaction Updated");
          this.setState({
            ...form_data,
            ...data,
            registration_date: registration_date
              ? moment(registration_date)
              : null,
            date_time_ordered: date_time_ordered
              ? moment(date_time_ordered)
              : null,
            date_time_received: date_time_received
              ? moment(date_time_received)
              : null,
            date_time_of_surgery: date_time_of_surgery
              ? moment(date_time_of_surgery)
              : null,
            anes_start: anes_start ? moment(anes_start) : null,
            operation_started: operation_started
              ? moment(operation_started)
              : null,
            operation_finished: operation_finished
              ? moment(operation_finished)
              : null,
            errors: {}
          });
        })
        .catch(err => {
          loading();
          message.error("You have an error");
          this.setState({ errors: err.response.data });
        });
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
        const {
          registration_date,
          date_time_ordered,
          date_time_of_surgery,
          date_time_received,
          anes_start,
          operation_started,
          operation_finished
        } = response.data;
        this.setState(prevState => {
          return {
            ...form_data,
            [collection_name]: [],
            ...record,
            registration_date: registration_date
              ? moment(registration_date)
              : null,
            date_time_ordered: date_time_ordered
              ? moment(date_time_ordered)
              : null,
            date_time_received: date_time_received
              ? moment(date_time_received)
              : null,
            date_time_of_surgery: date_time_of_surgery
              ? moment(date_time_of_surgery)
              : null,
            anes_start: anes_start ? moment(anes_start) : null,
            operation_started: operation_started
              ? moment(operation_started)
              : null,
            operation_finished: operation_finished
              ? moment(operation_finished)
              : null,
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
        this.props.history.push("/map");
      })
      .catch(err => {
        message.error(err.response.data.message);
      });
  };

  onHide = () => {
    this.setState({ message: "" });
  };

  /**
   * SURGEONS
   */

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

  onSurgeonChange = (index, name) => {
    this.setState(prevState => {
      return {
        [name]: prevState.options.surgeons[index]
      };
    });
  };

  /**
   * NURSES
   */

  onNurseSearch = value => {
    axios
      .get(`/api/nurses/?s=${value}`)
      .then(response =>
        this.setState({
          options: {
            ...this.state.options,
            nurses: response.data
          }
        })
      )
      .catch(err => console.log(err));
  };

  onNurseChange = (index, name) => {
    this.setState(prevState => {
      return {
        [name]: prevState.options.nurses[index]
      };
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

  onAnesChange = index => {
    this.setState(prevState => {
      return {
        main_anes: prevState.options.anesthesiologists[index]
      };
    });
  };

  render() {
    const records_column = [
      {
        title: "Patient Name",
        dataIndex: "name"
      },
      {
        title: "Age",
        dataIndex: "age"
      },
      {
        title: "Sex",
        dataIndex: "sex"
      },
      {
        title: "Weight",
        dataIndex: "weight"
      },
      {
        title: "Service",
        dataIndex: "service"
      },
      {
        title: "Ward",
        dataIndex: "ward"
      },
      {
        title: "Date Ordered",
        dataIndex: "date_time_ordered",
        render: value => {
          return moment(value).format("L");
        }
      },
      {
        title: "Date of Surgery",
        dataIndex: "date_time_of_surgery",
        render: value => {
          return moment(value).format("L");
        }
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

    const { errors } = this.state;

    return (
      <Content className="content">
        <div className="columns is-marginless">
          <div className="column">
            <Breadcrumb style={{ margin: "16px 0" }}>
              <Breadcrumb.Item>Home</Breadcrumb.Item>
              <Breadcrumb.Item>Operating Room Slip</Breadcrumb.Item>
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
            <Form onSubmit={this.onSubmit} className="tab-content">
              <Tabs>
                <TabPane tab="Operating Complex Receiving" key="1">
                  <Divider orientation="left">Patient Information</Divider>
                  <TextFieldGroup
                    label="Name"
                    name="name"
                    value={this.state.name}
                    error={errors.name}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextFieldGroup
                    label="Age"
                    name="age"
                    value={this.state.age}
                    error={errors.age}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <RadioGroupFieldGroup
                    label="Sex"
                    name="sex"
                    value={this.state.sex}
                    onChange={this.onChange}
                    error={errors.sex}
                    formItemLayout={formItemLayout}
                    options={gender_options}
                  />

                  <TextFieldGroup
                    label="Weight"
                    name="weight"
                    value={this.state.weight}
                    error={errors.weight}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextAreaGroup
                    label="Address"
                    name="address"
                    value={this.state.address}
                    error={errors.address}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <DatePickerFieldGroup
                    label="Registration Date"
                    name="registration_date"
                    value={this.state.registration_date}
                    onChange={value =>
                      this.setState({ registration_date: value })
                    }
                    error={errors.registration_date}
                    formItemLayout={formItemLayout}
                  />

                  <TextFieldGroup
                    label="Hospital #"
                    name="hospital_number"
                    value={this.state.hospital_number}
                    error={errors.hospital_number}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextFieldGroup
                    label="Ward"
                    name="ward"
                    value={this.state.ward}
                    error={errors.ward}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <SimpleSelectFieldGroup
                    label="Service"
                    name="service"
                    value={this.state.service}
                    onChange={value => this.setState({ service: value })}
                    formItemLayout={formItemLayout}
                    error={errors.service}
                    options={service_options}
                  />

                  <Divider orientation="left">Surgical Procedures</Divider>

                  <TextAreaGroup
                    label="Diagnosis"
                    name="diagnosis"
                    value={this.state.diagnosis}
                    error={errors.diagnosis}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextAreaGroup
                    label="Procedure"
                    name="procedure"
                    value={this.state.procedure}
                    error={errors.procedure}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <RadioGroupFieldGroup
                    label="Case"
                    name="case"
                    value={this.state.case}
                    onChange={this.onChange}
                    error={errors.case}
                    formItemLayout={formItemLayout}
                    options={case_options}
                  />

                  <RadioGroupFieldGroup
                    label="Classification"
                    name="classification"
                    value={this.state.classification}
                    onChange={this.onChange}
                    error={errors.classification}
                    formItemLayout={formItemLayout}
                    options={classification_options}
                  />

                  <SelectFieldGroup
                    label="Surgeon"
                    name="surgeon"
                    value={this.state.surgeon && this.state.surgeon.full_name}
                    onChange={index => this.onSurgeonChange(index, "surgeon")}
                    onSearch={this.onSurgeonSearch}
                    error={errors.surgeon}
                    formItemLayout={formItemLayout}
                    data={this.state.options.surgeons}
                    column="full_name"
                  />

                  <DatePickerFieldGroup
                    label="Date/Time Ordered"
                    name="date_time_ordered"
                    value={this.state.date_time_ordered}
                    onChange={value =>
                      this.setState({ date_time_ordered: value })
                    }
                    error={errors.date_time_ordered}
                    formItemLayout={formItemLayout}
                    showTime={true}
                  />

                  <DatePickerFieldGroup
                    label="Date/Time Received"
                    name="date_time_received"
                    value={this.state.date_time_received}
                    onChange={value =>
                      this.setState({ date_time_received: value })
                    }
                    error={errors.date_time_received}
                    formItemLayout={formItemLayout}
                    showTime={true}
                  />

                  <DatePickerFieldGroup
                    label="Date/Time of Surgery"
                    name="date_time_of_surgery"
                    value={this.state.date_time_of_surgery}
                    onChange={value =>
                      this.setState({ date_time_of_surgery: value })
                    }
                    error={errors.date_time_of_surgery}
                    formItemLayout={formItemLayout}
                    showTime={true}
                  />

                  <SimpleSelectFieldGroup
                    label="Case Order"
                    name="case_order"
                    value={this.state.case_order}
                    onChange={value => this.setState({ case_order: value })}
                    formItemLayout={formItemLayout}
                    error={errors.case_order}
                    options={case_order_options}
                  />

                  <TextFieldGroup
                    label="Received By"
                    name="received_by"
                    value={this.state.received_by}
                    error={errors.received_by}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <Form.Item className="m-t-1" {...tailFormItemLayout}>
                    <div className="field is-grouped">
                      <div className="control">
                        <button className="button is-small is-primary">
                          Save
                        </button>
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
                </TabPane>
                <TabPane tab="Pre Operation" key="2">
                  <Divider orientation="left">Patient Information</Divider>
                  <TextFieldGroup
                    label="Name"
                    name="name"
                    value={this.state.name}
                    error={errors.name}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextFieldGroup
                    label="Age"
                    name="age"
                    value={this.state.age}
                    error={errors.age}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <RadioGroupFieldGroup
                    label="Sex"
                    name="sex"
                    value={this.state.sex}
                    onChange={this.onChange}
                    error={errors.sex}
                    formItemLayout={formItemLayout}
                    options={gender_options}
                  />

                  <TextFieldGroup
                    label="Weight"
                    name="weight"
                    value={this.state.weight}
                    error={errors.weight}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextAreaGroup
                    label="Address"
                    name="address"
                    value={this.state.address}
                    error={errors.address}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <DatePickerFieldGroup
                    label="Registration Date"
                    name="registration_date"
                    value={this.state.registration_date}
                    onChange={value =>
                      this.setState({ registration_date: value })
                    }
                    error={errors.registration_date}
                    formItemLayout={formItemLayout}
                  />

                  <TextFieldGroup
                    label="Hospital #"
                    name="hospital_number"
                    value={this.state.hospital_number}
                    error={errors.hospital_number}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextFieldGroup
                    label="Ward"
                    name="ward"
                    value={this.state.ward}
                    error={errors.ward}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <SimpleSelectFieldGroup
                    label="Service"
                    name="service"
                    value={this.state.service}
                    onChange={value => this.setState({ service: value })}
                    formItemLayout={formItemLayout}
                    error={errors.service}
                    options={service_options}
                  />

                  <Divider orientation="left">Surgical Procedures</Divider>

                  <TextAreaGroup
                    label="Diagnosis"
                    name="diagnosis"
                    value={this.state.diagnosis}
                    error={errors.diagnosis}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextAreaGroup
                    label="Procedure"
                    name="procedure"
                    value={this.state.procedure}
                    error={errors.procedure}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <SelectFieldGroup
                    label="Surgeon"
                    name="surgeon"
                    value={this.state.surgeon && this.state.surgeon.full_name}
                    onChange={index => this.onSurgeonChange(index, "surgeon")}
                    onSearch={this.onSurgeonSearch}
                    error={errors.surgeon}
                    formItemLayout={formItemLayout}
                    data={this.state.options.surgeons}
                    column="full_name"
                  />

                  <SelectFieldGroup
                    label="Main Anes"
                    name="main_anes"
                    value={
                      this.state.main_anes && this.state.main_anes.full_name
                    }
                    onChange={this.onAnesChange}
                    onSearch={this.onAnesSearch}
                    error={errors.main_anes}
                    formItemLayout={formItemLayout}
                    data={this.state.options.anesthesiologists}
                    column="full_name"
                  />

                  <RadioGroupFieldGroup
                    label="Operation Type"
                    name="operation_type"
                    value={this.state.operation_type}
                    onChange={this.onChange}
                    error={errors.operation_type}
                    formItemLayout={formItemLayout}
                    options={operation_type_options}
                  />

                  <RadioGroupFieldGroup
                    label="Laterality"
                    name="laterality"
                    value={this.state.laterality}
                    onChange={this.onChange}
                    error={errors.laterality}
                    formItemLayout={formItemLayout}
                    options={laterality_options}
                  />

                  <SimpleSelectFieldGroup
                    label="Status"
                    name="operation_status"
                    value={this.state.operation_status}
                    onChange={value =>
                      this.setState({ operation_status: value })
                    }
                    formItemLayout={formItemLayout}
                    error={errors.operation_status}
                    options={operation_status_options}
                  />

                  <SimpleSelectFieldGroup
                    label="OR Number"
                    name="operating_room_number"
                    value={this.state.operating_room_number}
                    onChange={value =>
                      this.setState({ operating_room_number: value })
                    }
                    formItemLayout={formItemLayout}
                    error={errors.operating_room_number}
                    options={operating_room_number_options}
                  />

                  <Form.Item className="m-t-1" {...tailFormItemLayout}>
                    <div className="field is-grouped">
                      <div className="control">
                        <button className="button is-small is-primary">
                          Save
                        </button>
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
                </TabPane>
                <TabPane tab="Post Operation" key="3">
                  <Divider orientation="left">Patient Information</Divider>
                  <TextFieldGroup
                    label="Name"
                    name="name"
                    value={this.state.name}
                    error={errors.name}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextFieldGroup
                    label="Age"
                    name="age"
                    value={this.state.age}
                    error={errors.age}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <RadioGroupFieldGroup
                    label="Sex"
                    name="sex"
                    value={this.state.sex}
                    onChange={this.onChange}
                    error={errors.sex}
                    formItemLayout={formItemLayout}
                    options={gender_options}
                  />

                  <TextFieldGroup
                    label="Weight"
                    name="weight"
                    value={this.state.weight}
                    error={errors.weight}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextAreaGroup
                    label="Address"
                    name="address"
                    value={this.state.address}
                    error={errors.address}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <DatePickerFieldGroup
                    label="Registration Date"
                    name="registration_date"
                    value={this.state.registration_date}
                    onChange={value =>
                      this.setState({ registration_date: value })
                    }
                    error={errors.registration_date}
                    formItemLayout={formItemLayout}
                  />

                  <TextFieldGroup
                    label="Hospital #"
                    name="hospital_number"
                    value={this.state.hospital_number}
                    error={errors.hospital_number}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextFieldGroup
                    label="ASA"
                    name="asa"
                    value={this.state.asa}
                    error={errors.asa}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextFieldGroup
                    label="Ward"
                    name="ward"
                    value={this.state.ward}
                    error={errors.ward}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <SimpleSelectFieldGroup
                    label="Service"
                    name="service"
                    value={this.state.service}
                    onChange={value => this.setState({ service: value })}
                    formItemLayout={formItemLayout}
                    error={errors.service}
                    options={service_options}
                  />

                  <Divider orientation="left">Surgical Procedures</Divider>

                  <SelectFieldGroup
                    label="Main Surgeon"
                    name="surgeon"
                    value={this.state.surgeon && this.state.surgeon.full_name}
                    onChange={index => this.onSurgeonChange(index, "surgeon")}
                    onSearch={this.onSurgeonSearch}
                    error={errors.surgeon}
                    formItemLayout={formItemLayout}
                    data={this.state.options.surgeons}
                    column="full_name"
                  />

                  <SelectFieldGroup
                    label="Asst. Surgeon"
                    name="assistant_surgeon"
                    value={
                      this.state.assistant_surgeon &&
                      this.state.assistant_surgeon.full_name
                    }
                    onChange={index =>
                      this.onSurgeonChange(index, "assistant_surgeon")
                    }
                    onSearch={this.onSurgeonSearch}
                    error={errors.assistant_surgeon}
                    formItemLayout={formItemLayout}
                    data={this.state.options.surgeons}
                    column="full_name"
                  />

                  <SelectFieldGroup
                    label="Inst. Nurse"
                    name="instrument_nurse"
                    value={
                      this.state.instrument_nurse &&
                      this.state.instrument_nurse.full_name
                    }
                    onChange={index =>
                      this.onNurseChange(index, "instrument_nurse")
                    }
                    onSearch={this.onNurseSearch}
                    error={errors.instrument_nurse}
                    formItemLayout={formItemLayout}
                    data={this.state.options.nurses}
                    column="full_name"
                  />

                  <SelectFieldGroup
                    label="Sponge Nurse"
                    name="sponge_nurse"
                    value={
                      this.state.sponge_nurse &&
                      this.state.sponge_nurse.full_name
                    }
                    onChange={index =>
                      this.onNurseChange(index, "sponge_nurse")
                    }
                    onSearch={this.onNurseSearch}
                    error={errors.sponge_nurse}
                    formItemLayout={formItemLayout}
                    data={this.state.options.nurses}
                    column="full_name"
                  />

                  <SelectFieldGroup
                    label="Main Anes"
                    name="main_anes"
                    value={
                      this.state.main_anes && this.state.main_anes.full_name
                    }
                    onChange={this.onAnesChange}
                    onSearch={this.onAnesSearch}
                    error={errors.main_anes}
                    formItemLayout={formItemLayout}
                    data={this.state.options.anesthesiologists}
                    column="full_name"
                  />

                  <TextFieldGroup
                    label="Method"
                    name="anes_method"
                    value={this.state.anes_method}
                    error={errors.anes_method}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextFieldGroup
                    label="Anesthetic Used"
                    name="anes_used"
                    value={this.state.anes_used}
                    error={errors.anes_used}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextFieldGroup
                    type="number"
                    label="Quantity"
                    name="anes_quantity"
                    value={this.state.anes_quantity}
                    error={errors.anes_quantity}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextFieldGroup
                    label="Route"
                    name="anes_route"
                    value={this.state.anes_route}
                    error={errors.anes_route}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <DatePickerFieldGroup
                    label="Anesthesia Started"
                    name="anes_start"
                    value={this.state.anes_start}
                    onChange={value => this.setState({ anes_start: value })}
                    error={errors.anes_start}
                    formItemLayout={formItemLayout}
                    showTime={true}
                  />

                  <DatePickerFieldGroup
                    label="Operation Started"
                    name="operation_started"
                    value={this.state.operation_started}
                    onChange={value =>
                      this.setState({ operation_started: value })
                    }
                    error={errors.operation_started}
                    formItemLayout={formItemLayout}
                    showTime={true}
                  />

                  <DatePickerFieldGroup
                    label="Operation Finished"
                    name="operation_finished"
                    value={this.state.operation_finished}
                    onChange={value =>
                      this.setState({ operation_finished: value })
                    }
                    error={errors.operation_finished}
                    formItemLayout={formItemLayout}
                    showTime={true}
                  />

                  <Divider orientation="left">
                    Treatment in the Operating Room
                  </Divider>

                  <TextAreaGroup
                    label="Before Operation"
                    name="before_operation"
                    value={this.state.before_operation}
                    error={errors.before_operation}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextAreaGroup
                    label="During Operation"
                    name="during_operation"
                    value={this.state.during_operation}
                    error={errors.during_operation}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextAreaGroup
                    label="After Operation"
                    name="after_operation"
                    value={this.state.after_operation}
                    error={errors.after_operation}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextAreaGroup
                    label="Comp. during oper"
                    name="complications_during_operation"
                    value={this.state.complications_during_operation}
                    error={errors.complications_during_operation}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextAreaGroup
                    label="Comp. after oper"
                    name="complications_after_operation"
                    value={this.state.complications_after_operation}
                    error={errors.complications_after_operation}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <Divider orientation="left">Operation Performed</Divider>

                  <TextAreaGroup
                    label="Operation Performed"
                    name="operation_performed"
                    value={this.state.operation_performed}
                    error={errors.operation_performed}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <Divider orientation="left">
                    Immediate Post Operative Treatment
                  </Divider>

                  <TextAreaGroup
                    label="Position in Bed"
                    name="position_in_bed"
                    value={this.state.position_in_bed}
                    error={errors.position_in_bed}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextAreaGroup
                    label="Proctoclysis"
                    name="proctoclysis"
                    value={this.state.proctoclysis}
                    error={errors.proctoclysis}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextAreaGroup
                    label="Hypodermoclysis"
                    name="hypodermoclysis"
                    value={this.state.hypodermoclysis}
                    error={errors.hypodermoclysis}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextAreaGroup
                    label="Nutrition"
                    name="nutrition"
                    value={this.state.nutrition}
                    error={errors.nutrition}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextAreaGroup
                    label="Stimulant and other med."
                    name="stimulant"
                    value={this.state.stimulant}
                    error={errors.stimulant}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <Form.Item className="m-t-1" {...tailFormItemLayout}>
                    <div className="field is-grouped">
                      <div className="control">
                        <button className="button is-small is-primary">
                          Save
                        </button>
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
                </TabPane>
              </Tabs>
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
    auth: state.auth,
    map: state.map
  };
};

export default connect(mapToState)(withRouter(OperatingRoomSlipForm));
