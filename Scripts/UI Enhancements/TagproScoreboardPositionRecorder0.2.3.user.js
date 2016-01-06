// ==UserScript==
// @name            Scoreboard Position Recorder
// @description     Records everyone's position on the end-of-game scoreboard.
// @version         0.2.3
// @include         http://tagpro-*.koalabeast.com*
// @exclude         http://tagpro-maptest*.koalabeast.com*
// @updateURL       https://github.com/TagproMLTP/TagproScriptsWhitelist/raw/f2dff8e364c9d236b85a3b313875641a7154e5ee/Scripts/UI%20Enhancements/TagproScoreboardPositionRecorder0.2.3.user.js
// @downloadURL     https://gist.github.com/nabbynz/11f2a4a74723c7cb33cc/raw/TagPro_Scoreboard_Position_Recorder.user.js
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_deleteValue
// @grant           GM_addStyle
// @license         GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author          nabby
// ==/UserScript==

console.log('START: ' + GM_info.script.name + ' (v' + GM_info.script.version + ' by ' + GM_info.script.author + ')');

var options = {
    'SBPR_ShowOnPages':        { display:'Home,Profile,Joiner',               value:'Home',            type:'checkbox'},
    'SBPR_MinimumGameTime':    { display:'Minimum Game Time Needed:',         value:50,                type:'range'},
    'SBPR_AuthOnly':           { display:'Only Save Authenticated Players',   value:true,              type:'checkbox'},
    'SBPR_HideSomeBalls':      { display:'Hide Some Balls (1-20)',            value:true,              type:'checkbox'},
    'SBPR_HideLowly':          { display:'Hide Players Below: ',              value:0,                 type:'range'},
    'SBPR_ShowPlayer':         { display:'Show Selected Player Table',        value:true,              type:'checkbox'},
    'SBPR_ShowMiniInGame':     { display:'Show Mini Table (in game)',         value:false,             type:'checkbox'},
    'SBPR_Pause':              { display:'Pause Recording',                   value:false,             type:'checkbox'},
    'SBPR_ShowBorder':         { display:'Show Border',                       value:true,              type:'checkbox'},
    'sortby':                  { display:'',                                  value:10,                type:'script'},
};
var SBPR_Options;
var SBPR_Data = {};

function WhichPageAreWeOn(){
    if (window.location.port) { //In a real game
        return('ingame');
    } else if (document.URL.indexOf('/games/find') > 0) { //Joining page
        return('joining');
    } else if ($('#play').length) { //Chosen server homepage
        return('server');
    } else if (document.URL.indexOf('/profile/') > 0) {
        if ($('#showSettings').length) {
            return('profile'); //Profile page and logged in
        } else {
            return('profileNotOurs'); //Profile page, but not our one (or we're logged out)
        }
    } else if ( ((window.location.host == 'tagpro.koalabeast.com') || (window.location.host == 'tagpro.gg')) && (window.location.pathname === '/') ) { //Choose a server homepage
        return('home');
    }
}
var PageLoc = WhichPageAreWeOn();

function secondsToHMS(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s);
}

function comparer(index) {
    return function(a, b) {
        var valA = getCellValue(a, index), valB = getCellValue(b, index);
        return $.isNumeric(valA) && $.isNumeric(valB) ? valB - valA : valA.localeCompare(valB);
    };
}
function getCellValue(row, index){
    return $(row).children('td').eq(index).text();
}

function ordinal_suffix_of(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}

function scaleBetween(unscaledNum, minAllowed, maxAllowed, min, max){
    return (maxAllowed-minAllowed)*(unscaledNum-min)/(max - min) + minAllowed;
}

function getAllPlayers() {
    var players = [];
    for (var playerId in tagpro.players) {
        if (tagpro.players.hasOwnProperty(playerId)) {
            players.push(tagpro.players[playerId]);
        }
    }
    return players;
}

function getResult(player, winner) {
    if (winner === 'tie') {
        return 'tie';
    } else if ( ((winner === 'red') && (player.team === 1)) || ((winner === 'blue') && (player.team === 2)) ) {
        return 'win';
    } else if ( ((winner === 'red') && (player.team === 2)) || ((winner === 'blue') && (player.team === 1)) ) {
        return 'loss';
    } else {
        return 0;
    }
}

