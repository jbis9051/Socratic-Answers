const {body} = require('express-validator');
const urlHasDomain = require('../helpers/urlHasDomain');

module.exports = [
    body('website')
        .exists().withMessage("Website required").bail()
        .if(body('website').notEmpty())
            .isURL({ protocols: ['http','https'], require_valid_protocol: true}).withMessage("Invalid URL for website field").bail()
            .isLength({max: 256}).withMessage("Website URL too long."),
    body('github')
        .exists().withMessage("GitHub URL required").bail()
        .if(body('github').notEmpty())
            .isURL({ protocols: ['http','https'], require_valid_protocol: true}).withMessage("Invalid URL for website field").bail()
            .isLength({max: 256}).withMessage("GitHub URL too long.").bail()
            .custom(val => {
                if(urlHasDomain(val, "github.com")){
                    return true;
                }
                throw new Error('GitHub URL must be a GitHub URL');
            }),
    body('location')
        .exists().withMessage("Location URL required").bail()
        .isLength({max: 256}).withMessage("Location is too long."),
    body('bio')
        .exists().withMessage("Bio required")
];
