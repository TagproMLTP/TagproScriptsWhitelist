// ==UserScript==
// @name          TagPro Chat (Group) Macros Userscript
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
    macros[188] = "Nothing to be done."; // ,
    macros[190] = "I'm beginning to come round to that opinion."; // ,
    macros[78] = "Nice one! =)"; // N



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
            toAll: 1
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