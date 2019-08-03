import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { loginUser } from "./../actions/authActions";
import { connect } from "react-redux";
import TextFieldGroup from "./../commons/TextFieldGroup";
import DeveloperFooter from "./../utils/DeveloperFooter";
import companyLogo from "./../images/clmmrh_logo.png";
import footerLogo from "./../images/doh_logo.png";

import { Form } from "antd";

class LoginForm extends Component {
  state = {
    errors: {},
    username: "",
    password: ""
  };

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  onSubmit = e => {
    e.preventDefault();

    const form_data = {
      username: this.state.username,
      password: this.state.password
    };

    this.props.loginUser(form_data, this.props.history);
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.errors) {
      this.setState({ errors: nextProps.errors });
    }
  }

  componentDidMount() {
    if (this.props.auth.isAuthenticated) {
      this.props.history.push("/or-slip");
    }
  }

  render() {
    const { errors } = this.state;
    return (
      <div className="container">
        <div className="columns">
          <div
            className="column box is-half is-offset-one-quarter"
            style={{ padding: "2rem" }}
          >
            <div
              className="has-text-centered has-text-weight-bold is-size-4"
              style={{ paddingBottom: "1rem" }}
            >
              <img src={companyLogo} />
              <br />
              <br />
              OPERATING ROOM MANAGEMENT SYSTEM
            </div>

            <Form layout="vertical" onSubmit={this.onSubmit}>
              <TextFieldGroup
                label="Username"
                error={errors.username}
                name="username"
                value={this.state.username}
                onChange={this.onChange}
              />

              <TextFieldGroup
                type="password"
                label="Password"
                error={errors.password}
                name="password"
                value={this.state.password}
                onChange={this.onChange}
              />

              <Form.Item>
                <input
                  type="submit"
                  value="Log in"
                  className="button is-primary"
                />
              </Form.Item>
              <div
                className="has-text-centered"
                style={{ marginBottom: "1rem" }}
              >
                <img src={footerLogo} style={{ width: "300px" }} />
              </div>
              <DeveloperFooter />
            </Form>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    errors: state.errors,
    auth: state.auth
  };
};

export default connect(
  mapStateToProps,
  { loginUser }
)(withRouter(LoginForm));
