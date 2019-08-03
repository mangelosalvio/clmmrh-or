const express = require("express");
const router = express.Router();
const AppSetting = require("./../../models/AppSetting");

const moment = require("moment");
const constants = require("./../../config/constants");

router.get("/association-dues", (req, res) => {
  AppSetting.find().then(settings => {
    let form_data = {};

    const association_dues_home_owner = settings.find(
      o => o.key === constants.ASSOCIATION_DUES_HOME_OWNER
    );
    if (association_dues_home_owner) {
      form_data[constants.ASSOCIATION_DUES_HOME_OWNER] =
        association_dues_home_owner.value;
    }
    const association_dues_lot_owner = settings.find(
      o => o.key === constants.ASSOCIATION_DUES_LOT_OWNER
    );

    if (association_dues_lot_owner) {
      form_data[constants.ASSOCIATION_DUES_LOT_OWNER] =
        association_dues_lot_owner.value;
    }

    const late_charges_penalty = settings.find(
      o => o.key === constants.LATE_CHARGES_PENALTTY
    );

    if (late_charges_penalty) {
      form_data[constants.LATE_CHARGES_PENALTTY] = late_charges_penalty.value;
    }

    return res.json(form_data);
  });
});

router.get("/water-billing-rates", (req, res) => {
  AppSetting.find().then(settings => {
    let form_data = {};

    const water_billing_flat_rate = settings.find(
      o => o.key === constants.WATER_BILLING_FLAT_RATE
    );
    if (water_billing_flat_rate) {
      form_data[constants.WATER_BILLING_FLAT_RATE] =
        water_billing_flat_rate.value;
    }
    const water_billing_rate = settings.find(
      o => o.key === constants.WATER_BILLLING_RATE
    );

    if (water_billing_rate) {
      form_data[constants.WATER_BILLLING_RATE] = water_billing_rate.value;
    }

    const late_charges_penalty = settings.find(
      o => o.key === constants.LATE_CHARGES_PENALTTY
    );

    if (late_charges_penalty) {
      form_data[constants.LATE_CHARGES_PENALTTY] = late_charges_penalty.value;
    }

    return res.json(form_data);
  });
});

router.get("/", (req, res) => {
  AppSetting.find().then(settings => res.json(settings));
});

router.post("/", (req, res) => {
  const key = req.body.key;
  const value = req.body.value;

  AppSetting.findOneAndUpdate(
    {
      key
    },
    {
      key,
      value
    },
    {
      upsert: true,
      new: true
    }
  ).then(setting => res.json(setting));
});

module.exports = router;
