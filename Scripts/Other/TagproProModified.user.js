// ==UserScript==
// @name          TagPro Pro
// @description   Spin marble overlay, pixel perfect tagpro and textures.
// @version       3
// @grant         none
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// @license       2014
// @author        CFlakes, SomeBall -1, modified by Ballsagnia, modified by Yac
// @namespace     http://www.reddit.com/user/Cumflakes
// ==/UserScript==

$('#tiles')[0].src = 'http://i.imgur.com/BZZRdJ5.png';
$('#splats')[0].src = 'http://i.imgur.com/H2V1eJ7.png';
$('#speedpad')[0].src = 'http://i.imgur.com/JDacq6P.png';
$('#speedpadred')[0].src = 'http://i.imgur.com/vnQM3lT.png';
$('#speedpadblue')[0].src = 'http://i.imgur.com/ErfkQi2.png';
$('#portal')[0].src = 'http://i.imgur.com/y6027SR.png';

tagpro.ready(function () {
    var texture = PIXI.Texture.fromImage('http://i.imgur.com/h6ouK1x.png'),
        redTexture = new PIXI.Texture(texture, new PIXI.Rectangle(0, 0, 40, 40)),
        blueTexture = new PIXI.Texture(texture, new PIXI.Rectangle(40, 0, 40, 40)),
        tagproTexture = new PIXI.Texture(texture, new PIXI.Rectangle(80, 0, 40, 40));
    tagpro.renderer.createSpin = function(player) {
        var teamTexture = player.team === 1 ? redTexture : blueTexture;
        if (!player.sprites.spin) {
            player.sprites.spin = new PIXI.Sprite(teamTexture);
            player.sprites.spin.anchor.x = 0.5;
            player.sprites.spin.anchor.y = 0.5;
            player.sprites.spin.x = 20;
            player.sprites.spin.y = 20;
            player.sprites.spin.tileId = player.sprites.actualBall.tileId;
            player.sprites.ball.addChild(player.sprites.spin);
        } else {
            player.sprites.spin.setTexture(teamTexture);
            player.sprites.spin.tileId = player.sprites.actualBall.tileId;
        }
    };
    var upsp = tagpro.renderer.updatePlayerSpritePosition;
    tagpro.renderer.updatePlayerSpritePosition = function(player) {
        if (!player.sprites.spin || player.sprites.actualBall.tileId !== player.sprites.spin.tileId) tagpro.renderer.createSpin(player);
        player.sprites.spin.rotation = player.angle;
        upsp(player);
    };
    tagpro.renderer.createBallSprite = function(player) {
        var texture = player.team === 1 ? "redball" : "blueball";
        player.sprites.actualBall = tagpro.tiles.draw(player.sprites.ball, texture, {x: 0, y: 0});
        player.sprites.actualBall.tileId = texture;
    };
    tagpro.renderer.updateTagpro = function(player) {
        if (player.tagpro) {
            if (!tagpro.renderer.options.disableParticles && !player.sprites.tagproSparks) {
                player.sprites.tagproSparks = new cloudkid.Emitter(
                    player.sprites.ball,
                    [tagpro.renderer.particleFireTexture],
                    tagpro.particleDefinitions.tagproSparks);
                tagpro.renderer.emitters.push(player.sprites.tagproSparks);
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
                var sparksIndex = tagpro.renderer.emitters.indexOf(player.sprites.tagproSparks);
                tagpro.renderer.emitters.splice(sparksIndex, 1);
                player.sprites.tagproSparks.destroy();
                player.sprites.tagproSparks = null;
            }
        }
    };
    tagpro.renderer.updateRollingBomb = function(player) {
        if (player.bomb) {
            if (!player.sprites.bomb) {
                if (!tagpro.renderer.options.disableParticles) {
                    player.sprites.rollingBomb = new cloudkid.Emitter(
                        player.sprites.ball,
                        [tagpro.renderer.particleTexture],
                        tagpro.particleDefinitions.rollingBomb);
                    tagpro.renderer.emitters.push(player.sprites.rollingBomb);
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
                    tagpro.renderer.emitters.splice(tagpro.renderer.emitters.indexOf(player.sprites.rollingBomb), 1);
                    player.sprites.rollingBomb.destroy();
                } else {
                    player.sprites.rollingBomb.visible = false;
                }
                player.sprites.rollingBomb = null;
            }
        }
    };
});