const express = require('express');
const router = express.Router();

const csrfProtection = require('../../middleware/csurf');

const User = require('../../models/User');

router.use(require('./signup'));
router.use(require('./signin'));

router.get('/logout', async function (req, res, next) {
    if(!req.user){
        res.redirect("/");
        return;
    }
    await User.removeToken(req.cookies.token);
    res.redirect("/");
});


module.exports = router;
