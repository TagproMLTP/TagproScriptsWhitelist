
// ==UserScript==
// @name Background flag notifications
// @author eagles, happy, and Kimba
// @include http://*.koalabeast.com:*
// @include http://*.jukejuice.com:*
// @version 1.0
// ==/UserScript==

USE_SOLID_COLORS = false;

var color = 0,
  red = 0,
  green = 0,
  blue = 0,
  maxColor = 127,
  flags = {},
  oldCSS = "",
  css = "";
  flagHeld = 0,
  lastFlagHeld = 0;

// Blue CSS
var blueCSS = {
  background: "#00007f", /* Old browsers */
  background: "-moz-radial-gradient(center, ellipse cover, #00007f 33%, #000000 99%)", /* FF3.6+ */
  background: "-webkit-gradient(radial, center center, 0px, center center, 100%, color-stop(33%,#00007f), color-stop(99%,#000000))", /* Chrome,Safari4+ */
  background: "-webkit-radial-gradient(center, ellipse cover, #00007f 33%,#000000 99%)", /* Chrome10+,Safari5.1+ */
  background: "-o-radial-gradient(center, ellipse cover, #00007f 33%,#000000 99%)", /* Opera 12+ */
  background: "-ms-radial-gradient(center, ellipse cover, #00007f 33%,#000000 99%)", /* IE10+ */
  background: "radial-gradient(ellipse at center, #00007f 33%,#000000 99%)", /* W3C */
  filter: "progid:DXImageTransform.Microsoft.gradient( startColorstr='#00007f', endColorstr='#000000',GradientType=1 )", /* IE6-9 fallback on horizontal gradient */
}

// Red CSS
var redCSS = {
  background: "#7f0000", /* Old browsers */
  background: "-moz-radial-gradient(center, ellipse cover, #7f0000 33%, #000000 99%)", /* FF3.6+ */
  background: "-webkit-gradient(radial, center center, 0px, center center, 100%, color-stop(33%,#7f0000), color-stop(99%,#000000))", /* Chrome,Safari4+ */
  background: "-webkit-radial-gradient(center, ellipse cover, #7f0000 33%,#000000 99%)", /* Chrome10+,Safari5.1+ */
  background: "-o-radial-gradient(center, ellipse cover, #7f0000 33%,#000000 99%)", /* Opera 12+ */
  background: "-ms-radial-gradient(center, ellipse cover, #7f0000 33%,#000000 99%)", /* IE10+ */
  background: "radial-gradient(ellipse at center, #7f0000 33%,#000000 99%)", /* W3C */
  filter: "progid:DXImageTransform.Microsoft.gradient( startColorstr='#7f0000', endColorstr='#000000',GradientType=1 )", /* IE6-9 fallback on horizontal gradient */
}
// Purple CSS
var purpleCSS = {
  background: "#7f007f", /* Old browsers */
  background: "-moz-radial-gradient(center, ellipse cover, #7f007f 33%, #000000 99%)", /* FF3.6+ */
  background: "-webkit-gradient(radial, center center, 0px, center center, 100%, color-stop(33%,#7f007f), color-stop(99%,#000000))", /* Chrome,Safari4+ */
  background: "-webkit-radial-gradient(center, ellipse cover, #7f007f 33%,#000000 99%)", /* Chrome10+,Safari5.1+ */
  background: "-o-radial-gradient(center, ellipse cover, #7f007f 33%,#000000 99%)", /* Opera 12+ */
  background: "-ms-radial-gradient(center, ellipse cover, #7f007f 33%,#000000 99%)", /* IE10+ */
  background: "radial-gradient(ellipse at center, #7f007f 33%,#000000 99%)", /* W3C */
  filter: "progid:DXImageTransform.Microsoft.gradient( startColorstr='#7f007f', endColorstr='#000000',GradientType=1 )", /* IE6-9 fallback on horizontal gradient */
}

