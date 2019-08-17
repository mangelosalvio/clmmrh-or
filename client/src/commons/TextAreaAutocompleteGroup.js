import React from "react";
import PropTypes from "prop-types";
import { Form, Input, AutoComplete } from "antd";
const { TextArea } = Input;

const TextAreaAutocompleteGroup = ({
  label,
  error,
  name,
  value,
  onChange,
  placeholder,
  disabled,
  inputRef,
  formItemLayout,
  readOnly,
  rows,
  dataSource,
  onSelect,
  onSearch
}) => (
  <Form.Item
    label={label}
    validateStatus={error ? "error" : ""}
    help={error}
    {...formItemLayout}
  >
    <AutoComplete
      dataSource={dataSource}
      onSelect={onSelect}
      onSearch={onSearch}
      value={value}
      onChange={onChange}
    >
      <TextArea
        disabled={disabled}
        name={name}
        placeholder={placeholder}
        ref={inputRef}
        readOnly={readOnly}
        rows={rows}
        style={{ height: "50px" }}
      />
    </AutoComplete>
  </Form.Item>
);

TextAreaAutocompleteGroup.propTypes = {
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

TextAreaAutocompleteGroup.defaultProps = {
  text: "text",
  disabled: false,
  readOnly: false,
  autoComplete: "on"
};

export default TextAreaAutocompleteGroup;
