import React, { useCallback, useEffect } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { Layout, Breadcrumb, Table, Row, Col, message, Divider } from "antd";

import { sumBy } from "lodash";
import AdvancedSearchFilter from "./AdvancedSearchFilter";
import { useState } from "react";
import { addKeysToArray } from "../../utils/utilities";
import { operation_type_options } from "../../utils/Options";

const { Content } = Layout;

const title = "Summary of Operations";

const records_column = [
  {
    title: "RVU Code",
    dataIndex: "rvs.rvs_code",
    align: "center",
    width: 50,
  },
  {
    title: "Operations",
    dataIndex: "rvs.rvs_description",
    render: (value) => <div style={{ whiteSpace: "pre-wrap" }}>{value}</div>,
  },
  {
    title: "Charity",
    dataIndex: "service",
    align: "center",
    width: 20,
  },
  {
    title: "PHIC",
    dataIndex: "housecase",
    align: "center",
    width: 20,
  },
  {
    title: "Pay",
    dataIndex: "private",
    align: "center",
    width: 20,
  },
  {
    title: "Total",
    dataIndex: "total",
    align: "center",
    width: 20,
  },
];

function OperationsSummaryReport() {
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
        .post("/api/operating-room-slips/operations-summary", form_data)
        .then((response) => {
          loading();

          setRecords(response.data);
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
          <div className="or-report-heading has-text-centered">
            Summary of Operations
          </div>

          {records.map((transactions, index) => {
            const summary = {
              footer: 1,
              label: "Total",
              service: sumBy(transactions, (o) => o.service),
              housecase: sumBy(transactions, (o) => o.housecase),
              private: sumBy(transactions, (o) => o.private),
              total: sumBy(transactions, (o) => o.total),
            };

            let records = [...transactions, summary];
            records = addKeysToArray(records);

            return [
              <Table
                key="1"
                className="is-scrollable  or-slip-table"
                bordered={true}
                dataSource={records}
                columns={records_column}
                pagination={false}
                rowClassName={(record, index) => {
                  if (record.footer === 1) {
                    return "footer-summary has-text-weight-bold";
                  }
                }}
                title={() => {
                  return (
                    <div className="has-text-centered or-report-heading">
                      {operation_type_options[index].toUpperCase()} OPERATIONS
                    </div>
                  );
                }}
              />,
              <Divider key="2" />,
            ];
          })}
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

export default connect(mapToState)(OperationsSummaryReport);
