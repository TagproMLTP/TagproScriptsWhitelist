// ==UserScript==
// @name          TagPro Beach Balls
// @description   Fun at the beach!
// @version       3.1
// @grant         none
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// @license       2015
// @author        Ly, CFlakes
// ==/UserScript==

tagpro.ready(function () {
    var texture = PIXI.Texture.fromImage('http://i.imgur.com/91Q6srF.png'),
        redBall = new PIXI.Texture(texture, new PIXI.Rectangle(80, 0, 40, 40)),
        blueBall = new PIXI.Texture(texture, new PIXI.Rectangle(0, 0, 40, 40)),
        whiteBall = new PIXI.Texture(texture, new PIXI.Rectangle(120, 0, 40, 40)),
        outline = new PIXI.Texture(texture, new PIXI.Rectangle(160, 0, 40, 40)),
        tagproTexture = new PIXI.Texture(texture, new PIXI.Rectangle(200, 0, 40, 40)),
        tr = tagpro.renderer;
    
    tr.createBallOutline = function (player) {
        if (!player.sprites.ballOutline) {
            player.sprites.ballOutline = new PIXI.Sprite(outline);
            player.sprites.ball.addChild(player.sprites.ballOutline);
        }
    };
    
    tr.createBallSpin = function (player) {
        var teamColor = player.team === 1 ? redBall : blueBall;
        if (!player.ballColor || !player.ballMask) {
            player.ballColor = [];
            player.ballMask = [];
            for (i = 0; i < 3; i++) {
                player.ballColor[i] = new PIXI.Sprite(teamColor);
                player.ballMask[i] = new PIXI.Graphics();
                player.ballMask[i].x = 20;
                player.ballMask[i].y = 20;
                player.sprites.ball.addChild(player.ballColor[i]);
                player.sprites.ball.addChild(player.ballMask[i]);
                player.ballColor[i].mask = player.ballMask[i];
            }
        } else {
            for (i = 0; i < 3; i++) {
                player.ballColor[i].setTexture(teamColor);
            }
        }
    };

    tr.updatePlayerColor = function(player) {
        if (!player.ballColor || (!player.sprites.ballOutline && !player.tagpro)) {
            tr.createBallSpin(player);
            tr.createBallOutline(player);
        } else {
            var radian = (Math.PI / 180),
                points = [],
                angle = (player.angle / radian % 360) + 360;

            for (i = 0; i < 6; i++) {
                var iAngle = angle + 360 / 6 * i,
                    side = ((iAngle + 270) % 360 > 180) ? 1 : -1,
                    outerAngle = (iAngle + 90) % 180,
                    outerAngle = (side > 0) ? 180 - outerAngle : outerAngle,
                    offset = (-8.546e-10 * Math.pow(outerAngle, 5)
                              + 4.311e-7 * Math.pow(outerAngle, 4)
                              - 6.669e-5 * Math.pow(outerAngle, 3)
                              + 0.001099 * Math.pow(outerAngle, 2)
                              + 0.3462 * outerAngle),
                    innerX = 18 * Math.cos(iAngle * radian),
                    innerY = 18 * Math.sin(iAngle * radian) - 10,
                    outerX = 30 * Math.cos((iAngle + offset * side) * radian),
                    outerY = 30 * Math.sin((iAngle + offset * side) * radian);

                points.push({ix: innerX, iy: innerY, ox: outerX, oy: outerY});
            }

            for (i = 0; i < points.length; i += 2) {
                var first = points[i],
                    second = points[(i + 1) % points.length],
                    context = player.ballMask[i / 2];

                context.clear();

                context.beginFill(0x000000);
                context.moveTo(0, -10);
                context.quadraticCurveTo(first.ix, first.iy, first.ox, first.oy);
                context.lineTo(second.ox, second.oy);
                context.quadraticCurveTo(second.ix, second.iy, 0, -10);
                context.endFill();
            }
        }
        var sprite = player.team === 1 ? "redball" : "blueball";
        if (player.sprites.actualBall.tileId !== sprite) {
            tr.createBallSpin(player);
            player.sprites.actualBall.tileId = sprite;
        }
    };
    
    tr.createBallSprite = function(player) {
        var sprite = player.team === 1 ? "redball" : "blueball";
        player.sprites.actualBall = new PIXI.Sprite(whiteBall);
        player.sprites.ball.addChild(player.sprites.actualBall);
        tr.createBallSpin(player);
        player.sprites.actualBall.tileId = sprite;
    };

    tr.updateTagpro = function (player) {
        if (player.tagpro) {
            if (!tr.options.disableParticles && !player.sprites.tagproSparks) {
                player.sprites.tagproSparks = new cloudkid.Emitter(
                    player.sprites.ball, [tr.particleFireTexture],
                    tagpro.particleDefinitions.tagproSparks);
                tr.emitters.push(player.sprites.tagproSparks);
            }
            if (!player.sprites.tagproTexture) {
                player.sprites.ball.removeChild(player.sprites.ballOutline);
                player.sprites.ballOutline = null;
                player.sprites.tagproTexture = new PIXI.Sprite(tagproTexture);
                player.sprites.ball.addChild(player.sprites.tagproTexture);
            }
        } else {
            if (player.sprites.tagproTexture) {
                player.sprites.ball.removeChild(player.sprites.tagproTexture);
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
});
