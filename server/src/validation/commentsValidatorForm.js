const {body, param} = require('express-validator');

module.exports = {
    Create: [
        body("qa_id")
            .isInt().withMessage("Invalid qa_id").bail()
            .toInt(),
        body("content")
            .isLength({min: 10}).withMessage("Your comment must have 10 or more characters").bail()
            .isLength({max: 256}).withMessage("Your comment is too long").bail()
    ],
    Edit: [
        param("id")
            .isInt().withMessage("Invalid Int").bail()
            .toInt(),
        body("content")
            .isLength({min: 10}).withMessage("Your comment must have 10 or more characters").bail()
            .isLength({max: 256}).withMessage("Your comment is too long").bail()
    ],
    Delete: [
        param("id")
            .isInt().withMessage("Invalid Int").bail()
            .toInt(),
    ]
};
