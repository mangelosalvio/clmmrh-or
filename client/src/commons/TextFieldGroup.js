import React from "react";
import PropTypes from "prop-types";
import { Form, Input } from "antd";

const TextFieldGroup = ({
  label,
  error,
  name,
  type,
  value,
  onChange,
  placeholder,
  disabled,
  inputRef,
  formItemLayout,
  readOnly,
  autoComplete,
  onPressEnter
}) => (
  <Form.Item
    label={label}
    validateStatus={error ? "error" : ""}
    help={error}
    {...formItemLayout}
  >
    <Input
      disabled={disabled}
      type={type}
      onChange={onChange}
      name={name}
      placeholder={placeholder}
      value={value}
      ref={inputRef}
      readOnly={readOnly}
      autoComplete={autoComplete}
      onPressEnter={onPressEnter}
    />
  </Form.Item>
);

TextFieldGroup.propTypes = {
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  onChange: PropTypes.func,
  inputRef: PropTypes.func,
  autoComplete: PropTypes.string
};

TextFieldGroup.defaultProps = {
  text: "text",
  disabled: false,
  readOnly: false,
  autoComplete: "on"
};

export default TextFieldGroup;
