// main express application
const express = require("express");
// setting up the express router
const router = express.Router();
// Importing the schema for the MongoDB user that we have created
const { User } = require('../schemas/User')

// For routes below, we do not need to make sure that the Pethfinder token is alive
// because we are not sending any REST request to Petfinder API

// ------------------------- ROUTES - START - /pet -------------------------
// Add/Remove pet id as want to adopt
// Required: username, id of animal
router.post('/adoptlist', async (req, res) => {
    try {
        // for debugging
        // console.log("REQ QUERY>>>", req.body.params);

        // creating a paylod variable to store the received params in
        const payload = req.body.params;

        // performing a mongoose query to find the user my the username provided in the payload
        const usr = await User.findOne({
            username: payload.username
        })

        // saving the animal ID in a variable
        const animalID = payload.id;

        // getting the index of the animal id in an array
        const existCheck = usr.wantToAdopt.indexOf(animalID);

        // if the index exists (!== -1), that means animal is already in the want to adopt list. 
        // in this case we will remove it from the list, existCheck becomes the index of the item in the array
        if (existCheck !== -1) {
            // splicing the array by the index of an animal by 1
            usr.wantToAdopt.splice(existCheck, 1);

            // saving the user
            usr.save();

            // responding with the successful message
            res.send({
                "msg": `Successfully removed animal from Want to Adopt list`,
                "status": "OK",
                "animal_id": animalID
            });
        } else {
            // MUST USE ELSE HERE OTHERWISE MONGODB WILL THROW ERROR: ParallelSaveError: Can't save() the same doc multiple times in parallel

            // if the animal doesn't exist in the array, we will add it
            usr.wantToAdopt.push(animalID);

            // saving the user
            usr.save();

            // responding with the successful message
            res.send({
                "msg": `Successfully added animal to Want to Adopt list`,
                "status": "OK",
                "animal_id": animalID
            });
        }
    } catch (err) {
        console.log("Adoptal > Back-end > routes > pets.js > post('/adoptlist') > ", err);
    }


})

// Add/Edit private note about an animal
// Required: username, id of animal, note
router.post('/private', async (req, res) => {
    try {
        // creating a paylod variable to store the received params in
        const payload = req.body.params;

        // for debugging
        // console.log("QQQQQQQQQQQQQQQ>>>>>>>>", req.query)
        // console.log("BBBBBBBBBBBBBBB>>>>>>>>", req.body)

        // performing a mongoose query to find the user my the username provided in the payload
        const usr = await User.findOne({
            username: payload.username
        })

        // saving the animal ID in a variable
        const animalID = JSON.stringify(payload.id);
        // saving the private note in a variable
        const note = payload.note;

        // setting the key of animal id to the value of private note 
        // example -> 123456: "Some test note"
        usr.privateNotes.set(animalID, note);

        // saving the user
        usr.save();

        // responding with the successful message
        res.send({
            "msg": `Successfully added private note`,
            "status": "OK",
            "animal_id": animalID,
            "note": note
        });
    } catch (err) {
        console.log("Adoptal > Back-end > routes > pets.js > post('/private') > ", err);
    }
})

// Delete private note about an animal
// Required: username, id of animal
router.delete('/private', async (req, res) => {
    try {
        // for debugging 
        // console.log("QQQQQQQQQQQQQQQ>>>>>>>>", req.query)
        // console.log("BBBBBBBBBBBBBBB>>>>>>>>", req.body)

        // creating a paylod variable to store the received params in
        const payload = req.query;

        // performing a mongoose query to find the user my the username provided in the payload
        const usr = await User.findOne({
            username: payload.username
        })

        // saving the animal ID in a variable
        const animalID = payload.id;

        // deleteing the key of the animal id from the private Note object in MongoDB
        usr.privateNotes.delete(animalID);

        // saving the user
        usr.save();

        // responding with the successful message
        res.send({
            "msg": `Successfully deleted private note`,
            "status": "OK",
            "animal_id": animalID
        });
    } catch (err) {
        console.log("Adoptal > Back-end > routes > pets.js > delete('/private') > ", err);
    }
})

// Add/Edit a public comment about an animal
// Required: username, id of animal, comment
router.post('/public', async (req, res) => {
    try {
        // creating a paylod variable to store the received params in
        const payload = req.body.params;

        // performing a mongoose query to find the user my the username provided in the payload
        const usr = await User.findOne({
            username: payload.username
        })

        // saving the animal ID in a variable
        const animalID = JSON.stringify(payload.id);
        // saving the public comment in a variable
        const comment = payload.comment;

        // setting the key of animal id to the value of public comment 
        // example -> 123456: "Some test comment"
        usr.publicComments.set(animalID, comment);

        // saving the user
        usr.save();

        // responding with the successful message
        res.send({
            "msg": `Successfully added public note`,
            "status": "OK",
            "animal_id": animalID,
            "comment": comment
        });
    } catch (err) {
        console.log("Adoptal > Back-end > routes > pets.js > post('/public') > ", err);
    }

})

// Delete public comment about an animal
// Required: username, id of animal
router.delete('/public', async (req, res) => {
    try {
        // creating a paylod variable to store the received params in
        const payload = req.query;

        // performing a mongoose query to find the user my the username provided in the payload
        const usr = await User.findOne({
            username: payload.username
        })

        // saving the animal ID in a variable
        const animalID = payload.id;

        // deleteing the key of the animal id from the private Note object in MongoDB
        usr.publicComments.delete(animalID);

        // saving the user
        usr.save();

        // responding with the successful message
        res.send({
            "msg": `Successfully deleted public comment`,
            "status": "OK",
            "animal_id": animalID
        });
    } catch (err) {
        console.log("Adoptal > Back-end > routes > pets.js > delete('/public') > ", err);
    }
})

// Getting all the comments for a specific animal
// Required: id of animal
router.get('/comments/:id', async (req, res) => {
    try {
        // getting the cat id from the params
        const catId = req.params.id;

        // searching ANY user that has public comments
        const users = await User.find({
            publicComments: {
                "$exists": true
            }
        })

        // for debugging
        // console.log("USER 1 >>>", users[0].publicComments.has('59305736'));
        // console.log("KEYS >>>", Object.keys(users[0].publicComments));

        // filtering the user who do NOT have the pet in their public comment keys
        // this leaves only the users who have this animal in their public comments Object in MongoDB
        const commentUsers = users.filter(user => user.publicComments.has(catId))

        // responding with the list of users who have the comments for this specific animal
        res.send(commentUsers);
    } catch (err) {
        console.log("Adoptal > Back-end > routes > pets.js > get('/comments/:id') > ", err);
    }
    
})

// ------------------------- ROUTES - END -------------------------

module.exports = router;