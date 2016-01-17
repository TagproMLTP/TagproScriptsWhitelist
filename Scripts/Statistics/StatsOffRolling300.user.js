// ==UserScript==
// @name            STATS OFF Rolling 300 Timeline
// @description     Shows a Rolling 300 Timeline & Streaks (using UNOFFICIAL game data) on your chosen server homepage.
// @version         1.0.0
// @include         http://tagpro*.koalabeast.com*
// @require         https://cdnjs.cloudflare.com/ajax/libs/Chart.js/1.0.2/Chart.min.js
// @updateURL       https://github.com/TagproMLTP/TagproScriptsWhitelist/blob/master/Scripts/Statistics/StatsOffRolling300.user.js
// @downloadURL     https://gist.github.com/nabbynz/9c3e5de9690483cb2871/raw/STATS_OFF_R300_Timeline.user.js
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_deleteValue
// @grant           GM_addStyle
// @license         GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author          nabby
// ==/UserScript==

console.log('START: ' + GM_info.script.name + ' (v' + GM_info.script.version + ' by ' + GM_info.script.author + ')');

var options = { //defaults
    //Best not to edit these ones (you can select them through the on-page menu)...
    'O300MainPages':                          { display:'Home,Profile,Joiner',                           type:'checkbox',      value:0,             title:'Home,Profile'},
    'O300HeaderPages':                        { display:'Home,Profile,Joiner,Game',                      type:'checkbox',      value:0,             title:'Home,Profile,Joiner,Game'},
    'O300HeaderShowNGames':                   { display:'# Oldest/Newest Games in Header: ',             type:'number',        value:3,             title:'Oldest & Newest'},
    'MaxO300Games':                           { display:'# Games to View: ',                             type:'overwritten',   value:50,            title:''},
    'ShowO300Timeline':                       { display:'Show Timeline',                                 type:'checkbox',      value:true,          title:''},
    'ShowO300Intervals':                      { display:'Show Win % Bands for...',                       type:'checkbox',      value:true,          title:''},
    'O300WinBands':                           { display:'20,25,30,50,75,100,150',                        type:'subradio',      value:50,            title:''},
    'ShowO300WinPercentage':                  { display:'Show Win %',                                    type:'checkbox',      value:true,          title:''},
    'ShowO300Count':                          { display:'Show Count',                                    type:'checkbox',      value:true,          title:''},
    'ShowO300HighestLowestEver':              { display:'Show Highest/Lowest %\'s (ever)',               type:'checkbox',      value:true,          title:''},
    'ShowO300CTFNF':                          { display:'Show CTF/NF Win %\'s',                          type:'checkbox',      value:true,          title:''},
    'ShowO300OldestGame':                     { display:'Show "Oldest Game"',                            type:'checkbox',      value:false,         title:''},
    'ShowO300NextGameAffect':                 { display:'Show "Next Game" effect',                       type:'checkbox',      value:true,          title:''},
    'ShowO300GamesPieChart':                  { display:'Show Pie Chart',                                type:'checkbox',      value:true,          title:''},
    'ShowO300BestStreak':                     { display:'Show Best Streak',                              type:'checkbox',      value:true,          title:''},
    'ShowO300CurrentStreak':                  { display:'Show Current Streak',                           type:'checkbox',      value:true,          title:''},
    'ShowO300WinStreakMessage':               { display:'Show "Best Streak" Messages',                   type:'checkbox',      value:true,          title:'Show messages like: &quot;You are currently on your best win streak!&quot;'},
    'ShowO300LossStreakMessage':              { display:'Show "Worst Streak" Messages',                  type:'checkbox',      value:false,         title:'Show messages like: &quot;You are currently on your worst losing streak&quot;'},
    'ShowO300PerDayGraph':                    { display:'Show # Games Per Day Graph',                    type:'checkbox',      value:true,          title:''},
    'ShowO300PerDay':                         { display:'Show # Games Per Day',                          type:'checkbox',      value:true,          title:''},
    'ShowO300PUPs':                           { display:'Show Power-Up Stats',                           type:'checkbox',      value:true,          title:''},
    'ShowO300PUPsPerGame':                    { display:'Show values as "Per-Game"',                     type:'overwritten',   value:true,          title:'Click to change between per-game averages & totals'},
    'ShowO300ShowGap':                        { display:'Show a gap between games in Timeline',          type:'checkbox',      value:true,          title:''},
    'ShowBoxShadowBorder':                    { display:'Show Shadow around Border?',                    type:'checkbox',      value:false,         title:''},

    'ShowLessThan300GamesWarning':            { display:'Show the "Mini Selection" Window',              type:'checkbox',      value:true,          title:''},
    'ShowO300TrimmedGamesPieChart':           { display:'Show Mini Pie Chart',                           type:'checkbox',      value:true,          title:''},
    'ShowO300TrimmedPUPs':                    { display:'Show Power-Up Stats',                           type:'checkbox',      value:true,          title:''},
    'AlwaysShowLastDayPlayed':                { display:'Always Start With Last Day Played',             type:'checkbox',      value:true,          title:''},

    //You can manually edit the "value" for these options if you want (but they will revert when the script updates)...
    'Win_Color':                              { display:' Color for a "Win"',                            type:'manual',        value:'#22DD22',     title:''},
    'Loss_Color':                             { display:' Color for a "Loss"',                           type:'manual',        value:'#EE2020',     title:''},
    'DC_Color':                               { display:' Color for a "DC (Loss)"',                      type:'manual',        value:'#FFFF00',     title:''},
    'SSA_Color':                              { display:' Color for a "Successful Save Attempt (Win)"',  type:'manual',        value:'#166C16',     title:''},
    'FSA_Color':                              { display:' Color for a "Unsuccessful Save Attempt"',      type:'manual',        value:'#157798',     title:''},
    'Tie_Color':                              { display:' Color for a "Tie (Loss)"',                     type:'manual',        value:'#ff9900',     title:''},
    'Unknown_Color':                          { display:' Color for a "Unknown"',                        type:'manual',        value:'#888888',     title:''}, //just in case!

    //These are updated by the script...
    'O300SavedGames':                         { type:'script', display:'', value:[] },
};
var O300_Selections; // = options;

$.get('http://i.imgur.com/WKZPcQA.gif'); //preload the ajax loading gif

function secondsToHMS(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s);
}

function scaleBetween(unscaledNum, minAllowed, maxAllowed, min, max){
    return (maxAllowed-minAllowed) * (unscaledNum-min) / (max-min || 1) + (max-min ? minAllowed : maxAllowed);
}

function capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

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
    } else if ( ((window.location.host == 'tagpro.koalabeast.com') || (window.location.host == 'tagpro.gg')) && (window.location.pathname === '/') ) { //Choose server homepage
        return('home');
    }
}
var PageLoc = WhichPageAreWeOn();

function getUsefulText(value, what){
    if (what == 'gamemode') {
        if (value === 1) {
            return 'CTF';
        } else if (value === 2) {
            return 'Neutral Flag';
        } else {
            return '';
        }
    } else if (what == 'outcome') {
        if (value === '10') { //value must be passed as a string ('outcome'+'saved')
            return 'Win';
        } else if (value === '20') {
            return 'Loss';
        } else if (value === '30') {
            return 'DC';
        } else if (value === '41') {
            return 'Unsuccessful Save Attempt';
        } else if (value === '12') {
            return 'Successful Save Attempt';
        } else if (value === '50') {
            return 'Tie';
        }
    }
}

function getOldestGamesBlock(data, numberGamesToShow) {
    if (numberGamesToShow === 0) {
        return '';
    } else {
        numberGamesToShow = numberGamesToShow || 3;
    }

    if (data.length >= numberGamesToShow) {
        var blocks = '<div style="display:inline-block; margin-right:5px" title="Oldest '+numberGamesToShow+' Games">';
        for (var i=0; i<(numberGamesToShow); i++) {
            if (data[i].outcome === 1) {
                if (data[i].saved === 2) {
                    blocks += '<div class="fl_ssa" title="'+getGameInfoAsText(data[i])+'"></div>';
                } else {
                    blocks += '<div class="fl_win" title="'+getGameInfoAsText(data[i])+'"></div>';
                }
            } else if (data[i].outcome === 2) {
                blocks += '<div class="fl_loss" title="'+getGameInfoAsText(data[i])+'"></div>';
            } else if (data[i].outcome === 3) {
                blocks += '<div class="fl_dc" title="'+getGameInfoAsText(data[i])+'"></div>';
            } else if (data[i].outcome === 4) { //Save Attempt
                if (data[i].saved === 1) { //Unsuccessful
                    blocks += '<div class="fl_fsa" title="'+getGameInfoAsText(data[i])+'"></div>';
                }
            } else if (data[i].outcome === 5) { //Tie
                blocks += '<div class="fl_tie" title="'+getGameInfoAsText(data[i])+'"></div>';
            } else { //Unknown
                blocks += '<div class="fl_unk" title="'+getGameInfoAsText(data[i])+'"></div>';
            }
        }
        blocks+= '</div>';
        return blocks;
    } else {
        return '';
    }
}

function getLatestGamesBlock(data, numberGamesToShow) {
    if (numberGamesToShow === 0) {
        return '';
    } else {
        numberGamesToShow = numberGamesToShow || 3;
    }

    if (data.length >= numberGamesToShow) {
        var blocks = '<div style="display:inline-block; margin-left:5px" title="Latest '+numberGamesToShow+' Games">';
        for (var i=data.length-numberGamesToShow; i<data.length; i++) {
            if (data[i].outcome === 1) {
                if (data[i].saved === 2) {
                    blocks += '<div class="fl_ssa" title="'+getGameInfoAsText(data[i])+'"></div>';
                } else {
                    blocks += '<div class="fl_win" title="'+getGameInfoAsText(data[i])+'"></div>';
                }
            } else if (data[i].outcome === 2) {
                blocks += '<div class="fl_loss" title="'+getGameInfoAsText(data[i])+'"></div>';
            } else if (data[i].outcome === 3) {
                blocks += '<div class="fl_dc" title="'+getGameInfoAsText(data[i])+'"></div>';
            } else if (data[i].outcome === 4) { //Save Attempt
                if (data[i].saved === 1) { //Unsuccessful
                    blocks += '<div class="fl_fsa" title="'+getGameInfoAsText(data[i])+'"></div>';
                }
            } else if (data[i].outcome === 5) { //Tie
                blocks += '<div class="fl_tie" title="'+getGameInfoAsText(data[i])+'"></div>';
            } else { //Unknown
                blocks += '<div class="fl_unk" title="'+getGameInfoAsText(data[i])+'"></div>';
            }
        }
        blocks+= '</div>';
        return blocks;
    } else {
        return '';
    }
}

function getNextGamePercentage(data) {
    var i, wins=0, losses=0;
    var IfWin='', IfLose='';

    for (i=0; i<data.length; i++) {
        if (data[i].outcome == 1) {
            wins++;
        } else if ((data[i].outcome == 2) || (data[i].outcome == 3) || (data[i].outcome == 5)) {
            losses++;
        }
    }
    if (data[0].outcome === 1) {
        if (data.length < 300) {
            IfWin = ((wins+1) / (wins+1+losses) * 100).toFixed(2);
            IfLose = ((wins) / (wins+losses+1) * 100).toFixed(2);
            return ('<span style="color:'+O300_Selections.Win_Color.value+'">Win Next:&#42779;'+IfWin + '%</span> | <span style="color:'+O300_Selections.Loss_Color.value+'">Lose Next:&#42780;'+IfLose+'%</span>');
        } else if (data.length === 300) {
            IfLose = ((wins-1) / (wins-1+losses+1) * 100).toFixed(2);
            return ('<span style="color:'+O300_Selections.Win_Color.value+'">Win Next: No effect</span> | <span style="color:'+O300_Selections.Loss_Color.value+'">Lose Next:&#42780;'+IfLose+'%</span>');
        }
    } else if ((data[0].outcome === 2) || (data[0].outcome == 3)) {
        if (data.length < 300) {
            IfWin = ((wins+1) / (wins+1+losses) * 100).toFixed(2);
            IfLose = ((wins) / (wins+losses+1) * 100).toFixed(2);
            return ('<span style="color:'+O300_Selections.Win_Color.value+'">Win Next:&#42779;'+IfWin + '%</span> | <span style="color:'+O300_Selections.Loss_Color.value+'">Lose Next:&#42780;'+IfLose+'%</span>');
        } else if (data.length === 300) {
            IfWin = ((wins+1) / (wins+1+losses-1) * 100).toFixed(2);
            return ('<span style="color:'+O300_Selections.Win_Color.value+'">Win Next:&#42779;'+IfWin + '%</span> | <span style="color:'+O300_Selections.Loss_Color.value+'">Lose Next: No effect</span>');
        }
    } else if (data[0].outcome === 4) { //Save Attempt
        if (data[0].saved === 1) { //Unsuccessful
            IfWin = ((wins+1) / (wins+1+losses) * 100).toFixed(2);
            IfLose = ((wins) / (wins+losses+1) * 100).toFixed(2);
            return ('<span style="color:'+O300_Selections.Win_Color.value+'">Win Next:&#42779;'+IfWin + '%</span> | <span style="color:'+O300_Selections.Loss_Color.value+'">Lose Next:&#42780;'+IfLose+'%</span>');
        }
    } else if (data[0].outcome === 5) { //Tie
        if (data.length < 300) {
            IfWin = ((wins+1) / (wins+1+losses) * 100).toFixed(2);
            IfLose = ((wins) / (wins+losses+1) * 100).toFixed(2);
            return ('<span style="color:'+O300_Selections.Win_Color.value+'">Win Next:&#42779;'+IfWin + '%</span> | <span style="color:'+O300_Selections.Loss_Color.value+'">Lose Next:&#42780;'+IfLose+'%</span>');
        } else if (data.length === 300) {
            IfWin = ((wins+1) / (wins+1+losses-1) * 100).toFixed(2);
            return ('<span style="color:'+O300_Selections.Win_Color.value+'">Win Next:&#42779;'+IfWin + '%</span> | <span style="color:'+O300_Selections.Loss_Color.value+'">Lose Next: No effect</span>');
        }
    } else {
        return '';
    }
}

