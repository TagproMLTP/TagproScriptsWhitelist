// ==UserScript==
// @name          Time On Ball
// @version       0.1
// @include       http://*.koalabeast.com:*
// @include       http://*.jukejuice.com:*
// @include       http://*.newcompte.*
// @author        ballparts & Flail
// ==/UserScript==
 
 
////////////////////////////
// USER DEFINED VARIABLES //
////////////////////////////
 
// Color of text - can be hex value or color name (e.g., "white")
var TEXTCOLOR = "white";
 
// Opacity of text - 0 is transparent, 1 is opaque
var TEXTOPACITY = 0.7;
 
// Size of the timer text font in pixels
var TEXTSIZE = 15;
 
// Where should the text be centered horizontally:
//   0 : all the way to the left
//   1 : all the way to the right
var TEXTLOCATION_HOR = 0.5025;
 
// Where should the text be placed vertically:
//   0 : all the way at the top
//   1 : all the way at the bottom
var TEXTLOCATION_VER = 0.49;
 
////////////////////////////////
// END USER DEFINED VARIABLES //
////////////////////////////////
 
 
 
 
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
 
    //////////////////////
    // TIMER TEXT SETUP //
    //////////////////////
 
    // SET UP TEXT FOR TIMER
    var timerText = tagpro.renderer.prettyText('', TEXTCOLOR);
 
    // Set up text style
    var textStyle = timerText.style;
    textStyle.align = "center";
    textStyle.fill =  TEXTCOLOR;
    textStyle.font = "bold " + TEXTSIZE + "pt Arial";
 
    // set opacity
    timerText.alpha = TEXTOPACITY;
 
    // settings object
    var textSettings = {
        TEXTLOCATION_HOR: TEXTLOCATION_HOR,
        TEXTLOCATION_VER: TEXTLOCATION_VER
    };
 
 
    function updateTimerStyle(timerText, newValue, textSettings) {
        // set text value
        timerText.setText(newValue);
 
        // set location of text
        timerText.x = tagpro.renderer.canvas.width * textSettings.TEXTLOCATION_HOR - timerText.width/2;
        timerText.y = tagpro.renderer.canvas.height * textSettings.TEXTLOCATION_VER;
    }
 
    //////////////////////////
    // END TIMER TEXT SETUP //
    //////////////////////////
 
 
    function getTimerText() {
        //var timeSinceLastUpdate = (Date.now() - lastUpdateTime) / 1000;
        //var newTimerText = timeSinceLastUpdate >= 20 ? 30 - Math.floor(timeSinceLastUpdate) : '';
        //return newTimerText;
        var millis = Math.max(0, tagpro.gameEndsAt - Date.now());
        var seconds = Math.floor((millis/1000))%60;
        if (seconds >= 0 && seconds <= 9) {
            return '0' + seconds;
        }
        return seconds;
    }
 
    // add text sprite to TagPro's UI layer
    tagpro.renderer.layers.ui.addChild(timerText);
 
 
    // update timer text
    requestAnimationFrame(function updateTimerText() {
        requestAnimationFrame(updateTimerText);
        var newValue = getTimerText();
        updateTimerStyle(timerText, newValue, textSettings);
    });
    });
});