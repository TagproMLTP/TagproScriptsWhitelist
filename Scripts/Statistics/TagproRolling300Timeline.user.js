// ==UserScript==
// @name            Rolling 300 Timeline
// @description     Shows your Rolling 300 Timeline & Streaks (using official game data) on your chosen server homepage.
// @version         1.8.0
//                   • Fixed 2 small bugs (header blocks & games/day graph)
//                   • Added "Start With Last Day Played" option
// @include         http://tagpro*.koalabeast.com*
// @include         http://*.newcompte.fr*
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_deleteValue
// @grant           GM_addStyle
// @updateURL       https://gist.github.com/nabbynz/23a54cace27ad097d671/raw/TagPro_Rolling300Timeline.user.js
// @downloadURL     https://gist.github.com/nabbynz/23a54cace27ad097d671/raw/TagPro_Rolling300Timeline.user.js
// @license         GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author          nabby
// ==/UserScript==

console.log('START: ' + GM_info.script.name + ' (v' + GM_info.script.version + ' by ' + GM_info.script.author + ')');

var options = { //defaults
    //Best not to edit these ones (you can select them through the on-page menu)...
    'R300MainPages':                          { display:'Home,Profile,Joiner',                           type:'checkbox',      value:0,             title:'Home,Profile'},
    'R300HeaderPages':                        { display:'Home,Profile,Joiner,Game',                      type:'checkbox',      value:0,             title:'Home,Profile,Joiner,Game'},
    'MaxR300Games':                           { display:'# Games to View: ',                             type:'overwritten',   value:50,            title:''},
    'ShowR300Timeline':                       { display:'Show Timeline',                                 type:'checkbox',      value:true,          title:''},
    'ShowR300Intervals':                      { display:'Show Win % Bands for...',                       type:'checkbox',      value:true,          title:''},
    'R300WinBands':                           { display:'20,25,30,50,75,100,150',                        type:'subradio',      value:50,            title:''},
    'ShowR300WinPercentage':                  { display:'Show Win %',                                    type:'checkbox',      value:true,          title:''},
    'ShowR300Count':                          { display:'Show Count',                                    type:'checkbox',      value:true,          title:''},
    'ShowR300HighestLowestEver':              { display:'Show Highest/Lowest %\'s (ever)',               type:'checkbox',      value:true,          title:''},
    'ShowR300CTFNF':                          { display:'Show CTF/NF Win %\'s',                          type:'checkbox',      value:true,          title:''},
    'ShowR300OldestGame':                     { display:'Show "Oldest Game"',                            type:'checkbox',      value:false,         title:''},
    'ShowR300NextGameAffect':                 { display:'Show "Next Game" effect',                       type:'checkbox',      value:true,          title:''},
    'ShowR300GamesPieChart':                  { display:'Show Pie Chart',                                type:'checkbox',      value:true,          title:''},
    'ShowR300BestStreak':                     { display:'Show Best Streak',                              type:'checkbox',      value:true,          title:''},
    'ShowR300CurrentStreak':                  { display:'Show Current Streak',                           type:'checkbox',      value:true,          title:''},
    'ShowR300WinStreakMessage':               { display:'Show "Best Streak" Messages',                   type:'checkbox',      value:true,          title:'Show messages like: &quot;You are currently on your best win streak!&quot;'},
    'ShowR300LossStreakMessage':              { display:'Show "Worst Streak" Messages',                  type:'checkbox',      value:false,         title:'Show messages like: &quot;You are currently on your worst losing streak&quot;'},
    'ShowR300PerDayGraph':                    { display:'Show # Games Per Day Graph',                    type:'checkbox',      value:true,          title:''},
    'ShowR300PerDay':                         { display:'Show # Games Per Day',                          type:'checkbox',      value:true,          title:''},
    'ShowR300PUPs':                           { display:'Show Power-Up Stats',                           type:'checkbox',      value:true,          title:''},
    'ShowR300PUPsPerGame':                    { display:'Show values as "Per-Game"',                     type:'overwritten',   value:true,          title:'Click to change between per-game averages & totals'},
    'ShowR300ShowGap':                        { display:'Show a gap between games in Timeline',          type:'checkbox',      value:true,          title:''},
    'ShowBoxShadowBorder':                    { display:'Show Shadow around Border?',                    type:'checkbox',      value:false,         title:''},

    'ShowLessThan300GamesWarning':            { display:'Show the "Mini Selection" Window',              type:'checkbox',      value:true,          title:''},
    'ShowR300TrimmedGamesPieChart':           { display:'Show Mini Pie Chart',                           type:'checkbox',      value:true,          title:''},
    'ShowR300TrimmedPUPs':                    { display:'Show Power-Up Stats',                           type:'checkbox',      value:true,          title:''},
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
    'R300SavedGames':                         { type:'script', display:'', value:'' },
};
var R300_Selections; // = options;

$.get('http://i.imgur.com/WKZPcQA.gif'); //preload the ajax loading gif

function secondsToHMS(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s);
}

