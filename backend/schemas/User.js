// For storing mongoose schemas for Express to MongoDB connection

// importing mongoose
const mongoose = require('mongoose');
// Gives us access to variables set in the .env file via `process.env.VARIABLE_NAME` syntax
require('dotenv').config();
// connecting to the mongo db for User collection
const db_users_connection = mongoose.createConnection(process.env.mongodb_connect_string, { useNewUrlParser: true, retryWrites: true, w: "majority"});

// creating a scheuma with each field
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        lowercase: true,
        required: true,
        unique: true // username must be unique
    },
    password: {
        type: String,
        required: true
    },
    createdAt: Date,
    updatedAt: Date,
    wantToAdopt: [Number],
    privateNotes: {
        type: Map,
        of: String
    },
    publicComments: {
        type: Map,
        of: String
    }

}, { collection: 'Users' });

// mapping the User variable to the User model and the userSchema that we just created
const User = db_users_connection.model("User", userSchema)

// exporting the variables so we can use it later
module.exports = { User, db_users_connection };