var express = require('express');
var cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');

var users = require('./routes/users.routes');
var auth = require('./routes/auth.routes');
var calendar = require('./routes/calendar.routes');

var app = express();
const port = 3000;

// Connect to MongoDB instance
const db = require("./models");
const dbConfig = require("./config/db.config");
const Role = db.role;

db.mongoose.connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Successfully connected to MongoDb");
    initial();
}).catch(err => {
    console.error("Connection Error", err);
    process.exit();
});

// Define the CORS rules
var corsOptions = {
    origin: "http://localhost:4200",

};
app.use(cors(corsOptions));

// Parse application/json requests
app.use(express.json());

// Parse application/x-www-form-urlencoded requests
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser())

// Define our routes
app.use('/api/v1/users', users);
app.use('/api/v1/auth', auth);
app.use('/api/v1/calendar', calendar);

module.exports = app;

app.listen(port, () => {
    console.log(`Larson Server api listening at http://localhost:${port}`)
});

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