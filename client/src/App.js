import React, { Component } from "react";
import "antd/dist/antd.css";
import "./App.css";
import "bulma/css/bulma.css";
import "@fortawesome/fontawesome-free/css/all.css";
import AppRouter from "./routers/AppRouter";
import { Provider } from "react-redux";
import store from "./store/configureStore";
import jwt_decode from "jwt-decode";
import setAuthToken from "./utils/setAuthToken";
import { setCurrentUser, logoutUser } from "./actions/authActions";
import moment from "moment";

if (localStorage.getItem("jwtToken")) {
  setAuthToken(localStorage.jwtToken);
  const decoded = jwt_decode(localStorage.jwtToken);
  store.dispatch(setCurrentUser(decoded));

  //check for expired token
  const currentTime = moment().valueOf() / 1000;

  if (currentTime > decoded.exp) {
    store.dispatch(logoutUser());
  }
}

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <AppRouter />
      </Provider>
    );
  }
}

export default App;
