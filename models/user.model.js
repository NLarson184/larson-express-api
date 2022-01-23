const mongoose = require("mongoose");

// User model for DB
const User = mongoose.model(
    "User",
    new mongoose.Schema({
        email: String,
        firstname: String,
        lastname: String,
        password: String,
        roles: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Role"
            }
        ]
    })
);

module.exports = User;