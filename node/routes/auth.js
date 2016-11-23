var express = require('express');
var router = express.Router();

// Load models
var Player = require('../models/player');
var Game = require('../models/game');

//
// Get all Games and list them
//
router.get('/', function (req, res, next) {
    res.render('auth', {});
});

module.exports = router;