// importing main express application
const express = require("express");
// importing all the petfinder models
const { getAllPets, getSinglePet } = require("../models/api");
// setting up the express router
const router = express.Router();

// ------------------------- ROUTES - START - /pet -------------------------

// GET /pet
router.get('/', async (req, res) => {
    try {
        // call the custom method that we created
        const pets = await getAllPets(req);

        // catch any errors that might occur while retrieving data
        if (!pets || !pets.data) {
            return res.status(502).json({ error: "Unable to retrieve data from RescueGroups" });
        }

        // respond with the data that is received
        return res.json(pets.data);
    } catch (err) {
        console.error("Adoptal > Back-end > routes > pets.js > get('/') > ", err);
        return res.status(err.response?.status || 500).json({
            error: err.response?.data?.errors || err.message || "Error fetching pets"
        });
    }

})

// GET /pet/:id
router.get('/:id', async (req, res) => {
    try {
        // Converting the ID to an int
        const petId = parseInt(req.params.id);

        // calling the custom method to get a single pet and passing the INT id into it
        const pet = await getSinglePet(petId);

        if (pet.data.meta.count === 0) {
            // If the pet is not found, send 404
            res.status(404).send(`Pet with id ${petId} was not found `);
        } else {
            // responding with the data received
            res.send(pet.data);
        }


    } catch (err) {
        console.log("Adoptal > Back-end > routes > pets.js > get('/') > ", err);
        res.send("Not found");
    }

})


// ------------------------- ROUTES - END -------------------------
module.exports = router;