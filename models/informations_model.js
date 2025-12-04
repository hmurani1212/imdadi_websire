const mongoose = require('mongoose');

const informationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    father: {
        type: String,
        required: true,
        trim: true
    },
    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Other']
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
        match: [/^[0-9]{10,15}$/, 'Please enter a valid phone number']
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        latitude: {
            type: Number
        },
        longitude: {
            type: Number
        }
    },
    status: {
        type: String,
        enum: ['pending', 'eligible', 'not_eligible'],
        default: 'pending'
    }
}, {
    timestamps: true
});

const Information = mongoose.model('Information', informationSchema);

module.exports = Information;

