// main express application
const express = require("express");
// getting the petfinder models
const { getSingleOrg } = require("../models/petfinder");
// setting up the express router
const router = express.Router();
// importing the Petfinder middleware to keep the OAuth token alive
const { keepTokenAlive } = require("../auth/petfinder_api");

// ------------------------- ROUTES - START - /org -------------------------
router.get('/:id', keepTokenAlive, async (req, res) => {
    try {
    // The ID here is alphanumeric. Example: NJ333
    // using a custom method and awaiting it
    const org = await getSingleOrg(req.params.id);
    // responding with the data received
    res.send(org.data);
    } catch(err) {
        console.log("Adoptal > Back-end > routes > orgs.js > get('/:id') > ", err);
    }
    
})
// ------------------------- ROUTES - END -------------------------

module.exports = router;