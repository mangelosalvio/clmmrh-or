import React, { useState } from "react";
import { onSearchSurgeon, onSearchAnes } from "../../utils/utilities";
import {
  operation_status_options,
  case_options,
  service_options,
  classification_options,
  operating_room_number_options,
} from "../../utils/Options";
import { smallFormItemLayout } from "../../utils/Layouts";
import { Col, Row, Button, PageHeader } from "antd";
import SimpleSelectFieldGroup from "../../commons/SimpleSelectFieldGroup";
import SelectFieldGroup from "../../commons/SelectFieldGroup";
import RadioGroupFieldGroup from "../../commons/RadioGroupFieldGroup";
import RangeDatePickerFieldGroup from "../../commons/RangeDatePickerFieldGroup";
import TextFieldGroup from "../../commons/TextFieldGroup";
import DatePickerFieldGroup from "../../commons/DatePickerFieldGroup";
import moment from "moment";

export default function DateFilter({
  errors = {},
  initialState = {},
  getRecords,
}) {
  const [search_date, setDate] = useState(
    initialState.search_date ? initialState.search_date : moment()
  );

  return (
    <PageHeader
      backIcon={false}
      style={{
        border: "1px solid rgb(235, 237, 240)",
      }}
      onBack={() => null}
      title="Advance Filter"
      subTitle="Enter appropriate data to filter records"
    >
      <div className="or-slip-form">
        <Row>
          <Col span={8}>
            <DatePickerFieldGroup
              label="Date"
              name="date"
              value={search_date}
              onChange={(search_date) => {
                setDate(search_date);
                getRecords({
                  search_date,
                });
              }}
              error={errors.date}
              formItemLayout={smallFormItemLayout}
            />
          </Col>
        </Row>
      </div>
    </PageHeader>
  );
}
