const {body, param} = require('express-validator');

const type = body("type")
    .exists()
    .custom((value) => value === "question" || value === "link").withMessage("Invalid type");
const content = body("content")
    .isLength({min: 10}).withMessage("Your comment must have 10 or more characters").bail()
    .isLength({max: 256}).withMessage("Your comment is too long").bail();

module.exports = {
    Create: [
        body("id")
            .isInt().withMessage("Invalid id").bail()
            .toInt(),
        type,
        content
    ],
    Edit: [
        param("id")
            .isInt().withMessage("Invalid Int").bail()
            .toInt(),
        type,
        content
    ],
    Delete: [
        param("id")
            .isInt().withMessage("Invalid Int").bail()
            .toInt(),
        type
    ]
};
