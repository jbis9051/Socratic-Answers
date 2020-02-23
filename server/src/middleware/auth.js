const express = require('express');
const User = require("../models/User");
const router = express.Router();

router.all(['/', '/*'], async function (req, res, next) {
    if (!req.cookies.token) {
        req.user = null;
        res.locals.currentUser = req.user;
        next();
        return;
    }
    req.user = await User.FromToken(req.cookies.token);
    if (!req.user || !await req.user.getEmailConfirmed()) {
        req.user = null;
    }
    res.locals.currentUser = req.user;
    next();
});

module.exports = router;
