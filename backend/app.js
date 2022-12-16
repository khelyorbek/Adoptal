"use strict";

/** Express app for Adoptal's back-end. */



// ------------------------- IMPORTS - START -------------------------
const express = require("express");
const mongoose = require("mongoose");
// getting the mongo db connection string from the secrets file
const { mongodb_connect_string } = require("./secrets.js");
// Need to set the strictQuery to false per MongDB documentation
mongoose.set('strictQuery', false);

// connecting to the mongo db
mongoose.connect(mongodb_connect_string);

// Importing the schema that we have created
const User = require('./schemas/User')
// ------------------------- IMPORTS - END -------------------------



// ------------------------- VARIABLES - START -------------------------
const app = express();
const BASE_URL = "https://api.petfinder.com/v2"
// ------------------------- VARIABLES - END -------------------------



// ------------------------- PETFINDER API STUFF - START -------------------------
// used for sending requests to Petfinder API
const axios = require("axios");
// used for sending Form URL Encoded type request to get an auth token from Petfinder API
const querystring = require('querystring');
// getting the client token and client secret from the secrets file
const { client_id, client_secret } = require("./secrets.js");
// storing the authentication token from Petfinder API into RAM
let pf_auth_token = '';
// storing the authentication token expiration from Petfinder API into RAM as blank
let pf_token_expiration = '';

async function renewToken() {
    // sending a post request to Oath endpoint of the PetFinder API to get a token
    // storing the response in a variable
    const token = await axios.post('https://api.petfinder.com/v2/oauth2/token', querystring.stringify({
        grant_type: 'client_credentials', // must be set to this per API docs
        client_id: client_id,  // from secrets file
        client_secret: client_secret // from secrets file
    }));

    // storing the token into a variable

    pf_auth_token = token.data.access_token;

    // console.log(">>> pf_auth_token >>> ", token.data.access_token);

    // getting the current date/time
    const t = new Date();
    // updating the time to 59 minutes into the future
    t.setMinutes(t.getMinutes() + 59);
    // PetFinder API token expire every 60 mins
    // so setting the variable (token's expiration time) to the current time/date + 59 minutes
    pf_token_expiration = t;

    // console.log(">>> t >>> ", pf_token_expiration);
    console.log("PetFinder API OAuth Token renewed.")
    console.log("PetFinder API OAuth Token Expiration:", pf_token_expiration);
}

// function to keep the Petfinder API authentication token alive without CRON job.
async function keepTokenAlive(req, res, next) {
    // if the token or expiration date doesn't exist
    if (!pf_auth_token || !pf_token_expiration) {
        // renew the token
        await renewToken();
        //  continue after renewing
        return next();

        // if the token and expiration time exists
    } else {
        // getting the current time in UTC
        const currTimeInUTC = (new Date()).toUTCString();

        // checking if current time in UTC is higher than the token expiration time in UTC
        // if true, this would mean that the token is expired
        if (currTimeInUTC > pf_token_expiration.toUTCString()) {
            // renew the token
            await renewToken();
            //  continue after renewing
            return next();
        }
        // if false, this would mean that the token is still valid
        console.log("PetFinder API OAuth Token is still valid. Reusing...")
        //  continue after checking
        return next();
    }
}
// ------------------------- PETFINDER API STUFF - END -------------------------



// ------------------------- PETFINDER MODELS - START -------------------------
async function getAllPets(type = "cat", zip = 15219, page = 1, limit = 20) {
    const res = await axios.get(`${BASE_URL}/animals`, {
        headers:
        {
            Authorization: `Bearer ${pf_auth_token}`
        },
        params: {
            type: type,
            location: zip,
            limit: limit,
            page: page
        }
    })

    return res;
}

async function getSinglePet(id) {
    // EK - make sure that id is an int. Maybe convert to int during route stage
    const res = await axios.get(`${BASE_URL}/animals/${id}`, {
        headers:
        {
            Authorization: `Bearer ${pf_auth_token}`
        }
    })

    return res;
}

