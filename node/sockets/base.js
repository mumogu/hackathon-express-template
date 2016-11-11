module.exports = function (io) {

    function sendGameDataToClient(game, player, socket) {
        socket.emit('game_update', {
            game: game,
            player: player
        });
    }

    function sendStatusUpdateToAllPlayers(game, player, is_online) {

        // Remove player from Game entry if already exists
        game.active_players = game.active_players.filter(function(element){
            return element.player_id != String(player._id);
        });

        // Update active player list in DB
        game.active_players.push({
            player_name: player.name,
            player_id: String(player._id),
            is_online: is_online
        });
        game.save();

        // Send update to all connected clients (all games)
        io.emit('status_update', game.active_players);
    }

    // Load models
    var Game = require('../models/game');
    var Player = require('../models/player');

    io.on('connection', function(socket) {
        console.log('A client connected');

        var game_name = undefined;
        var player_id = undefined;

        // When a client loads a game board, it sends an init message containing the game- and player ids parsed from
        // the pages url
        socket.on('init', function(data) {
            game_name = data.game_name;
            player_id = data.player_id;

            console.log('Client sent init message: ' + player_id + ' on game ' + game_name);

            // Lookup if the specified game and player exist in the database
            Game.findOne({ name: game_name}, function(err, game) {
                if(err || !game) {
                    console.log('init: Requested game does not exists in the database');
                    return;
                }
                else {
                    // Look up requested player in the database
                    Player.findById(player_id, function(err, player) {
                        if(err || !player)
                            console.log('Requested player does not exists in the database');
                        else {
                            console.log('Found requested game and player in the database');

                            // Now send game data to client
                            sendGameDataToClient(game, player, socket);

                            sendStatusUpdateToAllPlayers(game, player, true);

                            console.log(game.active_players);
                        }
                    });
                }
            });
        });

        socket.on('score_update', function(data) {
            if(!game_name || !player_id) {
               console.log('Error. score_update received, but socket was not initialized');
               return;
            }
            console.log('score_update from player ' + player_id + ': ' + data);

            Player.findById(player_id, function(err, player) {
               if(err || !player) {
                   console.log('score_update: cannot find player in database. Aborting.');
                   return;
               }

               player.score_matrix = data;
               player.save();
            });

        });

        socket.on('disconnect', function() {
            console.log('A player disconnected');

            if(!player_id) {
                console.log('disconnect: player_id was not set. Aborting');
                return;
            }

            if(!game_name) {
                console.log('disconnect: game_name was not set. Aborting');
                return;
            }

            Game.findOne({ name: game_name}, function(err, game) {
               if(err || !game) {
                   console.log('disconnect: cannot find game in database. Aborting.');
                   return;
               }

               Player.findById(player_id, function(err, player) {
                   if(err || !player) {
                       console.log('disconnect: cannot find player. Aborting');
                       return;
                   }

                   sendStatusUpdateToAllPlayers(game, player, false);
               })

            });


        });
    });
};