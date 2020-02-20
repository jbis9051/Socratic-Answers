const express = require('express');
const router = express.Router();

const csrfProtection = require('../../middleware/csurf');

const User = require('../../models/User');

router.use(require('./signup'));
router.use(require('./signin'));
router.use(require('./profile'));

router.get('/logout', async function (req, res, next) {
    if(!req.user){
        res.redirect("/");
        return;
    }
    if(req.cookies.token){
        await User.removeToken(req.cookies.token);
    }
    res.redirect("/");
});


module.exports = router;
