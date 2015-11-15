// ==UserScript==
// @name          Thot's setup
// @description   Transparent balls, spin marble overlay, pixel perfect tagpro and custom textures.
// @description   Also turns canvas transparent and replaces background image.
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// @include       http://tagpro-*.koalabeast.com*
// @include       http://tangent.jukejuice.com*
// @include       http://tagpro-*.koalabeast.com/groups/*
// @include       http://tangent.jukejuice.com/groups/*
// ==/UserScript==
 
// Changes background image
$('html').css({'background-image':'url(http://www.radioviva.fm.br/images/backgrounds/bg-abstract-blue-red.jpg)'});

// Loads custom textures
tagpro.loadAssets({
    "tiles": "http://i.imgur.com/07dJ34R.png", //Using all Nilla textures [modified to have the stock balls] (http://imgur.com/a/67OUN)
    "speedpad": "http://i.imgur.com/bawbyQm.png",
    "speedpadRed": "http://i.imgur.com/tDxnPWm.png",
    "speedpadBlue": "http://i.imgur.com/NQaEKB0.png",
    "portal": "http://i.imgur.com/v8aO03S.png",
    "splats": "http://i.imgur.com/siBmnYu.png"
});
 
tagpro.ready(function() {
    
    // Transparent canvas courtesy of NewCompte
    var oldCanvas = $(tagpro.renderer.canvas);
    var newCanvas = $('<canvas id="viewport" width="1280" height="800"></canvas>');
    oldCanvas.after(newCanvas);
    oldCanvas.remove();
    tagpro.renderer.canvas = newCanvas.get(0);
    tagpro.renderer.options.transparent = true;
    tagpro.renderer.renderer = tagpro.renderer.createRenderer();
    tagpro.renderer.resizeAndCenterView();
    newCanvas.show();
    
    // Marble spin courtesy of CFlakes and Some Ball -1
    var texture = PIXI.Texture.fromImage('https://i.imgur.com/3UkPmLL.png'),
        redTexture = new PIXI.Texture(texture, new PIXI.Rectangle(0, 0, 40, 40)),
        blueTexture = new PIXI.Texture(texture, new PIXI.Rectangle(40, 0, 40, 40)),
        tagproTexture = new PIXI.Texture(texture, new PIXI.Rectangle(80, 0, 40, 40));
    
    tagpro.renderer.createSpin = function(player) {
        var teamTexture = player.team === 1 ? redTexture : blueTexture;
        if (!player.sprites.marble) {
            player.sprites.marble = new PIXI.Sprite(teamTexture);
            player.sprites.marble.anchor.x = 0.5;
            player.sprites.marble.anchor.y = 0.5;
            player.sprites.marble.x = 20;
            player.sprites.marble.y = 20;
            player.sprites.marble.alpha = 0.8;
            player.sprites.marble.tileId = player.sprites.actualBall.tileId;
            player.sprites.ball.addChild(player.sprites.marble);
        } else {
            player.sprites.marble.setTexture(teamTexture);
            player.sprites.marble.tileId = player.sprites.actualBall.tileId;
        }
    };
    
    var upsp = tagpro.renderer.updatePlayerSpritePosition;
    tagpro.renderer.updatePlayerSpritePosition = function(player) {
        if (!player.sprites.marble || player.sprites.actualBall.tileId !== player.sprites.marble.tileId) {
            tagpro.renderer.createSpin(player);
        }
        player.sprites.marble.rotation = player.angle;
        upsp(player);
    };
   
    tagpro.renderer.createBallSprite = function (player) {
        var texture = player.team === 1 ? "redball" : "blueball";
        player.sprites.actualBall = tagpro.tiles.draw(player.sprites.ball, texture, {x: 0, y: 0}, null, null, 0.7);
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
                    player.sprites.tagproTint.beginFill(0x00FF00, 0.2).drawCircle(20, 20, 19);
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
                var sparksIndex = tagpro.renderer.emitters.indexOf(player.sprites.tagproSparks);
                tagpro.renderer.emitters.splice(sparksIndex, 1);
                player.sprites.tagproSparks.destroy();
                player.sprites.tagproSparks = null;
            }
        }
    };
   
    tagpro.renderer.updateRollingBomb = function (player) {
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