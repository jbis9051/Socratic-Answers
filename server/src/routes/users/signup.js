const express = require('express');
const router = express.Router();

const csrfProtection = require('../../middleware/csurf');

const User = require('../../models/User');

const tokenizeResponse = require('../../helpers/tokenizeResponse');
const {SignUpForm} = require('../../validation');
const redirUsers = require('../../middleware/redirUsers');

router.get("/signup", redirUsers, csrfProtection, function (req, res, next) {
    res.render("users/auth/signup", { errors: [], username: "", email: "", csrfToken: req.csrfToken()});
});


router.post("/signup", redirUsers,  SignUpForm,  csrfProtection, async function (req, res, next) {
    let errors = [];

    if (req.validationErrors[0].length > 0) {
        errors = req.validationErrors[0].map(error => error.msg);
    } else {
        if (await User.emailExists(req.body.email)) {
            const user = await User.FromEmail(req.body.email);
            if (!await user.getEmailConfirmed()) {
                user.resendInitialConfirmEmailIfNecessary();
                errors.push("Email exists but has not been confirmed. Check your inbox and junk mail.");
            } else {
                errors.push("Email exists. Try logging in.");
            }

        }
    }


    if (errors.length !== 0) {
        res.render("users/auth/signup", {

            errors: errors,
            username: req.body.username,
            email: req.body.email,
            csrfToken: req.csrfToken()
        });
        return;
    }

    const user = await User.signUp(req.body.username, req.body.email, req.body.password, !!req.body['accept-spam']);
    user.sendConfirmEmail(req.body.email)
        .then(_ => {
            res.render('users/auth/confirm-sent', {error: null});
        })
        .catch(err => {
            res.render('users/auth/confirm-sent', {error: err});
        });
});

router.get("/confirm", async function (req, res, next) {
    if(!req.query.token){
        next();
        return;
    }
    const user = await User.confirmEmail(req.query.token);
    if(!user){
        next();
        return;
    }
    await tokenizeResponse(user, res);
    res.redirect("/");
});

module.exports = router;
