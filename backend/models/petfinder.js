// used for sending requests
const axios = require("axios");
const BASE_URL = "https://api.petfinder.com/v2"

// ------------------------- PETFINDER MODELS - START -------------------------
async function getAllPets(filters) {
    let p = {
        type: 'cat',
        page: '1',
        location: '15219',
        distance: '20'
    }

    if(filters.p) {
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
    
    // type = "cat", zip = 15219, page = 1, limit = 20
    const res = await axios.get(`${BASE_URL}/animals`, {
        headers:
        {
            Authorization: `Bearer ${pf_auth_token}`
        },
        params: p
    })

    console.log("BACKEND >>> getAllPets >>> APIParams: ", p)
    console.log("BACKEND >>> getAllPets >>> ReactFilters: ", filters)

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