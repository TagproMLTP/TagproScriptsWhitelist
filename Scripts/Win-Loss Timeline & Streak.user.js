// ==UserScript==
// @name            Win/Loss Timeline & Streak
// @description     Shows a Win/Loss Timeline & Streak on the "server" and "joining" pages.
// @version         0.7.1
// @include         http://*.koalabeast.com*
// @include         http://*koalabeast.com/games/find*
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_deleteValue
// @license         GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author          nabby
// ==/UserScript==
 
 
var options = { //defaults
    //Best not to edit these ones...
    'MaxGames':                 { display:'# Games to Save: ',                             type:'range',         value:40,            title:'Use the cursor keys to fine tune.'},
    'ShowWinLossTimeline':      { display:'Show Timeline',                                 type:'checkbox',      value:true,          title:''},
    'ShowTimelineScrollBar':    { display:'Show a ScrollBar on Timeline',                  type:'checkbox',      value:false,         title:'If checked a scrollbar will show under the timeline. If not checked each game cell will shrink to fit the space.'},
    'ShowWinPercentage':        { display:'Show Win %',                                    type:'checkbox',      value:true,          title:''},
    'ShowWLTCount':             { display:'Show W/L/T Count',                              type:'checkbox',      value:true,          title:''},
    'ShowBestEverStreak':       { display:'Show Best Ever Streak',                         type:'checkbox',      value:true,          title:'This is saved even if the game is no longer on the timeline. It will only be deleted if you Clear/Reset the data'},
    'ShowCurrentStreak':        { display:'Show Current Streak',                           type:'checkbox',      value:true,          title:''},
    'TiesCountAsLosses':        { display:'Ties Count as Losses (page reload needed)',     type:'checkbox',      value:true,          title:'TagPro counts Ties as Losses'},
    'ShowWinStreakMessage':     { display:'Show "Best Streak" Messages',                   type:'checkbox',      value:true,          title:'Show messages like: &quot;You are currently on your best ever win streak!&quot;'},
    'ShowLossStreakMessage':    { display:'Show "Worst Streak" Messages',                  type:'checkbox',      value:true,          title:'Show messages like: &quot;You are currently on your worst ever losing streak&quot;'},
 
    //You can manually edit the "value" for these options if you want...
    'Win_Color':                { display:' Color for a "Win"',                            type:'manual',        value:'#22dd22',     title:''},
    'Loss_Color':               { display:' Color for a "Loss"',                           type:'manual',        value:'#ee2020',     title:''},
    'Tie_Color':                { display:' Color for a "Tie"',                            type:'manual',        value:'#e2e211',     title:''},
    'Other_Color':              { display:' Color for a "Win"',                            type:'manual',        value:'#aaaaaa',     title:''}, //not used?
}
   
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
 
function secondsToHMS(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s);
}
 
$.fn.addStyle = function(str, hoo, med){
    var el= document.createElement('style');
    el.type= "text/css";
    el.media= med || 'screen';
    if(hoo) el.title= hoo;
    if(el.styleSheet) el.styleSheet.cssText= str;//IE only
    else el.appendChild(document.createTextNode(str));
    return document.getElementsByTagName('head')[0].appendChild(el);
}
 
var WLT_Selections = options;
 
