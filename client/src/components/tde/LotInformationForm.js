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
import { payment_types, lot_status } from "../../utils/Options";
import SiteMap from "../tdc/SiteMap";
import moment from "moment";

const { Content } = Layout;
const TabPane = Tabs.TabPane;

const collection_name = "lots";

const form_data = {
  [collection_name]: [],
  _id: "",

  last_name: "",
  first_name: "",
  middle_name: "",
  date_of_birth: null,
  religion: "",

  spouse_last_name: "",
  spouse_first_name: "",
  spouse_middle_name: "",
  spouse_date_of_birth: null,
  spouse_religion: "",

  home_address: "",
  home_telephone_number: "",
  office_address: "",
  office_telephone_number: "",

  beneficiary_name: "",
  beneficiary_relation: "",
  beneficiary_address: "",

  payment_type: "",
  initial_payment: "",
  processing_fee: "",
  equity: "",
  gross_monthly_payment: "",
  rebate: "",
  net_monthly_payment: "",

  sales_agent: "",
  sales_manager: "",

  sales_code: "",

  first_due_date: null,
  last_due_date: null,

  errors: {}
};

class LotInformationForm extends Component {
  state = {
    title: "General Information Form",
    url: "/api/lots/",
    search_keyword: "",
    ...form_data
  };

