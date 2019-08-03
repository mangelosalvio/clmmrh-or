import axios from "axios";

import { SET_CURRENT_LOT } from "./types";

export const setCurrentLot = ({ lot, history }) => dispatch => {
  history.push("/lot");
  dispatch({
    type: SET_CURRENT_LOT,
    payload: lot
  });
};
