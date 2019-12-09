require("dotenv").config();
const mongoose = require("mongoose");
const moment = require("moment");
const RVS = require("./models/RelativeValueScale");
const xlsx = require("xlsx");
const asyncForeach = require("./utils/asyncForeach");
const round = require("./utils/round");
const numeral = require("numeral");

const db = require("./config/keys").mongoURI;
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => {
    console.log("MongoDB started");
  })
  .catch(err => console.log(err));

var workbook = xlsx.readFile("./rvs.xlsx");

/* workbook.SheetNames.forEach(sheet_name => {
  const arr_data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name]);

}); */

// ADDING EQUIPMENTS

/* const ws = workbook.Sheets["equipments"];
const json = xlsx.utils.sheet_to_json(ws);

json.forEach(o => {
  const equipment = new Equipment({
    equipment_code: o.equipment_code,
    name: o.name,
    brand: o.brand,
    plate_no: o.plate_no
  });

  equipment
    .save()
    .then(e => console.log(e))
    .catch(err => console.log(err));
});
 */
// ADDING EQUIPMENTS

/* const ws = workbook.Sheets["tools"];
const json = xlsx.utils.sheet_to_json(ws);

json.forEach(o => {
  const equipment = new Equipment({
    name: o.name
  });

  equipment
    .save()
    .then(e => console.log(e))
    .catch(err => console.log(err));
}); */

/* // ADDING DRIVERS

const ws = workbook.Sheets["drivers"];
const json = xlsx.utils.sheet_to_json(ws);

json.forEach(o => {
  const record = new Driver({
    name: o.driver
  });

  record
    .save()
    .then(e => console.log(e))
    .catch(err => console.log(err));
}); */

const ws = workbook.Sheets["sheet 1"];
const json = xlsx.utils.sheet_to_json(ws, { raw: false });

let member = null;

asyncForeach(json, async (o, index) => {
  const code = o["code"].trim();
  const description = o["description"].trim();
  const logs = [];

  member = await new RVS({
    code,
    description,
    logs
  }).save();
  console.log("Saving..." + index);
});
console.log("Done");
