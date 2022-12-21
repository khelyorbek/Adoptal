// EK: >>> THIS WILL NEED TO BE SPLIT UP INTO DIFFERENT ROUTE FILES LATER <<<

// main express application
const express = require("express");
// getting the petfinder models
const { getAllPets, getSinglePet, getSingleOrg } = require("../models/petfinder");
// setting up the express router
const router = express.Router();
// importing the Petfinder middleware to keep the OAuth token alive
const { keepTokenAlive } = require("../auth/petfinder_api");

// ------------------------- ROUTES - START - /cat -------------------------
// For routes below where we are passing keepTokenAlive function, it makes sure that our
// Petfinder OAth Authentication Token does not expire causing all of our API calls to fail.
router.get('/', keepTokenAlive, async (req, res) => {
    // call the custom method that we created and pass cat as the type since the route is for /cats
    // and pass a zip code if its send in the queries. otherwise method defaults to zip code 15219
    const cats = await getAllPets("cat", req.query.zip, req.query.page);
    // console.log("zip is: ", req.query.zip)
    res.send(cats.data);
})

router.get('/:id', keepTokenAlive, async (req, res) => {
    // Converting the ID to an int
    // EK - implement a check to make sure ID is a number here
    const catId = parseInt(req.params.id);

    const cat = await getSinglePet(catId);
    res.send(cat.data);
})


// ------------------------- ROUTES - END -------------------------
module.exports = router;