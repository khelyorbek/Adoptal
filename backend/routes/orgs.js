// main express application
const express = require("express");
// getting the petfinder models
const { getSingleOrg } = require("../models/api");
// setting up the express router
const router = express.Router();

// ------------------------- ROUTES - START - /org -------------------------
router.get('/:id', async (req, res) => {
    try {
        // The ID here is alphanumeric. Example: 5113
        // using a custom method and awaiting it
        const org = await getSingleOrg(req.params.id);
        if (org.data.meta.count === 0) {
            // If the cat is not found, send 404
            res.status(404).send(`Org with id ${req.params.id} was not found `);
        } else {
            // responding with the data received
            res.send(org.data);
        }
    } catch (err) {
        console.log("Adoptal > Back-end > routes > orgs.js > get('/:id') > ", err);
    }

})
// ------------------------- ROUTES - END -------------------------

module.exports = router;