// Grey CSS
var greyCSS = {
  background: "#636363", /* Old browsers */
  background: "-moz-radial-gradient(center, ellipse cover, #636363 33%, #000000 99%)", /* FF3.6+ */
  background: "-webkit-gradient(radial, center center, 0px, center center, 100%, color-stop(33%,#636363), color-stop(99%,#000000))", /* Chrome,Safari4+ */
  background: "-webkit-radial-gradient(center, ellipse cover, #636363 33%,#000000 99%)", /* Chrome10+,Safari5.1+ */
  background: "-o-radial-gradient(center, ellipse cover, #636363 33%,#000000 99%)", /* Opera 12+ */
  background: "-ms-radial-gradient(center, ellipse cover, #636363 33%,#000000 99%)", /* IE10+ */
  background: "radial-gradient(ellipse at center, #636363 33%,#000000 99%)", /* W3C */
  filter: "progid:DXImageTransform.Microsoft.gradient( startColorstr='#636363', endColorstr='#000000',GradientType=1 )", /* IE6-9 fallback on horizontal gradient */
}

var yellowCSS = {
  background: "#d1960c", /* Old browsers */
  background: "-moz-radial-gradient(center, ellipse cover, #d1960c 34%, #000000 99%)", /* FF3.6+ */
  background: "-webkit-gradient(radial, center center, 0px, center center, 100%, color-stop(34%,#d1960c), color-stop(99%,#000000))", /* Chrome,Safari4+ */
  background: "-webkit-radial-gradient(center, ellipse cover, #d1960c 34%,#000000 99%)", /* Chrome10+,Safari5.1+ */
  background: "-o-radial-gradient(center, ellipse cover, #d1960c 34%,#000000 99%)", /* Opera 12+ */
  background: "-ms-radial-gradient(center, ellipse cover, #d1960c 34%,#000000 99%)", /* IE10+ */
  background: "radial-gradient(ellipse at center, #d1960c 34%,#000000 99%)", /* W3C */
  filter: "progid:DXImageTransform.Microsoft.gradient( startColorstr='#d1960c', endColorstr='#000000',GradientType=1 )", /* IE6-9 fallback on horizontal gradient */
}

/**************************************/
var FlashDuration = 250;
var rgbaBlue = "255,255,255,";//"0,0,200,";
var rgbaRed = "255,255,255,";//"200,0,0,";
var rgbaWhite = "255,255,255,";
var OverlayOpacity = "0.80";
 
// set up CSS for blue red and transparent overlays
var transparentOverlay = {
        height:"1%",
        width:"100%",
        position:"fixed",
//        display:"none",
        left:0,
        top:0,
//        z-index: 10,
        background:"rgba(0,0,0,0)"
}

var blueFlagGrabOverlay = {
        height:"40%",
        width:"40%",
        position:"fixed",
//        display:"inline",
        left:"60%",
        top:0,
//        z-index:10,
        background:"rgba(".concat(rgbaBlue,OverlayOpacity,")")
}

var blueFlagDropOverlay = {
        height:"40%",
        width:"40%",
        position:"fixed",
//        display:"inline",
        left:"60%",
        top:"60%",
//        z-index: 10,
        background:"rgba(".concat(rgbaBlue,OverlayOpacity,")")//background:"rgba(0,0,200,0.02)"
}
 
var redFlagGrabOverlay = {
        height:"40%",
        width:"40%",
        position:"fixed",
//        display:"inline",
        left:0,
        top:0,
//        z-index: 10,
        background:"rgba(".concat(rgbaRed,OverlayOpacity,")")//background:"rgba(200,0,0,0.02)"
}

var redFlagDropOverlay = {
        height:"40%",
        width:"40%",
        position:"fixed",
//        display:"inline",
        left:0,
        top:"60%",
//        z-index: 10,
        background:"rgba(".concat(rgbaRed,OverlayOpacity,")")
}

// change overlay to either blue or red, then revert overlay to transparent
function flashColor(c) {
  var css;
  if (c == 'redGrab') css = redFlagGrabOverlay;
  else if (c == 'redDrop') css = redFlagDropOverlay;
  else if (c == 'blueGrab') css = blueFlagGrabOverlay;
  else if (c == 'blueDrop') css = blueFlagDropOverlay;
  else css = transparentOverlay;
  
  //css = c == 'red' ? redOverlay : blueOverlay;
  $('.overlay').css(css)
  setTimeout(function(){$('.overlay').css(transparentOverlay)}, FlashDuration);
}