async function getSingleOrg(id) {
    // The ID here is alphanumeric. Example: NJ333
    const res = await axios.get(`${BASE_URL}/organizations/${id}`, {
        headers:
        {
            Authorization: `Bearer ${pf_auth_token}`
        }
    })

    return res;
}
// ------------------------- PETFINDER MODELS - END -------------------------



// ------------------------- USER PROFILE ACTION MODELS - START -------------------------

// ------------------------- USER PROFILE ACTION MODELS - END -------------------------



// ------------------------- AUTH MODELS - START -------------------------

// ------------------------- AUTH MODELS - END -------------------------



// ------------------------- MIDDLEWARE - START -------------------------
// telling the app to run this method every time a request is received
// this will keep the token alive any time a request is sent to the back-end
// app.use(keepTokenAlive);

// telling express to return the responses in JSON format so we can use it in React
app.use(express.json());
// ------------------------- MIDDLEWARE - END -------------------------



// ------------------------- ROUTES - START -------------------------
// For routes below where we are passing keepTokenAlive function, it makes sure that our
// Petfinder OAth Authentication Token does not expire causing all of our API calls to fail.
app.get('/cats', keepTokenAlive, async (req, res) => {
    // call the custom method that we created and pass cat as the type since the route is for /cats
    // and pass a zip code if its send in the queries. otherwise method defaults to zip code 15219
    const cats = await getAllPets("cat", req.query.zip, req.query.page);
    // console.log("zip is: ", req.query.zip)
    res.send(cats.data);
})

app.get('/cat/:id', keepTokenAlive, async (req, res) => {
    // Converting the ID to an int
    // EK - implement a check to make sure ID is a number here
    const catId = parseInt(req.params.id);

    const cat = await getSinglePet(catId);
    res.send(cat.data);
})

app.get('/org/:id', keepTokenAlive, async (req, res) => {
    // The ID here is alphanumeric. Example: NJ333
    const org = await getSingleOrg(req.params.id);
    res.send(org.data);
})

// For routes below, we do not need to make sure that the Pethfinder token is alive
// because we are not sending any REST request to Petfinder API

// Registration
app.post('/user', async (req, res) => {
    // EK >>> Need to include validations for all the fields here or make sure I am sending an error back from Mongoose.

    // EK >>> gotta update this with bcrypt
    const hashedPassword = req.query.password;

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

    // EK >>> Probaby should add it to the storage/session here
    res.send({ "message": "Successfully created user", "user": usr });
})

// Login
app.get('/user', async (req, res) => {
    // EK >>> Need to include validations for all the fields here or make sure I am sending an error back from Mongoose.
    const receivedPassword = req.query.password;

    // EK >>> gotta update this with bcrypt
    const hashedPassword = receivedPassword;

    // EK >>> try/catch here in case user is not found
    const usr = await User.findOne({
        userName: req.query.userName
    })

    if (usr.password === hashedPassword) {
        console.log(`Login success for user: ${req.query.userName}`)
        res.send(usr);
        // EK >>> Probaby should add it to the storage/session here
        // EK >>> Or maybe just send the basic info + token back to keep for storage?
        // EK >>> Then 
    } else {
        console.log("Unauthorized! Please try again...");
        res.send({ "message": "Unauthorized! Please try again..." });
    }

})

