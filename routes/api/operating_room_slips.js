const express = require("express");
const router = express.Router();
const OperatingRoomSlip = require("./../../models/OperatingRoomSlip");
const Anesthesiologist = require("./../../models/Anesthesiologist");
const Nurse = require("./../../models/Nurse");
const Counter = require("./../../models/Counter");
const isEmpty = require("./../../validators/is-empty");
const filterId = require("./../../utils/filterId");
const validateInput = require("./../../validators/operating_room_slips");
const multer = require("multer");
const fs = require("fs");
const moment = require("moment-timezone");
const round = require("./../../utils/round");
const numberFormat = require("./../../utils/numberFormat");
const constants = require("./../../config/constants");
const numeral = require("numeral");
const async = require("async");
const net = require("net");

const Model = OperatingRoomSlip;

router.get("/:id", (req, res) => {
  Model.findById(req.params.id)
    .then(record => res.json(record))
    .catch(err => console.log(err));
});

router.get("/", (req, res) => {
  const form_data = isEmpty(req.query.s)
    ? {}
    : {
        $or: [
          {
            name: {
              $regex: new RegExp(req.query.s, "i")
            }
          },
          {
            procedure: {
              $regex: new RegExp(req.query.s, "i")
            }
          }
        ]
      };

  Model.find(form_data)
    .sort({
      _id: -1,
      name: 1
    })
    .then(records => {
      return res.json(records);
    })
    .catch(err => console.log(err));
});

router.put("/", (req, res) => {
  const { isValid, errors } = validateInput(req.body);

  if (!isValid) {
    return res.status(401).json(errors);
  }
  const body = filterId(req);
  const user = req.body.user;

  const datetime = moment.tz(moment(), process.env.TIMEZONE);
  const log = `Added by ${user.name} on ${datetime.format("LLL")}`;

  const logs = [
    {
      user,
      datetime,
      log
    }
  ];

  const newRecord = new Model({
    ...body,
    logs
  });
  newRecord
    .save()
    .then(record => {
      return res.json(record);
    })
    .catch(err => console.log(err));
});

router.post("/logs", (req, res) => {
  const from_date = moment(req.body.period_covered[0]);
  const to_date = moment(req.body.period_covered[1]);

  OperatingRoomSlip.find({
    date_time_of_surgery: {
      $gte: from_date.startOf("day").toDate(),
      $lte: to_date.endOf("day").toDate()
    }
  }).then(records => res.json(records));
});