$(document).ready(function() {
    if (PageLoc == 'server') {                //"Play Now" server page
        $('#play').parent().next().after('<div id="WLT" style="margin: 0 auto; padding:15px 0 0; text-align:center; white-space:nowrap;"></div>');
    } else if (PageLoc == 'joining') {        //"Joining Game" page
        $('#message').after('<div id="WLT" style="margin: 0 auto; padding:15px 0 0; text-align:center; white-space:nowrap;"></div>');
    } else if (PageLoc == 'profile') {        //"Profile" page
        $('#showSettings').parent().prev().before('<div id="WLT" style="margin: 0 auto; padding:10px 0 30px; text-align:center; white-space:nowrap;"></div>');
    }
 
    //Load saved options...
    if (GM_getValue('WLT_Selections')) {
        $.each(GM_getValue('WLT_Selections'), function(key, value) {
            if (WLT_Selections[key].type != 'manual') WLT_Selections[key].value = value.value;
        });
    }
 
    load_WLT_Data();
    buildMenu();
    setSavedValues();
    bindEvents();
}); //document.ready
 
 
function buildMenu() {
    //Build the settings menu...
    $.each(WLT_Selections, function(key, value) {
        if (value.type === 'checkbox') {
            $('#WLT_Settings_Menu').append('<li style="list-style:none" title="' + value.title + '"><label><input type="' + value.type + '" id="' + key + '" class="'+ value.type + '" name="' + value.type + '" ' + (value.value == true ? 'checked' : '') + '>' + value.display + '</label></li>');
        } else if ((value.type === 'range') && (key == "MaxGames")) {
            $('#WLT_Settings_Menu').append('<li style="list-style:none; text-align:center" title="' + value.title + '"><input type="' + value.type + '" id="' + key + '" class="'+ value.type + '" name="' + value.type + '" min="10" max="310" value="' + value.value + '" style="width:300px"><div style="text-align:center">' + value.display + '<span id="maxgamesvalue">' + value.value + '</span></div></li>');
            $('#WLT_Settings_Menu').append('<li style="list-style:none" title="' + value.title + '"><div id="JimWeAreAboutToLoseGameData" style="display:none; text-align:center; color:#fff; background:#f00; white-space:normal"></div></li>');
        }
    });
}
 
function setSavedValues() {
    //update with the user saved values...
    $.each(WLT_Selections, function(key, value) {
        if (value.type === 'checkbox') {
            //Hide certain elements according to the saved values...
            if (value.value == false) {
                if (key == 'ShowWinLossTimeline') {
                    $('#WLT_Timeline').hide(0);
                } else if (key == 'ShowWinPercentage') {
                    $('#WLT_WinPercentage').hide(0);
                } else if (key == 'ShowWLTCount') {
                    $('#WLT_Count').hide(0);
                } else if (key == 'ShowBestEverStreak') {
                    $('#WLT_BestEverStreak').hide(0);
                } else if (key == 'ShowCurrentStreak') {
                    $('#WLT_CurrentStreak').hide(0);
                } else if (key == 'ShowWinStreakMessage') {
                    $('#WLT_BestStreakMessage').hide(0);
                } else if (key == 'ShowLossStreakMessage') {
                    $('#WLT_WorstStreakMessage').hide(0);
                } else if (key == 'ShowTimelineScrollBar') {
                    $('#WLT_Timeline').css('overflow-x', '');
                }
            }
        }
    });
}
 
