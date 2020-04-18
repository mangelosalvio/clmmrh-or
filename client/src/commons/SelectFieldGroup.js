import React from "react";
import PropTypes from "prop-types";
import { Form, Select } from "antd";
const Option = Select.Option;

const SelectFieldGroup = ({
  label,
  error,
  value,
  onChange,
  placeholder,
  formItemLayout,
  onSearch,
  data,
  autoFocus,
  inputRef,
  column,
}) => (
  <Form.Item
    label={label}
    validateStatus={error ? "error" : ""}
    help={error}
    {...formItemLayout}
  >
    <Select
      showSearch
      value={value}
      notFoundContent="No content found"
      placeholder={placeholder}
      filterOption={false}
      onSearch={onSearch}
      onChange={onChange}
      allowClear={true}
      autoFocus={autoFocus}
      ref={inputRef}
    >
      {(data || []).map((d, index) => (
        <Option key={d._id} value={index}>
          {d[column]}
        </Option>
      ))}
    </Select>
  </Form.Item>
);

SelectFieldGroup.propTypes = {
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  onSearch: PropTypes.func,
  autoFocus: PropTypes.bool,
  column: PropTypes.string,
};

SelectFieldGroup.defaultProps = {
  autoFocus: false,
  column: "name",
};

export default SelectFieldGroup;
