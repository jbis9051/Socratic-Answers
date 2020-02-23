// router for no subdomain

const express = require('express');
const router = express.Router();


router.use(require('../middleware/auth'));

router.get("/", function (req, res, next) {
    res.render('home/index');
});

router.use('/users', require('./users'));
router.use('/resetpassword', require('./resetpassword'));


module.exports = router;
