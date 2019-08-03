import { createStore, combineReducers, compose, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import userReducer from "./../reducers/users";
import errorsReducer from "./../reducers/errors";
import mapReducer from "../reducers/mapReducer";

const initialState = {};
const middleware = [thunk];

const composeEnhancers =
  typeof window === "object" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
      })
    : compose;

const store = createStore(
  combineReducers({
    auth: userReducer,
    errors: errorsReducer,
    map: mapReducer
  }),
  initialState,
  composeEnhancers(applyMiddleware(...middleware))
);

export default store;
