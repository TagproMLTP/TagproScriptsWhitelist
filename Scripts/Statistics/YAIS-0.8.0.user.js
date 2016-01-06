// ==UserScript==
// @name            YAIS
// @description     Makes improvements to your TagPro server page...
//                    • Quick "Settings" popup menu
//                    • Quick "Flair Changer" popup menu
//                    • Quick "Leaderboard" popup
//                    • Wins Until Next Degree
//                    • Updating Server Stats
//                    • Your Game / PUP Stats
// @version    	    0.8.0
//                   • Fixed a bug which caused high CPU usage
//                   • Added some other "updating server stats" options
// @include         http://tagpro-*.koalabeast.com*
// @include         http://tangent.jukejuice.com*
// @include         http://*.newcompte.fr*
// @exclude         http://*/groups/*
// @updateURL       https://github.com/TagproMLTP/TagproScriptsWhitelist/raw/1b5eb646d4a18d65734162e6e9bf4edb060be8e4/Scripts/Statistics/YAIS-0.8.0.user.js
// @downloadURL     https://gist.github.com/nabbynz/94926885ea020a832290/raw/TagPro_YAIS.user.js
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_deleteValue
// @grant           GM_addStyle
// @run-at          document-end
// @license         GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author          nabby
//                   (includes code written by ballparts, Ben, despair & probably some others)
// ==/UserScript==

console.log('START: ' + GM_info.script.name + ' (v' + GM_info.script.version + ' by ' + GM_info.script.author + ')');

var options = {
    //Best not to edit these ones (you can select them through the on-page menu)...
    'ShowSettingsMenu':          { display:'Show "Settings" popup menu',                           type:'checkbox',      value:true,                                 title:''},
    'ShowWinsUntilNextDegree':   { display:'Show "Wins Until Next Degree"',                        type:'checkbox',      value:true,                                 title:'Show "Wins until next degree" on the server & loading pages'},
    'ShowFlair':                 { display:'Show Flair &amp; "Change Flair" popup menu',           type:'checkbox',      value:true,                                 title:'Shows your selected flair and a quick "change flair" menu.'},
    'ShowDisplayedName':         { display:'Use "Display Name" (off = Reserved Name)',             type:'checkbox',      value:true,                                 title:''},
    'ShowDWMStatsTable':         { display:'Show Table: D/W/M Stats',                              type:'checkbox',      value:true,                                 title:''},
    'ShowDWMPUPTable':           { display:'Show Table: D/W/M PUP\'s',                             type:'checkbox',      value:true,                                 title:''},
    'Show300StatsTable':         { display:'Show Table: Rolling 300 Stats',                        type:'checkbox',      value:true,                                 title:''},
    'Show300PUPTable':           { display:'Show Table: Rolling 300 PUP\'s',                       type:'checkbox',      value:true,                                 title:''},
    'ShowPUPsPerGame':           { display:'Display "Per Game" Stats',                             type:'checkbox',      value:false,                                title:''},
    'AddCurrentServerButton':    { display:'Show "Updating Stats" server button',                  type:'checkbox',      value:true,                                 title:''},
    'ServerStatsOnPlayButton':   { display:'- Also show on "Play Now" button',                     type:'checkbox',      value:false,                                title:''},
    'ServerStatsOnJoiner':       { display:'- Also show on "Joining" page',                        type:'checkbox',      value:false,                                title:''},
    'ServerStatsInGame':         { display:'- Also show "In Game"',                                type:'checkbox',      value:false,                                title:''},
    'ShowLeaderboardPage':       { display:'"Leaderboard" as popup',                               type:'checkbox',      value:true,                                 title:''},
    'ShowLogout':                { display:'Show "Logout" link',                                   type:'checkbox',      value:true,                                 title:''},
    'ShowTagProVersion':         { display:'Show TagPro version number',                           type:'checkbox',      value:true,                                 title:''},
    'PriddyButtons':             { display:'Priddy buttons (needs page reload)',                   type:'checkbox',      value:true,                                 title:'Makes the buttons & links look a bit nicer :)'},
    'ShowRedditLink':            { display:'Show the Reddit Link?',                                type:'checkbox',      value:true,                                 title:''},
    'showSaveAttemptMessages':   { display:'Show "this is a save attempt" message in game?',       type:'checkbox',      value:true,                                 title:''},
    'HideMenuButton':            { display:'Make the "YAIS" Menu Button Invisible?',               type:'checkbox',      value:false,                                title:'Makes the "YAIS" Menu Button invisible until hovered over'},
    'ShowBoxShadowBorder':       { display:'Show Shadow around Border?',                           type:'checkbox',      value:false,                                title:''},

    //You can manually edit the "value" for these options...
    'SettingsMenuColor':         { display:'Background color for the settings menu',               type:'manual',        value:'#180452',     title:''}, //default: #180452
    'BigButtonColorText':        { display:'Font Color for the Big Buttons',                       type:'manual',        value:'#000000',     title:''}, //default: #000000
    'BigButtonColor':            { display:'Background Color for the Big Buttons',                 type:'manual',        value:'#ACE600',     title:''}, //default: #ACE600
    'BigButtonColorHover':       { display:'Hover Background Color for the Big Buttons',           type:'manual',        value:'#C1FF03',     title:''}  //default: #C1FF03
};
var YAIS_Selections;

function setProfilePage(){
    var url = $('a[href^="/profile"][class="button"]').attr('href');
    if (url !== undefined) { //we're on the chosen server page AND logged in
        var n = url.lastIndexOf('/');
        var profileNum = url.substring(n + 1);
        var profilePage = String('/profile/'+profileNum);
        GM_setValue('profilePage', profilePage);
        return true;
    } else {
        if ($('#play').length) { //we're on the chosen server page but NOT logged in
            return false;
        } else {
            if (GM_getValue('profilePage')) { //we're probably logged in (!)
                return true;
            } else {
                return false;
            }
        }
    }
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

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function comparer(index) {
    return function(a, b) {
        var valA = getCellValue(a, index), valB = getCellValue(b, index);
        return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB);
    };
}
function getCellValue(row, index){ return $(row).children('td').eq(index).text(); }

function capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


YAIS_Selections = $.extend(true, {}, options, GM_getValue('YAIS_Selections', options));
$.each(YAIS_Selections, function(key, value) {
    YAIS_Selections[key].display = options[key].display;
});
if (GM_getValue('YAIS_Selections') === undefined) { //first time
    GM_setValue('YAIS_Selections', YAIS_Selections);
}


