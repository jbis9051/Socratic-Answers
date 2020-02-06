const express = require('express');
const router = express.Router();

const url = require('url');

const User = require('../../models/User');

const requireUser = require('../../middleware/requireUser');
const csrfProtection = require('../../middleware/csurf');

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
    res.locals.user = user;
    res.locals.tab = "main";
    res.render('users/profile/profile');
});

router.get('/answers/:id', async function (req, res, next) {
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
    let sorting = req.query.sort || "newest";
    let page = req.query.page !== undefined ? parseInt(req.query.page) : 1;

    const answers = await user.getAnswers(req.site.id, page, sorting);
    const answersCount = parseInt(await user.getAnswersCount(req.site.id));

    res.render('users/profile/answers', {answers, answersCount, user, tab: "answers", sorting: sorting});
});

router.post('/edit', csrfProtection, async function (req, res, next) {
    if (![/*"username",*/ "bio", "profile_image", "location", "website", "github"].every(key => key in req.body)) {
        res.send("An error occurred.");
        return;
    }
    const errors = [];
    /* if (!Validation.Username.test(req.body.username)) {
         errors.push("Invalid Username");
     }*/
    const github = url.parse(req.body.github);
    const website = url.parse(req.body.website);

    if (req.body.github !== "" && !/^https?:/.test(github.protocol) || !urlHasDomain(req.body.github, "github.com")) {
        errors.push("GitHub URL must be a valid GitHub URL");
    }

    if (req.body.website !== "" && !/^https?:/.test(website.protocol)) {
        errors.push("Website URL must be a valid URL");
    }
    if (errors.length !== 0) {
        req.errors = errors;
        next();
        return;
    }
    await req.user.updateBioFields(req.body.bio, req.body.location, req.body.website, req.body.github);
    res.redirect(`/users/${req.user.id}/${req.app.locals.friendlyURLPath(req.user.username)}`);
});
router.all('/edit', requireUser, csrfProtection, async function (req, res, next) {
    await req.user.fillBioFields();
    res.locals.user = req.user;
    res.locals.tab = "edit";
    res.render('users/profile/edit', {errors: req.errors || [], csrfToken: req.csrfToken()});
});

router.get('/questions', async function (req, res, next) {
    let sorting = req.query.sort || "newest";
    let page = req.query.page !== undefined ? parseInt(req.query.page) : 1;

    const questions = await req.user.getQuestions(req.site.id, page, sorting);
    const questionCount = parseInt(await req.user.getQuestionCount(req.site.id));

    res.render('users/profile/questions', {
        questions,
        questionCount,
        user: req.user,
        tab: "questions",
        sorting: sorting
    });

});

module.exports = router;
