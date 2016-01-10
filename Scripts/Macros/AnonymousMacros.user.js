// ==UserScript==
// @name          TagPro Chat Macros Userscript
// @namespace     http://www.reddit.com/user/contact_lens_linux/
// @description   Help your team with quick chat macros.
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:* 
// @include       http://maptest*.newcompte.fr:* 
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
    macros[55] = {"message": "FC is Top Left", "toAll": false}; // 7
    macros[56] = {"message": "FC is Top Mid", "toAll": false}; // 8
    macros[57] = {"message": "FC is Top Right", "toAll": false}; // 9
    macros[52] = {"message": "FC is Left", "toAll": false}; // 4
    macros[53] = {"message": "FC is Mid", "toAll": false}; // 5
    macros[54] = {"message": "FC is Right", "toAll": false}; // 6
    macros[49] = {"message": "FC is Bottom Left", "toAll": false}; // 1
    macros[50] = {"message": "FC is Bottom Mid", "toAll": false}; // 2
    macros[51] = {"message": "FC is Bottom Right", "toAll": false}; // 3
    macros[48] = {"message": "FC is contained in base", "toAll": false}; // 3
    macros[66] = {"message": "On regrab", "toAll": false}; // B
    macros[78] = {"message": "Someone get regrab", "toAll": false}; // N
    macros[75] = {"message": "Our FC is coming into base! Block!", "toAll": false}; // K
    macros[74] = {"message": "Their FC is coming into base!", "toAll": false}; // J
    macros[81] = {"message": "Lane 1", "toAll": false}; // Q
    macros[87] = {"message": "Lane 2", "toAll": false}; // W
    macros[69] = {"message": "Lane 3", "toAll": false}; // E
    macros[82] = {"message": "Lane 4", "toAll": false}; // R
    macros[77] = {"message": "My bad", "toAll": false}; // M
    macros[80] = {"message": "Base Clear", "toAll": false}; // P
    macros[89] = {"message": "1 Enemy in Base", "toAll": false}; // Y
    macros[85] = {"message": "2 Enemies in Base", "toAll": false}; // U
    macros[73] = {"message": "3 Enemies in Base", "toAll": false}; // I
    macros[79] = {"message": "4 Enemies in Base", "toAll": false}; // O
    macros[76] = {"message": "Powerups soon!", "toAll": false}; // L
    macros[90] = {"message": "get juked eashy", "toAll": true}; // Z

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