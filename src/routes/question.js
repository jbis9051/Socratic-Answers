const express = require('express');
const router = express.Router();

const Question = require('../models/Question');

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
    if(req.params.title !== req.app.locals.friendlyURLPath(question.title)){
        res.redirect(`/questions/${question.id}/${req.app.locals.friendlyURLPath(question.title)}`);
        return;
    }
    if (!question) {
        next();
        return;
    }
    res.send(await question.getContent());
});

module.exports = router;
