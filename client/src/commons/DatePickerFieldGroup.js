import React from "react";
import PropTypes from "prop-types";
import { Form, DatePicker } from "antd";

const DatePickerFieldGroup = ({
  label,
  name,
  value,
  error,
  disabled,
  inputRef,
  formItemLayout,
  onChange,
  showTime
}) => (
  <Form.Item
    label={label}
    validateStatus={error ? "error" : ""}
    help={error}
    {...formItemLayout}
  >
    <DatePicker
      disabled={disabled}
      onChange={onChange}
      name={name}
      value={value}
      ref={inputRef}
      showTime={showTime}
      format="MM/DD/YYYY"
      placeholder=""
    />
  </Form.Item>
);

DatePickerFieldGroup.propTypes = {
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  inputRef: PropTypes.func,
  disabled: PropTypes.bool,
  showTime: PropTypes.bool
};

DatePickerFieldGroup.defaultProps = {
  disabled: false,
  showTime: false
};

export default DatePickerFieldGroup;
