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
)

// Create a new event
router.post(
    "/event",
    [authJwt.verifyToken],
    controller.addEvent
);