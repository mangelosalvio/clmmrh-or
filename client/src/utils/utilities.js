import { message } from "antd";
import axios from "axios";

export const addKeysToArray = (list) => {
  return list.map((o, i) => {
    return {
      ...o,
      key: i,
    };
  });
};

export const onSearchSurgeon = ({ value, options, setOptions }) => {
  axios
    .get(`/api/surgeons/?s=${value}`)
    .then((response) => {
      setOptions({
        ...options,
        surgeons: response.data,
      });
    })
    .catch((err) => {
      message.error("There was an error searching for surgeons.");
    });
};

export const onSearchAnes = ({ value, options, setOptions }) => {
  axios
    .get(`/api/anesthesiologists/?s=${value}`)
    .then((response) =>
      setOptions({
        ...options,
        anesthesiologists: response.data,
      })
    )
    .catch((err) => {
      message.error(
        "There was an error loading searching for anesthesiologists."
      );
    });
};
