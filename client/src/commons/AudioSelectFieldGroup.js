import React, { Component } from "react";
import PropTypes from "prop-types";
import "react-dates/initialize";
import "react-dates/lib/css/_datepicker.css";
import classnames from "classnames";
import Select from "react-select";

export default class AudioSelectFieldGroup extends Component {
  state = {
    focusedInput: false
  };

  render() {
    return (
      <div className="field">
        <label className="label">{this.props.label}</label>
        <div className="control">
          <Select
            name={this.props.name}
            value={this.props.value}
            onChange={this.props.onChange(this.props.name)}
            options={this.props.options}
            placeholder={this.props.placeholder}
          />
          {this.props.error && (
            <p
              className={classnames("help", {
                "is-danger": this.props.error
              })}
            >
              {this.props.error}
            </p>
          )}
        </div>
      </div>
    );
  }
}

SelectFieldGroup.propTypes = {
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  id: PropTypes.string,
  options: PropTypes.array.isRequired
};
