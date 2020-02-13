const express = require('express');
const router = express.Router();

const Answer = require('../models/Answer');

router.get('/:id', function (req, res, next) {
    if (isNaN(parseInt(req.params.id))) {
        next();
        return;
    }
});

router.post('/create', async function (req, res, next) {
    if (isNaN(parseInt(req.body._question))) {
        res.status(400);
        res.send("Bad Input");
        return;
    }
    await Answer.create(req.body.body, req.site.id, parseInt(req.body._question), req.user);
    res.redirect("/questions/" + req.body._question)
});

router.get('/edit/:id', function (req, res, next) {
    if (isNaN(parseInt(req.params.id))) {
        next();
        return;
    }
});

router.post('/edit/:id', async function (req, res, next) {

});

module.exports = router;
