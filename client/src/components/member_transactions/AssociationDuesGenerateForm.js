import React, { Component } from "react";
import { connect } from "react-redux";
import TextFieldGroup from "../../commons/TextFieldGroup";
import axios from "axios";
import isEmpty from "../../validation/is-empty";
import MessageBoxInfo from "../../commons/MessageBoxInfo";

import "../../styles/Autosuggest.css";
import round from "./../../utils/round";

import { Layout, Breadcrumb, Form, Divider, Table, Icon, message } from "antd";
import numberFormat from "../../utils/numberFormat";

import DatePickerFieldGroup from "../../commons/DatePickerFieldGroup";
import moment from "moment";
import { formItemLayout } from "./../../utils/Layouts";
import numeral from "numeral";

const { Content } = Layout;

const collection_name = "water_billings";

const form_data = {
  [collection_name]: [],
  _id: "",
  member: "",
  billing_date: null,
  period_covered: [],
  previous_balance: "",
  adjustments: "",
  late_charges: "",
  grand_total: "",
  meters: [],
  errors: {}
};

const grand_total_fields = ["previous_balance", "adjustments"];

class AssociationDuesGenerateForm extends Component {
  state = {
    title: "Association Dues",
    url: "/api/association-dues/",
    search_keyword: "",

    members: [],
    association_dues_lot_owner: "",
    association_dues_home_owner: "",
    late_charges_penalty: "",
    ...form_data
  };

  getMembers = () => {
    axios
      .get(`/api/members?s=`)
      .then(response => this.setState({ members: response.data }));
  };

  getRates = () => {
    axios
      .get(`/api/settings/association-dues`)
      .then(response => {
        this.setState({ ...response.data });
      })
      .catch(err => console.log(err));
  };

  componentDidMount() {
    this.getMembers();
    this.getRates();
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

    axios
      .put(this.state.url, form_data)
      .then(({ data }) => {
        message.success("Association Dues Billing Generated");
      })
      .catch(err => {
        message.error("You have an invalid input");
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
    this.getRates();
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
            [collection_name]: [],
            ...record,
            billing_date: record.billing_date
              ? moment(record.billing_date)
              : null,
            period_covered: record.period_covered
              ? [
                  moment(record.period_covered[0]),
                  moment(record.period_covered[1])
                ]
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
      const meters = [...member.meters];

      this.setState({ member, meters });
    }
  };

  onMeterDetailChange = ({ event, index }) => {
    const meters = [...this.state.meters];

    const previous_reading = meters[index].previous_reading
      ? meters[index].previous_reading
      : 0;

    const current_reading = meters[index].current_reading
      ? meters[index].current_reading
      : 0;

    const usage = round(current_reading - previous_reading);
    const amount =
      usage * this.state.water_billing_rate > this.state.water_billing_flat_rate
        ? round(usage * this.state.water_billing_rate)
        : this.state.water_billing_flat_rate;

    meters[index] = {
      ...meters[index],
      [event.target.name]: event.target.value,
      usage,
      amount
    };
    this.setState({ meters }, () => {
      this.computeSummary();
    });
  };

  computeSummary = () => {
    const grand_total = numeral(0);
    const late_charges = round(
      (this.state.previous_balance * this.state.late_charges_penalty) / 100
    );

    grand_total.add(late_charges);
    const adjustments = !isEmpty(this.state.adjustments)
      ? this.state.adjustments
      : 0;
    grand_total.add(adjustments);

    const meters = [...this.state.meters];
    meters.forEach(meter => {
      if (!isEmpty(meter.amount)) {
        grand_total.add(meter.amount);
      }
    });

    this.setState({
      late_charges,
      grand_total: round(grand_total.value())
    });
  };

  render() {
    const records_column = [
      {
        title: "SOA #",
        dataIndex: "soa_no"
      },
      {
        title: "Member",
        dataIndex: "member.name"
      },
      {
        title: "Billing Date",
        dataIndex: "billing_date",
        render: (text, record) => (
          <span>{moment(record.billing_date).format("l")}</span>
        )
      },
      {
        title: "Period Covered",
        dataIndex: "period_covered",
        render: (text, record) => (
          <span>
            {moment(record.period_covered[0]).format("l")} -{" "}
            {moment(record.period_covered[1]).format("l")}
          </span>
        )
      },
      {
        title: "Grand Total",
        dataIndex: "grand_total",
        align: "right",
        render: (text, record) => (
          <span>{numberFormat(record.grand_total)}</span>
        )
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

    const { errors } = this.state;

    return (
      <Content style={{ padding: "0 50px" }}>
        <div className="columns is-marginless">
          <div className="column">
            <Breadcrumb style={{ margin: "16px 0" }}>
              <Breadcrumb.Item>Home</Breadcrumb.Item>
              <Breadcrumb.Item>Association Dues Generate Form</Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </div>

        <div style={{ background: "#fff", padding: 24, minHeight: 280 }}>
          <span className="is-size-5">{this.state.title}</span> <hr />
          <MessageBoxInfo message={this.state.message} onHide={this.onHide} />
          {isEmpty(this.state[collection_name]) ? (
            <Form onSubmit={this.onSubmit}>
              <Divider orientation="left">Charges</Divider>

              <TextFieldGroup
                label="Home Owner"
                name="association_dues_home_owner"
                value={this.state.association_dues_home_owner}
                error={errors.association_dues_home_owner}
                formItemLayout={formItemLayout}
                disabled={true}
              />

              <TextFieldGroup
                label="Lot Owner"
                name="association_dues_lot_owner"
                value={this.state.association_dues_lot_owner}
                error={errors.association_dues_lot_owner}
                formItemLayout={formItemLayout}
                disabled={true}
              />

              <TextFieldGroup
                label="Late Charges Penalty"
                name="late_charges_penalty"
                value={this.state.late_charges_penalty}
                error={errors.late_charges_penalty}
                formItemLayout={formItemLayout}
                disabled={true}
              />

              <Divider orientation="left">Billing Information</Divider>

              <DatePickerFieldGroup
                label="Billing Date"
                name="billing_date"
                value={this.state.billing_date}
                onChange={value => this.setState({ billing_date: value })}
                error={errors.billing_date}
                formItemLayout={formItemLayout}
              />

              <DatePickerFieldGroup
                label="Due Date"
                name="due_date"
                value={this.state.due_date}
                onChange={value => this.setState({ due_date: value })}
                error={errors.due_date}
                formItemLayout={formItemLayout}
              />

              <Form.Item className="m-t-1">
                <div className="field is-grouped">
                  <div className="control">
                    <button className="button is-small is-primary">
                      Generate
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

export default connect(mapToState)(AssociationDuesGenerateForm);
