// ==UserScript==
// @name          TagPro Live Player Position
// @version       0.5
// @include       http://*.koalabeast.com:*
// @include       http://tagpro-*.koalabeast.com:*
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

    tr.render = function() {
        requestAnimationFrame(tr.render);
        tagpro.world.update();
        tr.updateGraphics();
        tagpro.ui.update();
        tr.renderer.render(tr.stage);
        tr.measurePerformance();
        tr.lastFrameTime=performance.now();
    };

    Box2D.Dynamics.b2Body.prototype.GetPosition = function() {
        if (!this.player || !this.player.id) {
            return this.m_xf.position;
        }
        if (!tagpro.players[this.player.id].pos) {
            tagpro.players[this.player.id].pos = this.m_xf.position;
        }
        return this.m_xf.position;
    };

    tr.updatePlayerSpritePosition = function(player) {
        upsp.apply(this, arguments);
        var position = player.pos || {x: player.x / 100, y: player.y / 100};
        player.sprite.x = position.x * 100;
        player.sprite.y = position.y * 100;
    };

    tr.centerContainerToPoint = function(x, y) {
        var r = tr.options.disableViewportScaling ? 1 : (this.vpHeight / tr.canvas_height).toFixed(2);
        if (tagpro.viewport.followPlayer) {
            var self = tagpro.players[tagpro.playerId];
            var position = self.pos || {x: self.x / 100, y: self.y / 100};
            x = position.x * 100 + 20;
            y = position.y * 100 + 20;
        }
        if (x <= -980 && y <= -980) {
            return;
        }
        tr.gameContainer.x = this.vpWidth / 2 - x / tagpro.zoom * r;
        tr.gameContainer.y = this.vpHeight / 2 - y / tagpro.zoom * r;
    };

    tr.updateCameraPosition = function() {
        tr.centerContainerToPoint();
    };
}
