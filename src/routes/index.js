const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
    res.render('index', {user: req.user});
});

router.use('/users', require('./users'));


module.exports = router;
