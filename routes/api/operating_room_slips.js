const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { Sequelize } = require("sequelize");
const sortBy = require("lodash").sortBy;
const sqldatabase = require("./../../config/sqldatabase");

const OperatingRoomSlip = require("./../../models/OperatingRoomSlip");
const ORSchedule = require("./../../models/ORSchedule");
const Anesthesiologist = require("./../../models/Anesthesiologist");
const Nurse = require("./../../models/Nurse");
const Counter = require("./../../models/Counter");
const isEmpty = require("./../../validators/is-empty");
const filterId = require("./../../utils/filterId");
const asyncForeach = require("./../../utils/asyncForeach");
const validateInput = require("./../../validators/operating_room_slips");
const multer = require("multer");
const fs = require("fs");
const moment = require("moment-timezone");
const round = require("./../../utils/round");
const numberFormat = require("./../../utils/numberFormat");
const constants = require("./../../config/constants");
const util = require("util");
const capitalize = require("lodash").capitalize;
const startCase = require("lodash").startCase;
const toLower = require("lodash").toLower;
const toUpper = require("lodash").toUpper;

const numeral = require("numeral");
const async = require("async");
const net = require("net");
const Op = Sequelize.Op;

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
      const io = req.app.get("socketio");
      io.emit("refresh-display", true);
      return res.json(record);
    })
    .catch(err => console.log(err));
});

router.post("/advanced-search", (req, res) => {
  const {
    search_period_covered,
    search_operating_room_number,
    search_surgeon,
    search_procedure,
    search_classification,
    search_main_anes,
    search_service
  } = req.body;

  const form_data = {
    ...(search_period_covered[0] &&
      search_period_covered[1] && {
        date_time_of_surgery: {
          $gte: moment(search_period_covered[0])
            .startOf("day")
            .toDate(),
          $lte: moment(search_period_covered[1])
            .endOf("day")
            .toDate()
        }
      }),
    ...(search_procedure && {
      procedure: {
        $regex: new RegExp(search_procedure, "i")
      }
    }),
    ...(search_operating_room_number && {
      operating_room_number: search_operating_room_number
    }),
    ...(!["All", ""].includes(search_classification) && {
      classification: search_classification
    }),
    ...(search_surgeon && {
      "surgeon._id": search_surgeon._id
    }),
    ...(search_main_anes && {
      "main_anes._id": search_main_anes._id
    }),
    ...(search_service && {
      service: search_service
    })
  };

  OperatingRoomSlip.find(form_data)
    .sort({
      _id: -1,
      name: 1
    })
    .then(records => res.json(records));
});

/**
 * GET PATIENT FROM BIZBOX
 */

router.post("/patients", (req, res) => {
  const search_text = req.body.search_text;

  /*  Person.findAll({
    where: {
      name: {
        [Op.like]: `${search_text}%`
      }
    },
    order: [["name", "ASC"]],
    limit: 50
  }).then(records => {
    return res.json(records);
  });
 */

  const query = `SELECT * FROM (SELECT *,ROW_NUMBER() OVER (PARTITION BY fullname
  ORDER BY dcno) num FROM ( 
      SELECT TOP 10 *
      FROM    (SELECT TOP 10 dc.dcno,dc.fullname,dc.fname,dc.mname,dc.lname, 
                          dc.abbrev,ad.age,pat.sex,dc.rmno,
                          ad.weight,ad.weightunit,dc.birthdate,
                          CAST (ad.admindiagnosis AS varchar(255)) diagnosis,
                          CONVERT(varchar(12),ad.admdate,101) regisdate,
                          addm.address, ad.hospplan
              FROM datacenter dc INNER JOIN admission ad ON dc.dcno = ad.dcno
              INNER JOIN patient pat ON dc.dcno = pat.dcno 
              INNER JOIN addrmstr addm ON dc.dcno = addm.dcno
              WHERE (dc.fullname LIKE '${search_text}%' OR fname LIKE '${search_text}%')
    AND (addm.address is not null and addm.address <> '(N/A)')
              ORDER BY ad.regdate DESC
              UNION
              SELECT TOP 10 dc.dcno,dc.fullname,dc.fname,dc.mname,dc.lname,
                          dc.abbrev,opd.age,pat.sex,dc.rmno,
                          opd.weight,opd.weightunit,dc.birthdate,
                          CAST (opd.initdiagnosis AS varchar(255)) diagnosis,
                          CONVERT(varchar(12),opd.regdate,101) regisdate,
                          addm.address, opd.hospplan
              FROM datacenter dc INNER JOIN outpatient opd ON dc.dcno = opd.dcno
              INNER JOIN patient pat ON dc.dcno = pat.dcno
              INNER JOIN addrmstr addm ON dc.dcno = addm.dcno
              WHERE (dc.fullname LIKE '${search_text}%' OR fname LIKE '${search_text}%')
    AND (addm.address is not null and addm.address <> '(N/A)')
              ORDER BY opd.regdate DESC
              ) united ORDER BY convert(date,united.regisdate) DESC) gani) gd
  WHERE gd.num = 1 `;

  /* const query = `SELECT * FROM (SELECT *,ROW_NUMBER() OVER (PARTITION BY fullname
    ORDER BY dcno) num FROM ( 
        SELECT TOP 10 *
        FROM    (SELECT TOP 10 dc.dcno,dc.fullname,dc.fname,dc.mname,dc.lname, 
                            dc.abbrev,ad.age,pat.sex,dc.rmno,
                            ad.weight,ad.weightunit,dc.birthdate,
                            CAST (ad.admindiagnosis AS varchar(255)) diagnosis,
                            CONVERT(varchar(12),ad.admdate,101) regisdate,
                            addm.address, ad.hospplan
                FROM datacenter dc INNER JOIN admission ad ON dc.dcno = ad.dcno
                INNER JOIN patient pat ON dc.dcno = pat.dcno 
                INNER JOIN addrmstr addm ON dc.dcno = addm.dcno
                WHERE (dc.fullname LIKE '${search_text}%' OR fname LIKE '${search_text}%')
      AND (addm.address is not null and addm.address <> '(N/A)')
                ORDER BY ad.regdate DESC
                ) united ORDER BY convert(date,united.regisdate) DESC) gani) gd
    WHERE gd.num = 1 `; */

  //console.log(query);

  /* const query = `select * from Persons where name like '${search_text}%'`; */

  sqldatabase
    .query(query, { type: sqldatabase.QueryTypes.SELECT })
    .then(records => {
      let updated_records = [...records];

      updated_records = updated_records.map(record => {
        const { fname, mname, lname } = record;
        const fullname = `${toUpper(lname.trim())}, ${startCase(
          toLower(fname.trim())
        )} ${startCase(toLower(mname.trim()))}`;

        return {
          ...record,
          fullname
        };
      });

      return res.json(updated_records);
    })
    .catch(err => res.status(500).json(err));
});