// states = ["NoHold", "RedHold", "BlueHold", "BothHold"];
var currentState = "NoHold";
var previousState = "NoHold";

function getCurrentState(redIsHoldingFlag, blueIsHoldingFlag) {
  if (!redIsHoldingFlag && !blueIsHoldingFlag) return "NoHold";
  if (redIsHoldingFlag && !blueIsHoldingFlag) return "RedHold";
  if (!redIsHoldingFlag && blueIsHoldingFlag) return "BlueHold";
  if (redIsHoldingFlag && blueIsHoldingFlag) return "BothHold";
}

/***********************************/

init();

function init(){

  $("html").css("background-color", "#000000");
  $("html").css("background", "#000000");

/***********************************/
  // add div overlay element to webpage
var overlay = '<div class="overlay"></div>'
$('body').find('#sound').after(overlay);
/*********************************************/
  
  if (!tagpro.map)
    return setTimeout(function(){init();},0);

  checkPlayers();

  tagpro.socket.on("p", function(message) {
    if(!Array.isArray(message)) {
      message = [message];
    }
    for (var i = 0; i < message.length; i++) {
      var data = message[i].u;

      if(data !== undefined) {
        for(var j = 0; j < data.length; j++) {
          if(data[j].flag || typeof data[j].flag == "object") {
            flagHeld = 1;
            checkPlayers();
          }
        }
      }    }
    if(!flagHeld && lastFlagHeld) {
      setColor(0,0,0);
    }
    lastFlagHeld = flagHeld;
  });
}

function checkPlayers() {
  red = 0,
  green = 0,
  blue = 0;
  for (var id in tagpro.players) {
    var player = tagpro.players[id];
    if (player.flag) 
	{
		red = player.flag == 2 ? maxColor : red;
		blue = player.flag == 1 ? maxColor : blue;
		red = (player.team == 1 && player.flag == 3) ? maxColor : red;
		blue = (player.team == 2 && player.flag == 3) ? maxColor : blue;
}
  }

  var newColor = red + "," + green + "," + blue;
  if (color != newColor ){
    color = newColor;
    setColor(red,green,blue);
  }
}

function setColor(red,green,blue){
  if(USE_SOLID_COLORS) {
    colorString = "#";
    colorString += ("0"+(red.toString(16))).slice(-2);
    colorString += ("0"+(green.toString(16))).slice(-2);
    colorString += ("0"+(blue.toString(16))).slice(-2);

    $("html").css("background-color", colorString);
    $("html").css("background", colorString);
  }
  else
  {
      currentState = getCurrentState(red, blue);
    
      if(red && blue) 
      {
        if (previousState == "RedHold") flashColor('blueGrab');
        if (previousState == "BlueHold") flashColor('redGrab');
        if (previousState == "NoHold") {flashColor('blueGrab'); flashColor('redGrab');}
        css = purpleCSS;
      }
      else if (red) 
      {
        if (previousState == "NoHold") flashColor('redGrab');
        if (previousState == "BothHold") flashColor('blueDrop');
        if (previousState == "BlueHold") {flashColor('blueDrop'); flashColor('redGrab');}
        css = redCSS;
      }
      else if (blue)
      {
        if (previousState == "NoHold") flashColor('blueGrab');
        if (previousState == "BothHold") flashColor('redDrop');
        if (previousState == "RedHold") {flashColor('redDrop'); flashColor('blueGrab');}
        css = blueCSS;
      }
	    else if (green) 
      {
	      css = yellowCSS;
	    }
      else 
      {
        if (previousState == "RedHold") flashColor('redDrop');
        if (previousState == "BlueHold") flashColor('blueDrop');
        if (previousState == "BothHold") {flashColor('blueDrop'); flashColor('redDrop');}
        css = greyCSS;
      }
      $("html").css(css);
    
      previousState = currentState;
  }
}
