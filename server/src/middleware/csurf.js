const csrf = require('server/src/middleware/csurf');
const csrfProtection  = csrf({ cookie: true });

module.exports = csrfProtection;
