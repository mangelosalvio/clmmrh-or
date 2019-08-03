import React from "react";
import PropTypes from "prop-types";

import { Form, Select } from "antd";
const Option = Select.Option;

const SelectObjectFieldGroup = ({
  label,
  error,
  value,
  onChange,
  placeholder,
  formItemLayout,
  onSearch,
  data,
  field
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
    >
      {data.map((d, index) => (
        <Option key={index} value={index}>
          {d[field]}
        </Option>
      ))}
    </Select>
  </Form.Item>
);

SelectObjectFieldGroup.propTypes = {
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  onSearch: PropTypes.func
};

SelectObjectFieldGroup.defaultProps = {};

export default SelectObjectFieldGroup;