router.post("/or-elective-operations", (req, res) => {
  const now = moment.tz(moment(), process.env.TIMEZONE);

  async.parallel(
    {
      electives: cb => {
        OperatingRoomSlip.aggregate([
          {
            $match: {
              date_time_of_surgery: {
                $gte: now
                  .clone()
                  .add({ day: 1 })
                  .startOf("day")
                  .toDate(),
                $lte: now
                  .clone()
                  .add({ day: 1 })
                  .endOf("day")
                  .toDate()
              },
              operating_room_number: {
                $exists: true,
                $nin: ["", null]
              }
            }
          },
          {
            $sort: {
              case_order: 1
            }
          },
          {
            $group: {
              _id: "$operating_room_number",
              items: {
                $push: {
                  hospital_number: "$hospital_number",
                  ward: "$ward",
                  name: "$name",
                  age: "$age",
                  sex: "$sex",
                  diagnosis: "$diagnosis",
                  procedure: "$procedure",
                  surgeon: "$surgeon",
                  main_anes: "$main_anes",
                  classification: "$classification",
                  case_order: "$case_order"
                }
              }
            }
          },
          {
            $sort: {
              _id: 1
            }
          }
        ]).exec(cb);
      },
      waiting_electives: cb => {
        OperatingRoomSlip.aggregate([
          {
            $match: {
              date_time_of_surgery: {
                $gte: now
                  .clone()
                  .add({ day: 1 })
                  .startOf("day")
                  .toDate(),
                $lte: now
                  .clone()
                  .add({ day: 1 })
                  .endOf("day")
                  .toDate()
              },
              $or: [
                {
                  operating_room_number: {
                    $exists: false
                  }
                },
                {
                  operating_room_number: {
                    $in: ["", null]
                  }
                }
              ]
            }
          },
          {
            $sort: {
              case_order: 1
            }
          }
        ]).exec(cb);
      },
      schedule: cb => {
        ORSchedule.findOne({
          "period.0": {
            $lte: now
              .clone()
              .add({ day: 1 })
              .endOf("day")
              .toDate()
          },
          "period.1": {
            $gte: now
              .clone()
              .add({ day: 1 })
              .startOf("day")
              .toDate()
          }
        }).exec(cb);
      }
    },
    (err, result) => {
      let arr_return = {
        ...result
      };

      let electives = [...result.electives];

      /* console.log(util.inspect(result.waiting_electives, false, null, true)); */

      let room_electives = [];

      Object.entries(constants.OPERATING_ROOMS).forEach(([key, value]) => {
        let _id = value;
        let elective_room = electives.find(o => o._id === key);
        let items = elective_room ? [...elective_room.items] : [];

        if (items.length <= 0) {
          items = [
            {
              procedure: "STATS"
            }
          ];
        }

        room_electives = [
          ...room_electives,
          {
            _id,
            items
          }
        ];
      });

      let on_duty_anes = [];
      let team_captain_anes = [];
      let pacu_anes = [];
      const schedule = result.schedule;

      if (schedule) {
        on_duty_anes = schedule.on_duty;
        pacu_anes = schedule.pacu;
        team_captain_anes = schedule.team_captains;
      }

      arr_return["on_duty_anes"] = on_duty_anes;
      arr_return["team_captain_anes"] = team_captain_anes;
      arr_return["pacu_anes"] = pacu_anes;
      arr_return["electives"] = room_electives;

      /**
       * ORDER ROOMS
       */

      return res.json(arr_return);
    }
  );
});

