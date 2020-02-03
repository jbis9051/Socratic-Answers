const express = require('express');
const router = express.Router();

const url = require('url');

const User = require('../../models/User');

const requireUser = require('../../middleware/requireUser');
const Validation = require('../../helpers/validation');
const urlHasDomain = require('../../helpers/urlHasDomain');

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
    if (req.params.username !== req.app.locals.friendlyURLPath(user.username)) {
        res.redirect(`/users/${user.id}/${req.app.locals.friendlyURLPath(user.username)}`);
        return;
    }
    await user.fillBioFields();
    res.render('users/profile/profile', {user: user, tab: "main", bio: markdown.render(user.bio)});
});

router.get('/edit', requireUser, async function (req, res, next) {
    await req.user.fillBioFields();

    res.render('users/profile/profile', {user: req.user, tab: "edit", bio: markdown.render(req.user.bio), errors: []});
});

router.post('/edit', async function (req, res, next) {
    if (!["username", "bio", "profile_image", "location", "website", "github"].every(key => key in req.body)) {
        res.send("An error occurred.");
        return;
    }
    const errors = [];
    if (!Validation.Username.test(req.body.username)) {
        errors.push("Invalid Username");
    }
    const github = url.parse(req.body.github);
    const website = url.parse(req.body.website);

    if (req.body.github !== "" && !/^https?:/.test(github.protocol) || !urlHasDomain(req.body.github, "github.com")) {
        errors.push("GitHub URL must be a valid GitHub URL");
    }

    if (req.body.website !== "" && !/^https?:/.test(website.protocol)) {
        errors.push("Website URL must be a valid URL");
    }
    if (errors.length === 0) {
        await req.user.updateBioFields(req.body.bio, req.body.location, req.body.website, req.body.github);
        res.redirect(`/users/${req.user.id}/${req.app.locals.friendlyURLPath(req.user.username)}`);

    } else {
        await req.user.fillBioFields();
        res.render('users/profile/profile', {
            user: req.user,
            tab: "edit",
            bio: markdown.render(req.user.bio),
            errors: errors
        });

    }
});

module.exports = router;
