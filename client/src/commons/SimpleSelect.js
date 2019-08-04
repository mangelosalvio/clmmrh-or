import React from "react";
import PropTypes from "prop-types";
import "react-dates/initialize";
import "react-dates/lib/css/_datepicker.css";
import { Select, Form } from "antd";
const { Option } = Select;

const SimpleSelect = ({ name, value, onChange, options, disabled, style }) => (
  <Select
    disabled={disabled}
    name={name}
    value={value}
    onChange={onChange}
    style={style}
    size="small"
  >
    {options.map(o => (
      <Option key={o} value={o}>
        {o}
      </Option>
    ))}
  </Select>
);

SimpleSelect.propTypes = {
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired
};

export default SimpleSelect;
