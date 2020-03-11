const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ORSchedule = new Schema({
  period: [Date],
  team_captains: [Object],
  pacu: [Object],
  on_duty: [Object],
  room_schedule: [
    {
      room: String,
      status: String
    }
  ],
  logs: [
    {
      user: Object,
      datetime: Date,
      log: String
    }
  ]
});

module.exports = mongoose.model("or_schedules", ORSchedule);
