const {query} = require('express-validator');

module.exports = [
    query('token')
        .notEmpty().withMessage("Invalid token").bail()
];
