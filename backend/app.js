"use strict";

/** Express app for Adoptal's back-end. */

// main express application
const express = require("express");
const app = express();
// used for configuring Cross-origin resource sharing
const cors = require('cors');
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

// ------------------------- DATABASE CONFIG - START -------------------------
// library for interacting with MongoDB
const mongoose = require("mongoose");
// Need to set the strictQuery to false per MongDB documentation
mongoose.set('strictQuery', false);
// ------------------------- DATABASE CONFIG - END -------------------------

// ------------------------- MIDDLEWARE - START -------------------------
// telling express to return the responses in JSON format so we can use it in React
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// creating CORS config to avoid error "blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource"
const corsConfig = {
  origin: true,
  credentials: true,
};
// telling express to use cors we just created
app.use(cors(corsConfig));
app.options('*', cors(corsConfig))

// ------------------------- MIDDLEWARE - END -------------------------

// ------------------------- EXPRESS SESSION CONFIG - START -------------------------
// requiring main packages for session management
const session = require('express-session');
// library for parsing the data from the cookies
const cookieParser = require('cookie-parser');
// requiring the connect-mongo package which will help us with storing session info in the DB for scalability
const MongoStore = require('connect-mongo');
// connecting to the mongo db for session collection
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true, // EK - < - should be set to false in PROD. The reasoning behind this is that this will prevent a lot of empty session objects being stored in the session store. Since there's nothing useful to store, the session is "forgotten" at the end of the request.
  proxy: false, // Required for Heroku & Digital Ocean (regarding X-Forwarded-For)

  // Creating a store in the MongoDB to store the session data
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_DB,
    mongoOptions: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  }),
  cookie: {
    // secure: true,
    // sameSite: 'none',
    // httpOnly: false,

    // setting the cookie expiration time
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
// parsing the cookie using the secret that we have stored in ENV variables
app.use(cookieParser(process.env.SESSION_SECRET));
// initializing the passport middleware
app.use(passport.initialize());
// mapping the passport middleware into express-session
// express-session will give us access to req.session object which is a cookie
// we also have connect-mongo configured to work with express session
// which will store the session ids and info into the MongoDB collection
// anything that we store on the req.session, inside any routes
// will be persisted to the db using the sessions collection
app.use(passport.session());
require('./auth/passport')(passport);

const { isAuth } = require('./models/password')

// ------------------------- PASSPORT AUTHENTICATION - END -------------------------

// ------------------------- ROUTER - START -------------------------
// telling express to use the routes
app.use("/cat", catRoutes);
app.use("/org", orgRoutes);
app.use("/pet", petRoutes);
app.use("/user", userRoutes);
app.use((req, res, next) => {
  // console.log("req.session >>>", req.session)
  // console.log("req.user >>>", req.user)
  next();
})
// ------------------------- ROUTER - END -------------------------

// ------------------------- EXPORTS -------------------------
module.exports = app;