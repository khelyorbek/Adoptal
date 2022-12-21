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
    // EK >>> Need to include validations for all the fields here or make sure I am sending an error back from Mongoose.

    // creating a hashed version of the password using Bcrypt
    const hashedPassword = await generatePw(req.query.password);

    // passing everything as is except the password which is the hashed version instead
    const usr = await User.create({
        firstName: req.query.firstName,
        lastName: req.query.lastName,
        userName: req.query.userName,
        password: hashedPassword,
        createdAt: Date(),
        wantToAdopt: [],
        privateNotes: {},
        publicComments: {}
    })

    // hiding the password
    usr.password = undefined;

    console.log("Registration successful as user:", usr.userName);
    // EK >>> Probaby should add it to the storage/session here
    res.send({ "message": "Successfully created user", "user": usr });
})


// Login
// router.get('/', passport.authenticate('local', { failureRedirect: '/login-failure', successRedirect: 'login-success' }));

router.get('/', passport.authenticate('local'), (req, res, next) => {
    // hiding the password
    req.user.password = undefined;
    console.log("Login successful as user:", req.user.userName);
    res.send({ "message": "Login successful", "user" : req.user});
});
// router.get('/', async (req, res) => {

//     // EK >>> try/catch here in case user is not found
//     const usr = await User.findOne({
//         userName: req.query.userName
//     })

//     // Deleting the password from the result and making sure the actual hash nevers gets sent back
//     usr.password = undefined;

//     if (await validatePw(req.query.userName, req.query.password)) {
//         console.log(`Login success for user: ${req.query.userName}`)
//         res.send({
//             "message" : `Login success for user: ${req.query.userName}`,
//             "user" : usr
//         });
//         // EK >>> Probaby should add it to the storage/session here
//         // EK >>> Or maybe just send the basic info + token back to keep for storage?
//         // EK >>> Then 
//     } else {
//         console.log("Unauthorized! Please try again...");
//         res.send({ "message": "Unauthorized! Please try again..." });
//     }

// })

// Update profile (must pass username)
// Need to ensure same user
router.patch('/', async (req, res) => {
    const newFirstName = req.query.firstName;
    const newLastName = req.query.lastName;

    // EK >>> try/catch here in case user is not found
    const usr = await User.findOne({
        userName: req.query.userName
    })

    usr.firstName = newFirstName;
    usr.lastName = newLastName;

    // EK >>> try/catch here in case there are issues
    usr.save();

    console.log(`Successfully update profile for user: ${req.query.userName}`);

    res.send(`Successfully update profile for user: ${req.query.userName}`);

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
        userName: req.query.userName
    })

    if (usr.password === hashedPassword) {
        await User.deleteOne({
            userName: req.query.userName
        })
        console.log(`Delete success for user: ${req.query.userName}`)
        res.send({
            "message" : `Delete success for user: ${req.query.userName}`
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