function getWinPercentage(data) {
    var i, wins=0, losses=0;
    if (data.length) {
        for (i=0; i<data.length; i++) {
            if (data[i].outcome == 1) {
                wins++;
            } else if ((data[i].outcome == 2) || (data[i].outcome == 3) || (data[i].outcome == 5)) {
                losses++;
            }
        }
        return (wins / (wins+losses) * 100).toFixed(2);
    }
}

function getGamesTilNextFlair(data, winP) { //thanks Snaps!
    var thresholds = [55, 65, 75];
    var threshold;
    var outcomes = data.map(function (d) { return d.outcome; });
    for (var i = 0; i < thresholds.length; i++) {
        if (winP < thresholds[i]) {
            threshold = thresholds[i];
            break;
        }
    }
    if (!threshold) return false;
    function getPct(vals) {
        return vals.goods / (vals.goods + vals.bads);
    }
    var bads = [2, 3, 5];
    var vals = outcomes.reduce(function (vals, outcome) {
        if (outcome === 1) {
            vals.goods++;
        } else if (bads.indexOf(outcome) !== -1) {
            vals.bads++;
        }
        return vals;
    }, { goods: 0, bads: 0 });

    var winsNeeded = 0;
    var game = 0;
    while (getPct(vals) * 100 < threshold && game < outcomes.length) {
        var outcome = outcomes[game];
        if (bads.indexOf(outcome) !== -1) {
            vals.goods++;
            vals.bads--;
        } else if (outcome === 4) {
            vals.goods++;
        }
        winsNeeded++;
        game++;
    }
    return {
        wins: winsNeeded,
        goal: threshold
    };
}

function showWinPercentageHeader(data) {
    if (data === undefined) data = $.extend(true, [], allGames);
    
    var blocks = "";
    
    // Oldest games...
    blocks += '<div style="display:inline-block">'+getOldestGamesBlock(data, O300_Selections.O300HeaderShowNGames.value)+'</div>';
    
    // Current Win %...
    var winP = getWinPercentage(data);
    blocks += '<div style="display:inline-block">Current: ' + winP + '%&nbsp;|&nbsp;</div>';
    
    // Predicted Win %...
    blocks += '<div class="O300_Stats_Dependent" style="display:inline-block; color:#bbb">' + getNextGamePercentage(data) + '</div>';
    
    // # of games to next % flair...
    if (data.length === 300) {
        var nextFlairInfo = getGamesTilNextFlair(data, winP);
        if (nextFlairInfo) {
            blocks += '&nbsp;|&nbsp;<div class="O300_Stats_Dependent" style="display:inline-block; color:#bbb">' + nextFlairInfo.wins + ' wins needed for ' + nextFlairInfo.goal + '% flair</div>';
        } else {
            blocks += '&nbsp;|&nbsp;<div class="O300_Stats_Dependent" style="display:inline-block; color:#bbb">You\'re above 75%!</div>';
        }
    }

    // Most recent games...
    blocks += '<div style="display:inline-block">'+getLatestGamesBlock(data, O300_Selections.O300HeaderShowNGames.value)+'</div>';
    $('#O300_WinNextHeader').append(blocks);

    $('.fl_win').css ({ 'display':'inline-block', 'margin-left':'1px'        , 'background-color':O300_Selections.Win_Color.value,     'height':'8px', 'width':'8px' });
    $('.fl_loss').css({ 'display':'inline-block', 'margin-left':'1px'        , 'background-color':O300_Selections.Loss_Color.value,    'height':'8px', 'width':'8px' });
    $('.fl_dc').css  ({ 'display':'inline-block', 'margin'     :'0 0 2px 1px', 'background-color':O300_Selections.DC_Color.value,      'height':'4px', 'width':'8px' });
    $('.fl_ssa').css ({ 'display':'inline-block', 'margin-left':'1px'        , 'background-color':O300_Selections.SSA_Color.value,     'height':'6px', 'width':'8px', 'border-top'   :'2px solid white' });
    $('.fl_fsa').css ({ 'display':'inline-block', 'margin-left':'1px'        , 'background-color':O300_Selections.FSA_Color.value,     'height':'6px', 'width':'8px', 'border-bottom':'2px solid white' });
    $('.fl_tie').css ({ 'display':'inline-block', 'margin-left':'1px'        , 'background-color':O300_Selections.Tie_Color.value,     'height':'8px', 'width':'8px' });
    $('.fl_unk').css ({ 'display':'inline-block', 'margin-left':'1px'        , 'background-color':O300_Selections.Unknown_Color.value, 'height':'8px', 'width':'8px' });
}

var allGames = [];
function loadData() {
    var data = $.extend(true, [], O300_Selections.O300SavedGames.value);
    
    if (data.length > 300) {
        while (data.length > 300) {
            data.shift();
        }
        O300_Selections.O300SavedGames.value = $.extend(true, [], data);
        GM_setValue('O300_Selections', O300_Selections);
    }

    if (data.length > 0) {
        for (var key=0, l=data.length; key<l; key++) {
            data[key].gameNumber = (data.length - key);
        }
        allGames = $.extend(true, [], data);
        $('#O300_loading').remove();
        if ($('#O300_WinNextHeader').length) {
            showWinPercentageHeader(data);
        }
        if ($('#O300').length) {
            $('#O300_Trimmed').show(0);
            showData();
            showTrimmedData(O300_Selections.MaxO300Games.value, O300_Selections.MaxO300Games.value);
            buildMenu();
            bindEvents();
            setSavedValues();
        }
    } else {
        $('#O300_Settings_Button').hide(0);
        $('#O300').empty();
        $('#O300').append('No data for STATS OFF Rolling 300 Timeline - go play some games!');
    }

    GM_addStyle('.O300_CTFNFWP:hover { border-bottom:1px dotted #9264DA }');
}

function buildMenu() {
    //Build the settings menu...
    $('#O300_Settings_Button').after('<div id="O300_Settings_Menu" style="display:none; position:absolute; right:0; width:300px; margin:-75px -50px 0 0; padding:10px 10px 15px; font-size:11px; text-align:left; background:linear-gradient(#3A8C66, #00a); opacity:0.95; border-radius:8px; box-shadow:0px 0px 8px #fff; z-index:6000"></div>');
    $('#O300_Settings_Menu').append('<div style="margin:0 auto; padding-bottom:5px; font-size:16px; font-weight:bold; color:#000; text-align:center; text-shadow:2px 1px 2px #aaa;">Stats OFF R300 Options</div>');
    var pages = [];
    $.each(O300_Selections, function(key, value) {
        if (value.type === 'checkbox') {
            if (key === 'ShowO300Intervals') {
                if (allGames.length === 300) { //Only show the bands if there's 300 games available...
                    $('#O300_Settings_Menu').append('<li style="list-style:none" title="' + value.title + '"><label><input type="checkbox" id="' + key + '" class="'+ value.type + '" ' + (value.value === true ? 'checked' : '') + '>' + value.display + '</label></li>');
                    $('#O300_Settings_Menu').append('<div id="O300WinBands" style="margin-left:18px; font-size:11px"></div>');
                    var intBands = (O300_Selections.O300WinBands.display).split(',');
                    $.each(intBands, function(k,v) {
                        $('#O300WinBands').append('<label style="margin-left:4px" title="# games"><input type="radio" name="intBand" data-band="'+v+'" ' + (v == O300_Selections.O300WinBands.value ? 'checked' : '') + ' style="margin:3px 1px 3px 3px">'+v+'</label>');
                    });
                }
            } else if (key === 'O300MainPages') {
                $('#O300_Settings_Menu').append('<div id="O300MainPages" style="text-align:center; font-size:11px">Main Window:</div>');
                pages = (O300_Selections.O300MainPages.display).split(',');
                $.each(pages, function(k,v) {
                    $('#O300MainPages').append('<label style="margin-left:4px"><input type="checkbox" name="mainPage" data-page="'+v+'" ' + ((O300_Selections.O300MainPages.title).indexOf(v) >= 0 ? 'checked' : '') + ' style="margin:3px 1px 3px 3px">'+v+'</label>');
                });
            } else if (key === 'O300HeaderPages') {
                $('#O300_Settings_Menu').append('<div id="O300HeaderPages" style="margin-bottom:5px; text-align:center; font-size:11px">Win % Header:</div>');
                pages = (O300_Selections.O300HeaderPages.display).split(',');
                $.each(pages, function(k,v) {
                    $('#O300HeaderPages').append('<label style="margin-left:4px"><input type="checkbox" name="headerPage" data-page="'+v+'" ' + ((O300_Selections.O300HeaderPages.title).indexOf(v) >= 0 ? 'checked' : '') + ' style="margin:3px 1px 3px 3px">'+v+'</label>');
                });
                $('#O300_Settings_Menu').append('<li style="list-style:none; text-align:center" title="' + O300_Selections.O300HeaderShowNGames.title + '"><label>' + O300_Selections.O300HeaderShowNGames.display + '</label><input type="number" id="O300HeaderShowNGames" min="0" max="10" value="'+O300_Selections.O300HeaderShowNGames.value+'" style="width:30px; font-size:11px; text-align:right"></li>');
            } else if (key === 'ShowLessThan300GamesWarning') { //this is the start of the "mini-window" options
                $('#O300_Settings_Menu').append('<li style="list-style:none; margin-top:10px">Mini-Window Options...</li>');
                $('#O300_Settings_Menu').append('<li style="list-style:none" title="' + value.title + '"><label><input type="checkbox" id="' + key + '" class="'+ value.type + '" ' + (value.value === true ? 'checked' : '') + '>' + value.display + '</label></li>');
            } else if (key === 'ShowO300HighestLowestEver') {
                $('#O300_Settings_Menu').append('<li style="list-style:none" title="' + value.title + '"><label><input type="checkbox" id="' + key + '" class="'+ value.type + '" ' + (value.value === true ? 'checked' : '') + '>' + value.display + '</label><div id="O300ClearHighestLowestEver" style="display:inline-block; margin:0 5px; font-size:7px; border:1px solid #099; cursor:pointer" title="Clear/Reset the saved high/low values">CLEAR</div></li>');
            } else {
                $('#O300_Settings_Menu').append('<li style="list-style:none" title="' + value.title + '"><label><input type="checkbox" id="' + key + '" class="'+ value.type + '" ' + (value.value === true ? 'checked' : '') + '>' + value.display + '</label></li>');
            }
        }
    });
    $('#O300_Settings_Menu').append('<div style="position:absolute; bottom:2px; right:5px; text-align:right"><a href="https://gist.github.com/nabbynz/23a54cace27ad097d671" target="_blank" style="font-size:11px; color:#888" title="Version: ' + GM_info.script.version + '. Click to manually check for updates (script will auto-update if enabled)...">v' + GM_info.script.version + '</a</div>');
}

