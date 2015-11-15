// ==UserScript==
// @name         Move Spikes
// @version      0.1
// @include      http://*.koalabeast.com:*
// @include      http://*.jukejuice.com:*
// @include      http://*.newcompte.fr:*
// @grant        none
// ==/UserScript==

tagpro.ready(function () {
    var INTERVAL = 30;
    var offset = 1
    
    
    tr = tagpro.renderer
    var TILE_SIZE = 40;
    var spikeSprites = [];
        
    tr.drawDynamicTile = function (x, y) {
        console.log("Draw dynamic tile");
        /* Draws a dynamic tile. The background is a PIXI.RenderTexture, so it can't
         * handle dynamic objects. Instead we simply draw it into tr.layers.midground
         * @param x {Number} The x-coordinate
         * @param y {Number} the y-coordinate
         * */
        var tile = tagpro.tiles[tagpro.map[x][y]];
        if (!tile) {
            return;
        }
        var drawPos = {x: x * TILE_SIZE, y: y * TILE_SIZE};
        var sprite;
        if (tile instanceof PIXI.MovieClip) {
            sprite = tr.drawAnimation(tile, drawPos)
        } else if (tile.dynamic) {
            if (tile.x == 12 && tile.y == 0) {
                console.log(tile);
                drawPos = {x: x * TILE_SIZE, y: y * TILE_SIZE};
                var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
                offset = offset * plusOrMinus;
                sprite = tagpro.tiles.draw(tr.layers.midground, tagpro.map[x][y], drawPos);
                spikeSprites[spikeSprites.length] = sprite;
            } else {
                sprite = tagpro.tiles.draw(tr.layers.midground, tagpro.map[x][y], drawPos);
            }
        } else {
            return;
        }

        if (!tr.dynamicSprites[x]) {
            tr.dynamicSprites[x] = {}
        }
        tr.dynamicSprites[x][y] = sprite;
    };
    
    moveSpikes = function() {
        offset = offset * -1;
        for (var x = 0; x < spikeSprites.length; x++) {
            if (x % 2 == 1) {
                spikeSprites[x].position.x = spikeSprites[x].position.x + offset;
            } else {
                spikeSprites[x].position.x = spikeSprites[x].position.x - offset;
            }
        }
        for (var x = 0; x < spikeSprites.length; x++) {
            if (x % 2 == 1) {
                spikeSprites[x].position.y = spikeSprites[x].position.y + offset;
            } else {
                spikeSprites[x].position.y = spikeSprites[x].position.y - offset;
            }
        }
    }

    var moveIntervalId = 0;
    
    document.body.addEventListener('keydown', function (e) {
        if (e.keyCode == 32) {
            if (moveIntervalId == 0) {
                moveIntervalId = setInterval(moveSpikes, INTERVAL);
            } else {
                window.clearInterval(moveIntervalId);
                moveIntervalId = 0;
            }
        }
    });
    
    
});