const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { Sequelize } = require("sequelize");
const sortBy = require("lodash").sortBy;
const sumBy = require("lodash").sumBy;
const sortedUniq = require("lodash").sortedUniq;
const sqldatabase = require("./../../config/sqldatabase");

const OperatingRoomSlip = require("./../../models/OperatingRoomSlip");
const Optech = require("./../../models/Optech");
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
const utilities = require("./../../utils/utilities");
const numberFormat = require("./../../utils/numberFormat");
const constants = require("./../../config/constants");
const util = require("util");
const capitalize = require("lodash").capitalize;
const startCase = require("lodash").startCase;
const toLower = require("lodash").toLower;
const toUpper = require("lodash").toUpper;
const forOwn = require("lodash").forOwn;

const numeral = require("numeral");
const async = require("async");
const net = require("net");
const Op = Sequelize.Op;

const Model = OperatingRoomSlip;

router.get("/:id/operative-technique/:index", (req, res) => {
  Optech.findOne({
    or_slip_id: mongoose.Types.ObjectId(req.params.id),
    index: req.params.index,
  }).then((record) => res.json(record));
});

router.get("/:id/surgical-memorandum/:surg_memo_id", (req, res) => {
  Model.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(req.params.id),
      },
    },
    {
      $unwind: {
        path: "$surgical_memos",
      },
    },
    {
      $match: {
        "surgical_memos._id": mongoose.Types.ObjectId(req.params.surg_memo_id),
      },
    },
  ])
    .then((records) => {
      const record = {
        ...records[0],
      };

      const {
        name,
        asa,
        hospital_number,
        address,
        ward,
        age,
        sex,
        registration_date,
        date_time_of_surgery,
        weight,
        weight_unit,
      } = record;

      return res.json({
        name,
        asa,
        hospital_number,
        address,
        ward,
        age,
        sex,
        registration_date,
        date_time_of_surgery,
        weight,
        weight_unit,
        ...records[0].surgical_memos,
      });
    })
    .catch((err) => res.status(401).json(err));
});

router.get("/:id", (req, res) => {
  Model.findById(req.params.id)
    .then((record) => res.json(record))
    .catch((err) => console.log(err));
});

router.get("/", (req, res) => {
  const form_data = isEmpty(req.query.s)
    ? {}
    : {
        $or: [
          {
            name: {
              $regex: new RegExp(req.query.s, "i"),
            },
          },
          {
            procedure: {
              $regex: new RegExp(req.query.s, "i"),
            },
          },
        ],
      };

  Model.find(form_data)
    .select({
      hospital_number: 1,
      ward: 1,
      name: 1,
      age: 1,
      sex: 1,
      diagnosis: 1,
      procedure: 1,
      surgeon: 1,
      main_anes: 1,
      operating_room_number: 1,
      service: 1,
      date_time_of_surgery: 1,
      classification: 1,
      operation_status: 1,
      case: 1,
      or_ended: 1,
      date_time_ordered: 1,
      operation_status: 1,
      operation_finished: 1,
    })
    .sort({
      _id: -1,
      name: 1,
    })
    .then((records) => {
      return res.json(records);
    })
    .catch((err) => console.log(err));
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
      log,
    },
  ];

  const newRecord = new Model({
    ...body,
    logs,
  });
  newRecord
    .save()
    .then((record) => {
      const io = req.app.get("socketio");
      io.emit("refresh-display", true);
      io.emit("new-or", {
        name: record.name,
      });
      return res.json(record);
    })
    .catch((err) => console.log(err));
});

