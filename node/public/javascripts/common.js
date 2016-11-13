$(document).ready(function(){
    var path = window.location.pathname.split('/');
    console.log(path);

    if(path.length == 2 && path[1] == 'game')
        $('#nav-games').addClass('active');
    if(path.length == 3 && path[2] == 'create')
        $('#nav-new').addClass('active');
});