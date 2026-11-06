// importing main express application
const express = require("express");
// importing all the petfinder models
const { getAllPets, getSinglePet } = require("../models/api");
// setting up the express router
const router = express.Router();

// ------------------------- ROUTES - START - /cat -------------------------
// For routes below where we are passing keepTokenAlive function, it makes sure that our
// Petfinder OAth Authentication Token does not expire causing all of our API calls to fail.

// GET /cats
router.get('/', async (req, res) => {
    try {
        // call the custom method that we created and pass cat as the type since the route is for /cats
        // and pass a zip code if its send in the queries. otherwise method defaults to zip code 15219
        const cats = await getAllPets(req);

        if (!cats || !cats.data) {
            return res.status(502).json({ error: "Unable to retrieve data from RescueGroups" });
        }

        // respond with the data that is received
        return res.json(cats.data);
    } catch (err) {
        console.error("Adoptal > Back-end > routes > cats.js > get('/') > ", err);
        return res.status(err.response?.status || 500).json({
            error: err.response?.data?.errors || err.message || "Error fetching cats"
        });
    }

})

// GET /cats/:id
router.get('/:id', async (req, res) => {
    try {
        // Converting the ID to an int
        const catId = parseInt(req.params.id);

        // calling the custom method to get a single pet and passing the INT id into it
        const cat = await getSinglePet(catId);

        if (cat.data.meta.count === 0) {
            // If the cat is not found, send 404
            res.status(404).send(`Pet with id ${catId} was not found `);
        } else {
            // responding with the data received
            res.send(cat.data);
        }


    } catch (err) {
        console.log("Adoptal > Back-end > routes > cats.js > get('/') > ", err);
        res.send("Not found");
    }

})


// ------------------------- ROUTES - END -------------------------
module.exports = router;