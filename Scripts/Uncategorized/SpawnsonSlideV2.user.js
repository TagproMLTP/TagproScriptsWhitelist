// ==UserScript==
// @name          TagPro Spectator Smooth Move
// @description   Move camera with wasd keys.
// @version       0.1
// @grant         none
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// ==/UserScript==

tagpro.ready(function init() {
    if (!tagpro.playerId || !tagpro.renderer.layers.foreground) return setTimeout(init, 200);
    if (!tagpro.spectator) return;
    
    var tr = tagpro.renderer,
        velocity = {x: 0, y: 0},
        last = 0,
        last2 = 0,
        speedMult = 100,
        oldSpeedMult = 100,
        speedMultText = null,
        press = {},
        directions = ['right', 'left', 'down', 'up'];
    
    document.onkeydown = function(e) {
        if (tagpro.viewport.followPlayer) return;
        for (var i = 0; i < 4; i++) {
            if (e.which !== tagpro.keys[directions[i]][1]) continue;
            press[directions[i]] = true;
            break;
        }
        if (e.which === tagpro.keys.down[0]) speedMult = Math.max(speedMult - 25, 25);
        if (e.which === tagpro.keys.up[0]) speedMult = Math.min(speedMult + 25, 500);
    };
    
    document.onkeyup = function(e) {
        if (tagpro.viewport.followPlayer) return;
        for (var i = 0; i < 4; i++) {
            if (e.which !== tagpro.keys[directions[i]][1]) continue;
            press[directions[i]] = false;
            break;
        }
    };
    
    tr.centerContainerToPoint = function (x, y) {
        if (!tagpro.viewport.followPlayer) {
            if (velocity.x < ((-2500 * tagpro.zoom) * (75 + speedMult / 4))) velocity.x = (-2500 * tagpro.zoom) * (75 + speedMult / 4);
            if (velocity.x > ((2500 * tagpro.zoom) * (75 + speedMult / 4))) velocity.x = (2500 * tagpro.zoom) * (75 + speedMult / 4);
            if (velocity.y < ((-2500 * tagpro.zoom) * (75 + speedMult / 4))) velocity.y = (-2500 * tagpro.zoom) * (75 + speedMult / 4);
            if (velocity.y > ((2500 * tagpro.zoom) * (75 + speedMult / 4))) velocity.y = (2500 * tagpro.zoom) * (75 + speedMult / 4);
            x = tagpro.viewport.source.x + velocity.x / 25000;
            y = tagpro.viewport.source.y + velocity.y / 25000;
        }
        var resizeScaleFactor = tr.options.disableViewportScaling ? 1 : (this.vpHeight / tr.canvas_height).toFixed(2);
        tr.gameContainer.x = this.vpWidth / 2 - (x / tagpro.zoom * resizeScaleFactor);
        tr.gameContainer.y = this.vpHeight / 2 - (y / tagpro.zoom * resizeScaleFactor);
        tagpro.viewport.source.x = x;
        tagpro.viewport.source.y = y;
    };
    
    function getVelocity(now) {
        var force = ((now - last) * speedMult) * tagpro.zoom,
            fric = force * 0.8;
        last = now;
        if (press.right) {
            velocity.x += force;
        } else {
            if (velocity.x > 0) {
                if (velocity.x - fric > 0) {
                    velocity.x -= fric;
                } else {
                    velocity.x = 0;
                }
            }
        }
        if (press.left) {
            velocity.x -= force;
        } else {
            if (velocity.x < 0) {
                if (velocity.x + fric < 0) {
                    velocity.x += fric;
                } else {
                    velocity.x = 0;
                }
            }
        }
        if (press.down) {
            velocity.y += force;
        } else {
            if (velocity.y > 0) {
                if (velocity.y - fric > 0) {
                    velocity.y -= fric;
                } else {
                    velocity.y = 0;
                }
            }
        }
        if (press.up) {
            velocity.y -= force;
        } else {
            if (velocity.y < 0) {
                if (velocity.y + fric < 0) {
                    velocity.y += fric;
                } else {
                    velocity.y = 0;
                }
            }
        }
    }
    
    tr.goodText = function(text, color, size) {
        return new PIXI.Text(text, {
            font: size || "20pt Arial",
            fill: color || "#FFFFFF",
            stroke: "#000000",
            strokeThickness: 3
        });
    };
    
    function drawSpeedMult(now) {
        var diff = (now - last2) / 1666;
        last2 = now;
        if (speedMult !== oldSpeedMult || !speedMultText) {
            if (!speedMultText) {
                speedMultText = tr.goodText(speedMult + '%');
                speedMultText.x = 50;
                speedMultText.y = 50;
                tr.layers.ui.addChild(speedMultText);
            } else {
                speedMultText.setText(speedMult + '%');
                speedMultText.alpha = 1;
            }
            oldSpeedMult = speedMult;
        }
        speedMultText.alpha = Math.max(speedMultText.alpha - diff, 0);
    }
    
    requestAnimationFrame(function frameRateLoop() {
        requestAnimationFrame(frameRateLoop);
        if (tagpro.viewport.followPlayer) {
            if (velocity.x || velocity.y) {
                for (var i = 0; i < 4; i++) {
                    press[directions[i]] = false;
                }
                velocity = {x: 0, y: 0};
            }
            if (!tagpro.keys.specPrev[0]) {
                tagpro.keys.specPrev[0] = 87;
                tagpro.keys.specBlueFC[0] = 83;
                tagpro.keys.specRedFC[0] = 65;
            }
        } else {
            if (tagpro.keys.specPrev[0]) {
                tagpro.keys.specPrev[0] = null;
                tagpro.keys.specBlueFC[0] = null;
                tagpro.keys.specRedFC[0] = null;
            }
            var now = performance.now();
            drawSpeedMult(now);
            getVelocity(now);
        }
    });
});