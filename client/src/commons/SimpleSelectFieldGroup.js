import React from "react";
import PropTypes from "prop-types";
import "react-dates/initialize";
import "react-dates/lib/css/_datepicker.css";
import { Select, Form } from "antd";
const { Option } = Select;

const SimpleSelectFieldGroup = ({
  label,
  error,
  formItemLayout,
  name,
  value,
  onChange,
  options,
  disabled,
  inputRef
}) => (
  <Form.Item
    label={label}
    validateStatus={error ? "error" : ""}
    help={error}
    {...formItemLayout}
  >
    <Select
      disabled={disabled}
      name={name}
      value={value}
      onChange={onChange}
      allowClear={true}
      ref={inputRef}
    >
      {options.map(o => (
        <Option key={o} value={o}>
          {o}
        </Option>
      ))}
    </Select>
  </Form.Item>
);

SimpleSelectFieldGroup.propTypes = {
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired
};

export default SimpleSelectFieldGroup;
