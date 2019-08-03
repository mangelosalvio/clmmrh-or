import React, { Component } from "react";
import axios from "axios";

import { Button, Layout, Form, Table } from "antd";
import { connect } from "react-redux";
import moment from "moment";
import ReactToPrint from "react-to-print";
import SearchSelectFieldGroup from "../../commons/SearchSelectFieldGroup";
import { verticalItemLayout } from "./../../utils/Layouts";
import MessageBoxInfo from "../../commons/MessageBoxInfo";
import numberFormat from "../../utils/numberFormat";

const { Content } = Layout;

const form_data = {};

class WaterBillingLedgerReport extends Component {
  state = {
    title: "Water Billing Ledger Report",
    url: "/api/water-billing-ledger",
    search_keyword: "",
    errors: {},
    member: "",
    members: [],
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
      member: this.state.member
    };

    axios
      .post(`${this.state.url}/ledger`, form_data)
      .then(response =>
        this.setState({
          records: response.data,
          errors: {}
        })
      )
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
    const members = [...this.state.members];
    const member = members.find(element => {
      return element._id === value;
    });

    if (member) {
      this.setState({ member });
    }
  };

  filterMember = (input, option) => {
    return (
      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    );
  };

  render() {
    const { errors } = this.state;

    const members_options = this.state.members.map(member => {
      return {
        label: member.name,
        value: member._id
      };
    });

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
            return <span>Water Billing</span>;
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
          <Form layout="vertical" onSubmit={this.onSubmit}>
            <SearchSelectFieldGroup
              label="Member"
              name="member"
              value={this.state.member.name}
              onChange={this.onMemberSelect}
              error={errors.member}
              formItemLayout={verticalItemLayout}
              optionFilterProp="children"
              options={members_options}
              filterOption={this.filterMember}
            />

            <Form.Item>
              <div className="field is-grouped">
                <div className="control">
                  <Button type="primary" icon="search" onClick={this.onSearch}>
                    Search
                  </Button>
                </div>
                <div className="control">
                  <ReactToPrint
                    trigger={() => (
                      <Button type="primary" icon="printer">
                        Print
                      </Button>
                    )}
                    content={() => this.printableRef}
                    bodyClass="print"
                  />
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

export default connect(mapToState)(WaterBillingLedgerReport);
