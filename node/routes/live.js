var express = require('express');
var router = express.Router();

// Load models
var Game = require('../models/game');
var Player = require('../models/player');

//
// Get all Games and list them
//
router.get('/', function (req, res, next) {
    res.render('live', {});
});

module.exports = router;