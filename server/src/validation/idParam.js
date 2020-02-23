const {param} = require('express-validator');

module.exports = [
    param("id")
        .isInt().withMessage("id is not an int").bail()
        .toInt()
];
