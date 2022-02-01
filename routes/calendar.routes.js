var express = require('express');
var router = express.Router();

const { authJwt } = require("../middleware");
const controller = require("../controllers/calendar.controller");

// Define the headers for this route
router.use(function (req, res, next) {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
    );
    next();
});

// Get a list of events for a given user
router.get(
    "/eventList",
    [authJwt.verifyToken],
    controller.getEventList
);

// Get details for a specific event
router.get(
    "/event/:id",
    [authJwt.verifyToken],
    controller.getEvent
)

// Get a list of calendars for a given user
router.get(
    "/list",
    [authJwt.verifyToken],
    controller.getCalendarList
)

// Create a new calendar
router.post(
    "/",
    [authJwt.verifyToken],
    controller.AddCalendar
);

// Create a new event
router.post(
    "/event",
    [authJwt.verifyToken],
    controller.addEvent
);

// Delete an existing event
router.delete(
    "/event/:id",
    [authJwt.verifyToken],
    controller.removeEvent
);

// Delete an existing calendar
router.delete(
    "/:id",
    [authJwt.verifyToken],
    controller.removeCalendar
)

// TODO: Update event
// TODO: Update calendar

module.exports = router;