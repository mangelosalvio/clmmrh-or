import React, { useRef, useState } from "react";
import { useEffect } from "react";
import DateFilter from "./DateFilter";
import moment from "moment";
import axios from "axios";
import { message, Table } from "antd";
import {
  select,
  scaleTime,
  scaleBand,
  axisBottom,
  axisLeft,
  timeMinute,
  timeHour,
} from "d3";
import { sumBy } from "lodash";
import { addKeysToArray } from "./../../utils/utilities";
import ResizeObserver from "resize-observer-polyfill";
import round from "../../utils/round";
import { operating_room_number_labels } from "../../utils/Options";

const initialState = {
  search_date: moment(),
};

const title = "OR Complex Daily Utilization";

const useResizeObserver = (ref) => {
  const [dimensions, setDimensions] = useState(null);
  useEffect(() => {
    const observeTarget = ref.current;
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        setDimensions(entry.contentRect);
      });
    });
    resizeObserver.observe(observeTarget);
    return () => {
      resizeObserver.unobserve(observeTarget);
    };
  }, [ref]);
  return dimensions;
};

const records_column = [
  {
    title: "OR Number",
    dataIndex: "_id",
    align: "center",
    render: (value) => <span>{operating_room_number_labels[value]}</span>,
  },
  {
    title: "Total Minutes in Use",
    align: "center",
    render: (value, record) => {
      return <span>{round(sumBy(record.operations, (o) => o.minutes))}</span>;
    },
  },
  {
    title: "Total Minutes Vacant",
    align: "center",
    render: (value, record) => {
      return (
        <span>{round(1440 - sumBy(record.operations, (o) => o.minutes))}</span>
      );
    },
  },
  {
    title: "Utilization",
    align: "center",
    render: (value, record) => {
      return (
        <span>
          {round((sumBy(record.operations, (o) => o.minutes) / 1440) * 100)}%
        </span>
      );
    },
  },
];

export default function OrComplexDailyUtilization() {
  const svg_ref = useRef(null);
  const wrapper_ref = useRef(null);
  const dimensions = useResizeObserver(wrapper_ref);
  const [records, setRecords] = useState([]);
  const [date, setDate] = useState(null);

  const getRecords = ({ search_date } = { search_date: null }) => {
    if (search_date) {
      axios
        .post("/api/operating-room-slips/operations", { search_date })
        .then((response) => {
          setDate(moment(response.data.date));
          setRecords(response.data.records);
        })
        .catch((err) => {
          message.error("There was an error processing your request");
        });
    }
  };

  useEffect(() => {
    if (date) {
      const svg = select(svg_ref.current);
      svg.selectAll("rect").remove();
      const yScale = scaleBand()
        .domain(records.map((o) => o._id))
        .range([0, dimensions.height])
        .padding(0.1);

      const xScale = scaleTime()
        .domain([
          date.clone().startOf("day").toDate(),
          date.clone().endOf("day").toDate(),
        ])
        .range([0, dimensions.width]);

      const yAxis = axisLeft(yScale).tickFormat(
        (value, index) => operating_room_number_labels[value]
      );
      const xAxis = axisBottom(xScale).ticks(timeHour.every(1));

      svg.select(".y-axis").call(yAxis);
      svg
        .select(".x-axis")
        .style("transform", `translateY(${dimensions.height}px)`)
        .call(xAxis);

      records.forEach((record, index) => {
        svg
          .selectAll(`.bar-outline-${record._id}`)
          .data(record.operations)
          .join("rect")
          .attr("class", `.bar-${record._id}`)
          .attr("y", (value, index) => yScale(record._id))
          .attr("x", (value, index) => {
            const s = xScale(date.clone().startOf("day").toDate());
            return s;
          })
          .attr("width", (value, index) => {
            const s = xScale(date.clone().endOf("day").toDate());
            return s;
          })
          .attr("height", yScale.bandwidth)
          .attr("fill", "none")
          .attr("stroke-width", "0.5")
          .attr("stroke", "#357ca5");

        svg
          .selectAll(`.bar-${record._id}`)
          .data(record.operations)
          .join("rect")
          .attr("class", `.bar-${record._id}`)
          .attr("y", (value, index) => yScale(record._id))
          .attr("x", (value, index) => {
            const s = xScale(moment(value.operation_started).toDate());
            console.log(moment(value.operation_started).format("LLL"));
            return s;
          })
          .attr("width", (value, index) => {
            const minutes = timeMinute.offset(
              moment(value.operation_started).toDate(),
              value.minutes
            );
            const s = xScale(minutes) - xScale(moment(value.operation_started));

            return s;
          })
          .attr("height", yScale.bandwidth)
          .attr("fill", "#357ca5");
      });
    }

    return () => {};
  }, [records, dimensions]);

  useEffect(() => {
    getRecords({ ...initialState });
    return () => {};
  }, []);

  return (
    <div style={{ padding: "50px" }}>
      <span className="is-size-5">{title}</span> <hr />
      <DateFilter initialState={initialState} getRecords={getRecords} />
      <div style={{ padding: "16px 24px", height: "500px" }} className="flex">
        <div ref={wrapper_ref} className="flex-3">
          <svg
            ref={svg_ref}
            style={{
              width: "100%",
              height: "100%",
              outline: "1px solid #ccc",
              overflow: "visible",
            }}
          >
            <g className="y-axis" />
            <g className="x-axis" />
          </svg>
        </div>
        <div className="flex-1" style={{ padding: "0px 16px" }}>
          <Table
            className="is-scrollable  or-slip-table"
            bordered={true}
            dataSource={addKeysToArray(records)}
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
    </div>
  );
}
