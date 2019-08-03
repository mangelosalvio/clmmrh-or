import React, { Component } from "react";
import { connect } from "react-redux";
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
  Tabs,
  Divider,
  Table,
  Icon,
  message
} from "antd";
import SelectFieldGroup from "../../commons/SelectFieldGroup";
import DatePickerFieldGroup from "../../commons/DatePickerFieldGroup";
import moment from "moment";
import classnames from "classnames";
import {
  lot_status_options,
  civil_status_options,
  active_status_options
} from "./../../utils/Options";
import { formItemLayout, tailFormItemLayout } from "./../../utils/Layouts";
const { Content } = Layout;
const TabPane = Tabs.TabPane;

const collection_name = "members";

const form_data = {
  [collection_name]: [],
  _id: "",
  name: "",
  address: "",
  home_contact_number: "",
  mobile_phone_number: "",
  fax: "",
  email: "",
  occupation: "",
  business_phone: "",
  dob: null,
  civil_status: "",
  birth_place: "",
  citizenship: "",
  remarks: "",

  lots: [],

  lot_status: "",
  lot_number: "",
  lot_area: "",
  floor_area: "",
  expected_monthly_dues: "",
  active_status: "",
  date_acquired: null,
  occupancy_date: null,
  occupancy_permit: "",

  meter_lot_number: "",
  meter_number: "",
  meters: [],

  edit_meter_index: null,
  edit_lot_index: null,

  errors: {}
};

