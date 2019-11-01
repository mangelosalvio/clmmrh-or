import React from "react";
import PropTypes from "prop-types";
import { Form, Input, AutoComplete } from "antd";

const TextFieldAutocompleteGroup = ({
  label,
  error,
  value,
  dataSource,
  onChange,
  onSearch,
  onSelect,
  placeholder,
  disabled,
  formItemLayout,
  readOnly
}) => (
  <Form.Item
    label={label}
    validateStatus={error ? "error" : ""}
    help={error}
    {...formItemLayout}
  >
    <AutoComplete
      disabled={disabled}
      dataSource={dataSource}
      value={value}
      onSelect={onSelect}
      onChange={onChange}
      onSearch={onSearch}
      placeholder={placeholder}
      readOnly={readOnly}
    />
  </Form.Item>
);

TextFieldAutocompleteGroup.propTypes = {
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  onChange: PropTypes.func,
  onSearch: PropTypes.func
};

TextFieldAutocompleteGroup.defaultProps = {
  disabled: false,
  readOnly: false,
  autoComplete: "on"
};

export default TextFieldAutocompleteGroup;
