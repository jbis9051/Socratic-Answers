const express = require('express');
const router = express.Router();

const csrfToken = require('../middleware/csurf');

const Answer = require('../models/Answer');

const {idParam, AnswerCreateForm, AnswerEditForm}  = require('../validation');

router.get('/:id', idParam,  async function (req, res, next) {
    if (req.validationErrors[0].length > 0) {
        next();
        return;
    }
    const answer  = await Answer.FromId(req.params.id);
    if (!answer) {
        next();
        return;
    }
    await answer.fillContent();
    res.render('qna/answer/view', {answer, linkedQuestions: [] });
});

router.post('/create', AnswerCreateForm,async function (req, res, next) {
    if (req.validationErrors[0].length > 0) {
        res.send(JSON.stringify(req.validationErrors));
      //  next(); //TODO show error
        return;
    }
    await Answer.create(req.body.body, req.site.id, req.body._question, req.user);
    res.redirect("/questions/" + req.body._question)
});

router.get('/edit/:id', idParam, csrfToken, async function (req, res, next) {
    if (req.validationErrors[0].length > 0) {
        next();
        return;
    }
    const answer  = await Answer.FromId(req.params.id);
    if (!answer) {
        next();
        return;
    }
    await answer.fillContent();
    res.render('qna/answer/edit', {answer, csrfToken: req.csrfToken()});
});

router.post('/edit/:id', csrfToken, idParam, AnswerEditForm, async function (req, res, next) {
    if (req.validationErrors[0].length > 0) {
        next();
        return;
    }
    if (req.validationErrors[1].length > 0) {
        next();
        return;
    }
    const answer = await Answer.FromId(req.params.id);
    if(!answer){
        next();
        return;
    }
    await answer.edit(req.body.body);
    res.redirect("/answers/" + answer.id);
});

module.exports = router;
