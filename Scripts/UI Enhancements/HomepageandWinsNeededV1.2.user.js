// ==UserScript==
// @name         TagPro Homepage And Wins Needed
// @version      1.2
// @description  Improve Homepage and show needed wins
// @include      http://tagpro-*.koalabeast.com/
// @include      http://tagpro-*.koalabeast.com/games*
// @include      http://*.jukejuice.com/
// @include      http://*.jukejuice.com/games*
// @include      http://*.newcompte.fr/
// @include      http://*.newcompte.fr/games*
// @author       defense_bot, ballparts, ben, despair
// @grant        none
 
// ==/UserScript==
 
// - - - SETTINGS - - - //
 
// Show degree and wins till next degree
var showWinsUntil = true;
 
// Show win-rate
var showWinRate = false;
 
// Show daily stats - sets winrate to false
var showDailyStats = true;
 
// Change text of main page
var changeMainMenu = true;
 
// Show current server stats
var showServerStats = true;
 
// - CUSTOMIZE TEXT - // {?} <- use to place number
var playText = ["Play", "{?} Online"],
    profileText = ["Anne Frank", "My Settings"],
    logonText = ["Log In", "Track Stats"],
    groupText = ["Groups", "- {?} -"],
    leaderText = ["Rank Points", "Who Plays Too Much?"],
    replayText = ["Replays", "Thanks Ballparts!"],
    mapsText = ["Private Group", "Get Out You Noobs!"];
 
// - END OF SETTINGS - //
 
if(showDailyStats){showWinRate = false;}
 
var pageLoc = (location.href.indexOf("games/find") == -1) ? "home" : "find";
var parentSlot;
 
// Gets a list of all the links on the page //
anchor = document.getElementsByTagName("a");
var playID = findID("Play Now");
 
cacheProfile();
findParentSlot();
if(showDailyStats){addDailyStats();}
if(showWinRate){addWinRate();}
if(showWinsUntil){addWinsUntil();}
if(pageLoc == "home" && changeMainMenu){
    changeHome();
    updatePlayerCount();
}else if(pageLoc == "find" && showServerStats){
    serverButton = createButton();
    getStats(serverButton);
}
 
function cacheProfile(){
    url = $('a[href^="/profile"]').attr('href');
    if(url !== undefined){
        var n = url.lastIndexOf('/');
        var profileNum = url.substring(n + 1);
        profilePage = String('/profile/'+profileNum);
        localStorage.setItem('profilePage',profilePage);
    }
}
 
function findParentSlot(){
    if(pageLoc == "home"){
        parentSlot = (playID === 1) ? $('article > div.tiny') : $('article > h1');
    }else{
        parentSlot = $('article > div.section.smaller');
    }
}
 
function addWinsUntil(){
    parentSlot.after( "<center><h3><p id='winsneeded'></p></h3></center>" );
    $( "#winsneeded" ).load(localStorage.getItem('profilePage') + ' article > h3 > div', function(){
        $('h3').css({'margin':'10px'});
        $('#winsneeded > div:last-child').css({'font-size':'50%'});
    });
}
 
function addWinRate(){
    parentSlot.after('<h4><center><span id="winp"><span id="inner"></span></span></center></h4>');
    element = $('<center><span id="created"></span></center>');
    $(winp).append(element);
    $( element ).load(localStorage.getItem('profilePage') + ' td:eq(6)', function(){
        text = $('td').text();
        text = text.substring(0, 3);
        if(text != "100"){text = text.substring(0, 2);}
        text = "Daily Win : " + text + "%";
        $('#inner').append(text);
        $('center > td').remove();
        $('h4').css({'margin':'10px'});
    });
}
 
