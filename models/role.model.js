const mongoose = require("mongoose");

// Role model for DB
const Role = mongoose.model(
    "Role",
    new mongoose.Schema({
        name: String
    })
);

module.exports = Role;