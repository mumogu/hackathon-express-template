var express = require('express');
var router = express.Router();

// Load models
var Game = require('../models/game');
var Player = require('../models/player');

// Get all Games and list them
router.get('/', function(req, res, next) {

    Game.find({}, function(err, games) {
        if(err || !games.length)
            res.render('games_list', { 'games': [] });
        else
            res.render('games_list', { 'games': games });
    });
});

// Get a specific game
router.get('/:game_name', function(req, res, next) {

    var requested_game = req.params.game_name;

    Game.findOne({ name: requested_game}, function(err, game) {
       if(err || !game)
           res.send('Fehler. Spiel nicht gefunden: ' + requested_game);
       else {
           res.send(game);
       }
    });
});

// Display a specific users view of the game
router.get('/:game_name/:user_id', function(req, res, next) {

    var game_name = req.params.game_name;
    var user_id = req.params.user_id;

    Game.findOne({ name: game_name}, function(err, game) {
        if(err || !game)
            res.send('Fehler. Spiel nicht gefunden: ' + game_name);
        else {

            Player.findById(user_id, function(err, player) {
               if(err || !player)
                   res.send('Fehler. Benutzer nicht gefunden: ' + player);
                else {
                   res.render('game', {
                       game: game,
                       player: player
                   });
               }
            });
        }
    });
});
module.exports = router;