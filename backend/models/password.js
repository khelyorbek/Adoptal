// requiring bcrypt library
const bcrypt = require('bcrypt');
// Gives us access to variables set in the .env file via `process.env.VARIABLE_NAME` syntax
require('dotenv').config();
// Importing the schema for the MongoDB user that we have created
const { User } = require('../schemas/User')
// getting the factor from .env and converting to Int
BCRYPT_WORK_FACTOR = parseInt(process.env.BCRYPT_WORK_FACTOR)

// TO DO 
async function validatePw(username, password) {
    // looking for the user by the username that is passed ar argument
    const usr = await User.findOne({ userName: username });

    // console.log(username, password);
    // console.log(usr);

    // compare hashed password to a new hash from password
    const isValid = await bcrypt.compare(password, usr.password);
    
    return isValid;
}

async function generatePw(password) {
    // console.log('process.env.BCRYPT_WORK_FACTOR >>>', BCRYPT_WORK_FACTOR);
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    return hashedPassword;
}

function isAuth(req, res, next) {
    if(req.isAuthenticated()) {
        // allowed to proceed
        next();
    } else {
        res.status(401).json({ msg: "Unauthorized! Please go to /login and login first..." });
    }
}

module.exports = { validatePw, generatePw, isAuth }