function setSavedValues() {
    //update with the user saved values...
    $.each(O300_Selections, function(key, value) {
        if (key === 'O300MainPages') {
            if (PageLoc === 'server') {
                if (O300_Selections[key].title.indexOf('Home') < 0) {
                    $('#O300_InnerContainer').hide(0);
                } else {
                    $('#O300_InnerContainer').fadeIn(1200);
                }
            } else if ((PageLoc === 'profile') || (PageLoc === 'profileNotOurs')) {
                if (O300_Selections[key].title.indexOf('Profile') < 0) {
                    $('#O300').hide(0);
                } else {
                    $('#O300_InnerContainer').show(0);
                }
            } else if (PageLoc === 'joining') {
                if (O300_Selections[key].title.indexOf('Joiner') < 0) {
                    $('#O300').hide(0);
                } else {
                    $('#O300_InnerContainer').show(0);
                }
            }

        } else if (key == 'ShowO300PUPsPerGame') {
                if (value.value === true) {
                    $('#O300_PUPs').find('.O300_pups_pergame').show(0);
                    $('#O300_PUPs').find('.O300_pups_total').hide(0);
                } else {
                    $('#O300_PUPs').find('.O300_pups_pergame').hide(0);
                    $('#O300_PUPs').find('.O300_pups_total').show(0);
                }

        } else if (key === 'ShowBoxShadowBorder') {
            if (value.value === true) {
                $('#O300').css('box-shadow', '#fff 0px 0px 10px');
            } else {
                $('#O300').css('box-shadow', 'none');
            }

        } else if (value.type === 'checkbox') {
            //Hide certain elements according to the saved values...
            if (value.value === false) {
                if (key == 'ShowO300Timeline') {
                    $O300_Timeline.hide(0);
                } else if (key === 'ShowO300Intervals') {
                    $('#O300_Intervals').hide(0);
                    $('#O300WinBands').find('input').prop('disabled', true);
                } else if (key === 'ShowO300GamesPieChart') {
                    $('#O300_Pie').hide(0);
                } else if (key === 'ShowO300WinPercentage') {
                    $('#O300_Wins').hide(0);
                } else if (key === 'ShowO300PerDay') {
                    $('#O300_GamesPerDay').hide(0);
                } else if (key === 'ShowO300PerDayGraph') {
                    $('#O300_GamesPerDayGraph').hide(0);
                } else if (key === 'ShowO300Count') {
                    $('#O300_Count').hide(0);
                } else if (key === 'ShowO300HighestLowestEver') {
                    $('#O300_HighestLowestEver').hide(0);
                } else if (key === 'ShowO300CTFNF') {
                    $('#O300_CTFNF').hide(0);
                } else if (key === 'ShowO300NextGameAffect') {
                    $('#O300_NextGameAffectWin, #O300_NextGameAffectLose').hide(0);
                } else if (key === 'ShowO300OldestGame') {
                    $('#O300_OldestGame').hide(0);
                } else if (key === 'ShowO300BestStreak') {
                    $('#O300_BestStreak').hide(0);
                } else if (key === 'ShowO300CurrentStreak') {
                    $('#O300_CurrentStreak').hide(0);
                } else if (key === 'ShowO300WinStreakMessage') {
                    $('#O300_BestStreakMessage').hide(0);
                } else if (key === 'ShowO300LossStreakMessage') {
                    $('#O300_WorstStreakMessage').hide(0);
                } else if (key === 'ShowO300PUPs') {
                    $('#O300_PUPs').hide(0);
                } else if (key === 'ShowLessThan300GamesWarning') {
                    $('#O300_Trimmed').hide(0);
                    $('#ShowO300TrimmedGamesPieChart').prop('disabled', true);
                }
            }
        }
    });
}

function bindEvents() {
    $('#O300_Settings_Button').on('click', function() {
        $('#O300_Settings_Menu').slideToggle(400);
    });
    $("#O300_Settings_Menu").mouseleave(function() {
        $('#O300_Settings_Menu').fadeOut(100);
    });
    $('#O300WinBands').find('input').on('click', function() {
        O300_Selections.O300WinBands.value = $(this).data('band');
        GM_setValue('O300_Selections', O300_Selections);
        showData();
        if (O300_Selections.ShowLessThan300GamesWarning.value) showTrimmedData(O300_Selections.MaxO300Games.value, O300_Selections.MaxO300Games.value);
    });
    $('#O300MainPages').find('input').on('click', function() {
        var newSelection = '';
        $.each($('#O300MainPages').find('input'), function() {
            if ($(this).is(':checked')) newSelection += $(this).data('page') + ",";
        });
        O300_Selections.O300MainPages.title = newSelection;
        GM_setValue('O300_Selections', O300_Selections);
        if (($(this).data('page') === 'Home') && (PageLoc === 'server')) {
            $('#O300_InnerContainer').slideToggle(600);
        } else if (($(this).data('page') === 'Profile') && ((PageLoc === 'profile') || (PageLoc === 'profileNotOurs'))) {
            $('#O300').slideToggle(600);
        }
    });
    $('#O300HeaderPages').find('input').on('click', function() {
        var newSelection = '';
        $.each($('#O300HeaderPages input'), function() {
            if ($(this).is(':checked')) newSelection += $(this).data('page') + ",";
        });
        O300_Selections.O300HeaderPages.title = newSelection;
        GM_setValue('O300_Selections', O300_Selections);
        if (($(this).data('page') === 'Home') && (PageLoc === 'server')) {
            if ($('#O300_WinNextHeader').length) {
                $('#O300_WinNextHeader').slideToggle(400);
            } else {
                $('body').prepend(WinP_Div);
                $('#O300_WinNextHeader').hide(0);
                showWinPercentageHeader();
                $('#O300_WinNextHeader').slideDown(400);
            }
        } else if (($(this).data('page') === 'Profile') && ((PageLoc === 'profile') || (PageLoc === 'profileNotOurs'))) {
            if ($('#O300_WinNextHeader').length) {
                $('#O300_WinNextHeader').slideToggle(400);
            } else {
                $('body').prepend(WinP_Div);
                $('#O300_WinNextHeader').hide(0);
                showWinPercentageHeader();
                $('#O300_WinNextHeader').slideDown(400);
            }
        }
    });
    $('#O300HeaderShowNGames').on('change', function() {
        O300_Selections.O300HeaderShowNGames.value = parseInt(this.value);
        GM_setValue('O300_Selections', O300_Selections);
        $('#O300_WinNextHeader').remove();
        $('body').prepend(WinP_Div);
        showWinPercentageHeader();
    });
    $('#O300_Settings_Menu').find('.checkbox').on('click', function() {
        O300_Selections[$(this).attr('id')].value = $(this).is(':checked');
        GM_setValue('O300_Selections', O300_Selections);
        if ($(this).attr('id') == 'ShowO300Timeline') {
            $O300_Timeline.fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowO300Intervals') {
            $('#O300_Intervals').fadeToggle(400);
            $('#O300WinBands').find('input').prop('disabled', ($(this).prop('checked') ? false : true));
        } else if ($(this).attr('id') == 'ShowO300GamesPieChart') {
            $('#O300_Pie').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowO300Pages') {
            $('#O300_WinNextHeader').fadeToggle(400);
            $('#O300HeaderPages').find('input').prop('disabled', ($(this).prop('checked') ? false : true));
        } else if ($(this).attr('id') == 'ShowO300WinPercentage') {
            $('#O300_Wins').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowO300PerDay') {
            $('#O300_GamesPerDay').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowO300PerDayGraph') {
            $('#O300_GamesPerDayGraph').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowO300Count') {
            $('#O300_Count').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowO300HighestLowestEver') {
            $('#O300_HighestLowestEver').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowO300CTFNF') {
            $('#O300_CTFNF').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowO300NextGameAffect') {
            $('#O300_NextGameAffectWin, #O300_NextGameAffectLose').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowO300OldestGame') {
            $('#O300_OldestGame').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowO300BestStreak') {
            $('#O300_BestStreak').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowO300CurrentStreak') {
            $('#O300_CurrentStreak').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowO300WinStreakMessage') {
            $('#O300_BestStreakMessage').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowO300LossStreakMessage') {
            $('#O300_WorstStreakMessage').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowO300PUPs') {
            $('#O300_PUPs').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowO300TrimmedPUPs') {
            $('#O300T_PUPs').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowO300PUPsPerGame') {
            $('#O300_PUPs').find('.O300_pups_pergame').toggle(0);
            $('#O300_PUPs').find('.O300_pups_total').toggle(0);
        } else if ($(this).attr('id') == 'ShowO300ShowGap') {
            showData();
            if (O300_Selections.ShowLessThan300GamesWarning.value) showTrimmedData(O300_Selections.MaxO300Games.value, O300_Selections.MaxO300Games.value);
            setSavedValues();
        } else if ($(this).attr('id') == 'ShowLessThan300GamesWarning') { //Not a warning anymore - just an on/off toggle for the mini window
            $('#O300_Trimmed').fadeToggle(400);
            $('#ShowO300TrimmedGamesPieChart').prop('disabled', ($(this).prop('checked') ? false : true));
            $('#ShowO300TrimmedPUPs').prop('disabled', ($(this).prop('checked') ? false : true));
            $('#AlwaysShowLastDayPlayed').prop('disabled', ($(this).prop('checked') ? false : true));
            if (O300_Selections.ShowLessThan300GamesWarning.value) {
                setTimelineCellHeights(Cell_Width);
                showTrimmedData(O300_Selections.MaxO300Games.value, O300_Selections.MaxO300Games.value);
            }
        } else if ($(this).attr('id') == 'ShowO300TrimmedGamesPieChart') {
            if (O300_Selections.ShowLessThan300GamesWarning.value) showTrimmedData(O300_Selections.MaxO300Games.value, O300_Selections.MaxO300Games.value);
        } else if ($(this).attr('id') == 'ShowBoxShadowBorder') {
            if ($(this).is(':checked')) {
                $('#O300').css('box-shadow', '#fff 0px 0px 10px');
            } else {
                $('#O300').css('box-shadow', 'none');
            }
        }
    });
    $('#O300ClearHighestLowestEver').on('click', function() {
        var response = confirm("Your current highest/lowest saved values will be cleared.\n\nOK to continue?");
        if (response) {
            GM_deleteValue('O300_HighestEver');
            GM_deleteValue('O300_LowestEver');
            showData();
            setSavedValues();
        }
    });
}

function setTimelineCellHeights(Cell_Width) {
    Cell_Width = Cell_Width || 1;

    $('#O300_Timeline').find('.o300_win').css     ({ 'display':'inline-block', 'position':'relative', 'cursor':'pointer', 'margin-left':               (O300_Selections.ShowO300ShowGap.value ? 1 : 0)+'px', 'background-color':O300_Selections.Win_Color.value,     'height':'10px', 'width':Cell_Width+'px' });
    $('#O300_Timeline').find('.o300_loss').css    ({ 'display':'inline-block', 'position':'relative', 'cursor':'pointer', 'margin-left':               (O300_Selections.ShowO300ShowGap.value ? 1 : 0)+'px', 'background-color':O300_Selections.Loss_Color.value,    'height':'10px', 'width':Cell_Width+'px' });
    $('#O300_Timeline').find('.o300_dc').css      ({ 'display':'inline-block', 'position':'relative', 'cursor':'pointer', 'margin'     :'0px 0px 2px '+(O300_Selections.ShowO300ShowGap.value ? 1 : 0)+'px', 'background-color':O300_Selections.DC_Color.value,      'height':' 6px', 'width':Cell_Width+'px' });
    $('#O300_Timeline').find('.o300_ssa').css     ({ 'display':'inline-block', 'position':'relative', 'cursor':'pointer', 'margin-left':               (O300_Selections.ShowO300ShowGap.value ? 1 : 0)+'px', 'background-color':O300_Selections.SSA_Color.value,     'height':' 7px', 'width':Cell_Width+'px', 'border-top':'3px solid white' });
    $('#O300_Timeline').find('.o300_fsa').css     ({ 'display':'inline-block', 'position':'relative', 'cursor':'pointer', 'margin-left':               (O300_Selections.ShowO300ShowGap.value ? 1 : 0)+'px', 'background-color':O300_Selections.FSA_Color.value,     'height':' 7px', 'width':Cell_Width+'px', 'border-bottom':'3px solid white' });
    $('#O300_Timeline').find('.o300_tie').css     ({ 'display':'inline-block', 'position':'relative', 'cursor':'pointer', 'margin-left':               (O300_Selections.ShowO300ShowGap.value ? 1 : 0)+'px', 'background-color':O300_Selections.Tie_Color.value,     'height':'10px', 'width':Cell_Width+'px' });
    $('#O300_Timeline').find('.o300_unknown').css ({ 'display':'inline-block', 'position':'relative', 'cursor':'pointer', 'margin-left':               (O300_Selections.ShowO300ShowGap.value ? 1 : 0)+'px', 'background-color':O300_Selections.Unknown_Color.value, 'height':'10px', 'width':Cell_Width+'px' });
}

