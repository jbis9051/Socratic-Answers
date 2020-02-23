const {query, body} = require('express-validator');

module.exports = [
    query('token')
        .notEmpty().withMessage("Invalid token").bail(),
    body('password')
        .notEmpty().withMessage("Invalid password").bail()
];
