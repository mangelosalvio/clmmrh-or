import React from "react";
import PropTypes from "prop-types";
import "react-dates/initialize";
import "react-dates/lib/css/_datepicker.css";
import { Select, Form } from "antd";
const { Option } = Select;

const SearchSelectFieldGroup = ({
  label,
  error,
  formItemLayout,
  name,
  value,
  onChange,
  options,
  optionFilterProp,
  filterOption
}) => (
  <Form.Item
    label={label}
    validateStatus={error ? "error" : ""}
    help={error}
    {...formItemLayout}
  >
    <Select
      showSearch
      name={name}
      value={value}
      onChange={onChange}
      optionFilterProp={optionFilterProp}
      filterOption={filterOption}
      allowClear={true}
    >
      {options.map(o => (
        <Option key={o.value} value={o.value}>
          {o.label}
        </Option>
      ))}
    </Select>
  </Form.Item>
);

SearchSelectFieldGroup.propTypes = {
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired
};

export default SearchSelectFieldGroup;
