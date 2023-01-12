const LocalStrategy = require('passport-local').Strategy;
const { db_users_connection } = require('../schemas/User');
const User = db_users_connection.models.User;
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
            // catching any errors, calling the done function and passing the error to the next middleware
            .catch((err) => {
                done(err);
            });
    }

    const strategy = new LocalStrategy(customFields, verifyCallback);

    passport.use(strategy);

    // puts user id into the session for storage as string
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // gets id from session storage and converts it into the User (object)
    passport.deserializeUser((userId, done) => {
        User.findById(userId)
            .then((user) => {
                done(null, user);
            })
            .catch(err => done(err))
    });
}