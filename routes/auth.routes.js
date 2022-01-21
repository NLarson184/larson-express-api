var express = require('express');
var router = express.Router();

const { verifySignUp } = require("../middleware");
const controller = require("../controllers/auth.controller");

// Define the headers for this route
router.use(function (req, res, next) {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
    );
    next();
});

/* POST sign up info */
router.post(
    "/signup",
    [verifySignUp.checkDuplicateEmail, verifySignUp.checkRolesExist],
    controller.signup
);

/* POST login info */
router.post('/signin', controller.signin);

/* GET user test for content */
router.get('/test/user', function (req, res, next) {
    // TODO: user content test logic
});

/* GET admin test for content */
router.get('/test/admin', function (req, res, next) {
    // TODO: admin content test logic
});

module.exports = router;
