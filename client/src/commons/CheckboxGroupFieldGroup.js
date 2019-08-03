import React from "react";
import PropTypes from "prop-types";
import { Form, Checkbox } from "antd";
const CheckboxGroup = Checkbox.Group;

const CheckboxGroupFieldGroup = ({
  label,
  error,
  name,
  value,
  onChange,
  inputRef,
  formItemLayout,
  options,
  defaultValue
}) => (
  <Form.Item
    label={label}
    validateStatus={error ? "error" : ""}
    help={error}
    {...formItemLayout}
  >
    <CheckboxGroup
      options={options}
      defaultValue={defaultValue}
      value={value}
      onChange={onChange}
      ref={inputRef}
    />
  </Form.Item>
);

CheckboxGroupFieldGroup.propTypes = {
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  inputRef: PropTypes.func,
  options: PropTypes.array,
  defaultValue: PropTypes.array,
  value: PropTypes.array
};

CheckboxGroupFieldGroup.defaultProps = {};

export default CheckboxGroupFieldGroup;
