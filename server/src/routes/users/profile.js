const express = require('express');
const router = express.Router();

const url = require('url');

const User = require('../../models/User');

const requireUser = require('../../middleware/requireUser');
const csrfProtection = require('../../middleware/csurf');

const urlHasDomain = require('../../helpers/urlHasDomain');

const markdown = require('../../helpers/markdown');
const {idParam, ProfileEditForm} = require('../../validation');

router.get('/:id', idParam,  async function (req, res, next) {
    if(req.validationErrors[0].length > 0){
        next();
        return;
    }
    const username = await User.getUsername(req.params.id);
    if (!username) {
        next();
        return;
    }
    res.redirect(`/users/${req.params.id}/${req.app.locals.friendlyURLPath(username)}`);
});

router.get('/:id/:username', idParam, async function (req, res, next) {
    if(req.validationErrors[0].length > 0){
        next();
        return;
    }
    const user = await User.FromId(req.params.id);
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

router.get('/answers/:id', idParam,  async function (req, res, next) {
    if(req.validationErrors[0].length > 0){
        next();
        return;
    }
    const user = await User.FromId(req.params.id);
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

router.post('/edit', ProfileEditForm, csrfProtection, async function (req, res, next) {
    if (req.validationErrors[0].length > 0) {
        req.errors = req.validationErrors[0].map(error => error.msg);
        next();
        return;
    }
    await req.user.updateBioFields(req.body.bio, req.body.location, req.body.website, req.body.github);
    await req.user.updatePreferences(!!req.body['accept-spam']);
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
