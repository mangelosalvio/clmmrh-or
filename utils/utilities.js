const moment = require("moment");

module.exports.getFilterQuery = (
  {
    search_period_covered,
    search_operating_room_number,
    search_surgeon,
    search_procedure,
    search_classification,
    search_main_anes,
    search_service,
    search_case,
    search_operation_status,
  },
  date_filter
) => {
  const filter_query = {
    $match: {
      ...(search_period_covered[0] &&
        search_period_covered[1] && {
          [date_filter]: {
            $gte: moment(search_period_covered[0]).startOf("day").toDate(),
            $lte: moment(search_period_covered[1]).endOf("day").toDate(),
          },
        }),
      ...(search_procedure && {
        procedure: {
          $regex: new RegExp(search_procedure, "i"),
        },
      }),
      ...(search_operating_room_number && {
        operating_room_number: search_operating_room_number,
      }),
      ...(!["All", "", null].includes(search_classification) && {
        classification: search_classification,
      }),
      ...(search_surgeon && {
        "surgeon._id": search_surgeon._id,
      }),
      ...(search_main_anes && {
        "main_anes._id": search_main_anes._id,
      }),
      ...(search_service && {
        service: search_service,
      }),
      ...(search_case &&
        search_case !== "All" && {
          case: search_case,
        }),
      ...(search_operation_status && {
        operation_status: search_operation_status,
      }),
    },
  };

  return filter_query;
};

module.exports.getFilterQueryForDateTimeOfSurgeryAndOperation = ({
  search_period_covered,
  search_operating_room_number,
  search_surgeon,
  search_procedure,
  search_classification,
  search_main_anes,
  search_service,
  search_case,
  search_operation_status,
}) => {
  const filter_query = {
    $match: {
      ...(search_period_covered[0] &&
        search_period_covered[1] && {
          $or: [
            {
              date_time_of_surgery: {
                $gte: moment(search_period_covered[0]).startOf("day").toDate(),
                $lte: moment(search_period_covered[1]).endOf("day").toDate(),
              },
            },
            {
              operation_started: {
                $gte: moment(search_period_covered[0]).startOf("day").toDate(),
                $lte: moment(search_period_covered[1]).endOf("day").toDate(),
              },
            },
          ],
        }),
      ...(search_procedure && {
        procedure: {
          $regex: new RegExp(search_procedure, "i"),
        },
      }),
      ...(search_operating_room_number && {
        operating_room_number: search_operating_room_number,
      }),
      ...(!["All", "", null].includes(search_classification) && {
        classification: search_classification,
      }),
      ...(search_surgeon && {
        "surgeon._id": search_surgeon._id,
      }),
      ...(search_main_anes && {
        "main_anes._id": search_main_anes._id,
      }),
      ...(search_service && {
        service: search_service,
      }),
      ...(search_case &&
        search_case !== "All" && {
          case: search_case,
        }),
      ...(search_operation_status && {
        operation_status: search_operation_status,
      }),
    },
  };

  return filter_query;
};
