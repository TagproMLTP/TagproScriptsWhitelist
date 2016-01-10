// This script is injected into the pages <head> and does not have
// access to any of the extensions variables, but it has access to
// the tagpro variable

// Let extension know we're ready
window.postMessage({
    type: "INJECTED_SCRIPT_READY"
}, "*");

log("Adding listener for 'main' message");
window.addEventListener("message", function (event) {
    if (event.source != window) return;
    if (event.data.type && (event.data.type == "MAP_DECAL_MAIN")) {
        var main = JSON.parse(event.data.mainString);
        if (main.settings.enabled) {
            tagpro.ready(function () {
                initialise(main);
            });
        }
    }
});

var initialised = false;
function initialise(main) {
    if (initialised) return;
    initialised = true;
    var tr = tagpro.renderer;
    var mapWidth = 0;
    var mapHeight = 0;
    var map = null;
    var applicableDecalSet = null;
    const TILE_SIZE = 40;

    // Fixes a bug where drawName is being called from a socket player join event
    // and player.sprites.info is not defined
    var drawName = tr.drawName;
    tr.drawName = function (player, forceUpdate) {
        if (!player.sprites.info) {
            log("Warning: player.sprites.info was undefined, drawName not called");
        } else {
            drawName(player, forceUpdate);
        }
    };

    if (tagpro.map) {
        log("Map already set");
        setMap(tagpro.map);
    } else {
        log("Map not set, adding socket.on(map) handler");
        tagpro.socket.on("map", function (_map) {
            try {
                setMap(_map);
            } catch (e) {
                log("Error setting map");
                console.error(e);
            }
        });
    }

    function setMap(_map) {
        logObject("Got map:", _map);
        map = _map;
        if (map.info) {
            var width = map.tiles.length || 0;
            var height = map.tiles[0] ? map.tiles[0].length : 0;
            mapWidth = width * TILE_SIZE;
            mapHeight = height * TILE_SIZE;
            for (var i = 0; i < main.allDecalSets.length; i++) {
                var decalSet = main.allDecalSets[i];
                if (isEnabled(decalSet, main.settings)) {
                    var mapInfo = getMapForDecalSet(decalSet, map.info.name);
                    if (mapInfo && isMapEnabled(decalSet, map.info.name, main.settings)) {
                        log("Found applicable decal set: " + decalSet.decalSetName + " by " + decalSet.decalSetAuthor);
                        applicableDecalSet = decalSet;
                        setInterval(ensureDecalSets, 1000);
                        drawDecalSet();
                        break;
                    }
                }
            }
        }
    }

    function drawDecalSet() {
        log("Drawing decal sets");
        createFloorDecalLayer();
        createWallDecalLayer();
        var mapInfo = getMapForDecalSet(applicableDecalSet, map.info.name);
        addDecalToLayer(mapInfo.floorDecalURL, tr.layers.floorDecalLayer);
        addDecalToLayer(mapInfo.wallDecalURL, tr.layers.wallDecalLayer);
        if (applicableDecalSet.textures) {
            log("Applying custom texture pack for this decal set");
            applyTextures(applicableDecalSet.textures);
        }
    }

    /**
     * Run this every second to ensure our layers haven't been removed - some texture pack scripts
     * clear out and recreate layers.
     */
    function ensureDecalSets() {
        var floorLayerExists = tr.layers.floorDecalLayer
            && tr.layers.midground.children.indexOf(tr.layers.floorDecalLayer) >= 0;
        var wallLayerExists = tr.layers.wallDecalLayer
            && tr.gameContainer.children.indexOf(tr.layers.wallDecalLayer) >= 0;
        if (!floorLayerExists || !wallLayerExists) {
            log("[WARNING] Decal set layers have been removed (probably through another script). Redrawing...");
            clearDecalSets();
            drawDecalSet();
        }
    }

    function clearDecalSets() {
        if (tr.layers.floorDecalLayer) {
            tr.layers.floorDecalLayer.removeChildren();
            tr.layers.midground.removeChild(tr.layers.floorDecalLayer);
            delete tr.layers.floorDecalLayer;
        }
        if (tr.layers.wallDecalLayer) {
            tr.layers.wallDecalLayer.removeChildren();
            tr.gameContainer.removeChild(tr.layers.wallDecalLayer);
            delete tr.layers.wallDecalLayer;
        }
    }

    function applyTextures(textures) {
        var tileTypes = ['tiles', 'speedpad', 'speedpadred', 'speedpadblue', 'portal', 'splats', 'flair'];
        for (var i = 0; i < tileTypes.length; i++) {
            var type = tileTypes[i];
            if (textures[type]) {
                log("Replacing '" + type + "' texture");
                var element = document.getElementById(type);
                if (element) {
                    element.src = textures[type];
                }
            }
        }
        // TODO refresh?
    }

    function addDecalToLayer(decalURL, layer) {
        if (decalURL) {
            var texture = PIXI.Texture.fromImage(decalURL);
            var sprite = new PIXI.Sprite(texture);
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            sprite.x = Math.round(mapWidth / 2);
            sprite.y = Math.round(mapHeight / 2);
            if (layer) {
                layer.addChild(sprite);
            } else {
                log("Layer is null");
            }
            log("Added '" + decalURL + "' at (" + sprite.x + ", " + sprite.y + ")")
        }
    }

    function createWallDecalLayer() {
        tr.layers.wallDecalLayer = new PIXI.DisplayObjectContainer();
        var foregroundIndex = tr.gameContainer.getChildIndex(tr.layers.foreground);
        tr.gameContainer.addChildAt(tr.layers.wallDecalLayer, foregroundIndex);
    }

    function createFloorDecalLayer() {
        tr.layers.floorDecalLayer = new PIXI.DisplayObjectContainer();
        var splatsIndex = tr.layers.midground.getChildIndex(tr.layers.splats);
        tr.layers.midground.addChildAt(tr.layers.floorDecalLayer, splatsIndex);
    }

    function getMapForDecalSet(decalSet, mapName) {
        for (var i = 0; i < decalSet.maps.length; i++) {
            var mapInfo = decalSet.maps[i];
            if (mapInfo.name == mapName) {
                return mapInfo;
            }
        }
        return null;
    }
}

function isEnabled(decalSet, settings) {
    var disabledSets = settings.disabledSets;
    for (var i = 0; i < disabledSets.length; i++) {
        var setting = disabledSets[i];
        if (setting.setName == decalSet.decalSetName && setting.setAuthor == decalSet.decalSetAuthor) {
            return false;
        }
    }
    return true;
}

function isMapEnabled(decalSet, mapName, settings) {
    var disabledMaps = settings.disabledMaps;
    for (var i = 0; i < disabledMaps.length; i++) {
        var setting = disabledMaps[i];
        if (setting.setName == decalSet.decalSetName && setting.setAuthor == decalSet.decalSetAuthor && setting.mapName == mapName) {
            return false;
        }
    }
    return true;
}


function log(message) {
    console.log("[DECALS][INJECTED] " + message);
}

function logObject(description, object) {
    log(description);
    console.log(object);
}
