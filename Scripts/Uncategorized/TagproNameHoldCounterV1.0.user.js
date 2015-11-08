// ==UserScript==
// @name       		TagPro Name Hold Counter
// @version    		1.0
// @description  	Counts number of returns in your name
// @include		    http://tagpro-*.koalabeast.com:*
// @include		    http://tangent.jukejuice.com:*
// @include		    http://*.newcompte.fr:*
// @author		    RonSpawnson
// ==/UserScript==

tagpro.ready(function() {
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
        //you can change the interval, low intervals may not work though
        var tid = setInterval(mycode, 2500);
        function mycode() {
            var returns = tagpro.players[tagpro.playerId]["s-hold"];
            var lastWord = returns == 1 ? "Hold" : "HOLD";
            var msg = returns + " " + lastWord;
            change(msg);
        }
        
        
        
        var lastMessage = 0;
        
        function change(Message) {
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

});