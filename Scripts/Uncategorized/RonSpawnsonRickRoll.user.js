// ==UserScript==
// @name          TagPro RickRoll Script
// @namespace     http://www.reddit.com/user/ruarai/
// @description   'Help' your team with stupid name changes. Original by contact-lens-linux/steppin (?)
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*                      
// @license       GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author        ruarai + RonSpawnson
// @version       0.3
// ==/UserScript==
(function() {
    sessionStorage.setItem("index", 0);
    
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
        var macros = ["Never gonna","give you up","Never gonna","let you down","Never gonna","turn around","and hurt you"];
        //you can add more names as much as you want
        
        //you can change the interval, low intervals may not work though
        var tid = setInterval(mycode, 2500);
        function mycode() {
            var index = sessionStorage.getItem("index");
          	console.log("index is " + index);
            change(macros[index % macros.length]);
            sessionStorage.setItem("index", parseInt(index) + 1);
        }
        
        
        
        var lastMessage = 0;
        
        function change(Message) {
            console.log("message is " + Message);
            var limit = 500 + 10;
            var now = new Date();
            var timeDiff = now - lastMessage;
            if (timeDiff > limit) {
                tagpro.socket.emit("name", Message);
                lastMessage = new Date();
            } else if (timeDiff >= 0) {
                setTimeout(chat, limit - timeDiff, Message)
            }
                }
        
    }
    
    contentEval(actualScript);
})();