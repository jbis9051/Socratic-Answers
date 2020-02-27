const express = require('express');
const router = express.Router();
const requireUser = require('../middleware/requireUser');
const {CommentsValidatorFormCreate, CommentsValidatorFormDelete, CommentsValidatorFormEdit} = require('../validation');
const Comment = require('../models/Comment');

router.post("/add", requireUser({json: true}), CommentsValidatorFormCreate, async function (req, res, next) {
    if (req.validationErrors[0].length > 0) {
        res.status(400);
        res.json({success: false, errors: req.validationErrors[0].map(err => err.msg)});
        return;
    }
    const comment = await Comment.create(req.body.qa_id, req.user.id, req.body.content, req.user.username);
    await comment.init();
    res.render('qna/comment', {comment}, function (err, html) {
        if (err) {
            return next(err);
        }
        res.json({success: true, errors: [], html});
    });
});

router.post("/edit/:id", requireUser({json: true}), CommentsValidatorFormEdit, async function (req, res, next) {
    if (req.validationErrors[0].length > 0) {
        res.status(400);
        res.json({success: false, errors: req.validationErrors[0].map(err => err.str)});
        return;
    }
    const comment = Comment.FromId(req.params.id);
    if (!comment) {
        return next();
    }
    if (comment.creator.id !== req.user.id) {
        res.status(401);
        res.json({success: false, error: "Unauthorized"});
        return;
    }
    await comment.edit(req.body.content);
    res.json({success: true, errors: []});
});

router.post("/delete/:id", requireUser({json: true}), CommentsValidatorFormDelete, async function (req, res, next) {
    if (req.validationErrors[0].length > 0) {
        res.status(400);
        res.json({success: false, errors: req.validationErrors[0].map(err => err.str)});
        return;
    }
    const comment = Comment.FromId(req.params.id);
    if (!comment) {
        return next();
    }
    if (comment.creator.id !== req.user.id) {
        res.status(401);
        res.json({success: false, error: "Unauthorized"});
        return;
    }
    await comment.delete(req.body.content);
    res.json({success: true, errors: []});
});

module.exports = router;
