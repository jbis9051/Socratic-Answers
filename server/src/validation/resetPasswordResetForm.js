const {query} = require('express-validator');

module.exports = [
    query('token')
        .notEmpty().withMessage("Invalid token").bail(),
    query('password')
        .notEmpty().withMessage("Invalid password").bail()
];
