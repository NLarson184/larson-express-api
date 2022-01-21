var express = require('express');
var router = express.Router();

const { authJwt } = require("../middleware");
const controller = require("../controllers/users.controller");

// Define headers
router.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
})

// All access check
router.get("/test/all", controller.allAccess);

// User access check
router.get("/test/user", [authJwt.verifyToken], controller.userBoard);

// Admin acces check
router.get("/test/admin", [authJwt.verifyToken, authJwt.isAdmin], controller.adminBoard);

module.exports = router;
