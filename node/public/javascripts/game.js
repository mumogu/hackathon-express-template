var socket = io();
var click_sound = new Audio('/sounds/pop_drip.wav')
var bingo_sound_1 = new Audio('/sounds/thats-a-bingo.mp3')

function get_num_bingos_from_string(matrix_string) {

    // This array stores a list of correct score_matrix values to be used
    // as binary masks
    var correct_strings = [
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
    ];

    // Now convert these strings to integers
    var correct_ints = correct_strings.map(function(mask_string) {
        return parseInt(mask_string, 2);
    });

    // Parse input string as integer
    var matrix_int = parseInt(matrix_string, 2);

    // Loop over correct masks and count number of bingos
    var num_bingos = 0;
    for(var i=0; i<correct_ints.length; i++) {
        var mask = parseInt((correct_strings[i]),2 );
        console.log('comparing ' + Number(matrix_int, 2).toString(2) + ' to ' + mask.toString(2));



        if((matrix_int & (correct_ints[i])) == (correct_ints[i]))
            num_bingos++;
    }

    for(var j=0; j<correct_ints.length; j++) {
        console.log(typeof(correct_ints[j]));
    }

    //var bingo_bool = (matrix_int & mask_int) == mask_int

    //console.log(Number(matrix_int & mask_int).toString(2));
    console.log(num_bingos);


    return false;
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
            if(get_num_bingos_from_string(player.score_matrix)) {
                console.log('BINGO!');
            }

            $('ul#player-list').append(
                '<li><b>' +
                player.player_name +
                '</b> (' +
                player.num_hits +
                ' Treffer, ' +
                (player.is_online ? '<span style="color: green;">online</span>)' : '<span style="color: red;">offline</span>)') +
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

    // Toogle the crossout animation locally and send a notification to the server, that the cell was crossed out.
    $('div.square').click(function () {
        $(this).toggleClass('crossout');
        socket.emit('score_update', getScoreMatrix());
        click_sound.play();

    });
});

