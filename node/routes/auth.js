var express = require('express');
var router = express.Router();
var passport = require('passport');

// Load models
var Player = require('../models/player');
var Game = require('../models/game');

//
// Get all Games and list them
//
router.get('/', function (req, res, next) {
    res.render('auth', {
        isAuthenticated: req.isAuthenticated(),
        user: JSON.stringify(req.user)
    });
});

router.get('/facebook', passport.authenticate('facebook'));

router.get('/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/game/',
        failureRedirect: '/auth/error'
    })
);

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
})

router.get('/error', function (req, res, next) {
    res.send('Error');
})

module.exports = router;