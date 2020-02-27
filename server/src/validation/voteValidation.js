const {body} = require('express-validator');

module.exports = [
    body('qa_id')
        .isInt().withMessage("Invalid Link Id").bail()
        .toInt()
];