function savePlayerData(playersdata) {
    $.each(playersdata, function(key, player) {
        if (SBPR_Data.hasOwnProperty(player.name)) { //player already exists
            SBPR_Data[player.name].playedCount++;
        } else { //first time
            SBPR_Data[player.name] = {};
            SBPR_Data[player.name].positions = {1:{count:0,win:0,loss:0,tie:0,timePlayed:0,score:0,points:0,'s-tags':0,'s-pops':0,'s-grabs':0,'s-drops':0,'s-hold':0,'s-captures':0,'s-prevent':0,'s-returns':0,'s-support':0,'s-powerups':0},
                                                2:{count:0,win:0,loss:0,tie:0,timePlayed:0,score:0,points:0,'s-tags':0,'s-pops':0,'s-grabs':0,'s-drops':0,'s-hold':0,'s-captures':0,'s-prevent':0,'s-returns':0,'s-support':0,'s-powerups':0},
                                                3:{count:0,win:0,loss:0,tie:0,timePlayed:0,score:0,points:0,'s-tags':0,'s-pops':0,'s-grabs':0,'s-drops':0,'s-hold':0,'s-captures':0,'s-prevent':0,'s-returns':0,'s-support':0,'s-powerups':0},
                                                4:{count:0,win:0,loss:0,tie:0,timePlayed:0,score:0,points:0,'s-tags':0,'s-pops':0,'s-grabs':0,'s-drops':0,'s-hold':0,'s-captures':0,'s-prevent':0,'s-returns':0,'s-support':0,'s-powerups':0},
                                                5:{count:0,win:0,loss:0,tie:0,timePlayed:0,score:0,points:0,'s-tags':0,'s-pops':0,'s-grabs':0,'s-drops':0,'s-hold':0,'s-captures':0,'s-prevent':0,'s-returns':0,'s-support':0,'s-powerups':0},
                                                6:{count:0,win:0,loss:0,tie:0,timePlayed:0,score:0,points:0,'s-tags':0,'s-pops':0,'s-grabs':0,'s-drops':0,'s-hold':0,'s-captures':0,'s-prevent':0,'s-returns':0,'s-support':0,'s-powerups':0},
                                                7:{count:0,win:0,loss:0,tie:0,timePlayed:0,score:0,points:0,'s-tags':0,'s-pops':0,'s-grabs':0,'s-drops':0,'s-hold':0,'s-captures':0,'s-prevent':0,'s-returns':0,'s-support':0,'s-powerups':0},
                                                8:{count:0,win:0,loss:0,tie:0,timePlayed:0,score:0,points:0,'s-tags':0,'s-pops':0,'s-grabs':0,'s-drops':0,'s-hold':0,'s-captures':0,'s-prevent':0,'s-returns':0,'s-support':0,'s-powerups':0}
                                               };
            SBPR_Data[player.name].playedCount = 1;
            SBPR_Data[player.name].auth = player.auth;
        }
        SBPR_Data[player.name].positions[key+1].count++;
        if (player.result) SBPR_Data[player.name].positions[key+1][player.result]++; //win/loss/tie - can't do save attempts as data not available for other players.
        SBPR_Data[player.name].positions[key+1].timePlayed+=player.timePlayed;
        SBPR_Data[player.name].positions[key+1].score+=player.score;
        SBPR_Data[player.name].positions[key+1].points+=player.points;
        SBPR_Data[player.name].positions[key+1]["s-tags"]+=player["s-tags"];
        SBPR_Data[player.name].positions[key+1]["s-pops"]+=player["s-pops"];
        SBPR_Data[player.name].positions[key+1]["s-grabs"]+=player["s-grabs"];
        SBPR_Data[player.name].positions[key+1]["s-drops"]+=player["s-drops"];
        SBPR_Data[player.name].positions[key+1]["s-hold"]+=player["s-hold"];
        SBPR_Data[player.name].positions[key+1]["s-captures"]+=player["s-captures"];
        SBPR_Data[player.name].positions[key+1]["s-prevent"]+=player["s-prevent"];
        SBPR_Data[player.name].positions[key+1]["s-returns"]+=player["s-returns"];
        SBPR_Data[player.name].positions[key+1]["s-support"]+=player["s-support"];
        SBPR_Data[player.name].positions[key+1]["s-powerups"]+=player["s-powerups"];
    });

    GM_setValue('SBPR_Data', SBPR_Data);
}



