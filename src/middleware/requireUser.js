module.exports = function (req, res, next) {
    if (!req.user) {
        res.redirect('/users/signin?r=' + encodeURIComponent(req.originalUrl));
        return;
    }
    next();
};
