const express = require("express");
const router = express.Router();
const User = require("./../../models/User");
const AppSetting = require("./../../models/AppSetting");
const RecordedLog = require("./../../models/RecordedLog");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("./../../config/keys");
const passport = require("passport");
const isEmpty = require("./../../validators/is-empty");
const UserValidation = require("./../../validators/users");
const moment = require("moment-timezone");
const Constants = require("./../../config/constants");
const fs = require("fs");

const validateLoginData = require("./../../validators/login");

router.get("/", (req, res) => {
  const form_data = isEmpty(req.query)
    ? {}
    : {
        name: {
          $regex: new RegExp("^" + req.query.s, "i")
        }
      };

  User.find(form_data)
    .select({
      _id: 1,
      username: 1,
      name: 1,
      role: 1,
      logs: 1
    })
    .sort({ name: 1 })
    .then(users => {
      return res.json(users);
    })
    .catch(err => console.log(err));
});

router.get("/:id", (req, res) => {
  User.findById(req.params.id)
    .then(user => res.json(user))
    .catch(err => console.log(error));
});

router.post("/login", (req, res) => {
  const { isValid, errors } = validateLoginData(req.body);

  if (!isValid) {
    return res.status(401).json(errors);
  }

  User.findOne({
    username: req.body.username
  }).then(user => {
    if (!user) {
      errors["username"] = "Username not found";
      return res.status(401).json(errors);
    }

    bcrypt.compare(req.body.password, user.password).then(isMatch => {
      if (isMatch) {
        const payload = {
          id: user._id,
          username: user.username,
          name: user.name,
          role: user.role
        };

        purgeRecords();

        //sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            return res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        return res.status(401).json({ password: "Password is invalid" });
      }
    });
  });
});

const purgeRecords = () => {
  AppSetting.findOne({
    key: Constants.PURGING_MONTHS_RECORDING
  }).then(setting => {
    let month;
    if (setting) {
      month = setting.value;
    } else {
      month = 1;
    }

    const from_date = moment()
      .subtract({ month })
      .startOf("day");

    RecordedLog.find({
      datetime_triggered: {
        $lte: from_date.toDate()
      }
    }).then(records => {
      records.forEach(record => {
        fs.unlink(record.path, () => {
          console.log(`File with path ${record.path} deleted`);
        });
        record.delete();
      });
    });
  });
};

router.post("/register", (req, res) => {
  const { errors, isValid } = UserValidation.validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(401).json(errors);
  }

  User.findOne({ username: req.body.username }).then(user => {
    if (user) {
      return res.status(401).json({ username: "Username already exists" });
    } else {
      const newUser = new User({
        name: req.body.name,
        username: req.body.username,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

router.post("/update-password", (req, res) => {
  const { isValid, errors } = UserValidation.validateUpdatePassword(req.body);

  if (!isValid) {
    return res.status(401).json(errors);
  }

  User.findById(req.body.user.id).then(record => {
    if (record) {
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.password, salt, (err, hash) => {
          if (err) throw err;

          if (!isEmpty(req.body.password)) {
            record.password = hash;
          }

          record
            .save()
            .then(record => {
              const { name, username, _id } = record;
              return res.json({ name, username, _id });
            })
            .catch(err => console.log(err));
        });
      });
    } else {
      console.log("ID not found");
    }
  });
});

router.post("/:id", (req, res) => {
  const { isValid, errors } = UserValidation.validateUserUpdate(req.body);

  if (!isValid) {
    return res.status(401).json(errors);
  }

  User.findById(req.params.id).then(record => {
    if (record) {
      const { name, username } = req.body;

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.password, salt, (err, hash) => {
          if (err) throw err;

          if (!isEmpty(req.body.password)) {
            record.password = hash;
          }

          const datetime = moment.tz(moment(), process.env.TIMEZONE);
          const log = `Modified by ${req.body.user.name} on ${datetime.format(
            "LLL"
          )}`;

          const logs = [
            ...record.logs,
            {
              user: req.body.user,
              datetime,
              log
            }
          ];

          record.set({
            name,
            username,
            role: req.body.role,
            logs
          });
          record
            .save()
            .then(record => {
              const { name, username, _id } = record;
              return res.json({ name, username, _id });
            })
            .catch(err => console.log(err));
        });
      });
    } else {
      console.log("ID not found");
    }
  });
});

router.put("/", (req, res) => {
  const { errors, isValid } = UserValidation.validateNewUser(req.body);

  if (!isValid) {
    return res.status(401).json(errors);
  }

  User.findOne({ username: req.body.username }).then(user => {
    if (user) {
      return res.status(401).json({ username: "Username already exists" });
    } else {
      const datetime = moment.tz(moment(), process.env.TIMEZONE);
      const log = `Added by ${req.body.user.name} on ${datetime.format("LLL")}`;
      const logs = [
        {
          user: req.body.user,
          datetime,
          log
        }
      ];

      const newUser = new User({
        name: req.body.name,
        username: req.body.username,
        password: req.body.password,
        role: req.body.role,
        logs
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user =>
              res.json({
                ...user,
                password: "",
                password_confirmation: ""
              })
            )
            .catch(err => console.log(err));
        });
      });
    }
  });
});

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    return res.json({
      id: req.user.id,
      name: req.user.name,
      username: req.user.username
    });
  }
);

router.delete("/:id", (req, res) => {
  User.deleteMany({ _id: req.params.id })
    .then(result => res.json({ success: 1 }))
    .catch(err => console.log(err));
});
module.exports = router;
