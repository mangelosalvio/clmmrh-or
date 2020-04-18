import React, { useCallback, useEffect } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { Layout, Breadcrumb, Table, Row, Col, message, Divider } from "antd";

import { sumBy } from "lodash";
import AdvancedSearchFilter from "./AdvancedSearchFilter";
import { useState } from "react";
import { addKeysToArray } from "../../utils/utilities";

const { Content } = Layout;

const title = "OR Monthly Report";

const records_column = [
  {
    title: "",
    dataIndex: "label",
    align: "center",
  },
  {
    title: "Male",
    dataIndex: "male",
    align: "center",
  },
  {
    title: "Female",
    dataIndex: "female",
    align: "center",
  },
  {
    title: "Total",
    dataIndex: "total",
    align: "center",
  },
];
const summary_records_column = [
  {
    title: "",
    dataIndex: "_id",
    align: "center",
  },
  {
    title: "Pay",
    dataIndex: "private",
    align: "center",
  },
  {
    title: "Philhealth",
    dataIndex: "housecase",
    align: "center",
  },
  {
    title: "Service",
    dataIndex: "service",
    align: "center",
  },
  {
    title: "Total",
    dataIndex: "total",
    align: "center",
  },
];

function ORMonthlyReport() {
  const [major_records, setMajorRecords] = useState([]);
  const [minor_records, setMinorRecords] = useState([]);
  const [summary_records, setSummaryRecords] = useState([]);

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
        .post("/api/operating-room-slips/or-monthly-report", form_data)
        .then((response) => {
          loading();

          let major_records = [...response.data.major_records];
          let minor_records = [...response.data.minor_records];

          const major_summary = {
            label: "Total",
            male: sumBy(major_records, (o) => o.male),
            female: sumBy(major_records, (o) => o.female),
            total: sumBy(major_records, (o) => o.total),
          };

          major_records = [
            ...major_records,
            {
              ...major_summary,
              footer: 1,
            },
          ];

          major_records = addKeysToArray(major_records);

          const minor_summary = {
            label: "Total",
            male: sumBy(minor_records, (o) => o.male),
            female: sumBy(minor_records, (o) => o.female),
            total: sumBy(minor_records, (o) => o.total),
          };

          minor_records = [
            ...minor_records,
            {
              ...minor_summary,
              footer: 1,
            },
          ];

          minor_records = addKeysToArray(minor_records);

          let summary_records = [...response.data.summary_records];

          const summary_total = {
            label: "Total",
            housecase: sumBy(summary_records, (o) => o.housecase),
            service: sumBy(summary_records, (o) => o.service),
            private: sumBy(summary_records, (o) => o.private),
            total: sumBy(summary_records, (o) => o.total),
          };

          summary_records = [
            ...summary_records,
            {
              ...summary_total,
              footer: 1,
            },
          ];

          summary_records = addKeysToArray(summary_records);

          setMajorRecords(major_records);
          setMinorRecords(minor_records);
          setSummaryRecords(summary_records);
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
            NUMBER OF PATIENTS: MAJOR OPERATIONS
          </div>
          <Table
            className="is-scrollable  or-slip-table"
            bordered={true}
            dataSource={major_records}
            columns={records_column}
            pagination={false}
            rowClassName={(record, index) => {
              if (record.footer === 1) {
                return "footer-summary has-text-weight-bold";
              }
            }}
          />
          <Divider />
          <div className="or-report-heading has-text-centered">
            NUMBER OF PATIENTS: MINOR OPERATIONS
          </div>
          <Table
            className="is-scrollable  or-slip-table"
            bordered={true}
            dataSource={minor_records}
            columns={records_column}
            pagination={false}
            rowClassName={(record, index) => {
              if (record.footer === 1) {
                return "footer-summary has-text-weight-bold";
              }
            }}
          />

          <Divider />
          <div className="or-report-heading has-text-centered">
            TOTAL NUMBER OF PATIENTS
          </div>
          <Table
            className="is-scrollable  or-slip-table"
            bordered={true}
            dataSource={summary_records}
            columns={summary_records_column}
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

export default connect(mapToState)(ORMonthlyReport);
