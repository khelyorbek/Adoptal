// importing the axios library for sending POST requests
const axios = require("axios");
// Gives us access to variables set in the .env file via `process.env.VARIABLE_NAME` syntax
require('dotenv').config();

const API_KEY = process.env.RESCUE_GROUPS_API_KEY

let includeData = 'breeds,colors,patterns,species,statuses,fosters,locations,orgs,pictures,videos,videourls'

// ------------------------- PETFINDER MODELS - START -------------------------
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

// custom method for getting all the cats from Petfinder API
async function getAllPets(filters) {
    console.log("BACKEND > getAllPets > Request Filters", filters.query);
    try {
        let apiBody = {
            "data": {
                "filters": [
                    // Animal type
                    {
                        "fieldName": "species.singular",
                        "operation": "equals",
                        "criteria": filters?.query?.type || "cat"
                    }
                ],
                "filterRadius": {
                    "postalcode": filters?.query?.zip || "43221",
                    "miles": filters?.query?.distance ? String(filters.query.distance) : "25"
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

// custom method for getting a single the cats from Petfinder API
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