router.post("/paginate", (req, res) => {
  let page = req.body.page || 1;

  const {
    search_period_covered,
    search_operating_room_number,
    search_surgeon,
    search_procedure,
    search_classification,
    search_main_anes,
    search_service,
    search_case,
    search_operation_status,
    search_operation_started,
  } = req.body;

  const form_data = {
    ...(search_period_covered &&
      search_period_covered[0] &&
      search_period_covered[1] && {
        date_time_of_surgery: {
          $gte: moment(search_period_covered[0]).startOf("day").toDate(),
          $lte: moment(search_period_covered[1]).endOf("day").toDate(),
        },
      }),
    ...(search_operation_started &&
      search_operation_started[0] &&
      search_operation_started[1] && {
        operation_started: {
          $gte: moment(search_operation_started[0]).startOf("day").toDate(),
          $lte: moment(search_operation_started[1]).endOf("day").toDate(),
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
    ...(search_classification &&
      !["All", ""].includes(search_classification) && {
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
    ...(!isEmpty(req.body.s) && {
      $or: [
        {
          name: {
            $regex: new RegExp(req.body.s, "i"),
          },
        },
        {
          procedure: {
            $regex: new RegExp(req.body.s, "i"),
          },
        },
      ],
    }),
  };

  Model.paginate(form_data, {
    select: {
      hospital_number: 1,
      ward: 1,
      name: 1,
      age: 1,
      sex: 1,
      diagnosis: 1,
      procedure: 1,
      surgeon: 1,
      main_anes: 1,
      operating_room_number: 1,
      service: 1,
      date_time_of_surgery: 1,
      classification: 1,
      operation_status: 1,
      case: 1,
      or_ended: 1,
      date_time_ordered: 1,
      operation_status: 1,
      operation_finished: 1,
      operation_started: 1,
    },
    sort: {
      _id: -1,
    },
    page,
    limit: 10,
  })
    .then((records) => {
      return res.json(records);
    })
    .catch((err) => console.log(err));
});

router.post("/advanced-search", (req, res) => {
  const {
    search_period_covered,
    search_operating_room_number,
    search_surgeon,
    search_procedure,
    search_classification,
    search_main_anes,
    search_service,
  } = req.body;

  const form_data = {
    ...(search_period_covered[0] &&
      search_period_covered[1] && {
        date_time_of_surgery: {
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
    ...(!["All", ""].includes(search_classification) && {
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
  };

  OperatingRoomSlip.find(form_data)
    .sort({
      _id: -1,
      name: 1,
    })
    .then((records) => res.json(records));
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
    .then((records) => {
      let updated_records = [...records];

      updated_records = updated_records.map((record) => {
        const { fname, mname, lname } = record;
        const fullname = `${toUpper(lname.trim())}, ${startCase(
          toLower(fname.trim())
        )} ${startCase(toLower(mname.trim()))}`;

        return {
          ...record,
          fullname,
        };
      });

      return res.json(updated_records);
    })
    .catch((err) => res.status(500).json(err));
});

router.post("/operations", (req, res) => {
  const date = moment(req.body.search_date);
  OperatingRoomSlip.aggregate([
    {
      $match: {
        operating_room_number: {
          $ne: null,
        },
        $or: [
          {
            operation_started: {
              $gte: date.clone().startOf("day").toDate(),
              $lte: date.clone().endOf("day").toDate(),
            },
          },
          {
            operation_finished: {
              $gte: date.clone().startOf("day").toDate(),
              $lte: date.clone().endOf("day").toDate(),
            },
          },
        ],
      },
    },
    {
      $project: {
        name: 1,
        operation_started: 1,
        operation_finished: 1,
        operating_room_number: 1,
        date_time_ordered: 1,
        case: 1,
      },
    },
    {
      $sort: {
        operation_started: 1,
      },
    },
    {
      $group: {
        _id: "$operating_room_number",
        operations: {
          $push: "$$ROOT",
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]).then((records) => {
    let updated_records = records.map((o) => {
      const operations = o.operations.map((operation) => {
        let operation_started = moment(operation.operation_started);
        let operation_finished = moment(operation.operation_finished);

        const isCarriedOver =
          operation_started
            .clone()
            .endOf("day")
            .isBefore(operation_finished.clone().startOf("day")) &&
          operation_finished
            .clone()
            .startOf("day")
            .isSame(date.clone().startOf("day"));

        const isFinishedOnTheNextDay =
          operation_started
            .clone()
            .endOf("day")
            .isBefore(operation_finished.clone().startOf("day")) &&
          operation_started
            .clone()
            .startOf("day")
            .isSame(date.clone().startOf("day"));

        if (isCarriedOver) {
          operation_started = operation_finished.clone().startOf("day");
        } else if (isFinishedOnTheNextDay) {
          operation_finished = operation_finished.clone().endOf("day");
        }

        const start_time = moment
          .duration(
            operation_started.diff(operation_started.clone().startOf("day"))
          )
          .asMinutes();

        const end_time = moment
          .duration(
            operation_finished.diff(operation_finished.clone().startOf("day"))
          )
          .asMinutes();

        const minutes = round(end_time - start_time);

        const backlog_hours = moment
          .duration(
            operation_started.clone().diff(moment(operation.date_time_ordered))
          )
          .asHours();

        const is_backlog =
          !isEmpty(operation.date_time_ordered) &&
          backlog_hours > 24 &&
          operation.case === constants.EMERGENCY_PROCEDURE &&
          operation.operation_status !== constants.CANCEL;

        return {
          ...operation,
          operation_started,
          operation_finished,
          start_time,
          end_time,
          minutes,
          case: operation.case,
          is_backlog,
        };
      });

      return {
        ...o,
        operations,
      };
    });

    return res.json({ records: updated_records, date });
  });
});

router.post("/or-elective-operations", (req, res) => {
  const now = moment.tz(moment(), process.env.TIMEZONE);
  const or_date = moment(req.body.or_date);

  async.parallel(
    {
      electives: (cb) => {
        OperatingRoomSlip.aggregate([
          {
            $match: {
              date_time_of_surgery: {
                $gte: or_date.clone().startOf("day").toDate(),
                $lte: or_date.clone().endOf("day").toDate(),
              },
              operating_room_number: {
                $exists: true,
                $nin: ["", null],
              },
              case: constants.ELECTIVE_SURGERY,
            },
          },
          {
            $sort: {
              case_order: 1,
            },
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
                  or_elec_notes: "$or_elec_notes",
                  surgeon: "$surgeon",
                  main_anes: "$main_anes",
                  classification: "$classification",
                  case_order: "$case_order",
                },
              },
            },
          },
          {
            $sort: {
              _id: 1,
            },
          },
        ]).exec(cb);
      },
      waiting_electives: (cb) => {
        OperatingRoomSlip.aggregate([
          {
            $match: {
              date_time_of_surgery: {
                $gte: or_date.clone().startOf("day").toDate(),
                $lte: or_date.clone().endOf("day").toDate(),
              },
              case: constants.ELECTIVE_SURGERY,
              $or: [
                {
                  operating_room_number: {
                    $exists: false,
                  },
                },
                {
                  operating_room_number: {
                    $in: ["", null],
                  },
                },
              ],
            },
          },
          {
            $sort: {
              case_order: 1,
            },
          },
        ]).exec(cb);
      },
      schedule: (cb) => {
        ORSchedule.findOne({
          "period.0": {
            $lte: or_date.clone().endOf("day").toDate(),
          },
          "period.1": {
            $gte: or_date.clone().startOf("day").toDate(),
          },
        }).exec(cb);
      },
    },
    (err, result) => {
      let arr_return = {
        ...result,
      };

      let electives = [...result.electives];

      /* console.log(util.inspect(result.waiting_electives, false, null, true)); */

      let room_electives = [];
      const operating_rooms = constants.OPERATING_ROOMS;
      //const operating_rooms = [{ OB: "OB" }];
      delete operating_rooms.OB;

      const schedule = result.schedule;
      let on_duty_anes = [];
      let team_captain_anes = [];
      let pacu_anes = [];
      if (schedule) {
        on_duty_anes = schedule.on_duty;
        pacu_anes = schedule.pacu;
        team_captain_anes = schedule.team_captains;
      }

      arr_return["on_duty_anes"] = on_duty_anes;
      arr_return["team_captain_anes"] = team_captain_anes;
      arr_return["pacu_anes"] = pacu_anes;

      Object.entries(operating_rooms).forEach(([key, value]) => {
        let _id = value;
        let elective_room = electives.find((o) => o._id === key);
        let items = elective_room ? [...elective_room.items] : [];

        const room_obj_schedule = (schedule.room_schedule || []).find(
          (o) => o.room === key
        );

        if (items.length <= 0) {
          items = [
            {
              procedure: room_obj_schedule ? room_obj_schedule.status : "STATS",
            },
          ];
        }

        room_electives = [
          ...room_electives,
          {
            _id,
            items,
          },
        ];
      });

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
    search_main_anes,
  } = req.body;

  const form_data = {
    ...(search_period_covered[0] &&
      search_period_covered[1] && {
        date_time_of_surgery: {
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
    ...(!["All", ""].includes(search_classification) && {
      classification: search_classification,
    }),
    ...(search_surgeon && {
      "surgeon._id": search_surgeon._id,
    }),
    ...(search_main_anes && {
      "main_anes._id": search_main_anes._id,
    }),
  };

  OperatingRoomSlip.find(form_data)
    .sort({
      date_time_of_surgery: 1,
    })
    .then((records) => res.json(records));
});

router.post("/or-monthly-report", (req, res) => {
  const {
    search_period_covered,
    search_operating_room_number,
    search_surgeon,
    search_procedure,
    search_classification,
    search_main_anes,
    search_service,
    search_case,
    search_operation_status,
  } = req.body;

  const filter_query = {
    $match: {
      ...(search_period_covered[0] &&
        search_period_covered[1] && {
          operation_started: {
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

  async.parallel(
    {
      operations: (cb) => {
        OperatingRoomSlip.aggregate([
          {
            ...filter_query,
          },
          {
            $match: {
              $and: [
                {
                  operation_type: {
                    $ne: "",
                  },
                },
                {
                  operation_type: {
                    $ne: null,
                  },
                },
                {
                  age: {
                    $ne: "",
                  },
                },
                {
                  age: {
                    $ne: null,
                  },
                },
              ],
            },
          },
          {
            $project: {
              age: {
                $toInt: {
                  $arrayElemAt: [
                    {
                      $split: [
                        {
                          $toUpper: "$age",
                        },
                        "Y",
                      ],
                    },
                    0,
                  ],
                },
              },
              operation_type: 1,
              sex: 1,
            },
          },
          {
            $addFields: {
              age_category: {
                $cond: [
                  {
                    $lte: ["$age", 17],
                  },
                  "17 Years and Below",
                  "18 Years and Above",
                ],
              },
            },
          },
          {
            $group: {
              _id: {
                operation_type: "$operation_type",
                age_category: "$age_category",
                sex: "$sex",
              },
              count: {
                $sum: 1,
              },
            },
          },
          {
            $sort: {
              age_category: 1,
              sex: 1,
            },
          },
        ]).exec(cb);
      },
      summary: (cb) => {
        OperatingRoomSlip.aggregate([
          {
            ...filter_query,
          },
          {
            $match: {
              $and: [
                {
                  operation_type: {
                    $ne: "",
                  },
                },
                {
                  operation_type: {
                    $ne: null,
                  },
                },
                {
                  classification: {
                    $ne: null,
                  },
                },
                {
                  classification: {
                    $ne: "",
                  },
                },
              ],
            },
          },
          {
            $project: {
              operation_type: 1,
              classification: 1,
            },
          },
          {
            $addFields: {
              private: {
                $cond: [
                  {
                    $eq: ["$classification", "Private"],
                  },
                  1,
                  0,
                ],
              },
              service: {
                $cond: [
                  {
                    $eq: ["$classification", "Service"],
                  },
                  1,
                  0,
                ],
              },
              housecase: {
                $cond: [
                  {
                    $eq: ["$classification", "Housecase"],
                  },
                  1,
                  0,
                ],
              },
            },
          },
          {
            $group: {
              _id: "$operation_type",
              housecase: {
                $sum: "$housecase",
              },
              private: {
                $sum: "$private",
              },
              service: {
                $sum: "$service",
              },
            },
          },
          {
            $addFields: {
              total: {
                $add: ["$housecase", "$private", "$service"],
              },
            },
          },
        ]).exec(cb);
      },
    },
    (err, results) => {
      if (err) {
        return res.status(401).json(err);
      }

      const records = [...results.operations];

      const major_columns = [constants.SEX_MALE, constants.SEX_FEMALE];
      const major_rows = [
        constants.AGE_CATEGORY_18_ABOVE,
        constants.AGE_CATEGORY_17_BELOW,
      ];

      let major_records = [{}, {}];
      let minor_records = [{}, {}];

      major_rows.forEach((age_category, age_category_index) => {
        major_columns.forEach((sex, sex_index) => {
          const major_result = records.find((record) => {
            return (
              record._id.operation_type === constants.OPERATION_TYPE_MAJOR &&
              record._id.sex === sex &&
              record._id.age_category === age_category
            );
          });

          major_records[age_category_index]["label"] = age_category;
          if (major_result) {
            major_records[age_category_index][sex.toLowerCase()] =
              major_result.count;
          } else {
            major_records[age_category_index][sex.toLowerCase()] = 0;
          }

          /**
           * MINOR RESULTS
           */

          const minor_result = records.find((record) => {
            return (
              record._id.operation_type === constants.OPERATION_TYPE_MINOR &&
              record._id.sex === sex &&
              record._id.age_category === age_category
            );
          });

          minor_records[age_category_index]["label"] = age_category;
          if (minor_result) {
            minor_records[age_category_index][sex.toLowerCase()] =
              minor_result.count;
          } else {
            minor_records[age_category_index][sex.toLowerCase()] = 0;
          }
        });
      });

      major_records = major_records.map((record) => {
        const total = numeral(0);
        total.add(record.male).add(record.female);
        return {
          ...record,
          total: total.value(),
        };
      });
      minor_records = minor_records.map((record) => {
        const total = numeral(0);
        total.add(record.male).add(record.female);
        return {
          ...record,
          total: total.value(),
        };
      });

      /**
       * SUMMARY
       */

      const summary_rows = [
        constants.OPERATION_TYPE_MAJOR,
        constants.OPERATION_TYPE_CESAREAN,
        constants.OPERATION_TYPE_MINOR,
      ];

      let summary_records = [];

      summary_rows.forEach((operation_type) => {
        const operation_type_result = results.summary.find((o) => {
          return o._id === operation_type;
        });

        if (operation_type_result) {
          summary_records = [...summary_records, { ...operation_type_result }];
        }
      });

      return res.json({ major_records, minor_records, summary_records });
    }
  );
});

router.post("/summary-of-operations-per-department", (req, res) => {
  const {
    search_period_covered,
    search_operating_room_number,
    search_surgeon,
    search_procedure,
    search_classification,
    search_main_anes,
    search_service,
    search_case,
    search_operation_status,
  } = req.body;

  const filter_query = {
    $match: {
      ...(search_period_covered[0] &&
        search_period_covered[1] && {
          operation_started: {
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

  OperatingRoomSlip.aggregate([
    {
      ...filter_query,
    },
    {
      $match: {
        $and: [
          {
            operation_type: {
              $ne: "",
            },
          },
          {
            operation_type: {
              $ne: null,
            },
          },
          {
            service: {
              $ne: "",
            },
          },
          {
            service: {
              $ne: null,
            },
          },
        ],
      },
    },
    {
      $project: {
        service: 1,
        case: 1,
        operation_type: 1,
        elective: {
          $cond: [
            {
              $eq: ["$case", "Elective Surgery"],
            },
            1,
            0,
          ],
        },
        emergency: {
          $cond: [
            {
              $eq: ["$case", "Emergency Procedure"],
            },
            1,
            0,
          ],
        },
      },
    },
    {
      $group: {
        _id: {
          service: "$service",
          operation_type: "$operation_type",
        },
        elective: {
          $sum: "$elective",
        },
        emergency: {
          $sum: "$emergency",
        },
      },
    },
  ]).then((records) => {
    let transaction_records = [];

    constants.SERVICES.forEach((service) => {
      const operation_types = constants.OPERATION_TYPES.filter(
        (operation_type) => {
          /**
           * Include only cesarean in GS
           */

          return (
            (service !== constants.SERVICE_OB &&
              [
                constants.OPERATION_TYPE_MAJOR,
                constants.OPERATION_TYPE_MINOR,
              ].includes(operation_type)) ||
            service === constants.SERVICE_OB
          );
        }
      );

      operation_types.forEach((operation_type) => {
        const result = records.find((o) => {
          return (
            o._id.service === service && o._id.operation_type === operation_type
          );
        });

        const { elective = 0, emergency = 0 } = result || {
          emergency: 0,
          elective: 0,
        };

        transaction_records = [
          ...transaction_records,
          {
            service,
            operation_type,
            elective,
            emergency,
            total: elective + emergency,
          },
        ];
      });
    });

    return res.json(transaction_records);
  });
});

router.post("/summary-of-deferred-scheduled-procedures", (req, res) => {
  const all_filter_query = utilities.getFilterQueryForDateTimeOfSurgeryAndOperation(
    { ...req.body }
  );

  const deferred_filter_query = utilities.getFilterQuery(
    { ...req.body },
    "date_time_of_surgery"
  );

  const aggregate_query = [
    {
      $match: {
        case: {
          $in: ["Elective Surgery", "Emergency Procedure"],
        },
        operation_status: {
          $in: ["POSTPONE", "CANCEL", "DONE"],
        },
        service: {
          $nin: [null, ""],
        },
      },
    },
    {
      $project: {
        case: 1,
        operation_status: 1,
        service: 1,
        elective_count: {
          $cond: [
            {
              $eq: ["$case", "Elective Surgery"],
            },
            1,
            0,
          ],
        },
        emergency_count: {
          $cond: [
            {
              $eq: ["$case", "Emergency Procedure"],
            },
            1,
            0,
          ],
        },
        postpone_count: {
          $cond: [
            {
              $eq: ["$operation_status", "POSTPONE"],
            },
            1,
            0,
          ],
        },
        cancel_count: {
          $cond: [
            {
              $eq: ["$operation_status", "CANCEL"],
            },
            1,
            0,
          ],
        },
      },
    },
    {
      $addFields: {
        done_count: {
          $add: ["$elective_count", "$emergency_count"],
        },
      },
    },
    {
      $group: {
        _id: {
          service: "$service",
          case: "$case",
        },
        service: {
          $first: "$service",
        },
        case: {
          $first: "$case",
        },
        elective_count: {
          $sum: "$elective_count",
        },
        emergency_count: {
          $sum: "$emergency_count",
        },
        postpone_count: {
          $sum: "$postpone_count",
        },
        cancel_count: {
          $sum: "$cancel_count",
        },
        done_count: {
          $sum: "$done_count",
        },
      },
    },
    {
      $sort: {
        service: 1,
        case: 1,
      },
    },
    {
      $group: {
        _id: "$service",
        service: {
          $first: "$service",
        },
        cancel_count: {
          $sum: "$cancel_count",
        },
        postpone_count: {
          $sum: "$postpone_count",
        },
        done_count: {
          $sum: "$done_count",
        },
        procedures: {
          $push: {
            case: "$case",
            count: {
              $cond: [
                {
                  $eq: ["$case", "Elective Surgery"],
                },
                "$elective_count",
                "$emergency_count",
              ],
            },
            postpone_count: "$postpone_count",
            cancel_count: "$cancel_count",
            done_count: "$done_count",
          },
        },
      },
    },
    {
      $addFields: {
        deferred_count: {
          $add: ["$cancel_count", "$postpone_count"],
        },
      },
    },
    {
      $sort: {
        service: 1,
      },
    },
  ];

  const all_query = [all_filter_query, ...aggregate_query];
  const deferred_query = [deferred_filter_query, ...aggregate_query];

  async.parallel(
    {
      all_transactions: (cb) => {
        OperatingRoomSlip.aggregate(all_query).exec(cb);
      },
      deferred_transactions: (cb) => {
        OperatingRoomSlip.aggregate(deferred_query).exec(cb);
      },
    },
    (err, results) => {
      if (err) {
        return res.status(401).json(err);
      }

      forOwn(results, (value, key, object) => {
        let transactions = [...value];

        transactions = transactions.map((record) => {
          let procedures = [...record.procedures];
          for (let i = 0; i <= 1; i++) {
            procedures[i] = procedures[i] || {
              case:
                i == 0
                  ? constants.ELECTIVE_SURGERY
                  : constants.EMERGENCY_PROCEDURE,
              count: 0,
              postpone_count: 0,
              cancel_count: 0,
              done_count: 0,
            };
          }

          return {
            ...record,
            procedures,
          };
        });

        object[key] = transactions;
      });

      return res.json(results);
    }
  );
});

router.post("/operations-summary", (req, res) => {
  const {
    search_period_covered,
    search_operating_room_number,
    search_surgeon,
    search_procedure,
    search_classification,
    search_main_anes,
    search_service,
    search_case,
    search_operation_status,
  } = req.body;

  const filter_query = {
    $match: {
      ...(search_period_covered[0] &&
        search_period_covered[1] && {
          operation_started: {
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

  async.map(
    constants.OPERATION_TYPES,
    (operation_type, cb) => {
      OperatingRoomSlip.aggregate([
        {
          ...filter_query,
        },
        {
          $unwind: {
            path: "$rvs",
          },
        },
        {
          $match: {
            $and: [
              {
                "rvs.rvs_code": {
                  $ne: "",
                },
              },
              {
                "rvs.rvs_description": {
                  $ne: "",
                },
              },
              {
                classification: {
                  $ne: null,
                },
              },
              {
                classification: {
                  $ne: "",
                },
              },
            ],
            operation_type: operation_type,
          },
        },
        {
          $project: {
            rvs: {
              rvs_code: {
                $trim: {
                  input: "$rvs.rvs_code",
                },
              },
              rvs_description: {
                $trim: {
                  input: "$rvs.rvs_description",
                },
              },
            },
            classification: 1,
            operation_type: 1,
          },
        },
        {
          $addFields: {
            private: {
              $cond: [
                {
                  $eq: ["$classification", "Private"],
                },
                1,
                0,
              ],
            },
            service: {
              $cond: [
                {
                  $eq: ["$classification", "Service"],
                },
                1,
                0,
              ],
            },
            housecase: {
              $cond: [
                {
                  $eq: ["$classification", "Housecase"],
                },
                1,
                0,
              ],
            },
          },
        },
        {
          $group: {
            _id: "$rvs.rvs_code",
            rvs: {
              $first: "$rvs",
            },
            private: {
              $sum: "$private",
            },
            service: {
              $sum: "$service",
            },
            housecase: {
              $sum: "$housecase",
            },
          },
        },
        {
          $addFields: {
            total: {
              $add: ["$private", "$service", "$housecase"],
            },
          },
        },
        {
          $sort: {
            "rvs.rvs_description": 1,
          },
        },
      ]).exec(cb);
    },
    (err, results) => {
      return res.json(results);
    }
  );
});

router.post("/room-statistics", (req, res) => {
  const {
    search_period_covered,
    search_operating_room_number,
    search_surgeon,
    search_procedure,
    search_classification,
    search_main_anes,
  } = req.body;

  OperatingRoomSlip.aggregate([
    {
      $match: {
        time_or_started: {
          $ne: null,
        },
        trans_out_from_or: {
          $ne: null,
        },
        ...(search_period_covered[0] &&
          search_period_covered[1] && {
            date_time_of_surgery: {
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
        ...(!["All", ""].includes(search_classification) && {
          classification: search_classification,
        }),
        ...(search_surgeon && {
          "surgeon._id": search_surgeon._id,
        }),
        ...(search_main_anes && {
          "main_anes._id": search_main_anes._id,
        }),
      },
    },
    {
      $project: {
        time_or_started: 1,
        trans_out_from_or: 1,
        operating_room_number: 1,
        mins: {
          $divide: [
            {
              $subtract: ["$trans_out_from_or", "$time_or_started"],
            },
            60000,
          ],
        },
      },
    },
    {
      $sort: {
        time_or_started: 1,
        operating_room_number: 1,
      },
    },
    {
      $group: {
        _id: {
          day: {
            $dayOfYear: {
              date: "$time_or_started",
            },
          },
          operating_room_number: "$operating_room_number",
        },
        date: {
          $first: "$time_or_started",
        },
        times: {
          $push: {
            patient_in: "$time_or_started",
            patient_out: "$trans_out_from_or",
            mins: "$mins",
          },
        },
      },
    },
    {
      $group: {
        _id: "$_id.day",
        date: {
          $first: "$date",
        },
        items: {
          $push: {
            operating_room_number: "$_id.operating_room_number",
            times: "$times",
          },
        },
      },
    },
    {
      $sort: {
        date: 1,
      },
    },
  ]).then((records) => {
    return res.json(records);
  });
});

router.post("/display-monitor", (req, res) => {
  const now = moment.tz(moment(), process.env.TIMEZONE);
  async.parallel(
    {
      on_going: (cb) => {
        OperatingRoomSlip.aggregate([
          {
            $sort: {
              case_order: 1,
              date_time_of_surgery: -1,
            },
          },
          {
            $match: {
              operation_status: constants.ON_GOING,
            },
          },
          {
            $group: {
              _id: "$operating_room_number",
              or_id: {
                $first: "$_id",
              },
              operating_room_number: {
                $first: "$operating_room_number",
              },
              service: {
                $first: "$service",
              },
              name: {
                $first: "$name",
              },
              sex: {
                $first: "$sex",
              },
              case: {
                $first: "$case",
              },
              classification: {
                $first: "$classification",
              },
              age: {
                $first: "$age",
              },
              ward: {
                $first: "$ward",
              },
              procedure: {
                $first: "$procedure",
              },
              surgeon: {
                $first: "$surgeon",
              },
              main_anes: {
                $first: "$main_anes",
              },
              case_order: {
                $first: "$case_order",
              },
              date_time_ordered: {
                $first: "$date_time_ordered",
              },
              operation_started: {
                $first: "$operation_started",
              },
            },
          },
          {
            $limit: 8,
          },
          {
            $sort: {
              operating_room_number: 1,
            },
          },
        ]).exec(cb);
      },
      pacu: (cb) => {
        OperatingRoomSlip.aggregate([
          {
            $match: {
              operation_status: constants.ON_RECOVERY,
            },
          },
          {
            $sort: {
              bed_number: 1,
            },
          },
          {
            $limit: 8,
          },
        ]).exec(cb);
      },
      in_holding_room: (cb) => {
        OperatingRoomSlip.aggregate([
          {
            $match: {
              operation_status: constants.IN_HOLDING_ROOM,
            },
          },
          {
            $sort: {
              date_time_of_surgery: -1,
              case_order: 1,
            },
          },
          {
            $limit: 8,
          },
        ]).exec(cb);
      },
      elective_list: (cb) => {
        /**
         * should display all transactions not received so that they will see in the board, even though date/time of surgery is already supplied
         */
        OperatingRoomSlip.aggregate([
          {
            $match: {
              $or: [
                {
                  date_time_of_surgery: {
                    $lte: now.clone().endOf("day").toDate(),
                    $gte: now.clone().startOf("day").toDate(),
                  },
                },
                {
                  received_by: "",
                },
              ],
              operation_status: constants.ON_SCHEDULE,
              case: constants.ELECTIVE_SURGERY,
            },
          },
          {
            $sort: {
              case_order: 1,
              date_time_of_surgery: -1,
            },
          },
          {
            $limit: 16,
          },
        ]).exec(cb);
      },
      emergency_list: (cb) => {
        OperatingRoomSlip.aggregate([
          {
            $match: {
              operation_status: constants.ON_SCHEDULE,
              case: constants.EMERGENCY_PROCEDURE,
              date_time_ordered: {
                $ne: null,
              },
            },
          },
          {
            $addFields: {
              est_date_time_finish: {
                $add: [
                  "$date_time_ordered",
                  {
                    $multiply: [
                      {
                        $ifNull: ["$stat_time_limit", 0],
                      },
                      60,
                      60000,
                    ],
                  },
                ],
              },
            },
          },
          {
            $sort: {
              case_order: 1,
              est_date_time_finish: 1,
              date_time_of_surgery: -1,
            },
          },
          {
            $limit: 16,
          },
        ]).exec(cb);
      },
      charge_nurse: (cb) => {
        Nurse.find({
          assignment: constants.CHARGE_NURSE,
        })
          .sort({
            last_name: 1,
            first_name: 1,
          })
          .exec(cb);
      },
      receiving_nurse: (cb) => {
        Nurse.find({
          assignment: constants.RECEIVING_NURSE,
        })
          .sort({
            last_name: 1,
            first_name: 1,
          })
          .exec(cb);
      },
      holding_room_nurse: (cb) => {
        Nurse.find({
          assignment: constants.HOLDING_ROOM_NURSE,
        })
          .sort({
            last_name: 1,
            first_name: 1,
          })
          .exec(cb);
      },
      on_duty_nurse: (cb) => {
        Nurse.find({
          on_duty: true,
        })
          .sort({
            last_name: 1,
            first_name: 1,
          })
          .exec(cb);
      },

      on_duty_anes: (cb) => {
        Anesthesiologist.find({
          assignments: constants.ON_DUTY_ANES,
        })
          .sort({
            year_level: 1,
          })
          .exec(cb);
      },
      pacu_anes: (cb) => {
        Anesthesiologist.find({
          assignments: constants.PACU_ANES,
        })
          .sort({
            year_level: 1,
          })
          .exec(cb);
      },
      team_captain_anes: (cb) => {
        Anesthesiologist.find({
          assignments: constants.TEAM_CAPTAIN_ANES,
        })
          .sort({
            year_level: 1,
          })
          .exec(cb);
      },

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
          ...result,
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

  Model.findById(req.params.id).then((record) => {
    if (record) {
      const datetime = moment.tz(moment(), process.env.TIMEZONE);
      const log = `Modified by ${user.name} on ${datetime.format("LLL")}`;

      const logs = [
        ...record.logs,
        {
          user,
          datetime,
          log,
        },
      ];

      const body = {
        ...filtered_body,
        operating_room_number: filtered_body.operating_room_number
          ? filtered_body.operating_room_number
          : null,
        logs,
      };

      record.set({
        ...body,
      });

      record
        .save()
        .then((record) => {
          const io = req.app.get("socketio");
          io.emit("refresh-display", true);
          return res.json(record);
        })
        .catch((err) => console.log(err));
    } else {
      console.log("ID not found");
    }
  });
});

router.post("/:id/operative-technique", (req, res) => {
  Optech.updateOne(
    {
      or_slip_id: mongoose.Types.ObjectId(req.body.id),
      index: req.body.index,
    },
    {
      $set: {
        values: req.body.values,
      },
    },
    {
      upsert: true,
    }
  ).exec();

  return res.json({ success: 1 });
});

router.delete("/selection", async (req, res) => {
  const items = req.body.items;
  await asyncForeach(items, async (item) => {
    await OperatingRoomSlip.deleteOne({
      _id: mongoose.Types.ObjectId(item),
    }).exec();
  });

  return res.json({ success: 1 });
});

router.delete("/:id", (req, res) => {
  Model.findByIdAndRemove(req.params.id)
    .then((response) => {
      const io = req.app.get("socketio");
      io.emit("refresh-display", true);
      return res.json({ success: 1 });
    })
    .catch((err) => console.log(err));
});

module.exports = router;
