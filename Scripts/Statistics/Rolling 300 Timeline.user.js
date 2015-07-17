// ==UserScript==
// @name            Rolling 300 Timeline
// @description     Shows your Rolling 300 Timeline & Streaks (using official game data) on your chosen server homepage.
// @version         1.6.8
// @include         http://tagpro*.koalabeast.com*
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_addStyle
// @updateURL       https://gist.github.com/nabbynz/23a54cace27ad097d671/raw/TagPro_Rolling300Timeline.user.js
// @downloadURL     https://gist.github.com/nabbynz/23a54cace27ad097d671/raw/TagPro_Rolling300Timeline.user.js
// @license         GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author          nabby
// ==/UserScript==


var options = { //defaults
    //Best not to edit these ones (you can select them through the on-page menu)...
    'R300MainPages':                          { display:'Home,Profile,Joiner',                           type:'checkbox',      value:0,             title:'Home,Profile'},
    'R300HeaderPages':                        { display:'Home,Profile,Joiner,Game',                      type:'checkbox',      value:0,             title:'Home,Profile,Joiner,Game'},
    'MaxR300Games':                           { display:'# Games to View: ',                             type:'overwritten',   value:50,            title:''},
    'ShowR300Timeline':                       { display:'Show Timeline',                                 type:'checkbox',      value:true,          title:''},
    'ShowR300Intervals':                      { display:'Show Win % Bands for...',                       type:'checkbox',      value:true,          title:''},
    'R300WinBands':                           { display:'20,25,30,50,75,100,150',                        type:'subradio',      value:50,            title:''},
    'ShowR300GamesPieChart':                  { display:'Show Pie Chart',                                type:'checkbox',      value:true,          title:''},
    'ShowR300WinPercentage':                  { display:'Show Win %',                                    type:'checkbox',      value:true,          title:''},
    'ShowR300Count':                          { display:'Show Count',                                    type:'checkbox',      value:true,          title:''},
    'ShowR300NextGameAffect':                 { display:'Show "Next Game" effect',                       type:'checkbox',      value:true,          title:''},
    'ShowR300OldestGame':                     { display:'Show "Oldest Game"',                            type:'checkbox',      value:false,         title:''},
    'ShowR300BestStreak':                     { display:'Show Best Streak',                              type:'checkbox',      value:true,          title:''},
    'ShowR300CurrentStreak':                  { display:'Show Current Streak',                           type:'checkbox',      value:true,          title:''},
    'ShowR300WinStreakMessage':               { display:'Show "Best Streak" Messages',                   type:'checkbox',      value:true,          title:'Show messages like: &quot;You are currently on your best win streak!&quot;'},
    'ShowR300LossStreakMessage':              { display:'Show "Worst Streak" Messages',                  type:'checkbox',      value:false,         title:'Show messages like: &quot;You are currently on your worst losing streak&quot;'},
    'ShowR300PerDay':                         { display:'Show # Games Per Day',                          type:'checkbox',      value:true,          title:''},
    'ShowR300PerDayGraph':                    { display:'Show # Games Per Day Graph',                    type:'checkbox',      value:true,          title:''},
    'ShowR300PUPs':                           { display:'Show Power-Up Stats',                           type:'checkbox',      value:true,          title:''},
    'ShowR300PUPsPerGame':                    { display:'Show values as "Per-Game"',                     type:'checkbox',      value:true,          title:'Click to change between per-game values & totals...'},
    'ShowR300ShowGap':                        { display:'Show a gap between games in Timeline',          type:'checkbox',      value:true,          title:''},
    'ShowLessThan300GamesWarning':            { display:'Show the "Mini Selection" Window',              type:'checkbox',      value:true,          title:''},
    'ShowR300TrimmedGamesPieChart':           { display:'Show Pie Chart',                                type:'checkbox',      value:false,         title:''},

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

var R300_Selections = options;

function secondsToHMS(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s);
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

var allGames = [];

function loadSavedOptions() {
    if (GM_getValue('R300_Selections')) {
        var saveSelections_Flag = false;
        $.each(GM_getValue('R300_Selections'), function(key, value) {
            if (R300_Selections[key]) {
                if ((key === 'R300MainPages') || (key === 'R300HeaderPages')) {
                    R300_Selections[key].title = value.title;
                } else if (key === 'R300SavedGames') {
                    R300_Selections[key].value = value.value; //saved game data
                    R300_Selections[key].display = value.display; //profile id
                } else {
                    if (R300_Selections[key].type !== 'manual') R300_Selections[key].value = value.value;
                }
            } else { //saved key no longer exists in our object (probably changed/removed on an update)
                saveSelections_Flag = true;
            }
        });
        if (saveSelections_Flag) GM_setValue('R300_Selections', R300_Selections);
    }
}

$(document).ready(function() {
    console.log('START: Rolling 300 Timeline...');

    $.get('http://i.imgur.com/WKZPcQA.gif'); //preload the ajax loading gif

    loadSavedOptions();

    //Setup the main div location depending on which page we are on...
    var R300_Div = '<div id="R300" style="position:relative; margin:20px auto 0 auto; padding:10px; width:-webkit-fit-content; color:#fff; text-align:center; text-shadow:2px 1px 2px #000000; border-radius:8px; box-shadow:#fff 0px 0px 10px; background:rgba(0,0,0,0.1);  white-space:nowrap;">Rolling 300 Timeline<div id="R300_Settings_Button" style="display:inline-block; font-size:11px; text-align:center; margin-left:10px; height:13px; width:14px; border:2px solid #3A8CBB; border-radius:8px; cursor:pointer" title="Options">&#8286;</div></div>';
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
});

function getOldestGamesBlock(data, numberGamesToShow) {
    numberGamesToShow = numberGamesToShow || 3;

    if (data.length > numberGamesToShow) {
        var blocks = '<div style="display:inline-block; margin-right:5px" title="Oldest '+numberGamesToShow+' Games">';
        for (var i=0; i<(numberGamesToShow); i++) {
            if (data[i].outcome === 1) {
                if (data[i].saved === 2) {
                    blocks += '<div class="fl_ssa"></div>';
                } else {
                    blocks += '<div class="fl_win"></div>';
                }
            } else if (data[i].outcome === 2) {
                blocks += '<div class="fl_loss"></div>';
            } else if (data[i].outcome === 3) {
                blocks += '<div class="fl_dc"></div>';
            } else if (data[i].outcome === 4) { //Save Attempt
                if (data[i].saved === 1) { //Unsuccessful
                    blocks += '<div class="fl_fsa"></div>';
                }
            } else if (data[i].outcome === 5) { //Tie
                blocks += '<div class="fl_tie"></div>';
            } else { //Unknown
                blocks += '<div class="fl_unk"></div>';
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
                    blocks += '<div class="fl_ssa"></div>';
                } else {
                    blocks += '<div class="fl_win"></div>';
                }
            } else if (data[i].outcome === 2) {
                blocks += '<div class="fl_loss"></div>';
            } else if (data[i].outcome === 3) {
                blocks += '<div class="fl_dc"></div>';
            } else if (data[i].outcome === 4) { //Save Attempt
                if (data[i].saved === 1) { //Unsuccessful
                    blocks += '<div class="fl_fsa"></div>';
                }
            } else if (data[i].outcome === 5) { //Tie
                blocks += '<div class="fl_tie"></div>';
            } else { //Unknown
                blocks += '<div class="fl_unk"></div>';
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

function showWinPercentageHeader(data) {
    var WinP_Div = '<div id="R300_WinNextHeader" style="position:relative; width:100%; top:1px; font-size:12px;font-weight:bold; color:#fff; text-align:center; text-shadow:1px 2px 1px #222; clear:both"><div style="display:inline-block">'+getOldestGamesBlock(data)+'</div><div style="display:inline-block">Current: ' + getWinPercentage(data) + '%&nbsp;|&nbsp;</div><div style="display:inline-block">' + getNextGamePercentage(data) + '</div><div style="display:inline-block">'+getLatestGamesBlock(data)+'</div></div>';
    
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
    
    $('.fl_win').css ({ 'display':'inline-block', 'margin-left':'1px'        , 'background-color':R300_Selections.Win_Color.value,     'height':'8px', 'width':'8px' });
    $('.fl_loss').css({ 'display':'inline-block', 'margin-left':'1px'        , 'background-color':R300_Selections.Loss_Color.value,    'height':'8px', 'width':'8px' });
    $('.fl_dc').css  ({ 'display':'inline-block', 'margin'     :'0 0 2px 1px', 'background-color':R300_Selections.DC_Color.value,      'height':'4px', 'width':'8px' });
    $('.fl_ssa').css ({ 'display':'inline-block', 'margin-left':'1px'        , 'background-color':R300_Selections.SSA_Color.value,     'height':'6px', 'width':'8px', 'border-top'   :'2px solid white' });
    $('.fl_fsa').css ({ 'display':'inline-block', 'margin-left':'1px'        , 'background-color':R300_Selections.FSA_Color.value,     'height':'6px', 'width':'8px', 'border-bottom':'2px solid white' });
    $('.fl_tie').css ({ 'display':'inline-block', 'margin-left':'1px'        , 'background-color':R300_Selections.Tie_Color.value,     'height':'8px', 'width':'8px' });
    $('.fl_unk').css ({ 'display':'inline-block', 'margin-left':'1px'        , 'background-color':R300_Selections.Unknown_Color.value, 'height':'8px', 'width':'8px' });
}

function getProfileID() {
    var url='', R300ProfileID='';

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
        if (R300_Selections.R300SavedGames.value.length > 0) { //use saved data if it exists...
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
}

function buildMenu() {
    //Build the settings menu...
    $('#R300_Settings_Button').after('<div id="R300_Settings_Menu" style="display:none; position:absolute; right:0; width:300px; margin:-75px -50px 0 0; padding:10px 10px 15px; text-align:left; background:#3A8C66; opacity:0.9; border-radius:8px; box-shadow:0px 0px 8px #fff; z-index:6000"></div>');
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
            } else if ((key === 'ShowR300TrimmedGamesPieChart') || (key === 'ShowR300PUPsPerGame')) {
                $('#R300_Settings_Menu').append('<li style="list-style:none; margin-left:18px" title="' + value.title + '"><label><input type="checkbox" id="' + key + '" class="'+ value.type + '" ' + (value.value === true ? 'checked' : '') + '>' + value.display + '</label></li>');
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
                    $('#R300_InnerContainer').hide(0);
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
        } else if (value.type === 'checkbox') {
            //Hide certain elements according to the saved values...
            if (key == 'ShowR300PUPsPerGame') {
                if (value.value === true) {
                    $('.R300_pups_pergame').show(0);
                    $('.R300_pups_total').hide(0);
                } else {
                    $('.R300_pups_pergame').hide(0);
                    $('.R300_pups_total').show(0);
                }
            } else if (value.value === false) {
                if (key == 'ShowR300Timeline') {
                    $('#R300_Timeline').hide(0);
                } else if (key == 'ShowR300Intervals') {
                    $('#R300_Intervals').hide(0);
                    $('#R300WinBands input').prop('disabled', true);
                } else if (key == 'ShowR300GamesPieChart') {
                    $('#R300_Pie').hide(0);
                } else if (key == 'ShowR300WinPercentage') {
                    $('#R300_Wins').hide(0);
                } else if (key == 'ShowR300PerDay') {
                    $('#R300_GamesPerDay').hide(0);
                } else if (key == 'ShowR300PerDayGraph') {
                    $('#R300_GamesPerDayGraph').hide(0);
                } else if (key == 'ShowR300Count') {
                    $('#R300_Count').hide(0);
                } else if (key == 'ShowR300NextGameAffect') {
                    $('#R300_NextGameAffectWin, #R300_NextGameAffectLose').hide(0);
                } else if (key == 'ShowR300OldestGame') {
                    $('#R300_OldestGame').hide(0);
                } else if (key == 'ShowR300BestStreak') {
                    $('#R300_BestStreak').hide(0);
                } else if (key == 'ShowR300CurrentStreak') {
                    $('#R300_CurrentStreak').hide(0);
                } else if (key == 'ShowR300WinStreakMessage') {
                    $('#R300_BestStreakMessage').hide(0);
                } else if (key == 'ShowR300LossStreakMessage') {
                    $('#R300_WorstStreakMessage').hide(0);
                } else if (key == 'ShowR300PUPs') {
                    $('#R300_PUPs').hide(0);
                } else if (key == 'ShowLessThan300GamesWarning') {
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
            $('#R300_InnerContainer').slideToggle(600);
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
            $('#R300T_PUPs').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowR300PUPsPerGame') {
            $('.R300_pups_pergame').toggle(0);
            $('.R300_pups_total').toggle(0);
        } else if ($(this).attr('id') == 'ShowR300ShowGap') {
            showData();
            if (R300_Selections.ShowLessThan300GamesWarning.value) showTrimmedData(R300_Selections.MaxR300Games.value, R300_Selections.MaxR300Games.value);
            setSavedValues();
        } else if ($(this).attr('id') == 'ShowLessThan300GamesWarning') { //Not a warning anymore - just an on/off toggle
            $('#R300_Trimmed').fadeToggle(400);
            $('#ShowR300TrimmedGamesPieChart').prop('disabled', ($(this).prop('checked') ? false : true));
            if (R300_Selections.ShowLessThan300GamesWarning.value) showTrimmedData(R300_Selections.MaxR300Games.value, R300_Selections.MaxR300Games.value);
        } else if ($(this).attr('id') == 'ShowR300TrimmedGamesPieChart') {
            if (R300_Selections.ShowLessThan300GamesWarning.value) showTrimmedData(R300_Selections.MaxR300Games.value, R300_Selections.MaxR300Games.value);
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



/************************************************************************************/
// Main Rolling 300 Timeline & Streaks...
/************************************************************************************/
function showData() {
    var Timeline_MaxWidth = 780;
    var Cell_Width = 18; //This value will adjust (smaller) according to MaxGames & Timeline_MaxWidth. Default=18
    var title = '';
    var notShowingAllGamesMessage = '';
    var total_win = 0;
    var total_loss = 0;
    var total_dc = 0;
    var total_ssa = 0;
    var total_fsa = 0;
    var total_tie = 0;
    var total_pups = { tags:0, pops:0, grabs:0, drops:0, hold:0, captures:0, prevent:0, returns:0, support:0, powerups:0, timePlayed:0 };
    var win_streak = 0;
    var loss_streak = 0;
    var temp_win_streak = 0;
    var temp_loss_streak = 0;
    var last_win_streak = 0;
    var last_loss_streak = 0;
    var i, j;
    
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
    var dayCountsKey=0, mostPlays=0;
    var d1 = '';
    var d2 = '';

    $(data).each(function(key, value) {
        d1 = new Date(value.played);
        if (key === 0) { //first game, nothing to compare to yet so just push it
            dayCounts.push( { day:d1.toDateString(), firstGameNumber:key, win:0, loss:0, dc:0, ssa:0, fsa:0, tie:0 } );
        } else {
            j = Math.ceil((d1 - d2) / (1000 * 3600 * 24));
            if ( (d2 !== '') && (d1.toDateString() !== d2.toDateString()) ) {
                for (i=dayCountsKey+1; i<dayCountsKey+j; i++) {
                    dayCounts.push( { day:0, firstGameNumber:0, win:0, loss:0, dc:0, ssa:0, fsa:0, tie:0 } );
                }
                dayCounts.push( { day:d1.toDateString(), firstGameNumber:key, win:0, loss:0, dc:0, ssa:0, fsa:0, tie:0 } ); 
                dayCountsKey += j;
            }
        }
        d2 = d1; //save for compare on next loop
        
        title = 'Game #' + (data.length-key) + ': ';
        totalPotentialPowerups += value.potentialPowerups;
        $.each(total_pups, function(key1, value1) {
            total_pups[key1] += value[key1];
        });
        switch (value.outcome) {
            case 1: //win
                title += ' Win ' + (value.saved === 2 ? '- Successful Save Attempt! ' : '') + '(' + getUsefulText(value.gameMode, 'gamemode') + ')';
                title += "\n" + new Date(parseInt(Date.parse(value.played))).toLocaleTimeString() + ' (' + new Date(parseInt(Date.parse(value.played))).toDateString() + ')';
                title += "\nYou played for " + secondsToHMS(value.timePlayed);
                title += "\n\nCaps: " + value.captures + " | Grabs: " + value.grabs + " | Drops: " + value.drops + " | Popped: " + value.pops + " | Tags: " + value.tags + " | Returns: " + value.returns +
                         "\nHold: " + secondsToHMS(value.hold) + " | Prevent: " + secondsToHMS(value.prevent) + " | Support: " + value.support + " | PUP%: " + (value.powerups / value.potentialPowerups * 100).toFixed(2) + 
                         "\nCaps/Grab: " + ((value.grabs?value.captures:0)/(value.grabs?value.grabs:1)).toFixed(3) + " | Tags/Pop: " + ((value.pops?value.tags:0)/(value.pops?value.pops:1)).toFixed(3);
                if (value.saved === 2) {
                    $('#R300_Timeline').append('<div class="r300_ssa" data-gamenumber="' + (data.length-key) + '" title="' + title + '"></div>');
                    total_ssa++;
                    dayCounts[dayCountsKey].ssa++;
                } else {
                    $('#R300_Timeline').append('<div class="r300_win" data-gamenumber="' + (data.length-key) + '" title="' + title + '"></div>');
                    total_win++;
                    dayCounts[dayCountsKey].win++;
                }

                //streak...
                i=key;
                while ( (i > 0) && ((data[i-1].outcome === 4)&&(data[i-1].saved === 1)) ) { //unsuccessful saves shouldn't break a streak!
                    i--;
                }
                if ( (temp_win_streak === 0) || ((i > 0) && ((data[i-1].outcome === 1)) ) ) temp_win_streak++;
                if (temp_win_streak > win_streak) win_streak = temp_win_streak;
                temp_loss_streak = 0;
                if (temp_win_streak > 0) last_win_streak = temp_win_streak;
                
                break;

            case 2: //loss
                title += ' Loss (' + getUsefulText(value.gameMode, 'gamemode') + ')';
                title += "\n" + new Date(parseInt(Date.parse(value.played))).toLocaleTimeString() + ' (' + new Date(parseInt(Date.parse(value.played))).toDateString() + ')';
                title += "\nYou played for " + secondsToHMS(value.timePlayed);
                title += "\n\nCaps: " + value.captures + " | Grabs: " + value.grabs + " | Drops: " + value.drops + " | Popped: " + value.pops + " | Tags: " + value.tags + " | Returns: " + value.returns +
                         "\nHold: " + secondsToHMS(value.hold) + " | Prevent: " + secondsToHMS(value.prevent) + " | Support: " + value.support + " | PUP%: " + (value.powerups / value.potentialPowerups * 100).toFixed(2) + 
                         "\nCaps/Grab: " + ((value.grabs?value.captures:0)/(value.grabs?value.grabs:1)).toFixed(3) + " | Tags/Pop: " + ((value.pops?value.tags:0)/(value.pops?value.pops:1)).toFixed(3);
                $('#R300_Timeline').append('<div class="r300_loss" data-gamenumber="' + (data.length-key) + '" title="' + title + '"></div>');
                total_loss++;
                dayCounts[dayCountsKey].loss++;

                //streak...
                //((data[key-1].outcome === 4)&&(data[key-1].saved === 1)) //an unsuccessful save won't break a streak
                i=key;
                while ( (i > 0) && ((data[i-1].outcome === 4)&&(data[i-1].saved === 1)) ) { //unsuccessful saves shouldn't break a streak!
                    i--;
                }
                if ( (temp_loss_streak === 0) || ((i > 0) && ((data[i-1].outcome === 2) || (data[i-1].outcome === 3) || (data[i-1].outcome === 5)) ) ) temp_loss_streak++;
                if (temp_loss_streak > loss_streak) loss_streak = temp_loss_streak;
                temp_win_streak = 0;
                if (temp_loss_streak > 0) last_loss_streak = temp_loss_streak;
                
                break;

            case 3: //dc
                title += ' DC/Loss (' + getUsefulText(value.gameMode, 'gamemode') + ')';
                title += "\n" + new Date(parseInt(Date.parse(value.played))).toLocaleTimeString() + ' (' + new Date(parseInt(Date.parse(value.played))).toDateString() + ')';
                title += "\nYou played for " + secondsToHMS(value.timePlayed);
                title += "\n\nCaps: " + value.captures + " | Grabs: " + value.grabs + " | Drops: " + value.drops + " | Popped: " + value.pops + " | Tags: " + value.tags + " | Returns: " + value.returns +
                         "\nHold: " + secondsToHMS(value.hold) + " | Prevent: " + secondsToHMS(value.prevent) + " | Support: " + value.support + " | PUP%: " + (value.powerups / value.potentialPowerups * 100).toFixed(2) + 
                         "\nCaps/Grab: " + ((value.grabs?value.captures:0)/(value.grabs?value.grabs:1)).toFixed(3) + " | Tags/Pop: " + ((value.pops?value.tags:0)/(value.pops?value.pops:1)).toFixed(3);
                $('#R300_Timeline').append('<div class="r300_dc" data-gamenumber="' + (data.length-key) + '" title="' + title + '"></div>');
                total_dc++;
                dayCounts[dayCountsKey].dc++;

                //streak...
                i=key;
                while ( (i > 0) && ((data[i-1].outcome === 4)&&(data[i-1].saved === 1)) ) { //unsuccessful saves shouldn't break a streak!
                    i--;
                }
                if ( (temp_loss_streak === 0) || ((i > 0) && ((data[i-1].outcome === 2) || (data[i-1].outcome === 3) || (data[i-1].outcome === 5)) ) ) temp_loss_streak++;
                if (temp_loss_streak > loss_streak) loss_streak = temp_loss_streak;
                temp_win_streak = 0;
                if (temp_loss_streak > 0) last_loss_streak = temp_loss_streak;

                break;

            case 4: //save attempt
                if (value.saved === 1) { //failed save attempt...
                    title += ' Unsuccessful Save Attempt (' + getUsefulText(value.gameMode, 'gamemode') + ')';
                    title += "\n" + new Date(parseInt(Date.parse(value.played))).toLocaleTimeString() + ' (' + new Date(parseInt(Date.parse(value.played))).toDateString() + ')';
                    title += "\nYou played for " + secondsToHMS(value.timePlayed);
                    title += "\n\nCaps: " + value.captures + " | Grabs: " + value.grabs + " | Drops: " + value.drops + " | Popped: " + value.pops + " | Tags: " + value.tags + " | Returns: " + value.returns +
                             "\nHold: " + secondsToHMS(value.hold) + " | Prevent: " + secondsToHMS(value.prevent) + " | Support: " + value.support + " | PUP%: " + (value.powerups / value.potentialPowerups * 100).toFixed(2) + 
                             "\nCaps/Grab: " + ((value.grabs?value.captures:0)/(value.grabs?value.grabs:1)).toFixed(3) + " | Tags/Pop: " + ((value.pops?value.tags:0)/(value.pops?value.pops:1)).toFixed(3);
                    $('#R300_Timeline').append('<div class="r300_fsa" data-gamenumber="' + (data.length-key) + '" title="' + title + '"></div>');
                    total_fsa++;
                    dayCounts[dayCountsKey].fsa++;
                }

                break;

            case 5: //tie
                title += ' Tie/Loss (' + getUsefulText(value.gameMode, 'gamemode') + ')';
                title += "\n" + new Date(parseInt(Date.parse(value.played))).toLocaleTimeString() + ' (' + new Date(parseInt(Date.parse(value.played))).toDateString() + ')';
                title += "\nYou played for " + secondsToHMS(value.timePlayed);
                title += "\n\nCaps: " + value.captures + " | Grabs: " + value.grabs + " | Drops: " + value.drops + " | Popped: " + value.pops + " | Tags: " + value.tags + " | Returns: " + value.returns +
                         "\nHold: " + secondsToHMS(value.hold) + " | Prevent: " + secondsToHMS(value.prevent) + " | Support: " + value.support + " | PUP%: " + (value.powerups / value.potentialPowerups * 100).toFixed(2) + 
                         "\nCaps/Grab: " + ((value.grabs?value.captures:0)/(value.grabs?value.grabs:1)).toFixed(3) + " | Tags/Pop: " + ((value.pops?value.tags:0)/(value.pops?value.pops:1)).toFixed(3);
                $('#R300_Timeline').append('<div class="r300_tie" data-gamenumber="' + (data.length-key) + '" title="' + title + '"></div>');
                total_tie++;
                dayCounts[dayCountsKey].tie++;

                //streak...
                i=key;
                while ( (i > 0) && ((data[i-1].outcome === 4)&&(data[i-1].saved === 1)) ) { //unsuccessful saves shouldn't break a streak!
                    i--;
                }
                if ( (temp_loss_streak === 0) || ((i > 0) && ((data[i-1].outcome === 2) || (data[i-1].outcome === 3) || (data[i-1].outcome === 5)) ) ) temp_loss_streak++;
                if (temp_loss_streak > loss_streak) loss_streak = temp_loss_streak;
                temp_win_streak = 0;
                if (temp_loss_streak > 0) last_loss_streak = temp_loss_streak;
                
                break;
                
            default: //just in case!
                title += ' Unknown Result! (' + getUsefulText(value.gameMode, 'gamemode') + ')';
                title += "\n" + new Date(parseInt(Date.parse(value.played))).toLocaleTimeString() + ' (' + new Date(parseInt(Date.parse(value.played))).toDateString() + ')';
                title += "\nYou played for " + secondsToHMS(value.timePlayed);
                title += "\n\nCaps: " + value.captures + " | Grabs: " + value.grabs + " | Drops: " + value.drops + " | Popped: " + value.pops + " | Tags: " + value.tags + " | Returns: " + value.returns +
                         "\nHold: " + secondsToHMS(value.hold) + " | Prevent: " + secondsToHMS(value.prevent) + " | Support: " + value.support + " | PUP%: " + (value.powerups / value.potentialPowerups * 100).toFixed(2) + 
                         "\nCaps/Grab: " + ((value.grabs?value.captures:0)/(value.grabs?value.grabs:1)).toFixed(3) + " | Tags/Pop: " + ((value.pops?value.tags:0)/(value.pops?value.pops:1)).toFixed(3);
                $('#R300_Timeline').append('<div class="r300_unknown" data-gamenumber="' + (data.length-key) + '" title="' + title + '"></div>');

                break;

        }
    });
    
    setTimelineCellHeights(Cell_Width);

    //Win %...
    $('#R300_Messages').append('<div id="R300_Wins">Win % over your last <span style="color:' + R300_Selections.Win_Color.value + '">' + data.length + '</span> games: <span style="color:'+R300_Selections.Win_Color.value+'">' + ((total_win+total_ssa) / (total_win+total_ssa + total_loss+total_dc+total_tie) * 100).toFixed(2) + '%</span></div>');
    
    //Game Count...
    $('#R300_Messages').append('<div id="R300_Count">(<span style="color:'+R300_Selections.Win_Color.value+'" title="Includes Successful Save Attempts">' + (total_win+total_ssa) + ' Win'+((total_win+total_ssa)==1?'':'s')+'</span> | <span style="color:'+R300_Selections.Loss_Color.value+'" title="Does NOT include DC\'s">'+ (total_loss) + ' Loss'+(total_loss==1?'':'es')+'</span> | <span style="color:'+R300_Selections.Tie_Color.value+'" title="Included in Losses">'+ (total_tie) + ' Tie'+(total_tie==1?'':'s')+'</span> | <span style="color:'+R300_Selections.DC_Color.value+'" title="DC\'s are counted as a Loss">' + total_dc + ' DC'+(total_dc==1?'':'s')+'</span> | <span style="color:'+R300_Selections.SSA_Color.value+'" title="Included in Wins">' + total_ssa + ' Save'+(total_ssa==1?'':'s')+'</span> | <span style="color:'+R300_Selections.FSA_Color.value+'" title="Unsuccessful Save Attempts do NOT count as a Loss (or a Win)">' + total_fsa + ' USA'+(total_fsa==1?'':'s')+'</span>)</div>');

    //Oldest Game...
    var oldestGame = getUsefulText( (data[0].outcome.toString() + data[0].saved.toString()), 'outcome');
    $('#R300_Messages').append('<div id="R300_OldestGame" style="">Oldest game: ' + (oldestGame) + '</div>');

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
    var lastend = 0;
    var gamesPieData = [total_win, total_loss, total_tie, total_dc, total_fsa, total_ssa];
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
    $('#R300_Messages').append('<div id="R300_BestStreak" style="text-align:center">Best Streaks: <span style="color:' + R300_Selections.Win_Color.value + '">' + win_streak + ' Win' + (win_streak == 1 ? '' : 's') + '</span> | <span style="color:' + R300_Selections.Loss_Color.value + '">' + loss_streak + ' Loss' + (loss_streak == 1 ? '' : 'es') + '</span></div>');

    //Current Streak...
    if (data[data.length-1].outcome === 1) {
        $('#R300_Messages').append('<div id="R300_CurrentStreak" style="text-align:center">Current Streak: <span style="color:' + R300_Selections.Win_Color.value + '">' + last_win_streak + ' Win' + (last_win_streak == 1 ? '' : 's') + '</span></div>');
    } else if ((data[data.length-1].outcome === 2) || (data[data.length-1].outcome === 3)) {
        $('#R300_Messages').append('<div id="R300_CurrentStreak" style="text-align:center">Current Streak: <span style="color:' + R300_Selections.Loss_Color.value + '">' + last_loss_streak + ' Loss' + (last_loss_streak == 1 ? '' : 'es') + '</span></div>');
    }

    //Best Streak Messages...
    if ( (data[data.length-1].outcome === 1) && (last_win_streak >= win_streak) && (data.length > 5) ) {
        $('#R300_Messages').append('<div id="R300_BestStreakMessage" style="padding:3px 0; text-align:center; border-radius:5px; color:#fff; background-color:' + R300_Selections.Win_Color.value + '">You are currently on your best win streak!!!</div>');
    } else if ( (data[data.length-1].outcome === 1) && (last_win_streak == win_streak-1) && (data.length > 5) ) {
        $('#R300_Messages').append('<div id="R300_BestStreakMessage" style="padding:3px 0; text-align:center; border-radius:5px; color:#fff; background-color:' + R300_Selections.Win_Color.value + '">You are just <u>1 win away</u> from your best win streak!</div>');
    }

    //Worst Streak Messages...
    if ( ((data[data.length-1].outcome === 2) || (data[data.length-1].outcome === 3)) && (last_loss_streak >= loss_streak) && (data.length > 5) ) {
        $('#R300_Messages').append('<div id="R300_WorstStreakMessage" style="padding:3px 0; text-align:center; border-radius:5px; color:#fff; background-color:' + R300_Selections.Loss_Color.value + '">You are currently on your worst losing streak :(</div>');
    } else if ( ((data[data.length-1].outcome === 2) || (data[data.length-1].outcome === 3)) && (last_loss_streak == loss_streak-1) && (data.length > 5) ) {
        $('#R300_Messages').append('<div id="R300_WorstStreakMessage" style="padding:3px 0; text-align:center; border-radius:5px; color:#fff; background-color:' + R300_Selections.Loss_Color.value + '">You are only <u>1 loss away</u> from your worst losing streak...</div>');
    }

    var gamesperday_barwidth = Math.floor(300 / dayCounts.length);
    if (gamesperday_barwidth < 1) gamesperday_barwidth = 1;
    if (gamesperday_barwidth > 10) gamesperday_barwidth = 10;
    $('#R300_Messages').append('<div id="R300_GamesPerDayGraph" style="width:'+(dayCounts.length*(gamesperday_barwidth+1))+'px; margin:0 auto; border-bottom:1px solid #fff"></div>');
    $.each(dayCounts, function(key, value) {
        i = (value.win+value.loss+value.dc+value.ssa+value.fsa+value.tie);
        if (i > mostPlays) mostPlays = i;
    });
    if (mostPlays > 30) {
        mostPlays = Math.floor(mostPlays / 30);
    } else {
        mostPlays = 1;
    }
    $.each(dayCounts, function(key, value) {
        i = (value.win+value.loss+value.dc+value.ssa+value.fsa+value.tie);
        $('#R300_GamesPerDayGraph').append('<div class="gamesperday_bar" data-firstgame="'+(data.length-value.firstGameNumber)+'" data-gamecount="'+i+'" style="height:'+Math.floor(i/mostPlays)+'px; width:'+gamesperday_barwidth+'px" title="'+i+' Games on ' + dayCounts[key].day + "\n"+value.win+' Wins, '+ value.loss+' Losses, '+ value.tie +' Ties,'+ value.dc+' DCs, '+ value.ssa+' Saves, '+ value.fsa+' USAs"></div>');
    });
    GM_addStyle('.gamesperday_bar { display:inline-block; position:relative; vertical-align:baseline; margin:0 0 -3px 1px; background:#777 }');
    GM_addStyle('.gamesperday_bar:hover { background:#fff }');

    //# Games Per Day...
    $('#R300_Messages').append('<div id="R300_GamesPerDay">' + dayCounts.length + ' Days (' + (data.length/dayCounts.length).toFixed(2) + ' games/day)</div>');

    //Power Up Stats...
    $('#R300_MessagesPie').after('<div id="R300_PUPs" style="width:96%; margin:5px auto; padding:1px 0; display:flex; flex-wrap:wrap; justify-content:center; align-items:center; font-size:12px; border:1px solid #222; border-radius:3px; cursor:pointer"></div>');
    $.each(total_pups, function(key, value) {
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
    $('#R300_PUPs').append('<div style="margin:0 7px;" title="Caps/Grab"><u>C/G</u><br>'+(total_pups.captures / total_pups.grabs).toFixed(3)+'</div>');
    $('#R300_PUPs').append('<div style="margin:0 7px;" title="Tags/Pop"><u>T/P</u><br>'+(total_pups.tags / total_pups.pops).toFixed(3)+'</div>');

    $('#R300_GamesPerDayGraph .gamesperday_bar').on('click', function() {
        setTimelineCellHeights(Cell_Width);
        showTrimmedData($(this).data('firstgame'), $(this).data('gamecount'));
    });
    $('#R300_Intervals .R300_Interval').on('click', function() {
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

}

    
/************************************************************************************/
// Mini Timeline...
/************************************************************************************/
function showTrimmedData(start, count) {
    var data = allGames.slice(0);
    var WinPercentageText;
    var Timeline_MaxWidth = 390;
    var Cell_Width = 8; //This value will adjust (smaller) according to MaxGames & Timeline_MaxWidth. Default=8
    var ShowGapMarginLeft = 1;
    var title = '';
    var total_win = 0;
    var total_loss = 0;
    var total_dc = 0;
    var total_ssa = 0;
    var total_fsa = 0;
    var total_tie = 0;
    var total_pups = { tags:0, pops:0, grabs:0, drops:0, hold:0, captures:0, prevent:0, returns:0, support:0, powerups:0, timePlayed:0 };
    var win_streak = 0;
    var loss_streak = 0;
    var temp_win_streak = 0;
    var temp_loss_streak = 0;
    var last_win_streak = 0;
    var last_loss_streak = 0;
    var i;

    if (!start) start = 0;
    if (!count) count = data.length;

    $('#R300_Timeline').find('[data-gamenumber="' + start + '"]').css('height', '+=6');
    if (count > 1) $('#R300_Timeline').find('[data-gamenumber="' + (start-count+1) + '"]').css('height', '+=6');

    start = data.length-start;
    data = data.splice(start, count);
    if (count > 200) ShowGapMarginLeft = 0;
    WinPercentageText = 'Win % over these <span style="color:' + R300_Selections.Win_Color.value + '">' + data.length + '</span> games ' + (start>=0 ? '('+(allGames.length-start-count+1)+'-'+(allGames.length-start)+'): ' : '');

    New_Cell_Width = Math.floor((Timeline_MaxWidth - 34) / data.length);
    if (New_Cell_Width < Cell_Width) Cell_Width = New_Cell_Width - (R300_Selections.ShowR300ShowGap.value ? (count > 200 ? 0 : 1) : 0);
    if (Cell_Width <= 0) Cell_Width = 1;

    $('#R300T_Timeline').empty();
    $('#R300T_Messages').empty();
    $('#R300T_PUPs').remove();

    var totalPotentialPowerups = 0;
    $(data).each(function(key, value) {
        title = 'Game #' + (data.length-key) + ': ';
        totalPotentialPowerups += value.potentialPowerups;
        $.each(total_pups, function(key1, value1) {
            total_pups[key1] += value[key1];
        });
        switch (value.outcome) {
            case 1: //win
                title += ' Win ' + (value.saved === 2 ? '- Successful Save Attempt! ' : '') + '(' + getUsefulText(value.gameMode, 'gamemode') + ')';
                title += "\n" + new Date(parseInt(Date.parse(value.played))).toLocaleTimeString() + ' (' + new Date(parseInt(Date.parse(value.played))).toDateString() + ')';
                title += "\nYou played for " + secondsToHMS(value.timePlayed);
                title += "\n\nCaps: " + value.captures + " | Grabs: " + value.grabs + " | Drops: " + value.drops + " | Popped: " + value.pops + " | Tags: " + value.tags + " | Returns: " + value.returns +
                         "\nHold: " + secondsToHMS(value.hold) + " | Prevent: " + secondsToHMS(value.prevent) + " | Support: " + value.support + " | PUP%: " + (value.powerups / value.potentialPowerups * 100).toFixed(2) + 
                         "\nCaps/Grab: " + ((value.grabs?value.captures:0)/(value.grabs?value.grabs:1)).toFixed(3) + " | Tags/Pop: " + ((value.pops?value.tags:0)/(value.pops?value.pops:1)).toFixed(3);
                if (value.saved === 2) {
                    total_ssa++;
                    $('#R300T_Timeline').append('<div class="r300t_ssa" title="' + title + '"></div>');
                } else {
                    total_win++;
                    $('#R300T_Timeline').append('<div class="r300t_win" title="' + title + '"></div>');
                }
                

                //streak...
                i=key;
                while ( (i > 0) && ((data[i-1].outcome === 4)&&(data[i-1].saved === 1)) ) { //unsuccessful saves shouldn't break a streak!
                    i--;
                }
                if ( (temp_win_streak === 0) || ((i > 0) && (data[i-1].outcome === 1)) ) temp_win_streak++;
                if (temp_win_streak > win_streak) win_streak = temp_win_streak;
                temp_loss_streak = 0;
                if (temp_win_streak > 0) last_win_streak = temp_win_streak;
                
                break;

            case 2: //loss
                title += ' Loss (' + getUsefulText(value.gameMode, 'gamemode') + ')';
                title += "\n" + new Date(parseInt(Date.parse(value.played))).toLocaleTimeString() + ' (' + new Date(parseInt(Date.parse(value.played))).toDateString() + ')';
                title += "\nYou played for " + secondsToHMS(value.timePlayed);
                title += "\n\nCaps: " + value.captures + " | Grabs: " + value.grabs + " | Drops: " + value.drops + " | Popped: " + value.pops + " | Tags: " + value.tags + " | Returns: " + value.returns +
                         "\nHold: " + secondsToHMS(value.hold) + " | Prevent: " + secondsToHMS(value.prevent) + " | Support: " + value.support + " | PUP%: " + (value.powerups / value.potentialPowerups * 100).toFixed(2) + 
                         "\nCaps/Grab: " + ((value.grabs?value.captures:0)/(value.grabs?value.grabs:1)).toFixed(3) + " | Tags/Pop: " + ((value.pops?value.tags:0)/(value.pops?value.pops:1)).toFixed(3);
                $('#R300T_Timeline').append('<div class="r300t_loss" title="' + title + '"></div>');
                total_loss++;

                //streak...
                i=key;
                while ( (i > 0) && ((data[i-1].outcome === 4)&&(data[i-1].saved === 1)) ) { //unsuccessful saves shouldn't break a streak!
                    i--;
                }
                if ( (temp_loss_streak === 0) || ((i > 0) && ((data[i-1].outcome === 2) || (data[i-1].outcome === 3) || (data[i-1].outcome === 5)) ) ) temp_loss_streak++;
                if (temp_loss_streak > loss_streak) loss_streak = temp_loss_streak;
                temp_win_streak = 0;
                if (temp_loss_streak > 0) last_loss_streak = temp_loss_streak;
                
                break;

            case 3: //dc
                title += ' DC/Loss (' + getUsefulText(value.gameMode, 'gamemode') + ')';
                title += "\n" + new Date(parseInt(Date.parse(value.played))).toLocaleTimeString() + ' (' + new Date(parseInt(Date.parse(value.played))).toDateString() + ')';
                title += "\nYou played for " + secondsToHMS(value.timePlayed);
                title += "\n\nCaps: " + value.captures + " | Grabs: " + value.grabs + " | Drops: " + value.drops + " | Popped: " + value.pops + " | Tags: " + value.tags + " | Returns: " + value.returns +
                         "\nHold: " + secondsToHMS(value.hold) + " | Prevent: " + secondsToHMS(value.prevent) + " | Support: " + value.support + " | PUP%: " + (value.powerups / value.potentialPowerups * 100).toFixed(2) + 
                         "\nCaps/Grab: " + ((value.grabs?value.captures:0)/(value.grabs?value.grabs:1)).toFixed(3) + " | Tags/Pop: " + ((value.pops?value.tags:0)/(value.pops?value.pops:1)).toFixed(3);
                $('#R300T_Timeline').append('<div class="r300t_dc" title="' + title + '"></div>');
                total_dc++;

                //streak...
                i=key;
                while ( (i > 0) && ((data[i-1].outcome === 4)&&(data[i-1].saved === 1)) ) { //unsuccessful saves shouldn't break a streak!
                    i--;
                }
                if ( (temp_loss_streak === 0) || ((i > 0) && ((data[i-1].outcome === 2) || (data[i-1].outcome === 3) || (data[i-1].outcome === 5)) ) ) temp_loss_streak++;
                if (temp_loss_streak > loss_streak) loss_streak = temp_loss_streak;
                temp_win_streak = 0;
                if (temp_loss_streak > 0) last_loss_streak = temp_loss_streak;

                break;

            case 4: //save attempt
                if (value.saved === 1) { //failed save attempt...
                    title += ' Unsuccessful Save Attempt (' + getUsefulText(value.gameMode, 'gamemode') + ')';
                    total_fsa++;
                    title += "\n" + new Date(parseInt(Date.parse(value.played))).toLocaleTimeString() + ' (' + new Date(parseInt(Date.parse(value.played))).toDateString() + ')';
                    title += "\nYou played for " + secondsToHMS(value.timePlayed);
                    title += "\n\nCaps: " + value.captures + " | Grabs: " + value.grabs + " | Drops: " + value.drops + " | Popped: " + value.pops + " | Tags: " + value.tags + " | Returns: " + value.returns +
                             "\nHold: " + secondsToHMS(value.hold) + " | Prevent: " + secondsToHMS(value.prevent) + " | Support: " + value.support + " | PUP%: " + (value.powerups / value.potentialPowerups * 100).toFixed(2) + 
                             "\nCaps/Grab: " + ((value.grabs?value.captures:0)/(value.grabs?value.grabs:1)).toFixed(3) + " | Tags/Pop: " + ((value.pops?value.tags:0)/(value.pops?value.pops:1)).toFixed(3);
                    $('#R300T_Timeline').append('<div class="r300t_fsa" title="' + title + '"></div>');
                }

                break;

            case 5: //tie
                title += ' Tie/Loss (' + getUsefulText(value.gameMode, 'gamemode') + ')';
                title += "\n" + new Date(parseInt(Date.parse(value.played))).toLocaleTimeString() + ' (' + new Date(parseInt(Date.parse(value.played))).toDateString() + ')';
                title += "\nYou played for " + secondsToHMS(value.timePlayed);
                title += "\n\nCaps: " + value.captures + " | Grabs: " + value.grabs + " | Drops: " + value.drops + " | Popped: " + value.pops + " | Tags: " + value.tags + " | Returns: " + value.returns +
                         "\nHold: " + secondsToHMS(value.hold) + " | Prevent: " + secondsToHMS(value.prevent) + " | Support: " + value.support + " | PUP%: " + (value.powerups / value.potentialPowerups * 100).toFixed(2) + 
                         "\nCaps/Grab: " + ((value.grabs?value.captures:0)/(value.grabs?value.grabs:1)).toFixed(3) + " | Tags/Pop: " + ((value.pops?value.tags:0)/(value.pops?value.pops:1)).toFixed(3);
                $('#R300T_Timeline').append('<div class="r300t_tie" data-gamenumber="' + (data.length-key) + '" title="' + title + '"></div>');
                total_tie++;

                //streak...
                i=key;
                while ( (i > 0) && ((data[i-1].outcome === 4)&&(data[i-1].saved === 1)) ) { //unsuccessful saves shouldn't break a streak!
                    i--;
                }
                if ( (temp_loss_streak === 0) || ((i > 0) && ((data[i-1].outcome === 2) || (data[i-1].outcome === 3) || (data[i-1].outcome === 5)) ) ) temp_loss_streak++;
                if (temp_loss_streak > loss_streak) loss_streak = temp_loss_streak;
                temp_win_streak = 0;
                if (temp_loss_streak > 0) last_loss_streak = temp_loss_streak;
                
                break;

            default: //just in case!
                title += ' Unknown Result! (' + getUsefulText(value.gameMode, 'gamemode') + ')';
                title += "\n" + new Date(parseInt(Date.parse(value.played))).toLocaleTimeString() + ' (' + new Date(parseInt(Date.parse(value.played))).toDateString() + ')';
                title += "\nYou played for " + secondsToHMS(value.timePlayed);
                title += "\n\nCaps: " + value.captures + " | Grabs: " + value.grabs + " | Drops: " + value.drops + " | Popped: " + value.pops + " | Tags: " + value.tags + " | Returns: " + value.returns +
                         "\nHold: " + secondsToHMS(value.hold) + " | Prevent: " + secondsToHMS(value.prevent) + " | Support: " + value.support + " | PUP%: " + (value.powerups / value.potentialPowerups * 100).toFixed(2) + 
                         "\nCaps/Grab: " + ((value.grabs?value.captures:0)/(value.grabs?value.grabs:1)).toFixed(3) + " | Tags/Pop: " + ((value.pops?value.tags:0)/(value.pops?value.pops:1)).toFixed(3);
                $('#R300T_Timeline').append('<div class="r300t_unknown" data-gamenumber="' + (data.length-key) + '" title="' + title + '"></div>');

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
    $('#R300T_Messages').append('<div id="R300T_Wins">' + WinPercentageText + ' <span style="color:'+R300_Selections.Win_Color.value+'">' + ((total_win+total_ssa) / (total_win+total_ssa + total_loss+total_dc+total_tie) * 100).toFixed(2) + '%</span></div>');

    //Games Count...
      $('#R300T_Messages').append('<div id="R300T_Count">(<span style="color:'+R300_Selections.Win_Color.value+'" title="Includes Successful Save Attempts">' + (total_win+total_ssa) + ' Win'+((total_win+total_ssa)==1?'':'s')+'</span> | <span style="color:'+R300_Selections.Loss_Color.value+'" title="Does NOT include DC\'s">'+ (total_loss) + ' Loss'+(total_loss==1?'':'es')+'</span> | <span style="color:'+R300_Selections.Tie_Color.value+'" title="Included in Losses">'+ (total_tie) + ' Tie'+(total_tie==1?'':'s')+'</span> | <span style="color:'+R300_Selections.DC_Color.value+'" title="DC\'s are counted as a Loss">' + total_dc + ' DC'+(total_dc==1?'':'s')+'</span> | <span style="color:'+R300_Selections.SSA_Color.value+'" title="Included in Wins">' + total_ssa + ' Save'+(total_ssa==1?'':'s')+'</span> | <span style="color:'+R300_Selections.FSA_Color.value+'" title="Unsuccessful Save Attempts do NOT count as a Loss (or a Win)">' + total_fsa + ' USA'+(total_fsa==1?'':'s')+'</span>)</div>');

    //Best Streaks...
    $('#R300T_Messages').append('<div id="R300T_BestStreak" style="text-align:center">Best Streaks: <span style="color:' + R300_Selections.Win_Color.value + '">' + win_streak + ' Win' + (win_streak == 1 ? '' : 's') + '</span> | <span style="color:' + R300_Selections.Loss_Color.value + '">' + loss_streak + ' Loss' + (loss_streak == 1 ? '' : 'es') + '</span></div>');

    //Games Mini Pie Chart...
    if (R300_Selections.ShowR300TrimmedGamesPieChart.value) {
        $('#R300T_Messages').append('<div id="R300T_Pie"></div>');
        $('#R300T_Pie').append('<canvas id="gamesPieChartTrimmed" width="50" height="50" />');
        var canvas = document.getElementById("gamesPieChartTrimmed");
        var context = canvas.getContext("2d");
        var lastend = 0;
        var gamesPieData = [total_win, total_loss, total_tie, total_dc, total_fsa, total_ssa];
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
    $('#R300T_Messages').append('<div id="R300T_PUPs" style="max-width:300px; margin:5px auto; display:flex; flex-wrap:wrap; justify-content:center; align-items:center; border:1px solid #222; border-radius:3px; cursor:pointer"></div>');
    $.each(total_pups, function(key, value) {
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
    $('#R300T_PUPs').append('<div style="margin:0 7px;" title="Caps/Grab"><u>C/G</u><br>'+(total_pups.captures / total_pups.grabs).toFixed(3)+'</div>');
    $('#R300T_PUPs').append('<div style="margin:0 7px;" title="Tags/Pop"><u>T/P</u><br>'+(total_pups.tags / total_pups.pops).toFixed(3)+'</div>');

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


tagpro.ready(function() {
    if (PageLoc === 'ingame') { //in a game
        var serverRequests = GM_getValue('serverRequests', []);

        tagpro.socket.on('end', function(data) {
            if (!tagpro.spectator && GM_getValue('R300_Selections').R300SavedGames.display) { //.display holds our profile id
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