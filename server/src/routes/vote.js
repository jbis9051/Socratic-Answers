const express = require('express');
const router = express.Router();

const requireUser = require('../middleware/requireUser');
const {VoteValidation} = require('../validation');

const LinkQA = require('../models/LinkQA');

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


    const linkQA = await LinkQA.FromId(req.body.qa_id);

    if (!linkQA) {
        res.status(422);
        res.json({success: false, error: "Unable To Find Link"});
        return;
    }

    await linkQA.answer.init();

    if (req.user.id === linkQA.answer.creator.id) {
         res.status(401);
         res.json({success: false, error: "You can't vote on your own post"});
         return;
     }

    await linkQA.vote(req.user.id, upvote);
    res.json({success: true, error: ""});
});

router.post('/unvote', requireUser({json: true}), VoteValidation, async function (req, res, next) {
    if (req.validationErrors[0].length > 0) {
        res.status(400);
        res.json({success: false, error: "Bad Input"});
        return;
    }

    const linkQA = await LinkQA.FromId(req.body.qa_id);

    if (!linkQA) {
        res.status(422);
        res.json({success: false, error: "Unable To Find Q-A Pair"});
        return;
    }

    await linkQA.removeVote(req.user.id);
    res.json({success: true, error: ""});
});

router.post('/solutionize', requireUser({json: true}), VoteValidation, async function (req, res, next) {
    if (req.validationErrors[0].length > 0) {
        res.status(400);
        res.json({success: false, error: "Bad Input"});
        return;
    }

    const linkQA = await LinkQA.FromId(req.body.qa_id);

    if (!linkQA) {
        res.status(422);
        res.json({success: false, error: "Unable To Find Q-A Pair"});
        return;
    }

    await linkQA.question.init();


    if (linkQA.question.creator.id !== req.user.id) {
        res.status(401);
        res.json({success: false, error: "Unauthorized"});
        return;
    }

    await linkQA.solutionize();
    res.json({success: true, error: ""});
});

router.post('/unsolutionize', requireUser({json: true}), VoteValidation, async function (req, res, next) {
    if (req.validationErrors[0].length > 0) {
        res.status(400);
        res.json({success: false, error: "Bad Input"});
        return;
    }

    const linkQA = await LinkQA.FromId(req.body.qa_id);

    if (!linkQA) {
        res.status(422);
        res.json({success: false, error: "Unable To Find Q-A Pair"});
        return;
    }

    await linkQA.question.init();

    if (linkQA.question.creator.id !== req.user.id) {
        res.status(401);
        res.json({success: false, error: "Unauthorized"});
        return;
    }

    await linkQA.unsolutionize();

    res.json({success: true, error: ""});
});

module.exports = router;
