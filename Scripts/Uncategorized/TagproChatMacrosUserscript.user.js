// ==UserScript==
// @name          TagPro Chat Macros Userscript
// @namespace     http://www.reddit.com/user/contact_lens_linux/
// @description   Help your team with quick chat macros.
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://maptest.newcompte.fr:*
// @license       GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author        steppin, Watball
// @version       0.4
// ==/UserScript==
 
(function() {
 
  function contentEval(source) {
    // Check for function input.
    if ('function' == typeof source) {
      // Execute this function with no arguments, by adding parentheses.
      // One set around the function, required for valid syntax, and a
      // second empty set calls the surrounded function.
      source = '(' + source + ')();'
    }
 
    // Create a script node holding this  source code.
    var script = document.createElement('script');
    script.setAttribute("type", "application/javascript");
    script.textContent = source;
 
    // Insert the script node into the page, so it will run, and immediately
    // remove it to clean up.
    document.body.appendChild(script);
    document.body.removeChild(script);
  }
 
  function actualScript() {
    var macros = {};
    macros[49] = {"message": "I'm coming in one!", "toAll": false}; // 1
    macros[50] = {"message": "I'm coming in two!", "toAll": false}; // 2
    macros[51] = {"message": "I'm coming in three!", "toAll": false}; // 3
    macros[52] = {"message": "I'm coming in four!", "toAll": false}; // 4
    macros[53] = {"message": "I'm coming into base!", "toAll": false}; // 5
    macros[54] = {"message": "Return for cap!", "toAll": false}; // 6
    macros[55] = {"message": "I got regrab!", "toAll": false}; // 7
    macros[56] = {"message": "CAN YOU GET TOP BUTTON??", "toAll": false}; // 8
    macros[57] = {"message": "CAN YOU GET MID BUTTON??", "toAll": false}; // 9
    macros[48] = {"message": "CAN YOU GET BOTTOM BUTTON??", "toAll": false}; // 0
    macros[191] = {"message": "WHERE IS FC?", "toAll": false}; // /
    macros[87] = {"message": "I'm coming top!", "toAll": false}; // W
    macros[65] = {"message": "I'm coming left!", "toAll": false}; // A
    macros[83] = {"message": "I'm coming bottom!", "toAll": false}; // S
    macros[68] = {"message": "I'm coming right!", "toAll": false}; // D
    macros[81] = {"message": "Yes Gem", "toAll": false}; // Q
    macros[80] = {"message": "purple", "toAll": false}; // P
 
    // Game bindings overriding adapted from JohnnyPopcorn's NeoMacro https://gist.github.com/JohnnyPopcorn/8150909
    var handlerbtn = $('#macrohandlerbutton');
    handlerbtn.keydown(keydownHandler)
              .keyup(keyupHandler);
    handlerbtn.focus();
 
    $(document).keydown(documentKeydown);
    function documentKeydown(event) {
      if (!tagpro.disableControls) {
        handlerbtn.focus(); // The handler button should be always focused
      }
    }
 
    function keydownHandler(event) {
      var code = event.keyCode || event.which;
      if (code in macros && !tagpro.disableControls) {
        chat(macros[code]);
        event.preventDefault();
        event.stopPropagation();
        //console.log(macros[code]);
      }
    }
 
    function keyupHandler(event) {
      if (event.keyCode in macros && !tagpro.disableControls) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
 
    var lastMessage = 0;
    var active = false;
    function chat(chatMessage) {
      var limit = 500 + 10;
      var now = new Date();
      var timeDiff = now - lastMessage;
      if (timeDiff > limit) {
          tagpro.socket.emit("chat", chatMessage);
          lastMessage = new Date();
      } else if (timeDiff >= 0 && !active) {
          active = true;
          setTimeout(function(chatMessage) { chat(chatMessage); active = false }, limit - timeDiff, chatMessage);
      }
    }
  }
 
  // This dummy input will handle macro keypresses
  var btn = document.createElement("input");
  btn.style.opacity = 0;
  btn.style.position = "absolute";
  btn.style.top = "-100px";
  btn.style.left = "-100px";
  btn.id = "macrohandlerbutton";
  document.body.appendChild(btn);
 
  contentEval(actualScript);
})();