function getGameInfoAsText(gameData) {
    var text = "Game #" + gameData.gameNumber + ": ";

    if (gameData.outcome === 1) {
        if (gameData.saved === 2) {
            text += 'Win - Successful Save Attempt! (' + getUsefulText(gameData.gameMode, 'gamemode') + ')';
        } else {
            text += 'Win (' + getUsefulText(gameData.gameMode, 'gamemode') + ')';
        }
    } else if (gameData.outcome === 2) {
        text += 'Loss (' + getUsefulText(gameData.gameMode, 'gamemode') + ')';
    } else if (gameData.outcome === 3) {
        text += 'DC/Loss (' + getUsefulText(gameData.gameMode, 'gamemode') + ')';
    } else if (gameData.outcome === 4) { //Save Attempt
        if (gameData.saved === 1) { //Unsuccessful
            text += 'Unsuccessful Save Attempt (' + getUsefulText(gameData.gameMode, 'gamemode') + ')';
        }
    } else if (gameData.outcome === 5) { //Tie
        text += 'Tie/Loss (' + getUsefulText(gameData.gameMode, 'gamemode') + ')';
    } else { //Unknown
        text += 'Unknown Result!';
    }

    var playedFor = (gameData.timePlayed / gameData.fullGameLength * 100).toFixed(2);
    if (playedFor >= 100) playedFor = 100;
    text += "\n" + gameData.mapName + " by " + gameData.mapAuthor +
            "\n" + new Date(parseInt(Date.parse(gameData.played))).toLocaleTimeString() + ' (' + new Date(parseInt(Date.parse(gameData.played))).toDateString() + ')' +
            "\nYou played for " + secondsToHMS(gameData.timePlayed) + ' ('+ playedFor + '%)' +
            "\n\nCaps: " + gameData.captures + " | Grabs: " + gameData.grabs + " | Drops: " + gameData.drops + " | Popped: " + gameData.pops + " | Tags: " + gameData.tags + " | Returns: " + gameData.returns +
            "\nHold: " + secondsToHMS(gameData.hold) + " | Prevent: " + secondsToHMS(gameData.prevent) + " | Support: " + gameData.support + " | PUP%: " + (gameData.powerups / gameData.potentialPowerups * 100).toFixed(2) + 
            "\nCaps/Grab: " + ((gameData.grabs?gameData.captures:0)/(gameData.grabs?gameData.grabs:1)).toFixed(3) + " | Tags/Pop: " + ((gameData.pops?gameData.tags:0)/(gameData.pops?gameData.pops:1)).toFixed(3);

    return text;
}



