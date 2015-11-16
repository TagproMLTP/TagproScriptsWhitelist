// ==UserScript==
// @name          Arbybear's Macros
// @namespace     http://www.reddit.com/user/contact_lens_linux/
// @description   Help your team with quick chat macros.
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:* 
// @include       http://*.newcompte.fr:* 
// @license       GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author        steppin, Watball
// @version       0.4
// @noframes
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
    macros[82] = {"message": "I need another defender at base.", "toAll": false}; // R
    macros[67] = {"message": "Chase the enemy FC.", "toAll": false}; // C
    macros[72] = {"message": "I did not mean to send those last macros.", "toAll": false}; // H
    macros[89] = {"message": "I will play defense.", "toAll": false}; // Y
    macros[70] = {"message": "Enemy FC has a Rolling Bomb.", "toAll": false}; // F
    macros[86] = {"message": "We only need 2 defenders, please.", "toAll": false}; // V
    macros[74] = {"message": "Staying between the enemy flag carrier and his flag", "toAll": false}; // J
    macros[75] = {"message": "is the most important concept in TagPro.", "toAll": false}; // K
    macros[76] = {"message": " ", "toAll": false}; // L
    macros[85] = {"message": "Fellow defender: Please don't sit on the flag;", "toAll": false}; // U
    macros[73] = {"message": "It is easy for the enemy offence to grab from you.", "toAll": false}; // I
    macros[79] = {"message": "Offense: Please don't push defenders out of the way when you spawn", "toAll": false}; // O
    macros[66] = {"message": "Please be sure to cover the button.", "toAll": false}; // B
    macros[78] = {"message": "Our base is CLEAR.", "toAll": false}; // N
    macros[77] = {"message": "Our base is NOT clear.", "toAll": false}; // M
    macros[96] = {"message": "Where is the enemy FC?", "toAll": false}; // numpad 0
    macros[49] = {"message": "TIL The singer of Peanut Butter Jelly Time died in an" , "toAll": true}; // 1
    macros[50] = {"message": "11 hour police standoff during which time his brother-in-law" , "toAll": true}; // 2
    macros[51] = {"message": "Snoop Dogg attempted to calm him down and surrender.", "toAll": true}; // 3
      macros[52] = {"message": "Who will get the regrab?", "toAll": false}; // 4
    macros[53] = {"message": "I'm hamezy look at me I overuse my macros.", "toAll": true}; // 5
    macros[54] = {"message": "Ready to crank up the dank?", "toAll": true}; // 6
    macros[55] = {"message": "Ready to drink up the pink?", "toAll": true}; // 7
    macros[56] = {"message": "Ready to crunk up the funk?", "toAll": true}; // 8
    macros[57] = {"message": "Ready to zonk up the wonk?", "toAll": true}; // 9
    macros[188] = {"message": "Offense: Please take power ups on your way out of base.", "toAll": false}; // ,
    macros[80] = {"message": "Power ups spawn within 15 seconds", "toAll": false}; // P
    macros[106] = {"message": "Please do not waste boosts; they are important for defense.", "toAll": false}; // multiply
    macros[219] = {"message": "Please do not boost into me while I'm on defense", "toAll": false}; // [
    macros[81] = {"message": "Nice", "toAll": false}; // Q
    macros[189] = {"message": "If the enemy FC has a Rolling Bomb and you are near their flag,", "toAll": false}; // -
    macros[187] = {"message": "try to grab the flag and escape.", "toAll": false}; // =
    macros[48] = {"message": "I have regrab.", "toAll": false}; // 0
    macros[220] = {"message": "The pizza is aggressive.", "toAll": true}; // \
    macros[221] = {"message": "I am the one who danks.", "toAll": true}; // ]
    macros[109] = {"message": "Someone always has to stay on regrab.", "toAll": false}; // subtract
    macros[107] = {"message": "Enemy RB defused or expired.", "toAll": false}; // add
    macros[110] = {"message": "Please have patience when trying to cap the flag.", "toAll": false}; // decimal point
    macros[103] = {"message": "Enemy FC is ---Top-Left---", "toAll": false}; // numpad 7
    macros[104] = {"message": "Enemy FC is ---Top---", "toAll": false}; // numpad 8
    macros[105] = {"message": "Enemy FC is ---Top-Right---", "toAll": false}; // numpad 9
    macros[100] = {"message": "Enemy FC is ---Left---", "toAll": false}; // numpad 4
    macros[101] = {"message": "Enemy FC is ---Center---", "toAll": false}; // numpad 5
    macros[102] = {"message": "Enemy FC is ---Right---", "toAll": false}; // numpad 6
    macros[97] = {"message": "Enemy FC is ---Bottom-Left---", "toAll": false}; // numpad 1
    macros[98] = {"message": "Enemy FC is ---Bottom---", "toAll": false}; // numpad 2
    macros[99] = {"message": "Enemy FC is ---Bottom-Right---", "toAll": false}; // numpad 3

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