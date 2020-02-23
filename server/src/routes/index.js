const express = require('express');
const router = express.Router();

const Question = require('../models/Question');

router.get('/', async function (req, res, next) {
    res.render('index', {questions: await Question.getQuestions(req.site.id)});
});

router.use('/users', require('./users'));
router.use('/questions', require('./question'));
router.use('/answers', require('./answer'));
router.use('/resetpassword', require('./resetpassword'));
router.use('/', require('./vote'));

module.exports = router;