/************************************************************************************/
// Main Rolling 300 Timeline & Streaks...
/************************************************************************************/
function showData() {
    var Timeline_MaxWidth = 780;
    var Cell_Width = 10; //This value will adjust (smaller) according to MaxGames & Timeline_MaxWidth. Default=10
    var i, j;

    var totals = {'all':     { win:0, loss:0, dc:0, ssa:0, fsa:0, tie:0 },
                  'ctf':     { win:0, loss:0, dc:0, ssa:0, fsa:0, tie:0 },
                  'nf':      { win:0, loss:0, dc:0, ssa:0, fsa:0, tie:0 },
                  'pups':    { tags:0, pops:0, grabs:0, drops:0, hold:0, captures:0, prevent:0, returns:0, support:0, powerups:0, timePlayed:0 },
                  'streaks': { win:0, loss:0, temp_win:0, temp_loss:0, last_win:0, last_loss:0 }
                 };

    var data = $.extend(true, [], allGames);

    var New_Cell_Width = Math.floor((Timeline_MaxWidth - 26) / data.length);
    if (New_Cell_Width < Cell_Width) Cell_Width = New_Cell_Width - (O300_Selections.ShowO300ShowGap.value ? 1 : 0);
    if (Cell_Width <= 0) Cell_Width = 1;

    $('#O300_Intervals').empty();
    $O300_Timeline.empty();
    $O300_Messages.empty();
    $('#O300_Pie').empty();
    $('#O300_PUPs').remove();

    var totalPotentialPowerups = 0;

    var dayCounts = [];
    var dayCountsKey=0;
    var d1 = '';
    var d2 = '';
    var NF_Marker = '<div title="Neutral Flag Game" style="position:absolute; width:'+Cell_Width+'px; height:1px; bottom:-2px; background:#ccc"></div>';

    $(data).each(function(key, value) {
        d1 = new Date(value.played);
        if (key === 0) { //first game, nothing to compare to yet so just push it
            dayCounts.push( { day:d1.toDateString(), firstGameNumber:key, win:0, loss:0, dc:0, ssa:0, fsa:0, tie:0, timePlayed:0 } );
        } else {
            j = Math.ceil((d1 - d2) / (1000 * 3600 * 24));
            if ( (d2 !== '') && (d1.toDateString() !== d2.toDateString()) ) {
                for (i=dayCountsKey+1; i<dayCountsKey+j; i++) {
                    dayCounts.push( { day:0, firstGameNumber:0, win:0, loss:0, dc:0, ssa:0, fsa:0, tie:0, timePlayed:0 } ); //push 0's for the in-between days we haven't played on (this could get big?!?)
                }
                dayCounts.push( { day:d1.toDateString(), firstGameNumber:key, win:0, loss:0, dc:0, ssa:0, fsa:0, tie:0, timePlayed:0 } );
                dayCountsKey += j;
            }
        }
        d2 = d1; //save for compare on next loop
        dayCounts[dayCountsKey].timePlayed += value.timePlayed;

        totalPotentialPowerups += value.potentialPowerups;
        $.each(totals.pups, function(key1, value1) {
            totals.pups[key1] += value[key1];
        });

        switch (value.outcome) {
            case 1: //win
                if (value.saved === 2) {
                    totals.all.ssa++;
                    dayCounts[dayCountsKey].ssa++;
                    if (value.gameMode === 1) {
                        totals.ctf.ssa++;
                    } else if (value.gameMode === 2) {
                        totals.nf.ssa++;
                    }
                    $O300_Timeline.append('<div class="o300_ssa" data-gamenumber="' + (data.length-key) + '" title="' + getGameInfoAsText(value) + '">'+(value.gameMode === 2 ? NF_Marker : '')+'</div>');
                } else {
                    totals.all.win++;
                    dayCounts[dayCountsKey].win++;
                    if (value.gameMode === 1) {
                        totals.ctf.win++;
                    } else if (value.gameMode === 2) {
                        totals.nf.win++;
                    }
                    $O300_Timeline.append('<div class="o300_win" data-gamenumber="' + (data.length-key) + '" title="' + getGameInfoAsText(value) + '">'+(value.gameMode === 2 ? NF_Marker : '')+'</div>');
                }

                //streak...
                i=key;
                while ( (i > 0) && ((data[i-1].outcome === 4)&&(data[i-1].saved === 1)) ) { //unsuccessful saves shouldn't break a streak!
                    i--;
                }
                if ( (totals.streaks.temp_win === 0) || ((i > 0) && ((data[i-1].outcome === 1)) ) ) totals.streaks.temp_win++;
                if (totals.streaks.temp_win > totals.streaks.win) totals.streaks.win = totals.streaks.temp_win;
                totals.streaks.temp_loss = 0;
                if (totals.streaks.temp_win > 0) totals.streaks.last_win = totals.streaks.temp_win;

                break;

            case 2: //loss
                totals.all.loss++;
                dayCounts[dayCountsKey].loss++;
                if (value.gameMode === 1) {
                    totals.ctf.loss++;
                } else if (value.gameMode === 2) {
                    totals.nf.loss++;
                }
                $O300_Timeline.append('<div class="o300_loss" data-gamenumber="' + (data.length-key) + '" title="' + getGameInfoAsText(value) + '">'+(value.gameMode === 2 ? NF_Marker : '')+'</div>');

                //streak...
                i=key;
                while ( (i > 0) && ((data[i-1].outcome === 4)&&(data[i-1].saved === 1)) ) {
                    i--;
                }
                if ( (totals.streaks.temp_loss === 0) || ((i > 0) && ((data[i-1].outcome === 2) || (data[i-1].outcome === 3) || (data[i-1].outcome === 5)) ) ) totals.streaks.temp_loss++;
                if (totals.streaks.temp_loss > totals.streaks.loss) totals.streaks.loss = totals.streaks.temp_loss;
                totals.streaks.temp_win = 0;
                if (totals.streaks.temp_loss > 0) totals.streaks.last_loss = totals.streaks.temp_loss;

                break;

            case 3: //dc
                totals.all.dc++;
                dayCounts[dayCountsKey].dc++;
                if (value.gameMode === 1) {
                    totals.ctf.dc++;
                } else if (value.gameMode === 2) {
                    totals.nf.dc++;
                }
                $O300_Timeline.append('<div class="o300_dc" data-gamenumber="' + (data.length-key) + '" title="' + getGameInfoAsText(value) + '">'+(value.gameMode === 2 ? NF_Marker : '')+'</div>');

                //streak...
                i=key;
                while ( (i > 0) && ((data[i-1].outcome === 4)&&(data[i-1].saved === 1)) ) {
                    i--;
                }
                if ( (totals.streaks.temp_loss === 0) || ((i > 0) && ((data[i-1].outcome === 2) || (data[i-1].outcome === 3) || (data[i-1].outcome === 5)) ) ) totals.streaks.temp_loss++;
                if (totals.streaks.temp_loss > totals.streaks.loss) totals.streaks.loss = totals.streaks.temp_loss;
                totals.streaks.temp_win = 0;
                if (totals.streaks.temp_loss > 0) totals.streaks.last_loss = totals.streaks.temp_loss;

                break;

            case 4: //save attempt
                if (value.saved === 1) { //failed save attempt...
                    totals.all.fsa++;
                    dayCounts[dayCountsKey].fsa++;
                    if (value.gameMode === 1) {
                        totals.ctf.fsa++;
                        $O300_Timeline.append('<div class="o300_fsa" data-gamenumber="' + (data.length-key) + '" title="' + getGameInfoAsText(value) + '"></div>');
                    } else if (value.gameMode === 2) {
                        totals.nf.fsa++;
                        //we need to change the 'bottom' value for fsa's as it gets messed up otherwise. Since there aren't many, we're just doing it this way :\
                        $O300_Timeline.append('<div class="o300_fsa" data-gamenumber="' + (data.length-key) + '" title="' + getGameInfoAsText(value) + '"><div title="Neutral Flag Game" style="position:absolute; width:'+Cell_Width+'px; height:1px; bottom:-5px; background:#ccc"></div></div>');
                    }
                }

                break;

            case 5: //tie
                totals.all.tie++;
                dayCounts[dayCountsKey].tie++;
                if (value.gameMode === 1) {
                    totals.ctf.tie++;
                } else if (value.gameMode === 2) {
                    totals.nf.tie++;
                }
                $O300_Timeline.append('<div class="o300_tie" data-gamenumber="' + (data.length-key) + '" title="' + getGameInfoAsText(value) + '">'+(value.gameMode === 2 ? NF_Marker : '')+'</div>');

                //streak...
                i=key;
                while ( (i > 0) && ((data[i-1].outcome === 4)&&(data[i-1].saved === 1)) ) {
                    i--;
                }
                if ( (totals.streaks.temp_loss === 0) || ((i > 0) && ((data[i-1].outcome === 2) || (data[i-1].outcome === 3) || (data[i-1].outcome === 5)) ) ) totals.streaks.temp_loss++;
                if (totals.streaks.temp_loss > totals.streaks.loss) totals.streaks.loss = totals.streaks.temp_loss;
                totals.streaks.temp_win = 0;
                if (totals.streaks.temp_loss > 0) totals.streaks.last_loss = totals.streaks.temp_loss;

                break;

            default: //just in case!
                title += getGameInfoAsText(value);
                $O300_Timeline.append('<div class="o300_unknown" data-gamenumber="' + (data.length-key) + '" title="' + getGameInfoAsText(value) + '">'+(value.gameMode === 2 ? NF_Marker : '')+'</div>');

                break;

        }
    });

    setTimelineCellHeights(Cell_Width);

    //Win %...
    var currentWinPC = ((totals.all.win+totals.all.ssa) / (totals.all.win+totals.all.ssa + totals.all.loss+totals.all.dc+totals.all.tie) * 100).toFixed(2);
    $O300_Messages.append('<div id="O300_Wins">Win % over your last <span style="color:' + O300_Selections.Win_Color.value + '">' + data.length + '</span> games: <span style="color:'+O300_Selections.Win_Color.value+'">' + currentWinPC + '%</span></div>');

    //Game Count...
    $O300_Messages.append('<div id="O300_Count" style="font-size:11px">(<span style="color:'+O300_Selections.Win_Color.value+'">' + (totals.all.win) + ' Win'+((totals.all.win)==1?'':'s')+'</span> | <span style="color:'+O300_Selections.Loss_Color.value+'">'+ (totals.all.loss) + ' Loss'+(totals.all.loss==1?'':'es')+'</span> | <span style="color:'+O300_Selections.Tie_Color.value+'" title="Ties are counted as a Loss">'+ (totals.all.tie) + ' Tie'+(totals.all.tie==1?'':'s')+'</span> | <span style="color:'+O300_Selections.DC_Color.value+'" title="DC\'s are counted as a Loss">' + totals.all.dc + ' DC'+(totals.all.dc==1?'':'s')+'</span> | <span style="color:'+O300_Selections.SSA_Color.value+'" title="Counts as a Win!">' + totals.all.ssa + ' Save'+(totals.all.ssa==1?'':'s')+'</span> | <span style="color:'+O300_Selections.FSA_Color.value+'" title="Unsuccessful Save Attempts do NOT count as a Loss (or a Win)">' + totals.all.fsa + ' USA'+(totals.all.fsa==1?'':'s')+'</span>)</div>');

    //Highest/Lowest % Ever (while running this script)...
    GM_deleteValue('R300_LowestEver');
    if (PageLoc !== 'profileNotOurs') {
        if (currentWinPC > GM_getValue('O300_HighestEver', 0)) GM_setValue('O300_HighestEver', currentWinPC);
        if ((currentWinPC < GM_getValue('O300_LowestEver', 100)) && (currentWinPC > 0)) GM_setValue('O300_LowestEver', currentWinPC);
        $O300_Messages.append('<div id="O300_HighestLowestEver" title="'+O300_Selections.ShowO300HighestLowestEver.title+'"><span style="color:#2CAD9C'+(currentWinPC === GM_getValue('O300_HighestEver') ? '; text-decoration:underline':'')+'" title="Highest Win % Ever">Highest: ' + GM_getValue('O300_HighestEver') + '%</span> | <span style="color:#2CAD9C'+(currentWinPC === GM_getValue('O300_LowestEver') ? '; text-decoration:underline':'')+'" title="Lowest Win % Ever">Lowest: ' + GM_getValue('O300_LowestEver') + '%</span></div>');
    }

    //CTF / NF...
    var totalCTF = (totals.ctf.win+totals.ctf.ssa + totals.ctf.loss+totals.ctf.dc+totals.ctf.tie);
    var CTFWinPC = (totalCTF === 0) ? 0 : ((totals.ctf.win+totals.ctf.ssa) / totalCTF * 100).toFixed(2);
    var totalNF = (totals.nf.win+totals.nf.ssa + totals.nf.loss+totals.nf.dc+totals.nf.tie);
    var NFWinPC = (totalNF === 0) ? 0 : ((totals.nf.win+totals.nf.ssa) / totalNF * 100).toFixed(2);
    $O300_Messages.append('<div id="O300_CTFNF"><span id="O300_CTFWP" class="O300_CTFNFWP" style="color:#9264DA; cursor:pointer" title="Click to show CTF games">CTF: ' + CTFWinPC + '% ('+(totalCTF+totals.ctf.fsa)+')</span> | <span id="O300_NFWP" class="O300_CTFNFWP" style="color:#9264DA; cursor:pointer" title="Click to show Neutral Flag games">NF: ' + NFWinPC + '% ('+(totalNF+totals.nf.fsa)+')</span></div>');

    //Oldest Game...
    var oldestGame = getUsefulText( (data[0].outcome.toString() + data[0].saved.toString()), 'outcome');
    $O300_Messages.append('<div id="O300_OldestGame">Oldest game: ' + (oldestGame) + '</div>');

    //How next game affect's Win%...
    $O300_Messages.append('<div id="O300_NextGameAffectLose">' + getNextGamePercentage(data) + '</div>');

    //Win % Bands...
    if (data.length === 300) {
        var intervalSize = O300_Selections.O300WinBands.value;
        var int_win, int_loss;
        var intervalWins = [];
        for (i=0; i<data.length; i+=intervalSize) {
            int_win=0;
            int_loss=0;
            for (j=i; j<i+intervalSize; j++) {
                if (data[j].outcome == 1) {
                    int_win++;
                } else if ((data[j].outcome == 2) || (data[j].outcome == 3) || (data[j].outcome == 5)) {
                    int_loss++;
                }
            }
            intervalWins.push((int_win / (int_win + int_loss))*100);

            if (i % intervalSize === 0) {
                var IntervalCellWidth = ((Cell_Width+(O300_Selections.ShowO300ShowGap.value ? 1 : 0))*intervalSize-1);
                var IntervalMarginLeft = 0;
                if ((i === 0) || (i === data.length-intervalSize)) { //need to adjust for first & last cells...
                    IntervalCellWidth = ((Cell_Width+(O300_Selections.ShowO300ShowGap.value ? 1 : 0))*intervalSize-2);
                    if (i === 0) IntervalMarginLeft = 2;
                }
                $('#O300_Intervals').append('<div class="O300_Interval" data-firstgame="'+(data.length-i)+'" style="display:inline-block; cursor:pointer; font-size:11px; color:#777; width:'+IntervalCellWidth+'px; height:10px; ' + (i===0 ? 'border-left:1px solid #777; ' : '') + 'border-right:1px solid #777; margin-left:'+IntervalMarginLeft+'px;" title="Games: ' + (data.length-i-intervalSize+1) + '-' + (data.length-i) + ' (' +intervalSize+')">&nbsp;'+ (intervalWins[i/intervalSize]).toFixed(1) + '%</div>');
            }
        }
    }

    //Games Pie Chart...
    $O300_Messages.append('<div id="O300_Pie"></div>');
    $('#O300_Pie').append('<canvas id="O300_GamesPieChart" width="80" height="80" style="margin:0 50px"></canvas>');
    var ctx = $("#O300_GamesPieChart").get(0).getContext("2d");

    var gamesPieData = [totals.all.win, totals.all.loss, totals.all.tie, totals.all.dc, totals.all.fsa, totals.all.ssa];

    var options = {segmentShowStroke: false,
                   animationEasing: "easeOutQuart",
                   animationSteps: 50,
                   tooltipFontSize: 11,
                   tooltipTitleFontStyle: "normal",
                   tooltipXPadding: 3,
                   tooltipYPadding: 3,
                   tooltipCaretSize: 5,
                   tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>"
                  };
    var gamesPieDataSets = [
        {value: gamesPieData[0],
         color: O300_Selections.Win_Color.value,
         highlight: '#67ff67',
         label: 'Win'
        },
        {value: gamesPieData[1],
         color: O300_Selections.Loss_Color.value,
         highlight: '#ff4343',
         label: 'Loss'
        },
        {value: gamesPieData[2],
         color: O300_Selections.Tie_Color.value,
         highlight: '#ffcc7b',
         label: 'Tie'
        },
        {value: gamesPieData[3],
         color: O300_Selections.DC_Color.value,
         highlight: '#fffe8d',
         label: 'DC'
        },
        {value: gamesPieData[4],
         color: O300_Selections.FSA_Color.value,
         highlight: '#51c6e7',
         label: 'USA'
        },
        {value: gamesPieData[5],
         color: O300_Selections.SSA_Color.value,
         highlight: '#88e888',
         label: 'SSA'
        }
    ];
    
    var pieLoadDelay = 200;
    if ((PageLoc === 'profile') || (PageLoc === 'profileNotOurs')) pieLoadDelay = 400;
    else if (PageLoc === 'joining') pieLoadDelay = 700;
    
    setTimeout(function() {
        window.requestAnimationFrame(function() {
            var myPieChart = new Chart(ctx).Pie(gamesPieDataSets, options);
        });
    }, pieLoadDelay);

    //Best Streaks...
    $O300_Messages.append('<div id="O300_BestStreak" style="text-align:center">Best Streaks: <span style="color:' + O300_Selections.Win_Color.value + '">' + totals.streaks.win + ' Win' + (totals.streaks.win == 1 ? '' : 's') + '</span> | <span style="color:' + O300_Selections.Loss_Color.value + '">' + totals.streaks.loss + ' Loss' + (totals.streaks.loss == 1 ? '' : 'es') + '</span></div>');

    //Current Streak...
    if (data[data.length-1].outcome === 1) {
        $O300_Messages.append('<div id="O300_CurrentStreak" style="text-align:center">Current Streak: <span style="color:' + O300_Selections.Win_Color.value + '">' + totals.streaks.last_win + ' Win' + (totals.streaks.last_win == 1 ? '' : 's') + '</span></div>');
    } else if ((data[data.length-1].outcome === 2) || (data[data.length-1].outcome === 3)) {
        $O300_Messages.append('<div id="O300_CurrentStreak" style="text-align:center">Current Streak: <span style="color:' + O300_Selections.Loss_Color.value + '">' + totals.streaks.last_loss + ' Loss' + (totals.streaks.last_loss == 1 ? '' : 'es') + '</span></div>');
    }

    //Best Streak Messages...
    if ( (data[data.length-1].outcome === 1) && (totals.streaks.last_win >= totals.streaks.win) && (data.length > 5) ) {
        $O300_Messages.append('<div id="O300_BestStreakMessage" style="padding:3px 0; text-align:center; border-radius:5px; color:#fff; background-color:' + O300_Selections.Win_Color.value + '">You are currently on your best win streak!!!</div>');
    } else if ( (data[data.length-1].outcome === 1) && (totals.streaks.last_win == totals.streaks.win-1) && (data.length > 5) ) {
        $O300_Messages.append('<div id="O300_BestStreakMessage" style="padding:3px 0; text-align:center; border-radius:5px; color:#fff; background-color:' + O300_Selections.Win_Color.value + '">You are just <u>1 win away</u> from your best win streak!</div>');
    }

    //Worst Streak Messages...
    if ( ((data[data.length-1].outcome === 2) || (data[data.length-1].outcome === 3)) && (totals.streaks.last_loss >= totals.streaks.loss) && (data.length > 5) ) {
        $O300_Messages.append('<div id="O300_WorstStreakMessage" style="padding:3px 0; text-align:center; border-radius:5px; color:#fff; background-color:' + O300_Selections.Loss_Color.value + '">You are currently on your worst losing streak :(</div>');
    } else if ( ((data[data.length-1].outcome === 2) || (data[data.length-1].outcome === 3)) && (totals.streaks.last_loss == totals.streaks.loss-1) && (data.length > 5) ) {
        $O300_Messages.append('<div id="O300_WorstStreakMessage" style="padding:3px 0; text-align:center; border-radius:5px; color:#fff; background-color:' + O300_Selections.Loss_Color.value + '">You are only <u>1 loss away</u> from your worst losing streak...</div>');
    }

    //# Games Per Day Bar Graph...
    var minPlays=1000, maxPlays=0, daysWithGamesCount=0;
    var gamesperday_barwidth = Math.floor(300 / dayCounts.length);
    if (gamesperday_barwidth < 1) gamesperday_barwidth = 1;
    if (gamesperday_barwidth > 10) gamesperday_barwidth = 10;

    $.each(dayCounts, function(key, value) {
        i = (value.win+value.loss+value.dc+value.ssa+value.fsa+value.tie);
        if (i > maxPlays) maxPlays = i;
        if (i < minPlays) minPlays = i;
        if (i > 0) daysWithGamesCount++;
    });

    if (O300_Selections.AlwaysShowLastDayPlayed.value) {
        O300_Selections.MaxO300Games.value = data.length - dayCounts[dayCounts.length-1].firstGameNumber;
    }
    var totalTimePlayed = 0;
    $O300_Messages.append('<div id="O300_GamesPerDayGraph" style="display:flex; align-items:baseline; width:'+(dayCounts.length*(gamesperday_barwidth+(dayCounts.length < 200 ? 1 : 0)))+'px; max-width:420px; margin:2px auto 0; border-bottom:1px solid #fff"></div>');
    var $O300_GamesPerDayGraph = $('#O300_GamesPerDayGraph');
    var minBarHeight = maxPlays - minPlays;
    if (minBarHeight > 10) minBarHeight = 10;
    $.each(dayCounts, function(key, value) {
        i = (value.win+value.loss+value.dc+value.ssa+value.fsa+value.tie);
        totalTimePlayed += dayCounts[key].timePlayed;
        $O300_GamesPerDayGraph.append('<div id="O300_GamesPerDay_Bar_'+key+'" class="O300_GamesPerDay_Bar" data-firstgame="'+(data.length-value.firstGameNumber)+'" data-gamecount="'+i+'" style="height:'+scaleBetween(i, (i?minBarHeight:0), 30, minPlays, maxPlays)+'px; width:'+gamesperday_barwidth+'px" title="'+i+' Games on ' + dayCounts[key].day + " (" + secondsToHMS(dayCounts[key].timePlayed) + " played)\n"+value.win+' Wins, '+ value.loss+' Losses, '+ value.tie +' Ties,'+ value.dc+' DCs, '+ value.ssa+' Saves, '+ value.fsa+' USAs"></div>');
        $('#O300_GamesPerDay_Bar_'+key).append('<div style="position:absolute; background:'+O300_Selections.Win_Color.value+'; bottom:0px; width:'+gamesperday_barwidth+'px; height:'+((value.win+value.ssa)/i*100)+'%"></div>');
    });
    GM_addStyle('.O300_GamesPerDay_Bar { position:relative; margin-left:'+(dayCounts.length < 200 ? 1 : 0)+'px; background:#666 }');
    GM_addStyle('.O300_GamesPerDay_Bar:hover { opacity:0.6 }');
    
    //# Games Per Day...
    $O300_Messages.append('<div id="O300_GamesPerDay" style="font-size:11px">' + daysWithGamesCount + ' Game Days (' + (data.length/daysWithGamesCount).toFixed(2) + ' games/day, ' + secondsToHMS(totalTimePlayed/daysWithGamesCount) + ' mins/day)</div>');

    //Power Up Stats...
    $('#O300_MessagesPie').after('<div id="O300_PUPs" style="width:96%; margin:5px auto; padding:1px 0; font-family:monospace; display:flex; flex-wrap:wrap; justify-content:center; align-items:center; font-size:12px; border:1px solid #222; border-radius:3px; cursor:pointer"></div>');
    $.each(totals.pups, function(key, value) {
        var keytitle='';
        if (key === 'timePlayed') {
            keytitle = 'Time';
        } else if (key === 'powerups') {
            keytitle = 'PUPs';
        } else if (key === 'captures') {
            keytitle = 'Caps';
        } else {
            keytitle = capitaliseFirstLetter(key);
        }
        if ((key == 'hold') || (key == 'prevent') || (key == 'timePlayed')) {
            $('#O300_PUPs').append('<div class="O300_pups_pergame" style="margin:0 7px;' + (O300_Selections.ShowO300PUPsPerGame.value ? '' : 'display:none') + '" title="'+keytitle+' Per Game (click for totals)"><u>'+keytitle+'</u><br>'+secondsToHMS(value / data.length)+'</div>');
            $('#O300_PUPs').append('<div class="O300_pups_total" style="margin:0 7px;' + (O300_Selections.ShowO300PUPsPerGame.value ? 'display:none' : '') + '" title="'+keytitle+' Total (click for per-game)"><u>'+keytitle+'</u><br>'+secondsToHMS(value)+'</div>');
        } else {
            $('#O300_PUPs').append('<div class="O300_pups_pergame" style="margin:0 7px;' + (O300_Selections.ShowO300PUPsPerGame.value ? '' : 'display:none') + '" title="'+keytitle+' Per Game (click for totals)"><u>'+keytitle+'</u><br>'+(value / data.length).toFixed(2)+'</div>');
            if (key == 'powerups') {
                $('#O300_PUPs').append('<div class="O300_pups_total" style="margin:0 7px;' + (O300_Selections.ShowO300PUPsPerGame.value ? 'display:none' : '') + '" title="'+keytitle+' Total (click for per-game)"><u>'+keytitle+'</u><br>'+(value / totalPotentialPowerups * 100).toFixed(2)+'%</div>');
            } else {
                $('#O300_PUPs').append('<div class="O300_pups_total" style="margin:0 7px;' + (O300_Selections.ShowO300PUPsPerGame.value ? 'display:none' : '') + '" title="'+keytitle+' Total (click for per-game)"><u>'+keytitle+'</u><br>'+(value)+'</div>');
            }
        }
    });
    $('#O300_PUPs').append('<div style="margin:0 7px;" title="Caps/Grab"><u>C/G</u><br>'+(totals.pups.captures / totals.pups.grabs).toFixed(3)+'</div>');
    $('#O300_PUPs').append('<div style="margin:0 7px;" title="Tags/Pop"><u>T/P</u><br>'+(totals.pups.tags / totals.pups.pops).toFixed(3)+'</div>');

    $('#O300_GamesPerDayGraph').find('.O300_GamesPerDay_Bar').on('click', function() {
        O300_Selections.MaxO300Games.value = $(this).data('firstgame');
        GM_setValue('O300_Selections', O300_Selections);
        setTimelineCellHeights(Cell_Width);
        showTrimmedData($(this).data('firstgame'), $(this).data('gamecount'));
    });
    $('#O300_Intervals').find('.O300_Interval').on('click', function() {
        O300_Selections.MaxO300Games.value = $(this).data('firstgame');
        GM_setValue('O300_Selections', O300_Selections);
        setTimelineCellHeights(Cell_Width);
        $('#O300_Intervals .O300_Interval').css('color', '#777');
        $(this).css('color', '#ddd');
        showTrimmedData($(this).data('firstgame'), intervalSize);
    });
    $('#O300_Timeline div').on('click', function() {
        O300_Selections.MaxO300Games.value = $(this).data('gamenumber');
        GM_setValue('O300_Selections', O300_Selections);
        setTimelineCellHeights(Cell_Width);
        $('#O300_Intervals .O300_Interval').css('color', '#777');
        showTrimmedData($(this).data('gamenumber'), $(this).data('gamenumber'));
    });
    $('#O300_PUPs').on('click', function(){
        O300_Selections.ShowO300PUPsPerGame.value = !O300_Selections.ShowO300PUPsPerGame.value;
        GM_setValue('O300_Selections', O300_Selections);
        $('#ShowO300PUPsPerGame').prop('checked', O300_Selections.ShowO300PUPsPerGame.value);
        if (O300_Selections.ShowO300PUPsPerGame.value === true) {
            $('#O300_PUPs').find('.O300_pups_pergame').show(0);
            $('#O300_PUPs').find('.O300_pups_total').hide(0);
        } else {
            $('#O300_PUPs').find('.O300_pups_pergame').hide(0);
            $('#O300_PUPs').find('.O300_pups_total').show(0);
        }
    });
    $('#O300_CTFWP').on('click', function(){
        O300_Selections.MaxO300Games.value = 'CTF';
        GM_setValue('O300_Selections', O300_Selections);
        setTimelineCellHeights(Cell_Width);
        showTrimmedData(0,0);
    });
    $('#O300_NFWP').on('click', function(){
        O300_Selections.MaxO300Games.value = 'NF';
        GM_setValue('O300_Selections', O300_Selections);
        setTimelineCellHeights(Cell_Width);
        showTrimmedData(0,0);
    });

}