class MembersForm extends Component {
  state = {
    title: "Members",
    url: "/api/members/",
    search_keyword: "",
    ...form_data
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

    if (isEmpty(this.state._id)) {
      axios
        .put(this.state.url, form_data)
        .then(({ data }) =>
          this.setState({
            ...data,
            errors: {},
            message: "Transaction Saved",
            dob: data.dob ? moment(data.dob) : null,
            date_acquired: data.date_acquired
              ? moment(data.date_acquired)
              : null,
            occupancy_date: data.occupancy_date
              ? moment(data.occupancy_date)
              : null
          })
        )
        .catch(err => this.setState({ errors: err.response.data }));
    } else {
      axios
        .post(this.state.url + this.state._id, form_data)
        .then(({ data }) =>
          this.setState({
            ...data,
            errors: {},
            message: "Transaction Updated",
            dob: data.dob ? moment(data.dob) : null,
            date_acquired: data.date_acquired
              ? moment(data.date_acquired)
              : null,
            occupancy_date: data.occupancy_date
              ? moment(data.occupancy_date)
              : null
          })
        )
        .catch(err => this.setState({ errors: err.response.data }));
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

  onUpdateLot = () => {
    const lots = [...this.state.lots];
    lots[this.state.edit_lot_index] = {
      ...lots[this.state.edit_lot_index],
      lot_status: this.state.lot_status,
      lot_number: this.state.lot_number,
      lot_area: this.state.lot_area,
      floor_area: this.state.floor_area,
      expected_monthly_dues: this.state.expected_monthly_dues,
      active_status: this.state.active_status,
      date_acquired: this.state.date_acquired
        ? moment(this.state.date_acquired)
        : null,
      occupancy_date: this.state.occupancy_date
        ? moment(this.state.occupancy_date)
        : null,
      occupancy_permit: this.state.occupancy_permit
    };

    this.setState(
      {
        lots,
        lot_status: "",
        lot_number: "",
        lot_area: "",
        floor_area: "",
        expected_monthly_dues: "",
        active_status: "",
        date_acquired: null,
        occupancy_date: null,
        occupancy_permit: "",
        edit_lot_index: null
      },
      message.success("Lot Updated")
    );
  };

  onEditLot = (record, index) => {
    this.setState({
      lot_status: record.lot_status,
      lot_number: record.lot_number,
      lot_area: record.lot_area,
      floor_area: record.floor_area,
      expected_monthly_dues: record.expected_monthly_dues,
      active_status: record.active_status,
      date_acquired: record.date_acquired ? moment(record.date_acquired) : null,
      occupancy_date: record.occupancy_date
        ? moment(record.occupancy_date)
        : null,
      occupancy_permit: record.occupancy_permit,
      edit_lot_index: index
    });
  };

  onUpdateMeter = () => {
    const meters = [...this.state.meters];
    meters[this.state.edit_meter_index] = {
      ...meters[this.state.edit_meter_index],
      lot_number: this.state.meter_lot_number,
      meter_number: this.state.meter_number
    };

    this.setState(
      {
        meters,
        meter_lot_number: "",
        meter_number: "",
        edit_meter_index: null
      },
      message.success("Meter Updated")
    );
  };

  onDeleteLot = (record, index) => {
    const lots = [...this.state.lots];
    lots.splice(index, 1);
    this.setState({ lots });
  };

  onEditMeter = (record, index) => {
    this.setState({
      meter_lot_number: record.lot_number,
      meter_number: record.meter_number,
      edit_meter_index: index
    });
  };

  onDeleteMeter = (record, index) => {
    const meters = [...this.state.meters];
    meters.splice(index, 1);
    this.setState({ meters });
  };

  edit = record => {
    axios
      .get(this.state.url + record._id)
      .then(response => {
        const record = response.data;
        this.setState(prevState => {
          return {
            lot_status: "",
            lot_number: "",
            lot_area: "",
            floor_area: "",
            expected_monthly_dues: "",
            active_status: "",
            occupancy_permit: "",
            meter_lot_number: "",
            meter_number: "",
            meters: [],

            edit_meter_index: null,
            edit_lot_index: null,
            [collection_name]: [],
            ...record,
            dob: record.dob ? moment(record.dob) : null,
            date_acquired: record.date_acquired
              ? moment(record.date_acquired)
              : null,
            occupancy_date: record.occupancy_date
              ? moment(record.occupancy_date)
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
        this.setState({
          ...form_data,
          message: "Transaction Deleted"
        });
      })
      .catch(err => console.log(err));
  };

  onHide = () => {
    this.setState({ message: "" });
  };

  onAddLot = () => {
    const lots = [
      ...this.state.lots,
      {
        lot_status: this.state.lot_status,
        lot_number: this.state.lot_number,
        lot_area: this.state.lot_area,
        floor_area: this.state.floor_area,
        expected_monthly_dues: this.state.expected_monthly_dues,
        active_status: this.state.active_status,
        date_acquired: this.state.date_acquired
          ? moment(this.state.date_acquired)
          : null,
        occupancy_date: this.state.occupancy_date
          ? moment(this.state.occupancy_date)
          : null,
        occupancy_permit: this.state.occupancy_permit
      }
    ];

    this.setState({
      lots,
      lot_status: "",
      lot_number: "",
      lot_area: "",
      floor_area: "",
      expected_monthly_dues: "",
      active_status: "",
      date_acquired: null,
      occupancy_date: null,
      occupancy_permit: ""
    });
  };

  onAddMeter = () => {
    const meters = [
      ...this.state.meters,
      {
        lot_number: this.state.meter_lot_number,
        meter_number: this.state.meter_number
      }
    ];

    this.setState({ meters, lot_number: "", meter_number: "" });
  };

  render() {
    const lot_columns = [
      {
        title: "Lot Status",
        dataIndex: "lot_status",
        key: "lot_status"
      },
      {
        title: "Lot Number",
        dataIndex: "lot_number",
        key: "lot_number"
      },
      {
        title: "Lot Area",
        dataIndex: "lot_area",
        key: "lot_area"
      },
      {
        title: "Action",
        key: "action",
        render: (text, record, index) => (
          <span>
            <Icon
              type="edit"
              theme="filled"
              className="pointer"
              onClick={() => this.onEditLot(record, index)}
            />
            <Divider type="vertical" />
            <Icon
              type="delete"
              theme="filled"
              className="pointer"
              onClick={() => this.onDeleteLot(record, index)}
            />
          </span>
        )
      }
    ];

    const meter_columns = [
      {
        title: "Lot Number",
        dataIndex: "lot_number",
        key: "lot_number"
      },
      {
        title: "Meter Number",
        dataIndex: "meter_number",
        key: "meter_number"
      },
      {
        title: "Action",
        key: "action",
        render: (text, record, index) => (
          <span>
            <Icon
              type="edit"
              theme="filled"
              className="pointer"
              onClick={() => this.onEditMeter(record, index)}
            />
            <Divider type="vertical" />
            <Icon
              type="delete"
              theme="filled"
              className="pointer"
              onClick={() => this.onDeleteMeter(record, index)}
            />
          </span>
        )
      }
    ];

    const records_column = [
      {
        title: "Name",
        dataIndex: "name"
      },
      {
        title: "Address",
        dataIndex: "address"
      },
      {
        title: "Home Contact #",
        dataIndex: "home_contact_number"
      },
      {
        title: "Mobile Phone #",
        dataIndex: "mobile_phone_number"
      },
      {
        title: "Action",
        key: "action",
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

    const lot_numbers = this.state.lots.map(o => {
      return o.lot_number;
    });

    return (
      <Content style={{ padding: "0 50px" }}>
        <div className="columns is-marginless">
          <div className="column">
            <Breadcrumb style={{ margin: "16px 0" }}>
              <Breadcrumb.Item>Home</Breadcrumb.Item>
              <Breadcrumb.Item>Members</Breadcrumb.Item>
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
            <Form onSubmit={this.onSubmit}>
              <Tabs type="card">
                <TabPane tab="Member Info" key="1">
                  <div>
                    <TextFieldGroup
                      label="Name"
                      name="name"
                      value={this.state.name}
                      onChange={this.onChange}
                      error={errors.name}
                      placeholder="De la Cruz, Juan"
                      formItemLayout={formItemLayout}
                    />

                    <TextFieldGroup
                      label="Address"
                      name="address"
                      value={this.state.address}
                      onChange={this.onChange}
                      error={errors.address}
                      formItemLayout={formItemLayout}
                    />

                    <TextFieldGroup
                      label="Home Contact #"
                      name="home_contact_number"
                      value={this.state.home_contact_number}
                      onChange={this.onChange}
                      error={errors.home_contact_number}
                      formItemLayout={formItemLayout}
                    />

                    <TextFieldGroup
                      label="Mobile Phone #"
                      name="mobile_phone_number"
                      value={this.state.mobile_phone_number}
                      onChange={this.onChange}
                      error={errors.mobile_phone_number}
                      formItemLayout={formItemLayout}
                    />

                    <TextFieldGroup
                      label="Fax"
                      name="fax"
                      value={this.state.fax}
                      onChange={this.onChange}
                      error={errors.fax}
                      formItemLayout={formItemLayout}
                    />

                    <TextFieldGroup
                      label="Email"
                      name="email"
                      value={this.state.email}
                      onChange={this.onChange}
                      error={errors.email}
                      formItemLayout={formItemLayout}
                    />

                    <TextFieldGroup
                      label="Occupation/Business"
                      name="occupation"
                      value={this.state.occupation}
                      onChange={this.onChange}
                      error={errors.occupation}
                      formItemLayout={formItemLayout}
                    />

                    <TextFieldGroup
                      label="Business Phone"
                      name="business_phone"
                      value={this.state.business_phone}
                      onChange={this.onChange}
                      error={errors.business_phone}
                      formItemLayout={formItemLayout}
                    />

                    <Divider orientation="left">Other Information</Divider>

                    <DatePickerFieldGroup
                      label="Date of birth"
                      name="dob"
                      value={this.state.dob}
                      onChange={value => this.setState({ dob: value })}
                      error={errors.dob}
                      formItemLayout={formItemLayout}
                    />

                    <SelectFieldGroup
                      label="Civil Status"
                      name="civil_status"
                      value={this.state.civil_status}
                      onChange={value => this.setState({ civil_status: value })}
                      error={errors.civil_status}
                      formItemLayout={formItemLayout}
                      options={civil_status_options}
                    />

                    <TextFieldGroup
                      label="Birth Place"
                      name="birth_place"
                      value={this.state.birth_place}
                      onChange={this.onChange}
                      error={errors.birth_place}
                      formItemLayout={formItemLayout}
                    />

                    <TextFieldGroup
                      label="Citizenship"
                      name="citizenship"
                      value={this.state.citizenship}
                      onChange={this.onChange}
                      error={errors.citizenship}
                      formItemLayout={formItemLayout}
                    />

                    <TextFieldGroup
                      label="Remarks"
                      name="remarks"
                      value={this.state.remarks}
                      onChange={this.onChange}
                      error={errors.remarks}
                      formItemLayout={formItemLayout}
                    />

                    <Form.Item {...tailFormItemLayout}>
                      <div className="field is-grouped">
                        <div className="control">
                          <button className="button is-primary is-small">
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
                  </div>
                </TabPane>
                <TabPane tab="Lot Info" key="2">
                  <SelectFieldGroup
                    label="Lot Status"
                    name="lot_status"
                    value={this.state.lot_status}
                    onChange={value => this.setState({ lot_status: value })}
                    error={errors.lot_status}
                    formItemLayout={formItemLayout}
                    options={lot_status_options}
                  />
                  <TextFieldGroup
                    label="Lot Number"
                    name="lot_number"
                    value={this.state.lot_number}
                    onChange={this.onChange}
                    error={errors.lot_number}
                    formItemLayout={formItemLayout}
                  />
                  <TextFieldGroup
                    label="Lot Area (sqm)"
                    name="lot_area"
                    value={this.state.lot_area}
                    onChange={this.onChange}
                    error={errors.lot_area}
                    formItemLayout={formItemLayout}
                  />
                  <TextFieldGroup
                    label="Floor Area (sqm)"
                    name="floor_area"
                    value={this.state.floor_area}
                    onChange={this.onChange}
                    error={errors.floor_area}
                    formItemLayout={formItemLayout}
                  />

                  <TextFieldGroup
                    label="Expected Monthly Dues"
                    name="expected_monthly_dues"
                    value={this.state.expected_monthly_dues}
                    onChange={this.onChange}
                    error={errors.expected_monthly_dues}
                    formItemLayout={formItemLayout}
                  />

                  <SelectFieldGroup
                    label="Active Status"
                    name="active_status"
                    value={this.state.active_status}
                    onChange={value => this.setState({ active_status: value })}
                    error={errors.active_status}
                    formItemLayout={formItemLayout}
                    options={active_status_options}
                  />

                  <Divider orientation="left">Lot Permit Info</Divider>

                  <DatePickerFieldGroup
                    label="Date Acquired"
                    name="date_acquired"
                    value={this.state.date_acquired}
                    onChange={value => this.setState({ date_acquired: value })}
                    error={errors.date_acquired}
                    formItemLayout={formItemLayout}
                  />

                  <DatePickerFieldGroup
                    label="Occupany Date"
                    name="occupancy_date"
                    value={this.state.occupancy_date}
                    onChange={value => this.setState({ occupancy_date: value })}
                    error={errors.occupancy_date}
                    formItemLayout={formItemLayout}
                  />

                  <TextFieldGroup
                    label="Occupancy Permit"
                    name="occupancy_permit"
                    value={this.state.occupancy_permit}
                    onChange={this.onChange}
                    error={errors.occupancy_permit}
                    formItemLayout={formItemLayout}
                  />

                  <Form.Item {...tailFormItemLayout}>
                    <div className="field is-grouped">
                      <div
                        className={classnames("control", {
                          "display-none": this.state.edit_lot_index !== null
                        })}
                      >
                        <input
                          type="button"
                          className="button is-primary is-small"
                          onClick={this.onAddLot}
                          value="Add"
                        />
                      </div>

                      <div
                        className={classnames("control", {
                          "display-none": this.state.edit_lot_index === null
                        })}
                      >
                        <input
                          type="button"
                          className="button is-primary is-small"
                          onClick={this.onUpdateLot}
                          value="Update"
                        />
                      </div>
                    </div>
                  </Form.Item>

                  <Table
                    dataSource={this.state.lots}
                    columns={lot_columns}
                    rowKey="_id"
                  />
                  <Form.Item className="m-t-1">
                    <div className="field is-grouped">
                      <div className="control">
                        <button className="button is-small">Save</button>
                      </div>
                    </div>
                  </Form.Item>
                </TabPane>
                <TabPane tab="Meters" key="3">
                  <SelectFieldGroup
                    label="Lot Number"
                    name="meter_lot_number"
                    value={this.state.meter_lot_number}
                    onChange={value =>
                      this.setState({ meter_lot_number: value })
                    }
                    error={errors.meter_lot_number}
                    formItemLayout={formItemLayout}
                    options={lot_numbers}
                  />
                  <TextFieldGroup
                    label="Meter Number"
                    name="meter_number"
                    value={this.state.meter_number}
                    onChange={this.onChange}
                    error={errors.meter_number}
                    formItemLayout={formItemLayout}
                  />
                  <Form.Item {...tailFormItemLayout}>
                    <div className="field is-grouped">
                      <div
                        className={classnames("control", {
                          "display-none": this.state.edit_meter_index !== null
                        })}
                      >
                        <input
                          type="button"
                          className="button is-primary is-small"
                          onClick={this.onAddMeter}
                          value="Add"
                        />
                      </div>
                      <div
                        className={classnames("control", {
                          "display-none": this.state.edit_meter_index === null
                        })}
                      >
                        <input
                          type="button"
                          className="button is-primary is-small"
                          onClick={this.onUpdateMeter}
                          value="Update"
                        />
                      </div>
                    </div>
                  </Form.Item>

                  <Table
                    dataSource={this.state.meters}
                    columns={meter_columns}
                    rowKey="_id"
                  />

                  <Form.Item className="m-t-1">
                    <div className="field is-grouped">
                      <div className="control">
                        <button className="button is-small">Save</button>
                      </div>
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
    auth: state.auth
  };
};

export default connect(mapToState)(MembersForm);
