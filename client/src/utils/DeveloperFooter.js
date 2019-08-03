import React from "react";

const DeveloperFooter = ({ style }) => (
  <div className="has-text-centered DeveloperFooter" style={style}>
    <div
      className="tooltip"
      data-tooltip="Developer : Michael Salvio ; msalvio.technologies@gmail.com"
      style={{ display: "inline-block", textAlign: "left", lineHeight: "12px" }}
    >
      <span style={{ color: "#c0c0c0" }}>powered by</span> <br />
      <strong>msalvio technologies</strong>
    </div>
  </div>
);

export default DeveloperFooter;
