const {body} = require('express-validator');

module.exports = [
    body('email')
        .isEmail().withMessage("Invalid question").bail()
];