function bindEvents() {
    $('#WLT_Settings_Button').on('click', function() {
        $('#WLT_Settings_Menu').slideToggle(400);
    });
    $("#WLT_Settings_Menu").mouseleave(function() {
        $('#WLT_Settings_Menu').fadeOut(100);
    });
    $('#WLT_Settings_Menu .checkbox').on('click', function() {
        WLT_Selections[$(this).attr('id')].value = $(this).is(':checked');
        GM_setValue('WLT_Selections', WLT_Selections);
        if ($(this).attr('id') == 'ShowWinLossTimeline') {
            $('#WLT_Timeline').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowWinPercentage') {
            $('#WLT_WinPercentage').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowWLTCount') {
            $('#WLT_Count').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowBestEverStreak') {
            $('#WLT_BestEverStreak').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowCurrentStreak') {
            $('#WLT_CurrentStreak').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowWinStreakMessage') {
            $('#WLT_BestStreakMessage').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowLossStreakMessage') {
            $('#WLT_WorstStreakMessage').fadeToggle(400);
        } else if ($(this).attr('id') == 'ShowTimelineScrollBar') {
            if ($(this).is(':checked')) {
                $('#WLT_Timeline').css('overflow-x', 'auto');
                $('#WLT').empty();
                load_WLT_Data();
                buildMenu();
                setSavedValues();
                bindEvents();
            } else {
                $('#WLT_Timeline').css('overflow-x', 'visible');
                $('#WLT').empty();
                load_WLT_Data();
                buildMenu();
                setSavedValues();
                bindEvents();
            }
        }
    });
    $('#WLT_Settings_Menu #MaxGames').on('input', function() {
        $('#maxgamesvalue').text(this.value);
    });
    $('#WLT_Settings_Menu #MaxGames').on('change', function() {
        WLT_Selections[$(this).attr('id')].value = this.value;
        GM_setValue('WLT_Selections', WLT_Selections);
        if (this.value < GM_getValue('WLT').length) {
            $('#JimWeAreAboutToLoseGameData').html('WARNING!<br>This value is LESS than you current number of saved games (' + GM_getValue('WLT').length + ').<br>If you continue, you will LOSE ' + (GM_getValue('WLT').length - this.value) + ' game' + ((GM_getValue('WLT').length - this.value) == 1 ? '' : 's') + '!<br>(when the page is reloaded)');
            $('#JimWeAreAboutToLoseGameData').fadeIn(400);
            $('#ShowTimelineScrollBar').parent().parent().hide(0); //this will update the timeline and delete data so we'll hide it to prevent accidental losss
        } else {
            $('#ShowTimelineScrollBar').parent().parent().show(0);
            $('#JimWeAreAboutToLoseGameData').fadeOut(400);
        }
    });
    $('#WLT_Reset').on('click', function() {
        var msgresult = confirm('Warning! This will clear the current Win/Loss Timeline.\n\nOK to Continue?');
        if (msgresult) {
            GM_setValue('WLT');
            GM_setValue('WLT_Pause');
            GM_setValue('WLT_BestWinStreak');
            GM_setValue('WLT_BestLossStreak');
            $('#WLT').empty();
            load_WLT_Data();
            $('#WLT_Reset').remove();
            $('#WLT_Pause').remove();
            buildMenu();
            setSavedValues();
            bindEvents();
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
                WLT_Data_New.push({ result:WLT_Data_Old[i], score:'', date:'', map:'', blueredplayercount:'', fullgamelength:'', playedgamelength:'', playedgametime:'' });
            }
            GM_setValue('WLT', WLT_Data_New);
        }
    }
}
 
