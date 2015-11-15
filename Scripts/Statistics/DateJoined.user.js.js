// ==UserScript==
// @name          Date Joined
// @version       0.3
// @description   Displays date joined on profile pages.
// @author        Dr Krieger
// @namespace     http://www.reddit.com/u/TagProKrieger
// @license       GPL v3
// @include       http://*.koalabeast.com/profile/*
// @include       http://*.jukejuice.com/profile/*
// @include       http://tagproandluckyspammersucksandunfortunatesniperisawesome.com/profile/*
// ==/UserScript==

var timeThen = new Date(1000*parseInt(document.URL.substring(document.URL.lastIndexOf("/")+1,document.URL.lastIndexOf("/")+9),16)), now = new Date(Date.now());
var thenArray = [timeThen.getUTCFullYear(),timeThen.getUTCMonth(),timeThen.getUTCDate(),timeThen.getUTCHours(),timeThen.getUTCMinutes(),timeThen.getUTCSeconds(),timeThen.getUTCMilliseconds()], nowArray = [now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate(),now.getUTCHours(),now.getUTCMinutes(),now.getUTCSeconds(),now.getUTCMilliseconds()];
var monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"], monthDays = [31,0,31,30,31,30,31,31,30,31,30,31];
var thenString = ("0"+timeThen.getDate()).substr(-2,2)+" "+monthNames[timeThen.getMonth()]+" "+timeThen.getFullYear()+" "+("0"+timeThen.getHours()).substr(-2,2)+":"+("0"+timeThen.getMinutes()).substr(-2,2)+":"+("0"+timeThen.getSeconds()).substr(-2,2);
var timeDiff = [0,0,0,0,0,0,0], units = [0,12,0,24,60,60,1000], unitLabels = ["year","month","day","hour","minute","second","millisecond"];

for (var i=thenArray.length-1; i>-1; i--) {
    timeDiff[i] += nowArray[i] - thenArray[i];
    if (timeDiff[i] < 0) {
        timeDiff[i-1]--;
        if (i !== 2) timeDiff[i] += units[i];
        else if (nowArray[1] !== 2) timeDiff[i] += monthDays[(nowArray[1]+11)%12];
        else if (nowArray[0] % 4) timeDiff[i] += 28;
        else if (nowArray[0] % 100) timeDiff[i] += 29;
        else if (nowArray[0] % 400) timeDiff[i] += 28;
        else timeDiff[i] += 29;
    }
}

for (var i=0; i<timeDiff.length; i++) {
    if (timeDiff[i]) {
        var ago = timeDiff[i]+" "+unitLabels[i];
        if (timeDiff[i] !== 1) ago += "s";
        break;
    }
}

var unknownStart = new Date(2014,0,8,15,54,51,0), unknownEnd = new Date(2014,0,11,14,35,7,0);
if (timeThen.getTime() < unknownStart.getTime() || timeThen.getTime() >= unknownEnd.getTime()) $("body > article > h3").append("<div style='font-size: 35%' title='"+thenString+"'>Joined "+ago+" ago.</div>");
else $("body > article > h3").append("<div style='font-size: 35%' title='"+thenString+" or earlier'>Joined at an unknown time.</div>");