const {body} = require('express-validator');

module.exports = [
    body('question')
        .isInt().withMessage("Invalid question").bail()
        .toInt(),
    body('answer')
        .isInt().withMessage("Invalid question").bail()
        .toInt(),
];
