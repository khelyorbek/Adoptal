// importing main express application
const express = require("express");
// importing all the petfinder models
const { getAllPets, getSinglePet } = require("../models/petfinder");
// setting up the express router
const router = express.Router();
// importing the Petfinder middleware to keep the OAuth token alive
const { keepTokenAlive } = require("../auth/petfinder_api");

// ------------------------- ROUTES - START - /cat -------------------------
// For routes below where we are passing keepTokenAlive function, it makes sure that our
// Petfinder OAth Authentication Token does not expire causing all of our API calls to fail.

// GET /cats
router.get('/', keepTokenAlive, async (req, res) => {
    try {
        // call the custom method that we created and pass cat as the type since the route is for /cats
        // and pass a zip code if its send in the queries. otherwise method defaults to zip code 15219
        const cats = await getAllPets(req.query);

        // for debugging purposes
        // console.log("zip is: ", req.query.zip)

        // respond with the data that is received
        res.send(cats.data);
    } catch (err) {
        console.log("Adoptal > Back-end > routes > cats.js > get('/') > ", err);
        res.send("Not found");
    }

})

// GET /cats/:id
router.get('/:id', keepTokenAlive, async (req, res) => {
    try {
        // Converting the ID to an int
        const catId = parseInt(req.params.id);

        // calling the custom method to get a single pet and passing the INT id into it
        const cat = await getSinglePet(catId);

        // responding with the data received
        res.send(cat.data);
    } catch (err) {
        console.log("Adoptal > Back-end > routes > cats.js > get('/') > ", err);
        res.send("Not found");
    }

})


// ------------------------- ROUTES - END -------------------------
module.exports = router;