function scaleBetween(unscaledNum, minAllowed, maxAllowed, min, max){
    return (maxAllowed-minAllowed)*(unscaledNum-min)/(max - min) + minAllowed;
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
    numberGamesToShow = numberGamesToShow || 3;
    
    if (data.length > numberGamesToShow) {
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
    numberGamesToShow = numberGamesToShow || 3;

    if (data.length > numberGamesToShow) {
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
            return ('<span style="color:'+R300_Selections.Win_Color.value+'">Win Next:&#42779;'+IfWin + '%</span> | <span style="color:'+R300_Selections.Loss_Color.value+'">Lose Next:&#42780;'+IfLose+'%</span>');
        } else if (data.length === 300) {
            IfLose = ((wins-1) / (wins-1+losses+1) * 100).toFixed(2);
            return ('<span style="color:'+R300_Selections.Win_Color.value+'">Win Next: No effect</span> | <span style="color:'+R300_Selections.Loss_Color.value+'">Lose Next:&#42780;'+IfLose+'%</span>');
        }
    } else if ((data[0].outcome === 2) || (data[0].outcome == 3)) {
        if (data.length < 300) {
            IfWin = ((wins+1) / (wins+1+losses) * 100).toFixed(2);
            IfLose = ((wins) / (wins+losses+1) * 100).toFixed(2);
            return ('<span style="color:'+R300_Selections.Win_Color.value+'">Win Next:&#42779;'+IfWin + '%</span> | <span style="color:'+R300_Selections.Loss_Color.value+'">Lose Next:&#42780;'+IfLose+'%</span>');
        } else if (data.length === 300) {
            IfWin = ((wins+1) / (wins+1+losses-1) * 100).toFixed(2);
            return ('<span style="color:'+R300_Selections.Win_Color.value+'">Win Next:&#42779;'+IfWin + '%</span> | <span style="color:'+R300_Selections.Loss_Color.value+'">Lose Next: No effect</span>');
        }
    } else if (data[0].outcome === 4) { //Save Attempt
        if (data[0].saved === 1) { //Unsuccessful
            IfWin = ((wins+1) / (wins+1+losses) * 100).toFixed(2);
            IfLose = ((wins) / (wins+losses+1) * 100).toFixed(2);
            return ('<span style="color:'+R300_Selections.Win_Color.value+'">Win Next:&#42779;'+IfWin + '%</span> | <span style="color:'+R300_Selections.Loss_Color.value+'">Lose Next:&#42780;'+IfLose+'%</span>');
        }
    } else if (data[0].outcome === 5) { //Tie
        if (data.length < 300) {
            IfWin = ((wins+1) / (wins+1+losses) * 100).toFixed(2);
            IfLose = ((wins) / (wins+losses+1) * 100).toFixed(2);
            return ('<span style="color:'+R300_Selections.Win_Color.value+'">Win Next:&#42779;'+IfWin + '%</span> | <span style="color:'+R300_Selections.Loss_Color.value+'">Lose Next:&#42780;'+IfLose+'%</span>');
        } else if (data.length === 300) {
            IfWin = ((wins+1) / (wins+1+losses-1) * 100).toFixed(2);
            return ('<span style="color:'+R300_Selections.Win_Color.value+'">Win Next:&#42779;'+IfWin + '%</span> | <span style="color:'+R300_Selections.Loss_Color.value+'">Lose Next: No effect</span>');
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
    var WinP_Div = '<div id="R300_WinNextHeader" style="position:relative; width:100%; top:1px; font-size:12px;font-weight:bold; color:#fff; text-align:center; text-shadow:1px 2px 1px #222; clear:both"></div>';
    
    if (PageLoc === 'server') { //Chosen server home page
        $('body').prepend(WinP_Div);
    } else if ((PageLoc === 'profile') || (PageLoc === 'profileNotOurs')) { //Profile page
        $('body').prepend(WinP_Div);
    } else if (PageLoc === 'joining') { //Joining page
        $('body').prepend(WinP_Div);
        $('#R300_Settings_Button').hide(0);
    } else if (PageLoc === 'ingame') { //in a game
        $('body').prepend(WinP_Div);
    }
    
    //if (((PageLoc === 'server') && (R300_Selections.R300HeaderPages.title.indexOf('Home') >= 0)) || (((PageLoc === 'profile') || (PageLoc === 'profileNotOurs')) && (R300_Selections.R300HeaderPages.title.indexOf('Profile') >= 0)) || ((PageLoc === 'joining') && (R300_Selections.R300HeaderPages.title.indexOf('Joiner') >= 0)) || ((PageLoc === 'ingame') && (R300_Selections.R300HeaderPages.title.indexOf('Game') >= 0)) ) {
        //alert('yar');
        var blocks = "";
        // Oldest games.
        blocks += '<div style="display:inline-block">'+getOldestGamesBlock(data)+'</div>';
        // Current Win %.
        var winP = getWinPercentage(data);
        blocks += '<div style="display:inline-block">Current: ' + winP + '%&nbsp;|&nbsp;</div>';
        // Predicted Win %.
        blocks += '<div class="R300_Stats_Dependent" style="display:inline-block; color:#bbb">' + getNextGamePercentage(data) + '&nbsp;|&nbsp;</div>';
        // # of games to next % flair.
        var nextFlairInfo = getGamesTilNextFlair(data, winP);
        if (nextFlairInfo) {
            blocks += '<div class="R300_Stats_Dependent" style="display:inline-block; color:#bbb">' + nextFlairInfo.wins + ' wins needed for ' + nextFlairInfo.goal + '% flair</div>';
        } else {
            blocks += '<div class="R300_Stats_Dependent" style="display:inline-block; color:#bbb">You\'re above 75%!</div>';
        }
        // Most recent games.
        blocks += '<div style="display:inline-block">'+getLatestGamesBlock(data)+'</div>';
        $('#R300_WinNextHeader').append(blocks);
        $('.fl_win').css ({ 'display':'inline-block', 'margin-left':'1px'        , 'background-color':R300_Selections.Win_Color.value,     'height':'8px', 'width':'8px' });
        $('.fl_loss').css({ 'display':'inline-block', 'margin-left':'1px'        , 'background-color':R300_Selections.Loss_Color.value,    'height':'8px', 'width':'8px' });
        $('.fl_dc').css  ({ 'display':'inline-block', 'margin'     :'0 0 2px 1px', 'background-color':R300_Selections.DC_Color.value,      'height':'4px', 'width':'8px' });
        $('.fl_ssa').css ({ 'display':'inline-block', 'margin-left':'1px'        , 'background-color':R300_Selections.SSA_Color.value,     'height':'6px', 'width':'8px', 'border-top'   :'2px solid white' });
        $('.fl_fsa').css ({ 'display':'inline-block', 'margin-left':'1px'        , 'background-color':R300_Selections.FSA_Color.value,     'height':'6px', 'width':'8px', 'border-bottom':'2px solid white' });
        $('.fl_tie').css ({ 'display':'inline-block', 'margin-left':'1px'        , 'background-color':R300_Selections.Tie_Color.value,     'height':'8px', 'width':'8px' });
        $('.fl_unk').css ({ 'display':'inline-block', 'margin-left':'1px'        , 'background-color':R300_Selections.Unknown_Color.value, 'height':'8px', 'width':'8px' });

        //add strikethrough if stats are off...
        var getProfilePage = $.get('/profile/'+data[0].userId);
        getProfilePage.done(function(settings) {
            if ($(settings).find('#stats').children('input').length) { //will only be available if it's our profile
                var statsOn = true;
                statsOn = $(settings).find('#stats').children('input').is(':checked');
                if (statsOn === false) {
                    $('.R300_Stats_Dependent').css('text-decoration', 'line-through').css('text-shadow', 'none').attr('title', 'Stats are OFF');
                }
            }
        });
    //}
}

function getProfileID() {
    var url, R300ProfileID;

    if (PageLoc === 'server') {
        url = $('a[href^="/profile"][class="button"]').attr('href');
        if (url !== undefined) {
            R300ProfileID = url.substring(url.lastIndexOf('/') + 1);
            R300_Selections.R300SavedGames.display = R300ProfileID;
            GM_setValue('R300_Selections', R300_Selections);
            return R300ProfileID;
        } else { //on server home page, but not logged in so clear the saved games data & profile id
            R300_Selections.R300SavedGames.display = ''; //holds profile id
            R300_Selections.R300SavedGames.value = ''; //holds saved game data
            GM_setValue('R300_Selections', R300_Selections);
        }
    } else if ((PageLoc === 'profile') || (PageLoc === 'profileNotOurs')) {
        url = document.URL;
        R300ProfileID = url.substring(url.lastIndexOf('/') + 1);
        return R300ProfileID;
    }
}

var allGames = [];
function loadData() {
    var profileID = getProfileID();

    if (profileID !== undefined) {
        var serverRequests = GM_getValue('serverRequests', []);
        var gotCount = 0;

        if (serverRequests.length > 0) {
            for (var i=serverRequests.length; i>=0; i--) {
                if (serverRequests[i] > Date.now()-60000) gotCount++;
            }
        }
        if (gotCount >= 4) {
            $('#R300').prepend('<div style="margin:5px 10px; padding:10px 2px; background:#f00; color:#fff; border-radius:3px">WARNING<br>If you request/refresh this data too often you <em>may</em> be blocked for 1 hour.</div>');
        }
        if (gotCount < 5) {
            var nowSeconds = Date.now();
            var getGames = $.getJSON("/profile_rolling/" + profileID);
            getGames.done(function(data) {
                serverRequests.push(nowSeconds);
                if (serverRequests.length > 5) serverRequests.shift();
                GM_setValue('serverRequests', serverRequests);
                if (data.length > 0) {
                    data.reverse();
                    for (var key=0, l=data.length; key<l; key++) {
                        data[key].gameNumber = (data.length - key);
                    }
                    allGames = data.slice(0); //make a copy for when we adjust the # games to show
                    R300_Selections.R300SavedGames.value = data;
                    if (PageLoc !== 'profileNotOurs') {
                        GM_setValue('R300_Selections', R300_Selections);
                    }
                    $('#R300_loading').remove();
                    $('#R300_Trimmed').show(0);
                    showData();
                    showTrimmedData(R300_Selections.MaxR300Games.value, R300_Selections.MaxR300Games.value);
                    showWinPercentageHeader(data);
                    buildMenu();
                    bindEvents();
                    setSavedValues();
                } else {
                    $('#R300_Settings_Button').hide(0);
                    $('#R300').empty();
                    $('#R300').append('No data for Rolling 300 Timeline - go play some games!');
                }
            });
            getGames.fail(function(){
                $(document).ajaxError(function( event, jqxhr, settings, thrownError ) {
                    if ((PageLoc !== 'profileNotOurs') && (R300_Selections.R300SavedGames.value.length > 0)) {
                        $('#R300_loading').remove();
                        $('#R300').prepend('<div style="margin:5px 10px; padding:10px 2px; background:#b0b; color:#fff; border-radius:3px">Could not get data from server for Rolling 300 Timeline: <i>'+jqxhr.status+' '+thrownError+'</i>'+((jqxhr.status === 500) ? '<br>(Too many requests/refreshes, too often?)' : '')+'<br>Using saved data instead (this might not be accurate)...</div>');
                        var data = R300_Selections.R300SavedGames.value;
                        allGames = data.slice(0); //make a copy
                        showWinPercentageHeader(data);
                        if ($('#R300').length) {
                            $('#R300_Trimmed').show(0);
                            showData();
                            showTrimmedData(R300_Selections.MaxR300Games.value, R300_Selections.MaxR300Games.value);
                            buildMenu();
                            bindEvents();
                        }
                        setSavedValues();
                    } else {
                        $('#R300_Settings_Button').hide(0);
                        $('#R300').empty();
                        $('#R300').append('Could not get data from server for Rolling 300 Timeline: <i>'+jqxhr.status+' '+thrownError+'</i>');
                    }
                });
            });
        } else {
            $('#R300_loading').remove();
            $('#R300').empty();
            $('#R300').append('Too many requests/refreshes. Please wait a few minutes...');
        }
    } else {
        if (R300_Selections.R300SavedGames.value.length === 0) {
            if (GM_getValue('R300_Selections').R300SavedGames.value.length) {
                R300_Selections.R300SavedGames.value = GM_getValue('R300_Selections').R300SavedGames.value;
            }
        }
        if (R300_Selections.R300SavedGames.value.length) { //use saved data if it exists...
            var data = R300_Selections.R300SavedGames.value;
            allGames = data.slice(0); //make a copy
            showWinPercentageHeader(data);
            if ($('#R300').length) {
                //$('#R300_InnerContainer').append('<div style="width:60%; margin:0 auto; background:#b0b; color:#fff; border-radius:3px">Note: Using saved data</div>');
                $('#R300_Trimmed').show(0);
                showData();
                showTrimmedData(R300_Selections.MaxR300Games.value, R300_Selections.MaxR300Games.value);
                buildMenu();
                bindEvents();
            }
            setSavedValues();
        } else {
            $('#R300_Settings_Button').hide(0);
            $('#R300').empty();
            $('#R300').append('Could not get data for Rolling 300 Timeline (not logged in?)');
        }
    }
    GM_addStyle('.gamesperday_bar { margin-left:1px; background:#777 }');
    GM_addStyle('.gamesperday_bar:hover { background:#fff }');
    GM_addStyle('.R300_CTFNFWP:hover { border-bottom:1px dotted #9264DA }');
}

function buildMenu() {
    //Build the settings menu...
    $('#R300_Settings_Button').after('<div id="R300_Settings_Menu" style="display:none; position:absolute; right:0; width:300px; margin:-75px -50px 0 0; padding:10px 10px 15px; font-size:11px; text-align:left; background:linear-gradient(#3A8C66, #00a); opacity:0.95; border-radius:8px; box-shadow:0px 0px 8px #fff; z-index:6000"></div>');
    $('#R300_Settings_Menu').append('<div style="margin:0 auto; padding-bottom:5px; font-size:16px; font-weight:bold; color:#000; text-align:center; text-shadow:2px 1px 2px #aaa;">Rolling 300 Timeline Options</div>');
    var pages = [];
    $.each(R300_Selections, function(key, value) {
        if (value.type === 'checkbox') {
            if (key === 'ShowR300Intervals') {
                if (allGames.length === 300) { //Only show the bands if there's 300 games available...
                    $('#R300_Settings_Menu').append('<li style="list-style:none" title="' + value.title + '"><label><input type="checkbox" id="' + key + '" class="'+ value.type + '" ' + (value.value === true ? 'checked' : '') + '>' + value.display + '</label></li>');
                    $('#R300_Settings_Menu').append('<div id="R300WinBands" style="margin-left:18px; font-size:11px"></div>');
                    var intBands = (R300_Selections.R300WinBands.display).split(',');
                    $.each(intBands, function(k,v) {
                        $('#R300WinBands').append('<label style="margin-left:4px" title="# games"><input type="radio" name="intBand" data-band="'+v+'" ' + (v == R300_Selections.R300WinBands.value ? 'checked' : '') + ' style="margin:3px 1px 3px 3px">'+v+'</label>');
                    });
                }
            } else if (key === 'R300MainPages') {
                $('#R300_Settings_Menu').append('<div id="R300MainPages" style="text-align:center; font-size:11px">Main Window:</div>');
                pages = (R300_Selections.R300MainPages.display).split(',');
                $.each(pages, function(k,v) {
                    $('#R300MainPages').append('<label style="margin-left:4px"><input type="checkbox" name="mainPage" data-page="'+v+'" ' + ((R300_Selections.R300MainPages.title).indexOf(v) >= 0 ? 'checked' : '') + ' style="margin:3px 1px 3px 3px">'+v+'</label>');
                });
            } else if (key === 'R300HeaderPages') {
                $('#R300_Settings_Menu').append('<div id="R300HeaderPages" style="margin-bottom:5px; text-align:center; font-size:11px">Win % Header:</div>');
                pages = (R300_Selections.R300HeaderPages.display).split(',');
                $.each(pages, function(k,v) {
                    $('#R300HeaderPages').append('<label style="margin-left:4px"><input type="checkbox" name="headerPage" data-page="'+v+'" ' + ((R300_Selections.R300HeaderPages.title).indexOf(v) >= 0 ? 'checked' : '') + ' style="margin:3px 1px 3px 3px">'+v+'</label>');
                });
            } else if (key === 'ShowLessThan300GamesWarning') { //this is the start of the "mini-window" options
                $('#R300_Settings_Menu').append('<li style="list-style:none; margin-top:10px">Mini-Window Options...</li>');
                $('#R300_Settings_Menu').append('<li style="list-style:none" title="' + value.title + '"><label><input type="checkbox" id="' + key + '" class="'+ value.type + '" ' + (value.value === true ? 'checked' : '') + '>' + value.display + '</label></li>');
            } else if (key === 'ShowR300HighestLowestEver') {
                $('#R300_Settings_Menu').append('<li style="list-style:none" title="' + value.title + '"><label><input type="checkbox" id="' + key + '" class="'+ value.type + '" ' + (value.value === true ? 'checked' : '') + '>' + value.display + '</label><div id="R300ClearHighestLowestEver" style="display:inline-block; margin:0 5px; font-size:7px; border:1px solid #099; cursor:pointer" title="Clear/Reset the saved high/low values">CLEAR</div></li>');
            } else {
                $('#R300_Settings_Menu').append('<li style="list-style:none" title="' + value.title + '"><label><input type="checkbox" id="' + key + '" class="'+ value.type + '" ' + (value.value === true ? 'checked' : '') + '>' + value.display + '</label></li>');
            }
        }
    });
    $('#R300_Settings_Menu').append('<div style="position:absolute; bottom:2px; right:5px; text-align:right"><a href="https://gist.github.com/nabbynz/23a54cace27ad097d671" target="_blank" style="font-size:11px; color:#888" title="Version: ' + GM_info.script.version + '. Click to manually check for updates (script will auto-update if enabled)...">v' + GM_info.script.version + '</a</div>');
}

function setSavedValues() {
    //update with the user saved values...
    $.each(R300_Selections, function(key, value) {
        if (key === 'R300MainPages') {
            if (PageLoc === 'server') {
                if (R300_Selections[key].title.indexOf('Home') < 0) {
                    $('#R300_InnerContainer').hide(0);
                } else {
                    $('#R300_InnerContainer').fadeIn(1200);
                }
            } else if ((PageLoc === 'profile') || (PageLoc === 'profileNotOurs')) {
                if (R300_Selections[key].title.indexOf('Profile') < 0) {
                    $('#R300').hide(0);
                } else {
                    $('#R300_InnerContainer').show(0);
                }
            } else if (PageLoc === 'joining') {
                if (R300_Selections[key].title.indexOf('Joiner') < 0) {
                    $('#R300').hide(0);
                } else {
                    $('#R300_InnerContainer').show(0);
                }
            }
            
        } else if (key === 'R300HeaderPages') {
            if (PageLoc === 'server') {
                if (R300_Selections[key].title.indexOf('Home') < 0) {
                    $('#R300_WinNextHeader').hide(0);
                } else {
                    $('#R300_WinNextHeader').show(0);
                }
            } else if ((PageLoc === 'profile') || (PageLoc === 'profileNotOurs')) {
                if (R300_Selections[key].title.indexOf('Profile') < 0) {
                    $('#R300_WinNextHeader').hide(0);
                } else {
                    $('#R300_WinNextHeader').show(0);
                }
            } else if (PageLoc === 'joining') {
                if (R300_Selections[key].title.indexOf('Joiner') < 0) {
                    $('#R300_WinNextHeader').hide(0);
                } else {
                    $('#R300_WinNextHeader').show(0);
                }
            } else if (PageLoc === 'ingame') {
                if (R300_Selections[key].title.indexOf('Game') < 0) {
                    $('#R300_WinNextHeader').hide(0);
                } else {
                    $('#R300_WinNextHeader').show(0);
                }
            }
            
        } else if (key == 'ShowR300PUPsPerGame') {
                if (value.value === true) {
                    $('.R300_pups_pergame').show(0);
                    $('.R300_pups_total').hide(0);
                } else {
                    $('.R300_pups_pergame').hide(0);
                    $('.R300_pups_total').show(0);
                }

        } else if (key === 'ShowBoxShadowBorder') {
            if (value.value === true) {
                $('#R300').css('box-shadow', '#fff 0px 0px 10px');
            } else {
                $('#R300').css('box-shadow', 'none');
            }
            
        } else if (value.type === 'checkbox') {
            //Hide certain elements according to the saved values...
            if (value.value === false) {
                if (key == 'ShowR300Timeline') {
                    $('#R300_Timeline').hide(0);
                } else if (key === 'ShowR300Intervals') {
                    $('#R300_Intervals').hide(0);
                    $('#R300WinBands input').prop('disabled', true);
                } else if (key === 'ShowR300GamesPieChart') {
                    $('#R300_Pie').hide(0);
                } else if (key === 'ShowR300WinPercentage') {
                    $('#R300_Wins').hide(0);
                } else if (key === 'ShowR300PerDay') {
                    $('#R300_GamesPerDay').hide(0);
                } else if (key === 'ShowR300PerDayGraph') {
                    $('#R300_GamesPerDayGraph').hide(0);
                } else if (key === 'ShowR300Count') {
                    $('#R300_Count').hide(0);
                } else if (key === 'ShowR300HighestLowestEver') {
                    $('#R300_HighestLowestEver').hide(0);
                } else if (key === 'ShowR300CTFNF') {
                    $('#R300_CTFNF').hide(0);
                } else if (key === 'ShowR300NextGameAffect') {
                    $('#R300_NextGameAffectWin, #R300_NextGameAffectLose').hide(0);
                } else if (key === 'ShowR300OldestGame') {
                    $('#R300_OldestGame').hide(0);
                } else if (key === 'ShowR300BestStreak') {
                    $('#R300_BestStreak').hide(0);
                } else if (key === 'ShowR300CurrentStreak') {
                    $('#R300_CurrentStreak').hide(0);
                } else if (key === 'ShowR300WinStreakMessage') {
                    $('#R300_BestStreakMessage').hide(0);
                } else if (key === 'ShowR300LossStreakMessage') {
                    $('#R300_WorstStreakMessage').hide(0);
                } else if (key === 'ShowR300PUPs') {
                    $('#R300_PUPs').hide(0);
                } else if (key === 'ShowLessThan300GamesWarning') {
                    $('#R300_Trimmed').hide(0);
                    $('#ShowR300TrimmedGamesPieChart').prop('disabled', true);
                }
            }
        }
    });
}

function bindEvents() {
    $('#R300_Settings_Button').on('click', function() {
        $('#R300_Settings_Menu').slideToggle(400);
    });
    $("#R300_Settings_Menu").mouseleave(function() { 
        $('#R300_Settings_Menu').fadeOut(100);
    });
    $('#R300WinBands input').on('click', function() {
        R300_Selections.R300WinBands.value = $(this).data('band');
        GM_setValue('R300_Selections', R300_Selections);
        showData();
        if (R300_Selections.ShowLessThan300GamesWarning.value) showTrimmedData(R300_Selections.MaxR300Games.value, R300_Selections.MaxR300Games.value);
    });
    $('#R300MainPages input').on('click', function() {
        var newSelection = '';
        $.each($('#R300MainPages input'), function() {
            if ($(this).is(':checked')) newSelection += $(this).data('page') + ",";
        });
        R300_Selections.R300MainPages.title = newSelection;
        GM_setValue('R300_Selections', R300_Selections);
        if (($(this).data('page') === 'Home') && (PageLoc === 'server')) {
            $('#R300_InnerContainer').slideToggle(600);
        } else if (($(this).data('page') === 'Profile') && ((PageLoc === 'profile') || (PageLoc === 'profileNotOurs'))) {
            $('#R300').slideToggle(600);
        }
    });
    $('#R300HeaderPages input').on('click', function() {
        var newSelection = '';
        $.each($('#R300HeaderPages input'), function() {
            if ($(this).is(':checked')) newSelection += $(this).data('page') + ",";
        });
        R300_Selections.R300HeaderPages.title = newSelection;
        GM_setValue('R300_Selections', R300_Selections);
        if (($(this).data('page') === 'Home') && (PageLoc === 'server')) {
            $('#R300_WinNextHeader').slideToggle(400);
        } else if (($(this).data('page') === 'Profile') && ((PageLoc === 'profile') || (PageLoc === 'profileNotOurs'))) {
            $('#R300_WinNextHeader').slideToggle(400);
        }
    });
    $('#R300_Settings_Menu .checkbox').on('click', function() {
        R300_Selections[$(this).attr('id')].value = $(this).is(':checked');
        GM_setValue('R300_Selections', R300_Selections);
        if ($(this).attr('id') == 'ShowR300Timeline') {
            $('#R300_Timeline').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowR300Intervals') {
            $('#R300_Intervals').fadeToggle(400);
            $('#R300WinBands input').prop('disabled', ($(this).prop('checked') ? false : true));
        } else if ($(this).attr('id') == 'ShowR300GamesPieChart') {
            $('#R300_Pie').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowR300Pages') {
            $('#R300_WinNextHeader').fadeToggle(400);
            $('#R300HeaderPages input').prop('disabled', ($(this).prop('checked') ? false : true));
        } else if ($(this).attr('id') == 'ShowR300WinPercentage') {
            $('#R300_Wins').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowR300PerDay') {
            $('#R300_GamesPerDay').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowR300PerDayGraph') {
            $('#R300_GamesPerDayGraph').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowR300Count') {
            $('#R300_Count').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowR300HighestLowestEver') {
            $('#R300_HighestLowestEver').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowR300CTFNF') {
            $('#R300_CTFNF').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowR300NextGameAffect') {
            $('#R300_NextGameAffectWin, #R300_NextGameAffectLose').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowR300OldestGame') {
            $('#R300_OldestGame').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowR300BestStreak') {
            $('#R300_BestStreak').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowR300CurrentStreak') {
            $('#R300_CurrentStreak').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowR300WinStreakMessage') {
            $('#R300_BestStreakMessage').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowR300LossStreakMessage') {
            $('#R300_WorstStreakMessage').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowR300PUPs') {
            $('#R300_PUPs').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowR300TrimmedPUPs') {
            $('#R300T_PUPs').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowR300PUPsPerGame') {
            $('.R300_pups_pergame').toggle(0);
            $('.R300_pups_total').toggle(0);
        } else if ($(this).attr('id') == 'ShowR300ShowGap') {
            showData();
            if (R300_Selections.ShowLessThan300GamesWarning.value) showTrimmedData(R300_Selections.MaxR300Games.value, R300_Selections.MaxR300Games.value);
            setSavedValues();
        } else if ($(this).attr('id') == 'ShowLessThan300GamesWarning') { //Not a warning anymore - just an on/off toggle for the mini window
            $('#R300_Trimmed').fadeToggle(400);
            $('#ShowR300TrimmedGamesPieChart').prop('disabled', ($(this).prop('checked') ? false : true));
            $('#ShowR300TrimmedPUPs').prop('disabled', ($(this).prop('checked') ? false : true));
            $('#AlwaysShowLastDayPlayed').prop('disabled', ($(this).prop('checked') ? false : true));
            if (R300_Selections.ShowLessThan300GamesWarning.value) {
                setTimelineCellHeights(Cell_Width);
                showTrimmedData(R300_Selections.MaxR300Games.value, R300_Selections.MaxR300Games.value);
            }
        } else if ($(this).attr('id') == 'ShowR300TrimmedGamesPieChart') {
            if (R300_Selections.ShowLessThan300GamesWarning.value) showTrimmedData(R300_Selections.MaxR300Games.value, R300_Selections.MaxR300Games.value);
        } else if ($(this).attr('id') == 'ShowBoxShadowBorder') {
            if ($(this).is(':checked')) {
                $('#R300').css('box-shadow', '#fff 0px 0px 10px');
            } else {
                $('#R300').css('box-shadow', 'none');
            }
        }
    });
    $('#R300ClearHighestLowestEver').on('click', function() {
        var response = confirm("Your current highest/lowest saved values will be cleared.\n\nOK to continue?");
        if (response) {
            GM_deleteValue('R300_HighestEver');
            GM_deleteValue('R300_LowestEver');
            showData();
            setSavedValues();
        }
    });
}

function setTimelineCellHeights(Cell_Width) {
    Cell_Width = Cell_Width || 1;
    
    $('.r300_win').css     ({ 'display':'inline-block', 'cursor':'pointer', 'margin-left':               (R300_Selections.ShowR300ShowGap.value ? 1 : 0)+'px', 'background-color':R300_Selections.Win_Color.value,     'height':'10px', 'width':Cell_Width+'px' });
    $('.r300_loss').css    ({ 'display':'inline-block', 'cursor':'pointer', 'margin-left':               (R300_Selections.ShowR300ShowGap.value ? 1 : 0)+'px', 'background-color':R300_Selections.Loss_Color.value,    'height':'10px', 'width':Cell_Width+'px' });
    $('.r300_dc').css      ({ 'display':'inline-block', 'cursor':'pointer', 'margin'     :'0px 0px 2px '+(R300_Selections.ShowR300ShowGap.value ? 1 : 0)+'px', 'background-color':R300_Selections.DC_Color.value,      'height':' 6px', 'width':Cell_Width+'px' });
    $('.r300_ssa').css     ({ 'display':'inline-block', 'cursor':'pointer', 'margin-left':               (R300_Selections.ShowR300ShowGap.value ? 1 : 0)+'px', 'background-color':R300_Selections.SSA_Color.value,     'height':' 7px', 'width':Cell_Width+'px', 'border-top':'3px solid white' });
    $('.r300_fsa').css     ({ 'display':'inline-block', 'cursor':'pointer', 'margin-left':               (R300_Selections.ShowR300ShowGap.value ? 1 : 0)+'px', 'background-color':R300_Selections.FSA_Color.value,     'height':' 7px', 'width':Cell_Width+'px', 'border-bottom':'3px solid white' });
    $('.r300_tie').css     ({ 'display':'inline-block', 'cursor':'pointer', 'margin-left':               (R300_Selections.ShowR300ShowGap.value ? 1 : 0)+'px', 'background-color':R300_Selections.Tie_Color.value,     'height':'10px', 'width':Cell_Width+'px' });
    $('.r300_unknown').css ({ 'display':'inline-block', 'cursor':'pointer', 'margin-left':               (R300_Selections.ShowR300ShowGap.value ? 1 : 0)+'px', 'background-color':R300_Selections.Unknown_Color.value, 'height':'10px', 'width':Cell_Width+'px' });
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

    text += "\n" + new Date(parseInt(Date.parse(gameData.played))).toLocaleTimeString() + ' (' + new Date(parseInt(Date.parse(gameData.played))).toDateString() + ')';
    text += "\nYou played for " + secondsToHMS(gameData.timePlayed);
    text += "\n\nCaps: " + gameData.captures + " | Grabs: " + gameData.grabs + " | Drops: " + gameData.drops + " | Popped: " + gameData.pops + " | Tags: " + gameData.tags + " | Returns: " + gameData.returns +
            "\nHold: " + secondsToHMS(gameData.hold) + " | Prevent: " + secondsToHMS(gameData.prevent) + " | Support: " + gameData.support + " | PUP%: " + (gameData.powerups / gameData.potentialPowerups * 100).toFixed(2) + 
            "\nCaps/Grab: " + ((gameData.grabs?gameData.captures:0)/(gameData.grabs?gameData.grabs:1)).toFixed(3) + " | Tags/Pop: " + ((gameData.pops?gameData.tags:0)/(gameData.pops?gameData.pops:1)).toFixed(3);

    return text;
}



/************************************************************************************/
// Main Rolling 300 Timeline & Streaks...
/************************************************************************************/
function showData() {
    var Timeline_MaxWidth = 780;
    var Cell_Width = 18; //This value will adjust (smaller) according to MaxGames & Timeline_MaxWidth. Default=18
    var i, j;
    
    var totals = {'all':     { win:0, loss:0, dc:0, ssa:0, fsa:0, tie:0 }, 
                  'ctf':     { win:0, loss:0, dc:0, ssa:0, fsa:0, tie:0 },
                  'nf':      { win:0, loss:0, dc:0, ssa:0, fsa:0, tie:0 },
                  'pups':    { tags:0, pops:0, grabs:0, drops:0, hold:0, captures:0, prevent:0, returns:0, support:0, powerups:0, timePlayed:0 },
                  'streaks': { win:0, loss:0, temp_win:0, temp_loss:0, last_win:0, last_loss:0 }
                 };

    var data = allGames.slice(0);

    var New_Cell_Width = Math.floor((Timeline_MaxWidth - 26) / data.length);
    if (New_Cell_Width < Cell_Width) Cell_Width = New_Cell_Width - (R300_Selections.ShowR300ShowGap.value ? 1 : 0);
    if (Cell_Width <= 0) Cell_Width = 1;

    $('#R300_Intervals').empty();
    $('#R300_Timeline').empty();
    $('#R300_Messages').empty();
    $('#R300_Pie').empty();
    $('#R300_PUPs').remove();

    var totalPotentialPowerups = 0;
    
    var dayCounts = [];
    var dayCountsKey=0;
    var d1 = '';
    var d2 = '';
    
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
                    $('#R300_Timeline').append('<div class="r300_ssa" data-gamenumber="' + (data.length-key) + '" title="' + getGameInfoAsText(value) + '"></div>');
                } else {
                    totals.all.win++;
                    dayCounts[dayCountsKey].win++;
                    if (value.gameMode === 1) {
                        totals.ctf.win++;
                    } else if (value.gameMode === 2) {
                        totals.nf.win++;
                    }
                    $('#R300_Timeline').append('<div class="r300_win" data-gamenumber="' + (data.length-key) + '" title="' + getGameInfoAsText(value) + '"></div>');
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
                $('#R300_Timeline').append('<div class="r300_loss" data-gamenumber="' + (data.length-key) + '" title="' + getGameInfoAsText(value) + '"></div>');

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
                dayCounts[dayCountsKey].dc++;
                if (value.gameMode === 1) {
                    totals.ctf.dc++;
                } else if (value.gameMode === 2) {
                    totals.nf.dc++;
                }
                $('#R300_Timeline').append('<div class="r300_dc" data-gamenumber="' + (data.length-key) + '" title="' + getGameInfoAsText(value) + '"></div>');

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
                    dayCounts[dayCountsKey].fsa++;
                    if (value.gameMode === 1) {
                        totals.ctf.fsa++;
                    } else if (value.gameMode === 2) {
                        totals.nf.fsa++;
                    }
                    $('#R300_Timeline').append('<div class="r300_fsa" data-gamenumber="' + (data.length-key) + '" title="' + getGameInfoAsText(value) + '"></div>');
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
                $('#R300_Timeline').append('<div class="r300_tie" data-gamenumber="' + (data.length-key) + '" title="' + getGameInfoAsText(value) + '"></div>');

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
                title += getGameInfoAsText(value);
                $('#R300_Timeline').append('<div class="r300_unknown" data-gamenumber="' + (data.length-key) + '" title="' + getGameInfoAsText(value) + '"></div>');

                break;

        }
    });
    
    setTimelineCellHeights(Cell_Width);

    //Win %...
    var currentWinPC = ((totals.all.win+totals.all.ssa) / (totals.all.win+totals.all.ssa + totals.all.loss+totals.all.dc+totals.all.tie) * 100).toFixed(2);
    $('#R300_Messages').append('<div id="R300_Wins">Win % over your last <span style="color:' + R300_Selections.Win_Color.value + '">' + data.length + '</span> games: <span style="color:'+R300_Selections.Win_Color.value+'">' + currentWinPC + '%</span></div>');

    //Game Count...
    $('#R300_Messages').append('<div id="R300_Count">(<span style="color:'+R300_Selections.Win_Color.value+'" title="Includes Successful Save Attempts">' + (totals.all.win+totals.all.ssa) + ' Win'+((totals.all.win+totals.all.ssa)==1?'':'s')+'</span> | <span style="color:'+R300_Selections.Loss_Color.value+'" title="Does NOT include DC\'s">'+ (totals.all.loss) + ' Loss'+(totals.all.loss==1?'':'es')+'</span> | <span style="color:'+R300_Selections.Tie_Color.value+'" title="Included in Losses">'+ (totals.all.tie) + ' Tie'+(totals.all.tie==1?'':'s')+'</span> | <span style="color:'+R300_Selections.DC_Color.value+'" title="DC\'s are counted as a Loss">' + totals.all.dc + ' DC'+(totals.all.dc==1?'':'s')+'</span> | <span style="color:'+R300_Selections.SSA_Color.value+'" title="Included in Wins">' + totals.all.ssa + ' Save'+(totals.all.ssa==1?'':'s')+'</span> | <span style="color:'+R300_Selections.FSA_Color.value+'" title="Unsuccessful Save Attempts do NOT count as a Loss (or a Win)">' + totals.all.fsa + ' USA'+(totals.all.fsa==1?'':'s')+'</span>)</div>');

    //Highest/Lowest % Ever (while running this script)...
    if (PageLoc !== 'profileNotOurs') {
        if (document.URL.indexOf('.koalabeast.com') >= 0) { //only save if on a koalabeast server
            if (currentWinPC > GM_getValue('R300_HighestEver', 0)) GM_setValue('R300_HighestEver', currentWinPC);
            if (currentWinPC < GM_getValue('R300_LowestEver', 100)) GM_setValue('R300_LowestEver', currentWinPC);
        }
        $('#R300_Messages').append('<div id="R300_HighestLowestEver" title="'+R300_Selections.ShowR300HighestLowestEver.title+'"><span style="color:#2CAD9C'+(currentWinPC === GM_getValue('R300_HighestEver') ? '; text-decoration:underline':'')+'" title="Highest Win % Ever">Highest: ' + GM_getValue('R300_HighestEver') + '%</span> | <span style="color:#2CAD9C'+(currentWinPC === GM_getValue('R300_LowestEver') ? '; text-decoration:underline':'')+'" title="Lowest Win % Ever">Lowest: ' + GM_getValue('R300_LowestEver') + '%</span></div>');
    }

    //CTF / NF...
    var totalCTF = (totals.ctf.win+totals.ctf.ssa + totals.ctf.loss+totals.ctf.dc+totals.ctf.tie);
    var CTFWinPC = (totalCTF === 0) ? 0 : ((totals.ctf.win+totals.ctf.ssa) / totalCTF * 100).toFixed(2);
    var totalNF = (totals.nf.win+totals.nf.ssa + totals.nf.loss+totals.nf.dc+totals.nf.tie);
    var NFWinPC = (totalNF === 0) ? 0 : ((totals.nf.win+totals.nf.ssa) / totalNF * 100).toFixed(2);
    $('#R300_Messages').append('<div id="R300_CTFNF"><span id="R300_CTFWP" class="R300_CTFNFWP" style="color:#9264DA; cursor:pointer" title="Click to show CTF games">CTF: ' + CTFWinPC + '% ('+(totalCTF+totals.ctf.fsa)+')</span> | <span id="R300_NFWP" class="R300_CTFNFWP" style="color:#9264DA; cursor:pointer" title="Click to show Neutral Flag games">NF: ' + NFWinPC + '% ('+(totalNF+totals.nf.fsa)+')</span></div>');

    //Oldest Game...
    var oldestGame = getUsefulText( (data[0].outcome.toString() + data[0].saved.toString()), 'outcome');
    $('#R300_Messages').append('<div id="R300_OldestGame">Oldest game: ' + (oldestGame) + '</div>');

    //How next game affect's Win%...
    $('#R300_Messages').append('<div id="R300_NextGameAffectLose">' + getNextGamePercentage(data) + '</div>');

    //Win % Bands...
    if (data.length === 300) {
        var intervalSize = R300_Selections.R300WinBands.value;
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
                var IntervalCellWidth = ((Cell_Width+(R300_Selections.ShowR300ShowGap.value ? 1 : 0))*intervalSize-1);
                var IntervalMarginLeft = 0;
                if ((i === 0) || (i === data.length-intervalSize)) { //need to adjust for first & last cells...
                    IntervalCellWidth = ((Cell_Width+(R300_Selections.ShowR300ShowGap.value ? 1 : 0))*intervalSize-2); 
                    if (i === 0) IntervalMarginLeft = 2;
                }
                $('#R300_Intervals').append('<div class="R300_Interval" data-firstgame="'+(data.length-i)+'" style="display:inline-block; cursor:pointer; font-size:11px; color:#777; width:'+IntervalCellWidth+'px; height:10px; ' + (i===0 ? 'border-left:1px solid #777; ' : '') + 'border-right:1px solid #777; margin-left:'+IntervalMarginLeft+'px;" title="Games: ' + (data.length-i-intervalSize+1) + '-' + (data.length-i) + ' (' +intervalSize+')">&nbsp;'+ (intervalWins[i/intervalSize]).toFixed(1) + '%</div>');
            }
        }
    }

    //Games Pie Chart...
    $('#R300_Messages').append('<div id="R300_Pie"></div>');
    $('#R300_Pie').append('<canvas id="gamesPieChart" width="80" height="80" />');
    var canvas = document.getElementById("gamesPieChart");
    var context = canvas.getContext("2d");
    var lastend = 1.5*Math.PI;
    var gamesPieData = [totals.all.win, totals.all.loss, totals.all.tie, totals.all.dc, totals.all.fsa, totals.all.ssa];
    var gamesPieColors = [R300_Selections.Win_Color.value, R300_Selections.Loss_Color.value, R300_Selections.Tie_Color.value, R300_Selections.DC_Color.value, R300_Selections.FSA_Color.value, R300_Selections.SSA_Color.value];

    for (i = 0; i < gamesPieData.length; i++) {
        context.fillStyle = gamesPieColors[i];
        context.beginPath();
        context.moveTo(canvas.width / 2, canvas.height / 2);
        context.arc(canvas.width / 2, canvas.height / 2, canvas.height / 2, lastend, lastend + (Math.PI * 2 * (gamesPieData[i] / data.length)), false);
        context.lineTo(canvas.width / 2, canvas.height / 2);
        context.fill();
        lastend += Math.PI * 2 * (gamesPieData[i] / data.length);
    }

    //Best Streaks...
    $('#R300_Messages').append('<div id="R300_BestStreak" style="text-align:center">Best Streaks: <span style="color:' + R300_Selections.Win_Color.value + '">' + totals.streaks.win + ' Win' + (totals.streaks.win == 1 ? '' : 's') + '</span> | <span style="color:' + R300_Selections.Loss_Color.value + '">' + totals.streaks.loss + ' Loss' + (totals.streaks.loss == 1 ? '' : 'es') + '</span></div>');

    //Current Streak...
    if (data[data.length-1].outcome === 1) {
        $('#R300_Messages').append('<div id="R300_CurrentStreak" style="text-align:center">Current Streak: <span style="color:' + R300_Selections.Win_Color.value + '">' + totals.streaks.last_win + ' Win' + (totals.streaks.last_win == 1 ? '' : 's') + '</span></div>');
    } else if ((data[data.length-1].outcome === 2) || (data[data.length-1].outcome === 3)) {
        $('#R300_Messages').append('<div id="R300_CurrentStreak" style="text-align:center">Current Streak: <span style="color:' + R300_Selections.Loss_Color.value + '">' + totals.streaks.last_loss + ' Loss' + (totals.streaks.last_loss == 1 ? '' : 'es') + '</span></div>');
    }

    //Best Streak Messages...
    if ( (data[data.length-1].outcome === 1) && (totals.streaks.last_win >= totals.streaks.win) && (data.length > 5) ) {
        $('#R300_Messages').append('<div id="R300_BestStreakMessage" style="padding:3px 0; text-align:center; border-radius:5px; color:#fff; background-color:' + R300_Selections.Win_Color.value + '">You are currently on your best win streak!!!</div>');
    } else if ( (data[data.length-1].outcome === 1) && (totals.streaks.last_win == totals.streaks.win-1) && (data.length > 5) ) {
        $('#R300_Messages').append('<div id="R300_BestStreakMessage" style="padding:3px 0; text-align:center; border-radius:5px; color:#fff; background-color:' + R300_Selections.Win_Color.value + '">You are just <u>1 win away</u> from your best win streak!</div>');
    }

    //Worst Streak Messages...
    if ( ((data[data.length-1].outcome === 2) || (data[data.length-1].outcome === 3)) && (totals.streaks.last_loss >= totals.streaks.loss) && (data.length > 5) ) {
        $('#R300_Messages').append('<div id="R300_WorstStreakMessage" style="padding:3px 0; text-align:center; border-radius:5px; color:#fff; background-color:' + R300_Selections.Loss_Color.value + '">You are currently on your worst losing streak :(</div>');
    } else if ( ((data[data.length-1].outcome === 2) || (data[data.length-1].outcome === 3)) && (totals.streaks.last_loss == totals.streaks.loss-1) && (data.length > 5) ) {
        $('#R300_Messages').append('<div id="R300_WorstStreakMessage" style="padding:3px 0; text-align:center; border-radius:5px; color:#fff; background-color:' + R300_Selections.Loss_Color.value + '">You are only <u>1 loss away</u> from your worst losing streak...</div>');
    }

    //# Games Per Day Bar Graph...
    var minPlays=100, maxPlays=0, daysWithGamesCount=0;
    var gamesperday_barwidth = Math.floor(300 / dayCounts.length);
    if (gamesperday_barwidth < 1) gamesperday_barwidth = 1;
    if (gamesperday_barwidth > 10) gamesperday_barwidth = 10;
    $('#R300_Messages').append('<div id="R300_GamesPerDayGraph" style="display:flex; align-items:baseline; width:'+(dayCounts.length*(gamesperday_barwidth+1))+'px; margin:0 auto; border-bottom:1px solid #fff"></div>');
    $.each(dayCounts, function(key, value) {
        i = (value.win+value.loss+value.dc+value.ssa+value.fsa+value.tie);
        if (i > maxPlays) maxPlays = i;
        if (i < minPlays) minPlays = i;
        if (i > 0) daysWithGamesCount++;
    });
    if (R300_Selections.AlwaysShowLastDayPlayed.value) {
        R300_Selections.MaxR300Games.value = data.length - dayCounts[dayCounts.length-1].firstGameNumber;
    }
    var totalTimePlayed = 0;
    $.each(dayCounts, function(key, value) {
        i = (value.win+value.loss+value.dc+value.ssa+value.fsa+value.tie);
        totalTimePlayed += dayCounts[key].timePlayed;
        $('#R300_GamesPerDayGraph').append('<div class="gamesperday_bar" data-firstgame="'+(data.length-value.firstGameNumber)+'" data-gamecount="'+i+'" style="height:'+scaleBetween(i, (value?5:0), 30, minPlays, maxPlays)+'px; width:'+gamesperday_barwidth+'px" title="'+i+' Games on ' + dayCounts[key].day + " (" + secondsToHMS(dayCounts[key].timePlayed) + " played)\n"+value.win+' Wins, '+ value.loss+' Losses, '+ value.tie +' Ties,'+ value.dc+' DCs, '+ value.ssa+' Saves, '+ value.fsa+' USAs"></div>');
    });
    GM_addStyle('.gamesperday_bar { margin-left:1px; background:#777 }');
    GM_addStyle('.gamesperday_bar:hover { background:#fff }');

    //# Games Per Day...
    $('#R300_Messages').append('<div id="R300_GamesPerDay" style="font-size:11px">' + daysWithGamesCount + ' Game Days (' + (data.length/daysWithGamesCount).toFixed(2) + ' games/day, ' + secondsToHMS(totalTimePlayed/daysWithGamesCount) + ' mins/day)</div>');

    //Power Up Stats...
    $('#R300_MessagesPie').after('<div id="R300_PUPs" style="width:96%; margin:5px auto; padding:1px 0; font-family:monospace; display:flex; flex-wrap:wrap; justify-content:center; align-items:center; font-size:12px; border:1px solid #222; border-radius:3px; cursor:pointer"></div>');
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
            $('#R300_PUPs').append('<div class="R300_pups_pergame" style="margin:0 7px;' + (R300_Selections.ShowR300PUPsPerGame.value ? '' : 'display:none') + '" title="'+keytitle+' Per Game (click for totals)"><u>'+keytitle+'</u><br>'+secondsToHMS(value / data.length)+'</div>');
            $('#R300_PUPs').append('<div class="R300_pups_total" style="margin:0 7px;' + (R300_Selections.ShowR300PUPsPerGame.value ? 'display:none' : '') + '" title="'+keytitle+' Total (click for per-game)"><u>'+keytitle+'</u><br>'+secondsToHMS(value)+'</div>');
        } else {
            $('#R300_PUPs').append('<div class="R300_pups_pergame" style="margin:0 7px;' + (R300_Selections.ShowR300PUPsPerGame.value ? '' : 'display:none') + '" title="'+keytitle+' Per Game (click for totals)"><u>'+keytitle+'</u><br>'+(value / data.length).toFixed(2)+'</div>');
            if (key == 'powerups') {
                $('#R300_PUPs').append('<div class="R300_pups_total" style="margin:0 7px;' + (R300_Selections.ShowR300PUPsPerGame.value ? 'display:none' : '') + '" title="'+keytitle+' Total (click for per-game)"><u>'+keytitle+'</u><br>'+(value / totalPotentialPowerups * 100).toFixed(2)+'%</div>');
            } else {
                $('#R300_PUPs').append('<div class="R300_pups_total" style="margin:0 7px;' + (R300_Selections.ShowR300PUPsPerGame.value ? 'display:none' : '') + '" title="'+keytitle+' Total (click for per-game)"><u>'+keytitle+'</u><br>'+(value)+'</div>');
            }
        }
    });
    $('#R300_PUPs').append('<div style="margin:0 7px;" title="Caps/Grab"><u>C/G</u><br>'+(totals.pups.captures / totals.pups.grabs).toFixed(3)+'</div>');
    $('#R300_PUPs').append('<div style="margin:0 7px;" title="Tags/Pop"><u>T/P</u><br>'+(totals.pups.tags / totals.pups.pops).toFixed(3)+'</div>');

    $('#R300_GamesPerDayGraph .gamesperday_bar').on('click', function() {
        R300_Selections.MaxR300Games.value = $(this).data('firstgame');
        GM_setValue('R300_Selections', R300_Selections);
        setTimelineCellHeights(Cell_Width);
        showTrimmedData($(this).data('firstgame'), $(this).data('gamecount'));
    });
    $('#R300_Intervals .R300_Interval').on('click', function() {
        R300_Selections.MaxR300Games.value = $(this).data('firstgame');
        GM_setValue('R300_Selections', R300_Selections);
        setTimelineCellHeights(Cell_Width);
        $('#R300_Intervals .R300_Interval').css('color', '#777');
        $(this).css('color', '#ddd');
        showTrimmedData($(this).data('firstgame'), intervalSize);
    });
    $('#R300_Timeline div').on('click', function() {
        R300_Selections.MaxR300Games.value = $(this).data('gamenumber');
        GM_setValue('R300_Selections', R300_Selections);
        setTimelineCellHeights(Cell_Width);
        $('#R300_Intervals .R300_Interval').css('color', '#777');
        showTrimmedData($(this).data('gamenumber'), $(this).data('gamenumber'));
    });
    $('#R300_PUPs').on('click', function(){
        R300_Selections.ShowR300PUPsPerGame.value = !R300_Selections.ShowR300PUPsPerGame.value;
        GM_setValue('R300_Selections', R300_Selections);
        $('#ShowR300PUPsPerGame').prop('checked', R300_Selections.ShowR300PUPsPerGame.value);
        if (R300_Selections.ShowR300PUPsPerGame.value === true) {
            $('.R300_pups_pergame').show(0);
            $('.R300_pups_total').hide(0);
        } else {
            $('.R300_pups_pergame').hide(0);
            $('.R300_pups_total').show(0);
        }
    });
    $('#R300_CTFWP').on('click', function(){
        R300_Selections.MaxR300Games.value = 'CTF';
        GM_setValue('R300_Selections', R300_Selections);
        setTimelineCellHeights(Cell_Width);
        showTrimmedData(0,0);
    });
    $('#R300_NFWP').on('click', function(){
        R300_Selections.MaxR300Games.value = 'NF';
        GM_setValue('R300_Selections', R300_Selections);
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
    var data = allGames.slice(0);

    if (R300_Selections.MaxR300Games.value === 'CTF') {
        var newData = [];
        for (var key=0, l=data.length; key<l; key++) {
            if (data[key].gameMode === 1) newData.push(data[key]);
        }
        data = newData.slice(0);
        start = data.length;
        count = data.length;
        WinPercentageText = 'Win % over these <span style="color:' + R300_Selections.Win_Color.value + '">' + data.length + '</span> CTF games:';
    } else if (R300_Selections.MaxR300Games.value === 'NF') {
        var newData = [];
        for (var key=0, l=data.length; key<l; key++) {
            if (data[key].gameMode === 2) newData.push(data[key]);
        }
        data = newData.slice(0);
        start = data.length;
        count = data.length;
        WinPercentageText = 'Win % over these <span style="color:' + R300_Selections.Win_Color.value + '">' + data.length + '</span> NF games:';
    } else {
        if (!start) start = 0;
        if (!count) count = data.length;
        $('#R300_Timeline').find('[data-gamenumber="' + start + '"]').css('height', '+=6');
        if (count > 1) $('#R300_Timeline').find('[data-gamenumber="' + (start-count+1) + '"]').css('height', '+=6');
        start = data.length-start;
        data = data.splice(start, count);
        WinPercentageText = 'Win % over these <span style="color:' + R300_Selections.Win_Color.value + '">' + data.length + '</span> games ' + (start>=0 ? '('+(allGames.length-start-count+1)+'-'+(allGames.length-start)+'): ' : '');
    }

    if (count > 200) ShowGapMarginLeft = 0;

    var New_Cell_Width = Math.floor((Timeline_MaxWidth - 34) / data.length);
    if (New_Cell_Width < Cell_Width) Cell_Width = New_Cell_Width - (R300_Selections.ShowR300ShowGap.value ? (count > 200 ? 0 : 1) : 0);
    if (Cell_Width <= 0) Cell_Width = 1;

    $('#R300T_Timeline').empty();
    $('#R300T_Messages').empty();
    $('#R300T_PUPs').remove();

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
                    $('#R300T_Timeline').append('<div class="r300t_ssa" title="' + getGameInfoAsText(value) + '"></div>');
                } else {
                    totals.all.win++;
                    if (value.gameMode === 1) {
                        totals.ctf.win++;
                    } else if (value.gameMode === 2) {
                        totals.nf.win++;
                    }
                    $('#R300T_Timeline').append('<div class="r300t_win" title="' + getGameInfoAsText(value) + '"></div>');
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
                $('#R300T_Timeline').append('<div class="r300t_loss" title="' + getGameInfoAsText(value) + '"></div>');

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
                $('#R300T_Timeline').append('<div class="r300t_dc" title="' + getGameInfoAsText(value) + '"></div>');

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
                    } else if (value.gameMode === 2) {
                        totals.nf.fsa++;
                    }
                    $('#R300T_Timeline').append('<div class="r300t_fsa" title="' + getGameInfoAsText(value) + '"></div>');
                }

                break;

            case 5: //tie
                totals.all.tie++;
                if (value.gameMode === 1) {
                    totals.ctf.tie++;
                } else if (value.gameMode === 2) {
                    totals.nf.tie++;
                }
                $('#R300T_Timeline').append('<div class="r300t_tie" data-gamenumber="' + (data.length-key) + '" title="' + getGameInfoAsText(value) + '"></div>');

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
                $('#R300T_Timeline').append('<div class="r300t_unknown" data-gamenumber="' + (data.length-key) + '" title="Unknown Result"></div>');

                break;

        }
    });

    $('.r300t_win').css     ({ 'display':'inline-block', 'margin-left':               (R300_Selections.ShowR300ShowGap.value ? ShowGapMarginLeft : 0)+'px', 'background-color':R300_Selections.Win_Color.value,     'height':'6px', 'width':Cell_Width+'px' });
    $('.r300t_loss').css    ({ 'display':'inline-block', 'margin-left':               (R300_Selections.ShowR300ShowGap.value ? ShowGapMarginLeft : 0)+'px', 'background-color':R300_Selections.Loss_Color.value,    'height':'6px', 'width':Cell_Width+'px' });
    $('.r300t_dc').css      ({ 'display':'inline-block', 'margin'     :'0px 0px 1px '+(R300_Selections.ShowR300ShowGap.value ? ShowGapMarginLeft : 0)+'px', 'background-color':R300_Selections.DC_Color.value,      'height':'4px', 'width':Cell_Width+'px' });
    $('.r300t_ssa').css     ({ 'display':'inline-block', 'margin-left':               (R300_Selections.ShowR300ShowGap.value ? ShowGapMarginLeft : 0)+'px', 'background-color':R300_Selections.SSA_Color.value,     'height':'4px', 'width':Cell_Width+'px', 'border-top'   :'2px solid white' });
    $('.r300t_fsa').css     ({ 'display':'inline-block', 'margin-left':               (R300_Selections.ShowR300ShowGap.value ? ShowGapMarginLeft : 0)+'px', 'background-color':R300_Selections.FSA_Color.value,     'height':'4px', 'width':Cell_Width+'px', 'border-bottom':'2px solid white' });
    $('.r300t_tie').css     ({ 'display':'inline-block', 'margin-left':               (R300_Selections.ShowR300ShowGap.value ? ShowGapMarginLeft : 0)+'px', 'background-color':R300_Selections.Tie_Color.value,     'height':'6px', 'width':Cell_Width+'px' });
    $('.r300t_unknown').css ({ 'display':'inline-block', 'margin-left':               (R300_Selections.ShowR300ShowGap.value ? ShowGapMarginLeft : 0)+'px', 'background-color':R300_Selections.Unknown_Color.value, 'height':'6px', 'width':Cell_Width+'px' });

    //Win %...
    var currentWinPC = ((totals.all.win+totals.all.ssa) / (totals.all.win+totals.all.ssa + totals.all.loss+totals.all.dc+totals.all.tie) * 100).toFixed(2);
    $('#R300T_Messages').append('<div id="R300T_Wins">' + WinPercentageText + ' <span style="color:'+R300_Selections.Win_Color.value+'">' + currentWinPC + '%</span></div>');

    //Games Count...
      $('#R300T_Messages').append('<div id="R300T_Count">(<span style="color:'+R300_Selections.Win_Color.value+'" title="Includes Successful Save Attempts">' + (totals.all.win+totals.all.ssa) + ' Win'+((totals.all.win+totals.all.ssa)==1?'':'s')+'</span> | <span style="color:'+R300_Selections.Loss_Color.value+'" title="Does NOT include DC\'s">'+ (totals.all.loss) + ' Loss'+(totals.all.loss==1?'':'es')+'</span> | <span style="color:'+R300_Selections.Tie_Color.value+'" title="Included in Losses">'+ (totals.all.tie) + ' Tie'+(totals.all.tie==1?'':'s')+'</span> | <span style="color:'+R300_Selections.DC_Color.value+'" title="DC\'s are counted as a Loss">' + totals.all.dc + ' DC'+(totals.all.dc==1?'':'s')+'</span> | <span style="color:'+R300_Selections.SSA_Color.value+'" title="Included in Wins">' + totals.all.ssa + ' Save'+(totals.all.ssa==1?'':'s')+'</span> | <span style="color:'+R300_Selections.FSA_Color.value+'" title="Unsuccessful Save Attempts do NOT count as a Loss (or a Win)">' + totals.all.fsa + ' USA'+(totals.all.fsa==1?'':'s')+'</span>)</div>');

    //CTF / NF...
    var totalCTF = (totals.ctf.win+totals.ctf.ssa + totals.ctf.loss+totals.ctf.dc+totals.ctf.tie);
    var CTFWinPC = (totalCTF === 0) ? 0 : ((totals.ctf.win+totals.ctf.ssa) / totalCTF * 100).toFixed(2);
    var totalNF = (totals.nf.win+totals.nf.ssa + totals.nf.loss+totals.nf.dc+totals.nf.tie);
    var NFWinPC = (totalNF === 0) ? 0 : ((totals.nf.win+totals.nf.ssa) / totalNF * 100).toFixed(2);
    $('#R300T_Messages').append('<div id="R300T_CTFNF"><span style="color:#9264DA">CTF: ' + CTFWinPC + '% ('+(totalCTF+totals.ctf.fsa)+')</span> | <span style="color:#9264DA">NF: ' + NFWinPC + '% ('+(totalNF+totals.nf.fsa)+')</span></div>');

    //Best Streaks...
    $('#R300T_Messages').append('<div id="R300T_BestStreak" style="text-align:center">Best Streaks: <span style="color:' + R300_Selections.Win_Color.value + '">' + totals.streaks.win + ' Win' + (totals.streaks.win == 1 ? '' : 's') + '</span> | <span style="color:' + R300_Selections.Loss_Color.value + '">' + totals.streaks.loss + ' Loss' + (totals.streaks.loss == 1 ? '' : 'es') + '</span></div>');

    //Games Mini Pie Chart...
    if (R300_Selections.ShowR300TrimmedGamesPieChart.value) {
        $('#R300T_Messages').append('<div id="R300T_Pie"></div>');
        $('#R300T_Pie').append('<canvas id="gamesPieChartTrimmed" width="50" height="50" />');
        var canvas = document.getElementById("gamesPieChartTrimmed");
        var context = canvas.getContext("2d");
        var lastend = 1.5*Math.PI;
        var gamesPieData = [totals.all.win, totals.all.loss, totals.all.tie, totals.all.dc, totals.all.fsa, totals.all.ssa];
        var gamesPieColors = [R300_Selections.Win_Color.value, R300_Selections.Loss_Color.value, R300_Selections.Tie_Color.value, R300_Selections.DC_Color.value, R300_Selections.FSA_Color.value, R300_Selections.SSA_Color.value];

        for (i = 0; i < gamesPieData.length; i++) {
            context.fillStyle = gamesPieColors[i];
            context.beginPath();
            context.moveTo(canvas.width / 2, canvas.height / 2);
            context.arc(canvas.width / 2, canvas.height / 2, canvas.height / 2, lastend, lastend + (Math.PI * 2 * (gamesPieData[i] / data.length)), false);
            context.lineTo(canvas.width / 2, canvas.height / 2);
            context.fill();
            lastend += Math.PI * 2 * (gamesPieData[i] / data.length);
        }
    }

    //Power Up Stats...
    if (R300_Selections.ShowR300TrimmedPUPs.value) {
        $('#R300T_Messages').append('<div id="R300T_PUPs" style="max-width:300px; margin:5px auto; display:flex; flex-wrap:wrap; justify-content:center; align-items:center; font-family:monospace; font-size:11px; border:1px solid #222; border-radius:3px; cursor:pointer"></div>');
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
                $('#R300T_PUPs').append('<div class="R300_pups_pergame" style="margin:0 7px;' + (R300_Selections.ShowR300PUPsPerGame.value ? '' : 'display:none') + '" title="'+keytitle+' Per Game (click for totals)"><u>'+keytitle+'</u><br>'+secondsToHMS(value / data.length)+'</div>');
                $('#R300T_PUPs').append('<div class="R300_pups_total" style="margin:0 7px;' + (R300_Selections.ShowR300PUPsPerGame.value ? 'display:none' : '') + '" title="'+keytitle+' Total (click for per-game)"><u>'+keytitle+'</u><br>'+secondsToHMS(value)+'</div>');
            } else {
                $('#R300T_PUPs').append('<div class="R300_pups_pergame" style="margin:0 7px;' + (R300_Selections.ShowR300PUPsPerGame.value ? '' : 'display:none') + '" title="'+keytitle+' Per Game (click for totals)"><u>'+keytitle+'</u><br>'+(value / data.length).toFixed(2)+'</div>');
                if (key == 'powerups') {
                    $('#R300T_PUPs').append('<div class="R300_pups_total" style="margin:0 7px;' + (R300_Selections.ShowR300PUPsPerGame.value ? 'display:none' : '') + '" title="'+keytitle+' Total (click for per-game)"><u>'+keytitle+'</u><br>'+(value / totalPotentialPowerups * 100).toFixed(2)+'%</div>');
                } else {
                    $('#R300T_PUPs').append('<div class="R300_pups_total" style="margin:0 7px;' + (R300_Selections.ShowR300PUPsPerGame.value ? 'display:none' : '') + '" title="'+keytitle+' Total (click for per-game)"><u>'+keytitle+'</u><br>'+(value)+'</div>');
                }
            }
        });
        $('#R300T_PUPs').append('<div style="margin:0 7px;" title="Caps/Grab"><u>C/G</u><br>'+(totals.pups.captures / totals.pups.grabs).toFixed(3)+'</div>');
        $('#R300T_PUPs').append('<div style="margin:0 7px;" title="Tags/Pop"><u>T/P</u><br>'+(totals.pups.tags / totals.pups.pops).toFixed(3)+'</div>');

        $('#R300T_PUPs').on('click', function(){
            R300_Selections.ShowR300PUPsPerGame.value = !R300_Selections.ShowR300PUPsPerGame.value;
            GM_setValue('R300_Selections', R300_Selections);
            $('#ShowR300PUPsPerGame').prop('checked', R300_Selections.ShowR300PUPsPerGame.value);
            if (R300_Selections.ShowR300PUPsPerGame.value === true) {
                $('.R300_pups_pergame').show(0);
                $('.R300_pups_total').hide(0);
            } else {
                $('.R300_pups_pergame').hide(0);
                $('.R300_pups_total').show(0);
            }
        });
    }
}


