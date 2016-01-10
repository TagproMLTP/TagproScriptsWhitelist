// ==UserScript==
// @name            YAIS - flair in page, wins until next
// @description     Yet Another Info Script
// @version         0.1.1
// @include         http://tagpro-*.koalabeast.com/
// @include         http://tagpro-*.koalabeast.com/games/find/
// @include         http://tagpro-*.koalabeast.com/profile*
// @license         GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author          nabby (includes code written by ballparts, Ben & probably some others)
// ==/UserScript==
 
 
//==================================
//  OPTIONS...
//----------------------------------
var ShowWinsUntilNextDegree = false;      // Show "Wins until next degree" on the server & loading pages.
var ShowFlair               = false;      // Shows your selected flair next to "Wins until next degree" (which must also be 'true')
var ShowStatsTable          = false;      // Show Daily/Weekly/Monthly Stats on the server & loading pages.
var AddCurrentServerButton  = false;      // Adds a new button for the server you're on with updating stats.
var ShowLogout              = true;      // Adds a "Logout" link on the server page.
var ShowTagProVersion       = true;      // Show the version of TagPro on the server & loading pages.
var PriddyButtons           = false;      // Awwww
//==================================
 
if ($('#WLT').length) {
    $('#WLT').after('<div id="YAIS" style="text-align:center; padding:20px 0 0"></div>');
} else {
    $('article > div.section.smaller').first().after('<div id="YAIS" style="text-align:center; padding:20px 0 0"></div>');
}
 
function setProfilePage(){
    var url = $('a[href^="/profile"]').attr('href');
    if (url !== undefined) { //we're on the chosen server page AND logged in
        var n = url.lastIndexOf('/');
        var profileNum = url.substring(n + 1);
        var profilePage = String('/profile/'+profileNum);
        localStorage.setItem('profilePage', profilePage);
        return true;
    } else {
        if ($('#play').length) { //we're on the chosen server page but NOT logged in
            return false;
        } else {
            if (localStorage.getItem('profilePage').length) { //we're probably logged in (!)
                return true;
            } else {
                return false;
            }
        }
    }
}
 
var LoggedIn = setProfilePage();
 
