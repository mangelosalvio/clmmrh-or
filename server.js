require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const passport = require("passport");
const path = require("path");
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const sqldatabase = require("./config/sqldatabase");

sqldatabase
  .authenticate()
  .then(() => console.log("SQL DB Connected"))
  .catch(err => console.log("Error : " + err));

app.set("socketio", io);

const fs = require("fs");

//passport middleare
app.use(passport.initialize());

//passport config
require("./config/passport")(passport);

const db = require("./config/keys").mongoURI;

//routes
const users = require("./routes/api/users");
const logs = require("./routes/api/logs");
const settings = require("./routes/api/settings");

const lots = require("./routes/api/lots");
const surgeons = require("./routes/api/surgeons");
const operating_room_slips = require("./routes/api/operating_room_slips");
const anesthesiologists = require("./routes/api/anesthesiologists");
const nurses = require("./routes/api/nurses");
const relative_value_scales = require("./routes/api/relative_value_scales");
const or_schedules = require("./routes/api/or_schedules");
const optech_selections = require("./routes/api/optech_selections");

app.use(bodyParser.json({ limit: "100mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "100mb",
    extended: true,
    parameterLimit: 50000
  })
);

mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => {
    console.log("MongoDB started");
  })
  .catch(err => console.log(err));

app.use("/api/users", users);

app.use("/api/logs", logs);
app.use("/api/settings", settings);
app.use("/api/surgeons", surgeons);
app.use("/api/operating-room-slips", operating_room_slips);
app.use("/api/anesthesiologists", anesthesiologists);
app.use("/api/nurses", nurses);
app.use("/api/relative-value-scales", relative_value_scales);

app.use("/api/or-schedules", or_schedules);
app.use("/api/optech-selections", optech_selections);

app.use(
  "/public/attachments",
  express.static(path.join(__dirname, "public", "attachments"))
);

app.use("/static/", express.static(path.join(__dirname, "static", "images")));

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const port = process.env.SERVER_PORT || 5000;

http.listen(port, () => console.log(`Server running on PORT ${port}`));
