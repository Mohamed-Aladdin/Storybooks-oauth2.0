const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const connectDB = require("./config/db");

// ENV Config
dotenv.config({ path: "./config/config.env" });

// Passport Config
require("./config/passport")(passport);

connectDB();

const app = express();

// Body Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Method Overrride
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    let method = req.body._method
    delete req.body._method
    return method
  }
}));

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// EJS
app.set("view engine", "ejs");

// Session Config
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
  })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Static Folder
app.use(express.static("public"));

// Routes
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/stories", require("./routes/stories"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`${process.env.NODE_ENV} server started on port ${PORT}`)
});