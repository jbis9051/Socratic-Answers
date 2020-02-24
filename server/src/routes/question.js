const express = require('express');
const router = express.Router();

const Question = require('../models/Question');
const requireUser = require('../middleware/requireUser');
const csrfToken = require('../middleware/csurf');
const friendlyURLPath = require('../helpers/friendlyURLPath');
const {QuestionAskEditForm, idParam} = require('../validation');

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

router.post('/ask', requireUser, csrfToken, QuestionAskEditForm, async function (req, res, next) {
     if (req.validationErrors[0].length > 0) {
        res.render('qna/ask', {
            csrfToken: req.csrfToken(),
            errors: req.validationErrors[0].map(error => error.msg),
            body: req.body.body,
            title: req.body.title,
            tags: req.body.tags,
            page_title: "Ask a Question!",
        });
        return;
    }
    const question = await Question.create(req.body.title, req.body.body, req.body.tags, req.site.id, req.user);
    res.redirect(`/questions/${question.id}/${friendlyURLPath(question.title)}`);
});

router.get('/edit/:id', requireUser, csrfToken, idParam, async function (req, res, next) {
    if (req.validationErrors[0].length > 0) {
        return next();
    }
    const question = await Question.FromId(req.params.id);
    if(!question){
        return next();
    }
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

router.post('/edit/:id', requireUser, csrfToken, idParam, QuestionAskEditForm, async function (req, res, next) {
    if (req.validationErrors[0].length > 0) {
        return next();
    }
    if (req.validationErrors[1].length > 0) {
        res.render('qna/ask', {
            csrfToken: req.csrfToken(),
            errors: errors,
            body: req.body.body,
            title: req.body.title,
            tags: req.body.tags.join(", "),
            page_title: "Edit Question"
        });
        return;
    }
    const question = await Question.FromId(req.params.id);
    if(!question){
        return next();
    }
    await question.edit(req.body.title, req.body.body, req.body.tags, req.user.username, req.user.id);
    res.redirect(`/questions/${question.id}/${friendlyURLPath(question.title)}`);
});

router.get('/:id', idParam, async function (req, res, next) {
    if (req.validationErrors[0].length > 0) {
        return next();
    }
    const title = await Question.getTitle(req.params.id);
    if (!title) {
        next();
        return;
    }
    res.redirect(`/questions/${req.params.id}/${req.app.locals.friendlyURLPath(title)}`);
});

router.get('/:id/:title', idParam,async function (req, res, next) {
    if (req.validationErrors[0].length > 0) {
        return next();
    }
    const question = await Question.FromId(req.params.id);
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
