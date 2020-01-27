import React, { Component } from "react";
import OperativeTechniqueReport from "./OperativeTechniqueReport";
import AppendectomyOptechReport from "./AppendectomyOptechReport";

const components = {
  ob: OperativeTechniqueReport,
  appendectomy: AppendectomyOptechReport
};

export default class Optech extends Component {
  render() {
    const OptechForm = components[this.props.match.params.optech_type];

    return <OptechForm {...this.props} />;
  }
}