tagpro.ready(function() {
    if (PageLoc === 'ingame') { //in a game
        var serverRequests = GM_getValue('serverRequests', []);

        tagpro.socket.on('settings', function(data) { 
            if (tagpro.settings.stats === false) {
                $('.R300_Stats_Dependent').css('text-decoration', 'line-through').css('text-shadow', 'none');
                $('.R300_Stats_Dependent').attr('title', 'Stats are OFF');
            }
        });

        tagpro.socket.on('end', function(data) {
            if (!tagpro.spectator && tagpro.settings.stats && GM_getValue('R300_Selections').R300SavedGames.display) { //.display holds our profile id
                setTimeout(function() {
                    var nowSeconds = Date.now();
                    $.getJSON("http://"+tagpro.serverHost+"/profile_rolling/" + GM_getValue('R300_Selections').R300SavedGames.display)
                    .done(function(gamesdata) {
                        R300_Selections.R300SavedGames.value = gamesdata.reverse();
                        GM_setValue('R300_Selections', R300_Selections);
                        serverRequests.push(nowSeconds);
                        if (serverRequests.length > 5) serverRequests.shift();
                        GM_setValue('serverRequests', serverRequests);
                    })
                    .fail(function(gamesdata) {
                        console.log('R300: FAILED to get server data for profile: '+R300_Selections.R300SavedGames.display);
                        //$('body').prepend('<div style="width:60%; margin:0 auto; background:#b0b; color:#fff; border-radius:3px">Could not get timeline data from server. Will try again next game...</div>');
                        R300_Selections.R300SavedGames.value.push({outcome:999, saved:999}); //push an unknown outcome onto our saved data
                        if (R300_Selections.R300SavedGames.value.length > 300) R300_Selections.R300SavedGames.value.shift();
                        GM_setValue('R300_Selections', R300_Selections);
                    });
                }, 3000);
            }
        });
    }
});