String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor(sec_num % 3600 / 60);
    var seconds = Math.floor(sec_num % 3600 % 60);
 
    if (hours   < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;
    return hours + ':' + minutes + ':' + seconds;
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
 
if ((ShowLogout) && (LoggedIn)) {
    if ($('#play').length) {
        $('#play').parent().next('div').append('<a id="YAIS_Logout" href="/logout" style="margin-right:10px; margin-left:10px">Log Out</a>');
    }
}
 
 
//=================================================================
//Add "Wins until next degree"...
if ((ShowWinsUntilNextDegree) && (LoggedIn) && (document.URL.search('profile') < 1)) {
    setProfilePage();
 
    $('#YAIS').append('<div id="winsneeded"></div>');
 
    $.get(localStorage.getItem('profilePage'), function(data){
        var winsneeded = $(data).find('h3').text();
        var name = winsneeded.replace($(data).find('h3 div').text(), '');
        var nextdegreein = winsneeded.replace(name, '');
        var degree = nextdegreein.replace(nextdegreein.substr(nextdegreein.indexOf('°')+1), '');
        nextdegreein = nextdegreein.replace(degree, '').replace('.', '').toLowerCase();
        if (name) $('#winsneeded').html('<div id="myflair" class="flair" style="margin-right:4px; background-image:url(/images/flair.png); display:none"></div><span style="font-size:18px; font-weight:bold; text-shadow:2px 1px 2px #000000">' + name  + ': ' + degree  + '</span>' + ' <span style="font-size:12px; font-style:italic; text-shadow:2px 1px 2px #000000">(' + nextdegreein  + ')</span>');
 
        if (ShowFlair) {
            var selectedFlair = $(data).find('input[name=selectedFlair]:checked');
            if ((selectedFlair.val() != undefined) && (selectedFlair.val() != 'undefined')) {
                $('#myflair').css('background-position', $(selectedFlair).parent().prev().prev().prev().children().css('background-position'));
                var title = $(selectedFlair).parent().prev().prev().text();
                //The following line really only works if you have selected the highest available flair. Uncomment to use it...
                //title += ' [Next Flair: ' + $(selectedFlair).closest('tr').next().children('td:nth-child(2)').text() + ']';
                $('#myflair').attr('title',  title);
                $('#myflair').delay(800).fadeIn(2400);
            }
        }
    });
}
 
 
//=================================================================
//Add Daily/Weekly/Monthly Stats...
if ((ShowStatsTable) && (LoggedIn) && (document.URL.search('profile') < 1)) {
    setProfilePage();
 
    $('#YAIS').append('<div id="DWM-Stats" style="width:80%; margin:auto; text-align:center; padding:10px 0"><table id="DWMStats" class="board" style="font-size:12px; border-spacing:1px; text-shadow:2px 1px 2px #000000"><tr></tr></table></div>');
    $.get(localStorage.getItem('profilePage'), function(data) {
        $('#DWMStats tr:last').after($(data).find('tr:eq(0)')); //Header
        $('#DWMStats tr:last').after($(data).find('tr:eq(1)')); //Daily
        $('#DWMStats tr:last').after($(data).find('tr:eq(2)')); //Weekly
        $('#DWMStats tr:last').after($(data).find('tr:eq(3)')); //Monthly
        //$('#DWMStats tr:last').after($(data).find('tr:eq(4)')); //All
 
        $('#DWMStats tr:eq(2) > td:eq(5)').text($('#DWMStats tr:eq(2) > td:eq(5)').text().toHHMMSS());
        $('#DWMStats tr:eq(3) > td:eq(5)').text($('#DWMStats tr:eq(3) > td:eq(5)').text().toHHMMSS());
        $('#DWMStats tr:eq(4) > td:eq(5)').text($('#DWMStats tr:eq(4) > td:eq(5)').text().toHHMMSS());
        //$('#DWMStats tr:eq(5) > td:eq(5)').text($('#DWMStats tr:eq(5) > td:eq(5)').text().toHHMMSS());
    });
}                    
 
 
//=================================================================
//Adds a new button for the server you're on with updating stats...
if ((AddCurrentServerButton) && (document.URL.search('profile') < 1)) {
    var RefreshInterval = 10;
    var count = RefreshInterval - 1;
    var RefreshCount = 0;
 
    countdown = setInterval(function(){
        if (count > 0) $('#refreshstats').html(count < 10 ? '0'+count : count);
        count--;
    }, 1000);
 
    function getStats(e) {
        var n = (new Date).getTime();
        $.ajax({timeout:1e3, dataType:"json", url:e.attr("href")+"stats?callback=?", success:function(i) {
            i.ping = (new Date).getTime() - n;
            e.attr("data-ping",i.ping).find(".stats").text("Ping:"+i.ping + ", Players:"+i.players + (i.playerCapacity?"/"+i.playerCapacity:"") + (i.games?", Games:"+i.games:""));
            e.find('.stats').append(' (<span id="refreshstats">' + (RefreshInterval) + '</span>)');
        }, error:function(){
            e.find(".stats").text("error getting stats.");
        }});
    }
 
    function capitaliseFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
 
    $('#YAIS').append('<div id="CurrentServerButton" style="margin:auto; text-align:center; padding:30px 0 10px "></div>');
 
    function createButton() {
        var serverURL = tagpro.serverHost + "/";
        var serverName = serverURL.replace('.koalabeast.com','').replace('tagpro-','').replace('/','');
        var serverLocation = $('div.smaller.section').children('strong').html();
        if (typeof serverLocation !== "undefined") {
            serverLocation = serverLocation.slice(serverLocation.indexOf('(')+1, serverLocation.lastIndexOf(')'));
        } else {
            serverLocation = '&nbsp;';
        }
        $('#CurrentServerButton').append('<a id="currentServer" href="http://'+serverURL+'" class="button" title="Click to reload this page...">'+capitaliseFirstLetter(serverName)+'<span class="strong">'+serverLocation+'<br></span><span class="stats"></div>');
        return($('#currentServer'));
    }
 
    var button=createButton();
    getStats(button);
 
    (function refreshStats() {
        getStats( $('#currentServer') );
        if ( (window.location.href.indexOf('tagpro-') >= 0) && (window.location.href.indexOf(':', 6) < 0) && (window.location.href.indexOf('/games/find/') < 0) ) {
            RefreshCount++;
            count = RefreshInterval - 1;
            $('.stats, #refreshstats').stop().fadeTo(RefreshInterval * 1000, 0.1, "linear").fadeTo(0, 1);
            setTimeout(refreshStats, RefreshInterval * 1000);
        }
        //Gradually increase the time between updates...
        if (RefreshCount > 160) { //60*60secs = after another ~60 mins interval is every 120 seconds
            RefreshInterval = 120;
        } else if (RefreshCount > 100) { //70*20secs = after another ~23 mins interval is every 60 seconds
            RefreshInterval = 60;
        } else if (RefreshCount > 30) { //30*10secs = after ~5 mins interval is every 20 seconds
            RefreshInterval = 20;
        }
    })();
}
 
 
//=================================================================
//Shows the version of TagPro currently on the server...
if (ShowTagProVersion) {
    $('h1').after('<div id="TagProVersion" style="position:absolute; margin:-25px 0px 0px 636px">v'+tagpro.version+'</div>');
}
 
 
//=================================================================
//Makes the buttons a bit prettier :)
if (PriddyButtons) {
    $('a.button').css('border-radius', '15px');
    $().addStyle('a.button:hover{ background-color:#C1FF03; box-shadow: #ffffff 0 0 8px }');
    if (window.location.href.indexOf('/games/find') < 0) $('.section > a').css('text-shadow', '2px 1px 2px #000000');
}
 
 
$(document).ready(function() {
    $('#YAIS_Logout, a[href^="/logout"]').on('click', function(){
        localStorage.setItem('profilePage', '');
    });
});