import React from "react";
import PropTypes from "prop-types";
import { Select } from "antd";
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
