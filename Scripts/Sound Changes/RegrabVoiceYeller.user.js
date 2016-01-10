// ==UserScript==
// @name          Regrab voice yeller
// @version       1.0
// @include       http://*.koalabeast.com:*
// @include       http://*.jukejuice.com:*
// @include       http://*.newcompte.*
// @author        RonSpawnson
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// ==/UserScript==

var aboutTime = "https://drive.google.com/uc?export=download&id=0B_xZCL2l6cHlbm1pQ2FENi13Rms"
var getBack = "https://drive.google.com/uc?export=download&id=0B_xZCL2l6cHlNnVWWmdPeWdkeGs"

tagpro.ready(function() {
    var onRegrab = 0;
    var audio = null;

    setInterval(function(){
        // Locate flag of opposite team color
        var playerTeam = tagpro.players[tagpro.playerId].team;
        var targetFlag = "3.1";
        if (playerTeam == 1) {
            targetFlag = "4.1";
        }
        
        // Find target tile
        targetFlagX = 0;
        targetFlagY = 0;
        for (var x = 0; x < tagpro.map.length; x++) {
            for (var y = 0; y < tagpro.map[x].length; y++) {
                if (targetFlag == tagpro.map[x][y]) {
                    targetFlagX = x;
                    targetFlagY = y;
                }
            }
        }
        
        // Locate player's nearest x and y coordinate
        playerX = tagpro.players[tagpro.playerId].x / 40;
        playerY = tagpro.players[tagpro.playerId].y / 40;
        
        if (Math.abs(targetFlagX - playerX) <= 2 && Math.abs(targetFlagY - playerY) <= 2) {
            // They are on regrab. If they were previously not on regrab, congratulate them
            if (onRegrab == 0) {
                onRegrab = 1;
                if (audio != null) {
                    audio.pause();   
                }
                audio = new Audio(aboutTime);
                audio.play();
            }
        } else {
            // They are not on regrab. If they were previously on regrab, yell at them to get back to regrab
            if (onRegrab == 1) {
                onRegrab = 0;
                if (audio != null) {
                    audio.pause();   
                }
                audio = new Audio(getBack);
                audio.play();
            }
        }
    }, 100);
});
