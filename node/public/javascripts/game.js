var socket = io();

socket.on('connect', function (s) {

    // Parse game name and user id from current URL
    var path = window.location.pathname.split('/');
    var player_id = path[path.length - 1];
    var game_name = path[path.length - 2];

    console.log('Server connection established');
    console.log('Sending init message to server...');

    // Request details of the game board from server
    socket.emit('init', {
        player_id: player_id,
        game_name: game_name
    });
});

// Server sends an update to the game board (words, crossout state, etc...). This is then rendered to the dom
socket.on('game_update', function (data) {

    console.log('Received: game_update');

    var words = data.game.words;
    var permutation = data.player.word_permutation;
    var score_matrix = data.player.score_matrix.split('');

    // Render the words into the table. The permutation array at position i specifies the index of the word in the words
    // array to be rendered.
    // Also mark some cells as crossed out according to the data sent from the server.
    //$('#game-table td').each(function (i) {
    $('div.square-table-cell').each(function (i) {

        //console.log($(this).children().css('class', 'square-table-cell'));
        $(this).html(words[permutation[i]]);

        if (score_matrix[i] == '0' && $(this).hasClass('crossout')) {
            $(this).removeClass('crossout');
        }
        if (score_matrix[i] == '1' && !$(this).hasClass('crossout')) {
            $(this).addClass('crossout');
        }
    });
});

socket.on('status_update', function (data) {
    active_players = data.active_players;

    $('ul#player-list').empty();

    active_players.forEach(function (player) {
        $('ul#player-list').append('<li>' + player.player_name + ' (' + player.num_hits + ' Treffer) ' + (player.is_online ? '(online)' : '(offline)') + '</li>');
    });
});

function getScoreMatrix() {
    var ret = '';
    $('div.square').each(function (i) {
        if ($(this).hasClass('crossout'))
            ret += '1'
        else
            ret += '0'
    });
    return ret;
}

// UI-triggered functions
$(document).ready(function () {

    // Toogle the crossout animation locally and send a notification to the server, that the cell was crossed out.
    $('div.square').click(function () {
        $(this).toggleClass('crossout');
        socket.emit('score_update', getScoreMatrix());
    });
});

