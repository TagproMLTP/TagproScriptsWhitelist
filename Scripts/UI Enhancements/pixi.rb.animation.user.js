// ==UserScript==
// @name		  Rolling Bomb Animation Speed
// @namespace     github.com/karlding
// @description   Allows you to control the speed of the Rolling Bomb "flicker"
// @include       http://*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://maptest.newcompte.fr:*
// @license       GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author        Karl Ding
// @copyright     2014+, 0K
// @version       0.1
// ==/UserScript==

var increaseFactor = 2; // change this to how many times faster you'd like the animation


tagpro.ready(function() {
    var tr = tagpro.renderer;
    tr.updateRollingBomb = function (player) {
        /* Updates whether a player should have rolling bomb.*/
        if (player.bomb) {
            if (!player.sprites.bomb) {
                if (!tr.options.disableParticles) {
                    player.sprites.rollingBomb = new cloudkid.Emitter(
                        player.sprites.ball,
                        [tr.particleTexture],
                        tagpro.particleDefinitions.rollingBomb);
                    tr.emitters.push(player.sprites.rollingBomb)
                }
 
 
                var bomb = player.sprites.bomb = new PIXI.Graphics();
                bomb.beginFill(0xFFFF00, .75).drawCircle(20, 20, 20);
                player.sprites.ball.addChild(bomb);
            } else {
                player.sprites.bomb.alpha = Math.abs(.75 * Math.sin(increaseFactor * performance.now() / 150));
            }
        } else {
            if (player.sprites.bomb) {
                player.sprites.ball.removeChild(player.sprites.bomb);
                player.sprites.bomb = null;
            }
            if (player.sprites.rollingBomb) {
                if (player.sprites.rollingBomb instanceof cloudkid.Emitter) {
                    player.sprites.rollingBomb.emit = false;
                    tr.emitters.splice(tr.emitters.indexOf(player.sprites.rollingBomb), 1);
                    player.sprites.rollingBomb.destroy();
                } else {
                    player.sprites.rollingBomb.visible = false;
                }
                player.sprites.rollingBomb = null;
 
            }
        }
    };
    
    var rollingBomb = {
        "alpha": {
            "start": 0.45,
            "end": 0
        },
        "scale": {
            "start": 0.1,
            "end": 1.5,
            "minimumScaleMultiplier": 1
        },
        "color": {
            "start": "#85888d",
            "end": "#100f0c"
        },
        "speed": {
            "start": 1,
            "end": 50 / increaseFactor
        },
        "acceleration": {
            "x": 0,
            "y": 0
        },
        "startRotation": {
            "min": 0,
            "max": 360
        },
        "rotationSpeed": {
            "min": 0,
            "max": 0
        },
        "lifetime": {
            "min": 0.5,
            "max": 2
        },
        "blendMode": "normal",
        "frequency": 0.001,
        "emitterLifetime": -1,
        "maxParticles": 10,
        "pos": {
            "x": 0,
            "y": 0
        },
        "addAtBack": false,
        "spawnType": "circle",
        "spawnCircle": {
            "x": 20,
            "y": 20,
            "r": 30
        }
    };
    
    tagpro.particleDefinitions.rollingBomb = rollingBomb || tagpro.particleDefinitions.rollingBomb;
});