// importing the local strategy for passport
const LocalStrategy = require('passport-local').Strategy;
// importing the MongoDB data schema
const { db_users_connection } = require('../schemas/User');
// importing the User model from the MongoDB data schema
const User = db_users_connection.models.User;
// importing the custom password validation methods
const { validatePw } = require('../models/password')

// NOTE: Useful passport methods
// req.logout() -> logs the user out
// req.isAuthenticated() -> tests if the request is authenticated

module.exports = function (passport) {
    // creating an object that will hold our key names for username and password from our User mongodb schema
    const customFields = {
        usernameField: 'username',
        passwordField: 'password'
    }

    // this is wherer we will be verifying the user and telling password to either grant access or return unauthorized 401
    const verifyCallback = (username, password, done) => {
        // looking for the user by the username that is passed ar argument
        User.findOne({ username: username })
            // returning result as user once findOne ends
            .then(async (user) => {
                // for debugging purposes
                // console.log("user >>>", user);

                // if there is no user found, telling password > no error occured, user NOT found
                // Will be rejected with Unauth 401 status
                if (!user) { return done(null, false) }

                // check wheter the password is valid using our custom bcrpyt auth method
                const isValid = await validatePw(username, password);

                // if the password is valid
                if (isValid) {
                    // telling passport > no error occured, user is found
                    // then passing the user object as the user argument
                    return done(null, user);
                    // if the password is incorrect
                } else {
                    // telling passport > no error occured, user NOT found
                    // Will be rejected with Unauth 401 status
                    return done(null, false);
                }
            })
            // catching any errors, calling the done function
            .catch((err) => {
                // passing the error to the next middleware
                done(err);
            });
    }

    // creating a new Local Passport strategy with the callback that we just created and the custom fields defined at the top
    const strategy = new LocalStrategy(customFields, verifyCallback);

    // telling passport to use this strategy
    passport.use(strategy);

    // method for putting user id into the session for storage as string
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // method for getting id from session storage and converts it into the User (object)
    passport.deserializeUser((userId, done) => {
        // sending MongoDB query to find the user id and getting session information
        User.findById(userId)
            // if successful
            .then((user) => {
                // don't display an error & pass the user to the next middleware
                done(null, user);
            })
            // otherwise, catch the error and pass it to the next middleware
            .catch(err => done(err))
    });
}