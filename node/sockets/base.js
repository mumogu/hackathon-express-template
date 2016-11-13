module.exports = function (io) {

    function sendStatusUpdateToAllPlayers(game, player, is_online) {

        // Remove player from Game entry if already exists
        game.active_players = game.active_players.filter(function (element) {
            return element.player_id != String(player._id);
        });

        // Update active player list in DB
        game.active_players.push({
            player_name: player.name,
            player_id: String(player._id),
            is_online: is_online,
            num_hits: player.score_matrix.split('1').length - 1,
            score_matrix: player.score_matrix
        });
        game.save();

        // Send update to all connected clients (all games)
        io.emit('status_update', {
            game_id: String(game._id),
            game_name: game.name,
            active_players: game.active_players,
            player_id: String(player._id)
        });
    }

    // Load models
    var Game = require('../models/game');
    var Player = require('../models/player');

    // A new user connects
    io.on('connection', function (socket) {
        console.log('A client connected');

        var game_name = undefined;
        var player_id = undefined;

        // When a client loads a game board, it sends an init message containing the game- and player ids parsed from
        // the pages url
        socket.on('init', function (data) {
            game_name = data.game_name;
            player_id = data.player_id;

            console.log('Client sent init message: ' + player_id + ' on game ' + game_name);

            // Lookup if the specified game and player exist in the database
            Game.findOne({name: game_name}, function (err, game) {
                if (err || !game) {
                    console.log('init: Requested game does not exists in the database');
                    return;
                }
                else {
                    // Look up requested player in the database
                    Player.findById(player_id, function (err, player) {
                        if (err || !player)
                            console.log('Requested player does not exists in the database');
                        else {
                            // Send game data to client
                            socket.emit('game_update', {
                                game: game,
                                player: player
                            });

                            // Notify all players about the new player
                            sendStatusUpdateToAllPlayers(game, player, true);
                        }
                    });
                }
            });
        });

        socket.on('score_update', function (data) {
            if (!game_name || !player_id) {
                console.log('Error. score_update received, but socket was not initialized');
                return;
            }
            console.log('score_update from player ' + player_id + ': ' + data);

            Player.findById(player_id, function (err, player) {
                if (err || !player) {
                    console.log('score_update: cannot find player in database. Aborting.');
                    return;
                }

                player.score_matrix = data;
                player.save();

                Game.findOne({ name: game_name }, function(err, game) {
                    if(err || !game) {
                        console.log('score_update: game not found. Aborting');
                        return;
                    }

                    // Notify all players about the changes score
                    sendStatusUpdateToAllPlayers(game, player, true);

                });
            });
        });

        socket.on('disconnect', function () {
            console.log('A player disconnected');

            if (!player_id || !game_name) {
                console.log('disconnect: player_id or game_name was not set. Aborting');
                return;
            }

            // Get game, player and send updated online status to all connected clients
            Game.findOne({name: game_name}, function (err, game) {
                if (err || !game) {
                    console.log('disconnect: cannot find game in database. Aborting.');
                    return;
                }

                Player.findById(player_id, function (err, player) {
                    if (err || !player) {
                        console.log('disconnect: cannot find player. Aborting');
                        return;
                    }

                    sendStatusUpdateToAllPlayers(game, player, false);
                })
            });
        });
    });
};