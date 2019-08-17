import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import TextFieldGroup from "../../commons/TextFieldGroup";
import axios from "axios";
import isEmpty from "../../validation/is-empty";
import MessageBoxInfo from "../../commons/MessageBoxInfo";
import Searchbar from "../../commons/Searchbar";
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
import DateTimePickerFieldGroup from "../../commons/DateTimePickerFieldGroup";
import CheckboxFieldGroup from "../../commons/CheckboxFieldGroup";
import TextAreaAutocompleteGroup from "../../commons/TextAreaAutocompleteGroup";
import { debounce } from "lodash";

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
  date_of_birth: null,
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

  time_ward_informed: null,
  arrival_time: null,
  room_is_ready: null,
  equip_ready: null,
  patient_placed_in_or_table: null,
  time_anes_arrived: null,
  time_surgeon_arrived: null,
  induction_time: null,
  induction_completed: null,
  time_or_started: null,
  or_ended: null,
  trans_out_from_or: null,
  surgical_safety_checklist: null,
  remarks: "",

  rvs_code: "",
  rvs_description: "",

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
      nurses: [],
      rvs: []
    }
  };

  constructor(props) {
    super(props);
    this.onRvsSearch = debounce(this.onRvsSearch, 300);
  }

  onChange = e => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;

    this.setState({ [e.target.name]: value });
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
            operation_finished,
            time_ward_informed,
            arrival_time,
            room_is_ready,
            equip_ready,
            patient_placed_in_or_table,
            time_anes_arrived,
            time_surgeon_arrived,
            induction_time,
            induction_completed,
            time_or_started,
            or_ended,
            trans_out_from_or,
            surgical_safety_checklist,
            date_of_birth
          } = data;

          message.success("Transaction Saved");
          loading();
          this.setState({
            ...form_data,
            ...data,
            date_of_birth: date_of_birth ? moment(date_of_birth) : null,
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

            time_ward_informed: time_ward_informed
              ? moment(time_ward_informed)
              : null,
            arrival_time: arrival_time ? moment(arrival_time) : null,
            room_is_ready: room_is_ready ? moment(room_is_ready) : null,
            equip_ready: equip_ready ? moment(equip_ready) : null,
            patient_placed_in_or_table: patient_placed_in_or_table
              ? moment(patient_placed_in_or_table)
              : null,
            time_anes_arrived: time_anes_arrived
              ? moment(time_anes_arrived)
              : null,
            time_surgeon_arrived: time_surgeon_arrived
              ? moment(time_surgeon_arrived)
              : null,
            induction_time: induction_time ? moment(induction_time) : null,
            induction_completed: induction_completed
              ? moment(induction_completed)
              : null,
            time_or_started: time_or_started ? moment(time_or_started) : null,
            or_ended: or_ended ? moment(or_ended) : null,
            trans_out_from_or: trans_out_from_or
              ? moment(trans_out_from_or)
              : null,
            surgical_safety_checklist: surgical_safety_checklist
              ? moment(surgical_safety_checklist)
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
            date_of_birth,
            registration_date,
            date_time_ordered,
            date_time_received,
            date_time_of_surgery,
            anes_start,
            operation_started,
            operation_finished,

            time_ward_informed,
            arrival_time,
            room_is_ready,
            equip_ready,
            patient_placed_in_or_table,
            time_anes_arrived,
            time_surgeon_arrived,
            induction_time,
            induction_completed,
            time_or_started,
            or_ended,
            trans_out_from_or,
            surgical_safety_checklist
          } = data;

          loading(0);
          message.success("Transaction Updated");
          this.setState({
            ...form_data,
            ...data,
            date_of_birth: date_of_birth ? moment(date_of_birth) : null,
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
            time_ward_informed: time_ward_informed
              ? moment(time_ward_informed)
              : null,
            arrival_time: arrival_time ? moment(arrival_time) : null,
            room_is_ready: room_is_ready ? moment(room_is_ready) : null,
            equip_ready: equip_ready ? moment(equip_ready) : null,
            patient_placed_in_or_table: patient_placed_in_or_table
              ? moment(patient_placed_in_or_table)
              : null,
            time_anes_arrived: time_anes_arrived
              ? moment(time_anes_arrived)
              : null,
            time_surgeon_arrived: time_surgeon_arrived
              ? moment(time_surgeon_arrived)
              : null,
            induction_time: induction_time ? moment(induction_time) : null,
            induction_completed: induction_completed
              ? moment(induction_completed)
              : null,
            time_or_started: time_or_started ? moment(time_or_started) : null,
            or_ended: or_ended ? moment(or_ended) : null,
            trans_out_from_or: trans_out_from_or
              ? moment(trans_out_from_or)
              : null,
            surgical_safety_checklist: surgical_safety_checklist
              ? moment(surgical_safety_checklist)
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

    const loading = message.loading("Loading...");
    axios
      .get(this.state.url + "?s=" + this.state.search_keyword)
      .then(response => {
        loading();
        this.setState({
          [collection_name]: response.data,
          message: isEmpty(response.data) ? "No rows found" : ""
        });
      })
      .catch(err => {
        loading();
        message.error("An error has occurred");
        console.log(err);
      });
  };

  addNew = () => {
    this.setState({
      ...form_data,
      errors: {},
      message: ""
    });
  };

  edit = record => {
    const loading = message.loading("Loading...");
    axios
      .get(this.state.url + record._id)
      .then(response => {
        loading();
        const record = response.data;
        const {
          date_of_birth,
          registration_date,
          date_time_ordered,
          date_time_of_surgery,
          date_time_received,
          anes_start,
          operation_started,
          operation_finished,
          time_ward_informed,
          arrival_time,
          room_is_ready,
          equip_ready,
          patient_placed_in_or_table,
          time_anes_arrived,
          time_surgeon_arrived,
          induction_time,
          induction_completed,
          time_or_started,
          or_ended,
          trans_out_from_or,
          surgical_safety_checklist
        } = response.data;
        this.setState(prevState => {
          return {
            ...form_data,
            [collection_name]: [],
            ...record,
            date_of_birth: date_of_birth ? moment(date_of_birth) : null,
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

            time_ward_informed: time_ward_informed
              ? moment(time_ward_informed)
              : null,
            arrival_time: arrival_time ? moment(arrival_time) : null,
            room_is_ready: room_is_ready ? moment(room_is_ready) : null,
            equip_ready: equip_ready ? moment(equip_ready) : null,
            patient_placed_in_or_table: patient_placed_in_or_table
              ? moment(patient_placed_in_or_table)
              : null,
            time_anes_arrived: time_anes_arrived
              ? moment(time_anes_arrived)
              : null,
            time_surgeon_arrived: time_surgeon_arrived
              ? moment(time_surgeon_arrived)
              : null,
            induction_time: induction_time ? moment(induction_time) : null,
            induction_completed: induction_completed
              ? moment(induction_completed)
              : null,
            time_or_started: time_or_started ? moment(time_or_started) : null,
            or_ended: or_ended ? moment(or_ended) : null,
            trans_out_from_or: trans_out_from_or
              ? moment(trans_out_from_or)
              : null,
            surgical_safety_checklist: surgical_safety_checklist
              ? moment(surgical_safety_checklist)
              : null,
            errors: {}
          };
        });
      })
      .catch(err => {
        loading();
        message.error("An error has occurred");
        console.log(err);
      });
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

  onRvsCodeLookup = e => {
    e.preventDefault();
    const loading = message.loading("Loading...");
    axios
      .get(`/api/relative-value-scales/${this.state.rvs_code}/code`)
      .then(response => {
        loading();
        if (response.data) {
          this.setState({
            rvs_description: response.data.description
          });
          message.success("RVS Found");
        } else {
          message.error("RVS not Found");
        }
      });
  };

  /**
   * RVS Desc
   */

  onRvsSearch = value => {
    axios
      .get(`/api/relative-value-scales/listings/?s=${value}`)
      .then(response =>
        this.setState({
          options: {
            ...this.state.options,
            rvs: response.data
          }
        })
      )
      .catch(err => console.log(err));
  };

  onRvsSelect = value => {
    const index = this.state.options.rvs.map(o => o.description).indexOf(value);
    const rvs_code = this.state.options.rvs[index].code;

    this.setState({
      rvs_code,
      rvs_description: value
    });
  };

  render() {
    const records_column = [
      {
        title: "Hospital #",
        dataIndex: "hospital_number"
      },
      {
        title: "Ward",
        dataIndex: "ward"
      },
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
        title: "Diagnosis",
        dataIndex: "diagnosis"
      },
      {
        title: "Procedure",
        dataIndex: "procedure"
      },
      {
        title: "Surgeon",
        dataIndex: "surgeon.full_name"
      },
      {
        title: "Anesthesiologist",
        dataIndex: "main_anes.full_name"
      },
      {
        title: "OR Room",
        dataIndex: "operating_room_number"
      },
      {
        title: "Classification",
        dataIndex: "classification"
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

    const rvs_desc_data_source = this.state.options.rvs.map(o => o.description);

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

                  <DatePickerFieldGroup
                    label="Date of Birth"
                    name="date_of_birth"
                    value={this.state.date_of_birth}
                    onChange={value => this.setState({ date_of_birth: value })}
                    error={errors.date_of_birth}
                    formItemLayout={formItemLayout}
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

                  <DateTimePickerFieldGroup
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

                  <DateTimePickerFieldGroup
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

                  <DateTimePickerFieldGroup
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
                    disabled
                  />

                  <DatePickerFieldGroup
                    label="Date of Birth"
                    name="date_of_birth"
                    value={this.state.date_of_birth}
                    onChange={value => this.setState({ date_of_birth: value })}
                    error={errors.date_of_birth}
                    formItemLayout={formItemLayout}
                    disabled
                  />

                  <TextFieldGroup
                    label="Age"
                    name="age"
                    value={this.state.age}
                    error={errors.age}
                    formItemLayout={formItemLayout}
                    disabled
                  />

                  <RadioGroupFieldGroup
                    label="Sex"
                    name="sex"
                    value={this.state.sex}
                    onChange={this.onChange}
                    error={errors.sex}
                    formItemLayout={formItemLayout}
                    options={gender_options}
                    disabled
                  />

                  <TextFieldGroup
                    label="Weight"
                    name="weight"
                    value={this.state.weight}
                    error={errors.weight}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                    disabled
                  />

                  <TextAreaGroup
                    label="Address"
                    name="address"
                    value={this.state.address}
                    error={errors.address}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                    disabled
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
                    disabled
                  />

                  <TextFieldGroup
                    label="Hospital #"
                    name="hospital_number"
                    value={this.state.hospital_number}
                    error={errors.hospital_number}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                    disabled
                  />

                  <TextFieldGroup
                    label="Ward"
                    name="ward"
                    value={this.state.ward}
                    error={errors.ward}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                    disabled
                  />

                  <SimpleSelectFieldGroup
                    label="Service"
                    name="service"
                    value={this.state.service}
                    onChange={value => this.setState({ service: value })}
                    formItemLayout={formItemLayout}
                    error={errors.service}
                    options={service_options}
                    disabled
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
                    disabled
                  />

                  <DatePickerFieldGroup
                    label="Date of Birth"
                    name="date_of_birth"
                    value={this.state.date_of_birth}
                    onChange={value => this.setState({ date_of_birth: value })}
                    error={errors.date_of_birth}
                    formItemLayout={formItemLayout}
                    disabled
                  />

                  <TextFieldGroup
                    label="Age"
                    name="age"
                    value={this.state.age}
                    error={errors.age}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                    disabled
                  />

                  <RadioGroupFieldGroup
                    label="Sex"
                    name="sex"
                    value={this.state.sex}
                    onChange={this.onChange}
                    error={errors.sex}
                    formItemLayout={formItemLayout}
                    options={gender_options}
                    disabled
                  />

                  <TextFieldGroup
                    label="Weight"
                    name="weight"
                    value={this.state.weight}
                    error={errors.weight}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                    disabled
                  />

                  <TextAreaGroup
                    label="Address"
                    name="address"
                    value={this.state.address}
                    error={errors.address}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                    disabled
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
                    disabled
                  />

                  <TextFieldGroup
                    label="Hospital #"
                    name="hospital_number"
                    value={this.state.hospital_number}
                    error={errors.hospital_number}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                    disabled
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
                    disabled
                  />

                  <SimpleSelectFieldGroup
                    label="Service"
                    name="service"
                    value={this.state.service}
                    onChange={value => this.setState({ service: value })}
                    formItemLayout={formItemLayout}
                    error={errors.service}
                    options={service_options}
                    disabled
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

                  <DateTimePickerFieldGroup
                    label="Anesthesia Started"
                    name="anes_start"
                    value={this.state.anes_start}
                    onChange={value => this.setState({ anes_start: value })}
                    error={errors.anes_start}
                    formItemLayout={formItemLayout}
                    showTime={true}
                  />

                  <DateTimePickerFieldGroup
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

                  <DateTimePickerFieldGroup
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

                  <TextAreaGroup
                    label="Tentative Diagnosis"
                    name="tentative_diagnosis"
                    value={this.state.tentative_diagnosis}
                    error={errors.tentative_diagnosis}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextAreaGroup
                    label="Final Diagnosis"
                    name="final_diagnosis"
                    value={this.state.final_diagnosis}
                    error={errors.final_diagnosis}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextFieldGroup
                    label="RVS Code"
                    name="rvs_code"
                    value={this.state.rvs_code}
                    error={errors.rvs_code}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                    onPressEnter={this.onRvsCodeLookup}
                  />

                  <TextAreaAutocompleteGroup
                    label="RVS Desc"
                    name="rvs_description"
                    value={this.state.rvs_description}
                    error={errors.rvs_description}
                    formItemLayout={formItemLayout}
                    rows="4"
                    onChange={value =>
                      this.setState({ rvs_description: value })
                    }
                    dataSource={rvs_desc_data_source}
                    onSelect={this.onRvsSelect}
                    onSearch={this.onRvsSearch}
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
                <TabPane tab="Time Logs" key="4">
                  <DateTimePickerFieldGroup
                    label="Time Ward Informed"
                    name="time_ward_informed"
                    value={this.state.time_ward_informed}
                    onChange={value =>
                      this.setState({ time_ward_informed: value })
                    }
                    error={errors.time_ward_informed}
                    formItemLayout={formItemLayout}
                    showTime={true}
                  />

                  <DateTimePickerFieldGroup
                    label="Arrival Time"
                    name="arrival_time"
                    value={this.state.arrival_time}
                    onChange={value => this.setState({ arrival_time: value })}
                    error={errors.arrival_time}
                    formItemLayout={formItemLayout}
                    showTime={true}
                  />

                  <DateTimePickerFieldGroup
                    label="Room is Ready"
                    name="room_is_ready"
                    value={this.state.room_is_ready}
                    onChange={value => this.setState({ room_is_ready: value })}
                    error={errors.room_is_ready}
                    formItemLayout={formItemLayout}
                    showTime={true}
                  />

                  <DateTimePickerFieldGroup
                    label="Equip/Inst ready"
                    name="equip_ready"
                    value={this.state.equip_ready}
                    onChange={value => this.setState({ equip_ready: value })}
                    error={errors.equip_ready}
                    formItemLayout={formItemLayout}
                    showTime={true}
                  />

                  <DateTimePickerFieldGroup
                    label="Patient Placed in OR Table"
                    name="patient_placed_in_or_table"
                    value={this.state.patient_placed_in_or_table}
                    onChange={value =>
                      this.setState({ patient_placed_in_or_table: value })
                    }
                    error={errors.patient_placed_in_or_table}
                    formItemLayout={formItemLayout}
                    showTime={true}
                  />

                  <DateTimePickerFieldGroup
                    label="Time Anes Arrived"
                    name="time_anes_arrived"
                    value={this.state.time_anes_arrived}
                    onChange={value =>
                      this.setState({ time_anes_arrived: value })
                    }
                    error={errors.time_anes_arrived}
                    formItemLayout={formItemLayout}
                    showTime={true}
                  />

                  <DateTimePickerFieldGroup
                    label="Time Surgeon Arrived"
                    name="time_surgeon_arrived"
                    value={this.state.time_surgeon_arrived}
                    onChange={value =>
                      this.setState({ time_surgeon_arrived: value })
                    }
                    error={errors.time_surgeon_arrived}
                    formItemLayout={formItemLayout}
                    showTime={true}
                  />

                  <DateTimePickerFieldGroup
                    label="Induction Time"
                    name="induction_time"
                    value={this.state.induction_time}
                    onChange={value => this.setState({ induction_time: value })}
                    error={errors.induction_time}
                    formItemLayout={formItemLayout}
                    showTime={true}
                  />

                  <DateTimePickerFieldGroup
                    label="Induction Completed"
                    name="induction_completed"
                    value={this.state.induction_completed}
                    onChange={value =>
                      this.setState({ induction_completed: value })
                    }
                    error={errors.induction_completed}
                    formItemLayout={formItemLayout}
                    showTime={true}
                  />

                  <DateTimePickerFieldGroup
                    label="Time OR Started"
                    name="time_or_started"
                    value={this.state.time_or_started}
                    onChange={value =>
                      this.setState({ time_or_started: value })
                    }
                    error={errors.time_or_started}
                    formItemLayout={formItemLayout}
                    showTime={true}
                  />

                  <DateTimePickerFieldGroup
                    label="OR Ended"
                    name="or_ended"
                    value={this.state.or_ended}
                    onChange={value => this.setState({ or_ended: value })}
                    error={errors.or_ended}
                    formItemLayout={formItemLayout}
                    showTime={true}
                  />

                  <DateTimePickerFieldGroup
                    label="Trans out from OR"
                    name="trans_out_from_or"
                    value={this.state.trans_out_from_or}
                    onChange={value =>
                      this.setState({ trans_out_from_or: value })
                    }
                    error={errors.trans_out_from_or}
                    formItemLayout={formItemLayout}
                    showTime={true}
                  />

                  <CheckboxFieldGroup
                    label="Surgical Safety Checklist"
                    name="surgical_safety_checklist"
                    checked={this.state.surgical_safety_checklist}
                    onChange={this.onChange}
                    error={errors.surgical_safety_checklist}
                    formItemLayout={formItemLayout}
                  />

                  <TextAreaGroup
                    label="Remarks"
                    name="remarks"
                    value={this.state.remarks}
                    error={errors.remarks}
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
