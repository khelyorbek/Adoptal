// used for sending requests
const axios = require("axios");
const BASE_URL = "https://api.petfinder.com/v2"

// ------------------------- PETFINDER MODELS - START -------------------------
async function getAllPets(type = "cat", zip = 15219, page = 1, limit = 20) {
    const res = await axios.get(`${BASE_URL}/animals`, {
        headers:
        {
            Authorization: `Bearer ${pf_auth_token}`
        },
        params: {
            type: type,
            location: zip,
            limit: limit,
            page: page
        }
    })

    return res;
}

async function getSinglePet(id) {
    // EK - make sure that id is an int. Maybe convert to int during route stage
    const res = await axios.get(`${BASE_URL}/animals/${id}`, {
        headers:
        {
            Authorization: `Bearer ${pf_auth_token}`
        }
    })

    return res;
}

async function getSingleOrg(id) {
    // The ID here is alphanumeric. Example: NJ333
    const res = await axios.get(`${BASE_URL}/organizations/${id}`, {
        headers:
        {
            Authorization: `Bearer ${pf_auth_token}`
        }
    })

    return res;
}
// ------------------------- PETFINDER MODELS - END -------------------------
module.exports = { getAllPets, getSinglePet, getSingleOrg }