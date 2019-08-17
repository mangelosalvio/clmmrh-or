import { LOGIN_USER, SET_CURRENT_LOT } from "./../actions/types";

const mapDefaultState = {
  selected_lot: null
};

export default (state = mapDefaultState, action) => {
  switch (action.type) {
    case LOGIN_USER:
      return {
        user: action.user
      };
    case SET_CURRENT_LOT:
      return {
        ...state,
        selected_lot: action.payload
      };

    default:
      return state;
  }
};
