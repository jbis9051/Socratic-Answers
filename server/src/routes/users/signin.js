const express = require('express');
const router = express.Router();

const csrfProtection = require('../../middleware/csurf');
const tokenizeResponse = require('../../helpers/tokenizeResponse');
const {SignInForm} = require('../../validation');

const User = require('../../models/User');

const redirUsers = require('../../middleware/redirUsers');


router.get('/signin', redirUsers, csrfProtection, function (req, res, next) {
    res.render('users/auth/signin', {
        errorMessage: null,
        redir: req.query.r || null,
        csrfToken: req.csrfToken()
    });
});

router.post('/signin', redirUsers, SignInForm, csrfProtection, async function (req, res, next) {
    function error(message = "Username and Password don't match") {
        res.render('users/auth/signin', {
            errorMessage: message,
            redir: req.query.r || null,
            csrfToken: req.csrfToken()
        });
    }

    if (req.validationErrors[0].length > 0) {
        error();
        return;
    }

    const user = await User.FromCredentials(req.body.email, req.body.password);
    if (!user) {
        error();
        return;
    }
    if (!await user.getEmailConfirmed()) {
        await user.resendInitialConfirmEmailIfNecessary();
        error("User not confirmed. Please check your email or junk mail.");
        return;
    }
    await tokenizeResponse(user, res);
    res.redirect(req.query.r || "/");
});

module.exports = router;
