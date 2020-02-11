const express = require('express');
const router = express.Router();

const Question = require('../models/Question');
const requireUser = require('../middleware/requireUser');
const csrfToken = require('../middleware/csurf');
const friendlyURLPath = require('../helpers/friendlyURLPath');

router.get('/ask', requireUser, csrfToken, async function (req, res, next) {
    res.render('qna/ask', {
        csrfToken: req.csrfToken(),
        errors: [],
        body: "",
        title: "",
        tags: "",
        page_title: "Ask a Question!"
    });
});

router.post('/ask', requireUser, csrfToken, async function (req, res, next) {
    const tags = req.body.tags.split(",").map(tag => tag.trim().replace(/ /g, "-"));
    const errors = questionValidator(req.body.title, tags);
    if (errors.length !== 0) {
        res.render('qna/ask', {
            csrfToken: req.csrfToken(),
            errors: errors,
            body: req.body.body,
            title: req.body.title,
            tags: req.body.tags,
            page_title: "Ask a Question!",
        });
        return;
    }
    const question = await Question.create(req.body.title, req.body.body, tags, req.site.id, req.user);
    res.redirect(`/questions/${question.id}/${friendlyURLPath(question.title)}`);
});

router.get('/edit/:id', requireUser, csrfToken, async function (req, res, next) {
    const question = await Question.FromId(req.params.id);
    await question.fillContent();
    res.render('qna/ask', {
        csrfToken: req.csrfToken(),
        errors: [],
        body: question.content,
        title: question.title,
        tags: question.taglist.join(", "),
        page_title: "Edit Question"
    });
});

router.post('/edit/:id', requireUser, csrfToken, async function (req, res, next) {
    const tags = req.body.tags.split(",").map(tag => tag.trim().replace(/ /g, "-"));
    const errors = questionValidator(req.body.title, tags);
    if (errors.length !== 0) {
        res.render('qna/ask', {
            csrfToken: req.csrfToken(),
            errors: errors,
            body: req.body.body,
            title: req.body.title,
            tags: req.body.tags,
            page_title: "Edit Question"
        });
        return;
    }
    const question = await Question.FromId(req.params.id);
    await question.edit(req.body.title, req.body.body, tags);
    res.redirect(`/questions/${question.id}/${friendlyURLPath(question.title)}`);
});

function questionValidator(title, tags) {
    const tagsString = tags.join("");
    const errors = [];
    if (tags.length < 1) {
        errors.push("At least one tag is required.");
    }
    if (title.length >= 256) {
        errors.push("The title must be less than 256 characters.")
    }
    if (tagsString.length + (tags.length * 2) >= 256) {
        errors.push("Please use less tags.");
    }
    return errors;
}

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
    await question.fillContent();
    const answers = await question.getAnswers(req.site.id, parseInt(req.query.page) || 1, req.query.sort || "newest");
    await Promise.all(answers.map(async answer => {
        await answer.fillContent();
        const qaID = await answer.getQaId(question.id);
        answer.votes = await answer.getVotes(qaID);
        if (req.user) {
            answer.userSelected = await answer.getVoteForUser(qaID, req.user.id);
        } else {
            answer.userSelected = null;
        }
        if (answer.userSelected === true) {
            answer.userSelected = "upvote";
        } else if (answer.userSelected === false) {
            answer.userSelected = "downvote";
        }
    }));
    res.render('qna/view_question', {question, answers});
});

module.exports = router;
