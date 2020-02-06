const express = require('express');
const router = express.Router();

const Question = require('../models/Question');
const requireUser = require('../middleware/requireUser');
const csrfToken = require('../middleware/csurf');
const friendlyURLPath = require('../helpers/friendlyURLPath');

router.get('/ask', requireUser, csrfToken, async function (req, res, next) {
    res.render('ask', {csrfToken: req.csrfToken(), errors: [], body: "", title: "", tags: ""});
});

router.post('/ask', requireUser, csrfToken, async function (req, res, next) {
    const tags = req.body.tags.split(",").map(tag => tag.trim().replace(/ /g, "-"));
    const tagsString = tags.join("");
    const errors = [];
    if (tags.length < 1) {
        errors.push("At least one tag is required.");
    }
    if (req.body.title.length >= 256) {
        errors.push("The title must be less than 256 characters.")
    }
    if (tagsString.length + (tags.length * 2) >= 256) {
        errors.push("Please use less tags.");
    }
    if (errors.length !== 0) {
        res.render('ask', {
            csrfToken: req.csrfToken(),
            errors: errors,
            body: req.body.body,
            title: req.body.title,
            tags: req.body.tags
        });
        return;
    }
    const question = await Question.create(req.body.title, req.body.body, tags, req.site.id, req.user);
    res.redirect(`/questions/${question.id}/${friendlyURLPath(question.title)}`);
});

router.get('/:id', async function (req, res, next) {
    const id = parseInt(req.params.id);
    if (!id) {
        next();
        return;
    }
    const title = await Question.getTitle(id);
    if (!title) {
        next();
        return;
    }
    res.redirect(`/questions/${id}/${req.app.locals.friendlyURLPath(title)}`);
});

router.get('/:id/:title', async function (req, res, next) {
    const id = parseInt(req.params.id);
    if (!id) {
        next();
        return;
    }
    const question = await Question.FromId(id);
    if (!question) {
        next();
        return;
    }
    if (req.params.title !== req.app.locals.friendlyURLPath(question.title)) {
        res.redirect(`/questions/${question.id}/${req.app.locals.friendlyURLPath(question.title)}`);
        return;
    }
    res.send(await question.getContent());
});

module.exports = router;
