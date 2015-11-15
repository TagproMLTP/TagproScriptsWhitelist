// ==UserScript==
// @name         TagPro Spectator Timers
// @include      http://*.koalabeast.com:*
// @include      http://*.jukejuice.com:*
// @include      http://*.newcompte.fr:*
// @grant        none
// ==/UserScript==

tagpro.ready(mainFunction);

function mainFunction() {

if (!tagpro.playerId) return setTimeout(mainFunction);
if (!tagpro.spectator) return;

tagpro.socket.on('spectator', function(spectating) {
    if (!spectating) {
        gameEnd = true;
        for (var id in tileTimer) {
            if (!tileTimer.hasOwnProperty(id)) continue;
            clearTile(tileTimer[id]);
        }
    }
});
    
var tr = tagpro.renderer;
var tileTimer = constructTileTimer();
var ballTimer = constructBallTimer();
var drawLayer = createLayer();
var gameEnd = false;

function createLayer() {
    var layer = new PIXI.DisplayObjectContainer();
    tr.gameContainer.addChildAt(layer, tr.gameContainer.children.length - 1);
    return layer;
}

function constructTileTimer() {
    var obj = {};
    for (var x = 0, xl = tagpro.map.length, yl = tagpro.map[0].length; x < xl; x++) {
        for (var y = 0; y < yl; y++) {
            switch (Math.floor(tagpro.map[x][y])) {
                case 6:
                case 10:
                case 5:
                case 14:
                case 15:
                    obj[x + '' + y] = {v: tagpro.map[x][y]};
                    break;
            }
        }
    }
    return obj;
}

function constructBallTimer() {
    var obj = {};
    for (var id in tagpro.players) {
        if (!tagpro.players.hasOwnProperty(id)) continue;
        var player = tagpro.players[id];
        obj[id] = {jj: {}, rb: {}, tp: {}};
        if (player.draw) {
            if (!player.grip) obj[id].jj.check = true;
            if (!player.bomb) obj[id].rb.check = true;
            if (!player.tagpro) obj[id].tp.check = true;
        } else {
            obj[id].jj.check = false;
            obj[id].rb.check = false;
            obj[id].tp.check = false;
        }
    }
    return obj;
}

tagpro.socket.on('mapupdate', function(data) {
    data = data[0] ? data : [data];
    for (var i = 0, l = data.length; i < l; i++) {
        data[i].id = data[i].x + '' + data[i].y;
        handleMapUpdate(data[i]);
    }
});

tagpro.socket.on("p", function(data) {
    data = data.u || data;
    for (var i = 0, l = data.length; i < l; i++) {
        handlePlayerUpdate(data[i]);
    }
});

tagpro.socket.on('end', function() {
    gameEnd = true;
    for (var id in tileTimer) {
        if (!tileTimer.hasOwnProperty(id)) continue;
        clearTile(tileTimer[id]);
    }
});

function handleMapUpdate(tile) {
    var timer = tileTimer[tile.id];
    switch (tile.v) {
        case 6.1:
        case 6.2:
        case 6.3:
            timer.v = tagpro.map[tile.x][tile.y];
            clearTile(timer);
            break;
        case 10:
        case 5:
        case 14:
        case 15:
            clearTile(timer);
            break;
        case 6:
            checkTile(tile, 59999, '#00FF00');
            getRepeatGrabs(timer.v, tile.x, tile.y);
            break;
        case '10.1':
            checkTile(tile, 29999, '#D0A9F5');
            break;
        case '5.1':
        case '14.1':
        case '15.1':
            checkTile(tile, 9999);
            break;
    }
}

function handlePlayerUpdate(data) {
    if (data.grip !== undefined || data.bomb !== undefined || data.tagpro !== undefined || data.draw !== undefined || data.dead !== undefined) {
        ballTimer[data.id] = ballTimer[data.id] || {jj: {}, rb: {}, tp: {}};
        checkPlayer(data.id);
    }
}

function clearTile(timer) {
    if (timer.t) {
        clearTimeout(timer.timeout);
        drawLayer.removeChild(timer.t);
        timer.t = null;
    }
}

function checkTile(tile, spawn, color, forceDraw) {
    var now = Date.now(),
        self = tagpro.players[tagpro.playerId],
        timer = tileTimer[tile.id],
        tileDist = {x: Math.abs(self.x - tile.x * 40), y: Math.abs(self.y - tile.y * 40)},
        inRange = (tagpro.spectator || (tileDist.x < 655 && tileDist.y < 415)) ? true : false,
        gameTimeLeft = tagpro.gameEndsAt - now;
    if (!timer.t && (inRange || forceDraw)) {
        if (color) {
            tile.time = '0' + Math.floor((gameTimeLeft + spawn) / 1000 % 60);
        }
        tile.spawn = now + spawn;
        tr.drawTileTimer(tile, color);
    }
}

function checkPlayer(id, skipCheck) {
    var player = tagpro.players[id],
        timer = ballTimer[id];
    if (!skipCheck) {
        if (player.draw) {
            if (!player.grip) timer.jj.check = true;
            if (!player.bomb) timer.rb.check = true;
            if (!player.tagpro) timer.tp.check = true;
        } else {
            timer.jj.check = false;
            timer.rb.check = false;
            timer.tp.check = false;
        }
    }
    if (player.grip && timer.jj.check) {
        getNearestPup(player.x + player.lx * 7, player.y + player.ly * 7);
        tr.drawBallTimer(timer.jj, id, 0, '#58FAF4');
        timer.jj.check = false;
    }
    if (player.bomb && timer.rb.check) {
        getNearestPup(player.x + player.lx * 7, player.y + player.ly * 7);
        tr.drawBallTimer(timer.rb, id, 1, '#FFFF00');
        timer.rb.check = false;
    }
    if (player.tagpro && timer.tp.check) {
        getNearestPup(player.x + player.lx * 7, player.y + player.ly * 7);
        tr.drawBallTimer(timer.tp, id, 2, '#81F781');
        timer.tp.check = false;
    }
}

tr.basicText = function(text, color, size) {
    return new PIXI.Text(text, {
        font: size || "20pt Arial",
        fill: color || "#FFFFFF",
        stroke: "#000000",
        strokeThickness: 3
    });
};

tr.drawTileTimer = function(tile, color) {
    if (gameEnd) return;
    var timeLeft = tile.spawn - Date.now(),
        timer = tileTimer[tile.id];
    if (timeLeft > 10000) {
        if (!timer.t) {
            timer.t = tr.basicText(tile.time.substr(tile.time.length - 2, 2), color);
            timer.t.x = tile.x * 40 + 3;
            timer.t.y = tile.y * 40 + 7;
            drawLayer.addChild(timer.t);
        }
        timer.timeout = setTimeout(function() {
            tr.drawTileTimer(tile, color);
        }, timeLeft - 10000);
    } else {
        if (timer.t && timer.t.style.font === "20pt Arial") {
            clearTile(timer);
        }
        if (timeLeft > 0) {
            var tenths = Math.floor(timeLeft / 100) / 10 + '.0';
            if (!timer.t) {
                timer.t = tr.basicText(tenths.substr(0, 3), color, '18pt Arial');
                timer.t.x = tile.x * 40 + 1;
                timer.t.y = tile.y * 40 + 9;
                drawLayer.addChild(timer.t);
            } else {
                timer.t.setText(tenths.substr(0, 3));
            }
            timer.timeout = setTimeout(function() {
                tr.drawTileTimer(tile, color);
            }, 50);
        } else {
            clearTile(timer);
        }
    }
};

tr.drawBallTimer = function(timer, id, i, color) {
    var offset = [],
        actPup = [tagpro.players[id].grip, tagpro.players[id].bomb, tagpro.players[id].tagpro];
    offset[0] = tagpro.players[id].degree ? 11 : 0;
    offset[1] = ballTimer[id].jj.sprite ? offset[0] + 11 : offset[0];
    offset[2] = ballTimer[id].rb.sprite ? offset[1] + 11 : offset[1];
    if (color && !gameEnd) {
        timer.expires = Date.now() + 19999;
        timer.left = Math.floor((timer.expires - Date.now()) / 1000);
        if (!timer.sprite && actPup[i]) {
            timer.sprite = tr.prettyText(timer.left, color);
            timer.sprite.x = 40;
            timer.sprite.y = -5 + offset[i];
            tagpro.players[id].sprites.info.addChild(timer.sprite);
            timer.timeout = setTimeout(function() {
                tr.drawBallTimer(timer, id, i);
            }, 50);
        }
    } else {
        if (actPup[i] && timer.expires - Date.now() > 0 && !gameEnd) {
            if (timer.expires - Date.now() > 10000) {
                timer.left = Math.floor((timer.expires - Date.now()) / 1000);
            } else {
                timer.left = (Math.floor((timer.expires - Date.now()) / 100) / 10 + '.0').substr(0, 3);
            }
            timer.sprite.setText(timer.left);
            timer.sprite.y = -5 + offset[i];
            timer.timeout = setTimeout(function() {
                tr.drawBallTimer(timer, id, i);
            }, 50);
        } else {
            if (timer.timeout) {
                clearTimeout(timer.timeout);
            }
            if (timer.sprite) {
                tagpro.players[id].sprites.info.removeChild(timer.sprite);
                timer.sprite = null;
                timer.expires = 0;
                timer.left = 0;
            }
        }
    }
};

function getNearestPup(px, py) {
    var tile = null,
        distance = null,
        nearest = 9999;
    for (var x = 0, xl = tagpro.map.length, yl = tagpro.map[0].length; x < xl; x++) {
        for (var y = 0; y < yl; y++) {
            if (Math.floor(tagpro.map[x][y]) !== 6) continue;
            distance = Math.sqrt((px - x * 40) * (px - x * 40) + (py - y * 40) * (py - y * 40));
            if (distance < nearest) {
                nearest = distance;
                tile = {x: x, y: y, v: tagpro.map[x][y], id: x + '' + y};
            }
        }
    }
    checkTile(tile, 59999, '#00FF00', true);
}

function getRepeatGrabs(oldPowerup, x, y) {
    for (var id in tagpro.players) {
        if (!tagpro.players.hasOwnProperty(id) && !tagpro.players[id].draw && tagpro.players[id].dead) continue;
        var player = tagpro.players[id],
            timer = ballTimer[id],
            distance = Math.sqrt(Math.pow((player.x + player.lx * 7) - x * 40, 2) + Math.pow((player.y + player.ly * 7) - y * 40, 2));
        if (distance < 40) {
            if (player.grip && oldPowerup === 6.1) {
                timer.jj.check = true;
                checkPlayer(id, true);
            } else if (player.bomb && oldPowerup === 6.2) {
                timer.rb.check = true;
                checkPlayer(id, true);
            } else {
                if (player.tagpro && oldPowerup === 6.3) {
                    timer.tp.check = true;
                    checkPlayer(id, true);
                }
            }
        }
    }
}

}