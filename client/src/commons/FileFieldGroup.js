import React from "react";
import classnames from "classnames";
import PropTypes from "prop-types";
import isEmpty from "./../validation/is-empty";

const FileFieldGroup = ({
  label,
  error,
  name,
  onChange,
  placeholder,
  disabled,
  inputRef,
  filename,
  file,
  onPlay
}) => (
  <div className="field">
    <label className="label">{label}</label>
    <div className="control">
      <div className="columns">
        <div className="column">
          <div className="file has-name">
            <label className="file-label">
              <input
                className="file-input"
                type="file"
                id={name}
                name={name}
                ref={inputRef}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
              />
              <span className="file-cta">
                <span className="file-icon">
                  <i className="fas fa-upload" />
                </span>
                <span className="file-label">Choose a file…</span>
              </span>
              <span
                className={classnames("file-name", {
                  "is-hidden": isEmpty(filename)
                })}
              >
                {filename}
              </span>
            </label>
            {file && file.path && (
              <div className="field" style={{ marginLeft: "16px" }}>
                <input
                  type="button"
                  value="Play"
                  className="button is-info"
                  onClick={onPlay}
                />
              </div>
            )}
          </div>
          {error && (
            <p
              className={classnames("help", {
                "is-danger": error
              })}
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
);

FileFieldGroup.propTypes = {
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  inputRef: PropTypes.func
};

FileFieldGroup.defaultProps = {
  text: "text"
};

export default FileFieldGroup;