// Update profile (must pass username)
// Need to ensure same user
app.patch('/user', async (req, res) => {
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

// Add/Remove pet id as want to adopt
// Required: userName, id of animal
app.post('/pet/adoptlist', async (req, res) => {
    // EK >>> try/catch here in case user is not found
    const usr = await User.findOne({
        userName: req.query.userName
    })

    const animalID = req.query.id;

    // getting the index of a the animal id in an array
    const existCheck = usr.wantToAdopt.indexOf(animalID);
    // if the index exists (!== -1), that means animal is already in the want to adopt list. 
    // in this case we will remove it from the list, existCheck becomes the index of the item in the array
    if (existCheck !== -1) {
        usr.wantToAdopt.splice(existCheck, 1);
        // saving the user
        usr.save();
        res.send({
            "msg": `Successfully removed animal from Want to Adopt list`,
            "status": "OK",
            "animal_id" : animalID
        });
    } else {
        // MUST USE ELSE HERE OTHERWISE MONGODB WILL THROW ERROR: ParallelSaveError: Can't save() the same doc multiple times in parallel

        // if the animal doesn't exist in the array, we will add it
        usr.wantToAdopt.push(animalID);
        // saving the user
        usr.save();
        res.send({
            "msg": `Successfully added animal to Want to Adopt list`,
            "status": "OK",
            "animal_id" : animalID
        });
    }

})

// Add/Edit private note about an animal
// Required: userName, id of animal, note
app.post('/pet/private', async (req, res) => {
    // EK >>> try/catch here in case user is not found
    const usr = await User.findOne({
        userName: req.query.userName
    })

    const animalID = req.query.id;
    const note = req.query.note;

    usr.privateNotes.set(animalID, note);

    usr.save();

    res.send({
        "msg": `Successfully added private note`,
        "status": "OK",
        "animal_id" : animalID,
        "note" : note
    });

})

// Delete private note about an animal
// Required: userName, id of animal
app.delete('/pet/private', async (req, res) => {
    // EK >>> try/catch here in case user is not found
    const usr = await User.findOne({
        userName: req.query.userName
    })

    const animalID = req.query.id;

    usr.privateNotes.delete(animalID);

    usr.save();

    res.send({
        "msg": `Successfully deleted private note`,
        "status": "OK",
        "animal_id" : animalID
    });

})

// Add/Edit a public comment about an animal
// Required: userName, id of animal, comment
app.post('/pet/public', async (req, res) => {
    // EK >>> try/catch here in case user is not found
    const usr = await User.findOne({
        userName: req.query.userName
    })

    const animalID = req.query.id;
    const comment = req.query.comment;

    usr.publicComments.set(animalID, comment);

    usr.save();

    res.send({
        "msg": `Successfully added public note`,
        "status": "OK",
        "animal_id" : animalID,
        "comment" : comment
    });

})

// Delete public comment about an animal
// Required: userName, id of animal
app.delete('/pet/public', async (req, res) => {
    // EK >>> try/catch here in case user is not found
    const usr = await User.findOne({
        userName: req.query.userName
    })

    const animalID = req.query.id;

    usr.publicComments.delete(animalID);

    usr.save();

    res.send({
        "msg": `Successfully deleted public comment`,
        "status": "OK",
        "animal_id" : animalID
    });

})

// ------------------------- ROUTES - END -------------------------

run();

async function run() {
    // const u1 = await User.create(
    //     {
    //         firstName: "Ely",
    //         lastName: "Khud",
    //         userName: "ekhud",
    //         password: "asdfasdfasdf",
    //         wantToAdopt: [1, 2, 3],
    //         privateNotes: {
    //             123987: "Pet id 1 note",
    //             234631: "Pet id 2 note",
    //             362135: "Pet id 3 note"
    //         },
    //         publicComments: {
    //             123987: "Pet id 1 comment",
    //             234631: "Pet id 2 comment",
    //             362135: "Pet id 3 comment"
    //         }
    //     }
    // )

    // const u1 = await User.findOne({ userName: "ekhud"});

    // console.log("User saved");
    // console.log(u1);

    // console.log("private notes >>>" , u1.privateNotes);

    // console.log("value for key 123987 >>>", u1.privateNotes.get("123987"));

    // console.log("value for key 123111 >>>", u1.privateNotes.get("123111"));
}

// ------------------------- EXPORTS -------------------------
module.exports = app;