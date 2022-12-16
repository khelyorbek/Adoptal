// _________________________ OPTIMIZATION TASK _________________________
// For storing mongoose schemas for Express to MongoDB connection

const mongoose = require('mongoose');

// const privateNotesSchema = new mongoose.Schema({
//     petId: Number,
//     petNote: String
// })

// const publicCommentsSchema = new mongoose.Schema({
//     petId: Number,
//     petComment: String
// })

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

module.exports = mongoose.model("User", userSchema)