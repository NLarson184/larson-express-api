const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.user;
const Role = db.role;

let authSecret;
if(process.env.NODE_ENV !== 'production') {
    const config = require("../config/auth.config");
    authSecret = config.secret;
} else {
    authSecret = process.env.AUTH_SECRET;
}

// Verify that the given token both exists and is valid (based on secret token)
verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({ message: "No token provided." });
    }

    jwt.verify(token, authSecret, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Unauthorized." });
        }
        req.userId = decoded.id;
        next();
    })
}

// Check the database that the given user has an admin role
isAdmin = (req, res, next) => {
    User.findById(req.userId).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        Role.find({ _id: { $in: user.roles } }, (err, roles) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }

            for (let i = 0; i < roles.length; i++) {
                if (roles[i].name === "admin") {
                    next();
                    return;
                }
            }

            res.status(403).send({ message: "Requires admin role." });
            return;
        })
    })
}

const authJwt = {
    verifyToken,
    isAdmin
};
module.exports = authJwt;