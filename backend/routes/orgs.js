// main express application
const express = require("express");
// getting the petfinder models
const { getAllPets, getSinglePet, getSingleOrg } = require("../models/petfinder");
// setting up the express router
const router = express.Router();
// importing the Petfinder middleware to keep the OAuth token alive
const { keepTokenAlive } = require("../auth/petfinder_api");
// for authentication purposes
const passport = require('passport');

// ------------------------- ROUTES - START - /org -------------------------
router.get('/:id', keepTokenAlive, async (req, res) => {
    // The ID here is alphanumeric. Example: NJ333
    const org = await getSingleOrg(req.params.id);
    res.send(org.data);
})
// ------------------------- ROUTES - END -------------------------

module.exports = router;