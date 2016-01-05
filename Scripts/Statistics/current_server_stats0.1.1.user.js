// ==UserScript==
// @name       		Current Server Stats
// @namespace  		http://www.reddit.com/user/goodygood_274/
// @version    		0.1.1
// @include      	http://*koalabeast.com/games/find*
// @description  	Show stats of current server on game loading screen
// @license       	GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author        	ballparts
// ==/UserScript==


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
    $.ajax({timeout:1e3,dataType:"json",url:e.attr("href")+"stats?callback=?",success:function(i){
        i.ping=(new Date).getTime()-n,e.attr("data-ping",i.ping).find(".stats").text("Ping: "+i.ping+", Players: "+i.players+(i.playerCapacity?"/"+i.playerCapacity:"")) 
    },error:function(){
        e.find(".stats").text("error getting stats.")
    }})
}

function capitaliseFirstLetter(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function createButton() {
    var serverURL = tagpro.serverHost + "/";
    var serverName = serverURL.replace('.koalabeast.com/','').replace('tagpro-','')
	inputSpot = $(findInputSpot());
    inputSpot.before('<center><a id=currentServer href=http://'+serverURL+' class="button">'+capitaliseFirstLetter(serverName)+'<span class="stats">');
    return($('#currentServer'));
}

var button=createButton();
getStats(button);