router.post("/display-monitor", (req, res) => {
  async.parallel(
    {
      on_going: cb => {
        OperatingRoomSlip.aggregate([
          {
            $sort: {
              case_order: 1,
              date_time_of_surgery: -1
            }
          },
          {
            $match: {
              operation_status: constants.ON_GOING
            }
          },
          {
            $group: {
              _id: "$operating_room_number",
              operating_room_number: {
                $first: "$operating_room_number"
              },
              service: {
                $first: "$service"
              },
              name: {
                $first: "$name"
              },
              case: {
                $first: "$case"
              },
              classification: {
                $first: "$classification"
              },
              age: {
                $first: "$age"
              },
              ward: {
                $first: "$ward"
              },
              procedure: {
                $first: "$procedure"
              },
              surgeon: {
                $first: "$surgeon"
              },
              main_anes: {
                $first: "$main_anes"
              },
              case_order: {
                $first: "$case_order"
              }
            }
          },
          {
            $limit: 8
          },
          {
            $sort: {
              operating_room_number: 1
            }
          }
        ]).exec(cb);
      },
      pacu: cb => {
        OperatingRoomSlip.aggregate([
          {
            $match: {
              operation_status: constants.ON_RECOVERY
            }
          },
          {
            $sort: {
              date_time_of_surgery: -1,
              case_order: 1
            }
          },
          {
            $limit: 8
          }
        ]).exec(cb);
      },
      in_holding_room: cb => {
        OperatingRoomSlip.aggregate([
          {
            $match: {
              operation_status: constants.IN_HOLDING_ROOM
            }
          },
          {
            $sort: {
              date_time_of_surgery: -1,
              case_order: 1
            }
          },
          {
            $limit: 8
          }
        ]).exec(cb);
      },
      elective_list: cb => {
        OperatingRoomSlip.aggregate([
          {
            $match: {
              operation_status: constants.ON_SCHEDULE,
              case: constants.ELECTIVE_SURGERY,
              date_time_of_surgery: {
                $lte: moment.tz(moment(), process.env.TIMEZONE).toDate()
              }
            }
          },
          {
            $sort: {
              date_time_of_surgery: -1,
              case_order: 1
            }
          },
          {
            $limit: 16
          }
        ]).exec(cb);
      },
      emergency_list: cb => {
        OperatingRoomSlip.aggregate([
          {
            $match: {
              operation_status: constants.ON_SCHEDULE,
              case: constants.EMERGENCY_PROCEDURE,
              date_time_of_surgery: {
                $lte: moment.tz(moment(), process.env.TIMEZONE).toDate()
              }
            }
          },
          {
            $sort: {
              date_time_of_surgery: -1,
              case_order: 1
            }
          },
          {
            $limit: 16
          }
        ]).exec(cb);
      },
      charge_nurse: cb => {
        Nurse.find({
          assignment: constants.CHARGE_NURSE
        })
          .sort({
            last_name: 1,
            first_name: 1
          })
          .exec(cb);
      },
      receiving_nurse: cb => {
        Nurse.find({
          assignment: constants.RECEIVING_NURSE
        })
          .sort({
            last_name: 1,
            first_name: 1
          })
          .exec(cb);
      },
      holding_room_nurse: cb => {
        Nurse.find({
          assignment: constants.HOLDING_ROOM_NURSE
        })
          .sort({
            last_name: 1,
            first_name: 1
          })
          .exec(cb);
      },
      on_duty_nurse: cb => {
        Nurse.find({
          on_duty: true
        })
          .sort({
            last_name: 1,
            first_name: 1
          })
          .exec(cb);
      },
      pacu_anes: cb => {
        Anesthesiologist.find({
          assignment: constants.PACU_ANES
        })
          .sort({
            last_name: 1,
            first_name: 1
          })
          .exec(cb);
      },
      team_captain_anes: cb => {
        Anesthesiologist.find({
          assignment: constants.TEAM_CAPTAIN_ANES
        })
          .sort({
            last_name: 1,
            first_name: 1
          })
          .exec(cb);
      }
    },
    (err, result) => {
      let arr_return = {};
      if (result) {
        arr_return = {
          ...result
        };

        let on_going = [...result.on_going];
        let pacu = [...result.pacu];
        let elective_list = [...result.elective_list];
        let emergency_list = [...result.emergency_list];

        let in_holding_room = [...result.in_holding_room];

        pacu.length = constants.OPERATING_ROOM_NUMBER_OPTIONS.length;
        in_holding_room.length = constants.OPERATING_ROOM_NUMBER_OPTIONS.length;
        elective_list.length = 16;
        emergency_list.length = 16;

        arr_return["on_going"] = on_going;
        arr_return["pacu"] = pacu;
        arr_return["in_holding_room"] = in_holding_room;
        arr_return["elective_list"] = elective_list;
        arr_return["emergency_list"] = emergency_list;

        return res.json(arr_return);
      }
    }
  );
});

router.post("/:id", (req, res) => {
  const { isValid, errors } = validateInput(req.body);

  if (!isValid) {
    return res.status(401).json(errors);
  }

  const filtered_body = filterId(req);
  const user = req.body.user;

  Model.findById(req.params.id).then(record => {
    if (record) {
      const datetime = moment.tz(moment(), process.env.TIMEZONE);
      const log = `Modified by ${user.name} on ${datetime.format("LLL")}`;

      const logs = [
        ...record.logs,
        {
          user,
          datetime,
          log
        }
      ];

      const body = {
        ...filtered_body,
        logs
      };

      record.set({
        ...body
      });

      record
        .save()
        .then(record => {
          return res.json(record);
        })
        .catch(err => console.log(err));
    } else {
      console.log("ID not found");
    }
  });
});

router.delete("/:id", (req, res) => {
  Model.findByIdAndRemove(req.params.id)
    .then(response => res.json({ success: 1 }))
    .catch(err => console.log(err));
});

module.exports = router;
