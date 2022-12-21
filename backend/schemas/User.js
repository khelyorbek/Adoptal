// _________________________ OPTIMIZATION TASK _________________________
// For storing mongoose schemas for Express to MongoDB connection

const mongoose = require('mongoose');
// Gives us access to variables set in the .env file via `process.env.VARIABLE_NAME` syntax
require('dotenv').config();
// connecting to the mongo db for User collection
const db_users_connection = mongoose.createConnection(process.env.mongodb_connect_string, { useNewUrlParser: true, retryWrites: true, w: "majority"});

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    userName: {
        type: String,
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

const User = db_users_connection.model("User", userSchema)

module.exports = { User, db_users_connection };