// ==UserScript==
// @name            Better Stats on Profile Page
// @description     • Displays your Win % to 2 decimal places
//                  • Power-ups stats can be shown as "per game" (using the checkbox)
// @version    	    0.1.2
// @include         http://tagpro-*.koalabeast.com/profile/*
// @updateURL       https://gist.github.com/nabbynz/51050e6f43791cc3c5eb/raw/TagPro_BetterProfilePageStats.user.js
// @downloadURL     https://gist.github.com/nabbynz/51050e6f43791cc3c5eb/raw/TagPro_BetterProfilePageStats.user.js
// @license         none
// @author          nabby
// ==/UserScript==

String.prototype.toSeconds = function () {
    var a = this.split(':');
    return ((+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2])).toString(); 
};

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor(sec_num % 3600 / 60);
    var seconds = Math.floor(sec_num % 3600 % 60);

    if (hours   < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;
    return hours + ':' + minutes + ':' + seconds;
};



$(document).ready(function() {
    $('table').eq(0).before('<div style="float:right"><label><input type="checkbox" id="showPerGameStats" ' + (localStorage.getItem('PerGameStats') === 'true' ? 'checked' : '') + '>Show "Per Game" Stats</label></div>');
    
    var games = 0,
        row = 0,
        col = 0,
        WTLD = 0, //Wins Ties Losses DCs
        tempvalue = '';

    //=================================================================
    //Rolling 300 Stats...
    //=================================================================
    $('table').eq(0).prop('id', 'Stats300'); //give the table an id :)
    for (row=2; row<=4; row++) {
        //$('#Stats300 tr:eq('+row+') > td:eq(6)').text($('#Stats300 tr:eq('+row+') > td:eq(6)').text().toHHMMSS());
        WTLD = ( parseInt($('#Stats300 tr:eq('+row+') > td:eq(2)').text()) + parseInt($('#Stats300 tr:eq('+row+') > td:eq(3)').text()) + parseInt($('#Stats300 tr:eq('+row+') > td:eq(4)').text()) + parseInt($('#Stats300 tr:eq('+row+') > td:eq(6)').text()) );
        $('#Stats300 tr:eq('+row+') > td:eq(9)').text( (WTLD > 0 ? (parseInt($('#Stats300 tr:eq('+row+') > td:eq(2)').text()) / WTLD * 100).toFixed(2) : '0.00') );
    }
    $('#Stats300 tr:eq(2) > td:eq(9)').css('color','#0f0'); //Make the Rolling 300 Win % stand out a bit more


    //=================================================================
    //Rolling 300 PowerUp Table...
    //=================================================================
    $('table').eq(1).prop('id', 'PUP300'); //give the table an id :)
    //add "per game" stats...
    for (row=2; row<=4; row++) {
        games = $('#Stats300 tr:eq('+row+') > td:eq(1)').text();
        for (col=0; col<=8; col++) {
            tempvalue = $('#PUP300 tr:eq('+row+') > td:eq('+col+')').text();
            if ((col == 4) || (col == 6)) {
                tempvalue = $('#PUP300 tr:eq('+row+') > td:eq('+col+')').text().toSeconds();
            }
            $('#PUP300 tr:eq('+row+') > td:eq('+col+')').text('');
            if (games != '0') {
                $('#PUP300 tr:eq('+row+') > td:eq('+col+')').append('<span class="normal">' + tempvalue + '</span>');
                $('#PUP300 tr:eq('+row+') > td:eq('+col+')').append('<span class="pergame">' + (tempvalue / games).toFixed(2) + '</span>');
            } else {
                $('#PUP300 tr:eq('+row+') > td:eq('+col+')').append('<span class="normal">0</span>');
                $('#PUP300 tr:eq('+row+') > td:eq('+col+')').append('<span class="pergame">0</span>');
            }
            if ((col == 4) || (col == 6)) {
                $('#PUP300 tr:eq('+row+') > td:eq('+col+')').find('.normal').text($('#PUP300 tr:eq('+row+') > td:eq('+col+')').find('.normal').text().toHHMMSS());
                $('#PUP300 tr:eq('+row+') > td:eq('+col+')').find('.pergame').text($('#PUP300 tr:eq('+row+') > td:eq('+col+')').find('.pergame').text().toHHMMSS());
            }
        }
    }

    
    //=================================================================
    //Daily/Weekly/Monthly Stats...
    //=================================================================
    $('table').eq(2).prop('id', 'StatsDWM'); //give the table an id :)
    for (row=1; row<=4; row++) {
        //$('#StatsDWM tr:eq('+row+') > td:eq(6)').text($('#StatsDWM tr:eq('+row+') > td:eq(6)').text().toHHMMSS());
        WTLD = ( parseInt($('#StatsDWM tr:eq('+row+') > td:eq(2)').text()) + parseInt($('#StatsDWM tr:eq('+row+') > td:eq(3)').text()) + parseInt($('#StatsDWM tr:eq('+row+') > td:eq(4)').text()) + parseInt($('#StatsDWM tr:eq('+row+') > td:eq(6)').text()) );
        $('#StatsDWM tr:eq('+row+') > td:eq(9)').text( (WTLD > 0 ? (parseInt($('#StatsDWM tr:eq('+row+') > td:eq(2)').text()) / WTLD * 100).toFixed(2) : '0.00') );
    }

    
    //=================================================================
    //Daily/Weekly/Monthly PowerUp Table...
    //=================================================================
    $('table').eq(3).prop('id', 'PUPDWM'); //give the table an id :)
    //add "per game" stats..
    for (row=1; row<=4; row++) {
        games = $('#StatsDWM tr:eq('+row+') > td:eq(1)').text();
        for (col=0; col<=8; col++) {
            tempvalue = $('#PUPDWM tr:eq('+row+') > td:eq('+col+')').text();
            if ((col == 4) || (col == 6)) {
                tempvalue = $('#PUPDWM tr:eq('+row+') > td:eq('+col+')').text().toSeconds();
            }
            $('#PUPDWM tr:eq('+row+') > td:eq('+col+')').text('');
            if (games != '0') {
                $('#PUPDWM tr:eq('+row+') > td:eq('+col+')').append('<span class="normal">' + tempvalue + '</span>');
                $('#PUPDWM tr:eq('+row+') > td:eq('+col+')').append('<span class="pergame">' + (tempvalue / games).toFixed(2) + '</span>');
            } else {
                $('#PUPDWM tr:eq('+row+') > td:eq('+col+')').append('<span class="normal">0</span>');
                $('#PUPDWM tr:eq('+row+') > td:eq('+col+')').append('<span class="pergame">0</span>');
            }
            if ((col == 4) || (col == 6)) {
                $('#PUPDWM tr:eq('+row+') > td:eq('+col+')').find('.normal').text($('#PUPDWM tr:eq('+row+') > td:eq('+col+')').find('.normal').text().toHHMMSS());
                $('#PUPDWM tr:eq('+row+') > td:eq('+col+')').find('.pergame').text($('#PUPDWM tr:eq('+row+') > td:eq('+col+')').find('.pergame').text().toHHMMSS());
            }
        }
    }

    //show the default...
    if (localStorage.getItem('PerGameStats') == 'true') {
        $('#PUPDWM span.normal').hide(0);
        $('#PUPDWM span.pergame').show(0);
        $('#PUP300 span.normal').hide(0);
        $('#PUP300 span.pergame').show(0);
    } else {
        $('#PUPDWM span.normal').show(0);
        $('#PUPDWM span.pergame').hide(0);
        $('#PUP300 span.normal').show(0);
        $('#PUP300 span.pergame').hide(0);
    }
    
    //attach the event...
    $('#showPerGameStats').on('click', function() {
        if ($(this).is(':checked')) {
            localStorage.setItem('PerGameStats', 'true');
            $('#PUPDWM span.normal').hide(0);
            $('#PUPDWM span.pergame').show(0);
            $('#PUP300 span.normal').hide(0);
            $('#PUP300 span.pergame').show(0);
        } else {
            localStorage.setItem('PerGameStats', 'false');
            $('#PUPDWM span.normal').show(0);
            $('#PUPDWM span.pergame').hide(0);
            $('#PUP300 span.normal').show(0);
            $('#PUP300 span.pergame').hide(0);
        }
    });


});