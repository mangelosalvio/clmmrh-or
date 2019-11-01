const { Sequelize } = require("sequelize");
const sqldatabase = require("./../../config/sqldatabase");

const table = "persons";

const Person = sqldatabase.define(
  table,
  {
    student_no: {
      type: Sequelize.STRING
    },
    name: {
      type: Sequelize.STRING
    },
    registration_date: {
      type: Sequelize.DATE
    },
    birth_date: {
      type: Sequelize.DATE
    },
    weight: {
      type: Sequelize.INTEGER
    }
  },
  {
    timestamps: false
  }
);
//add if there are no primary key
Person.removeAttribute("id");
module.exports = Person;
