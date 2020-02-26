const express = require('express');
const router = express.Router();
const {CommentsValidatorForm, idParam} = require('../validation');

router.post("/new", CommentsValidatorForm, function (req, res, next) {

});

router.post("/edit/:id", idParam, function (req, res, next) {

});

router.post("/delete/:id", idParam, function (req, res, next) {

});
