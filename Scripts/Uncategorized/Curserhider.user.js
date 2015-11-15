// ==UserScript==
// @name          TagPro Cursor Hider
// @namespace     http://www.reddit.com/u/undergroundmonorail
// @description   Hides the cursor after a specified amount of time with no movement
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://maptest.newcompte.fr:*
// @include       http://justletme.be:*
// @license       WTFPL; http://www.wtfpl.net/txt/copying/
// @author        monorail
// @version       0.2
// ==/UserScript==


// The number of milliseconds your mouse has to be idle before it is hidden
// Default: 500
var WAIT_TIME = 500;

// The number of milliseconds between each time the script checks if you are idle
// (This can probably stay at the default honestly)
// Default: 100
var CHECK_FREQ = 100;

(function() {
    var lastmove;
    window.onmousemove = handleMouseMove;
    function handleMouseMove(event) {
        lastmove = +new Date();
        document.body.style.cursor = 'auto';
    }
    
    setInterval(function() {
        if (+new Date() - lastmove >= WAIT_TIME) {
            document.body.style.cursor = 'none';
        }
    }, CHECK_FREQ);
})();