if (PageLoc === 'joining') {
    if (YAIS_Selections.ServerStatsOnJoiner.value) {
        var onServerDiv = $('div.section.smaller:contains("Or Switch Server:")').prev('div').text().replace('On Server:', '').replace('(', '<br>').replace(')', '');
        var serverURL = tagpro.serverHost + "/";
        var serverStatsURL = 'http://' + tagpro.serverHost + '/stats?callback=?';
        var intervalHandle;
        $('.buttons').prepend('<a id="YAIS_CurrentServerButton" href="http://'+serverURL+'" class="button">'+onServerDiv+'<br></span><span id="YAIS_CurrentServerButtonStats" class="stats"></div>');
        function refreshJoiningStats() {
            clearInterval(intervalHandle);
            var n = (new Date).getTime();
            $.ajax({timeout:1e4, dataType:"json", url:serverStatsURL, success:function(i) {
                i.ping = (new Date).getTime() - n;
                $('#YAIS_CurrentServerButtonStats').text("Ping:"+i.ping + ", Players:"+i.players + (i.playerCapacity?"/"+i.playerCapacity:"") + (i.games?", Games:"+i.games:""));
            }, error:function(i){
                $('#YAIS_CurrentServerButtonStats').text("Error getting server stats");
            }});
            $('#YAIS_CurrentServerButtonStats').fadeOut(100).fadeIn(100);
            intervalHandle = setInterval(refreshJoiningStats, 2000);
        }
        refreshJoiningStats();
    }
}

