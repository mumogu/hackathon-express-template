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
    res.render('auth', {});
});

router.get('/facebook', passport.authenticate('facebook'));

router.get('/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/auth/success',
    failureRedirect: '/auth/error'
}));

router.get('/success', function(req, res, next) {
    res.send('Success');
})

router.get('/error', function(req, res, next) {
    res.send('Error');
})

module.exports = router;