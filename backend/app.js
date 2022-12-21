"use strict";

/** Express app for Adoptal's back-end. */

// ------------------------- IMPORTS - START -------------------------
// main express application
const express = require("express");
const app = express();
// used for sending requests
const axios = require("axios");
// importing passport authentication library
const passport = require('passport');
// importing the routes for the router
const catRoutes = require("./routes/cats");
const orgRoutes = require("./routes/orgs");
const petRoutes = require("./routes/pets");
const userRoutes = require("./routes/users");

// Gives us access to variables set in the .env file via `process.env.VARIABLE_NAME` syntax
require('dotenv').config();
// ------------------------- IMPORTS - END -------------------------

// ------------------------- DATABASE CONFIG - START -------------------------
// library for interacting with MongoDB
const mongoose = require("mongoose");
// Need to set the strictQuery to false per MongDB documentation
mongoose.set('strictQuery', false);
// ------------------------- DATABASE CONFIG - END -------------------------

// ------------------------- MIDDLEWARE - START -------------------------
// telling express to return the responses in JSON format so we can use it in React
app.use(express.json());
app.use(express.urlencoded({extended: true}));
// ------------------------- MIDDLEWARE - END -------------------------

// ------------------------- EXPRESS SESSION CONFIG - START -------------------------
// requiring main packages for session management
const session = require('express-session');
// requiring the connect-mongo package which will help us with storing session info in the DB
const MongoStore = require('connect-mongo');
// connecting to the mongo db for session collection
app.use(session({
    secret: process.env.session_secret,
    resave: false,
    saveUninitialized: true, // EK - < - should be set to false in PROD. Do some research
    // EK - v - should be set to false in PROD
    proxy: false, // Required for Heroku & Digital Ocean (regarding X-Forwarded-For)
    // name: 'Adoptal-session', // This needs to be unique per-host.
    store: MongoStore.create({
      mongoUrl: process.env.mongodb_connect_string,
      mongoOptions: {
        useNewUrlParser: true, 
        useUnifiedTopology: true
      }
    }),
    cookie: {
        // secure: true,
        // sameSite: 'none',
        // httpOnly: false,
        maxAge: 1000 * 60 * 60 * 24 * 7 // Equals 7 days (7 days * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
    }
  }));

// ------------------------- EXPRESS SESSION CONFIG - END -------------------------

// ------------------------- VARIABLES - START -------------------------
// storing the authentication token from Petfinder API into RAM
global.pf_auth_token = '';
// storing the authentication token expiration from Petfinder API into RAM as blank
global.pf_token_expiration = '';
// ------------------------- VARIABLES - END -------------------------

// ------------------------- PASSPORT AUTHENTICATION - START -------------------------
require('./auth/passport');
const { isAuth } = require('./models/password')

// initializing the passport middleware
app.use(passport.initialize());
// mapping the passport middleware into express-session
// express-session will give us access to req.session object which is a cookie
// we also have connect-mongo configured to work with express session
// which will store the session ids and info into the MongoDB collection
// anything that we store on the req.session, inside any routes
// will be persisted to the db using the sessions collection
app.use(passport.session());
// ------------------------- PASSPORT AUTHENTICATION - END -------------------------

// ------------------------- ROUTER - START -------------------------
// telling express to use the routes
app.use("/cat", catRoutes);
app.use("/org", orgRoutes);
app.use("/pet", petRoutes);
app.use("/user", userRoutes);
app.get("/", isAuth, (req, res, next) => {
    console.log("req.session >>>", req.session);
    console.log("req.user >>>", req.user);
    res.send("<h1>Testing of the express session cooke</h1>")
})
app.use((req, res, next) => {
  console.log("req.session >>>", req.session)
  console.log("req.user >>>", req.user)
  next();
})
// ------------------------- ROUTER - END -------------------------

// ------------------------- EXPORTS -------------------------
module.exports = app;