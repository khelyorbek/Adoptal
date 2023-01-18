// requiring bcrypt library
const bcrypt = require('bcrypt');
// Gives us access to variables set in the .env file via `process.env.VARIABLE_NAME` syntax
require('dotenv').config();
// Importing the schema for the MongoDB user that we have created
const { User } = require('../schemas/User')
// getting the factor from .env and converting to Int
BCRYPT_WORK_FACTOR = parseInt(process.env.BCRYPT_WORK_FACTOR)

async function validatePw(username, password) {
    try {
        // looking for the user by the username that is passed ar argument
        const usr = await User.findOne({ username: username });

        // console.log(username, password);
        // console.log(usr);

        // compare hashed password to a new hash from password
        const isValid = await bcrypt.compare(password, usr.password);

        return isValid;
    } catch (err) {
        console.log("Adoptal > Back-end > password.js > validatePw() > ", err);
    }
}

async function generatePw(password) {
    try {
        // console.log('process.env.BCRYPT_WORK_FACTOR >>>', BCRYPT_WORK_FACTOR);

        // creating a hashed password using bcrypt and the WORK FACTOR
        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

        // returning the hashed passpord
        return hashedPassword;
    } catch (err) {
        console.log("Adoptal > Back-end > password.js > generatePw() > ", err);
    }

}

function isAuth(req, res, next) {
    try {
        // if the user is authenticated
        if (req.isAuthenticated()) {
            // allowed to proceed
            next();
        } else {
            // if not authenticated
            res.status(401).json({ msg: "Unauthorized! Please go to /login and login first..." });
        }
    } catch (err) {
        console.log("Adoptal > Back-end > password.js > isAuth() > ", err);
    }

}

module.exports = { validatePw, generatePw, isAuth }