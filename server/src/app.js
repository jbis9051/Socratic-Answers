const express = require("express");
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const path = require('path');
const friendlyURLPath = require('./helpers/friendlyURLPath');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../node_modules/@socraticanswers/static/public')));
app.use(require('./middleware/sites'));

app.locals.friendlyURLPath = friendlyURLPath;
app.use(require('./middleware/auth'));
app.use(require('./routes'));

app.get('/', (req, res) => res.send('Hello World!'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    res.status(404);
    res.render('404');
});


module.exports = app;
