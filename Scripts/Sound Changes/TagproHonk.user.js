// ==UserScript==
// @name          TagPro Honk
// @description   Press space to honk.
// @version       0.3
// @grant         none
// @require       https://gist.githubusercontent.com/ballzilla/dbbc9d9a91774f66698a/raw/20f3ec84f3c2bd5333093a5f8a21c3f54b126045/howler.js
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// @license       2015
// @author        CFlakes / Ballzilla
// ==/UserScript==

tagpro.ready(function waitForId() {
    if (!tagpro.playerId) return setTimeout(waitForId, 100);

    var self = tagpro.players[tagpro.playerId],
        honkSound = new Howl({
            urls: ["data:audio/mp3;base64,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"],
            sprite: {
                mid: [21, 96]
            }
        }),
        honkSprite = PIXI.Texture.fromImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpi/P//PwMKaGBkwAoa/mOVY2LAD0Dy/WhiHEDcTYwBnEC8CogL0Fz2B4j9gdgInwEiQLwXiIPRxHmhBqyCGsLAgsPPx4BYFU0sBIgdgDgHiE8BcSrEAAhADklGLJpB4CEQW0HZN4FYnZhARAb3gVgOyn4OxBKkGvABiAWg7E/Q8CDJAHTwi1QDBKCuAAE+IP5MqgGKQPwIypYE4nfIBjAiYRC4g8UAeWj0MkBj4CZYI468AEpIm4HYAskCEOAB4i9A3AyN+jpcXngDxE5AvA5N/As07YQD8QZCYfAdiMOAeCI8N0IAyICNQHyOmED8C89MCPADiEthHIAAAwBEhjK+0yzwDgAAAABJRU5ErkJggg==");

    function getPlayers() {
        requestAnimationFrame(getPlayers);
        for (var id in tagpro.players) {
            if (!tagpro.players.hasOwnProperty(id)) continue;
            var player = tagpro.players[id];
            if (player.up && player.down && player.draw && !player.dead) {
                if (!player.isHonking) {
                    var startTime = Date.now();
                    player.isHonking = true;
                    drawHonk(player);
                    honk(player, startTime);
                }
            } else {
                if (player.isHonking) {
                    player.isHonking = false;
                    drawHonk(player, true);
                }
            }
        }
    }
    requestAnimationFrame(getPlayers);

    function findCosAngle(self, player) {
        var selfVector = {
            x: player.x - self.x,
            y: player.y - self.y
        };
        var playerVector = {
            x: player.lx,
            y: player.ly
        };
        var scalarProduct = (selfVector.x * playerVector.x) + (selfVector.y * playerVector.y);
        var selfMagnitude = Math.sqrt(Math.pow(selfVector.x, 2) + Math.pow(selfVector.y, 2));
        var playerMagnitude = Math.sqrt(Math.pow(playerVector.x, 2) + Math.pow(playerVector.y, 2));
        var result = -(scalarProduct / (selfMagnitude * playerMagnitude));
        return isNaN(result) ? 0 : result;
    }

    function honk(player, startTime) {
        if (!tagpro.sound) return;
        if (player.isHonking && Date.now() - startTime < 4000) {
            var last
            var distance = Math.sqrt(Math.pow(player.x - self.x, 2) + Math.pow(player.y - self.y, 2)),
                volume = distance === 0 ? 1 : Math.max(1 - distance / 800, 0.1);
            honkSound.volume(volume);

            var playerSpeed = Math.sqrt(Math.pow(player.lx, 2) + Math.pow(player.ly, 2));
            var cosAngle = findCosAngle(self, player);
            var rate = playerSpeed * cosAngle;
            rate = Math.pow(Math.exp(rate), 1 / 5);

            honkSound._rate = rate / 4 + 0.75;

            honkSound.play('mid');
            setTimeout(function() {
                honk(player, startTime);
            }, 80);
        } else {
            if (player.sprites.honk) drawHonk(player, true);
        }
    }

    function drawHonk(player, remove) {
        if (!player.sprites.honk && !remove) {
            player.sprites.honk = new PIXI.Sprite(honkSprite);
            player.sprites.honk.x = 12;
            player.sprites.honk.y = 12;
            player.sprites.ball.addChild(player.sprites.honk);
        } else {
            if (player.sprites.honk && remove) {
                player.sprites.ball.removeChild(player.sprites.honk);
                player.sprites.honk = null;
            }
        }
    }

    var sentDir = {
            d: false,
            u: false
        },
        pressedDir = {
            d: false,
            u: false
        },
        keyCount = 1,
        tse = tagpro.socket.emit;

    tagpro.socket.emit = function(t, n) {
        if (t === 'keydown') {
            if (n.k === 'down') sentDir.d = true;
            if (n.k === 'up') sentDir.u = true;
            n.t = keyCount++;
        }
        if (t === 'keyup') {
            if (n.k === 'down') sentDir.d = false;
            if (n.k === 'up') sentDir.u = false;
            n.t = keyCount++;
        }
        tse(t, n);
    };

    $(document).keydown(function(key) {
        switch (key.which) {
            case 32:
                if (!sentDir.d && !tagpro.disableControls) tagpro.socket.emit('keydown', {
                    k: 'down',
                    t: keyCount
                });
                if (!sentDir.u && !tagpro.disableControls) tagpro.socket.emit('keydown', {
                    k: 'up',
                    t: keyCount
                });
                break;
            case tagpro.keys.down[0]:
            case tagpro.keys.down[1]:
            case tagpro.keys.down[2]:
                pressedDir.d = true;
                break;
            case tagpro.keys.up[0]:
            case tagpro.keys.up[1]:
            case tagpro.keys.up[2]:
                pressedDir.u = true;
                break;
        }
    });

    $(document).keyup(function(key) {
        switch (key.which) {
            case 32:
                if (!pressedDir.d && !tagpro.disableControls) tagpro.socket.emit('keyup', {
                    k: 'down',
                    t: keyCount
                });
                if (!pressedDir.u && !tagpro.disableControls) tagpro.socket.emit('keyup', {
                    k: 'up',
                    t: keyCount
                });
                break;
            case tagpro.keys.down[0]:
            case tagpro.keys.down[1]:
            case tagpro.keys.down[2]:
                pressedDir.d = false;
                break;
            case tagpro.keys.up[0]:
            case tagpro.keys.up[1]:
            case tagpro.keys.up[2]:
                pressedDir.u = false;
                break;
        }
    });
});