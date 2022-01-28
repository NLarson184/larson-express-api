const mongoose = require("mongoose");

const Event = mongoose.model(
    "Event",
    new mongoose.Schema({
        name: String,
        dateTime: Date,
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        calendarList: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Calendar"
            }
        ],
        notes: String
    })
);

module.exports = Event;