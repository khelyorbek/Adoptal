// importing the axios library for sending POST requests
const axios = require("axios");
// Gives us access to variables set in the .env file via `process.env.VARIABLE_NAME` syntax
require('dotenv').config();

const API_KEY = process.env.RESCUE_GROUPS_API_KEY

let includeData = 'breeds,colors,patterns,species,statuses,fosters,locations,orgs,pictures,videos,videourls'

// ------------------------- RESCUEGORUPS MODELS - START -------------------------
// Query params to API and what they mean
// Attribute	Description
// count	
// The total number of entities that matched query. This value can be used to control the paging of entities in your client application.

// countReturned	
// The number of entities included in the response.

// pageReturned	
// The page number of the results that were provided in the response.

// limit	
// The results limit that was used for your request.

// pages	
// The total number of pages using the current limit.

// transactionId	
// The identifier for your request. Provide this information if you request help from RescueGroups.org for this specific request.

// custom method for getting all the pets from RescueGroups API
async function getAllPets(filters) {
    console.log("BACKEND > getAllPets > Request Filters", filters.query);
    try {
        let apiBody = {
            "data": {
                "filters": [
                    // Animal type 
                    // Options (Ex: Bird, Cat, Dog, Mouse, Rabbit)
                    {
                        "fieldName": "species.singular",
                        "operation": "equals",
                        "criteria": filters?.query?.type || "cat"
                    },
                    // Age
                    // Options: "Baby", "Young", "Adult", "Senior"
                    ...(filters?.query?.age ? [{
                        "fieldName": "animals.ageGroup",
                        "operation": "equals",
                        "criteria": filters?.query?.age
                    }] : []),
                    // Size
                    // Options: "Small", "Medium", "Large", "X-Large"
                    ...(filters?.query?.size ? [{
                        "fieldName": "animals.sizeGroup",
                        "operation": "equals",
                        "criteria": filters?.query?.size
                    }] : []),
                    // Coat Length
                    // Options: "Short", "Medium", "Long", "Wire", "Hairless", "Curly"
                    ...(filters?.query?.coat ? [{
                        "fieldName": "animals.coatLength",
                        "operation": "equals",
                        "criteria": filters?.query?.coat
                    }] : []),
                    // Good with Children
                    // Options: boolean
                    ...(filters?.query?.good_with_children ? [{
                        "fieldName": "animals.isKidsOk",
                        "operation": "equals",
                        "criteria": filters?.query?.good_with_children
                    }] : []),
                    // Good with Dogs
                    // Options: boolean
                    ...(filters?.query?.good_with_dogs ? [{
                        "fieldName": "animals.isDogsOk",
                        "operation": "equals",
                        "criteria": filters?.query?.good_with_dogs
                    }] : []),
                    // Good with Cats
                    // Options: boolean
                    ...(filters?.query?.good_with_cats ? [{
                        "fieldName": "animals.isCatsOk",
                        "operation": "equals",
                        "criteria": filters?.query?.good_with_cats
                    }] : []),
                    // Housetrained
                    // Options: boolean
                    ...(filters?.query?.house_trained ? [{
                        "fieldName": "animals.isHousetrained",
                        "operation": "equals",
                        "criteria": filters?.query?.house_trained
                    }] : []),
                    // Declawed
                    // Options: boolean
                    ...(filters?.query?.declawed ? [{
                        "fieldName": "animals.isDeclawed",
                        "operation": "equals",
                        "criteria": filters?.query?.declawed
                    }] : []),
                    // Special Needs
                    // Options: boolean
                    ...(filters?.query?.special_needs ? [{
                        "fieldName": "animals.isSpecialNeeds",
                        "operation": "equals",
                        "criteria": filters?.query?.special_needs
                    }] : []),
                    // Sex
                    // Options: "Female", "Male"
                    ...(filters?.query?.gender ? [{
                        "fieldName": "animals.sex",
                        "operation": "equals",
                        "criteria": filters?.query?.gender
                    }] : []),
                    // Spayed / Neutered 
                    // Options: boolean
                    ...(filters?.query?.spayed_neutered ? [{
                        "fieldName": "animals.isAltered",
                        "operation": "equals",
                        "criteria": filters?.query?.spayed_neutered
                    }] : []),
                    // Current on Vaccinations 
                    // Options: boolean
                    ...(filters?.query?.current_vaccinations ? [{
                        "fieldName": "animals.isCurrentVaccinations",
                        "operation": "equals",
                        "criteria": filters?.query?.current_vaccinations
                    }] : [])

                ].filter(Boolean),
                "filterRadius": {
                    "postalcode": filters?.query?.zip || "15219",
                    "miles": filters?.query?.distance ? String(filters.query.distance) : "20"
                }
            }

        }

        // sending an axios POST request to RescueGroups API with headers and payload
        const res = await axios({
            method: 'post',
            url: "https://api.rescuegroups.org/v5/public/animals/search/available",
            headers: {
                'Authorization': API_KEY,
                'Content-Type': 'application/vnd.api+json'
            },
            params: {
                include: includeData,
                limit: filters?.query?.limit || "25",
                page: filters?.query?.page || "1"

            },
            data: apiBody
        });

        // for debugging purposes
        console.log("BACKEND >>> getAllPets >>> Response Status: ", res.status);


        // returning the response received from the RescueGroups API
        return res;

    } catch (err) {
        console.error("Adoptal > Back-end > models > api.js > getAllPets() > ", err.response?.data || err.message);
        throw err;
    }
}

// custom method for getting a single pet from RescueGroups API
async function getSinglePet(id) {
    try {
        // sending an axios POST request to RescueGroups API with headers and payload
        const res = await axios({
            method: 'get',
            url: `https://api.rescuegroups.org/v5/public/animals/${id}`,
            headers: {
                'Authorization': API_KEY,
                'Content-Type': 'application/vnd.api+json'
            },
            params: {
                include: includeData
            },
        });

        // for debugging purposes
        console.log("BACKEND >>> getSinglePet >>> Response Status: ", res.status);

        // returning the response received from the RescueGroups API
        return res;
    } catch (err) {
        console.log("Adoptal > Back-end > models > api.js > getSinglePet() > ", err);
        return err;
    }
}

// custom method for getting a single Org from Petfinder API
async function getSingleOrg(id) {
    try {
        // sending an axios POST request to RescueGroups API with headers and payload
        const res = await axios({
            method: 'get',
            url: `https://api.rescuegroups.org/v5/public/orgs/${id}`,
            headers: {
                'Authorization': API_KEY,
                'Content-Type': 'application/vnd.api+json'
            }
        });

        // for debugging purposes
        console.log("BACKEND >>> getSingleOrg >>> Response Status: ", res.status);

        // returning the response received from the RescueGroups API
        return res;
    } catch (err) {
        console.log("Adoptal > Back-end > models > api.js > getSingleOrg() > ", err);
    }

}
// ------------------------- PETFINDER MODELS - END -------------------------
module.exports = { getAllPets, getSinglePet, getSingleOrg }