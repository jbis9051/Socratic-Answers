// router for no subdomain

const express = require('express');
const router = express.Router();

router.get("/", function (req, res, next) {
    res.render('home/index');
});


module.exports = router;
