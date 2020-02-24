const {validationResult} = require('express-validator');

function validationMiddlewareWrapper(validationFunctions) {
    validationFunctions.push(function (req, res, next) {
        const validationErrors = validationResult(req).errors;
        if (Array.isArray(req.validationErrors) && req.route === req.validationRoute) {
            req.validationErrors.push(validationErrors);
            next();
            return;
        }
        req.validationRoute = req.route;
        req.validationErrors = [validationErrors];
        next();
    });
    return validationFunctions;
}

const validators = {
    SignInForm: require('./auth').SignIn,
    SignUpForm: require('./auth').SignUp,
    idParam: require('./idParam'),
    ProfileEditForm: require('./profileEditForm'),
    QuestionAskEditForm: require('./questionAskEditForm'),
    AnswerCreateForm: require('./answerCreateAndEditForm').Create,
    AnswerEditForm: require('./answerCreateAndEditForm').Edit,
    VoteValidation: require('./voteValidation'),
    ResetPasswordEmailForm:  require('./resetPasswordEmailForm'),
    ResetPasswordTokenCheck: require('./resetPasswordTokenCheck'),
    ResetPasswordResetForm: require('./resetPasswordResetForm')
};

Object.keys(validators).forEach(key => {
    validators[key] = validationMiddlewareWrapper(validators[key]);
});

module.exports = validators;
