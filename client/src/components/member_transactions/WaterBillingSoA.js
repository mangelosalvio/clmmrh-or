import React, { Component } from "react";
import axios from "axios";

import { Button, Layout, Form, Table, message } from "antd";
import { connect } from "react-redux";
import moment from "moment";
import { formItemLayout } from "./../../utils/Layouts";
import MessageBoxInfo from "../../commons/MessageBoxInfo";
import numberFormat from "../../utils/numberFormat";
import RangeDatePickerFieldGroup from "../../commons/RangeDatePickerFieldGroup";

const { Content } = Layout;

const form_data = {};

class WaterBillingSoA extends Component {
  state = {
    title: "Water Billing Statement of Account",
    url: "/api/water-billings",
    search_keyword: "",
    errors: {},
    member: "",
    members: [],
    billing_date: null,
    period_covered: [],
    records: [],
    ...form_data
  };

  componentDidMount() {
    this.getMembers();
  }

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  onSelectChange = name => {
    return value => {
      this.setState({ [name]: value });
    };
  };

  onSearch = e => {
    e.preventDefault();

    const form_data = {
      period_covered: this.state.period_covered
    };

    axios
      .post(`${this.state.url}/soa`, form_data)
      .then(response => {
        message.success("Statement of Account Printed");
      })
      .catch(err => this.setState({ errors: err.response.data }));
  };

  onDateRangeChange = (date, dateString) => {
    this.setState({
      dates: date
    });
  };

  playSound = record => {
    new Audio(`/${record.sound.location.path}`).play();
  };

  getMembers = () => {
    axios
      .get(`/api/members?s=`)
      .then(response => this.setState({ members: response.data }));
  };

  onMemberSelect = value => {
    console.log(value);
    const members = [...this.state.members];
    const member = members.find(element => {
      return element._id === value;
    });

    if (member) {
      this.setState({ member });
    } else {
      this.setState({ member: {} });
    }
  };

  filterMember = (input, option) => {
    return (
      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    );
  };

  render() {
    const { errors } = this.state;

    const records_column = [
      {
        title: "Date",
        dataIndex: "date",
        render: (text, record) => <span>{moment(record.date).format("l")}</span>
      },
      {
        title: "Transaction",
        dataIndex: "kind",
        render: (text, record) => {
          if (record.kind === "payments") {
            return <span>Payment</span>;
          } else {
            return <span>Association Dues</span>;
          }
        }
      },
      {
        title: "Reference",
        dataIndex: "reference"
      },
      {
        title: "Amount",
        dataIndex: "amount",
        align: "right",
        render: (text, record) => {
          if (record.kind === "payments") {
            return <span>({numberFormat(record.amount)})</span>;
          } else {
            return <span>{numberFormat(record.amount)}</span>;
          }
        }
      },
      {
        title: "Running",
        dataIndex: "running",
        align: "right",
        render: (text, record) => {
          if (record.running < 0) {
            return <span>({numberFormat(Math.abs(record.running))})</span>;
          } else {
            return <span>{numberFormat(record.running)}</span>;
          }
        }
      }
    ];

    return (
      <Content style={{ padding: "0 50px" }}>
        <div style={{ background: "#fff", padding: 24, minHeight: 280 }}>
          <span className="is-size-5">{this.state.title}</span> <hr />
          <MessageBoxInfo message={this.state.message} onHide={this.onHide} />
          <Form onSubmit={this.onSubmit}>
            <RangeDatePickerFieldGroup
              label="Period Covered"
              name="period_covered"
              value={this.state.period_covered}
              onChange={dates => this.setState({ period_covered: dates })}
              error={errors.period_covered}
              formItemLayout={formItemLayout}
            />

            <Form.Item>
              <div className="field is-grouped">
                <div className="control">
                  <Button type="primary" icon="print" onClick={this.onSearch}>
                    Print
                  </Button>
                </div>
              </div>
            </Form.Item>
          </Form>
          <div ref={el => (this.printableRef = el)}>
            <div>
              <div className="column has-text-centered">{this.state.title}</div>
            </div>
            <div>{this.state.member.name}</div>
            <div>
              <Table
                dataSource={this.state.records}
                columns={records_column}
                rowKey={record => record._id}
                size="small"
                pagination={false}
              />
            </div>
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

export default connect(mapToState)(WaterBillingSoA);
