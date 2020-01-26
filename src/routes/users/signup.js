const express = require('express');
const router = express.Router();

const csrfProtection = require('../../middleware/csurf');

const User = require('../../models/User');

const ValidateRegex = require('../../helpers/validation');
const tokenizeResponse = require('../../helpers/tokenizeResponse');

router.get("/signup", csrfProtection, function (req, res, next) {
    res.render("users/signup", {user: req.user, errors: [], username: "", email: "", csrfToken: req.csrfToken()});
});


router.post("/signup", csrfProtection, async function (req, res, next) {
    const errors = [];

    if (!req.body.username || !ValidateRegex.Username.test(req.body.username)) {
        errors.push("Empty or Invalid Username.");
    }

    if (!req.body.email || !ValidateRegex.Email.test(req.body.email)) {
        errors.push("Empty or Invalid Email.");
    } else {
        if (await User.emailExists(req.body.email)) {
            const user = User.FromEmail(req.body.email);
            if (!await user.getEmailConfirmed()) {
                user.resendInitialConfirmEmailIfNecessary();
                errors.push("Email exists but has not been confirmed. Check your inbox and junk mail.");
            } else {
                errors.push("Email exists. Try logging in.");
            }

        }
    }

    if (!req.body.password || !ValidateRegex.Password.every(reg => reg.test(req.body.password))) {
        errors.push("Empty or Invalid Password.");
    }

    if (errors.length !== 0) {
        res.render("users/signup", {
            user: req.user,
            errors: errors,
            username: req.body.username,
            email: req.body.email,
            csrfToken: req.csrfToken()
        });
        return;
    }

    const user = await User.signUp(req.body.username, req.body.email, req.body.password);
    user.sendConfirmEmail(req.body.email)
        .then(_ => {
            res.render('users/confirm-sent', {error: null, user: req.user});
        })
        .catch(err => {
            res.render('users/confirm-sent', {error: err, user: req.user});
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