  componentDidMount() {
    if (isEmpty(this.props.map.selected_lot)) {
      this.props.history.push("/map");
    }

    const loading = message.loading("Loading...");
    axios.get(this.state.url + this.props.map.selected_lot).then(({ data }) => {
      loading();
      if (data) {
        this.setState({
          ...form_data,
          ...data,
          date_of_birth: data.date_of_birth ? moment(data.date_of_birth) : null,
          spouse_date_of_birth: data.spouse_date_of_birth
            ? moment(data.spouse_date_of_birth)
            : null,
          first_due_date: data.first_due_date
            ? moment(data.first_due_date)
            : null,
          last_due_date: data.last_due_date ? moment(data.last_due_date) : null,
          errors: {}
        });
      }
    });
  }

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  onSubmit = e => {
    e.preventDefault();

    const form_data = {
      ...this.state,
      lot: this.props.map.selected_lot,
      user: this.props.auth.user
    };

    const loading = message.loading("Processing...");
    axios
      .post(this.state.url + this.props.map.selected_lot, form_data)
      .then(({ data }) => {
        loading();
        message.success("Transaction Saved");
        this.setState({
          ...form_data,
          ...data,
          date_of_birth: data.date_of_birth ? moment(data.date_of_birth) : null,
          spouse_date_of_birth: data.spouse_date_of_birth
            ? moment(data.spouse_date_of_birth)
            : null,
          first_due_date: data.first_due_date
            ? moment(data.first_due_date)
            : null,
          last_due_date: data.last_due_date ? moment(data.last_due_date) : null,
          errors: {}
        });
      })
      .catch(err => {
        loading();
        this.setState({ errors: err.response.data });
      });
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
        this.setState(prevState => {
          return {
            ...form_data,
            [collection_name]: [],
            ...record,
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

  render() {
    const records_column = [
      {
        title: "Description",
        dataIndex: "desc"
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
              <Breadcrumb.Item>General Information Form</Breadcrumb.Item>
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
                <TabPane tab="Personal Information" key="1">
                  <TextFieldGroup
                    label="Last Name"
                    name="last_name"
                    value={this.state.last_name}
                    error={errors.last_name}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextFieldGroup
                    label="First Name"
                    name="first_name"
                    value={this.state.first_name}
                    error={errors.first_name}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextFieldGroup
                    label="Middle Name"
                    name="middle_name"
                    value={this.state.middle_name}
                    error={errors.middle_name}
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
                    label="Religion"
                    name="religion"
                    value={this.state.religion}
                    error={errors.religion}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <Divider orientation="left">Spouse Information</Divider>

                  <TextFieldGroup
                    label="Last Name"
                    name="spouse_last_name"
                    value={this.state.spouse_last_name}
                    error={errors.spouse_last_name}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextFieldGroup
                    label="First Name"
                    name="spouse_first_name"
                    value={this.state.spouse_first_name}
                    error={errors.spouse_first_name}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextFieldGroup
                    label="Middle Name"
                    name="spouse_middle_name"
                    value={this.state.spouse_middle_name}
                    error={errors.spouse_middle_name}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <DatePickerFieldGroup
                    label="Date of Birth"
                    name="spouse_date_of_birth"
                    value={this.state.spouse_date_of_birth}
                    onChange={value =>
                      this.setState({ spouse_date_of_birth: value })
                    }
                    error={errors.spouse_date_of_birth}
                    formItemLayout={formItemLayout}
                  />

                  <TextFieldGroup
                    label="Religion"
                    name="spouse_religion"
                    value={this.state.spouse_religion}
                    error={errors.spouse_religion}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <Divider orientation="left">Contact Information</Divider>

                  <TextAreaGroup
                    label="Home Address"
                    name="home_address"
                    value={this.state.home_address}
                    error={errors.home_address}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextFieldGroup
                    label="Home Telephone Number"
                    name="home_telephone_number"
                    value={this.state.home_telephone_number}
                    error={errors.home_telephone_number}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextAreaGroup
                    label="Office Address"
                    name="office_address"
                    value={this.state.office_address}
                    error={errors.office_address}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextFieldGroup
                    label="Office Telephone Number"
                    name="office_telephone_number"
                    value={this.state.office_telephone_number}
                    error={errors.office_telephone_number}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <Divider orientation="left">Beneficiary Information</Divider>

                  <TextFieldGroup
                    label="Name"
                    name="beneficiary_name"
                    value={this.state.beneficiary_name}
                    error={errors.beneficiary_name}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextFieldGroup
                    label="Relation"
                    name="beneficiary_relation"
                    value={this.state.beneficiary_relation}
                    error={errors.beneficiary_relation}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextAreaGroup
                    label="Address"
                    name="beneficiary_address"
                    value={this.state.beneficiary_address}
                    error={errors.beneficiary_address}
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
                <TabPane tab="Payment Information" key="2">
                  <RadioGroupFieldGroup
                    label="Payment Type"
                    name="payment_type"
                    value={this.state.payment_type}
                    onChange={this.onChange}
                    error={errors.payment_type}
                    formItemLayout={formItemLayout}
                    options={payment_types}
                  />

                  <TextFieldGroup
                    type="number"
                    label="Initial Payment"
                    name="initial_payment"
                    value={this.state.initial_payment}
                    error={errors.initial_payment}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextFieldGroup
                    type="number"
                    label="Processing Fee"
                    name="processing_fee"
                    value={this.state.processing_fee}
                    error={errors.processing_fee}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextFieldGroup
                    type="number"
                    label="Equity"
                    name="equity"
                    value={this.state.equity}
                    error={errors.equity}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <Divider />

                  <TextFieldGroup
                    type="number"
                    label="Gross Monthly Payment"
                    name="gross_monthly_payment"
                    value={this.state.gross_monthly_payment}
                    error={errors.gross_monthly_payment}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextFieldGroup
                    type="number"
                    label="Rebate"
                    name="rebate"
                    value={this.state.rebate}
                    error={errors.rebate}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextFieldGroup
                    type="number"
                    label="Net Monthly Payment"
                    name="net_monthly_payment"
                    value={this.state.net_monthly_payment}
                    error={errors.net_monthly_payment}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <Divider />

                  <DatePickerFieldGroup
                    label="First Due Date"
                    name="first_due_date"
                    value={this.state.first_due_date}
                    onChange={value => this.setState({ first_due_date: value })}
                    error={errors.first_due_date}
                    formItemLayout={formItemLayout}
                  />

                  <DatePickerFieldGroup
                    label="Last Due Date"
                    name="last_due_date"
                    value={this.state.last_due_date}
                    onChange={value => this.setState({ last_due_date: value })}
                    error={errors.last_due_date}
                    formItemLayout={formItemLayout}
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
                <TabPane tab="Sale Information" key="3">
                  <TextFieldGroup
                    label="Sales Agent"
                    name="sales_agent"
                    value={this.state.sales_agent}
                    error={errors.sales_agent}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextFieldGroup
                    label="Sales Manager"
                    name="sales_manager"
                    value={this.state.sales_manager}
                    error={errors.sales_manager}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextFieldGroup
                    label="Sales Code"
                    name="sales_code"
                    value={this.state.sales_code}
                    error={errors.sales_code}
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
                <TabPane tab="Lot Information" key="4">
                  <TextFieldGroup
                    label="Lot Name"
                    name="lot_name"
                    value={this.state.lot_name}
                    error={errors.lot_name}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />
                  <TextFieldGroup
                    label="Lot Area"
                    name="lot_area"
                    value={this.state.lot_area}
                    error={errors.lot_area}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <TextAreaGroup
                    label="Lot Address"
                    name="lot_address"
                    value={this.state.lot_address}
                    error={errors.lot_address}
                    formItemLayout={formItemLayout}
                    onChange={this.onChange}
                  />

                  <RadioGroupFieldGroup
                    label="Lot Status"
                    name="lot_status"
                    value={this.state.lot_status}
                    onChange={this.onChange}
                    error={errors.lot_status}
                    formItemLayout={formItemLayout}
                    options={lot_status}
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
                <TabPane
                  tab="Lot Map"
                  key="5"
                  style={{
                    minHeight: "1000px"
                  }}
                >
                  <SiteMap
                    selectedLots={[this.props.map.selected_lot]}
                    isReadOnly={true}
                  />
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

export default connect(mapToState)(withRouter(LotInformationForm));
