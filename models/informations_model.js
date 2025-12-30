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
        validate: {
            validator: function(v) {
                // Remove spaces, dashes, and other characters
                const cleaned = v.replace(/[\s\-\(\)]/g, '');
                // Pakistani phone number patterns
                const patterns = [
                    /^03[0-9]{9}$/,           // 03XXXXXXXXX (11 digits)
                    /^\+923[0-9]{9}$/,        // +923XXXXXXXXX (13 characters)
                    /^923[0-9]{9}$/           // 923XXXXXXXXX (12 digits)
                ];
                return patterns.some(pattern => pattern.test(cleaned));
            },
            message: 'Please enter a valid Pakistani phone number (e.g., 03001234567)'
        }
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