if (PageLoc === 'server') {
    var LoggedIn = setProfilePage();

    $('body').append('<div id="YAIS_Menu_Button" style="position:fixed; bottom:120px; right:10px; background:#fff; color:#0b0; opacity:'+(YAIS_Selections.HideMenuButton.value ? '0' : '0.1')+'; padding:0px 10px; font-size:25px; text-align:center; border-radius:25px; cursor:pointer" title="YAIS">&#9636;</div>');
    $('#YAIS_Menu_Button').after('<div id="YAIS_Menu" style="position:fixed; bottom:0px; right:0px; background:linear-gradient(#222, #225); color:#0b0; width:300px; padding:5px 5px 20px 5px; font-size:12px; border-radius:6px; overflow:hidden; display:none; z-index:100;"><div style="font-size:18px; text-align:center; text-shadow:1px 2px 1px #777; text-decoration:underline;">YAIS Options</div></div>');
    if ($('#WLT').length) {
        $('#WLT').after('<div id="YAIS" style="text-align:center; margin:20px auto 0 auto; padding:10px; width:-webkit-fit-content; border-radius:8px; ' + (YAIS_Selections.ShowBoxShadowBorder.value ? 'box-shadow:#fff 0px 0px 10px; ' : '') + 'background:rgba(0,0,0,0.1); white-space:nowrap;"></div>');
    } else {
        $('a[href^="/maps"]').parent('div').after('<div id="YAIS" style="text-align:center; margin:20px auto 0 auto; padding:10px; width:-webkit-fit-content; border-radius:8px; ' + (YAIS_Selections.ShowBoxShadowBorder.value ? 'box-shadow:#fff 0px 0px 10px; ' : '') + 'background:rgba(0,0,0,0.1); white-space:nowrap;"></div>');
    }


    //=================================================================
    //Adds a new button for the server you're on with updating stats...
    if (YAIS_Selections.AddCurrentServerButton.value) {
        var RefreshInterval = 10;
        var count = RefreshInterval - 1;
        var RefreshCount = 0;

        var countdown = setInterval(function(){
            if (count > 0) $('#refreshstats').html(count < 10 ? '0'+count : count);
            count--;
        }, 1000);

        function getStats(e) {
            var n = (new Date).getTime();
            $.ajax({timeout:1e3, dataType:"json", url:e.attr("href")+"stats?callback=?", success:function(i) {
                i.ping = (new Date).getTime() - n;
                e.attr("data-ping",i.ping).find(".stats").text("Ping:"+i.ping + ", Players:"+i.players + (i.playerCapacity?"/"+i.playerCapacity:"") + (i.games?", Games:"+i.games:""));
                if (PageLoc != 'joining') e.find('.stats').append(' (<span id="refreshstats">' + (RefreshInterval) + '</span>)');
                $('#YAIS_currentServerStats').fadeOut(100).fadeIn(100);
                if (YAIS_Selections.ServerStatsOnPlayButton.value) {
                    $('#play').children('span').text("Ping:"+i.ping + ", Players:"+i.players + (i.playerCapacity?"/"+i.playerCapacity:"") + (i.games?", Games:"+i.games:""));
                } else {
                    $('#play').children('span').text("no ceremony, jump in");
                }
            }, error:function(){
                $("#YAIS_currentServerStats").text("error getting stats.");
                $('#YAIS_currentServerStats').fadeOut(100).fadeIn(100);
            }});
        }

        $('#YAIS').append('<div id="e_AddCurrentServerButton" style="margin:auto; text-align:center; padding:10px 0 10px "></div>');

        function createButton() {
            var serverURL = tagpro.serverHost + "/";
            var serverName = serverURL.replace('.koalabeast.com','').replace('tagpro-','').replace('/','');
            var serverLocation = $('div.smaller.section').children('strong').html();
            if (typeof serverLocation !== "undefined") {
                serverLocation = serverLocation.slice(serverLocation.indexOf('(')+1, serverLocation.lastIndexOf(')'));
            } else {
                serverLocation = '&nbsp;';
            }
            $('#e_AddCurrentServerButton').append('<a id="currentServer" href="http://'+serverURL+'" class="button" title="Click to reload this page...">'+capitaliseFirstLetter(serverName)+'<span class="strong">'+serverLocation+'<br></span><span id="YAIS_currentServerStats" class="stats"></div>');
            return($('#currentServer'));
        }

        var button=createButton();
        getStats(button);

        (function refreshStats() {
            getStats( $('#currentServer') );
            RefreshCount++;
            count = RefreshInterval - 1;
            //$('.stats, #refreshstats').stop().fadeTo(RefreshInterval * 1000, 0.25, "linear").fadeTo(0, 1);
            timerID = setTimeout(refreshStats, RefreshInterval * 1000);
            //Gradually increase the time between updates...
            if (RefreshCount > 160) {        //60*60secs = after another ~60 mins interval is every 120 seconds
                RefreshInterval = 120;
            } else if (RefreshCount > 100) { //70*20secs = after another ~23 mins interval is every 60 seconds
                RefreshInterval = 60;
            } else if (RefreshCount > 30) {  //30*10secs = after ~5 mins interval is every 20 seconds
                RefreshInterval = 20;
            }
        })();
    }


    if (LoggedIn) {
        $('#YAIS').append('<div id="flairwins_container" style="display:flex; justify-content:center; align-items:center; flex-wrap:wrap;"></div>');
        $('#flairwins_container').append('<div id="e_ShowFlair" class="flair" style="width:16px; margin-right:4px; background-image:url(/images/flair.png); cursor:pointer"></div>');
        $('#flairwins_container').append('<div id="e_ShowWinsUntilNextDegree"></div>');

        $('#YAIS').append('<div id="e_ShowDWMStatsTable" style="margin:auto; text-align:center; padding:10px 0"><table id="StatsDWM" class="board" style="font-size:12px; border-spacing:1px; text-shadow:2px 1px 2px #000000"><tr></tr></table></div>');
        $('#YAIS').append('<div id="e_ShowDWMPUPTable" style="margin:auto; text-align:center; padding:10px 0"><table id="PUPDWM" class="board" style="font-size:12px; border-spacing:1px; text-shadow:2px 1px 2px #000000"><tr></tr></table></div>');
        $('#YAIS').append('<div id="e_Show300StatsTable" style="margin:auto; text-align:center; padding:10px 0"><table id="Stats300" class="board" style="font-size:12px; border-spacing:1px; text-shadow:2px 1px 2px #000000"><tr></tr></table></div>');
        $('#YAIS').append('<div id="e_Show300PUPTable" style="margin:auto; text-align:center; padding:10px 0"><table id="PUP300" class="board" style="font-size:12px; border-spacing:1px; text-shadow:2px 1px 2px #000000"><tr></tr></table></div>');

        $('#play').parent().next('div').append('<a id="e_ShowSettingsMenu" href="javascript:void(0);" style="margin-right:10px; margin-left:10px">Settings</a>');
        $('#play').parent().next('div').append('<a id="e_ShowLogout" href="/logout" style="margin-right:10px; margin-left:10px">Log Out</a>');

        var getProfilePage = $.get(GM_getValue('profilePage'));

        getProfilePage.done(function(data) {
            //=================================================================
            //Add "Wins until next degree" & Flair...
            var winsneeded = $(data).find('h3').text();
            var name = winsneeded.replace($(data).find('h3 div').text(), '');
            var nextdegreein = winsneeded.replace(name, '');
            var degree = nextdegreein.replace(nextdegreein.substr(nextdegreein.indexOf('°')+1), '');
            var selectedFlair;
            nextdegreein = nextdegreein.replace(degree, '').replace('.', '').toLowerCase();
            if (name) $('#e_ShowWinsUntilNextDegree').html('<span style="font-size:18px; text-shadow:2px 1px 2px #000000; font-weight:bold"><span id="rName" style="' + (YAIS_Selections.ShowDisplayedName.value ? 'display:none' : '') + '">' + $(data).find('#reservedName').val() + '</span><span id="dName" style="' + (YAIS_Selections.ShowDisplayedName.value ? '' : 'display:none') + '">' + $(data).find('#displayedName').val() + '</span><span id="degree">: ' + degree  + '</span></span>' + ' <span id="nextdegreein" style="font-size:12px; font-style:italic; text-shadow:2px 1px 2px #000000">(' + nextdegreein  + ')</span>');

            var updateurl = 'http://' + tagpro.serverHost + '/profile/selectedFlair';
            var availableFlairsTable = $(data).find('input[name=selectedFlair]').closest('tr');

            if (GM_getValue('randomFlair')) {
                $(availableFlairsTable).find('input[name=selectedFlair]:checked').prop('checked', false);
                var ra = rand(0, availableFlairsTable.length-1);
                selectedFlair = $(availableFlairsTable[ra]).find('input[name=selectedFlair]');
                $.ajax({method:'post', data:"flair="+selectedFlair.val(), dataType:'text', url:updateurl});
            } else {
                selectedFlair = $(data).find('input[name=selectedFlair]:checked');
            }

            if ((selectedFlair.val() !== undefined) && (selectedFlair.val() != 'undefined')) {
                $('#e_ShowFlair').css('background-position', $(selectedFlair).parent().prev().prev().prev().children().css('background-position'));
                var title = $(selectedFlair).parent().prev().prev().text() + ($(selectedFlair).parent().prev().text() ? '[' + $(selectedFlair).parent().prev().text() + ']' : '');
                $('#e_ShowFlair').attr('title',  title);
                $('#e_ShowFlair').delay(800).fadeIn(2000);
            }
            $('#e_ShowFlair').after('<div id="flairmenu" style="position:absolute; margin:25px auto; padding:5px; width:400px; background:#1C5F86; border-radius:8px; box-shadow:0px 0px 14px #aaa; z-index:6000; display:none"><table id="flairtable" class="board" style="font-size:13px"><tr><th style="width:10px">Flair</th><th style="">Description</th><th style="width:10px">Count</th><th style="width:10px"><div id="closeflairtable" title="Close" style="display:block; padding:2px; width:13px; height:13px; color:#fff; background:#000; cursor:pointer">X</div></th></tr></table></div>');
            $('#flairtable').append(availableFlairsTable);
            $('#flairtable').append('<tr><td></td><td>Random</td><td>' + availableFlairsTable.length + '</td><td><input type="radio" id="randomflair" ' + (GM_getValue('randomFlair') ? 'checked' : '') + '></td></tr>');
            $('#flairtable').append('<tr><td></td><td>Cycle Flairs (in game)</td><td></td><td><input type="checkbox" id="cycleflair" ' + (GM_getValue('cycleFlair') ? 'checked' : '') + '></td></tr>');
            GM_addStyle('#flairtable tr { color:#ffffff; background:#13415B; cursor:pointer }');
            GM_addStyle('#flairtable th { color:#13415B; background:#ffffff; cursor:default }');
            GM_addStyle('#flairtable tr:hover { background:#1C5F86 }');
            GM_addStyle('#flairtable td { padding:1px 5px }');

            $('#e_ShowFlair').on('click', function() {
                $('#YAIS_Menu_Mask').css({ 'background':'#000' });
                $('#YAIS_Menu_Mask').css({ 'height':$(document).height() });
                $('#YAIS_Menu_Mask').fadeIn(300);
                $('#flairmenu').fadeIn(300);
            });

            $('#closeflairtable').click(function() {
                $('#YAIS_Menu_Mask').click();
            });

            $('#flairtable tr').on('click', function(event) {
                if (event.target.id !== 'closeflairtable') {
                    selectedFlair = $(this).find('input');
                    if (selectedFlair) {
                        if ($(selectedFlair).attr('id') === 'randomflair') {
                            selectedFlair.prop('checked', true);
                            GM_setValue('randomFlair', true);
                            $(availableFlairsTable).find('input[name=selectedFlair]:checked').prop('checked', false);
                        } else if ($(selectedFlair).attr('id') == 'cycleflair') {
                            if ($(selectedFlair).is(':checked')) {
                                var availableFlairs = [];
                                var xy = [];
                                $.each(availableFlairsTable, function() {
                                    xy = $(this).children('td:first-child').children('div').css('background-position').split(" ");
                                    availableFlairs.push({ x:Math.abs(xy[0].replace('px','') / 16), y:Math.abs(xy[1].replace('px','') / 16) });
                                });
                                GM_setValue('cycleFlair', availableFlairs);
                            } else {
                                GM_deleteValue('cycleFlair');
                            }
                        } else { //normal flair
                            selectedFlair.prop('checked', true);
                            GM_deleteValue('randomFlair');
                            $('#randomflair').prop('checked', false);
                            title = $(selectedFlair).parent().prev().prev().text() + ($(selectedFlair).parent().prev().text() ? '[' + $(selectedFlair).parent().prev().text() + ']' : '');
                            $.ajax({method:'post', data:"flair="+selectedFlair.val(), dataType:'text', url:updateurl})
                            .done(function(data) {
                                if ($.parseJSON(data).success === true) {
                                    $('#e_ShowFlair').css('background-position', $(selectedFlair).parent().prev().prev().prev().children().css('background-position'));
                                    $('#e_ShowFlair').attr('title',  title);
                                    $(selectedFlair).parent().prev().prev().append('<span id="success" style="display:none; position:absolute; color:#0f0">&nbsp;&nbsp;&#10003;</span>');
                                    $('#success').fadeIn(200).delay(600).fadeOut(200, function() { $('#success').remove(); });
                                } else {
                                    $(selectedFlair).parent().prev().prev().append('<span id="success" style="display:none; position:absolute; color:#f00">&nbsp;&nbsp;&#10007;</span>');
                                    $('#success').fadeIn(200).delay(600).fadeOut(1000, function() { $('#success').remove(); });
                                }
                            });
                        }
                    }
                }
            });


            var games = 0,
                row = 0,
                col = 0,
                WTLD = 0, //Wins Ties Losses DCs
                tempvalue = '';

            //=================================================================
            //Add Daily/Weekly/Monthly Stats...
            $('#StatsDWM tr:last').after($(data).find('table:eq(2) tr:eq(0)')); //Header
            $('#StatsDWM tr:last').after($(data).find('table:eq(2) tr:eq(1)')); //Daily
            $('#StatsDWM tr:last').after($(data).find('table:eq(2) tr:eq(2)')); //Weekly
            $('#StatsDWM tr:last').after($(data).find('table:eq(2) tr:eq(3)')); //Monthly
            $('#StatsDWM tr:last').after($(data).find('table:eq(2) tr:eq(4)')); //All

            for (row=2; row<=5; row++) {
                $('#StatsDWM tr:eq('+row+') > td:eq(7)').text($('#StatsDWM tr:eq('+row+') > td:eq(7)').text().toHHMMSS()); //Time
                WTLD = ( parseInt($('#StatsDWM tr:eq('+row+') > td:eq(2)').text()) + parseInt($('#StatsDWM tr:eq('+row+') > td:eq(3)').text()) + parseInt($('#StatsDWM tr:eq('+row+') > td:eq(4)').text()) + parseInt($('#StatsDWM tr:eq('+row+') > td:eq(6)').text()) );
                $('#StatsDWM tr:eq('+row+') > td:eq(9)').text( (WTLD > 0 ? (parseInt($('#StatsDWM tr:eq('+row+') > td:eq(2)').text()) / WTLD * 100).toFixed(2) : '0.00') );
            }

            //=================================================================
            //Add Daily/Weekly/Monthly PowerUp Table...
            $('#PUPDWM tr:last').after($(data).find('table:eq(3) tr:eq(0)')); //Header1
            $('#PUPDWM tr:last').after($(data).find('table:eq(3) tr:eq(1)')); //Daily
            $('#PUPDWM tr:last').after($(data).find('table:eq(3) tr:eq(2)')); //Weekly
            $('#PUPDWM tr:last').after($(data).find('table:eq(3) tr:eq(3)')); //Monthly
            $('#PUPDWM tr:last').after($(data).find('table:eq(3) tr:eq(4)')); //All

            //add "per game" stats..
            for (row=2; row<=5; row++) {
                games = $('#StatsDWM tr:eq('+row+') > td:eq(1)').text();
                for (col=0; col<=8; col++) {
                    tempvalue = $('#PUPDWM tr:eq('+row+') > td:eq('+col+')').text();
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

            //=================================================================
            //Add Rolling 300 Stats...
            $('#Stats300 tr:last').after($(data).find('table:eq(0) tr:eq(0)')); //Header1
            $('#Stats300 tr:last').after($(data).find('table:eq(0) tr:eq(1)')); //Header2
            $('#Stats300 tr:last').after($(data).find('table:eq(0) tr:eq(2)')); //All
            $('#Stats300 tr:last').after($(data).find('table:eq(0) tr:eq(3)')); //CTF
            $('#Stats300 tr:last').after($(data).find('table:eq(0) tr:eq(4)')); //Neutral

            for (row=3; row<=5; row++) {
                $('#Stats300 tr:eq('+row+') > td:eq(7)').text($('#Stats300 tr:eq('+row+') > td:eq(7)').text().toHHMMSS()); //Time
                WTLD = ( parseInt($('#Stats300 tr:eq('+row+') > td:eq(2)').text()) + parseInt($('#Stats300 tr:eq('+row+') > td:eq(3)').text()) + parseInt($('#Stats300 tr:eq('+row+') > td:eq(4)').text()) + parseInt($('#Stats300 tr:eq('+row+') > td:eq(6)').text()) );
                $('#Stats300 tr:eq('+row+') > td:eq(9)').text( (WTLD > 0 ? (parseInt($('#Stats300 tr:eq('+row+') > td:eq(2)').text()) / WTLD * 100).toFixed(2) : '0.00') );
            }
            $('#Stats300 tr:eq(3) > td:eq(9)').css('color','#0f0'); //Make the Rolling 300 Win % stand out a bit more

            //=================================================================
            //Add Rolling 300 PowerUp Table...
            $('#PUP300 tr:last').after($(data).find('table:eq(1) tr:eq(0)')); //Header1
            $('#PUP300 tr:last').after($(data).find('table:eq(1) tr:eq(1)')); //Header2
            $('#PUP300 tr:last').after($(data).find('table:eq(1) tr:eq(2)')); //All
            $('#PUP300 tr:last').after($(data).find('table:eq(1) tr:eq(3)')); //CTF
            $('#PUP300 tr:last').after($(data).find('table:eq(1) tr:eq(4)')); //Neutral

            //add "per game" stats...
            for (row=3; row<=5; row++) {
                games = $('#Stats300 tr:eq('+row+') > td:eq(1)').text();
                for (col=0; col<=8; col++) {
                    tempvalue = $('#PUP300 tr:eq('+row+') > td:eq('+col+')').text();
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
            //Shows "Settings" menu from the Profile page on the server page...
            GM_addStyle('.SettingsMenu_Button{display:inline-block; width:70px; height:20px; line-height:20px; margin:0 10px; padding:2px 10px; background:#777; color:#fff; font-size:15px; border:1px solid #fff; border-radius:6px;}');
            GM_addStyle('.SettingsMenu_Button:hover{background:#0b0; box-shadow:#fff 0 0 5px; }');

            $('#e_ShowSettingsMenu').after('<div id="SettingsMenu" style="display:none; position:absolute; width:320px; left:0; right:0; margin:0 auto; padding:0 20px 20px; background:'+YAIS_Selections.SettingsMenuColor.value+'; border-radius:8px; box-shadow:0px 0px 14px #fff; z-index:6000"></div>');
            $('#SettingsMenu').append('<div id="settingsInputs"></div><div id="settingsButtons" style="margin-top:20px"></div>');
            $('#settingsButtons').append('<a id="saveSettingsSuccess" href="javascript:void(0);" class="SettingsMenu_Button" style="background:#fff; color:#0b0; display:none"></a>');
            $('#settingsButtons').append('<a id="saveSettings" href="javascript:void(0);"        class="SettingsMenu_Button">Save</a>');
            $('#settingsButtons').append('<a id="cancelSettings" href="javascript:void(0);"      class="SettingsMenu_Button">Cancel</a>');

            $('#e_ShowSettingsMenu').click(function() {
                $('#YAIS_Menu_Mask').css({ 'height':$(document).height() });
                $('#YAIS_Menu_Mask').fadeIn(100);
                $('#settingsInputs').load(GM_getValue('profilePage') + ' #settings', function(){
                    $('#YAIS_Menu_Mask').css({ 'background':'#000' }); //remove the loading gif from the background
                    $('#showEmail').parent('div').remove();
                    $('#reservedMessage').parent('div').remove();
                    $('#settings').removeClass('hidden');
                    $('#SettingsMenu label').css('text-shadow', '1px 1px 1px #000');
                    $('#SettingsMenu').fadeIn(300);
                });
            });

            $('#saveSettings').on('click', function() {
                var inputs = $('#settings input, #settings select');
                var settings = '';
                var value = '';

                $('#saveSettings').hide(0);
                $('#saveSettingsSuccess').css('color','#0b0').css('background','#fff').html('Saving...').show(0);

                jQuery.each(inputs, function(i, v){
                    settings += v.name + '=' + (v.type === 'checkbox' ? v.checked : v.value) + '&';
                    if ((v.name === 'stats') && (v.checked === false)) {
                        $('#R300_Header_Next').css('text-decoration', 'line-through').css('text-shadow', 'none').attr('title', 'Stats are OFF');
                    } else {
                        $('#R300_Header_Next').css('text-decoration', 'none').css('text-shadow', 'none').attr('title', '');
                    }
                });
                settings = settings.substring(0, settings.length-1);

                if (tagpro.serverHost.length && settings.length) {
                    var updateurl = 'http://' + tagpro.serverHost + '/profile/update';
                    var postUpdateSettings = $.ajax({method:'post', data:settings, dataType:'text', url:updateurl});
                    postUpdateSettings.done(function(data) {
                        if ($.parseJSON(data).success === true) {
                            $('#saveSettingsSuccess').hide(0).html('&#10003; Saved!');
                            $('#saveSettingsSuccess').fadeIn(300).delay(600).fadeIn(0, function(){
                                $('#rName').text($.parseJSON(data).reservedName);
                                $('#dName').text($.parseJSON(data).displayName);
                                $('#SettingsMenu').fadeOut(200, function(){
                                    $('#saveSettingsSuccess').hide(0);
                                    $('#saveSettings').show(0);
                                    $('#YAIS_Menu_Mask').click();
                                });
                            });
                        } else {
                            $('#saveSettingsSuccess').hide(0).css('color','#f00').html('&#10007; Failed!');
                            $('#saveSettingsSuccess').fadeIn(300).delay(1200).fadeIn(0, function(){
                                $('#saveSettingsSuccess').hide(0);
                                $('#saveSettings').show(0);
                            });
                            console.log( "YAIS: Profile Settings Data NOT Saved!");
                        }
                    });
                    postUpdateSettings.fail(function() {
                        $('#saveSettingsSuccess').hide(0).css('color','#f00').html('&#10007; Failed!');
                        $('#saveSettingsSuccess').fadeIn(300).delay(1200).fadeIn(0, function(){
                            $('#saveSettingsSuccess').hide(0);
                            $('#saveSettings').show(0);
                        });
                        console.log( "YAIS: Profile Settings Data NOT Saved!");
                    });
                }
            });


            //=================================================================
            //Clear the profilePage if we click a logout link...
            $('a[href^="/logout"]').on('click', function(e){
                GM_deleteValue('profilePage');
            });

            //$('#e_AddCurrentServerButton').insertAfter('#e_Show300PUPTable');

        }); //.done()
    } //if loggedin


    //=================================================================
    //Make the Leaderboard button a popup and add sorting...
    GM_addStyle('table.board td, table.board th { padding:2px 5px }');
    GM_addStyle('.leaderboard_button { display:inline-block; margin:0 10px; padding:3px 10px; font-size:20px; background:#000; border:1px solid; border-radius:8px; width:65px; cursor:pointer }');
    $('body').append('<div id="e_ShowLeaderboardPage" style="position:absolute; margin:0 auto; left:0; right:0; top:50px; padding:20px; font-size:10px; text-shadow:2px 1px 2px #000; height:75%; width:500px; background:#666; overflow-y:auto; z-index:6000; display:none"></div>');
    $('#e_ShowLeaderboardPage').append('<div id="day_button" class="leaderboard_button" style="">Day</div><div id="week_button" class="leaderboard_button" style="">Week</div><div id="month_button" class="leaderboard_button" style="">Month</div><div id="rolling_button" class="leaderboard_button" style="">Rolling</div><div id="closeLeaderboard" title="Close" style="display:inline-block; float:right; padding:2px; width:13px; height:13px; color:#fff; background:#000; cursor:pointer">X</div>');
    var lastGetTime = 0;
    $('a[href^="/boards"]').on('click', function(e) {
        if (YAIS_Selections.ShowLeaderboardPage.value) {
            e.preventDefault();
            if (new Date().getTime() - lastGetTime > 300000) { //only 'get' the tables if we haven't done so within the last 5 mins
                $('#YAIS_Menu_Mask').css({ 'height':$(document).height() });
                $('#YAIS_Menu_Mask').fadeIn(100);
                $.get('/boards').done(function(data) {
                    lastGetTime = new Date().getTime();
                    $('#YAIS_Menu_Mask').css({ 'background':'#000' }); //remove the loading gif from the background
                    $('#Day').remove();
                    $('#Week').remove();
                    $('#Month').remove();
                    $('#Rolling').remove();
                    $('#e_ShowLeaderboardPage').append($(data).find('#Day'));
                    $('#e_ShowLeaderboardPage').append($(data).find('#Week'));
                    $('#e_ShowLeaderboardPage').append($(data).find('#Month'));
                    $('#e_ShowLeaderboardPage').append($(data).find('#Rolling'));
                    $('#Day').find('table').find('a').attr('target', '_blank');
                    $('#Week').find('table').find('a').attr('target', '_blank');
                    $('#Month').find('table').find('a').attr('target', '_blank');
                    $('#Rolling').find('table').find('a').attr('target', '_blank');

                    $('#e_ShowLeaderboardPage table th').css('background', '#000');
                    $('#e_ShowLeaderboardPage table th').css('cursor', 'ns-resize');

                    $('#day_button').on('click', function(){
                        $('#day_button').css('color', '#0b0');
                        $('#week_button').css('color', '#fff');
                        $('#month_button').css('color', '#fff');
                        $('#rolling_button').css('color', '#fff');
                        $('#Day').fadeIn(1000);
                        $('#Week').hide(0);
                        $('#Month').hide(0);
                        $('#Rolling').hide(0);
                    });
                    $('#week_button').on('click', function(){
                        $('#day_button').css('color', '#fff');
                        $('#week_button').css('color', '#0b0');
                        $('#month_button').css('color', '#fff');
                        $('#rolling_button').css('color', '#fff');
                        $('#Day').hide(0);
                        $('#Week').fadeIn(1000);
                        $('#Month').hide(0);
                        $('#Rolling').hide(0);
                    });
                    $('#month_button').on('click', function(){
                        $('#day_button').css('color', '#fff');
                        $('#week_button').css('color', '#fff');
                        $('#month_button').css('color', '#0b0');
                        $('#rolling_button').css('color', '#fff');
                        $('#Day').hide(0);
                        $('#Week').hide(0);
                        $('#Month').fadeIn(1000);
                        $('#Rolling').hide(0);
                    });
                    $('#rolling_button').on('click', function(){
                        $('#day_button').css('color', '#fff');
                        $('#week_button').css('color', '#fff');
                        $('#month_button').css('color', '#fff');
                        $('#rolling_button').css('color', '#0b0');
                        $('#Day').hide(0);
                        $('#Week').hide(0);
                        $('#Month').hide(0);
                        $('#Rolling').fadeIn(1000);
                    });

                    $('#e_ShowLeaderboardPage th').click(function(){
                        var table = $(this).parents('table').eq(0);
                        var rows = table.find('tr:gt(0)').toArray().sort(comparer($(this).index()));
                        this.asc = !this.asc;
                        if (!this.asc) rows = rows.reverse();
                        for (var i = 0; i < rows.length; i++) { table.append(rows[i]); }
                    });

                    $('#closeLeaderboard').on('click', function() {
                        $('#YAIS_Menu_Mask').click();
                    });

                    $('#e_ShowLeaderboardPage').fadeToggle(300);
                    $('#day_button').click();
                    $('#e_ShowLeaderboardPage').scrollTop(0);
                });
            } else {
                $('#YAIS_Menu_Mask').css({ 'background':'#000' });
                $('#YAIS_Menu_Mask').css({ 'height':$(document).height() });
                $('#YAIS_Menu_Mask').fadeIn(300);
                $('#e_ShowLeaderboardPage').fadeToggle(300);
            }
        }
    });


    //=================================================================
    //Shows the version of TagPro currently on the server...
    $('h1').append('<div id="e_ShowTagProVersion" style="position:absolute; margin:107px 0px 0px 515px; font-size:12px; font-weight:normal;">v'+tagpro.version+'</div>');


     //=================================================================
    //Build the menu and load the user options...
    if (LoggedIn) {
        getProfilePage.then(function(data) {
            var subMenu = '';
            $.each(YAIS_Selections, function(key, value) {
                //Build the menu...
                if (value.type === 'checkbox') {
                    $('#YAIS_Menu').append('<li style="list-style:none"><label><input type="' + value.type + '" id="' + key + '" class="'+ value.type + '" name="' + value.type + '" ' + (value.value === true ? 'checked' : '') + '>' + value.display + '</label></li>');
                }

                //Hide certain elements according to the saved values...
                if (key == 'ShowWinsUntilNextDegree') {
                    if (value.value === false) $('#e_ShowWinsUntilNextDegree').hide(0);
                } else if (key == 'ShowFlair') {
                    if (value.value === false) $('#e_ShowFlair').hide(0);
                } else if (key == 'ShowDWMStatsTable') {
                    if (value.value === false) $('#e_ShowDWMStatsTable').hide(0);
                } else if (key == 'ShowDWMPUPTable') {
                    if (value.value === false) $('#e_ShowDWMPUPTable').hide(0);
                } else if (key == 'Show300StatsTable') {
                    if (value.value === false) $('#e_Show300StatsTable').hide(0);
                } else if (key == 'Show300PUPTable') {
                    if (value.value === false) $('#e_Show300PUPTable').hide(0);
                } else if (key == 'ShowPUPsPerGame') {
                    if (value.value === true) {
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
                } else if (key == 'AddCurrentServerButton') {
                    if (value.value === false) $('#e_AddCurrentServerButton').hide(0);
                } else if (key == 'ShowLogout') {
                    if (value.value === false) $('#e_ShowLogout').hide(0);
                } else if (key == 'ShowSettingsMenu') {
                    if (value.value === false) $('#e_ShowSettingsMenu').hide(0);
                } else if (key == 'ShowTagProVersion') {
                    if (value.value === false) $('#e_ShowTagProVersion').hide(0);
                } else if (key == 'ShowRedditLink') {
                    if (value.value === false) $('.redditLink').hide(0);
                } else if (key == 'HideMenuButton') {
                    if (value.value === true) $('#YAIS_Menu_Button').css({'opacity':'0'});
                } else if (key == 'ShowBoxShadowBorder') {
                    if (value.value === true) {
                        $('#YAIS').css('box-shadow', '#fff 0px 0px 10px');
                    } else {
                        $('#YAIS').css('box-shadow', 'none');
                    }
                }
            });

            //=================================================================
            $('#YAIS_Menu .checkbox').on('click', function() {
                YAIS_Selections[$(this).attr('id')].value = $(this).is(':checked');
                GM_setValue('YAIS_Selections', YAIS_Selections);
                if ($(this).attr('id') == 'ShowWinsUntilNextDegree') {
                    $('#e_ShowWinsUntilNextDegree').fadeToggle(400);
                } else if ($(this).attr('id') == 'ShowFlair') {
                    $('#e_ShowFlair').fadeToggle(400);
                } else if ($(this).attr('id') == 'ShowDisplayedName') {
                    $('#rName').fadeToggle(0);
                    $('#dName').fadeToggle(0);
                } else if ($(this).attr('id') == 'ShowDWMStatsTable') {
                    $('#e_ShowDWMStatsTable').fadeToggle(400);
                } else if ($(this).attr('id') == 'ShowDWMPUPTable') {
                    $('#e_ShowDWMPUPTable').fadeToggle(400);
                } else if ($(this).attr('id') == 'Show300StatsTable') {
                    $('#e_Show300StatsTable').fadeToggle(400);
                } else if ($(this).attr('id') == 'Show300PUPTable') {
                    $('#e_Show300PUPTable').fadeToggle(400);
                } else if ($(this).attr('id') == 'ShowPUPsPerGame') {
                    if ($(this).is(':checked')) {
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
                } else if ($(this).attr('id') == 'AddCurrentServerButton') {
                    $('#e_AddCurrentServerButton').fadeToggle(400);
                } else if ($(this).attr('id') == 'ShowLogout') {
                    $('#e_ShowLogout').fadeToggle(400);
                } else if ($(this).attr('id') == 'ShowSettingsMenu') {
                    $('#e_ShowSettingsMenu').fadeToggle(400);
                } else if ($(this).attr('id') == 'ShowTagProVersion') {
                    $('#e_ShowTagProVersion').fadeToggle(400);
                } else if ($(this).attr('id') == 'ShowRedditLink') {
                    $('.redditLink').fadeToggle(400);
                } else if ($(this).attr('id') == 'HideMenuButton') {
                    if ($(this).is(':checked')) {
                        $('#YAIS_Menu_Button').css({'opacity':'0'});
                    } else {
                        $('#YAIS_Menu_Button').css({'opacity':'0.1'});
                    }
                } else if ($(this).attr('id') == 'ShowBoxShadowBorder') {
                    if ($(this).is(':checked')) {
                        $('#YAIS').css('box-shadow', '#fff 0px 0px 10px');
                    } else {
                        $('#YAIS').css('box-shadow', 'none');
                    }
                }
            });
            $('#YAIS_Menu').append('<div style="position:absolute; bottom:2px; right:5px; text-align:right"><a href="http://pastebin.com/6ULUbDET" target="_blank" style="font-size:11px; color:#888" title="Check pastebin for updates (opens in new tab)...">v' + GM_info.script.version + '</a</div>');


            //=================================================================
            //Makes the buttons a bit prettier :)
            if (YAIS_Selections.PriddyButtons.value) {
                GM_addStyle('.YAIS:hover { border-bottom:1px solid #0f0; }');
                $('div.buttons').next('div').children('a').addClass('YAIS');
                GM_addStyle('a.button { color:'+YAIS_Selections.BigButtonColorText.value+'; background:'+YAIS_Selections.BigButtonColor.value+'; border-radius:15px }');
                GM_addStyle('a.button:hover { background:'+YAIS_Selections.BigButtonColorHover.value+'; box-shadow:#ffffff 0 0 8px }');
                if ((PageLoc != 'joining') && (PageLoc != 'profile')) $('.section > a').css('text-shadow', '2px 1px 2px #000000');
            }

            //=================================================================
            $('#cancelSettings').on('click', function(){
                $('#SettingsMenu').fadeOut(300);
                $("#YAIS_Menu_Mask").fadeOut(200, function() {
                    $('#YAIS_Menu_Mask').css({ 'background':'#000 url(\'http://i.imgur.com/WKZPcQA.gif\') no-repeat center 300px' });
                });
            });
        });


    } else { //not logged in - we need to do this separately because of the ajax 'get' delay messes some things up.
        $.each(YAIS_Selections, function(key, value) {
            //Build the menu...
            if (value.type === 'checkbox') {
                $('#YAIS_Menu').append('<li style="list-style:none"><label><input type="' + value.type + '" id="' + key + '" class="'+ value.type + '" name="' + value.type + '" ' + (value.value === true ? 'checked' : '') + '>' + value.display + '</label></li>');
            }
            //Hide certain elements according to the saved values...
            if (key === 'ShowWinsUntilNextDegree') {
                $('#ShowWinsUntilNextDegree').prop('disabled', true);
            } else if (key === 'ShowFlair') {
                $('#ShowFlair').prop('disabled', true);
            } else if (key === 'ShowDisplayedName') {
                $('#ShowDisplayedName').prop('disabled', true);
            } else if (key === 'ShowDWMStatsTable') {
                $('#ShowDWMStatsTable').prop('disabled', true);
            } else if (key === 'ShowDWMPUPTable') {
                $('#ShowDWMPUPTable').prop('disabled', true);
            } else if (key == 'Show300StatsTable') {
                $('#Show300StatsTable').prop('disabled', true);
            } else if (key === 'Show300PUPTable') {
                $('#Show300PUPTable').prop('disabled', true);
            } else if (key === 'AddCurrentServerButton') {
                if (value.value === false) $('#e_AddCurrentServerButton').hide(0);
            } else if (key === 'ShowLogout') {
                $('#ShowLogout').prop('disabled', true);
            } else if (key === 'ShowSettingsMenu') {
                $('#ShowSettingsMenu').prop('disabled', true);
            } else if (key === 'ShowTagProVersion') {
                if (value.value === false) $('#e_ShowTagProVersion').hide(0);
            } else if (key === 'ShowRedditLink') {
                if (value.value === false) $('.redditLink').hide(0);
            } else if (key === 'HideMenuButton') {
                if (value.value === true) $('#YAIS_Menu_Button').css({'opacity':'0'});
            } else if (key === 'ShowBoxShadowBorder') {
                if (value.value === true) {
                    $('#YAIS').css('box-shadow', '#fff 0px 0px 10px');
                } else {
                    $('#YAIS').css('box-shadow', 'none');
                }
            }
        });
        if (!LoggedIn) $('#YAIS_Menu').append('<div style="text-align:center;color:#f22; margin:10px auto 0">Note: You are NOT currently logged in</div>');
        $('#YAIS_Menu').append('<div style="position:absolute; bottom:2px; right:5px; text-align:right"><a href="http://pastebin.com/6ULUbDET" target="_blank" style="font-size:11px; color:#888" title="Check pastebin for updates (opens in new tab)...">v' + GM_info.script.version + '</a</div>');


        //=================================================================
        //Makes the buttons a bit prettier :)
        if (YAIS_Selections.PriddyButtons.value) {
            GM_addStyle('.YAIS:hover { border-bottom:1px solid #0f0; }');
            $('div.buttons').next('div').children('a').addClass('YAIS');
            GM_addStyle('a.button { color:'+YAIS_Selections.BigButtonColorText.value+'; background:'+YAIS_Selections.BigButtonColor.value+'; border-radius:15px }');
            GM_addStyle('a.button:hover { background:'+YAIS_Selections.BigButtonColorHover.value+'; box-shadow:#ffffff 0 0 8px }');
            if ((PageLoc != 'joining') && (PageLoc != 'profile')) $('.section > a').css('text-shadow', '2px 1px 2px #000000');
        }


        //=================================================================
        $('#YAIS_Menu .checkbox').on('click', function() {
            YAIS_Selections[$(this).attr('id')].value = $(this).is(':checked');
            GM_setValue('YAIS_Selections', YAIS_Selections);
            if ($(this).attr('id') == 'AddCurrentServerButton') {
                $('#e_AddCurrentServerButton').fadeToggle(400);
            } else if ($(this).attr('id') == 'ShowTagProVersion') {
                $('#e_ShowTagProVersion').fadeToggle(400);
            }
        });
    }


    //=================================================================
    //Create the background mask for when a menu is shown...
    $('body').prepend('<div id="YAIS_Menu_Mask"></div>');
    GM_addStyle('#YAIS_Menu_Mask{background:#000000 url(\'http://i.imgur.com/WKZPcQA.gif\') no-repeat center 300px; position:absolute; opacity:0.7; height:100%; width:100%; top:0; left:0; z-index:5000; display:none;}');
    $.get('http://i.imgur.com/WKZPcQA.gif'); //preload the "ajax loading" gif
    $(document).keydown(function(event) {
        if ( (event.which == 27) && ($('#YAIS_Menu_Mask').is(':visible')) ) $('#YAIS_Menu_Mask').click();
    });

    //=================================================================
    $('#YAIS_Menu_Button').on('click', function() {
        $('#YAIS_Menu').fadeTo(200, 1.0);
    });
    $('#YAIS_Menu_Button').mouseenter(function() {
        $('#YAIS_Menu_Button').fadeTo(200, 1);
    });
    $('#YAIS_Menu_Button').mouseleave(function() {
        $('#YAIS_Menu_Button').fadeTo(200, (YAIS_Selections.HideMenuButton.value ? 0 : 0.1));
    });
    $("#YAIS_Menu").mouseleave(function() {
        $('#YAIS_Menu').fadeOut(100);
    });

    //=================================================================
    $('#YAIS_Menu_Mask').on('click', function(){
        $('#SettingsMenu').fadeOut(300);
        $('#flairmenu').fadeOut(300);
        $('#e_ShowLeaderboardPage').fadeOut(300);
        $("#YAIS_Menu_Mask").fadeOut(200, function() {
            $('#YAIS_Menu_Mask').css({ 'background':'#000 url(\'http://i.imgur.com/WKZPcQA.gif\') no-repeat center 300px' });
        });
    });

}  //on server


function showSaveAttemptMessage() {
    var SaveAttemptMessage = 'This game is a save attempt!';

    if (!$('#addSaveAttemptMessageSB').length) $('#mapInfo').after('<div id="addSaveAttemptMessageSB" style="font-size:14px;font-weight:bold; color:#f00; text-align:center; text-shadow:1px 2px 1px #222; clear:both">' + SaveAttemptMessage + '</div>');
    if (!$('#addSaveAttemptMessageBody').length) $('body').prepend('<div id="addSaveAttemptMessageBody" style="margin:0 auto; font-size:14px; font-weight:bold; color:#fff; background:#f00; text-align:center; text-shadow:1px 2px 1px #000; clear:both">' + SaveAttemptMessage + '</div>');
}

tagpro.ready(function() {
    if (PageLoc === 'ingame') {
        YAIS_Selections = $.extend(true, {}, options, GM_getValue('YAIS_Selections', options));

        //Show server stats in game (under the exit link)
        if (YAIS_Selections.ServerStatsInGame.value) {
            var intervalHandle;
            $('#exit').after('<div id="YAIS_ServerStats" class="YAIS_stats" data-url="http://'+tagpro.serverHost+'/stats?callback=?" style="margin:20px 0 0 5px; font-size:10px">');

            function refreshStats() {
                var n = (new Date).getTime();
                var e = $('#YAIS_ServerStats');

                clearInterval(intervalHandle);

                $.ajax({timeout:1e3, dataType:"json", url:e.data('url'), success:function(i) {
                    e.text("Players:"+i.players + (i.playerCapacity?"/"+i.playerCapacity:"") + (i.games?", Games:"+i.games:""));
                }, error:function(){
                    e.text("Error getting server stats");
                }});
                $('#YAIS_ServerStats').fadeOut(100).fadeIn(100);

                intervalHandle = setInterval(refreshStats, 15000);
            }
            refreshStats();
        }

        tagpro.socket.on('end', function(data) {
            if (GM_getValue('YAIS_Selections').ShowRedditLink.value) {
                setInterval(function() {
                    $('.redditLink').hide(0);
                }, 100);
            }
        });

        tagpro.socket.on('chat', function(data) {
            if (data.from === null) { //system message
                if (data.message.indexOf('save attempt') >= 0) {
                    if (GM_getValue('YAIS_Selections').showSaveAttemptMessages.value) showSaveAttemptMessage();
                }
            }
        });

        if (GM_getValue('cycleFlair')) {
            var cycleNewFlair = true;
            var availableFlairs = [];
            availableFlairs = GM_getValue('cycleFlair');

            if (availableFlairs.length > 0) {
                var count = 0;
                var tr = tagpro.renderer;

                var flairUpdateInterval = setInterval(function() {
                    count++;
                    if (count > availableFlairs.length-1) count = 0;
                    cycleNewFlair = true;
                }, 2000);

                if (cycleNewFlair) { //flair has changed - update to the new one
                    tr.drawFlair = function (player) {
                        if (player.sprites.flair) {
                            player.sprites.info.removeChild(player.sprites.flair); //remove the old flair
                        }
                        if (player.flair) {
                            if (player.id == tagpro.playerId) { //just update our ball's flair to the new one
                                player.flair.x = availableFlairs[count].x;
                                player.flair.y = availableFlairs[count].y;
                            }
                            var cacheKey = "flair-" + player.flair.x + "," + player.flair.y; //add new texture
                            var flairTexture = tr.getFlairTexture(cacheKey, player.flair);
                            player.sprites.flair = new PIXI.Sprite(flairTexture);
                            player.sprites.flair.x = 12;
                            player.sprites.flair.y = -17;
                            player.sprites.info.addChild(player.sprites.flair);
                        }
                        cycleNewFlair = false; //don't update again until new flair is ready
                    };
                }
            }
        }
    }
}); //tagpro.ready
