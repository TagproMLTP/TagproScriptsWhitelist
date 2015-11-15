// ==UserScript==
// @name          TagPro Semitransparent Spin Balls
// @description   Spin balls and pixel perfect tagpro.
// @version       1
// @grant         none
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// @license       2015
// @author        CFlakes, SomeBall -1
// ==/UserScript==

tagpro.ready(function () {
    var texture = PIXI.Texture.fromImage('http://i.imgur.com/psNi6oV.png'),
        redTexture = new PIXI.Texture(texture, new PIXI.Rectangle(0, 0, 40, 40)),
        blueTexture = new PIXI.Texture(texture, new PIXI.Rectangle(40, 0, 40, 40)),
        tagproTexture = new PIXI.Texture(texture, new PIXI.Rectangle(80, 0, 40, 40)),
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
                player.sprites.bomb.alpha = Math.abs(0.6 * Math.sin(performance.now() / 150));
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