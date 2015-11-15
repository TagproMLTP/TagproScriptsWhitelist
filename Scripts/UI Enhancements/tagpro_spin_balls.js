// ==UserScript==
// @name          TagPro Spin Balls
// @description   Spin balls and pixel perfect tagpro. Compatible with Tagpro 3.1.0 and greater.
// @version       1.1
// @grant         none
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// @license       2015
// @author        CFlakes, SomeBall -1, yank
// @namespace     http://www.reddit.com/user/Cumflakes
// ==/UserScript==
 
var textures = [
        'http://i.imgur.com/ZgCjwJ3.png', // tiles
        'http://i.imgur.com/kbkOC6x.png', // splats
        'http://i.imgur.com/Q7U8iFR.png', // speedpad
        'http://i.imgur.com/fYRwma3.png', // speedpadred
        'http://i.imgur.com/Uol6yGr.png', // speedpadblue
        'http://i.imgur.com/RQXDv00.png', // portal
        'http://i.imgur.com/TGIJyN2.png'  // tagpro. Not included with most/all texture packs, but you can use your own here.
    ]
 
tagpro.loadAssets({
    "tiles": textures[0],
    "splats": textures[1],
    "speedpad": textures[2],
    "speedpadRed": textures[3],
    "speedpadBlue": textures[4],
    "portal": textures[5]
});
 
tagpro.ready(function () {    
    var textureTagpro = PIXI.Texture.fromImage(textures[6]),
        textureBalls = PIXI.Texture.fromImage(textures[0]),
        redTexture = new PIXI.Texture(textureBalls, new PIXI.Rectangle(560, 0, 40, 40)),
        blueTexture = new PIXI.Texture(textureBalls, new PIXI.Rectangle(600, 0, 40, 40)),
        tagproTexture = new PIXI.Texture(textureTagpro, new PIXI.Rectangle(0, 0, 40, 40)),
        tr = tagpro.renderer;
    
    tr.createBallSprite = function(player) {
        var texture = player.team == 1 ? "redball" : "blueball";
        player.sprites.actualBall = tagpro.tiles.draw(player.sprites.ball, texture, {x: 0, y: 0}, null, null, 0.01);
        player.sprites.actualBall.tileId = texture;
        tr.createSpin(player);
    };
    
    tr.updatePlayerColor = function(player) {
        var color = player.team == 1 ? "red" : "blue";
        var tileId = color + "ball";
        if (player.sprites.actualBall.tileId !== tileId) {
            var teamTexture = player.team === 1 ? redTexture : blueTexture;
            var baseTexture = tagpro.tiles.getTexture(tileId);
            var texture = new PIXI.Texture(baseTexture);
            player.sprites.actualBall.setTexture(texture);
            player.sprites.actualBall.tileId = tileId;
            player.sprites.spin.setTexture(teamTexture);
        }
    };
    
    tr.createSpin = function(player) {
        var teamTexture = player.team === 1 ? redTexture : blueTexture;
        if (!player.sprites.spin) {
            player.sprites.spin = new PIXI.Sprite(teamTexture);
            player.sprites.spin.anchor.x = 0.5;
            player.sprites.spin.anchor.y = 0.5;
            player.sprites.spin.x = 20;
            player.sprites.spin.y = 20;
            player.sprites.ball.addChild(player.sprites.spin);
        }
    };
    
    var upsp = tagpro.renderer.updatePlayerSpritePosition;
    tagpro.renderer.updatePlayerSpritePosition = function(player) {
        player.sprites.spin.rotation = player.angle;
        upsp(player);
    };
    
    tr.updateTagpro = function(player) {
        if (player.tagpro) {
            if (!tr.options.disableParticles && !player.sprites.tagproSparks) {
                player.sprites.tagproSparks = new cloudkid.Emitter(
                    player.sprites.ball,
                    [tr.particleFireTexture],
                    tagpro.particleDefinitions.tagproSparks);
                tr.emitters.push(player.sprites.tagproSparks);
            }
            if (player.bomb) {
                if (player.sprites.tagproTint) {
                    player.sprites.ball.removeChild(player.sprites.tagproTint);
                    player.sprites.tagproTint = null;
                }
            } else {
                if (!player.sprites.tagproTint) {
                    player.sprites.tagproTint = new PIXI.Graphics();
                    player.sprites.tagproTint.beginFill(0x00FF00, 0.25).drawCircle(20, 20, 19);
                    player.sprites.ball.addChild(player.sprites.tagproTint);
                }
            }
            if (!player.sprites.tagproTexture) {
                player.sprites.tagproTexture = new PIXI.Sprite(tagproTexture);
                player.sprites.ball.addChild(player.sprites.tagproTexture);
                player.sprites.tagproTexture.anchor.x = 0.5;
                player.sprites.tagproTexture.anchor.y = 0.5;
                player.sprites.tagproTexture.x = 20;
                player.sprites.tagproTexture.y = 20;
            }
            player.sprites.tagproTexture.rotation = player.angle;
        } else {
            if (player.sprites.tagproTint || player.sprites.tagproTexture) {
                player.sprites.ball.removeChild(player.sprites.tagproTint);
                player.sprites.ball.removeChild(player.sprites.tagproTexture);
                player.sprites.tagproTint = null;
                player.sprites.tagproTexture = null;
            }
            if (player.sprites.tagproSparks) {
                player.sprites.tagproSparks.emit = false;
                var sparksIndex = tr.emitters.indexOf(player.sprites.tagproSparks);
                tr.emitters.splice(sparksIndex, 1);
                player.sprites.tagproSparks.destroy();
                player.sprites.tagproSparks = null;
            }
        }
    };
    
    tr.updateRollingBomb = function(player) {
        if (player.bomb) {
            if (!player.sprites.bomb) {
                if (!tr.options.disableParticles) {
                    player.sprites.rollingBomb = new cloudkid.Emitter(
                        player.sprites.ball,
                        [tr.particleTexture],
                        tagpro.particleDefinitions.rollingBomb);
                    tr.emitters.push(player.sprites.rollingBomb);
                }
                var bomb = player.sprites.bomb = new PIXI.Graphics();
                bomb.beginFill(0xFFFF00, 0.6).drawCircle(20, 20, 19);
                player.sprites.ball.addChild(bomb);
            } else {
                player.sprites.bomb.alpha = Math.abs(0.6 * Math.sin(performance.now() / 75));
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
});