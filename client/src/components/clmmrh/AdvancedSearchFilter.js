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

export default function AdvancedSearchFilter({ errors = {}, getRecords }) {
  const [search_period_covered, setSearchPeriodCovered] = useState([
    null,
    null,
  ]);
  const [search_operating_room_number, setSearchOperatingRoomNumber] = useState(
    null
  );
  const [search_surgeon, setSearchSurgeon] = useState(null);
  const [search_procedure, setSearchProcedure] = useState(null);
  const [search_classification, setSearchClassification] = useState(null);
  const [search_main_anes, setSearchMainAnes] = useState(null);
  const [search_service, setSearchService] = useState(null);
  const [search_case, setSearchCase] = useState(null);
  const [search_operation_status, setSearchOperationStatus] = useState(null);
  const [options, setOptions] = useState({
    surgeons: [],
    main_anes: [],
  });

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
            <RangeDatePickerFieldGroup
              label="Date"
              name="period_covered"
              value={search_period_covered}
              onChange={(dates) => setSearchPeriodCovered(dates)}
              error={errors.period_covered}
              formItemLayout={smallFormItemLayout}
            />
          </Col>
          <Col span={8}>
            <SimpleSelectFieldGroup
              label="OR Number"
              name="search_operating_room_number"
              value={search_operating_room_number}
              onChange={(value) => setSearchOperatingRoomNumber(value)}
              formItemLayout={smallFormItemLayout}
              error={errors.operating_room_number}
              options={operating_room_number_options}
            />
          </Col>
          <Col span={8}>
            <SelectFieldGroup
              label="Surgeon"
              name="search_surgeon"
              value={search_surgeon && search_surgeon.full_name}
              onChange={(index) => setSearchSurgeon(options.surgeons[index])}
              onSearch={(value) =>
                onSearchSurgeon({ value, options, setOptions })
              }
              error={errors.search_surgeon}
              formItemLayout={smallFormItemLayout}
              data={options.surgeons}
              column="full_name"
            />
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <TextFieldGroup
              label="Procedure"
              name="search_procedure"
              value={search_procedure}
              error={errors.search_procedure}
              formItemLayout={smallFormItemLayout}
              onChange={(e) => setSearchProcedure(e.target.value)}
            />
          </Col>
          <Col span={8}>
            <RadioGroupFieldGroup
              label="Classification"
              name="search_classification"
              value={search_classification}
              onChange={(e) => {
                setSearchClassification(e.target.value);
              }}
              error={errors.search_classification}
              formItemLayout={smallFormItemLayout}
              options={["All", ...classification_options]}
            />
          </Col>
          <Col span={8}>
            <SelectFieldGroup
              label="Main Anes"
              name="search_main_anes"
              value={search_main_anes && search_main_anes.full_name}
              onChange={(index) =>
                setSearchMainAnes(options.anesthesiologists[index])
              }
              onSearch={(value) => onSearchAnes({ value, options, setOptions })}
              error={errors.search_main_anes}
              formItemLayout={smallFormItemLayout}
              data={options.anesthesiologists}
              column="full_name"
            />
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <SimpleSelectFieldGroup
              label="Service"
              name="search_service"
              value={search_service}
              onChange={(value) => setSearchService(value)}
              formItemLayout={smallFormItemLayout}
              error={errors.search_service}
              options={service_options}
            />
          </Col>
          <Col span={8}>
            <SimpleSelectFieldGroup
              label="Case"
              name="search_case"
              value={search_case}
              onChange={(value) => setSearchCase(value)}
              formItemLayout={smallFormItemLayout}
              error={errors.search_case}
              options={["All", ...case_options]}
            />
          </Col>
          <Col span={8}>
            <SimpleSelectFieldGroup
              label="Status"
              name="search_operation_status"
              value={search_operation_status}
              onChange={(value) => setSearchOperationStatus(value)}
              formItemLayout={smallFormItemLayout}
              error={errors.search_operation_status}
              options={operation_status_options}
            />
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Row>
              <Col offset={8} span={12}>
                <Button
                  type="primary"
                  size="small"
                  icon="search"
                  onClick={() =>
                    getRecords({
                      search_period_covered,
                      search_operating_room_number,
                      search_surgeon,
                      search_procedure,
                      search_classification,
                      search_main_anes,
                      search_service,
                      search_case,
                      search_operation_status,
                    })
                  }
                >
                  Search
                </Button>
              </Col>
            </Row>
          </Col>
          <Col span={8}></Col>
          <Col span={8}></Col>
        </Row>
      </div>
    </PageHeader>
  );
}
