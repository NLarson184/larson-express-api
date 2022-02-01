const db = require("../models");
const User = db.user;
const Calendar = db.calendar;
const Event = db.event;

var jwt = require("jsonwebtoken");
const Role = require("../models/role.model");
const moment = require("moment");

// Create an event based on the given information
exports.addEvent = (req, res) => {
    // Get the user information based on the id
    User.findById(req.userId).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }

        // Create the event object
        const event = new Event({
            name: req.body.name,
            dateTime: req.body.dateTime,
            creator: user._id,
            calendarList: req.body.calendarList,
            notes: req.body.notes
        });

        // Save the event
        event.save((err, event) => {
            if (err) {
                return res.status(500).send({ message: err });
            }

            return res.status(200).send({ messsage: "Event registered successfully." });
        })
    })
}

// Create a new calendar
exports.AddCalendar = (req, res) => {
    // Get the user information based on the id
    User.findById(req.userId).exec((err, user) => {
        if (err) {
            return res.status(500).send({ message: err });
        }

        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }

        // Create the new calendar object
        const calendar = new Calendar({
            name: req.body.name,
            color: req.body.color,
            owner: user._id
        });

        // Save the new calendar object
        calendar.save((err, calendar) => {
            if (err) {
                return res.status(500).send({ message: err });
            }

            return res.status(200).send({ message: "Calendar successfully added." });
        })
    })
}

// Get details for a specific event
exports.getEvent = (req, res) => {
    User.findById(req.userId).exec((err, user) => {
        if (err) {
            return res.status(500).send({ message: err });
        }
        if (!user) {
            return res.status(404).send({ message: 'User not found.' });
        }

        Event.findById(req.params.id)
            .populate("creator", "-__v")
            .populate("calendarList", "-__v")
            .exec((err, event) => {
                if (err) {
                    return res.status(500).send({ message: err });
                }
                if (!event) {
                    return res.status(404).send({ message: 'Event not found.' });
                }

                return res.status(200).send({
                    _id: event._id,
                    name: event.name,
                    dateTime: event.dateTime,
                    creator: event.creator.email,
                    calendarList: event.calendarList,
                    notes: event.notes
                });
            })
    })
}

// Get a list of events that this user has access to
exports.getEventList = (req, res) => {
    User.findById(req.userId).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }

        // Get all the calendars that this user has access to
        Calendar.find({ owner: user._id }, (err, calendars) => {
            if (err) {
                return res.status(500).send({ message: err });
            }

            if (!calendars) {
                return res.status(404).send({ messgae: "No calendars found." });
            }

            // Build out the search parameters
            var calendarIdList = calendars.map(c => c._id);
            var eventListQuery = {
                calendarList: { $in: calendarIdList }
            }
            if (req.query.month && req.query.year) {
                // Get the date object for this month
                let startMonth = moment([req.query.year, req.query.month]);
                let endMonth = moment(startMonth).endOf('month');
                eventListQuery.dateTime = { $gte: startMonth.toDate(), $lte: endMonth.toDate() };
            }

            // Find all the events that are mapped to any of these calendars
            Event.find(eventListQuery)
                .populate("calendarList", "-__v")
                .exec((err, events) => {
                    if (err) {
                        return res.status(500).send({ message: err });
                    }

                    if (!events) {
                        return res.status(404).send({ message: "No events found." });
                    }

                    // Build out the return object
                    var eventList = [];
                    for (let i = 0; i < events.length; i++) {
                        // Build a list of calendar objects that this event is attached to
                        var calendarList = [];
                        for (let j = 0; j < events[i].calendarList.length; j++) {
                            var currCalendar = events[i].calendarList[j];
                            calendarList.push({
                                id: currCalendar._id,
                                name: currCalendar.name,
                                color: currCalendar.color
                            });
                        }

                        // Build a list of events that this user has access to
                        var currEvent = events[i];
                        eventList.push({
                            id: currEvent._id,
                            name: currEvent.name,
                            dateTime: currEvent.dateTime,
                            creator: currEvent.creator,
                            calendarList: currEvent.calendarList.map(c => c._id)
                        });
                    }

                    return res.status(200).send(eventList);
                });
        });
    });
}

