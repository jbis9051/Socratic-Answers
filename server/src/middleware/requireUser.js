module.exports =(options) => {
    if(options.json){
        return function (req, res, next) {
            if (!req.user) {
                res.status(401).json({success: false, errors:["You must be logged in to preform this action"]});
                return;
            }
            next();
        }
    } else {
        return function (req, res, next) {
            if (!req.user) {
                res.redirect('/users/signin?r=' + encodeURIComponent(req.originalUrl));
                return;
            }
            next();
        }
    }

};
