// ==UserScript==
// @name          TagPro Leaderboard Countdown
// @namespace     http://www.reddit.com/user/Satrex/
// @description   Shows a Countdown on the leaderboard until the reset
// @include       http://tagpro-*.koalabeast.com/boards
// @include       http://tangent.jukejuice.com/boards
// @include       http://maptest.newcompte.fr/boards
// @copyright     2014+ Satrex
// @author        Satrex
// @version       1.0
// ==/UserScript==
var canvas = document.createElement('canvas');
canvas.id = "CursorLayer";
canvas.width = 213;
canvas.height = 25;
canvas.style.position = "absolute";
canvas.style.border = "1px solid";
canvas.style.display = "inline";
canvas.style.backgroundColor = 'rgba(0,0,0,1)';
canvas.style.marginTop = "255px"
canvas.style.marginLeft = window.innerWidth  +"px";
 
var body = document.getElementsByTagName("body")[0];
body.insertBefore(canvas, body.firstChild);
 
cursorLayer = document.getElementById("CursorLayer");
var ctx = cursorLayer.getContext("2d");
 
function daysInMonth(month,year) {
    return new Date(year, month, 0).getDate();
}
 
function daily()
{
    var dayboard = document.getElementById("Day");
    if(dayboard.style.display != "none")
    {
        cursorLayer.width = 213;
        var offset = -7;
        var countdowntime = new Date( new Date().getTime() + offset * 3600 * 1000).toUTCString().replace( / GMT$/, "" );
       
        var day = countdowntime.substr(5, 2);
        var month = countdowntime.substr(8, 3);
        var year = countdowntime.substr(12, 4);
        var pst = countdowntime.substr(17, 8);
       
        var sTimePST =  (parseInt(pst.substr(6,7))) + (parseInt(pst.substr(3,4))*60) + (parseInt(pst.substr(0,1))*60*60);
       
        var dsLeft = 59 - parseInt(pst.substr(6,2));
        var dmLeft = 59 - parseInt(pst.substr(3,2));
        var dhLeft = 19 - parseInt(pst.substr(0,2));
       
        if (dhLeft< 0)
        {
            dhLeft = 24 + dhLeft;    
        }
       
        var s10 = "";
        var m10 = "";
        var h10 = "";
       
        if (dsLeft < 10)
        {
            s10 = "0";
           
        }
        if (dmLeft <10)
        {
            m10 = "0";
           
        }
        if (dhLeft <10)
        {
            h10 = "0";
           
        }
        var actualtimer = h10 + (dhLeft).toString() + ":"+ m10 + (dmLeft).toString() + ":" + s10 + (dsLeft).toString();
       
        actualtimer = "Time until reset: " + actualtimer;
        ctx.fillStyle="#FFFFFF";
        ctx.font="20px Hallo Sans Light";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
       
        ctx.fillText(actualtimer,1,20);
    }
   
   
}
setInterval(daily,1000);
 
function weekly()
{
    var weekboard = document.getElementById("Week");
    if(weekboard.style.display != "none")
    {
        cursorLayer.width = 230;
        var offset = -7;
        var wcountdowntime = new Date( new Date().getTime() + offset * 3600 * 1000).toUTCString().replace( / GMT$/, "" );
       
        var weekday = wcountdowntime.substr(0, 3);
        var wday = wcountdowntime.substr(5, 2);
        var wmonth = wcountdowntime.substr(8, 3);
        var wyear = wcountdowntime.substr(12, 4);
        var wpst = wcountdowntime.substr(17, 8);
       
        var sTimePST =  (parseInt(wpst.substr(6,7))) + (parseInt(wpst.substr(3,4))*60) + (parseInt(wpst.substr(0,1))*60*60);
       
       
        var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        weekday = days.indexOf(weekday);
        weekday = 7 - weekday;
       
        var wdsLeft = 59 - parseInt(wpst.substr(6,2));
        var wdmLeft = 59 - parseInt(wpst.substr(3,2));
        var wdhLeft = 19 - parseInt(wpst.substr(0,2));
       
        if(wdhLeft<0)
        {
            wdhLeft = 24 + wdhLeft;    
        }
       
        var ws10 = "";
        var wm10 = "";
        var wh10 = "";
       
        if (wdsLeft < 10)
        {
            ws10 = "0";
           
        }
        if (wdmLeft < 10)
        {
            wm10 = "0";
           
        }
        if (wdhLeft < 10)
        {
            wh10 = "0";
           
        }
        var weeklytimer = weekday.toString() + ":" + wh10 + (wdhLeft).toString() + ":" + wm10 + (wdmLeft).toString() + ":" + ws10 + (wdsLeft).toString();
        weeklytimer = "Time until reset: " + weeklytimer;
        ctx.fillStyle="#FFFFFF";
        ctx.font="20px Hallo Sans Light";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
       
        ctx.fillText(weeklytimer,1,20);
    }
   
   
}
setInterval(weekly,1000);
 
 
 
 
function monthly()
{
    var monthboard = document.getElementById("Month");
    if(monthboard.style.display != "none")
    {
        var offset = -7;
        var countdowntime = new Date( new Date().getTime() + offset * 3600 * 1000).toUTCString().replace( / GMT$/, "" );
       
        var day = parseInt(countdowntime.substr(5, 2));
        var month = countdowntime.substr(8, 3);
        var year = parseInt(countdowntime.substr(12, 4));
        var pst = countdowntime.substr(17, 8);
       
        var sTimePST =  (parseInt(pst.substr(6,7))) + (parseInt(pst.substr(3,4))*60) + (parseInt(pst.substr(0,1))*60*60);
       
        var dsLeft = 59 - parseInt(pst.substr(6,2));
        var dmLeft = 59 - parseInt(pst.substr(3,2));
        var dhLeft = 19 - parseInt(pst.substr(0,2));
       
        if (dhLeft< 0)
        {
            dhLeft = 24 + dhLeft;    
        }
       
        var s10 = "";
        var m10 = "";
        var h10 = "";
       
        if (dsLeft < 10)
        {
            s10 = "0";
           
        }
        if (dmLeft <10)
        {
            m10 = "0";
           
        }
        if (dhLeft <10)
        {
            h10 = "0";
           
        }
        var actualtimer = h10 + (dhLeft).toString() + ":"+ m10 + (dmLeft).toString() + ":" + s10 + (dsLeft).toString();
       
        var month = (new Date( new Date().getTime() + offset * 3600 * 1000)).getMonth() + 1;
       
        var ndays = daysInMonth(month,year);
       
        day = ndays - day + 1;
        if (day == 1)
        {
            day = 0;
        }
       
        if( day > 9)
        {
            cursorLayer.width = 240;
        }
        if( day < 10)
        {
            cursorLayer.width = 230;
        }
       
        actualtimer = "Time until reset: " + day.toString() +":" + actualtimer;
        ctx.fillStyle="#FFFFFF";
        ctx.font="20px Hallo Sans Light";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
       
        ctx.fillText(actualtimer,1,20);
    }
   
   
}
setInterval(monthly,1000);
 
function center()
{
    cursorLayer.style.marginLeft = Math.round((window.innerWidth  / 2) - (cursorLayer.width /2)) +"px";
}
setInterval(center,30);