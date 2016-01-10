// ==UserScript==
// @name          F1 disabler
// @version       0.2
// @description   This should prevent F1 from triggering help
// @include       http://tagpro-*.koalabeast.com*
// @author        TicTag
// ==/UserScript==

// get key stroke
var browser=navigator.userAgent;
document.onkeydown = keyHit;

// keystroke handling
function keyHit(event) { 

    // get correct keycode
    var keyStruck;
    keyStruck = event.keyCode;

    if (keyStruck == 112) {        
        event.preventDefault();    
      
    }

}