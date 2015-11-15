// ==UserScript==
// @name          Map Keys to Switch Teams and Toggle Music
// @version       0.1
// @include       http://*.koalabeast.com:*
// @include       http://*.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// @author        ballparts
// ==/UserScript==

//////// Define KeyCodes Here /////////

// I used this site to get key codes: http://keycodes.atjayjo.com/

// KeyCode for switch teams
var switchTeamsKeyCode = 90;

// KeyCode for music toggle
var soundToggleKeyCode = 88;

///////////////////////////////////////


function waitForInitialized(fn) {
    if (!tagpro) {
        setTimeout(function() {
            waitForInitialized(fn);
        }, 10);
    } else {
        fn();
    }
}

waitForInitialized(function() {
    tagpro.ready(function() {
        document.onkeydown = function(e) {
            if($('#chat').css('display') !== "block") {
                if(e.keyCode == switchTeamsKeyCode) {
                    $('#switchButton').click();
                    return;
                }

                if(e.keyCode == soundToggleKeyCode) {
                    $('#soundEffects').click();
                    return;
                }
            }
        }
    });
});