/************************************************************************************/
// Mini Timeline...
/************************************************************************************/
function showTrimmedData(start, count) {
    var WinPercentageText;
    var Timeline_MaxWidth = 390;
    var Cell_Width = 8; //This value will adjust (smaller) according to MaxGames & Timeline_MaxWidth. Default=8
    var ShowGapMarginLeft = 1;
    var i;
    var totals = {'all':     { win:0, loss:0, dc:0, ssa:0, fsa:0, tie:0 },
                  'ctf':     { win:0, loss:0, dc:0, ssa:0, fsa:0, tie:0 },
                  'nf':      { win:0, loss:0, dc:0, ssa:0, fsa:0, tie:0 },
                  'pups':    { tags:0, pops:0, grabs:0, drops:0, hold:0, captures:0, prevent:0, returns:0, support:0, powerups:0, timePlayed:0 },
                  'streaks': { win:0, loss:0, temp_win:0, temp_loss:0, last_win:0, last_loss:0 }
                 };
    var data = $.extend(true, [], allGames);
    var newData = [];
    var key, l;

    if (O300_Selections.MaxO300Games.value === 'CTF') {
        for (key=0, l=data.length; key<l; key++) {
            if (data[key].gameMode === 1) newData.push(data[key]);
        }
        data = $.extend(true, [], newData);
        start = data.length;
        count = data.length;
        WinPercentageText = 'Win % over these <span style="color:' + O300_Selections.Win_Color.value + '">' + data.length + '</span> CTF games:';
    } else if (O300_Selections.MaxO300Games.value === 'NF') {
        for (key=0, l=data.length; key<l; key++) {
            if (data[key].gameMode === 2) newData.push(data[key]);
        }
        data = $.extend(true, [], newData);
        start = data.length;
        count = data.length;
        WinPercentageText = 'Win % over these <span style="color:' + O300_Selections.Win_Color.value + '">' + data.length + '</span> NF games:';
    } else {
        if (!start) start = 0;
        if (!count) count = data.length;
        $O300_Timeline.find('[data-gamenumber="' + start + '"]').css('height', '+=6');
        if (count > 1) $O300_Timeline.find('[data-gamenumber="' + (start-count+1) + '"]').css('height', '+=6');
        start = data.length-start;
        data = data.splice(start, count);
        WinPercentageText = 'Win % over these <span style="color:' + O300_Selections.Win_Color.value + '">' + data.length + '</span> games ' + (start>=0 ? '('+(allGames.length-start-count+1)+'-'+(allGames.length-start)+'): ' : '');
    }

    if (count > 200) ShowGapMarginLeft = 0;

    var New_Cell_Width = Math.floor((Timeline_MaxWidth - 34) / data.length);
    if (New_Cell_Width < Cell_Width) Cell_Width = New_Cell_Width - (O300_Selections.ShowO300ShowGap.value ? (count > 200 ? 0 : 1) : 0);
    if (Cell_Width <= 0) Cell_Width = 1;

    var NF_Marker = '<div title="Neutral Flag Game" style="position:absolute; width:'+Cell_Width+'px; height:1px; bottom:-2px; background:#ccc"></div>';

    $O300T_Timeline.empty();
    $O300T_Messages.empty();
    $('#O300T_PUPs').remove();

    var totalPotentialPowerups = 0;
    $(data).each(function(key, value) {
        totalPotentialPowerups += value.potentialPowerups;
        $.each(totals.pups, function(key1, value1) {
            totals.pups[key1] += value[key1];
        });
        
        switch (value.outcome) {
            case 1: //win
                if (value.saved === 2) {
                    totals.all.ssa++;
                    if (value.gameMode === 1) {
                        totals.ctf.ssa++;
                    } else if (value.gameMode === 2) {
                        totals.nf.ssa++;
                    }
                    $O300T_Timeline.append('<div class="o300t_ssa" title="' + getGameInfoAsText(value) + '">'+(value.gameMode === 2 ? NF_Marker : '')+'</div>');
                } else {
                    totals.all.win++;
                    if (value.gameMode === 1) {
                        totals.ctf.win++;
                    } else if (value.gameMode === 2) {
                        totals.nf.win++;
                    }
                    $O300T_Timeline.append('<div class="o300t_win" title="' + getGameInfoAsText(value) + '">'+(value.gameMode === 2 ? NF_Marker : '')+'</div>');
                }

                //streak...
                i=key;
                while ( (i > 0) && ((data[i-1].outcome === 4)&&(data[i-1].saved === 1)) ) { //unsuccessful saves shouldn't break a streak!
                    i--;
                }
                if ( (totals.streaks.temp_win === 0) || ((i > 0) && ((data[i-1].outcome === 1)) ) ) totals.streaks.temp_win++;
                if (totals.streaks.temp_win > totals.streaks.win) totals.streaks.win = totals.streaks.temp_win;
                totals.streaks.temp_loss = 0;
                if (totals.streaks.temp_win > 0) totals.streaks.last_win = totals.streaks.temp_win;

                break;

            case 2: //loss
                totals.all.loss++;
                if (value.gameMode === 1) {
                    totals.ctf.loss++;
                } else if (value.gameMode === 2) {
                    totals.nf.loss++;
                }
                $O300T_Timeline.append('<div class="o300t_loss" title="' + getGameInfoAsText(value) + '">'+(value.gameMode === 2 ? NF_Marker : '')+'</div>');

                //streak...
                i=key;
                while ( (i > 0) && ((data[i-1].outcome === 4)&&(data[i-1].saved === 1)) ) { //unsuccessful saves shouldn't break a streak!
                    i--;
                }
                if ( (totals.streaks.temp_loss === 0) || ((i > 0) && ((data[i-1].outcome === 2) || (data[i-1].outcome === 3) || (data[i-1].outcome === 5)) ) ) totals.streaks.temp_loss++;
                if (totals.streaks.temp_loss > totals.streaks.loss) totals.streaks.loss = totals.streaks.temp_loss;
                totals.streaks.temp_win = 0;
                if (totals.streaks.temp_loss > 0) totals.streaks.last_loss = totals.streaks.temp_loss;

                break;

            case 3: //dc
                totals.all.dc++;
                if (value.gameMode === 1) {
                    totals.ctf.dc++;
                } else if (value.gameMode === 2) {
                    totals.nf.dc++;
                }
                $O300T_Timeline.append('<div class="o300t_dc" title="' + getGameInfoAsText(value) + '">'+(value.gameMode === 2 ? NF_Marker : '')+'</div>');

                //streak...
                i=key;
                while ( (i > 0) && ((data[i-1].outcome === 4)&&(data[i-1].saved === 1)) ) { //unsuccessful saves shouldn't break a streak!
                    i--;
                }
                if ( (totals.streaks.temp_loss === 0) || ((i > 0) && ((data[i-1].outcome === 2) || (data[i-1].outcome === 3) || (data[i-1].outcome === 5)) ) ) totals.streaks.temp_loss++;
                if (totals.streaks.temp_loss > totals.streaks.loss) totals.streaks.loss = totals.streaks.temp_loss;
                totals.streaks.temp_win = 0;
                if (totals.streaks.temp_loss > 0) totals.streaks.last_loss = totals.streaks.temp_loss;

                break;

            case 4: //save attempt
                if (value.saved === 1) { //failed save attempt...
                    totals.all.fsa++;
                    if (value.gameMode === 1) {
                        totals.ctf.fsa++;
                        $O300T_Timeline.append('<div class="o300t_fsa" title="' + getGameInfoAsText(value) + '">'+(value.gameMode === 2 ? NF_Marker : '')+'</div>');
                    } else if (value.gameMode === 2) {
                        totals.nf.fsa++;
                        $O300T_Timeline.append('<div class="o300t_fsa" title="' + getGameInfoAsText(value) + '"><div title="Neutral Flag Game" style="position:absolute; width:'+Cell_Width+'px; height:1px; bottom:-4px; background:#ccc"></div></div>');
                    }
                }

                break;

            case 5: //tie
                totals.all.tie++;
                if (value.gameMode === 1) {
                    totals.ctf.tie++;
                } else if (value.gameMode === 2) {
                    totals.nf.tie++;
                }
                $O300T_Timeline.append('<div class="o300t_tie" data-gamenumber="' + (data.length-key) + '" title="' + getGameInfoAsText(value) + '">'+(value.gameMode === 2 ? NF_Marker : '')+'</div>');

                //streak...
                i=key;
                while ( (i > 0) && ((data[i-1].outcome === 4)&&(data[i-1].saved === 1)) ) { //unsuccessful saves shouldn't break a streak!
                    i--;
                }
                if ( (totals.streaks.temp_loss === 0) || ((i > 0) && ((data[i-1].outcome === 2) || (data[i-1].outcome === 3) || (data[i-1].outcome === 5)) ) ) totals.streaks.temp_loss++;
                if (totals.streaks.temp_loss > totals.streaks.loss) totals.streaks.loss = totals.streaks.temp_loss;
                totals.streaks.temp_win = 0;
                if (totals.streaks.temp_loss > 0) totals.streaks.last_loss = totals.streaks.temp_loss;

                break;

            default: //just in case!
                $O300T_Timeline.append('<div class="o300t_unknown" data-gamenumber="' + (data.length-key) + '" title="Unknown Result">'+(value.gameMode === 2 ? NF_Marker : '')+'</div>');

                break;

        }
    });

    $('#O300T_Timeline').find('.o300t_win').css     ({ 'display':'inline-block', 'position':'relative', 'margin-left':               (O300_Selections.ShowO300ShowGap.value ? ShowGapMarginLeft : 0)+'px', 'background-color':O300_Selections.Win_Color.value,     'height':'6px', 'width':Cell_Width+'px' });
    $('#O300T_Timeline').find('.o300t_loss').css    ({ 'display':'inline-block', 'position':'relative', 'margin-left':               (O300_Selections.ShowO300ShowGap.value ? ShowGapMarginLeft : 0)+'px', 'background-color':O300_Selections.Loss_Color.value,    'height':'6px', 'width':Cell_Width+'px' });
    $('#O300T_Timeline').find('.o300t_dc').css      ({ 'display':'inline-block', 'position':'relative', 'margin'     :'0px 0px 1px '+(O300_Selections.ShowO300ShowGap.value ? ShowGapMarginLeft : 0)+'px', 'background-color':O300_Selections.DC_Color.value,      'height':'4px', 'width':Cell_Width+'px' });
    $('#O300T_Timeline').find('.o300t_ssa').css     ({ 'display':'inline-block', 'position':'relative', 'margin-left':               (O300_Selections.ShowO300ShowGap.value ? ShowGapMarginLeft : 0)+'px', 'background-color':O300_Selections.SSA_Color.value,     'height':'4px', 'width':Cell_Width+'px', 'border-top'   :'2px solid white' });
    $('#O300T_Timeline').find('.o300t_fsa').css     ({ 'display':'inline-block', 'position':'relative', 'margin-left':               (O300_Selections.ShowO300ShowGap.value ? ShowGapMarginLeft : 0)+'px', 'background-color':O300_Selections.FSA_Color.value,     'height':'4px', 'width':Cell_Width+'px', 'border-bottom':'2px solid white' });
    $('#O300T_Timeline').find('.o300t_tie').css     ({ 'display':'inline-block', 'position':'relative', 'margin-left':               (O300_Selections.ShowO300ShowGap.value ? ShowGapMarginLeft : 0)+'px', 'background-color':O300_Selections.Tie_Color.value,     'height':'6px', 'width':Cell_Width+'px' });
    $('#O300T_Timeline').find('.o300t_unknown').css ({ 'display':'inline-block', 'position':'relative', 'margin-left':               (O300_Selections.ShowO300ShowGap.value ? ShowGapMarginLeft : 0)+'px', 'background-color':O300_Selections.Unknown_Color.value, 'height':'6px', 'width':Cell_Width+'px' });

    //Win %...
    var currentWinPC = ((totals.all.win+totals.all.ssa) / (totals.all.win+totals.all.ssa + totals.all.loss+totals.all.dc+totals.all.tie) * 100).toFixed(2);
    $O300T_Messages.append('<div id="O300T_Wins">' + WinPercentageText + ' <span style="color:'+O300_Selections.Win_Color.value+'">' + currentWinPC + '%</span></div>');

    //Games Count...
    $O300T_Messages.append('<div id="O300T_Count">(<span style="color:'+O300_Selections.Win_Color.value+'">' + (totals.all.win) + ' Win'+((totals.all.win)==1?'':'s')+'</span> | <span style="color:'+O300_Selections.Loss_Color.value+'">'+ (totals.all.loss) + ' Loss'+(totals.all.loss==1?'':'es')+'</span> | <span style="color:'+O300_Selections.Tie_Color.value+'" title="Ties are counted as a Loss">'+ (totals.all.tie) + ' Tie'+(totals.all.tie==1?'':'s')+'</span> | <span style="color:'+O300_Selections.DC_Color.value+'" title="DC\'s are counted as a Loss">' + totals.all.dc + ' DC'+(totals.all.dc==1?'':'s')+'</span> | <span style="color:'+O300_Selections.SSA_Color.value+'" title="Counts as a Win!">' + totals.all.ssa + ' Save'+(totals.all.ssa==1?'':'s')+'</span> | <span style="color:'+O300_Selections.FSA_Color.value+'" title="Unsuccessful Save Attempts do NOT count as a Loss (or a Win)">' + totals.all.fsa + ' USA'+(totals.all.fsa==1?'':'s')+'</span>)</div>');

    //CTF / NF...
    var totalCTF = (totals.ctf.win+totals.ctf.ssa + totals.ctf.loss+totals.ctf.dc+totals.ctf.tie);
    var CTFWinPC = (totalCTF === 0) ? 0 : ((totals.ctf.win+totals.ctf.ssa) / totalCTF * 100).toFixed(2);
    var totalNF = (totals.nf.win+totals.nf.ssa + totals.nf.loss+totals.nf.dc+totals.nf.tie);
    var NFWinPC = (totalNF === 0) ? 0 : ((totals.nf.win+totals.nf.ssa) / totalNF * 100).toFixed(2);
    $O300T_Messages.append('<div id="O300T_CTFNF"><span style="color:#9264DA">CTF: ' + CTFWinPC + '% ('+(totalCTF+totals.ctf.fsa)+')</span> | <span style="color:#9264DA">NF: ' + NFWinPC + '% ('+(totalNF+totals.nf.fsa)+')</span></div>');

    //Best Streaks...
    $O300T_Messages.append('<div id="O300T_BestStreak" style="text-align:center">Best Streaks: <span style="color:' + O300_Selections.Win_Color.value + '">' + totals.streaks.win + ' Win' + (totals.streaks.win == 1 ? '' : 's') + '</span> | <span style="color:' + O300_Selections.Loss_Color.value + '">' + totals.streaks.loss + ' Loss' + (totals.streaks.loss == 1 ? '' : 'es') + '</span></div>');

    //Games Mini Pie Chart...
    if (O300_Selections.ShowO300TrimmedGamesPieChart.value) {
        $O300T_Messages.append('<div id="O300T_Pie"></div>');
        $('#O300T_Pie').append('<canvas id="O300T_GamesPieChart" width="50" height="50" style="margin:0 50px"></canvas>');
        var ctx = $("#O300T_GamesPieChart").get(0).getContext("2d");

        var gamesPieData = [totals.all.win, totals.all.loss, totals.all.tie, totals.all.dc, totals.all.fsa, totals.all.ssa];

        var options = {segmentShowStroke: false,
                       animationEasing: "easeOutQuart",
                       animationSteps: 50,
                       tooltipFontSize: 10,
                       tooltipTitleFontStyle: "normal",
                       tooltipXPadding: 2,
                       tooltipYPadding: 2,
                       tooltipCaretSize: 4,
                       tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>"
                      };
        var gamesPieDataSets = [
            {value: gamesPieData[0],
             color: O300_Selections.Win_Color.value,
             highlight: '#67ff67',
             label: 'Win'
            },
            {value: gamesPieData[1],
             color: O300_Selections.Loss_Color.value,
             highlight: '#ff4343',
             label: 'Loss'
            },
            {value: gamesPieData[2],
             color: O300_Selections.Tie_Color.value,
             highlight: '#ffcc7b',
             label: 'Tie'
            },
            {value: gamesPieData[3],
             color: O300_Selections.DC_Color.value,
             highlight: '#fffe8d',
             label: 'DC'
            },
            {value: gamesPieData[4],
             color: O300_Selections.FSA_Color.value,
             highlight: '#51c6e7',
             label: 'USA'
            },
            {value: gamesPieData[5],
             color: O300_Selections.SSA_Color.value,
             highlight: '#88e888',
             label: 'SSA'
            }
        ];

        var pieLoadDelay = 200;
        if ((PageLoc === 'profile') || (PageLoc === 'profileNotOurs')) pieLoadDelay = 400;
        else if (PageLoc === 'joining') pieLoadDelay = 700;

        setTimeout(function() {
            window.requestAnimationFrame(function() {
                var myPieChart = new Chart(ctx).Pie(gamesPieDataSets, options);
            });
        }, pieLoadDelay);
    }

    //Power Up Stats...
    if (O300_Selections.ShowO300TrimmedPUPs.value) {
        $O300T_Messages.append('<div id="O300T_PUPs" style="max-width:300px; margin:5px auto; display:flex; flex-wrap:wrap; justify-content:center; align-items:center; font-family:monospace; font-size:11px; border:1px solid #222; border-radius:3px; cursor:pointer"></div>');
        $.each(totals.pups, function(key, value) {
            var keytitle='';
            if (key === 'timePlayed') {
                keytitle = 'Time';
            } else if (key === 'powerups') {
                keytitle = 'PUPs';
            } else if (key === 'captures') {
                keytitle = 'Caps';
            } else {
                keytitle = capitaliseFirstLetter(key);
            }
            if ((key == 'hold') || (key == 'prevent') || (key == 'timePlayed')) {
                $('#O300T_PUPs').append('<div class="O300_pups_pergame" style="margin:0 7px;' + (O300_Selections.ShowO300PUPsPerGame.value ? '' : 'display:none') + '" title="'+keytitle+' Per Game (click for totals)"><u>'+keytitle+'</u><br>'+secondsToHMS(value / data.length)+'</div>');
                $('#O300T_PUPs').append('<div class="O300_pups_total" style="margin:0 7px;' + (O300_Selections.ShowO300PUPsPerGame.value ? 'display:none' : '') + '" title="'+keytitle+' Total (click for per-game)"><u>'+keytitle+'</u><br>'+secondsToHMS(value)+'</div>');
            } else {
                $('#O300T_PUPs').append('<div class="O300_pups_pergame" style="margin:0 7px;' + (O300_Selections.ShowO300PUPsPerGame.value ? '' : 'display:none') + '" title="'+keytitle+' Per Game (click for totals)"><u>'+keytitle+'</u><br>'+(value / data.length).toFixed(2)+'</div>');
                if (key == 'powerups') {
                    $('#O300T_PUPs').append('<div class="O300_pups_total" style="margin:0 7px;' + (O300_Selections.ShowO300PUPsPerGame.value ? 'display:none' : '') + '" title="'+keytitle+' Total (click for per-game)"><u>'+keytitle+'</u><br>'+(value / totalPotentialPowerups * 100).toFixed(2)+'%</div>');
                } else {
                    $('#O300T_PUPs').append('<div class="O300_pups_total" style="margin:0 7px;' + (O300_Selections.ShowO300PUPsPerGame.value ? 'display:none' : '') + '" title="'+keytitle+' Total (click for per-game)"><u>'+keytitle+'</u><br>'+(value)+'</div>');
                }
            }
        });
        $('#O300T_PUPs').append('<div style="margin:0 7px;" title="Caps/Grab"><u>C/G</u><br>'+(totals.pups.captures / totals.pups.grabs).toFixed(3)+'</div>');
        $('#O300T_PUPs').append('<div style="margin:0 7px;" title="Tags/Pop"><u>T/P</u><br>'+(totals.pups.tags / totals.pups.pops).toFixed(3)+'</div>');

        $('#O300T_PUPs').on('click', function(){
            O300_Selections.ShowO300PUPsPerGame.value = !O300_Selections.ShowO300PUPsPerGame.value;
            GM_setValue('O300_Selections', O300_Selections);
            $('#ShowO300PUPsPerGame').prop('checked', O300_Selections.ShowO300PUPsPerGame.value);
            if (O300_Selections.ShowO300PUPsPerGame.value === true) {
                $('#O300T_PUPs').find('.O300_pups_pergame').show(0);
                $('#O300T_PUPs').find('.O300_pups_total').hide(0);
            } else {
                $('#O300T_PUPs').find('.O300_pups_pergame').hide(0);
                $('#O300T_PUPs').find('.O300_pups_total').show(0);
            }
        });
    }
}


