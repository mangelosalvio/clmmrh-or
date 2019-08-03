import React, { Component } from "react";
import { connect } from "react-redux";
import TextFieldGroup from "../../commons/TextFieldGroup";
import axios from "axios";
import isEmpty from "../../validation/is-empty";
import MessageBoxInfo from "../../commons/MessageBoxInfo";
import Searchbar from "../../commons/Searchbar";
import "../../styles/Autosuggest.css";

import { Layout, Breadcrumb, Form, Divider, Table, Icon, message } from "antd";
import numberFormat from "../../utils/numberFormat";
import DatePickerFieldGroup from "../../commons/DatePickerFieldGroup";
import moment from "moment";
import { formItemLayout } from "./../../utils/Layouts";
import SearchSelectFieldGroup from "../../commons/SearchSelectFieldGroup";
import { transaction_options, payment_options } from "./../../utils/Options";
import SelectFieldGroup from "../../commons/SelectFieldGroup";
import classnames from "classnames";

const { Content } = Layout;
const collection_name = "water_billings";

const form_data = {
  [collection_name]: [],
  _id: "",
  member: "",
  date: null,
  transaction: "",
  payment_type: "",
  amount: "",
  check_date: null,
  check_number: "",
  account_name: "",
  or_number: "",
  received_from: "",
  errors: {}
};

const grand_total_fields = ["previous_balance", "adjustments"];

class PaymentForm extends Component {
  state = {
    title: "Payment Form",
    url: "/api/payments/",
    search_keyword: "",

    members: [],
    ...form_data
  };

  getMembers = () => {
    axios
      .get(`/api/members?s=`)
      .then(response => this.setState({ members: response.data }));
  };

  componentDidMount() {
    this.getMembers();
  }

  onChange = e => {
    const name = e.target.name;

    this.setState({ [e.target.name]: e.target.value }, () => {
      if (grand_total_fields.includes(name)) {
        this.computeSummary();
      }
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
          message.success("Transaction Saved");
          this.setState({
            ...data,
            errors: {},
            message: "Transaction Saved",

            date: data.date ? moment(data.date) : null,
            check_date: data.check_date ? moment(data.check_date) : null
          });
        })
        .catch(err => {
          message.error("You have an invalid input");
          this.setState({ errors: err.response.data });
        });
    } else {
      axios
        .post(this.state.url + this.state._id, form_data)
        .then(({ data }) => {
          message.success("Transaction Updated");
          this.setState({
            ...data,
            errors: {},
            message: "Transaction Updated",

            date: data.date ? moment(data.date) : null,
            check_date: data.check_date ? moment(data.check_date) : null
          });
        })
        .catch(err => {
          if (err.response.data.message) {
            message.error(err.response.data.message);
          }

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
        this.setState(prevState => {
          return {
            [collection_name]: [],
            ...record,

            date: record.date ? moment(record.date) : null,
            check_date: record.check_date ? moment(record.check_date) : null,
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
      })
      .catch(err => {
        message.error(err.response.data.message);
      });
  };

  onHide = () => {
    this.setState({ message: "" });
  };

  filterMember = (input, option) => {
    return (
      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    );
  };

  onMemberSelect = value => {
    const members = [...this.state.members];
    const member = members.find(element => {
      return element._id === value;
    });

    if (member) {
      this.setState({ member });
    }
  };

  render() {
    const records_column = [
      {
        title: "OR #",
        dataIndex: "or_number"
      },
      {
        title: "Member",
        dataIndex: "member.name"
      },
      {
        title: "Date",
        dataIndex: "date",
        render: (text, record) => <span>{moment(record.date).format("l")}</span>
      },
      {
        title: "Transaction",
        dataIndex: "transaction"
      },
      {
        title: "Payment Type",
        dataIndex: "payment_type",
        align: "right",
        render: (text, record) => (
          <span>{numberFormat(record.payment_type)}</span>
        )
      },
      {
        title: "Payment Amount",
        dataIndex: "amoount",
        align: "right",
        render: (text, record) => <span>{numberFormat(record.amoount)}</span>
      },
      {
        title: "Log",
        dataIndex: "logs",
        render: (text, record) => (
          <span>{record.logs[record.logs.length - 1].log}</span>
        )
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

    const members_options = this.state.members.map(member => {
      return {
        label: member.name,
        value: member._id
      };
    });
    const { errors } = this.state;

    return (
      <Content style={{ padding: "0 50px" }}>
        <div className="columns is-marginless">
          <div className="column">
            <Breadcrumb style={{ margin: "16px 0" }}>
              <Breadcrumb.Item>Home</Breadcrumb.Item>
              <Breadcrumb.Item>Payments</Breadcrumb.Item>
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
              <Divider orientation="left">Payment Information</Divider>

              <DatePickerFieldGroup
                label="Date"
                name="date"
                value={this.state.date}
                onChange={value => this.setState({ date: value })}
                error={errors.date}
                formItemLayout={formItemLayout}
              />

              <SearchSelectFieldGroup
                label="Member"
                name="member"
                value={this.state.member.name}
                onChange={this.onMemberSelect}
                error={errors.member}
                formItemLayout={formItemLayout}
                optionFilterProp="children"
                options={members_options}
                filterOption={this.filterMember}
              />

              <SelectFieldGroup
                label="Transaction"
                name="transaction"
                value={this.state.transaction}
                onChange={value => this.setState({ transaction: value })}
                error={errors.transaction}
                formItemLayout={formItemLayout}
                options={transaction_options}
              />

              <SelectFieldGroup
                label="Payment Type"
                name="payment_type"
                value={this.state.payment_type}
                onChange={value => this.setState({ payment_type: value })}
                error={errors.payment_type}
                formItemLayout={formItemLayout}
                options={payment_options}
              />

              <TextFieldGroup
                label="Amount"
                name="amount"
                value={this.state.amount}
                onChange={this.onChange}
                error={errors.amount}
                formItemLayout={formItemLayout}
              />

              <div
                className={classnames({
                  "display-none": this.state.payment_type !== "CHECK"
                })}
              >
                <Divider orientation="left">Check Details</Divider>

                <DatePickerFieldGroup
                  label="Check Date"
                  name="check_date"
                  value={this.state.check_date}
                  onChange={value => this.setState({ check_date: value })}
                  error={errors.check_date}
                  formItemLayout={formItemLayout}
                />

                <TextFieldGroup
                  label="Check Number"
                  name="check_number"
                  value={this.state.check_number}
                  onChange={this.onChange}
                  error={errors.check_number}
                  formItemLayout={formItemLayout}
                />

                <TextFieldGroup
                  label="Account Name"
                  name="account_name"
                  value={this.state.account_name}
                  onChange={this.onChange}
                  error={errors.account_name}
                  formItemLayout={formItemLayout}
                />
              </div>

              <Divider orientation="left">Others</Divider>

              <TextFieldGroup
                label="OR #"
                name="or_number"
                value={this.state.or_number}
                error={errors.or_number}
                formItemLayout={formItemLayout}
                onChange={this.onChange}
              />

              <TextFieldGroup
                label="Received From"
                name="received_from"
                value={this.state.received_from}
                error={errors.received_from}
                formItemLayout={formItemLayout}
                onChange={this.onChange}
              />

              <Form.Item className="m-t-1">
                <div className="field is-grouped">
                  <div className="control">
                    <button className="button is-small is-primary">Save</button>
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

export default connect(mapToState)(PaymentForm);
