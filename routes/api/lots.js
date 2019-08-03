const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Lot = require("./../../models/Lot");
const isEmpty = require("./../../validators/is-empty");
const filterId = require("./../../utils/filterId");
const validateInput = require("./../../validators/lots");
const moment = require("moment-timezone");
const multer = require("multer");
const mkdirp = require("mkdirp");
const fs = require("fs");
const async = require("async");
const constants = require("./../../config/constants");

const Model = Lot;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "public/attachments";
    mkdirp(dir, err => cb(err, "public/attachments"));
  },
  filename: (req, file, cb) => {
    const fileFormat = file.originalname.split(".");
    const ext = fileFormat[fileFormat.length - 1];
    cb(null, file.fieldname + "-" + Date.now() + "." + ext);
  }
});

const upload = multer({ storage: storage });

router.get("/:id", (req, res) => {
  Model.findOne({ lot: req.params.id })
    .then(record => res.json(record))
    .catch(err => console.log(err));
});

router.get("/", (req, res) => {
  const form_data = isEmpty(req.query)
    ? {}
    : {
        $or: [
          {
            research_title: {
              $regex: new RegExp(req.query.s, "i")
            }
          },
          {
            "proponents.name": {
              $regex: new RegExp(req.query.s, "i")
            }
          }
        ]
      };

  Model.find(form_data)
    .sort({ _id: -1 })
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

  Model.findOne({
    research_title: body.research_title
  }).then(record => {
    if (record) {
      errors["research_title"] = "Transaction already exists";
      return res.status(401).json(errors);
    } else {
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
    }
  });
});

router.post("/lot-status", (req, res) => {
  async.parallel(
    {
      vacant_lots: cb => {
        Lot.find(
          {
            lot_status: constants.LOT_STATUS_VACANT
          },
          {
            lot_status: 1,
            lot: 1
          }
        ).exec(cb);
      },
      occupied_lots: cb => {
        Lot.find(
          {
            lot_status: constants.LOT_STATUS_OCCUPIED
          },
          {
            lot_status: 1,
            lot: 1
          }
        ).exec(cb);
      }
    },
    (err, result) => {
      return res.json(result);
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

  const datetime = moment.tz(moment(), process.env.TIMEZONE);
  const log = `Modified by ${user.name} on ${datetime.format("LLL")}`;

  Model.findOne({ lot: req.params.id }).then(record => {
    if (record) {
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
      /** create a new record */

      const body = {
        ...filtered_body,
        logs: [
          {
            user,
            datetime,
            log
          }
        ]
      };

      const newLot = new Lot({
        ...filtered_body
      });

      newLot.save().then(lot => res.json(lot));
    }
  });
});

router.post("/:id/upload", upload.array("files"), (req, res) => {
  const files = req.files ? req.files : null;
  console.log(files);
  const form_data = {
    label: req.body.label,
    attachment_category: req.body.attachment_category,
    files
  };

  Research.updateOne(
    { _id: mongoose.Types.ObjectId(req.params.id) },
    {
      $push: {
        attachments: form_data
      }
    }
  ).exec();

  return res.json({ success: 1 });
});

router.post("/:id/attachments/:attachment_id/delete", (req, res) => {
  const files = req.body.files;
  files.forEach(file => {
    fs.unlink(file.path, () => {
      return;
    });
  });

  Research.updateOne(
    {
      _id: mongoose.Types.ObjectId(req.params.id)
    },
    {
      $pull: {
        attachments: {
          _id: mongoose.Types.ObjectId(req.body._id)
        }
      }
    }
  ).exec();

  return res.json({ success: 1 });
});

router.delete("/:id", (req, res) => {
  Model.findByIdAndRemove(req.params.id)
    .then(response => res.json({ success: 1 }))
    .catch(err => console.log(err));
});

module.exports = router;
