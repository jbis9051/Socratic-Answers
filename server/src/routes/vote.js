const express = require('express');
const router = express.Router();

const requireUser = require('../middleware/requireUser');
const {VoteValidation} = require('../validation');

const Answer = require('../models/Answer');
const Question = require("../models/Question");

router.post('/vote', VoteValidation, async function (req, res, next) {
    if (!req.user) {
        res.status(401);
        res.json({success: false, error: "Not logged in"});
        return;
    }

    if (req.validationErrors[0].length > 0) {
        res.status(400);
        res.json({success: false, error: "Bad Input"});
        return;
    }

    const upvote = req.body.upvote === "true";


    const answer = await Answer.FromId(req.body.answer);
    const qaId = await answer.getQaId(req.body.question);

    if (!qaId) {
        res.status(422);
        res.json({success: false, error: "Unable To Find Q-A Pair"});
        return;
    }

    if (req.user.id === answer.creator.id) {
        res.status(401);
        res.json({success: false, error: "You can't vote on your own post"});
        return;
    }

    await req.user.vote(qaId, upvote);
    res.json({success: true, error: ""});
});

router.post('/unvote', VoteValidation, async function (req, res, next) {
    if (!req.user) {
        res.status(401);
        res.json({success: false, error: "Not logged in"});
        return;
    }

    if (req.validationErrors[0].length > 0) {
        res.status(400);
        res.json({success: false, error: "Bad Input"});
        return;
    }

    const answer = new Answer(req.body.answer);
    const qaId = await answer.getQaId(req.body.question);

    if (!qaId) {
        res.status(422);
        res.json({success: false, error: "Unable To Find Q-A Pair"});
        return;
    }

    await req.user.removeVote(qaId);
    res.json({success: true, error: ""});
});

router.post('/solutionize', VoteValidation, async function (req, res, next) {
    if (!req.user) {
        res.status(401);
        res.json({success: false, error: "Not logged in"});
        return;
    }

    if (req.validationErrors[0].length > 0) {
        res.status(400);
        res.json({success: false, error: "Bad Input"});
        return;
    }

    const answer = new Answer(req.body.answer);
    const question = await Question.FromId(req.body.question);
    const qaId = await answer.getQaId(req.body.question);

    if (!qaId) {
        res.status(422);
        res.json({success: false, error: "Unable To Find Q-A Pair"});
        return;
    }

    if (question.creator.id !== req.user.id) {
        res.status(401);
        res.json({success: false, error: "Unauthorized"});
        return;
    }

    await req.user.solutionize(qaId);
    res.json({success: true, error: ""});
});

router.post('/unsolutionize', VoteValidation, async function (req, res, next) {
    if (!req.user) {
        res.status(401);
        res.json({success: false, error: "Not logged in"});
        return;
    }

    if (req.validationErrors[0].length > 0) {
        res.status(400);
        res.json({success: false, error: "Bad Input"});
        return;
    }

    const answer = new Answer(req.body.answer);
    const question = await Question.FromId(req.body.question);
    const qaId = await answer.getQaId(req.body.question);

    if (!qaId) {
        res.status(422);
        res.json({success: false, error: "Unable To Find Q-A Pair"});
        return;
    }

    if (question.creator.id !== req.user.id) {
        res.status(401);
        res.json({success: false, error: "Unauthorized"});
        return;
    }

    await req.user.unsolutionize(qaId);
    res.json({success: true, error: ""});
});

module.exports = router;