// Get a list of calendars that this user has access to
exports.getCalendarList = (req, res) => {
    User.findById(req.userId).exec((err, user) => {
        if (err) {
            return res.status(500).send({ message: err });
        }
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }

        Calendar.find({ owner: user._id })
            .populate("owner", "-__v")
            .exec((err, calendars) => {
                if (err) {
                    return res.status(500).send({ message: err });
                }

                if (calendars.length == 0) {
                    return res.status(404).send({ message: "No calendars found." });
                }

                var calendarList = [];
                for (let i = 0; i < calendars.length; i++) {
                    var currCalendar = calendars[i];
                    calendarList.push({
                        id: currCalendar._id,
                        name: currCalendar.name,
                        color: currCalendar.color,
                        owner: user._id
                    });
                }

                return res.status(200).send(calendarList);
            })
    })
}

// Delete an event
exports.removeEvent = (req, res) => {
    User.findById(req.userId).exec((err, user) => {
        if (err) {
            return res.status(500).send({ message: err });
        }
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }

        // Find the event that maps to the given id
        Event.findById(req.params.id).exec((err, event) => {
            if (err) {
                return res.status(500).send({ message: err });
            }
            if (!event) {
                return res.status(404).send({ message: "Event not found." });
            }

            // Verify that this user is the owner of the event
            if (event.creator.toString() != user._id.toString()) {
                return res.status(401).send({ message: "Only the event creator can delete an event." + typeof(event.creator) + ' ' + typeof(user._id) });
            }

            // Remove the event from the database
            Event.deleteOne({ _id: event._id }, (err) => {
                if (err) {
                    return res.status(500).send({ message: err });
                }
                return res.status(200).send({ message: "Event successfully deleted." });
            });
        })
    })
}

// Delete a calendar
exports.removeCalendar = (req, res) => {
    User.findById(req.userId).exec((err, user) => {
        if (err) {
            return res.status(500).send({ message: err });
        }
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }

        // Find the calendar that matches the given id
        Calendar.findById(req.params.id).exec((err, calendar) => {
            if (err) {
                return res.status(500).send({ message: err });
            }
            if (!calendar) {
                return res.status(404).send({ message: "Calendar not found." });
            }

            // Verify that this user is the owner of the calendar
            if (calendar.owner !== user._id) {
                return res.status(401).send({ message: "Only the calendar owner can delete a calendar." });
            }

            // Iterate through all the events that are mapped to this calendar and remove the mapping
            Event.find({ calendarList: calendar._id }, (err, events) => {
                if (err) {
                    return res.status(500).send({ message: err });
                }

                let eventsToDelete = [];
                for (let i = 0; i < events.length; i++) {
                    let currEvent = events[i];

                    if (currEvent.calendarList.length === 1) {
                        // If this is the only linked calendar, remove the event
                        eventsToDelete.push(currEvent._id);
                    } else {
                        // Get the index of this calendar objectId
                        let indexToRemove = currEvent.calendarList.indexOf(calendar._id);

                        // Splice this element from the list, if it's found
                        currEvent.calendarList.splice(indexToRemove, 1);
                        if (indexToRemove >= 0) {
                            Event.updateOne({ id: currEvent._id }, { calendarList: currEvent.calendarList }).exec((err, res) => {
                                if (err) {
                                    return res.status(500).send({ message: err });
                                }
                            })
                        }
                    }
                }

                // Remove the calendar now that all the events have been un-mapped
                Calendar.deleteOne({ _id: calendar._id }, (err) => {
                    if (err) {
                        return res.status(500).send({ message: err });
                    }
                    return res.status(200).send({ message: "Calendar deleted successfully." });
                })
            })
        })
    })
}