import React, { Component } from "react";
import { Menu, Icon } from "antd";
import { connect } from "react-redux";

import { logoutUser } from "../actions/authActions";
import axios from "axios";
import moment from "moment";

class Navbar extends Component {
  state = {
    date: null
  };

  componentDidMount() {
    axios.get("/api/logs/date").then(response => {
      this.setState({ date: response.data.date });
    });
  }

  onLogout = () => {
    this.props.logoutUser();
  };

  render() {
    const { user } = this.props.auth;

    return (
      <Menu
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={["1"]}
        style={{ lineHeight: "64px" }}
      >
        <Menu.Item>
          <span>USLS-CRE</span>
        </Menu.Item>
        {/* <Menu.Item key="1">
          <Link to="/products">
            <Icon type="shopping-cart" />
            Products
          </Link>
        </Menu.Item>
        <Menu.Item key="2">
          <Link to="/users">
            <Icon type="team" />
            Users
          </Link>
        </Menu.Item>
        <Menu.Item key="3">
          <Link to="/cashier-scan">
            <Icon type="shopping-cart" />
            Cashier
          </Link>
        </Menu.Item>
        <Menu.Item key="4">
          <Link to="/sales">
            <Icon type="shopping-cart" />
            Sales
          </Link>
        </Menu.Item> */}

        <Menu.Item style={{ float: "right" }} onClick={this.onLogout}>
          Logout
        </Menu.Item>
        <Menu.Item style={{ float: "right" }}>
          <Icon type="user" /> {user.name}
        </Menu.Item>
        <Menu.Item style={{ float: "right" }}>
          {moment(this.state.date).format("LL")}
        </Menu.Item>
      </Menu>
    );
  }
}

const mapStateToProps = state => {
  return {
    auth: state.auth
  };
};

export default connect(
  mapStateToProps,
  { logoutUser }
)(Navbar);
