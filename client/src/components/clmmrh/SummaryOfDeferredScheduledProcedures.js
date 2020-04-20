import React, { useCallback, useEffect } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { Layout, Breadcrumb, Table, Row, Col, message } from "antd";

import { sumBy } from "lodash";
import AdvancedSearchFilter from "./AdvancedSearchFilter";
import { useState } from "react";
import { addKeysToArray } from "../../utils/utilities";
import { services_label } from "../../utils/Options";
import round from "../../utils/round";

const { Content } = Layout;

const title = "Summary of Deferred Scheduled Procedures";

function SummaryOfDeferredScheduledProcedures() {
  const [records, setRecords] = useState([]);

  const getRecords = useCallback(
    ({
      search_period_covered = [null, null],
      search_operating_room_number = null,
      search_surgeon = null,
      search_procedure = null,
      search_classification = null,
      search_main_anes = null,
      search_service = null,
      search_case = null,
      search_operation_status = null,
    }) => {
      const form_data = {
        search_period_covered,
        search_operating_room_number,
        search_surgeon,
        search_procedure,
        search_classification,
        search_main_anes,
        search_service,
        search_case,
        search_operation_status,
      };
      const loading = message.loading("Loading...");

      axios
        .post(
          "/api/operating-room-slips/summary-of-deferred-scheduled-procedures",
          form_data
        )
        .then((response) => {
          loading();

          let records = [...response.data];

          records = addKeysToArray(records);

          setRecords(records);
        })
        .catch((err) => {
          loading();
          message.error("There was an error processing your request");
        });
    },
    []
  );

  useEffect(() => {
    getRecords({});
    return () => {};
  }, [getRecords]);

  return (
    <Content style={{ padding: "0 50px" }}>
      <div className="columns is-marginless">
        <div className="column">
          <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item>Home</Breadcrumb.Item>
            <Breadcrumb.Item>Reports</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      <div style={{ background: "#fff", padding: 24, minHeight: 280 }}>
        <span className="is-size-5">{title}</span> <hr />
        <Row>
          <Col span={24} className="m-b-1">
            <AdvancedSearchFilter getRecords={getRecords} />
          </Col>
        </Row>
        <div style={{ overflow: "auto" }}>
          <div className="or-report-heading has-text-centered">{title}</div>

          <table className="plain-table">
            <tr>
              <th>Description</th>
              <th>Type of Procedure</th>
              <th>Subtotal A</th>
              <th>Total Procedures</th>
              <th>Type of Deferral</th>
              <th>Subtotal B</th>
              <th>
                Subtotal C<sup>1</sup>
              </th>
              <th>
                Subtotal D<sup>2</sup>
              </th>
              <th>
                Subtotal Percentage A<sup>3</sup>
              </th>
              <th>
                Subtotal Percentage B<sup>4</sup>
              </th>
              <th>Total Percentage</th>
            </tr>
            {records.map((record) => [
              <tr>
                <td rowSpan="4">{services_label[record.service]}</td>
                <td rowSpan="2">Elective</td>
                <td rowSpan="2">{record.procedures[0].count}</td>
                <td rowSpan="4">{record.done_count}</td>
                <td>Cancellation</td>
                <td>{record.procedures[0].cancel_count}</td>
                <td rowSpan="2">
                  Cancellation <br />
                  {record.cancel_count}
                </td>
                <td rowSpan="4">{record.deferred_count}</td>
                <td>
                  {record.procedures[0].count !== 0 &&
                    `${round(
                      (record.procedures[0].cancel_count /
                        record.procedures[0].count) *
                        100
                    )}%`}
                </td>
                <td rowSpan="2">
                  Cancellation <br />
                  {record.done_count !== 0 &&
                    `${round(
                      (record.cancel_count / record.done_count) * 100
                    )}%`}
                </td>
                <td rowSpan="4">
                  {record.done_count !== 0 &&
                    `${round(
                      (record.deferred_count / record.done_count) * 100
                    )}%`}
                </td>
              </tr>,
              <tr>
                <td>Postponement</td>
                <td>{record.procedures[0].postpone_count}</td>
                <td>
                  {record.procedures[0].count !== 0 &&
                    `${round(
                      (record.procedures[0].postpone_count /
                        record.procedures[0].count) *
                        100
                    )}%`}
                </td>
              </tr>,
              <tr>
                <td rowSpan="2">Emergency</td>
                <td rowSpan="2">{record.procedures[1].count}</td>
                <td>Cancellation</td>
                <td>{record.procedures[1].cancel_count}</td>
                <td rowSpan="2">
                  Postponement <br />
                  {record.postpone_count}
                </td>
                <td>
                  {record.procedures[1].count !== 0 &&
                    `${round(
                      (record.procedures[1].cancel_count /
                        record.procedures[1].count) *
                        100
                    )}%`}
                </td>
                <td rowSpan="2">
                  Postponement <br />
                  {record.done_count !== 0 &&
                    `${round(
                      (record.postpone_count / record.done_count) * 100
                    )}%`}
                </td>
              </tr>,

              <tr>
                <td>Postponement</td>
                <td>{record.procedures[1].postpone_count}</td>
                <td>
                  {record.procedures[1].count !== 0 &&
                    `${round(
                      (record.procedures[1].postpone_count /
                        record.procedures[1].count) *
                        100
                    )}%`}
                </td>
              </tr>,
            ])}
          </table>
        </div>
      </div>
    </Content>
  );
}

const mapToState = (state) => {
  return {
    auth: state.auth,
  };
};

export default connect(mapToState)(SummaryOfDeferredScheduledProcedures);
