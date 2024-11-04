// ------------------------- PETFINDER API - START -------------------------
// used for sending requests to Petfinder API
const axios = require("axios");
// used for sending Form URL Encoded type request to get an auth token from Petfinder API
const querystring = require('querystring');
// Gives us access to variables set in the .env file via `process.env.VARIABLE_NAME` syntax
require('dotenv').config();
// getting the token and the expiration date from RAM stored within our app
const app = require("../app");

async function renewToken() {
    try {
        /* IF YOU ONLY HAVE 1 TOKEN USE THIS
        let token = await axios.post('https://api.petfinder.com/v2/oauth2/token', querystring.stringify({
            grant_type: 'client_credentials', // must be set to this per API docs
            client_id: process.env.PETFINDER_CLIENT_ID,  // from secrets file
            client_secret: process.env.PETFINDER_CLIENT_SECRET, // from secrets file
        */

        // IF YOU HAVE MULTIPLE TOKENS, USE THIS 
        // initializing the API token as empty string
        let token = '';

        // looping through the available API keys
        for (let i = 0; i <= 7; i++) {
            // sending a post request to Oath endpoint of the PetFinder API to get a token
            // storing the response in a variable
            token = await axios.post('https://api.petfinder.com/v2/oauth2/token', querystring.stringify({
                grant_type: 'client_credentials', // must be set to this per API docs
                client_id: `process.env.PETFINDER_CLIENT_ID_${i}`,  // from secrets file
                client_secret: `process.env.PETFINDER_CLIENT_SECRET_${i}`, // from secrets file
            }));

            if (token.data.access_token) { break; }
        }

        // storing the token into a global variable
        global.pf_auth_token = token.data.access_token;

        // for debugging purposes
        // console.log(">>> pf_auth_token >>> ", token.data.access_token);

        // getting the current date/time
        const t = new Date();
        // updating the time to 59 minutes into the future
        t.setMinutes(t.getMinutes() + 59);
        // PetFinder API token expire every 60 mins
        // so setting the variable (token's expiration time) to the current time/date + 59 minutes
        global.pf_token_expiration = t;

        // for debugging purposes only
        // console.log(">>> t >>> ", pf_token_expiration);
        console.log("PetFinder API OAuth Token Renewd. Now expires:", global.pf_token_expiration);
    } catch (err) {
        console.log("Adoptal > Back-end > auth > Petfinder_api.js > renewToken() > ", err);
    }

}

// function to keep the Petfinder API authentication token alive without CRON job.
async function keepTokenAlive(req, res, next) {
    try {
        // getting the current time
        const currTime = new Date();
        // getting the OAuth token expiration time
        const expTime = global.pf_token_expiration

        console.log(`*****  Petfinder OAuth Token  *****
        Current time: ${currTime},
        Token expiration time: ${expTime},
        Token expired? ${currTime > expTime ? "Yes" : "No"}
        **********`)

        // if the token or expiration date doesn't exist
        if (!global.pf_auth_token || !global.pf_token_expiration) {
            // renew the token
            await renewToken();
            //  continue after renewing
            return next();

            // if the token and expiration time exists
        } else {
            // checking if current time is higher than the token expiration time
            // if true, this would mean that the token is expired
            if (currTime > expTime) {
                // renew the token
                await renewToken();
                //  continue after renewing
                return next();
            } else {
                // if false, this would mean that the token is still valid
                console.log("PetFinder API OAuth Token is still valid. Reusing... Expires: ", expTime)
                //  continue after checking
                return next();
            }
        }
    } catch (err) {
        console.log("Adoptal > Back-end > auth > Petfinder_api.js > keepTokenAlive() > ", err);
    }
}
// ------------------------- PETFINDER API - END -------------------------
module.exports = { keepTokenAlive }