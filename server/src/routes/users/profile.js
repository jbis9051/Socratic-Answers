const express = require('express');
const router = express.Router();

const User = require('../../models/User');

const requireUser = require('../../middleware/requireUser');

const markdown = require('../../helpers/markdown');

router.get('/:id', async function (req, res, next) {
    const id = parseInt(req.params.id);
    if (!id) {
        next();
        return;
    }
    const username = await User.getUsername(id);
    if (!username) {
        next();
        return;
    }
    res.redirect(`/users/${id}/${req.app.locals.friendlyURLPath(username)}`);
});

router.get('/:id/:username', async function (req, res, next) {
    const id = parseInt(req.params.id);
    if (!id) {
        next();
        return;
    }
    const user = await User.FromId(id);
    if (!user) {
        next();
        return;
    }
    if(req.params.username !== req.app.locals.friendlyURLPath(user.username)){
        res.redirect(`/users/${user.id}/${req.app.locals.friendlyURLPath(user.username)}`);
        return;
    }
    await user.fillBioFields();
    res.render('users/profile/profile', {user: user, tab: "main", bio: markdown.render(user.bio)});
});

router.get('/edit', requireUser, async function (req, res, next) {
    await req.user.fillBioFields();

    res.render('users/profile/profile', {user: req.user, tab: "edit", bio: markdown.render(req.user.bio)});
});

module.exports = router;
