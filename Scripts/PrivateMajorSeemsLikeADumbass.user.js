// ==UserScript==
// @name         PrivateMajor Seems Like A Dumbass
// @include      http://*.koalabeast.com:*
// @include      http://*.jukejuice.com:*
// @include      http://*.newcompte.fr:*
// @grant        none
// ==/UserScript==

function drawMessage() {
    var MESSAGE = "PrivateMajor Seems Like A Dumbass",
        messageText = tagpro.renderer.prettyText(MESSAGE);
    messageText.x = tagpro.renderer.canvas.width / 2 - messageText.width/2;
    messageText.y = tagpro.renderer.canvas.height - 15;
    tagpro.renderer.layers.ui.addChild(messageText);
}

(function init(startFunction, startTime) {
    if (Date.now() - startTime > 7500) {
        return console.log("Initialization timeout");
    }
    if (window.tagpro && tagpro.players && tagpro.players[tagpro.playerId]) {
        if (tagpro.spectator === false) {
            startFunction();
        } else if (tagpro.spectator === true) {
            tagpro.socket.on("spectator", function(e) {
                if (e === false) {
                    startFunction();
                }
            });
        }
    } else {
        setTimeout(init, 100, startFunction, startTime);
    }
})(drawMessage, Date.now());
