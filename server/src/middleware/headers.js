const express = require('express');
const router = express.Router();


router.use('*', function (req, res, next) {
    res.set('Referrer-Policy', 'same-origin');
    next();
});

module.exports = router;
