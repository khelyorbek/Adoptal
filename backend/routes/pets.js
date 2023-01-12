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
    console.log("REQ QUERY>>>", req.body.params);
    const payload = req.body.params;

    // EK >>> try/catch here in case user is not found
    const usr = await User.findOne({
        username: payload.username
    })

    const animalID = payload.id;

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
            "animal_id": animalID
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
            "animal_id": animalID
        });
    }

})

// Add/Edit private note about an animal
// Required: username, id of animal, note
router.post('/private', async (req, res) => {
    const payload = req.body.params;
    // console.log("QQQQQQQQQQQQQQQ>>>>>>>>", req.query)
    // console.log("BBBBBBBBBBBBBBB>>>>>>>>", req.body)
    // EK >>> try/catch here in case user is not found
    const usr = await User.findOne({
        username: payload.username
    })

    const animalID = JSON.stringify(payload.id);
    const note = payload.note;

    usr.privateNotes.set(animalID, note);

    usr.save();

    res.send({
        "msg": `Successfully added private note`,
        "status": "OK",
        "animal_id": animalID,
        "note": note
    });

})

// Delete private note about an animal
// Required: username, id of animal
router.delete('/private', async (req, res) => {
    // console.log("QQQQQQQQQQQQQQQ>>>>>>>>", req.query)
    // console.log("BBBBBBBBBBBBBBB>>>>>>>>", req.body)
    const payload = req.query;

    // EK >>> try/catch here in case user is not found
    const usr = await User.findOne({
        username: payload.username
    })

    const animalID = payload.id;

    usr.privateNotes.delete(animalID);

    usr.save();

    res.send({
        "msg": `Successfully deleted private note`,
        "status": "OK",
        "animal_id": animalID
    });

})

// Add/Edit a public comment about an animal
// Required: username, id of animal, comment
router.post('/public', async (req, res) => {
    const payload = req.body.params;


    // EK >>> try/catch here in case user is not found
    const usr = await User.findOne({
        username: payload.username
    })

    const animalID = JSON.stringify(payload.id);
    const comment = payload.comment;

    usr.publicComments.set(animalID, comment);

    usr.save();

    res.send({
        "msg": `Successfully added public note`,
        "status": "OK",
        "animal_id": animalID,
        "comment": comment
    });

})

// Delete public comment about an animal
// Required: username, id of animal
router.delete('/public', async (req, res) => {

    const payload = req.query;

    // EK >>> try/catch here in case user is not found
    const usr = await User.findOne({
        username: payload.username
    })

    const animalID = payload.id;

    usr.publicComments.delete(animalID);

    usr.save();

    res.send({
        "msg": `Successfully deleted public comment`,
        "status": "OK",
        "animal_id": animalID
    });

})

router.get('/comments/:id', async (req, res) => {
    const catId = req.params.id;

    const users = await User.find({
        publicComments: {
            "$exists": true
        }
    })
    // console.log("USER 1 >>>", users[0].publicComments.has('59305736'));
    // console.log("KEYS >>>", Object.keys(users[0].publicComments));
    const commentUsers = users.filter(user => user.publicComments.has(catId))

    res.send(commentUsers);
})

// ------------------------- ROUTES - END -------------------------

module.exports = router;