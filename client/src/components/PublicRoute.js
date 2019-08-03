import React from "react";
import { Route } from "react-router-dom";
import { connect } from "react-redux";

const PublicRoute = ({ component: Component, auth, ...rest }) => (
  <Route {...rest} render={props => <Component {...props} />} />
);

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps)(PublicRoute);
