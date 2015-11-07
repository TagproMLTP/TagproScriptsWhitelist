// ==UserScript==
// @name          TagPro BallDon'tLie's Custom Spin TEST.
// @description   Ugly.
// @version       3
// @grant         none
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// @license       2015
// @author        CFlakes
// @namespace     http://www.reddit.com/user/Cumflakes
// ==/UserScript==

$('#tiles')[0].src = 'http://i.imgur.com/b7DyVxe.png';
$('#splats')[0].src = 'http://i.imgur.com/kbkOC6x.png';
$('#speedpad')[0].src = 'http://i.imgur.com/HTCSHhe.png';
$('#speedpadred')[0].src = 'http://i.imgur.com/UarfAlB.png';
$('#speedpadblue')[0].src = 'http://i.imgur.com/R7Qvfgg.png';
$('#portal')[0].src = 'http://i.imgur.com/BEr4T9e.png';

tagpro.ready(function () {
    var texture = PIXI.Texture.fromImage('http://i.imgur.com/v6xz3wq.png'),
        spinTexture = new PIXI.Texture(texture, new PIXI.Rectangle(0, 0, 40, 40)),
        tagproTexture = new PIXI.Texture(texture, new PIXI.Rectangle(40, 0, 40, 40)),
        tr = tagpro.renderer;
    
    tr.createBallSpin = function (player) {
        var shape = [0, 0, 20, 0, 20, 20, 40, 0, 40, 20, 20, 20, 40, 40, 20, 40, 20, 20, 0, 40, 0, 20, 20, 20, 0, 0];
        player.sprites.spinMask = new PIXI.Graphics();
        player.sprites.spinMask.beginFill(0x000000);
        player.sprites.spinMask.drawPolygon(shape);
        player.sprites.spinMask.endFill();
        player.sprites.spinMask.x = 20;
        player.sprites.spinMask.y = 20;
        player.sprites.spinMask.pivot.x = 20;
        player.sprites.spinMask.pivot.y = 20;
        player.sprites.spin = new PIXI.Sprite(spinTexture);
        player.sprites.ball.addChild(player.sprites.spin);
        player.sprites.ball.addChild(player.sprites.spinMask);
        player.sprites.spin.mask = player.sprites.spinMask;
    };
    
    var upsp = tr.updatePlayerSpritePosition;
    tr.updatePlayerSpritePosition = function (player) {
        if (!player.sprites.spin) {
            tr.createBallSpin(player);
        } else {
            player.sprites.spinMask.rotation = player.angle;
        }
        upsp(player);
    };
    
    tr.updateTagpro = function (player) {
        if (player.tagpro) {
            if (!tr.options.disableParticles && !player.sprites.tagproSparks) {
                player.sprites.tagproSparks = new cloudkid.Emitter(
                    player.sprites.ball, [tr.particleFireTexture],
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
            }
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
    
    tr.updateRollingBomb = function (player) {
        if (player.bomb) {
            if (!player.sprites.bomb) {
                if (!tr.options.disableParticles) {
                    player.sprites.rollingBomb = new cloudkid.Emitter(
                        player.sprites.ball, [tr.particleTexture],
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