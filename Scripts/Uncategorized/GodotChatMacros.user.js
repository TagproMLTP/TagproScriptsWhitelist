// ==UserScript==
// @name          TagPro Chat Macros Userscript
// @namespace     http://www.reddit.com/user/contact_lens_linux/
// @description   Help your team with quick chat macros.
// @include       http://tagpro-*.koalabeast.com:*
// @license       GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author        steppin, Watball
// @version       0.3
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
    //macros[89] = "Coming into base with flag! Please set up blocks if you can."; // Y
    macros[67] = "Base is clear!"; // C
    macros[81] = "FC is top left ↖↖↖"; // Q
    macros[87] = "FC is top ↑↑↑"; // W
    macros[69] = "FC is top right ↗↗↗"; // E
    macros[49] = "1 enemy in base"; // 1
    macros[50] = "2 enemies in base"; // 2
    macros[51] = "3 enemies in base"; // 3
    macros[52] = "2 on offense, 2 on defense is the best way to go!"; // 4
    macros[65] = "FC is left ← ← ←"; // A
    macros[83] = "FC is middle"; // S
    macros[68] = "FC is right → → →"; // D
    macros[90] = "FC is bottom left ↙↙↙"; // Z
    macros[88] = "FC is bottom ↓↓↓"; // X
    macros[86] = "FC is bottom right ↘↘↘"; // V
    macros[82] = "Get ready for regrab!"; // R
    macros[70] = "Incoming enemy tagpro"; // F
    macros[66] = "Get the button please!"; // B
    macros[72] = "Enemy Flag Carrier is past 3. Don't die if you can!"; // H
    macros[80] = "Powerups should be spawning soon!"; // P





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

    // Prevent TagPro binds from firing on the same stuff as we have bound
    function keyupHandler(event) {
      if (event.keyCode in macros && !tagpro.disableControls) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    var lastMessage = 0;

    function chat(chatMessage) {
      var limit = 500 + 10;
      var now = new Date();
      var timeDiff = now - lastMessage;
      if (timeDiff > limit) {
          tagpro.socket.emit("chat", {
            message: chatMessage,
            toAll: 0
          });
          lastMessage = new Date();
      } else if (timeDiff >= 0) {
          setTimeout(chat, limit - timeDiff, chatMessage)
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