function load_WLT_Data() {
    var Timeline_MaxWidth = 780; //default=780
    var Cell_Width = 18;         //This value will adjust (smaller) according to MaxGames & Timeline_MaxWidth. Default=18
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
 
    if ( (GM_getValue('WLT') === 'undefined') || (GM_getValue('WLT') == undefined) ) GM_setValue('WLT', '');
    WLT_Data = GM_getValue('WLT');
   
    if ((WLT_Data.length > WLT_Selections.MaxGames.value) && (WLT_Selections.MaxGames.value > 0)) {
        while (WLT_Data.length > WLT_Selections.MaxGames.value) {
            WLT_Data.shift();
        }
        GM_setValue('WLT', WLT_Data);
        WLT_Data = GM_getValue('WLT');
    }
   
    if (!WLT_Selections.ShowTimelineScrollBar.value) {
        var New_Cell_Width = Math.floor(Timeline_MaxWidth / WLT_Data.length);
        if (New_Cell_Width < Cell_Width) Cell_Width = New_Cell_Width - 1;
        if (Cell_Width <= 0) Cell_Width = 1;
    }
 
    $(document).addStyle('#WLT_Timeline::-webkit-scrollbar { height:5px }');
    $(document).addStyle('#WLT_Timeline::-webkit-scrollbar-thumb { background:#777 }');
    $(document).addStyle('#WLT_Timeline::-webkit-scrollbar-button { display:none }');
    $(document).addStyle('#WLT_Timeline::-webkit-scrollbar-track { background:#ddd }');
 
    $('#WLT').append('<div id="WLT_Timeline" style="margin:0 auto; width:'+Timeline_MaxWidth+'px; overflow-x:auto"></div>');
 
    for (i = 0; i < WLT_Data.length; i++) {
        switch (WLT_Data[i].result) {
            case 'W':
                //Build Game Block with Mouseover Title...
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
                WLT_Title += ((WLT_Data[i].caps+WLT_Data[i].returns+WLT_Data[i].hold) ? '\nCaps: ' + WLT_Data[i].caps + ' | Returns: ' + WLT_Data[i].returns + ' | Hold: ' + secondsToHMS(WLT_Data[i].hold) : '');
                $('#WLT_Timeline').append('<div class="wlt_win" title="' + WLT_Title + '"></div>');
               
                //Update Stats for Streak...
                total_wins++;
                if ( (temp_win_streak == 0) || ((i > 0) && (WLT_Data[i-1].result == 'W')) ) temp_win_streak++;
                if (temp_win_streak > win_streak) win_streak = temp_win_streak;
                temp_loss_streak = 0;
                if (temp_win_streak > 0) last_win_streak = temp_win_streak;
                break;
 
            case 'L':
                //Build Game Block with Mouseover Title...
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
                WLT_Title += ((WLT_Data[i].caps+WLT_Data[i].returns+WLT_Data[i].hold) ? '\nCaps: ' + WLT_Data[i].caps + ' | Returns: ' + WLT_Data[i].returns + ' | Hold: ' + secondsToHMS(WLT_Data[i].hold) : '');
                $('#WLT_Timeline').append('<div class="wlt_loss" title="' + WLT_Title + '"></div>');
 
                //Update Stats for Streak...
                total_losses++;
                if (WLT_Selections.TiesCountAsLosses.value) {
                    if ( (temp_loss_streak == 0) || ((i > 0) && ((WLT_Data[i-1].result == 'L') || (WLT_Data[i-1].result == 'T'))) ) temp_loss_streak++;
                } else {
                    if ( (temp_loss_streak == 0) || ((i > 0) && (WLT_Data[i-1].result == 'L')) ) temp_loss_streak++;
                }
                if (temp_loss_streak > loss_streak) loss_streak = temp_loss_streak;
                temp_win_streak = 0;
                if (temp_loss_streak > 0) last_loss_streak = temp_loss_streak;
                break;
 
            case 'T':
                //Build Game Block with Mouseover Title...
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
                WLT_Title += ((WLT_Data[i].caps+WLT_Data[i].returns+WLT_Data[i].hold) ? '\nCaps: ' + WLT_Data[i].caps + ' | Returns: ' + WLT_Data[i].returns + ' | Hold: ' + secondsToHMS(WLT_Data[i].hold) : '');
                $('#WLT_Timeline').append('<div class="wlt_tie" title="' + WLT_Title + '"></div>');
 
                //Update Stats for Streak...
                temp_win_streak = 0;
                if (WLT_Selections.TiesCountAsLosses.value) {
                    total_losses++;
                    if ( (temp_loss_streak == 0) || ((i > 0) && ((WLT_Data[i-1].result == 'L') || (WLT_Data[i-1].result == 'T'))) ) temp_loss_streak++;
                    if (temp_loss_streak > loss_streak) loss_streak = temp_loss_streak;
                    if (temp_loss_streak > 0) last_loss_streak = temp_loss_streak;
                } else {
                    temp_loss_streak = 0;
                }
                break;
               
            default:
                //if $('#WLT').append('<div class="wlt_other" title="Late Join/Refresh/Other?"></div>');
                temp_win_streak = 0;
                temp_loss_streak = 0;
                break;
        }
    }
 
    if ( (GM_getValue('WLT_BestWinStreak') == 'undefined') || (GM_getValue('WLT_BestWinStreak') == undefined) ) GM_setValue('WLT_BestWinStreak', win_streak);
    if ( (GM_getValue('WLT_BestLossStreak') == 'undefined') || (GM_getValue('WLT_BestLossStreak') == undefined) ) GM_setValue('WLT_BestLossStreak', loss_streak);
 
    $('.wlt_win').css({'display':'inline-block', 'margin-left':'1px', 'background-color':WLT_Selections.Win_Color.value, 'width':Cell_Width+'px', 'height':'10px'});
    $('.wlt_loss').css({'display':'inline-block', 'margin-left':'1px', 'background-color':WLT_Selections.Loss_Color.value, 'width':Cell_Width+'px', 'height':'10px'});
    $('.wlt_tie').css({'display':'inline-block', 'margin-left':'1px', 'background-color':WLT_Selections.Tie_Color.value, 'width':Cell_Width+'px', 'height':'10px'});
    $('.wlt_other').css({'display':'inline-block', 'margin-left':'1px', 'background-color':WLT_Selections.Other_Color.value, 'width':Cell_Width+'px', 'height':'10px'});
 
    //Buttons...
    $('#WLT').append('<div id="WLT_Settings_Button" style="display:inline-block; font-size:11px; text-align:center; margin-left:10px; height:13px; width:14px; border:2px solid #3A8CBB; border-radius:8px; cursor:pointer" title="Options">&#8286;</div>');
    $('#WLT').prepend('<div id="WLT_Settings_Menu" style="display:none; position:absolute; width:320px; left:0; right:0; margin:-265px auto; padding:10px 10px 15px; text-align:left; text-shadow:2px 1px 2px #000; background:#3A8CBB; border-radius:8px; box-shadow:0px 0px 8px #fff; z-index:6000"></div>');
    $('#WLT_Settings_Menu').append('<div style="margin:0 auto; padding-bottom:5px; font-size:16px; color:#000; text-align:center; text-shadow:2px 1px 2px #aaa;">Win/Loss Timeline Options</div>')
 
    if ( $.type(WLT_Data[0]) !== 'undefined' ) {
        $('#WLT').append('<div id="WLT_Reset" style="display:inline-block; font-size:11px; text-align:center; margin-left:6px; height:13px; width:14px; border:2px solid #ff0000; border-radius:8px; cursor:pointer" title="Clear/Reset">X</div>');
        $('#WLT').append('<div id="WLT_Pause" style="display:inline-block; font-size:11px; text-align:center; margin-left:6px; height:13px; min-width:14px; border:2px solid #ed590c; border-radius:8px; cursor:pointer" title=""></div>');
    }
    if (GM_getValue('WLT_Pause') == 'paused') {
        $('#WLT_Pause').html('&nbsp;PAUSED&nbsp;');
        $('#WLT_Pause').attr('title', 'Currently Paused - Press to Resume...');
    } else {
        $('#WLT_Pause').html('ll');
        $('#WLT_Pause').attr('title', 'Currently Saving - Press to Pause...');
    }
 
    //Streak Stats...
    if ( jQuery.type(WLT_Data[0]) !== 'undefined' ) {
        if ( (GM_getValue('WLT_BestWinStreak') !== 'undefined') && (GM_getValue('WLT_BestWinStreak') != undefined) && (win_streak > GM_getValue('WLT_BestWinStreak')) ) GM_setValue('WLT_BestWinStreak', win_streak);
        if ( (GM_getValue('WLT_BestLossStreak') !== 'undefined') && (GM_getValue('WLT_BestLossStreak') != undefined) && (loss_streak > GM_getValue('WLT_BestLossStreak')) ) GM_setValue('WLT_BestLossStreak', loss_streak);
        var total_ties = (WLT_Data.length - total_wins - total_losses);
 
        $('#WLT').append('<div id="WLT_WinPercentage" style="text-align:center; text-shadow:2px 1px 2px #000000">Win % over last ' + WLT_Data.length + ' game' + (WLT_Data.length == 1 ? '' : 's') + ': ' + ((WLT_Data.length > 0) ? total_wins / WLT_Data.length * 100 : 0).toFixed(2) + '%</div>');
        $('#WLT').append('<div id="WLT_Count">[' + total_wins + ' Win' + (total_wins == 1 ? '' : 's') + ' / ' + total_losses + ' Loss' + (total_losses == 1 ? '' : 'es') + (!WLT_Selections.TiesCountAsLosses.value ? ' / ' + total_ties + ' Tie' + (total_ties == 1 ? '' : 's') : '') + ']</div>');
        $('#WLT').append('<div id="WLT_BestEverStreak" style="text-align:center; text-shadow:2px 1px 2px #000000">Best Ever Streaks: ' + GM_getValue('WLT_BestWinStreak') + ' Win' + (GM_getValue('WLT_BestWinStreak') == 1 ? '' : 's') + ' / ' + GM_getValue('WLT_BestLossStreak') + ' Loss' + (GM_getValue('WLT_BestLossStreak') == 1 ? '' : 'es') + (WLT_Selections.TiesCountAsLosses.value ? '' : '<span title="Ties are NOT being counted as losses here">*</span>') + '</div>');
        if (WLT_Data[WLT_Data.length-1].result == 'W') {
            $('#WLT').append('<div id="WLT_CurrentStreak" style="text-align:center; text-shadow:2px 1px 2px #000000">Current Streak: ' + last_win_streak + ' Win' + (last_win_streak == 1 ? '' : 's') + '</div>');
        } else if ( (!WLT_Selections.TiesCountAsLosses.value && WLT_Data[WLT_Data.length-1].result == 'L') || (WLT_Selections.TiesCountAsLosses.value && ((WLT_Data[WLT_Data.length-1].result == 'L') || (WLT_Data[WLT_Data.length-1].result == 'T'))) ) {
            $('#WLT').append('<div id="WLT_CurrentStreak" style="text-align:center; text-shadow:2px 1px 2px #000000">Current Streak: ' + last_loss_streak + ' Loss' + (last_loss_streak == 1 ? '' : 'es') + '</div>');
        } else if (!WLT_Selections.TiesCountAsLosses.value && WLT_Data[WLT_Data.length-1].result == 'T') {
            $('#WLT').append('<div id="WLT_CurrentStreak" style="text-align:center; text-shadow:2px 1px 2px #000000">Current Streak: N/A (Tie)</div>');
        }
 
        //Best Streak Messages...
        if ( (WLT_Data[WLT_Data.length-1].result == 'W') && (last_win_streak >= GM_getValue('WLT_BestWinStreak')) && (WLT_Data.length > 5) ) {
            $('#WLT').append('<div id="WLT_BestStreakMessage" style="text-align:center; color:' + WLT_Selections.Win_Color.value + '; padding:5px 0 0; text-shadow:2px 1px 2px #000000">You are currently on your best ever win streak!!!</div>');
        } else if ( (WLT_Data[WLT_Data.length-1].result == 'W') && (last_win_streak == GM_getValue('WLT_BestWinStreak') - 1) && (WLT_Data.length > 5) ) {
            $('#WLT').append('<div id="WLT_BestStreakMessage" style="text-align:center; color:' + WLT_Selections.Win_Color.value + '; padding:5px 0 0; text-shadow:2px 1px 2px #000000">You are just <u>1 win away</u> from your <u>best ever</u> win streak!</div>');
        }
       
        //Worst Streak Messages...
        if ( (WLT_Data[WLT_Data.length-1].result == 'L') && (last_loss_streak >= GM_getValue('WLT_BestLossStreak'))  && (WLT_Data.length > 5) ) {
            $('#WLT').append('<div id="WLT_WorstStreakMessage" style="text-align:center; color:' + WLT_Selections.Loss_Color.value + '; padding:5px 0 0; text-shadow:2px 1px 2px #000000">You are currently on your worst ever losing streak :(</div>');
        } else if ( (WLT_Data[WLT_Data.length-1].result == 'L') && (last_loss_streak == GM_getValue('WLT_BestLossStreak') - 1)  && (WLT_Data.length > 5) ) {
            $('#WLT').append('<div id="WLT_WorstStreakMessage" style="text-align:center; color:' + WLT_Selections.Loss_Color.value + '; padding:5px 0 0; text-shadow:2px 1px 2px #000000">You are only <u>1 loss away</u> from your <u>worst ever</u> losing streak!</div>');
        }
 
    } else {
        $('#WLT').append('<div style="text-align:center; font-style:italic; color:' + WLT_Selections.Tie_Color.value + '; padding:5px 0 0; text-shadow:2px 1px 2px #000000">No data for Win/Loss Timeline (go play some games!)</div>');
    }
} //load_WLT_Data()
 
 
var redPlayers = 0;
var bluePlayers = 0;
 
