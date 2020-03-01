const express = require('express');
const router = express.Router();

const Comment = require('../models/Comment');
const LinkQA = require('../models/LinkQA');
const Question = require('../models/Question');

const requireUser = require('../middleware/requireUser');
const csrfToken = require('../middleware/csurf');
const friendlyURLPath = require('../helpers/friendlyURLPath');
const {QuestionAskEditForm, idParam} = require('../validation');

router.get('/ask', requireUser(), csrfToken, async function (req, res, next) {
    res.render('qna/ask', {
        csrfToken: req.csrfToken(),
        errors: [],
        body: "",
        title: "",
        tags: "",
        page_title: "Ask a Question!"
    });
});

router.post('/ask', requireUser(), csrfToken, QuestionAskEditForm, async function (req, res, next) {
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


router.get("/history/:id", idParam, async function (req, res, next) {
    if (req.validationErrors[0].length > 0) {
        return next();
    }
    const question = new Question(req.params.id);
    const history = await question.getHistory();
    if (history.length === 0) {
        return next();
    }
    res.render('qna/qhistory', {question, history});
});

router.get('/edit/:id', requireUser(), csrfToken, idParam, async function (req, res, next) {
    if (req.validationErrors[0].length > 0) {
        return next();
    }
    const question = await Question.FromId(req.params.id);
    if (!question || question.site_id !== req.site.id) {
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

router.post('/edit/:id', requireUser(), csrfToken, idParam, QuestionAskEditForm, async function (req, res, next) {
    if (req.validationErrors[0].length > 0) {
        return next();
    }
    if (req.validationErrors[1].length > 0) {
        res.render('qna/ask', {
            csrfToken: req.csrfToken(),
            errors: req.validationErrors[1].map(error => error.msg),
            body: req.body.body,
            title: req.body.title,
            tags: req.body.tags.join(", "),
            page_title: "Edit Question"
        });
        return;
    }
    const question = await Question.FromId(req.params.id);
    if (!question || question.site_id !== req.site.id) {
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

router.get('/:id/:title', idParam, async function (req, res, next) {
    if (req.validationErrors[0].length > 0) {
        return next();
    }
    const question = await Question.FromId(req.params.id);
    if (!question || question.site_id !== req.site.id) {
        next();
        return;
    }
    if (req.params.title !== req.app.locals.friendlyURLPath(question.title)) {
        res.redirect(`/questions/${question.id}/${req.app.locals.friendlyURLPath(question.title)}`);
        return;
    }
    await question.fillContent();
    question.comments = await question.getComments();

    const links = await LinkQA.getAnswers(question.id, parseInt(req.query.page) || 1, req.query.sort || "newest");
    await Promise.all(links.map(async link => {
        link.comments = await link.getComments();
        const answer = link.answer;
        await answer.fillContent();
        answer.votes = await link.getVotes();
        if (req.user) {
            answer.userSelected = await link.getVoteForUser(req.user.id);
        } else {
            answer.userSelected = null;
        }
        if (answer.userSelected === true) {
            answer.userSelected = "upvote";
        } else if (answer.userSelected === false) {
            answer.userSelected = "downvote";
        }
    }));
    res.render('qna/view_question', {question, links});
});


module.exports = router;
