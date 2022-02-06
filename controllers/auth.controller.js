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

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

// Sign up function
exports.signup = (req, res) => {
    const user = new User({
        email: req.body.email,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: bcrypt.hashSync(req.body.password, 8)
    });

    user.save((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        if (req.body.roles) {
            Role.find({ name: { $in: req.body.roles } }, (err, roles) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }

                user.roles = roles.map(role => role._id);
                user.save(err => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    }

                    res.send({ message: "User registered successfully." });
                })
            })
        } else {
            Role.findOne({ name: "user" }, (err, role) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }

                user.roles = [role._id];
                user.save(err => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    }

                    res.send({ message: "User registered successfully." });
                });
            });
        }
    });
};

// Sign in function
exports.signin = (req, res) => {
    User.findOne({
        email: req.body.email
    })
        .populate("roles", "-__v")
        .exec((err, user) => {
            // Return error if there was an error querying the db (different than no user found)
            if (err) {
                res.status(500).send({ message: err });
                return;
            }

            // If the email does not map to a user, return Not Found
            if (!user) {
                return res.status(404).send({ message: "User not found." });
            }

            // Check that the given password matches the stored password for this user
            var isPasswordValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );

            // If the password is invalid, return Unauthorized error
            if (!isPasswordValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Invalid password."
                });
            }

            // Generate an auth token that lasts 24 hours
            var token = jwt.sign({ id: user.id }, authSecret, {
                expiresIn: 86400
            });

            // Generate a list of stored roles for the user
            var authorities = [];
            for (let i = 0; i < user.roles.length; i++) {
                authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
            }

            res.status(200).send({
                id: user._id,
                email: user.email,
                roles: authorities,
                accessToken: token,
                firstname: user.firstname,
                lastname: user.lastname
            });
        });
};