function addDailyStats(){
    parentSlot.after( "<h4><table class='board'><tbody id='header1'></h4>" );
    $('h4').css({'margin':'10px'});
    $('#header1').after( "<tbody id='dailyStats'>" );
    $.get(localStorage.getItem('profilePage'), function(data) {
        var timePos = data.indexOf("<td class=\"duration\">") + 21,
            timeText = data.substring(timePos, timePos+10);
        timeText = timeText.substring(0, timeText.indexOf("<"));
        data = data.replace(" class=\"duration\">" + timeText, ">"+formatTime(timeText));
        $( "#header1" ).html($(data).find('tr:eq(0)'));
        $( "#dailyStats" ).html($(data).find('tr:eq(1)'));
    });
}
 
function formatTime(text){
    var h, m, s;
    var num = Number(text);
    h = Math.floor(num/3600);
    m = Math.floor(num/60) - h*60;
    s = num - h*3600 - m*60;
    return addZero(h) +":"+ addZero(m) +":"+ addZero(s);
}
 
function addZero(input){
    return (input < 10) ? "0"+input : ""+input;
}
 
// configure buttons
function setText(button, main, small, replace){
    var msg = main + "<span>" + small + "</span>";
    if(replace !== undefined){
        msg = msg.replace("{?}", replace);
    }
    anchor[button].innerHTML = msg;
}
 
function changeHome(){
    setText(playID, playText[0], playText[1], "?");
    if(anchor[playID+1].innerHTML.indexOf("Profile") != -1){
        setText(playID+1, profileText[0], profileText[1]);
    }else{
        setText(playID+1, logonText[0], logonText[1]);
    }
    var startPos = anchor[playID+2].innerHTML.indexOf(":") + 1,
        endPos = anchor[playID+2].innerHTML.indexOf("<"),
        groupCount = anchor[playID+2].innerHTML.substring(startPos, endPos);
    setText(playID+2, groupText[0], groupText[1], groupCount);
    setText(playID+3, leaderText[0], leaderText[1]);
    // mod buttons after //
    var replayID, mapsID;
    replayID = findID("Replays");
    if(replayID !== undefined){
        setText(replayID, replayText[0], replayText[1]);
    }
    setTimeout(function(){
        mapsID = findID("Maps");
        if(mapsID !== undefined){
            setText(mapsID, mapsText[0], mapsText[1]);
        }
    },250);
}
 
function findID(match){
    var i;
    for(i=0; i<anchor.length; i++){
        if(anchor[i].innerHTML.indexOf(match) != -1){
            return i;
        }
    }
}
 
function updatePlayerCount(){
    var ServerURL = location.href + "stats?callback";
    $.ajax({
        timeout:1e3, dataType:"json",
        url:ServerURL,
        success:function(i){
            setText(playID, playText[0], playText[1], i.players);
        },
    });
}
 
function findInputSpot() {
    SS = $('div.smaller.section');
    for (var i = 0; i < SS.length; i ++) {
        textcontent = SS[i].innerText || SS[i].textContent
        if (textcontent == 'Or Switch Server:') {
            return SS[i];
        }
    }
    return false;
}
 
function getStats(e) {
    n=(new Date).getTime();
    var wattt = e.attr("href")+"stats?callback=?";
    $.ajax({timeout:1e3,dataType:"json",url:wattt,success:function(i){
        i.ping=(new Date).getTime()-n,e.attr("data-ping",i.ping).find(".stats").text("Ping: "+
        i.ping+", Players: "+i.players+(i.playerCapacity?"/"+i.playerCapacity:""))
    },error:function(){
        e.find(".stats").text("error getting stats.")
    }})
}
 
function capitaliseFirstLetter(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}
 
function createButton() {
    var serverURL = tagpro.serverHost + "/";
    var serverName = serverURL.replace('.koalabeast.com/','').replace('tagpro-','')
    if(location.href.indexOf("tangent") != -1){serverName = "tangent";}
    else if(location.href.indexOf("newcompte") != -1){serverName = "newcompte";}
    inputSpot = $(findInputSpot());
    inputSpot.before('<center><a id=currentServer href=http://'+serverURL+
    ' class="button">'+capitaliseFirstLetter(serverName)+'<span class="stats">');
    return($('#currentServer'));
}