//Get things ready and start the script...
R300_Selections = $.extend(true, {}, options, GM_getValue('R300_Selections', options));
$.each(R300_Selections, function(key, value) {
    R300_Selections[key].type = options[key].type;
    if (key !== 'R300SavedGames') {
        R300_Selections[key].display = options[key].display;
        if ((key !== 'R300MainPages') && (key !== 'R300HeaderPages')) {
            R300_Selections[key].title = options[key].title;
        }
    }
});
if (GM_getValue('R300_Selections') === 'undefined') { //first time
    GM_setValue('R300_Selections', R300_Selections);
}

//Setup the main div location depending on which page we are on...
var R300_Div = '<div id="R300" style="position:relative; margin:20px auto 0 auto; padding:10px; width:-webkit-fit-content; color:#fff; text-align:center; text-shadow:2px 1px 2px #000000; border-radius:8px; ' + (R300_Selections.ShowBoxShadowBorder.value ? 'box-shadow:#fff 0px 0px 10px; ' : '') + 'background:rgba(0,0,0,0.1);  white-space:nowrap;">' + 
    '<div style="display:inline-block">Rolling 300 Timeline</div>' +
    '<div id="R300_Settings_Button" style="display:inline-block; font-size:11px; text-align:center; margin-left:10px; height:13px; width:14px; border:2px solid #3A8CBB; border-radius:8px; cursor:pointer" title="Options">&#8286;</div>' +
    '</div>';
