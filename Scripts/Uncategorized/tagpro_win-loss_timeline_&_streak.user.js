// ==UserScript==
// @name            Win/Loss Timeline & Streak
// @description     Shows a Win/Loss Timeline & Streak on the "server" and "joining" pages.
// @version         0.5.0
// @include         http://*.koalabeast.com*
// @include         http://*koalabeast.com/games/find*
// @grant           GM_setValue
// @grant           GM_getValue
// @license         GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author          nabby
// ==/UserScript==

 
//==================================
//  OPTIONS...
//----------------------------------
var ShowWinLossTimeline     = true;      // Show the "W/L Timeline" on the server & joining pages.
var ShowWinLossStreak       = true;      // Show Win % and Best/Current streaks on the server & joining pages.
var MaxGames                = 50;        // Maximum number of games to save data from (default=32).
var ShowWinStreakMessage    = true;      // Show "You are currently on your best ever win streak!" type messages.
var ShowLossStreakMessage   = true;      // Show "You are currently on your worst ever losing streak" type messages.
var Win_Color               = '#22dd22'; // Color for a "Win" in Win/Loss Timeline (default (green): '#22dd22')
var Loss_Color              = '#ee2020'; // Color for a "Loss" in Win/Loss Timeline (default (red): '#ee2020')
var Tie_Color               = '#e2e211'; // Color for a "Tie" in Win/Loss Timeline (default (yellow): '#e2e211')
var Other_Color             = '#aaaaaa'; // Color for "Other" in Win/Loss Timeline (default (grey): '#aaaaaa')
//==================================


var PageLoc = WhichPageAreWeOn();
function WhichPageAreWeOn(){
    if ($('#play').length) {                  //"Play Now" / Chosen Server Page
        return('server');
    } else if ($('#message').length) {        //"Joining Game" page
        return('joining');
    } else if ($('#showSettings').length) {   //"Profile" page
        return('profile');
    } else if ($('canvas#viewport').length) {   //In a real game
        return('ingame');
    } else if ((document.URL == 'http://tagpro.koalabeast.com/') || (document.URL == 'http://tagpro.gg/')) {   //Home / Choose Server Page
        return('home');
    }
}


function convertOldData() {
    var WLT_Data_Old = [];
    var WLT_Data_New = [];
    
    if (jQuery.type(GM_getValue('WLT')) === 'string') {
        GM_setValue('WLT', GM_getValue('WLT').split(''));
    }

    if (jQuery.type(GM_getValue('WLT')) === 'array') {
        if (jQuery.type(GM_getValue('WLT')[0]) === 'string') {
            WLT_Data_Old = GM_getValue('WLT');
            for (i = 0; i < WLT_Data_Old.length; i++) {
                WLT_Data_New.push({result:WLT_Data_Old[i], score:'', date:'', map:'', blueredplayercount:'', fullgamelength:'', playedgamelength:'', playedgametime:''});
            }
            GM_setValue('WLT', WLT_Data_New);
        }
    }
}