tagpro.ready(function() {
    if ((GM_getValue('WLT_Pause') != 'paused') && (PageLoc === 'ingame')) {
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
                        WLT_Data.push({result:'T',
                                       score:bluescore+''+redscore,
                                       date:endTime,
                                       map:mapname,
                                       blueredplayercount:bluePlayers+''+redPlayers,
                                       fullgamelength:(endTime-startTime)/1000,
                                       playedgamelength:(endTime-joinTime)/1000,
                                       playedgametime:inGameTime,
                                       caps:tagpro.players[tagpro.playerId]["s-captures"],
                                       hold:tagpro.players[tagpro.playerId]["s-hold"],
                                       returns:tagpro.players[tagpro.playerId]["s-returns"],
                                       sscore:tagpro.players[tagpro.playerId]["score"] });
                    } else if ( ((data.winner == 'red') && (tagpro.players[tagpro.playerId].team == 1)) || ((data.winner == 'blue') && (tagpro.players[tagpro.playerId].team == 2)) ) {
                        WLT_Data.push({result:'W',
                                       score:(bluescore > redscore ? bluescore+''+redscore : redscore+''+bluescore),
                                       date:endTime,
                                       map:mapname,
                                       blueredplayercount:(bluescore > redscore ? bluePlayers+''+redPlayers : redPlayers+''+bluePlayers),
                                       fullgamelength:(endTime-startTime)/1000,
                                       playedgamelength:(endTime-joinTime)/1000,
                                       playedgametime:inGameTime,
                                       caps:tagpro.players[tagpro.playerId]["s-captures"],
                                       hold:tagpro.players[tagpro.playerId]["s-hold"],
                                       returns:tagpro.players[tagpro.playerId]["s-returns"],
                                       sscore:tagpro.players[tagpro.playerId]["score"] });
                    } else if ( ((data.winner == 'red') && (tagpro.players[tagpro.playerId].team == 2)) || ((data.winner == 'blue') && (tagpro.players[tagpro.playerId].team == 1)) ) {
                        WLT_Data.push({result:'L',
                                       score:(bluescore < redscore ? bluescore+''+redscore : redscore+''+bluescore),
                                       date:endTime,
                                       map:mapname,
                                       blueredplayercount:(bluescore < redscore ? bluePlayers+''+redPlayers : redPlayers+''+bluePlayers),
                                       fullgamelength:(endTime-startTime)/1000,
                                       playedgamelength:(endTime-joinTime)/1000,
                                       playedgametime:inGameTime,
                                       caps:tagpro.players[tagpro.playerId]["s-captures"],
                                       hold:tagpro.players[tagpro.playerId]["s-hold"],
                                       returns:tagpro.players[tagpro.playerId]["s-returns"],
                                       sscore:tagpro.players[tagpro.playerId]["score"] });
                    } else {
                        //probably a holiday event - usually returns the name of the 'winner'
                    }
                } else {
                    //WLT_Data.push('X');
                }
 
                GM_setValue('WLT', WLT_Data);
            }
        });
    }
}); //tagpro.ready