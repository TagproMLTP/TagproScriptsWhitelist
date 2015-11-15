// ==UserScript==
// @name       		Stop Group Chat Autoscroll
// @namespace  		http://www.reddit.com/user/goodygood_274/
// @version    		0.2
// @description  	Stops group chat from automatically scrolling to bottom when new chats occur 
// @include      	http://tagpro-*.koalabeast.com/groups/*
// @license       	GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author        	ballparts
// ==/UserScript==

tagpro.group.socket.listeners('chat')[0] = function (e){
    if($("#chat").get(0).scrollHeight - $("#chat").get(0).scrollTop - $("#chat").height() - 20 < 1) {
    	var scrollDown = true;
    } else {
        var scrollDown = false;
    }
    var t="";
    e.from&&(t+=e.from+": ");
    t+=e.message;
    $("<div></div>").text(t).appendTo($("#chat"));
    if(scrollDown) {
        $("#chat").scrollTop($("#chat").get(0).scrollHeight);
    }
}