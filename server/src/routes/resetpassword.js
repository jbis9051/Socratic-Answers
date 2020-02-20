const express = require('express');
const router = express.Router();

const redirUsers = require('../middleware/redirUsers');
const csrfToken = require('../middleware/csurf');
const tokenizeResponse = require('../helpers/tokenizeResponse');
const {ResetPasswordEmailForm, ResetPasswordTokenCheck, ResetPasswordResetForm} = require('../validation');

const User = require('../models/User');

router.get('/', redirUsers, function (req, res, next) {
    res.render('reset/index');
});

router.post('/', redirUsers, ResetPasswordEmailForm, async function (req, res, next) {
    res.render('reset/confirm');
    if(req.validationErrors[0].length > 1){
        return;
    }
    const user = await User.FromEmail(req.body.email);
    if(!user){
        return;
    }
    user.sendResetLink();
});

router.get('/reset', redirUsers, ResetPasswordTokenCheck, async function (req, res, next) {
    if(req.validationErrors[0].length > 1 || !await User.resetTokenExist(req.query.token)){
        return next();
    }
    res.render('reset/input', {token: req.query.token});
});

router.post('/reset', redirUsers, ResetPasswordResetForm, async function (req, res, next) {
    const user = await User.resetPassword(req.body.token, req.body.password);
    if(req.validationErrors[0].length > 1 || !user){
        return next();
    }
    await tokenizeResponse(user, res);
    res.redirect('/');
});



module.exports = router;
