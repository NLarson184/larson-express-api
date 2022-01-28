const mongoose = require("mongoose");

// Calendar model for DB
const Calendar = mongoose.model(
    "Calendar",
    new mongoose.Schema({
        name: String,
        color: String,
        owner:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    })
);

module.exports = Calendar;