if (PageLoc === 'server') { //Chosen server page
    $('#play').parent().next().after(R300_Div);
    if (R300_Selections.R300MainPages.title.indexOf('Home') >= 0) $('#R300').append('<div id="R300_loading" style="margin:20px; font-size:18px; color:#ff0">Getting Data...<div style="background:#000000 url(\'http://i.imgur.com/WKZPcQA.gif\') no-repeat center; margin-top:10px; opacity:0.7; height:64px; width:100%;"></div></div>');
} else if (PageLoc === 'profile') {   //Profile page
    $('h1').parent('a').after(R300_Div); 
} else if (PageLoc === 'profileNotOurs') { //Someone else's profile page
    $('h1').parent('a').after(R300_Div);
} else if (PageLoc === 'joining') { //Joining page
    $('#message').after(R300_Div);
}

if ($('#R300').length) {
    $('#R300').append('<div id="R300_InnerContainer" style="display:none"></div>');
    $('#R300_InnerContainer').append('<div id="R300_Intervals"></div>');
    $('#R300_InnerContainer').append('<div id="R300_Timeline"></div>');
    $('#R300_InnerContainer').append('<div id="R300_MessagesPie" style="display:flex; align-items:center; justify-content:center; font-size:12px"></div>');
    $('#R300_MessagesPie').append('<div id="R300_Messages" style="flex:0 0 auto; align-self:flex-start;"></div>');
    $('#R300_MessagesPie').append('<div id="R300_Trimmed" style="display:none; flex:0 0 auto; margin:0 0 0 20px; padding:4px; border:1px solid #aaa; border-radius:3px; font-size:11px"></div>');
    $('#R300_Trimmed').append('<div id="R300T_Timeline" style="padding:0"></div>');
    $('#R300_Trimmed').append('<div id="R300T_Messages"></div>');
}

loadData();

