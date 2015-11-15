// ==UserScript==
// @name          TagProGO
// @namespace     http://www.reddit.com/u/SuperSans
// @description   Plays the "Go" sound on late game join
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://maptest.newcompte.fr:*
// @include       http://justletme.be:*
// @license       WTFPL; http://www.wtfpl.net/txt/copying/
// @author        SuperSans
// @version       1.0
// ==/UserScript==


var goSound = new Audio("http://tagpro-origin.koalabeast.com/sounds/go.mp3");
function playSound() {
        goSound.play();
}
    
function getGameEnd() {
    var d = new Date();
    var n = d.getTime();
    var end = tagpro.gameEndsAt;
    var endTime = end.getTime();
    var difference = endTime-n;
    if (difference < 720000 && difference > 20000){
        playSound();
}
}
window.onload = function(){getGameEnd()};