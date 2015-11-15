// ==UserScript==
// @name          TagPro Smooth Movement
// @version       0.1
// @include       http://*.koalabeast.com:*
// @include       http://*.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// @grant         none
// ==/UserScript==

(function init(initTime) {
    if (typeof tagpro === "undefined" || !tagpro.playerId) {
        if (Date.now() - initTime > 10000) return;
        return setTimeout(init, 100, initTime);
    }
    setTimeout(startFunction, 3000);
})(Date.now());

function startFunction() {
    var tr = tagpro.renderer;
    var upsp = tr.updatePlayerSpritePosition;
    
    tr.updatePlayerSpritePosition = function(player) {
        upsp.apply(this, arguments);
        player.sprite.x = player.x;
        player.sprite.y = player.y;
    };

    tr.centerContainerToPoint = function(x, y) {
        var r = tr.options.disableViewportScaling ? 1 : (this.vpHeight / tr.canvas_height).toFixed(2);
        if (tagpro.viewport.followPlayer) {
            var self = tagpro.players[tagpro.playerId];
            x = self.x + 20;
            y = self.y + 20;
        }
        if (x == -980 && y == -980) {
            return;
        }
        tr.gameContainer.x = this.vpWidth / 2 - x / tagpro.zoom * r;
        tr.gameContainer.y = this.vpHeight / 2 - y / tagpro.zoom * r;
    };

    tr.updateCameraPosition = function() {
        tr.centerContainerToPoint();
    };
}