function load_WLT_Data() {
    var Timeline_MaxWidth = 640; //default=640
    var Cell_Width = 18;         //This value will adjust (smaller) according to MaxGames & Timline_MaxWidth. Default=18
    var WLT_Data = [];
    var WLT_Title = '';
    var total_wins = 0;
    var total_losses = 0;
    var win_streak = 0;
    var loss_streak = 0;
    var temp_win_streak = 0;
    var temp_loss_streak = 0;
    var last_win_streak = 0;
    var last_loss_streak = 0;

    // Convert saved data from earlier versions (if it exists)...
    if ( (GM_getValue('WLT') !== 'undefined') && (GM_getValue('WLT') != undefined) ) {
        convertOldData();
    }

    if (PageLoc == 'server') {                //"Play Now" server page
        $('#play').parent().next().after('<div id="WLT" style="margin: 0 auto; padding:15px 0 0; text-align:center; white-space:nowrap;"></div>');
    } else if (PageLoc == 'joining') {        //"Joining Game" page
        $('#message').after('<div id="WLT" style="margin: 0 auto; padding:15px 0 0; text-align:center; white-space:nowrap;"></div>');
    } else if (PageLoc == 'profile') {        //"Profile" page
        $('#showSettings').parent().prev().before('<div id="WLT" style="margin: 0 auto; padding:10px 0 30px; text-align:center; white-space:nowrap;"></div>');
    }
                                     
    if ( (GM_getValue('WLT') === 'undefined') || (GM_getValue('WLT') == undefined) ) GM_setValue('WLT', '');
    WLT_Data = GM_getValue('WLT');
    
    if ((WLT_Data.length > MaxGames) && (MaxGames > 0)) {
        while (WLT_Data.length > MaxGames) {
            WLT_Data.shift();
        }
        GM_setValue('WLT', WLT_Data);
        WLT_Data = GM_getValue('WLT');
    }
    
    var New_Cell_Width = Math.floor(Timeline_MaxWidth / WLT_Data.length);
    if (New_Cell_Width < Cell_Width) Cell_Width = New_Cell_Width - 1;
    if (Cell_Width <= 0) Cell_Width = 1;

    for (i = 0; i < WLT_Data.length; i++) {
        switch (WLT_Data[i].result) {
            case 'W':
                if (ShowWinLossTimeline) {
                    WLT_Title = 'Win';
                    WLT_Title += (WLT_Data[i].score ? ' (' + WLT_Data[i].score.substr(0,1) + '-' + WLT_Data[i].score.substr(1,1) + ')' : '');
                    WLT_Title += (WLT_Data[i].map ? ' on ' + WLT_Data[i].map : '');
                    WLT_Title += (WLT_Data[i].blueredplayercount ? ' (' + WLT_Data[i].blueredplayercount.substr(0,1) + ' vs ' + WLT_Data[i].blueredplayercount.substr(1,1) + ')' : '');
                    WLT_Title += (WLT_Data[i].date ? '\n' + new Date(parseInt(WLT_Data[i].date)).toDateString() + ' (' + new Date(parseInt(WLT_Data[i].date)).toLocaleTimeString() + ')' : '');
                    if (WLT_Data[i].fullgamelength && WLT_Data[i].playedgamelength) {
                        WLT_Title += (WLT_Data[i].fullgamelength ? '\n[Game lasted ' + secondsToHMS(WLT_Data[i].fullgamelength) : '');
                        if (WLT_Data[i].playedgametime < 100) {
                            WLT_Title += ' and you played ' + secondsToHMS(WLT_Data[i].playedgamelength) + ' of it (' + WLT_Data[i].playedgametime + '%)';
                        } else {
                            WLT_Title += ' and you played ' + WLT_Data[i].playedgametime + '% of it';
                        }
                        WLT_Title += ']';
                    }
                    $('#WLT').append('<div class="wlt_win" title="' + WLT_Title + '"></div>');
                }
                total_wins++;
                if ( (temp_win_streak == 0) || ((i > 0) && (WLT_Data[i-1].result == 'W')) ) temp_win_streak++;
                if (temp_win_streak > win_streak) win_streak = temp_win_streak;
                temp_loss_streak = 0;
                if (temp_win_streak > 0) last_win_streak = temp_win_streak;
                break;
                
            case 'L':
                if (ShowWinLossTimeline) {
                    WLT_Title = 'Loss';
                    WLT_Title += (WLT_Data[i].score ? ' (' + WLT_Data[i].score.substr(0,1) + '-' + WLT_Data[i].score.substr(1,1) + ')' : '');
                    WLT_Title += (WLT_Data[i].map ? ' on ' + WLT_Data[i].map : '');
                    WLT_Title += (WLT_Data[i].blueredplayercount ? ' (' + WLT_Data[i].blueredplayercount.substr(0,1) + ' vs ' + WLT_Data[i].blueredplayercount.substr(1,1) + ')' : '');
                    WLT_Title += (WLT_Data[i].date ? '\n' + new Date(parseInt(WLT_Data[i].date)).toDateString() + ' (' + new Date(parseInt(WLT_Data[i].date)).toLocaleTimeString() + ')' : '');
                    if (WLT_Data[i].fullgamelength && WLT_Data[i].playedgamelength) {
                        WLT_Title += (WLT_Data[i].fullgamelength ? '\n[Game lasted ' + secondsToHMS(WLT_Data[i].fullgamelength) : '');
                        if (WLT_Data[i].playedgametime < 100) {
                            WLT_Title += ' and you played ' + secondsToHMS(WLT_Data[i].playedgamelength) + ' of it (' + WLT_Data[i].playedgametime + '%)';
                        } else {
                            WLT_Title += ' and you played ' + WLT_Data[i].playedgametime + '% of it';
                        }
                        WLT_Title += ']';
                    }
                    $('#WLT').append('<div class="wlt_loss" title="' + WLT_Title + '"></div>');
                }
                total_losses++;
                if ( (temp_loss_streak == 0) || ((i > 0) && (WLT_Data[i-1].result == 'L')) ) temp_loss_streak++;
                if (temp_loss_streak > loss_streak) loss_streak = temp_loss_streak;
                temp_win_streak = 0;
                if (temp_loss_streak > 0) last_loss_streak = temp_loss_streak;
                break;
                
            case 'T':
                if (ShowWinLossTimeline) {
                    WLT_Title = 'Tie';
                    WLT_Title += (WLT_Data[i].score ? ' (' + WLT_Data[i].score.substr(0,1) + '-' + WLT_Data[i].score.substr(1) + ')' : '');
                    WLT_Title += (WLT_Data[i].map ? ' on ' + WLT_Data[i].map : '');
                    WLT_Title += (WLT_Data[i].blueredplayercount ? ' (' + WLT_Data[i].blueredplayercount.substr(0,1) + ' vs ' + WLT_Data[i].blueredplayercount.substr(1) + ')' : '');
                    WLT_Title += (WLT_Data[i].date ? '\n' + new Date(parseInt(WLT_Data[i].date)).toDateString() + ' (' + new Date(parseInt(WLT_Data[i].date)).toLocaleTimeString() + ')' : '');
                    if (WLT_Data[i].fullgamelength && WLT_Data[i].playedgamelength) {
                        WLT_Title += (WLT_Data[i].fullgamelength ? '\n[Game lasted ' + secondsToHMS(WLT_Data[i].fullgamelength) : '');
                        if (WLT_Data[i].playedgametime < 100) {
                            WLT_Title += ' and you played ' + secondsToHMS(WLT_Data[i].playedgamelength) + ' of it (' + WLT_Data[i].playedgametime + '%)';
                        } else {
                            WLT_Title += ' and you played ' + WLT_Data[i].playedgametime + '% of it';
                        }
                        WLT_Title += ']';
                    }
                    $('#WLT').append('<div class="wlt_tie" title="' + WLT_Title + '"></div>');
                }
                temp_win_streak = 0;
                temp_loss_streak = 0;
                break;
                
            default:
                //if (ShowWinLossTimeline) $('#WLT').append('<div class="wlt_other" title="Late Join/Refresh/Other?"></div>');
                temp_win_streak = 0;
                temp_loss_streak = 0;
                break;
        }
    }

    if ( (GM_getValue('WLT_BestWinStreak') == 'undefined') || (GM_getValue('WLT_BestWinStreak') == undefined) ) GM_setValue('WLT_BestWinStreak', win_streak);
    if ( (GM_getValue('WLT_BestLossStreak') == 'undefined') || (GM_getValue('WLT_BestLossStreak') == undefined) ) GM_setValue('WLT_BestLossStreak', loss_streak);

    $('.wlt_win').css({'display':'inline-block', 'margin-left':'1px', 'background-color':Win_Color, 'width':Cell_Width+'px', 'height':'10px'});
    $('.wlt_loss').css({'display':'inline-block', 'margin-left':'1px', 'background-color':Loss_Color, 'width':Cell_Width+'px', 'height':'10px'});
    $('.wlt_tie').css({'display':'inline-block', 'margin-left':'1px', 'background-color':Tie_Color, 'width':Cell_Width+'px', 'height':'10px'});
    $('.wlt_other').css({'display':'inline-block', 'margin-left':'1px', 'background-color':Other_Color, 'width':Cell_Width+'px', 'height':'10px'});

    if (ShowWinLossTimeline) {
        if ( jQuery.type(WLT_Data[0]) !== 'undefined' ) {
            $('#WLT').append('<div id="WLT_Reset" style="display:inline-block; font-size:11px; text-align:center; margin-left:10px; height:13px; width:14px; border:2px solid #ff0000; border-radius:8px; cursor:pointer" title="Clear/Reset">X</div>');
            $('#WLT').append('<div id="WLT_Pause" style="display:inline-block; font-size:11px; text-align:center; margin-left:6px; height:13px; min-width:14px; border:2px solid #ed590c; border-radius:8px; cursor:pointer" title=""></div>');
        }
        if (GM_getValue('WLT_Pause') == 'paused') {
            $('#WLT_Pause').html('&nbsp;PAUSED&nbsp;');
            $('#WLT_Pause').attr('title', 'Currently Paused - Press to Resume...');
        } else {
            $('#WLT_Pause').html('ll');
            $('#WLT_Pause').attr('title', 'Currently Saving - Press to Pause...');
        }
    }
 
    $('#WLT_Reset').on('click', function() {
        var msgresult = confirm('Warning! This will clear the current Win/Loss Timeline.\n\nOK to Continue?');
        if (msgresult) {
            GM_setValue('WLT');
            GM_setValue('WLT_Pause');
            GM_setValue('WLT_BestWinStreak');
            GM_setValue('WLT_BestLossStreak');
            $('#WLT').remove();
            $('#WLT_Reset').remove();
            $('#WLT_Pause').remove();
            load_WLT_Data();
        }
    });
 
    $('#WLT_Pause').on('click', function() {
        if (GM_getValue('WLT_Pause') == 'paused') {
            GM_setValue('WLT_Pause', '');
            $('#WLT_Pause').html('ll')
            $('#WLT_Pause').attr('title', 'Currently Saving - Press to Pause...');
        } else {
            GM_setValue('WLT_Pause', 'paused');
            $('#WLT_Pause').html('&nbsp;PAUSED&nbsp;');
            $('#WLT_Pause').attr('title', 'Currently Paused - Press to Resume...');
        }
    });
 
    if (ShowWinLossStreak) {
        if ( jQuery.type(WLT_Data[0]) !== 'undefined' ) {
            if ( (GM_getValue('WLT_BestWinStreak') !== 'undefined') && (GM_getValue('WLT_BestWinStreak') != undefined) && (win_streak > GM_getValue('WLT_BestWinStreak')) ) GM_setValue('WLT_BestWinStreak', win_streak);
            if ( (GM_getValue('WLT_BestLossStreak') !== 'undefined') && (GM_getValue('WLT_BestLossStreak') != undefined) && (loss_streak > GM_getValue('WLT_BestLossStreak')) ) GM_setValue('WLT_BestLossStreak', loss_streak);
 
            $('#WLT').append('<div style="text-align:center; text-shadow:2px 1px 2px #000000">Win % over last ' + WLT_Data.length + ' game' + (WLT_Data.length == 1 ? '' : 's') + ': ' + ((WLT_Data.length > 0) ? total_wins / WLT_Data.length * 100 : 0).toFixed(2) + '%</div>');
            $('#WLT').append('<div style="text-align:center; text-shadow:2px 1px 2px #000000">Best Ever Streak: ' + GM_getValue('WLT_BestWinStreak') + ' Win' + (GM_getValue('WLT_BestWinStreak') == 1 ? '' : 's') + ' / ' + GM_getValue('WLT_BestLossStreak') + ' Loss' + (GM_getValue('WLT_BestLossStreak') == 1 ? '' : 'es') + '</div>');
            if (WLT_Data[WLT_Data.length-1].result == 'W') {
                $('#WLT').append('<div style="text-align:center; text-shadow:2px 1px 2px #000000">Current Streak: ' + last_win_streak + ' Win' + (last_win_streak == 1 ? '' : 's') + '</div>');
            } else if (WLT_Data[WLT_Data.length-1].result == 'L') {
                $('#WLT').append('<div style="text-align:center; text-shadow:2px 1px 2px #000000">Current Streak: ' + last_loss_streak + ' Loss' + (last_loss_streak == 1 ? '' : 'es') + '</div>');
            } else if (WLT_Data[WLT_Data.length-1].result == 'T') {
                $('#WLT').append('<div style="text-align:center; text-shadow:2px 1px 2px #000000">Current Streak: N/A (Tie)</div>');
            }
 
            if (ShowWinStreakMessage) {
                if ( (WLT_Data[WLT_Data.length-1].result == 'W') && (last_win_streak >= GM_getValue('WLT_BestWinStreak')) && (WLT_Data.length > 5) ) {
                    $('#WLT').append('<div style="text-align:center; color:' + Win_Color + '; padding:5px 0 0; text-shadow:2px 1px 2px #000000">You are currently on your best ever win streak!!!</div>');
                } else if ( (WLT_Data[WLT_Data.length-1].result == 'W') && (last_win_streak == GM_getValue('WLT_BestWinStreak') - 1) && (WLT_Data.length > 5) ) {
                    $('#WLT').append('<div style="text-align:center; color:' + Win_Color + '; padding:5px 0 0; text-shadow:2px 1px 2px #000000">You are just <u>1 win away</u> from your <u>best ever</u> win streak!</div>');
                }
            }
            if (ShowLossStreakMessage) {
                if ( (WLT_Data[WLT_Data.length-1].result == 'L') && (last_loss_streak >= GM_getValue('WLT_BestLossStreak'))  && (WLT_Data.length > 5) ) {
                    $('#WLT').append('<div style="text-align:center; color:' + Loss_Color + '; padding:5px 0 0; text-shadow:2px 1px 2px #000000">You are currently on your worst ever losing streak :(</div>');
                } else if ( (WLT_Data[WLT_Data.length-1].result == 'L') && (last_loss_streak == GM_getValue('WLT_BestLossStreak') - 1)  && (WLT_Data.length > 5) ) {
                    $('#WLT').append('<div style="text-align:center; color:' + Loss_Color + '; padding:5px 0 0; text-shadow:2px 1px 2px #000000">You are only <u>1 loss away</u> from your <u>worst ever</u> losing streak!</div>');
                }
            }
        } else {
            $('#WLT').append('<div style="text-align:center; font-style:italic; color:' + Tie_Color + '; padding:5px 0 0; text-shadow:2px 1px 2px #000000">No data for Win/Loss Timeline (go play some games!)</div>');
        }
    }
} //load_WLT_Data()
 

