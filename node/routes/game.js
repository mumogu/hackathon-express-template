'use strict';

var express = require('express');
var router = express.Router();

// Load models
var Game = require('../models/game');
var Player = require('../models/player');

/**
 * Fisher-Yates-Algorithm to shuffle an array. This creates a random permutation of the given array and returns an new
 * array. The parameter is not shuffled in-place.
 */
function fisher_yates_shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

/**
 * Get all games and render a list of all games to the screen. If no games are found, the template renders an
 * appropriate message.
 */
router.get('/', function (req, res, next) {
    Game.find({}, function (err, games) {
        res.render('games_list', {'games': games});
    });
});

/**
 * Render the form for creating a new game
 */
router.get('/create', function (req, res, next) {
    res.render('newgame', {});
});

/**
 * The form for creating a new game has been POSTed. Check if the inputs are valid and create the game or render the
 * form again and include an error message.
 */
router.post('/create', function (req, res, next) {

    var game_name = req.body.name;

    // Filter out empty lines in the words textarea
    var game_words = req.body.words.split('\r\n').filter(function (w) {
        return w !== '';
    });

    // Check if the name of the game is shorter than 2 characters, includes spaces or less than 16 words were entered
    if (game_name.length < 2 || game_name.indexOf(' ') >= 0 || game_words.length < 16) {
        res.render('newgame', {
            has_error: true,
            error: 'Fehler.',
            name: game_name,
            words: req.body.words
        });
        return;
    }

    // Create the game and save it to the database. On success, redirect to join the game.
    Game({
        name: game_name,
        words: game_words,
        players: [],
        active_players: []
    }).save(function (err, game) {
        res.redirect('/game/' + game_name);
    });
});

/**
 * Render the page for joining a specific game. The page lets the user choose a name.
 */
router.get('/:game_name', function (req, res, next) {

    var requested_game = req.params.game_name;

    Game.findOne({name: requested_game}, function (err, game) {
        if (err || !game) {
            res.render('error-404', {error: 'Spiel ' + requested_game + ' konnte nicht gefunden werden.'})
            return;
        }

        // If the user already has a cookie indicating a saved game in the database, redirect to the game, else render
        // the username input form
        var url_cookie = req.cookies[encodeURIComponent('bingo-' + game.name)];
        if (url_cookie) {
            res.redirect('/game/' + encodeURIComponent(game.name) + '/' + url_cookie);
            return;
        }

        res.render('newplayer', {game: game.name, has_error: false});
    });
});

/**
 * The form to join a game was POSTed. Check the inputs, create unser in the database and redirect to the game or render
 * the form again and include an error message.
 */
router.post('/:game_name', function (req, res, next) {
    var requested_game = req.params.game_name;
    var requested_player_name = req.body.player_name;

    Game.findOne({name: requested_game}, function (err, game) {
        if (err || !game) {
            res.render('error-404', {error: 'Das angegebene Spiel konnte nicht gefunden werden.'});
            return;
        }

        // If player name is not present or shorter than two characters, render the form again and include a message
        if (!requested_player_name || requested_player_name.length < 2) {
            res.render('newplayer', {
                game: game.name,
                has_error: true,
                error: 'Der Spielername muss mindestens zwei Zeichen lang sein.'
            });
            return;
        }

        var new_player = Player({
            name: requested_player_name,
            word_permutation: fisher_yates_shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
            score_matrix: '0000000000000000'
        });

        new_player.save(function (err, player) {
            if (err || !player) {
                res.send('Interner Serverfehler');
                return;
            }

            game.players.push(player._id);
            game.save();

            // Set cookie with user id to get back to the saved game
            res.cookie(encodeURIComponent('bingo-' + game.name), String(new_player._id));

            // The encoding is necessary to allow for emojis in the urls. Altough the url is actually urlencoded, the
            // Browser will still render the emojis.
            res.redirect('/game/' + encodeURIComponent(game.name) + '/' + player._id);
        });
    });
});

/**
 * Render the game board for a specific user. If the given url does not correspond to a player entry in the database,
 * the user is shown a 404 error.
 */
router.get('/:game_name/:user_id', function (req, res, next) {

    var game_name = req.params.game_name;
    var user_id = req.params.user_id;

    Game.findOne({name: game_name}, function (err, game) {
        if (err || !game) {
            res.render('error-404', {error: 'Spiel ' + game_name + ' nicht gefunden.'});
            return;
        }

        Player.findById(user_id, function (err, player) {
            if (err || !player) {
                res.render('error-404', {error: 'Spieler ' + player + ' nicht gefunden.'});
                return;
            }

            res.render('game', {
                game: game,
                player: player
            });
        });
    });
});

module.exports = router;