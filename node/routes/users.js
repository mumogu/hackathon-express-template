var express = require('express');
var router = express.Router();

// Load models
var User = require('../models/user');
var Game = require('../models/game');
var Player = require('../models/player');

/* GET home page. */
router.get('/', function (req, res, next) {

    Game.findOne({}, function (err, doc) {
        if (err || !doc)
            res.render('users', {user: 'not found'});
        else
            res.render('users', {user: doc});

    });
});

router.get('/create', function (req, res, next) {
    //User({'name': 'lol', display:'Bitte zeig mich an!'}).save();

    Game.remove({}, function() {});
    User.remove({}, function() {});

    Game({
        name: 'Sitzung',
        players: [],
        active_player: [],
        words: [
            'Wer schreibt Protokoll?',
            'PPP nicht gemacht',
            'Wie lange machen wir Pause?',
            'Feedback',
            'Doodle-Rüffel',
            'Bier vor Top 4',
            'Aufgabe wird ausgenast',
            'Alle gucken auf Laptop',
            'Leander isst für zwei',
            'Robin kommt zu spät',
            'Bring mir ein Bier mit!',
            'Janning ist alt',
            'Pascale pöbelt',
            'Vorstellungsrunde',
            'Wie schreibt man Protokoll?',
            'Aufgabe wurde nicht gemacht',
            'Sexistische Kackscheiße',
            'Post vergessen'
        ]
    }).save();
    
    Game({
        name: 'testspiel',
        words: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'],
        players: [],
        active_players: []
    });

    Game({
        name: '🍆👉🌮',
        //name: 'Emotionen',
        words: ['🍆', '🌮', '👉', '🍉', '🌮', '😂', '💩', '👻', '💃', '💪', '🖕', '😈', '👠', '🎓', '👍', '🤘', '😜', '🙃', '😍', '😭', '🙊', '⚡️', '💦', '🍕'],
        players: [],
        active_players: []
    }).save();

    Game({
        name: 'Startup-Bingo',
        players: [],
        active_players: [],
        words: [
            'SEO',
            'Traffic',
            'Break Even',
            'Cash-Flow',
            'Win-Win',
            'Skalierbarkeit',
            'VC',
            'Crowdfunding',
            'Xing',
            'Uber',
            'Social Media',
            'App',
            'Disruptiv',
            'Ökosystem',
            'Lean Startup',
            'User Experience',
            'Long Tail',
            'Low hanging fruit',
            'Gamification',
            'IoT']
    }).save();

    /*
     Player({
     name: 'Dirk',
     word_permutation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0],
     score_matrix: '1000000000000000'
     }).save();

     Player({
     name: 'Boobies',
     word_permutation: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0],
     score_matrix: '1000000000000000'
     }).save();
     */

    res.redirect('/');
});

router.get('/crash', function (req, res, next) {
    process.exit();
})

module.exports = router;