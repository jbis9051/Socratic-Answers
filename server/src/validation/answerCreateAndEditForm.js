const {body} = require('express-validator');

const bodyVali  =  body('body')
                    .notEmpty().withMessage("Body can't be empty").bail()
                    .isLength({min: 15}).withMessage("Answers must have at least 15 characters");

module.exports = {
    Create: [
        body('_question')
            .isInt().withMessage("Invalid Question Id").bail()
            .toInt(),
        bodyVali

    ],
    Edit: [
       bodyVali

    ]

};
