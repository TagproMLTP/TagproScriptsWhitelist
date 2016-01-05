// ==UserScript==
// @name       		TagPro Name Return Counter
// @version    		1.0
// @description  	Counts number of returns in your name
// @include		    http://tagpro-*.koalabeast.com:*
// @include		    http://tangent.jukejuice.com:*
// @include		    http://*.newcompte.fr:*
// @author		    RonSpawnson
// ==/UserScript==
function addToTagproReady(fn) {
    // Make sure the tagpro object exists.
    if (typeof tagpro !== "undefined") {
        tagpro.ready(fn);
    } else {
        // If not ready, try again after a short delay.
        setTimeout(function() {
            addToTagproReady(fn);
        }, 0);
    }
}

addToTagproReady(function() {
    function updateName() {
        var returns = tagpro.players[tagpro.playerId]["s-returns"];
        var lastWord = returns == 1 ? "return" : "returns";
        var msg = returns + " " + lastWord;
        console.log("new update");
        tagpro.socket.emit("name", msg);
    }

    function changeName() {
        if (tagpro.players != null && tagpro.players[tagpro.playerId] != null && tagpro.players[tagpro.playerId]["s-returns"] != null) {
            var currentName = tagpro.players[tagpro.playerId]["name"];
            var returns = tagpro.players[tagpro.playerId]["s-returns"];
            var lastWord = returns == 1 ? "return" : "returns";
            var msg = returns + " " + lastWord;
            if (currentName != msg) {
                console.log("changing name");
            }
        }
    }

    function inArray(needle,haystack) {
        var count=haystack.length;
        for(var i=0;i<count;i++) {
            if(haystack[i]===needle){return true;}
        }
        return false;
    }
    
    movementKeys = [87, 65, 83, 68, 37, 38, 39, 40];
    document.body.addEventListener('keydown', function (e) {
        if (!inArray(e.keyCode, movementKeys)) {
            updateName();
        }
    });
});