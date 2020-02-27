const express = require('express');
const router = express.Router();
const requireUser = require('../middleware/requireUser');
const {CommentsValidatorForm} = require('../validation');
const Comment = require('../models/Comment');

router.post("/new", requireUser({json: true}), CommentsValidatorForm.Create, async function (req, res, next) {
    if (req.validationErrors[0].length > 0) {
        res.status(400);
        res.json({success: false, errors: req.validationErrors[0].map(err => err.str)});
        return;
    }
    await Comment.create(req.body.qa_id, req.user.id, req.body.content);
    res.json({success: true, errors: []});
});

router.post("/edit/:id", requireUser({json: true}), CommentsValidatorForm.Edit, async function (req, res, next) {
    if (req.validationErrors[0].length > 0) {
        res.status(400);
        res.json({success: false, errors: req.validationErrors[0].map(err => err.str)});
        return;
    }
    const comment = Comment.FromId(req.params.id);
    if(!comment){
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

router.post("/delete/:id", requireUser({json: true}), CommentsValidatorForm.Delete, async function (req, res, next) {
    if (req.validationErrors[0].length > 0) {
        res.status(400);
        res.json({success: false, errors: req.validationErrors[0].map(err => err.str)});
        return;
    }
    const comment = Comment.FromId(req.params.id);
    if(!comment){
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
