const {body} = require('express-validator');

module.exports = {
    SignUp: [
        body('username')
            .notEmpty().withMessage("Username cannot be empty").bail()
            .isAlphanumeric().withMessage("Username can only contain letters and numbers")
            .isLength({min: 4, max: 30}).withMessage("Username must be between 4 and 30 characters"),
        body('email')
            .isEmail().withMessage("Email must be a valid email"),
        body('password')
            .notEmpty().withMessage("Password cannot be empty").bail()
            .isLength({min: 8, max: 100}).withMessage("Password must be between 8 and 100 characters")
            .matches(/[A-Z]/g).withMessage("Password must have at least one uppercase letter")
            .matches(/[a-z]/g).withMessage("Password must have at least one lowercase letter")
    ],
    SignIn: [
        body('email')
            .isEmail().withMessage("Email must be a valid email"),
        body('password')
            .notEmpty().withMessage("Password cannot be empty")
    ]
};
