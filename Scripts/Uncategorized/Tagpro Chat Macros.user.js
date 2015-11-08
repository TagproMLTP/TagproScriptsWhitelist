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
    macros[83] = {"message": "DANK SNIPE BRO ︻̷┻̿═━一", "toAll": true}; // S
    macros[67] = {"message": "ಠ_ಠ OH BABY A CLAYGASM ಠ_ಠ", "toAll": true}; // C
    macros[72] = {"message": "I'm gonna hand it off!", "toAll": false}; // H
    macros[73] = {"message": "Left powerup spawning soon/now", "toAll": false}; // I
    macros[79] = {"message": "Mid powerup spawning soon/now", "toAll": false}; // O
    macros[80] = {"message": "Right powerup spawning soon/now", "toAll": false}; // P
    macros[81] = {"message": "Stop being a wanker ┌( ◕ 益 ◕ )ᓄ", "toAll": true}; // Q
    macros[88] = {"message": "^^ Cancel that ^^", "toAll": false}; // X
    macros[103] = {"message": "Enemy FC is top left", "toAll": false}; // numpad 7
    macros[100] = {"message": "Enemy FC is left", "toAll": false}; // numpad 4
    macros[97] = {"message": "Enemy FC is bottom left", "toAll": false}; // numpad 1
    macros[98] = {"message": "Enemy FC is bottom", "toAll": false}; // numpad 2
    macros[99] = {"message": "Enemy FC is bottom right", "toAll": false}; // numpad 3
    macros[101] = {"message": "Enemy FC is center", "toAll": false}; // numpad 5
    macros[102] = {"message": "Enemy FC is right", "toAll": false}; // numpad 6
    macros[104] = {"message": "Enemy FC is top", "toAll": false}; // numpad 8
    macros[105] = {"message": "Enemy FC is top right", "toAll": false}; // numpad 9
    macros[66] = {"message": "ᕦ( ͡° ͜ʖ ͡°)ᕤ Nice blocks ᕦ( ͡° ͜ʖ ͡°)ᕤ", "toAll": true}; // B

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