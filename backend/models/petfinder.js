// importing the axios library for sending POST requests
const axios = require("axios");
// importing the base URL
const BASE_URL = "https://api.petfinder.com/v2"

// ------------------------- PETFINDER MODELS - START -------------------------
// custom method for getting all the cats from Petfinder API
async function getAllPets(filters) {
    try {
        // storing parameters into a variable and settings default values if none provided
        // type = "cat", zip = 15219, page = 1, limit = 20
        let p = {
            type: 'cat',
            page: '1',
            location: '15219',
            distance: '20'
        }

        // if the filters have been passed to the backend
        if (filters.p) {
            // set the parameters to additional information received from the filter or set to default
            p = {
                type: 'cat',
                location: filters.p.zip ? filters.p.zip : '15219',
                page: filters.p.page ? filters.p.page : '1',
                distance: filters.p.distance ? filters.p.distance : '20',
                age: filters.p.age,
                size: filters.p.size,
                coat: filters.p.coat,
                good_with_children: filters.p.good_with_children,
                good_with_dogs: filters.p.good_with_dogs,
                good_with_cats: filters.p.good_with_cats,
                house_trained: filters.p.house_trained,
                declawed: filters.p.declawed,
                special_needs: filters.p.special_needs
            }
        }

        // sending an axios request to the Petfinder API and passing the OAuth Token
        // also passing the parameters for the filter
        const res = await axios.get(`${BASE_URL}/animals`, {
            headers:
            {
                Authorization: `Bearer ${pf_auth_token}`
            },
            params: p
        })

        // for debugging purposes
        // console.log("BACKEND >>> getAllPets >>> APIParams: ", p)
        // console.log("BACKEND >>> getAllPets >>> ReactFilters: ", filters)

        // returning the response received from the Petfinder API
        return res;
    } catch (err) {
        console.log("Adoptal > Back-end > models > petfinder.js > getAllPets() > ", err);
    }
}

// custom method for getting a single the cats from Petfinder API
async function getSinglePet(id) {
    try {
        // sending a get request to Petfinder API with the OAuth token in the header
        const res = await axios.get(`${BASE_URL}/animals/${id}`, {
            headers:
            {
                Authorization: `Bearer ${pf_auth_token}`
            }
        })
        // returning the response received
        return res;
    } catch (err) {
        console.log("Adoptal > Back-end > models > petfinder.js > getSinglePet() > ", err);
    }
}

// custom method for getting a single Org from Petfinder API
async function getSingleOrg(id) {
    try {
        // The ID here is alphanumeric. Example: NJ333
        // sending a get request to Petfinder API with the OAuth token in the header
        const res = await axios.get(`${BASE_URL}/organizations/${id}`, {
            headers:
            {
                Authorization: `Bearer ${pf_auth_token}`
            }
        })
        // returning the response received
        return res;
    } catch (err) {
        console.log("Adoptal > Back-end > models > petfinder.js > getSingleOrg() > ", err);
    }

}
// ------------------------- PETFINDER MODELS - END -------------------------
module.exports = { getAllPets, getSinglePet, getSingleOrg }