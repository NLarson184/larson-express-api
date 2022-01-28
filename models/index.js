const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user.model");
db.role = require("./role.model");
db.calendar = require("./calendar.model");
db.event = require("./event.model");

db.ROLES = ["user", "admin"];

module.exports = db;