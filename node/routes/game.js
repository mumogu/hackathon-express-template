var express = require('express');
var router = express.Router();

// Load models
var Game = require('../models/game');
var Player = require('../models/player');

//
// Fisher-Yates-Algorithm to shuffle an array
//
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

//
// Get all Games and list them
//
router.get('/', function (req, res, next) {

    Game.find({}, function (err, games) {
        if (err || !games.length)
            res.render('games_list', {'games': []});
        else
            res.render('games_list', {'games': games});
    });
});

router.get('/create', function (req, res, next) {
    res.render('newgame', {});
});

router.post('/create', function (req, res, next) {
    var game_name = req.body.name;
    var game_words = req.body.words.split('\r\n').filter(function (w) {
        if (w == '')
            return false;
        return true;
    });

    console.log(game_words);

    if (game_name.length < 2 || game_name.indexOf(' ') >= 0 || game_words.length < 16) {
        res.render('newgame', {
            has_error: true,
            error: 'Fehler.',
            name: game_name,
            words: req.body.words
        });
        return;
    } else {
        Game({
            name: game_name,
            words: game_words,
            players: [],
            active_players: []
        }).save(function(err, game) {
            res.redirect('/game/' + game_name);
        });
    }

});

//
// Get a specific game
//
    router.get('/:game_name', function (req, res, next) {

        var requested_game = req.params.game_name;

        Game.findOne({name: requested_game}, function (err, game) {
            if (err || !game) {
                res.send('GET: /game_name: Fehler. Spiel nicht gefunden: ' + requested_game);
                return;
            }

            console.log('cookies: ');
            console.log(req.cookies);
            console.log(decodeURIComponent('bingo Startup'));
            console.log(encodeURIComponent('bingo Startup'));

            var url_cookie = req.cookies[encodeURIComponent('bingo-' + game.name)];

            if(url_cookie) {
                res.redirect('/game/' + encodeURIComponent(game.name) + '/' + url_cookie);
                return;
            }

            res.render('newplayer', {game: game.name, has_error: false});
        });
    });

    router.post('/:game_name', function (req, res, next) {
        var requested_game = req.params.game_name;
        var requested_player_name = req.body.player_name;

        Game.findOne({name: requested_game}, function (err, game) {
            if (err || !game) {
                res.send('POST to /game_name:  Spiel nicht gefunden: ' + requested_game);
                return;
            }

            if (!requested_player_name || requested_player_name.length < 2) {
                res.render('newplayer', {
                    game: game.name,
                    has_error: true,
                    error: 'Der Spielername muss mindestens zwei Zeichen lang sein.'
                });
            }
            else {
                var new_player = Player({
                    name: requested_player_name,
                    word_permutation: fisher_yates_shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
                    score_matrix: '0000000000000000'
                });

                new_player.save(function (err, player) {
                    if (err || !player) {
                        res.send('Fehler.');
                    }

                    game.players.push(player._id);
                    game.save();

                    // Set cookie with user id
                    res.cookie(encodeURIComponent('bingo-' + game.name), String(new_player._id));

                    res.redirect('/game/' + encodeURIComponent(game.name) + '/' + player._id);
                });
            }

        });
    })


//
// Display a specific users view of the game
//
    router.get('/:game_name/:user_id', function (req, res, next) {

        var game_name = req.params.game_name;
        var user_id = req.params.user_id;

        console.log(game_name);
        console.log(user_id);

        // This won't be necessary in a bit. This will be loaded via sockets.
        Game.findOne({name: game_name}, function (err, game) {
            if (err || !game)
                res.send('Fehler. Spiel nicht gefunden: ' + game_name);
            else {

                Player.findById(user_id, function (err, player) {
                    if (err || !player)
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