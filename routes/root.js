const express = require('express');

const router = express.Router({strict: true});

router.get('/', (req, res) => {
    res.status(200).json({
        application: 'SaleMeeter',
        author: 'Eli Chen',
        version: '0.1'
    });
});

module.exports = router;