tagpro.ready(function() {
    if (PageLoc === 'ingame') { //in a game
        var joinTime;
        var gameData = {};
        var mapName='', mapAuthor='', mapType='';
        var pupsCount = 0;
        var result = 0;
        var saveAttempt = false;
        var groupPause = false;

        if ((tagpro.group.socket) && (tagpro.group.socket.connected)) {
            groupPause = true;
        }
        
        tagpro.socket.on('time', function(message) {
            if (tagpro.state == 3) { //before the actual start
                joinTime = new Date().getTime();
            } else if (tagpro.state == 1) { //game has started
                if (joinTime) {
                    //joinTime = Date.parse(tagpro.gameEndsAt) - 12 * 60 * 1000; //time game started (end - 12 mins)
                } else {
                    joinTime = new Date().getTime(); //time we joined (mid-game)
                }
            }
        });


        tagpro.socket.on('map', function(data) {
            mapName = data.info.name;
            mapAuthor = data.info.author;

            setTimeout(function() {
                for (var i=0; i<tagpro.map.length; i++) { //find the flags which will tell us if it's a CTF or NF map...
                    for (var j=0; j<tagpro.map[i].length; j++) {
                        if (tagpro.map[i][j] == 16 || (tagpro.map[i][j] == 16.1)) { //yellow flag found
                            mapType = 2;
                        } else if ((tagpro.map[i][j] == 3) || (tagpro.map[i][j] == 3.1) || (tagpro.map[i][j] == 4) || (tagpro.map[i][j] == 4.1)) { //red or blue flag found
                            mapType = 1;
                        } else if ((tagpro.map[i][j] == 6) || (tagpro.map[i][j] == 6.1) || (tagpro.map[i][j] == 6.2) || (tagpro.map[i][j] == 6.3) || (tagpro.map[i][j] == 6.4)) { //counts the pups so we can work out potential pups later
                            pupsCount++;
                        }
                    }
                }
            }, 100);
        });


        tagpro.socket.on('settings', function(data) {
            if (tagpro.settings.stats === false) {
                $('.O300_Stats_Dependent').css('text-decoration', 'line-through').css('text-shadow', 'none');
                $('.O300_Stats_Dependent').attr('title', 'Stats are OFF');
            }
        });


        tagpro.socket.on('chat', function(data) {
            if (data.from === null) { //system message
                if (data.message.indexOf('This is a save attempt!') >= 0) {
                    saveAttempt = true;
                }
            }
        });


        tagpro.socket.on('end', function(data) {
            if ((!tagpro.spectator) && (!groupPause)) { //(!tagpro.settings.stats) && 
                var fullTime = Date.parse(tagpro.gameEndsAt); //expected end of game time after 12 mins
                var endTime = new Date().getTime(); //actual end of game time
                var startTime = fullTime - 12 * 60 * 1000; //start of game time
                var fullGameLength = (endTime-startTime)/1000; //how long the whole game lasted (with or without us)
                var playedGameLength = (endTime-joinTime)/1000; //how long we played for

                if ( joinTime+30000 < endTime ) { //check we didn't join in the last 30 seconds of the game
                    gameData.mapName = mapName;
                    gameData.mapAuthor = mapAuthor;
                    gameData.gameMode = mapType;
                    
                    gameData.played = new Date(joinTime).toISOString();
                    gameData.timePlayed = playedGameLength;
                    gameData.fullGameLength = fullGameLength;

                    gameData.saved = 0;
                    if (data.winner == 'tie') {
                        gameData.outcome = 5; //tie
                    } else if ( ((data.winner == 'red') && (tagpro.players[tagpro.playerId].team == 1)) || ((data.winner == 'blue') && (tagpro.players[tagpro.playerId].team == 2)) ) {
                        gameData.outcome = 1; //win
                        if (saveAttempt) {
                            gameData.saved = 2; //successful save attempt
                        }
                    } else if ( ((data.winner == 'red') && (tagpro.players[tagpro.playerId].team == 2)) || ((data.winner == 'blue') && (tagpro.players[tagpro.playerId].team == 1)) ) {
                        if (saveAttempt) {
                            gameData.outcome = 4; //unsuccessful save attempt
                            gameData.saved = 1;
                        } else {
                            gameData.outcome = 2; //loss
                        }
                    } else { //probably an event, which we won't record...
                        return false;
                    }
                    
                    gameData.tags = tagpro.players[tagpro.playerId]["s-tags"];
                    gameData.pops = tagpro.players[tagpro.playerId]["s-pops"];
                    gameData.grabs = tagpro.players[tagpro.playerId]["s-grabs"];
                    gameData.drops = tagpro.players[tagpro.playerId]["s-drops"];
                    gameData.hold = tagpro.players[tagpro.playerId]["s-hold"];
                    gameData.captures = tagpro.players[tagpro.playerId]["s-captures"];
                    gameData.prevent = tagpro.players[tagpro.playerId]["s-prevent"];
                    gameData.returns = tagpro.players[tagpro.playerId]["s-returns"];
                    gameData.support = tagpro.players[tagpro.playerId]["s-support"];
                    gameData.powerups = tagpro.players[tagpro.playerId]["s-powerups"];

                    gameData.potentialPowerups = pupsCount * Math.ceil(playedGameLength / 60); //is this right???
                    gameData.score = tagpro.players[tagpro.playerId].score;
                    gameData.points = tagpro.players[tagpro.playerId].points;

                    O300_Selections.O300SavedGames.value.push(gameData);
                    GM_setValue('O300_Selections', O300_Selections);
                }
            }
        });
    }
});

