// main express application
const express = require("express");
// setting up the express router
const router = express.Router();
// Importing the schema for the MongoDB user that we have created
const { User } = require('../schemas/User')
// for authentication purposes
const passport = require('passport');
// getting our custom auth methods
const { validatePw, generatePw } = require('../models/password');
// getting the connection info
const { db_users_connection } = require('../schemas/User');


// For routes below, we do not need to make sure that the Pethfinder token is alive
// because we are not sending any REST request to Petfinder API

// ------------------------- ROUTES - START - /user -------------------------
// Registration
router.post('/', async (req, res) => {
    // console.log("POST /user >>> req", req);
    const payload = req.body.params;
    // EK >>> Need to include validations for all the fields here or make sure I am sending an error back from Mongoose.

    // creating a hashed version of the password using Bcrypt
    const hashedPassword = await generatePw(payload.password);

    // passing everything as is except the password which is the hashed version instead
    const usr = await User.create({
        firstName: payload.firstName,
        lastName: payload.lastName,
        username: payload.username,
        password: hashedPassword,
        createdAt: Date(),
        wantToAdopt: [],
        privateNotes: {},
        publicComments: {}
    })

    // hiding the password
    usr.password = '';

    req.user = usr;

    console.log("Registration successful as user:", usr.username);
    // EK >>> Probaby should add it to the storage/session here
    res.send({ "message": "Successfully created user", "user": usr });
})


// Login
// router.get('/', passport.authenticate('local', { failureRedirect: '/login-failure', successRedirect: 'login-success' }));

router.get('/', passport.authenticate('local'), (req, res, next) => {
    // hiding the password
    req.user.password = '';
    console.log("Login successful as user:", req.user.username);
    res.send({ "message": "Login successful", "user": req.user });
});

router.get('/getUser', (req, res, next) => {
    // hiding the password
    try {
        req.user.password = '';
        res.send(req.user); // Stores the entire user inside of it
    } catch (e) {
        res.send({ "message": "Error while processing your request" })
    }

})

// must have a user cookie stored.
// req.logout is now async, modified code per https://stackoverflow.com/questions/72336177/error-reqlogout-requires-a-callback-function
router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            console.log("Error while logging out >>>", err)
            res.send(err);
            next(err);
        }
        console.log("Logged user out")
        res.send({
            "message": "Successfully logged out"
        })
    });

})

// Update profile (must pass username)
// Need to ensure same user
router.patch('/', async (req, res) => {
        const payload =  req.body;
        const newFirstName = payload.firstName;
        const newLastName = payload.lastName;
        console.log("backend >>> users >>> patch >>> received", payload);
        console.log("backend >>> users >>> patch >>> req.user", payload.username);

        // EK >>> try/catch here in case user is not found
        const usr = await User.findOne({
            username: payload.username
        })

        usr.firstName = newFirstName;
        usr.lastName = newLastName;

        // EK >>> try/catch here in case there are issues
        usr.save();

        req.user = usr;

        console.log(`Successfully update profile for user: ${payload.username}`);

        res.send({
            "message": `Successfully update profile for user`,
            "user": usr
        });
})

// Delete your profile
// Need to ensure same user and retyped password is correct
router.delete('/', async (req, res) => {
    // EK >>> Need to include validations for all the fields here or make sure I am sending an error back from Mongoose.
    const receivedPassword = req.query.password;

    // EK >>> gotta update this with bcrypt
    const hashedPassword = receivedPassword;

    // EK >>> try/catch here in case user is not found
    const usr = await User.findOne({
        username: req.query.username
    })

    if (usr.password === hashedPassword) {
        await User.deleteOne({
            username: req.query.username
        })
        console.log(`Delete success for user: ${req.query.username}`)
        res.send({
            "message": `Delete success for user: ${req.query.username}`
        });
        // EK >>> Probaby should add it to the storage/session here
        // EK >>> Or maybe just send the basic info + token back to keep for storage?
        // EK >>> Then 
    } else {
        console.log("Unauthorized! Please try again...");
        res.send({ "message": "Unauthorized! Please try again..." });
    }

})


// ------------------------- ROUTES - END -------------------------

module.exports = router;