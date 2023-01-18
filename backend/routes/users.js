// main express application
const express = require("express");
// setting up the express router
const router = express.Router();
// Importing the schema for the MongoDB user that we have created
const { User } = require('../schemas/User')
// for authentication purposes
const passport = require('passport');
// getting our custom auth methods
const { generatePw } = require('../models/password');
// getting the connection info
// const { db_users_connection } = require('../schemas/User');


// For routes below, we do not need to make sure that the Pethfinder token is alive
// because we are not sending any REST request to Petfinder API

// ------------------------- ROUTES - START - /user -------------------------
// Registration
router.post('/', async (req, res) => {
    try {
        // for debugging
        // console.log("POST /user >>> req", req);

        // creating a paylod variable to store the received params in
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

        // hiding the password before sending the user object back to the requester
        usr.password = '';

        // setting the user object in the request to the user that we just created
        req.user = usr;

        // logging and sending a success message
        console.log("Registration successful as user:", usr.username);
        res.send({ "message": "Successfully created user", "user": usr });
    } catch (err) {
        console.log("Adoptal > Back-end > routes > users.js > post('/') > ", err);
    }

})


// Login
// using the passport.authenticate('local') to authenticate the user using passport
router.get('/', passport.authenticate('local'), (req, res, next) => {
    try {
        // if the auth is successful, continue below
        // otherwise, returns 401

        // hiding the password before sending the user back to the requester
        req.user.password = '';

        // logging and sending the user back to the requester
        console.log("Login successful as user:", req.user.username);
        res.send({ "message": "Login successful", "user": req.user });
    } catch (err) {
        console.log("Adoptal > Back-end > routes > users.js > get('/') > ", err);
    }

});

// Getting / verifying that the user is authenticated
router.get('/getUser', (req, res, next) => {
    try {
        // hiding the password before sending the user to the requester
        req.user.password = '';
        // if req.user already exists, sends it back to the requester
        // req.user is the object that stores the full user data except the password
        res.send(req.user);
    } catch (err) {
        console.log("Adoptal > Back-end > routes > users.js > get('/getUser') > ", err);
        res.send({ "message": "Error while processing your request" })
    }

})

// Logout route. must have a user cookie stored already.
// req.logout is now async, modified code per https://stackoverflow.com/questions/72336177/error-reqlogout-requires-a-callback-function
router.get('/logout', (req, res, next) => {
    try {
        // using the built in passport logout function stored inthe req
        req.logout(function (err) {
            // if there is an error
            if (err) {
                // logging the error
                console.log("Error while logging out >>>", err)
                // sending the error to the requester
                res.send(err);
                // sending the error to the next middleware
                next(err);
            }
            // if there is not error
            // logging into console
            console.log("Logged user out")
            // and sending a message in a request back to the requester
            res.send({
                "message": "Successfully logged out"
            })
        });
    } catch (err) {
        console.log("Adoptal > Back-end > routes > users.js > get('/logout') > ", err);
    }


})

// Update profile (must pass username)
router.patch('/', async (req, res) => {
    try {
        // storing the received data into variables
        const payload = req.body;
        const newFirstName = payload.firstName;
        const newLastName = payload.lastName;

        // for debugging
        // console.log("backend >>> users >>> patch >>> received", payload);
        // console.log("backend >>> users >>> patch >>> req.user", payload.username);

        // performing a mongoose query to find the user my the username provided in the payload
        const usr = await User.findOne({
            username: payload.username
        })

        // setting the user's first and last name to the new values passed to the route
        usr.firstName = newFirstName;
        usr.lastName = newLastName;

        // saving the user
        usr.save();

        // setting the current user in the req to the one we just created/modified
        req.user = usr;

        // logging a message
        console.log(`Successfully update profile for user: ${payload.username}`);

        // sending a success message back
        res.send({
            "message": `Successfully update profile for user`,
            "user": usr
        });
    } catch (err) {
        console.log("Adoptal > Back-end > routes > users.js > patch('/') > ", err);
    }
    
})

// Delete your profile
// this route exists for future enhancement. Currently is not a feature.
router.delete('/', async (req, res) => {
    console.log("NOT CONFIGURED!");
    res.send("NOT CONFIGURED!");
    // EK >>> Need to include validations for all the fields here or make sure I am sending an error back from Mongoose.
    // const receivedPassword = req.query.password;

    // EK >>> need to update this with bcrypt
    // const hashedPassword = receivedPassword;

    // EK >>> try/catch here in case user is not found
    // const usr = await User.findOne({
    //     username: req.query.username
    // })

    // if (usr.password === hashedPassword) {
    //     await User.deleteOne({
    //         username: req.query.username
    //     })
    //     console.log(`Delete success for user: ${req.query.username}`)
    //     res.send({
    //         "message": `Delete success for user: ${req.query.username}`
    //     });
        // EK >>> should add it to the storage/session here
        // EK >>> Or maybe just send the basic info + token back to keep for storage?
        // EK >>> Then 
    // } else {
    //     console.log("Unauthorized! Please try again...");
    //     res.send({ "message": "Unauthorized! Please try again..." });
    // }
})

// ------------------------- ROUTES - END -------------------------

module.exports = router;