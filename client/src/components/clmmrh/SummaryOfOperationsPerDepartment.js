import React, { useCallback, useEffect } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { Layout, Breadcrumb, Table, Row, Col, message } from "antd";

import { sumBy } from "lodash";
import AdvancedSearchFilter from "./AdvancedSearchFilter";
import { useState } from "react";
import { addKeysToArray } from "../../utils/utilities";
import { services_label } from "../../utils/Options";

const { Content } = Layout;

const title = "Summary of Operations per Department";

const records_column = [
  {
    title: "Department",
    dataIndex: "service",
    align: "center",
    render: (service) => <span>{services_label[service]}</span>,
  },
  {
    title: "Type",
    dataIndex: "operation_type",
    align: "center",
  },
  {
    title: "Elective",
    dataIndex: "elective",
    align: "center",
  },
  {
    title: "Emergency",
    dataIndex: "emergency",
    align: "center",
  },
  {
    title: "Total",
    dataIndex: "total",
    align: "center",
  },
];

function SummaryOfOperationsPerDepartment() {
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
          "/api/operating-room-slips/summary-of-operations-per-department",
          form_data
        )
        .then((response) => {
          loading();

          let records = [...response.data];

          const records_summary = {
            label: "Total",
            elective: sumBy(records, (o) => o.elective),
            emergency: sumBy(records, (o) => o.emergency),
            total: sumBy(records, (o) => o.total),
          };

          records = [
            ...records,
            {
              ...records_summary,
              footer: 1,
            },
          ];

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
          <div className="or-report-heading has-text-centered">
            Summary of Operations per Department
          </div>
          <Table
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
          />
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

export default connect(mapToState)(SummaryOfOperationsPerDepartment);
