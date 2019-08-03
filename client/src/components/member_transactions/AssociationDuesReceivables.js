import React, { Component } from "react";
import axios from "axios";

import { Button, Layout, Form, Table } from "antd";
import { connect } from "react-redux";
import ReactToPrint from "react-to-print";
import MessageBoxInfo from "../../commons/MessageBoxInfo";
import numberFormat from "../../utils/numberFormat";

const { Content } = Layout;

const form_data = {};

class AssociationDuesReceivables extends Component {
  state = {
    title: "Summary of A/R Association Dues",
    url: "/api/association-dues",
    search_keyword: "",
    errors: {},
    member: "",
    members: [],
    records: [],
    ...form_data
  };

  componentDidMount() {
    axios
      .post(`${this.state.url}/ar`, form_data)
      .then(response =>
        this.setState({
          records: response.data,
          errors: {}
        })
      )
      .catch(err => this.setState({ errors: err.response.data }));
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
    const records_column = [
      {
        title: "Name",
        dataIndex: "_id"
      },
      {
        title: "Balance",
        dataIndex: "running",
        align: "right",
        render: (text, record) => {
          return <span>{numberFormat(record.running)}</span>;
        }
      }
    ];

    return (
      <Content style={{ padding: "0 50px" }}>
        <div style={{ background: "#fff", padding: 24, minHeight: 280 }}>
          <span className="is-size-5">{this.state.title}</span> <hr />
          <MessageBoxInfo message={this.state.message} onHide={this.onHide} />
          <Form layout="vertical" onSubmit={this.onSubmit}>
            <Form.Item>
              <div className="field is-grouped">
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

export default connect(mapToState)(AssociationDuesReceivables);
