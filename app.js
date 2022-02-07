var express = require('express');
var cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');

var users = require('./routes/users.routes');
var auth = require('./routes/auth.routes');
var calendar = require('./routes/calendar.routes');

var env = process.env.NODE_ENV || 'development';


var app = express();
const port = 3000;

// Connect to MongoDB instance
const db = require("./models");
// const dbConfig = require("./config/db.config");
const Role = db.role;
if (env !== 'production') {
    var dbConfig = require('./config/db.config')[env];
    db.mongoose.connect(dbConfig.database.URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log(`Successfully connected to MongoDb using ${env} config`);
        initial();
    }).catch(err => {
        console.error("Connection Error", err);
        process.exit();
    });
} else {
    db.mongoose.connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log(`Successfully connected to MongoDb using ${env} config`);
        initial();
    }).catch(err => {
        console.error("Connection Error", err);
        process.exit();
    });
}


// Define the CORS rules
var corsOptions = {
    origin: "http://localhost:4200,https://api.nicklarson.me,http://api.nicklarson.me"

};
// app.use(cors(corsOptions));

// Parse application/json requests
app.use(express.json());

// Parse application/x-www-form-urlencoded requests
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser())

// Define our routes
app.use('/v1/users', users);
app.use('/v1/auth', auth);
app.use('/v1/calendar', calendar);

// Serve the public folder statically
app.use(express.static('public'));

module.exports = app;

// app.listen(port, () => {
//     console.log(`Larson Server api listening at http://localhost:${port}`)
// });

// Seed the DB if nothing exists
function initial() {
    Role.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            new Role({
                name: "user"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("added 'user' to roles collection");
            });

            new Role({
                name: "admin"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("added 'admin' to roles collection");
            });
        }
    })
}