router.post("/logs", (req, res) => {
  const {
    search_period_covered,
    search_operating_room_number,
    search_surgeon,
    search_procedure,
    search_classification,
    search_main_anes
  } = req.body;

  const form_data = {
    ...(search_period_covered[0] &&
      search_period_covered[1] && {
        date_time_of_surgery: {
          $gte: moment(search_period_covered[0])
            .startOf("day")
            .toDate(),
          $lte: moment(search_period_covered[1])
            .endOf("day")
            .toDate()
        }
      }),
    ...(search_procedure && {
      procedure: {
        $regex: new RegExp(search_procedure, "i")
      }
    }),
    ...(search_operating_room_number && {
      operating_room_number: search_operating_room_number
    }),
    ...(!["All", ""].includes(search_classification) && {
      classification: search_classification
    }),
    ...(search_surgeon && {
      "surgeon._id": search_surgeon._id
    }),
    ...(search_main_anes && {
      "main_anes._id": search_main_anes._id
    })
  };

  OperatingRoomSlip.find(form_data)
    .sort({
      date_time_of_surgery: 1
    })
    .then(records => res.json(records));
});

router.post("/display-monitor", (req, res) => {
  const now = moment.tz(moment(), process.env.TIMEZONE);
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
              sex: {
                $first: "$sex"
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
              bed_number: 1
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
                $lte: now
                  .clone()
                  .endOf("day")
                  .toDate(),
                $gte: now
                  .clone()
                  .startOf("day")
                  .toDate()
              }
            }
          },
          {
            $sort: {
              case_order: 1,
              date_time_of_surgery: -1
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
              case: constants.EMERGENCY_PROCEDURE
              /* date_time_of_surgery: {
                $lte: now
                  .clone()
                  .endOf("day")
                  .toDate(),
                $gte: now
                  .clone()
                  .startOf("day")
                  .toDate()
              } */
            }
          },
          {
            $sort: {
              case_order: 1,
              date_time_of_surgery: -1
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

      on_duty_anes: cb => {
        Anesthesiologist.find({
          assignments: constants.ON_DUTY_ANES
        })
          .sort({
            year_level: 1
          })
          .exec(cb);
      },
      pacu_anes: cb => {
        Anesthesiologist.find({
          assignments: constants.PACU_ANES
        })
          .sort({
            year_level: 1
          })
          .exec(cb);
      },
      team_captain_anes: cb => {
        Anesthesiologist.find({
          assignments: constants.TEAM_CAPTAIN_ANES
        })
          .sort({
            year_level: 1
          })
          .exec(cb);
      }

      /* schedule: cb => {
        ORSchedule.findOne({
          "period.0": {
            $lte: now
              .clone()
              .endOf("day")
              .toDate()
          },
          "period.1": {
            $gte: now
              .clone()
              .startOf("day")
              .toDate()
          }
        }).exec(cb);
      } */
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

        /* let on_duty_anes = [];
        let team_captain_anes = [];
        let pacu_anes = [];
        const schedule = result.schedule;

        if (schedule) {
          on_duty_anes = schedule.on_duty;
          pacu_anes = schedule.pacu;
          team_captain_anes = schedule.team_captains;
        }

        arr_return["on_duty_anes"] = on_duty_anes;
        arr_return["team_captain_anes"] = team_captain_anes;
        arr_return["pacu_anes"] = pacu_anes; */

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
        operating_room_number: filtered_body.operating_room_number
          ? filtered_body.operating_room_number
          : null,
        logs
      };

      record.set({
        ...body
      });

      record
        .save()
        .then(record => {
          const io = req.app.get("socketio");
          io.emit("refresh-display", true);
          return res.json(record);
        })
        .catch(err => console.log(err));
    } else {
      console.log("ID not found");
    }
  });
});

router.post("/:id/operative-technique/ob", (req, res) => {
  Model.findById(req.params.id)
    .then(record => {
      if (record) {
        record.set({
          ob_operative_technique: {
            ...req.body.ob_operative_technique
          }
        });
        record.save().then(record => res.json(record));
      }
    })
    .catch(err => res.status(401).json(err));
});

router.delete("/selection", async (req, res) => {
  const items = req.body.items;
  await asyncForeach(items, async item => {
    await OperatingRoomSlip.deleteOne({
      _id: mongoose.Types.ObjectId(item)
    }).exec();
  });

  return res.json({ success: 1 });
});

router.delete("/:id", (req, res) => {
  Model.findByIdAndRemove(req.params.id)
    .then(response => {
      const io = req.app.get("socketio");
      io.emit("refresh-display", true);
      return res.json({ success: 1 });
    })
    .catch(err => console.log(err));
});

module.exports = router;
