const csrf = require('csurf');
const csrfProtection = csrf({
    cookie: {
        httpOnly: true,
        path: '/',
        secure: true,
        sameSite: 'Strict',
        domain: '.socraticanswers.com'
    }
});

module.exports = csrfProtection;
