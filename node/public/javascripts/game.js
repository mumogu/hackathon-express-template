var socket = io();
var click_sound = new Audio('/sounds/pop_drip.wav');
var bingo_sound_1 = new Audio('/sounds/thats-a-bingo.mp3');
var bingo_sound_2 = new Audio('/sounds/male-voice-bingo.mp3');

function get_num_bingos_from_string(matrix_string) {

    // Input String is parsed as integer to allow binary comparison
    var matrix_int = parseInt(matrix_string, 2);
    var num_bingos = 0;

    // This array stores a list of correct score_matrix values to be
    // used as binary masks. Strings need to be parsed as integers
    // and after that compared with matrix_int via binary and.
    //
    // Two separate maps are used in order to not repeat the parse()
    // call.
    [
        // Rows
        '1111000000000000',
        '0000111100000000',
        '0000000011110000',
        '0000000000001111',
        // Columns
        '1000100010001000',
        '0100010001000100',
        '0010001000100010',
        '0001000100010001',
        // Diagonals
        '1000010000100001',
        '0001001001001000'
    ].map(function(mask_string) {
        return parseInt(mask_string, 2);
    }).map(function(mask_int) {
        if((matrix_int & mask_int) == mask_int)
            num_bingos++;
    });

    return num_bingos;
}

function play_random_bingo_sound() {

    var sounds = [
        bingo_sound_1,
        bingo_sound_2
    ];

    sounds[Math.floor(Math.random() * sounds.length)].play();
}

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
    $('div.square-table-cell').each(function (i) {

        $(this).html(words[permutation[i]]);

        if (score_matrix[i] == '0' && $(this).hasClass('crossout')) {
            $(this).parent().parent().parent().removeClass('crossout');
        }
        if (score_matrix[i] == '1' && !$(this).hasClass('crossout')) {
            $(this).parent().parent().parent().addClass('crossout');
        }
    });
});

socket.on('status_update', function (data) {

    active_players = data.active_players;

    $('ul#player-list').empty();
    $('ul#inactive-player-list').empty();

    active_players.forEach(function (player) {

        if (player.is_online) {
            // check if player has bingo and react accordingly
            var bingos = get_num_bingos_from_string(player.score_matrix);

            $('ul#player-list').append(
                '<li><b>' +
                player.player_name +
                '</b> (' +
                player.num_hits +
                ' Treffer, ' +
                (player.is_online ? '<span style="color: green;">online</span>)' : '<span style="color: red;">offline</span>)') +
                (bingos ? ' <span class="glyphicon glyphicon-thumbs-up"></span>' +
                ( bingos > 1 ? ' x' + bingos : '' ) : '') +
                '</li>');
        } else {
            $('ul#inactive-player-list').append(
                '<li><b>' +
                player.player_name +
                '</b> (' +
                player.num_hits +
                ' Treffer, ' +
                (player.is_online ? '<span style="color: green;">online</span>)' : '<span style="color: red;">offline</span>)') +
                '</li>');
        }
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
    $('div.square').click(function () {
        var score_matrix = getScoreMatrix();
        last_score = get_num_bingos_from_string(score_matrix);

        $(this).toggleClass('crossout');

        var current_score_matrix = getScoreMatrix();
        var current_score = get_num_bingos_from_string(current_score_matrix);
        socket.emit('score_update', current_score_matrix);

        if(current_score > last_score)
            play_random_bingo_sound();
        //else
        //    click_sound.play();
    });
});

