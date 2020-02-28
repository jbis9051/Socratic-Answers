const express = require('express');
const router = express.Router();
const requireUser = require('../middleware/requireUser');
const {CommentsValidatorFormCreate, CommentsValidatorFormDelete, CommentsValidatorFormEdit} = require('../validation');
const Comment = require('../models/Comment');

router.post("/add", requireUser({json: true}), CommentsValidatorFormCreate, function (req, res, next) {
    if (req.validationErrors[0].length > 0) {
        res.status(400);
        res.json({success: false, errors: req.validationErrors[0].map(err => err.msg)});
        return;
    }
    Comment.create(req.body.id, req.body.type, req.user.id, req.body.content, req.user.username).then(async comment => {
        await comment.init();
        res.render('qna/comment', {comment}, function (err, html) {
            if (err) {
                return next(err);
            }
            res.json({success: true, errors: [], html});
        });
    }).catch(err => {
        if(err.code === "23503"){ // foreign key error
            res.json({success: false, errors: ["This post does not exist"]});
        }
    })
});

router.post("/edit/:id", requireUser({json: true}), CommentsValidatorFormEdit, async function (req, res, next) {
    if (req.validationErrors[0].length > 0) {
        res.status(400);
        res.json({success: false, errors: req.validationErrors[0].map(err => err.str)});
        return;
    }
    const comment = Comment.FromId(req.params.id, req.body.type);
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
