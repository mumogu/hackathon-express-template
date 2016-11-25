'use strict';

var config = require('./config');

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var mongoose = require('mongoose');
var expressSession = require( 'express-session' );
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

var app = express();

// view engine setup (handlebars)
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Setup Sessions
app.use(expressSession({
    secret: config.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    name: 'sid'
}));

//
// Facebook authentication middleware
//
app.use(passport.initialize());
app.use(passport.session());
passport.use(new FacebookStrategy({
    clientID: config.FACEBOOK_APP_ID,
    clientSecret: config.FACEBOOK_APP_SECRET,
    callbackURL: app.get('env') === 'development' ?
        config.FACEBOOK_LOCAL_CALLBACK_URL : config.FACEBOOK_REMOTE_CALLBACK_URL
}, function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
        //Assuming user exists
        done(null, profile);
    });
}));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// Load database connection
mongoose.connect(config.DATABASE_URL);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () {
    console.log('Database connection established.');
});

// Routing setup
var routes = require('./routes/index');
var games = require('./routes/game');
var live = require('./routes/live');
var auth = require('./routes/auth');

app.use('/', routes);
app.use('/game', games);
app.use('/live', live);
app.use('/auth', auth);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