function secondsToHMS(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s);
}
 

$(document).ready(function() {
    load_WLT_Data();
});



var redPlayers = 0;
var bluePlayers = 0;

tagpro.ready(function() {
    if (GM_getValue('WLT_Pause') != 'paused') {
        var WLT_Data = [];
        var joinTime;
        var bluescore = 0;
        var redscore = 0;
        var mapname = '';
 
        if (jQuery.type(GM_getValue('WLT')) === 'array') WLT_Data = GM_getValue('WLT');
 
        tagpro.socket.on('time', function(message) {
            if (tagpro.state == 3) { //before the actual start
                joinTime = new Date().getTime();
            } else if (tagpro.state == 1) { //game has started
                if (joinTime) {
                    joinTime = Date.parse(tagpro.gameEndsAt) - 12 * 60 * 1000; //startTime;
                } else {
                    joinTime = new Date().getTime();
                }
            }
        });
 
        tagpro.socket.on('map', function(data) {
            mapname = data.info.name;
        });
 
        tagpro.socket.on('score', function(data) {
            bluescore = data.b;
            redscore = data.r;
        });
       
        tagpro.socket.on('end', function(data) {
            if (!tagpro.spectator) {
                for (var playerId in tagpro.players) {
                    if (tagpro.players.hasOwnProperty(playerId)) {
                        if (tagpro.players[playerId].team == 1) {
                            redPlayers++;
                        } else {
                            bluePlayers++;
                        }
                    }
                }
 
                var endTime = (new Date).getTime();
                if ( joinTime+30000 < endTime ) {
                    var fullTime = Date.parse(tagpro.gameEndsAt);
                    var startTime = fullTime - 12 * 60 * 1000;
                    var inGameTime = Math.round(100 - (((joinTime - startTime) / (endTime - startTime)) * 100));
 
                    if (data.winner == 'tie') {
                        WLT_Data.push({result:'T', score:bluescore+''+redscore, date:endTime, map:mapname, blueredplayercount:bluePlayers+''+redPlayers, fullgamelength:(endTime-startTime)/1000, playedgamelength:(endTime-joinTime)/1000, playedgametime:inGameTime});
                    } else if ( ((data.winner == 'red') && (tagpro.players[tagpro.playerId].team == 1)) || ((data.winner == 'blue') && (tagpro.players[tagpro.playerId].team == 2)) ) {
                        WLT_Data.push({ result:'W', score:(bluescore > redscore ? bluescore+''+redscore : redscore+''+bluescore), date:endTime, map:mapname, blueredplayercount:(bluescore > redscore ? bluePlayers+''+redPlayers : redPlayers+''+bluePlayers), fullgamelength:(endTime-startTime)/1000, playedgamelength:(endTime-joinTime)/1000, playedgametime:inGameTime});
                    } else {
                        WLT_Data.push({ result:'L', score:(bluescore < redscore ? bluescore+''+redscore : redscore+''+bluescore), date:endTime, map:mapname, blueredplayercount:(bluescore < redscore ? bluePlayers+''+redPlayers : redPlayers+''+bluePlayers), fullgamelength:(endTime-startTime)/1000, playedgamelength:(endTime-joinTime)/1000, playedgametime:inGameTime});
                    }
                } else {
                    //WLT_Data.push('X');
                }
 
                GM_setValue('WLT', WLT_Data);
            }
        });
    }
}); //tagpro.ready