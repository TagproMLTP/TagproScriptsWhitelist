// ==UserScript==
// @name          TagPro Old Death
// @version       0.2
// @grant         none
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// @license       2015
// ==/UserScript==

tagpro.ready(function () {
    var tr = tagpro.renderer;

    tr.animateBallPop = function (texture, started) {
        var now = performance.now(),
            duration = now - started;
        texture.scale.x += duration / 50;
        texture.scale.y += duration / 50;
        texture.alpha -= texture.alpha * duration / 60;
        if (texture.scale.x > 2.7) {
            tr.layers.foreground.removeChild(texture);
        } else {
            requestAnimationFrame(function () {
                tr.animateBallPop(texture, now);
            });
        }
    };

    tr.drawBallPop = function (x, y, team) {
        var start = performance.now(),
            texture = team === 1 ? "redball" : "blueball",
            ballPop = tagpro.tiles.draw(tr.layers.foreground, texture, {
                x: x,
                y: y
            });
        ballPop.anchor.x = 0.5;
        ballPop.anchor.y = 0.5;
        tr.animateBallPop(ballPop, start);
    };
});