const {body} = require('express-validator');

module.exports = [
    body('title')
        .notEmpty().withMessage("Questions must have a title").bail()
        .isLength({min: 5, max: 256}).withMessage("title must be between 5 and 256 characters"),
    body('tags')
        .notEmpty().withMessage("You must have at least one tag").bail()
        .not().matches(/[^\w\d-_, ]/g).withMessage("You have illegal characters in your tags").bail()
        .customSanitizer(value => value.split(",").map(tag => tag.trim().replace(/ /g, "-"))), //TODO length check
    body('body')
        .notEmpty().withMessage("Your question body cannot be empty").bail()
        .isLength({min: 15}).withMessage("Your question body has to be at least 15 characters")
];
