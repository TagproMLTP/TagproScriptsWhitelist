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
    macros[89] = {"message": "enemy fc is TOP LEFT", "toAll": false}; // Y
    macros[85] = {"message": "enemy fc is TOP MIDDLE", "toAll": false}; // U
    macros[73] = {"message": "enemy fc is TOP RIGHT", "toAll": false}; // I
    macros[72] = {"message": "enemy fc is MIDDLE LEFT", "toAll": false}; // H
    macros[74] = {"message": "enemy fc is MIDDLE", "toAll": false}; // J
    macros[75] = {"message": "enemy fc is MIDDLE RIGHT", "toAll": false}; // K
    macros[78] = {"message": "enemy fc is BOTTOM LEFT", "toAll": false}; // N
    macros[77] = {"message": "enemy fc is BOTTOM MIDDLE", "toAll": false}; // M
    macros[188] = {"message": "enemy fc is BOTTOM RIGHT", "toAll": false}; // ,
    macros[48] = {"message": "0 enemies are in our base, come in quickly if you can", "toAll": false}; // 0
    macros[49] = {"message": "1 enemy is in our base, be careful when coming in", "toAll": false}; // 1
    macros[50] = {"message": "2 enemies are in our base, run away so we can kill them", "toAll": false}; // 2
    macros[51] = {"message": "3 enemies are in our base, stay on their side of the map", "toAll": false}; // 3
    macros[52] = {"message": "4 enemies are in our base, flee to their base", "toAll": false}; // 4
    macros[53] = {"message": "fc is 1", "toAll": false}; // 5
    macros[54] = {"message": "fc is 2", "toAll": false}; // 6
    macros[55] = {"message": "fc is 3", "toAll": false}; // 7
    macros[56] = {"message": "fc is 4", "toAll": false}; // 8
    macros[67] = {"message": "mb", "toAll": false}; // C
    macros[86] = {"message": "np", "toAll": false}; // V
    macros[88] = {"message": "ignore that, it was a typo", "toAll": false}; // X
    macros[82] = {"message": "i'll play d", "toAll": false}; // R
    macros[80] = {"message": "powerups are spawning soon, make sure to get them!", "toAll": false}; // P
    macros[190] = {"message": "enemy has a tagpro in our base", "toAll": false}; // .
    macros[191] = {"message": "enemy has a juke juice in our base", "toAll": false}; // /
    macros[186] = {"message": "enemy has a rolling bomb in our base", "toAll": false}; // ;

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