//Get things ready and start the script...
O300_Selections = $.extend(true, {}, options, GM_getValue('O300_Selections', options));
//O300_Selections.O300SavedGames.value = GM_getValue('R300_Selections').R300SavedGames.value;
GM_setValue('O300_Selections', O300_Selections);
$.each(O300_Selections, function(key, value) {
    O300_Selections[key].type = options[key].type;
    if (key !== 'O300SavedGames') {
        O300_Selections[key].display = options[key].display;
        if ((key !== 'O300MainPages') && (key !== 'O300HeaderPages')) {
            O300_Selections[key].title = options[key].title;
        }
    }
});


//Setup the main div location depending on which page we are on...
var O300_Div = '<div id="O300" style="position:relative; margin:20px auto 0 auto; padding:10px; width:-webkit-fit-content; color:#fff; text-align:center; text-shadow:2px 1px 2px #000000; border-radius:8px; ' + (O300_Selections.ShowBoxShadowBorder.value ? 'box-shadow:#fff 0px 0px 10px; ' : '') + 'background:rgba(0,0,0,0.1);  white-space:nowrap;">' + 
    '<div style="display:inline-block; background:orange; color:white; padding:3px 10px; margin:3px 0; border-radius:5px;">Stats OFF Rolling 300 Timeline</div>' +
    '<div id="O300_Settings_Button" style="display:inline-block; font-size:11px; text-align:center; margin-left:10px; height:13px; width:14px; border:2px solid #3A8CBB; border-radius:8px; cursor:pointer" title="Options">&#8286;</div>' +
    '</div>';

//Header div...
var WinP_Div = '<div id="O300_WinNextHeader" style="position:relative; width:100%; top:1px; font-size:12px;font-weight:bold; color:#fff; text-align:center; text-shadow:1px 2px 1px #222; clear:both"><span style="background:orange; color:white; padding:0px 5px; margin:0px 10px; border-radius:4px;" title="This is the Stats OFF version of the R300 script. It will try and record the data whether your stats are on or off.">Stats OFF</span></div>';

//Chosen server page...
if (PageLoc === 'server') {
    $('#play').parent().next().after(O300_Div);
    $('#O300').append('<div id="O300_loading" style="margin:20px; font-size:18px; color:#ff0">Getting Data...<div style="background:#000000 url(\'http://i.imgur.com/WKZPcQA.gif\') no-repeat center; margin-top:10px; opacity:0.7; height:64px; width:100%;"></div></div>');
    if (O300_Selections.O300HeaderPages.title.indexOf('Home') >= 0) { 
        $('body').prepend(WinP_Div);
    }

//Profile page...
} else if ((PageLoc === 'profile') || (PageLoc === 'profileNotOurs')) {
    if (O300_Selections.O300MainPages.title.indexOf('Profile') >= 0) {
        $('h1').parent('a').after(O300_Div);
    }
    if (O300_Selections.O300HeaderPages.title.indexOf('Profile') >= 0) { 
        $('body').prepend(WinP_Div);
    }

//Joining page...
} else if (PageLoc === 'joining') {
    if (O300_Selections.O300MainPages.title.indexOf('Joiner') >= 0) {
        $('#message').after(O300_Div);
        $('#O300_Settings_Button').hide(0);
    }
    if (O300_Selections.O300HeaderPages.title.indexOf('Joiner') >= 0) { 
        $('body').prepend(WinP_Div);
    }

//In A Game...
} else if (PageLoc === 'ingame') {
    if (O300_Selections.O300HeaderPages.title.indexOf('Game') >= 0) { 
        $('body').prepend(WinP_Div);
    }
}


if ($('#O300').length) {
    $('#O300').append('<div id="O300_InnerContainer" style="display:none"></div>');
    $('#O300_InnerContainer').append('<div id="O300_Intervals"></div>');
    $('#O300_InnerContainer').append('<div id="O300_Timeline"></div>');
    $('#O300_InnerContainer').append('<div id="O300_MessagesPie" style="display:flex; align-items:center; justify-content:center; font-size:12px"></div>');
    $('#O300_MessagesPie').append('<div id="O300_Messages" style="flex:0 0 auto; align-self:flex-start;"></div>');
    $('#O300_MessagesPie').append('<div id="O300_Trimmed" style="display:none; flex:0 0 auto; margin:0 0 0 20px; padding:4px; border:1px solid #aaa; border-radius:3px; font-size:11px"></div>');
    $('#O300_Trimmed').append('<div id="O300T_Timeline" style="padding:0"></div>');
    $('#O300_Trimmed').append('<div id="O300T_Messages"></div>');
}

var $O300_Timeline = $('#O300_Timeline');
var $O300_Messages = $('#O300_Messages');
var $O300T_Timeline = $('#O300T_Timeline');
var $O300T_Messages = $('#O300T_Messages');

if ( $('#O300').length || $('#O300_WinNextHeader').length ) {
    loadData();
}