tagpro.ready(function() {
    if (GM_getValue('SBPR_Data')) {
        SBPR_Data = GM_getValue('SBPR_Data');
    }

    SBPR_Options = $.extend(true, {}, options, GM_getValue('SBPR_Options', options));
    $.each(SBPR_Options, function(key, value) {
        if ( (SBPR_Options.hasOwnProperty(key)) && (options.hasOwnProperty(key)) ) {
            SBPR_Options[key].display = options[key].display; //Make sure menu description is always the same as in the script
        }
    });
    if (GM_getValue('SBPR_Options') === undefined) { //first time
        GM_setValue('SBPR_Options', SBPR_Options);
    }

    var SBRegExp = /^Some Ball ([1-9]|1[0-9]|20)$/;

    var secondHighestCount = 0;
    var secondHighestCountName = '';
    var SBPR_length = 0;
    for (var playerName in SBPR_Data) {
        if (SBPR_Data.hasOwnProperty(playerName)) {
            SBPR_length++;
            if ((playerName != '♥') && (!SBRegExp.test(playerName)) && (SBPR_Data[playerName].playedCount > secondHighestCount)) {
                secondHighestCount = SBPR_Data[playerName].playedCount;
                secondHighestCountName = playerName;
            }
        }
    }
    var lowlyCutoff = Math.floor(secondHighestCount * SBPR_Options.SBPR_HideLowly.value / 100);

    if ( (PageLoc === 'server') ||
        ((PageLoc === 'profile') && (SBPR_Options.SBPR_ShowOnPages.value.indexOf('Profile') >= 0)) ||
        ((PageLoc === 'joining') && (SBPR_Options.SBPR_ShowOnPages.value.indexOf('Joiner') >= 0)) ||
        ((PageLoc === 'ingame') && (SBPR_Options.SBPR_ShowOnPages.value.indexOf('Game') >= 0)) ) {

        //Setup the main div location depending on which page we are on...
        var SBPR_Div = '<div id="SBPR" style="position:relative; margin:20px auto 0 auto; padding:10px; font-size:12px; color:#fff; text-align:center; border-radius:8px;' + (SBPR_Options.SBPR_ShowBorder.value ? ' box-shadow:#fff 0px 0px 10px;' : '') + ' background:rgba(0,0,0,0.9); white-space:nowrap;"></div>';
        if (PageLoc === 'server') { //Chosen server page
            $('#play').parent().next().after(SBPR_Div);
        } else if (PageLoc === 'profile') {   //Profile page
            $('h1').parent('a').after(SBPR_Div);
        } else if (PageLoc === 'profileNotOurs') { //Someone else's profile page
            $('h1').parent('a').after(SBPR_Div);
        } else if (PageLoc === 'joining') { //Joining page
            $('#message').after(SBPR_Div);
        }

        var SBPR_Header = '<div id="SBPR_Options_Button" style="display:inline-block; font-size:11px; text-align:center; margin-left:10px; height:13px; width:14px; border:2px solid #808; border-radius:8px; cursor:pointer">&#8286;</div> Scoreboard Position Recorder';

        $('#SBPR').append('<div id="SBPR_Header" style="margin-bottom: 5px">'+SBPR_Header+'</div>');
        $('#SBPR').append('<div id="SBPR_Main" style="display:flex; font-size:11px; max-height:300px"></div>');
        $('#SBPR_Main').append('<div id="SBPR_Players" style="position:relative; margin:0 auto; padding-right:3px; overflow-x:hidden; overflow-y:auto"></div>');
        $('#SBPR_Main').append('<div id="SBPR_Player" style="margin:0 auto; display:none"></div>');
        $('#SBPR_Options_Button').after('<div id="SBPR_Options_Menu" style="display:none; position:absolute; width:350px; margin:-25px 0 0 90px; padding:10px 10px 15px; text-align:left; background:linear-gradient(#e00, #555); border-radius:8px; box-shadow:0px 0px 8px #fff; z-index:6000"></div>');
        var $SBPR_Options_Menu = $('#SBPR_Options_Menu');
        $SBPR_Options_Menu.append('<div style="margin:0 auto; padding-bottom:5px; font-size:16px; font-weight:bold; color:#000; text-align:center; text-shadow:2px 1px 2px #aaa;">ScoreBoard Position Recorder</div>');

        GM_addStyle('#SBPR_Players::-webkit-scrollbar { width:3px }');
        GM_addStyle('#SBPR_Players::-webkit-scrollbar-thumb { background:#b0b; }');
        GM_addStyle('#SBPR_Players::-webkit-scrollbar-track { background:#ddd; }');

        if (SBPR_length) {
            $('#SBPR_Players').append('<table id="SBPR_Data_Table" style="margin:0 auto; line-height:10px"><thead><tr>' +
                                   '<th>Player <span id="SBPR_PlayersCount"></span></th>' +
                                   '<th>1st</th>' +
                                   '<th>2nd</th>' +
                                   '<th>3rd</th>' +
                                   '<th>4th</th>' +
                                   '<th>5th</th>' +
                                   '<th>6th</th>' +
                                   '<th>7th</th>' +
                                   '<th>8th</th>' +
                                   '<th>Total</th>' +
                                   '<th>Ave</th>' +
                                   '</tr></thead></table>');
            GM_addStyle("#SBPR_Data_Table th { text-align:center; background:#fff; color:#000; cursor:pointer }");
            var $SBPR_Data_Table = $('#SBPR_Data_Table');

            var keyCounts;
            var trCounter = 0;
            $.each(SBPR_Data, function(name, data) {
                keyCounts = 0;
                if (name === '♥') { //us
                    $SBPR_Data_Table.append('<tr id="SBPR_'+trCounter+'" class="SBPR_HighlightSelf"><td id="SBPR_♥" class="SBPR_PlayerName" data-playername="♥">Me</td></tr>');
                } else if (name[0] === '✔') { //authenticated name
                    $SBPR_Data_Table.append('<tr id="SBPR_'+trCounter+'"><td class="SBPR_PlayerName SBPR_PlayerAuth" data-playername="'+name+'">' + name + '</td></tr>');
                } else {
                    $SBPR_Data_Table.append('<tr id="SBPR_'+trCounter+'"><td class="SBPR_PlayerName" data-playername="'+name+'">' + name + '</td></tr>');
                }
                $.each(data.positions, function(k, v) {
                    $('#SBPR_'+trCounter).append('<td>'+v.count+'</td>');
                    keyCounts += ((parseInt(k)) * v.count);
                });
                $('#SBPR_'+trCounter).append('<td class="SBPR_Player_Total">'+(data.playedCount)+'</td>');
                $('#SBPR_'+trCounter).append('<td class="SBPR_Player_Average">'+(keyCounts/data.playedCount).toFixed(2)+'</td>'); //average position
                if (data.playedCount <= lowlyCutoff) {
                    $('#SBPR_'+trCounter).addClass('SBPR_lowly');
                }
                if (SBRegExp.test(name)) $('#SBPR_'+trCounter).addClass('SBPR_someball');
                trCounter++;
            });
            GM_addStyle("#SBPR_Data_Table td { text-align:center; cursor:default; padding:1px 1px 0 1px }");
            GM_addStyle("#SBPR_Data_Table th:hover { text-decoration:underline }");
            GM_addStyle("#SBPR_Data_Table tbody tr:hover { color:#0bb }");
            GM_addStyle("#SBPR_Data_Table .SBPR_PlayerName { font-size:10px; background:#b0b }");
            GM_addStyle("#SBPR_Data_Table .SBPR_HighlightSelf { color:#ff0 }");
            GM_addStyle("#SBPR_Data_Table .SBPR_PlayerAuth::first-letter { color:#0f0 }");

        } else {
            $('#SBPR_Header').append(' (No data)');
        }//if data

        //---------------------------------------------
        //Build the menu and perform saved options...
        $.each(SBPR_Options, function(key, value) {
            if (SBPR_Options[key].type === 'checkbox') {
                if (key === 'SBPR_ShowOnPages') {
                    $SBPR_Options_Menu.append('<div id="SBPR_ShowOnPages" style="text-align:center; font-size:11px">Show On:</div>');
                    var pages = (SBPR_Options.SBPR_ShowOnPages.display).split(',');
                    $.each(pages, function(k, v) {
                        $('#SBPR_ShowOnPages').append('<label style="margin-left:4px"><input type="checkbox" class="SBPR_ShowOnPage" data-page="'+v+'" ' + ((SBPR_Options.SBPR_ShowOnPages.value).indexOf(v) >= 0 ? 'checked' : '') + ' style="margin:3px 1px 3px 3px">'+v+'</label>');
                    });
                } else {
                    $SBPR_Options_Menu.append('<li style="list-style:none"><label><input type="checkbox" id="' + key + '" class="regularCheckbox" ' + (value.value === true ? 'checked' : '') + '>' + value.display + '</label></li>');
                }

                if (key === 'SBPR_ShowBorder') {
                    if (value.value === false) {
                        $('#SBPR_Main').css('box-shadow', 'none');
                    }
                } else if (key === 'SBPR_HideSomeBalls') {
                    if (value.value === true) {
                        $('#SBPR_Data_Table .SBPR_someball').hide(0);
                    } else {
                        $('#SBPR_Data_Table .SBPR_someball').show(0);
                    }
                }

            } else if (SBPR_Options[key].type === 'range') {
                if (key === 'SBPR_HideLowly') {
                    $SBPR_Options_Menu.append('<li style="list-style:none"><input type="checkbox" disabled><span>' + value.display + '</span><input type="range" id="SBPR_HideLowly" min="0" max="100" value="' + SBPR_Options.SBPR_HideLowly.value + '" style="width:100px" title="As % of Next Highest Players Game Count ('+secondHighestCountName+': '+secondHighestCount+')"> <span id="SBPR_HideLowly_Value">' + SBPR_Options.SBPR_HideLowly.value + '</span>%</li>');
                    if (SBPR_Options.SBPR_HideLowly.value > 0) $('.SBPR_lowly').hide(0);
                } else if (key === 'SBPR_MinimumGameTime') {
                    $SBPR_Options_Menu.append('<li style="list-style:none"><input type="checkbox" disabled><span>' + value.display + '</span><input type="range" id="SBPR_MinimumGameTime" min="0" max="100" value="' + SBPR_Options.SBPR_MinimumGameTime.value + '" style="width:100px"> <span id="SBPR_MinimumGameTime_Value">' + SBPR_Options.SBPR_MinimumGameTime.value + '</span>%</li>');
                    if (SBPR_Options.SBPR_HideLowly.value > 0) $('.SBPR_lowly').hide(0);
                }
            }
        });
        $SBPR_Options_Menu.append('<span id="SBPR_Reset" style="margin:0 32px -12px 0; float:right; padding:2px; font-size:11px; color:#000; background:#AA0000; border-radius:4px; cursor:pointer" title="Reset all values to defaults. Delete all data.">Reset All</span>');
        $SBPR_Options_Menu.append('<div style="position:absolute; bottom:2px; right:5px; text-align:right"><a href="https://gist.github.com/nabbynz/" target="_blank" style="font-size:11px; color:#888" title="Version: ' + GM_info.script.version + '. Click to manually check for updates (script will auto-update if enabled)...">v' + GM_info.script.version + '</a</div>');


        //---------------------------------------------
        //Bind Events...
        $('#SBPR_Options_Button').on('click', function() {
            $SBPR_Options_Menu.slideToggle(400);
        });
        $SBPR_Options_Menu.mouseleave(function() {
            $SBPR_Options_Menu.fadeOut(100);
        });

        $('#SBPR_ShowOnPages input.SBPR_ShowOnPage').on('click', function() {
            var newSelection = '';
            $.each($('#SBPR_ShowOnPages input'), function() {
                if ($(this).is(':checked')) newSelection += $(this).data('page') + ",";
            });
            SBPR_Options.SBPR_ShowOnPages.value = newSelection;
            GM_setValue('SBPR_Options', SBPR_Options);
            if (($(this).data('page') === 'Home') && (PageLoc === 'server')) {
                $('#SBPR_Main').slideToggle(600);
            } else if (($(this).data('page') === 'Profile') && (PageLoc === 'profile')) {
                $('#SBPR').slideToggle(600);
            }
        });

        $('#SBPR_Options_Menu input.regularCheckbox').on('click', function() {
            SBPR_Options[this.id].value = $(this).is(':checked');
            GM_setValue('SBPR_Options', SBPR_Options);
            if (this.id === 'SBPR_ShowBorder') {
                if ($(this).is(':checked')) {
                    $('#SBPR').css('box-shadow', '#fff 0px 0px 10px');
                } else {
                    $('#SBPR').css('box-shadow', 'none');
                }
            } else if (this.id === 'SBPR_HideSomeBalls') {
                if ($(this).is(':checked')) {
                    $('#SBPR_Data_Table .SBPR_someball').fadeOut(400);
                } else {
                    $('#SBPR_Data_Table .SBPR_someball').fadeIn(400);
                }
            } else if (this.id === 'SBPR_ShowPlayer') {
                if ($(this).is(':checked')) {
                    //$('#SBPR_Player').fadeIn(400);
                } else {
                    $('#SBPR_Data_Table tr:gt(0)').css('background', '#222');
                    $('#SBPR_Data_Table td.SBPR_PlayerName').css('background', '#b0b');
                    $('#SBPR_Player').fadeOut(400);
                }
            }
        });

        $('#SBPR_Data_Table th').click(function(e, reverse) {
            if (reverse === undefined) reverse = false;
            SBPR_Options.sortby.value = $(this).index();
            GM_setValue('SBPR_Options', SBPR_Options); //save the header we're sorting by
            $('#SBPR_Data_Table th').css('color', '#000');
            $(this).css('color', '#b0b');
            var table = $('#SBPR_Data_Table tbody');
            var rows = table.find('tr').toArray().sort(comparer($(this).index()));
            if (reverse) rows = rows.reverse();
            //if (reverse) {
            this.asc = !this.asc;
            if (!this.asc) rows = rows.reverse();
            //}
            for (var i = 0; i < rows.length; i++) { table.append(rows[i]); }
        });

        //------------------------
        //Selected Player Stuff...
        $('#SBPR_Data_Table td.SBPR_PlayerName').click(function() {
            if (SBPR_Options.SBPR_ShowPlayer.value) {
                var playerName = $(this).data('playername');
                var $SBPR_Player = $('#SBPR_Player');
                $('#SBPR_Data_Table tr:gt(0)').css('background', '#222');
                $('#SBPR_Data_Table td.SBPR_PlayerName').css('background', '#b0b');
                $(this).css('background', '#f0f');
                $(this).parent('tr').css('background', '#f0f');

                $('#SBPR_Data_Player').remove();
                $('#SBPR_PositionsBarGraph').remove();
                $('#SBPR_PositionsBarGraphXLabel').remove();
                $SBPR_Player.append('<table id="SBPR_Data_Player" data-player="'+playerName+'" style="margin:0 auto 20px auto; line-height:10px"><thead><tr>' +
                                         '<th title="Position">Pos</th><th title="Wins">W</th><th title="Losses">L</th><th title="Ties">T</th><th title="Average Time Played">Tm</th><th title="Average Score">Sc</th>' +
                                         '<th title="Average Tags">Ta</th><th title="Average Pops">Po</th><th title="Average Grabs">Gr</th><th title="Average Drops">Dr</th><th title="Average Hold">Ho</th><th title="Average Caps">Ca</th><th title="Average Prevent">Pr</th><th title="Average Returns">Re</th><th title="Average Support">Su</th><th title="Average Powerups">PUP</th><th title="Average Points">Pt</th title="">' +
                                         '</tr></thead></table>');

                var fields = [ 'win', 'loss', 'tie', 'timePlayed', 'score', 's-tags','s-pops','s-grabs','s-drops','s-hold','s-captures','s-prevent','s-returns','s-support','s-powerups', 'points' ];
                var colors = ['#00EE00', '#007700', '#00EEEE', '#007777', '#EEEE00', '#888800', '#EE0000', '#880000'];
                var WLTCount = {};
                var totalGames=0, subTotalGames=0, min2=999999, max2=0;
                if (SBPR_Data.hasOwnProperty(playerName)) {
                    $.each(SBPR_Data[playerName].positions, function(key, value) {
                        $('#SBPR_Data_Player').append('<tr id="SBPR_Player_'+key+'" style="color:'+colors[key-1]+'"></tr>');
                        $('#SBPR_Player_'+key).append('<td>'+ordinal_suffix_of(key)+'</td>');
                        $.each(fields, function(k, v) {
                            subTotalGames = 0;
                            if (value.hasOwnProperty(v)) {
                                if ( (v === 'timePlayed') || (v === 's-hold') || (v === 's-prevent') || (v === 's-support') ) {
                                    $('#SBPR_Player_'+key).append('<td>'+(value.count ? secondsToHMS((value[v]/value.count).toFixed(1)) : '-')+'</td>');
                                } else if ( (v === 'score') || (v === 's-tags') || (v === 's-pops') || (v === 's-grabs') || (v === 's-drops') || (v === 's-captures') || (v === 's-returns') || (v === 's-powerups') || (v === 'points') ) {
                                    $('#SBPR_Player_'+key).append('<td>'+(value.count ? (value[v]/value.count).toFixed(1) : '-')+'</td>');
                                } else {
                                    if ((v === 'win') || (v === 'loss') || (v === 'tie')) {
                                        if ( !WLTCount.hasOwnProperty(key) ) {
                                            WLTCount[key] = {};
                                            WLTCount[key].win = 0;
                                            WLTCount[key].loss = 0;
                                            WLTCount[key].tie = 0;
                                        }
                                        WLTCount[key][v] += value[v];
                                        totalGames += value[v];
                                        subTotalGames += WLTCount[key].win + WLTCount[key].loss + WLTCount[key].tie;
                                        if (subTotalGames > max2) max2 = subTotalGames;
                                        if (subTotalGames < min2) min2 = subTotalGames;
                                    }
                                    $('#SBPR_Player_'+key).append('<td>'+value[v]+'</td>');
                                }
                            }
                        });
                    });
                }

               //Positions Bar Graph...
                var barwidth = 30, barmargin = 2;

                $SBPR_Player.append('<div id="SBPR_PositionsBarGraph" style="display:flex; align-items:flex-end; width:'+((barwidth+barmargin*2)*8)+'px; margin:0 auto; border-bottom:1px solid #fff"></div>');
                $SBPR_Player.append('<div id="SBPR_PositionsBarGraphXLabel" style="display:flex; align-items:baseline; width:'+((barwidth+barmargin*2)*8)+'px; margin:0 auto"></div>');

                $.each(WLTCount, function(key, value) {
                    var thisTotalGames = (value.win + value.loss + value.tie);
                    var thisHeight = scaleBetween(thisTotalGames, (thisTotalGames?5:0), 60, min2, max2);
                    var positionText = ordinal_suffix_of(key);
                    $('#SBPR_PositionsBarGraph').append('<div id="SBPR_PositionsBarGraph_'+key+'" style="height:'+thisHeight+'px; width:'+barwidth+'px; background:'+colors[key-1]+'; display:flex; align-items:flex-end; justify-content:space-around; margin:0 '+barmargin+'px" title="'+(thisTotalGames / totalGames * 100).toFixed(2)+'% of the time you finish '+positionText+'"></div>');
                    if (thisTotalGames > 0) {
                        $('#SBPR_PositionsBarGraph_'+key).append('<div class="TTEST" style="height:'+(thisHeight*(value.win/thisTotalGames))+'px; width:'+((barwidth-barmargin*4)/2)+'px; background:rgb(50,50,50);" title="'+((value.win/thisTotalGames)*100).toFixed(2)+'% win rate when you finish '+positionText+'"></div>');
                        $('#SBPR_PositionsBarGraph_'+key).append('<div class="TTEST" style="height:'+(thisHeight*((value.loss+value.tie)/thisTotalGames))+'px; width:'+((barwidth-barmargin*4)/2)+'px; background:rgb(50,50,50);" title="'+(((value.loss+value.tie)/thisTotalGames)*100).toFixed(2)+'% loss rate when you finish '+positionText+'"></div>');
                    }
                    $('#SBPR_PositionsBarGraphXLabel').append('<div style="width:'+barwidth+'px; color:'+colors[key-1]+'; margin:0 '+barmargin+'px; font-size:10px" title="'+(thisTotalGames / totalGames * 100).toFixed(2)+'% of the time you finish '+positionText+'">'+positionText+'<br>'+(thisTotalGames / totalGames * 100).toFixed(1)+'%</div>');
                });

                $SBPR_Player.fadeIn(400);
            }
        });
        GM_addStyle("#SBPR_Data_Player th { text-align:center; cursor:default; background:#555; color:#eee }");
        GM_addStyle("#SBPR_Data_Player td { text-align:center; cursor:default; padding:1px 1px 0 1px }");
        GM_addStyle(".TTEST { opacity:0.3 }");
        GM_addStyle(".TTEST:hover { opacity:0.7 }");

        var scrollToMe = function() {
            if ($('#SBPR_♥').length) {
                var animateTime = 0;
                if ((PageLoc === 'server') || (PageLoc === 'profile')) animateTime = 600;
                $('#SBPR_Players').animate({ scrollTop: $('#SBPR_♥').position().top - ( $('#SBPR_Players').height() / 2) }, animateTime, 'swing');
            }
        };

        $('#SBPR_HideLowly').on('input', function() {
            $('#SBPR_HideLowly_Value').text(this.value);
        });
        $('#SBPR_HideLowly').on('change', function() {
            SBPR_Options[this.id].value = this.value;
            GM_setValue('SBPR_Options', SBPR_Options);

            if (this.value === '0') { //show all
                $('#SBPR_Data_Table .SBPR_lowly').fadeIn(400);
                $('#SBPR_Data_Table .SBPR_lowly').removeClass('SBPR_lowly');
            } else {
                $('#SBPR_Data_Table .SBPR_lowly').removeClass('SBPR_lowly');
                lowlyCutoff = Math.floor(secondHighestCount * SBPR_Options.SBPR_HideLowly.value / 100);
                $.each($('#SBPR_Data_Table > tbody > tr'), function(key, value) {
                    if (parseInt($(this).find('td.SBPR_Player_Total').text()) <= lowlyCutoff) {
                        $(this).addClass('SBPR_lowly');
                        $(this).fadeOut(400);
                    } else {
                        if (!$(this).hasClass('SBPR_someball')) $(this).fadeIn(400);
                    }
                });
            }
        });

        $('#SBPR_MinimumGameTime').on('input', function() {
            $('#SBPR_MinimumGameTime_Value').text(this.value);
        });
        $('#SBPR_MinimumGameTime').on('change', function() {
            SBPR_Options[this.id].value = this.value;
            GM_setValue('SBPR_Options', SBPR_Options);
        });

        $('#SBPR_Reset').on('click', function() {
            var response = confirm("All data will be lost, and this page will reload.\n\nOK to continue?");
            if (response) {
                GM_deleteValue('SBPR_Options');
                GM_deleteValue('SBPR_Data');
                window.location.reload();
            }
        });


        //---------------------------------------------
        //perform some saved options...
        $('#SBPR_Data_Table th:eq('+SBPR_Options.sortby.value+')').trigger('click', (SBPR_Options.sortby.value === 10 ? true : false)); //sort the table by last saved
        if (SBPR_Options.SBPR_ShowPlayer.value) $('#SBPR_♥').trigger('click'); //show the "Me" player data
        if (PageLoc === 'server') {
            if (SBPR_Options.SBPR_ShowOnPages.value.indexOf('Home') < 0) {
                $('#SBPR_Main').hide(0);
            } else {
                $('#SBPR_Main').show(0);
                setTimeout( scrollToMe, 400);
            }
        } else if ((PageLoc === 'profile') || (PageLoc === 'profileNotOurs')) {
            if (SBPR_Options.SBPR_ShowOnPages.value.indexOf('Profile') < 0) {
                $('#SBPR').hide(0);
            } else {
                $('#SBPR').show(0);
                setTimeout( scrollToMe, 400);
            }
        } else if (PageLoc === 'joining') {
            if (SBPR_Options.SBPR_ShowOnPages.value.indexOf('Joiner') < 0) {
                $('#SBPR').hide(0);
            } else {
                $('#SBPR').show(0);
                setTimeout( scrollToMe, 400);
                $('#SBPR_Options_Button').hide(0);
            }
        }

    } //if on the selected page


    function showMiniTable(spectator, message) {
        var keyCounts;

        if (spectator === undefined) spectator = false;

        $('#SBPR_Mini').remove();
        $('#exit').after('<div id="SBPR_Mini" style="display:inline-block; position:absolute; top:120px; font-size:10px; background:#000"><table id="SBPR_Mini_Players" style="text-align:center; line-height:9px"></table></div>');
        $('#SBPR_Mini_Players').append('<tr style="background:#fff; color:#000"><td>Player</td><td></td><td>Ave</td></tr>');
        var $SBPR_Mini_Players = $('#SBPR_Mini_Players');

        var players = getAllPlayers();
        $.each(players, function(key, player) {
            var playername = player.name;
            if (player.id === tagpro.playerId && !spectator) {
                playername = '♥'; //us (always)
            } else if (player.auth === true) {
                playername = '✔' + player.name;
            }
            if (SBPR_Data.hasOwnProperty(playername)) {
                keyCounts = 0;
                $.each(SBPR_Data[playername].positions, function(k, v) {
                    keyCounts += ((parseInt(k)) * v.count);
                });
                if (playername === '♥') {
                    $SBPR_Mini_Players.append('<tr style="color:'+(player.team == 1 ? '#ffb0b0' : '#c0c0ff')+'"><td style="border-left:1px solid #fff">'+(player.auth ? '<span style="color:#0f0">✔</span>' : '')+player.name+'</td><td>'+SBPR_Data[playername].playedCount+'</td><td>'+(keyCounts/SBPR_Data[playername].playedCount).toFixed(2)+'</td></tr>');
                } else {
                    $SBPR_Mini_Players.append('<tr style="color:'+(player.team == 1 ? '#ffb0b0' : '#c0c0ff')+'"><td>'+(player.auth ? '<span style="color:#0f0">✔</span>' : '')+player.name+'</td><td>'+SBPR_Data[playername].playedCount+'</td><td>'+(keyCounts/SBPR_Data[playername].playedCount).toFixed(2)+'</td></tr>');
                }
            } else {
                if (playername === '♥') {
                    $SBPR_Mini_Players.append('<tr style="color:'+(player.team == 1 ? '#ffb0b0' : '#c0c0ff')+'; background:#333"><td>'+(player.auth ? '<span style="color:#0f0">✔</span>' : '')+player.name+'</td><td>-</td><td>-</td></tr>');
                } else {
                    $SBPR_Mini_Players.append('<tr style="color:'+(player.team == 1 ? '#ffb0b0' : '#c0c0ff')+'"><td>'+(player.auth ? '<span style="color:#0f0">✔</span>' : '')+player.name+'</td><td>-</td><td>-</td></tr>');
                }
            }
            var rows = $SBPR_Mini_Players.find('tr:gt(0)').toArray().sort(comparer(2));
            rows = rows.reverse();
            for (var i = 0; i < rows.length; i++) { $SBPR_Mini_Players.append(rows[i]); }
        });
        if (message) {
            $('#SBPR_Mini_Players').append('<tr style="color:#f00"><td colspan="3">'+message+'</td></tr>');
        }
    }

    //In Game...
    if (PageLoc === 'ingame') {
        var joinTime;
        var groupPause = false;

        tagpro.socket.on('map', function(data) {
            if ((tagpro.group.socket) && (tagpro.group.socket.connected)) {
                groupPause = true;
            }
        });

        tagpro.socket.on('time', function(message) {
            if (tagpro.state == 3) { //before the actual start
                joinTime = new Date().getTime();
            } else if (tagpro.state == 1) { //game has started
                if (joinTime) {
                    joinTime = Date.parse(tagpro.gameEndsAt) - 12 * 60 * 1000; //time game started (end - 12 mins)
                } else {
                    joinTime = new Date().getTime(); //time we joined (mid-game)
                }
            }
            if (SBPR_Options.SBPR_ShowMiniInGame.value === true) setTimeout(showMiniTable, 500);
        });

        tagpro.socket.on('chat', function(data) {
            if ((SBPR_Options.SBPR_ShowMiniInGame.value === true) && (tagpro.state === 1)) {
                if (tagpro.spectator) {
                    setTimeout(function() {
                        showMiniTable(true);
                    }, 500);

                } else if (data.from === null) { //system message
                    if ((data.message.indexOf('has joined the') >= 0) || (data.message.indexOf('has left the') >= 0)) {
                         setTimeout(showMiniTable, 500);
                    }
                }
            }
        });

        tagpro.socket.on('end', function(data) {
            if ( (!tagpro.spectator) && (groupPause === false) ) {
                var fullTime = Date.parse(tagpro.gameEndsAt); //expected end of game time after 12 mins
                var endTime = new Date().getTime(); //actual end of game time
                var startTime = fullTime - 12 * 60 * 1000; //start of game time
                var fullGameLength = (endTime-startTime)/1000; //how long the whole game lasted (with or without us)
                var playedGameLength = (endTime-joinTime)/1000; //how long we played for

                if (playedGameLength > fullGameLength * (SBPR_Options.SBPR_MinimumGameTime.value / 100)) { //check we played for more than x% of the game
                    var players = getAllPlayers();
                    var playersSorted = [];
                    var result;

                    $.each(players, function(key, player) {
                        if ( (SBPR_Options.SBPR_AuthOnly.value !== true) || ((SBPR_Options.SBPR_AuthOnly.value === true) && (player.auth === true)) || (player.id === tagpro.playerId) ) {
                            var playername = player.name;
                            if (player.id === tagpro.playerId) {
                                playername = '♥'; //just a special name for us so we can find/highlight it easily later (no matter what name we are using)
                            } else if (player.auth === true) {
                                playername = '✔' + player.name;
                            }
                            if (data.winner === 'tie') {
                                result = 'tie';
                            } else {
                                result = getResult(player, data.winner);
                            }
                            playersSorted.push( { name:playername, id:player.id, auth:player.auth, result:result, score:player.score, points:player.points, timePlayed:(endTime-joinTime)/1000, "s-tags":player["s-tags"], "s-pops":player["s-pops"], "s-grabs":player["s-grabs"], "s-drops":player["s-drops"], "s-hold":player["s-hold"], "s-captures":player["s-captures"], "s-prevent":player["s-prevent"], "s-returns":player["s-returns"], "s-support":player["s-support"], "s-powerups":player["s-powerups"] } );
                        }
                    });
                    playersSorted.sort( function(a, b) {
                        //Sort by score...
                        var score = b.score - a.score;
                        if (b.score - a.score !== 0) {
                            return score;
                        } else { //scores are the same - sort by player id...
                            return a.id - b.id;

                        }
                    });
                    savePlayerData(playersSorted);

                } else {
                    setTimeout(function() {
                        showMiniTable(false, 'Not Recorded - played < ' + SBPR_Options.SBPR_MinimumGameTime.value + '%');
                    }, 500);
                }
            }
        });
    }

}); //tagpro.ready
