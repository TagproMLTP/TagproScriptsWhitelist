// ==UserScript==
// @name       		TagPro Big Textures
// @version    		1.0.0
// @description  	Ability to have a large texture for tiles instead of the default 40x40 image
// @include			http://tagpro-*.koalabeast.com:*
// @include			http://tangent.jukejuice.com:*
// @include			http://*.newcompte.fr:*
// @author  		Browncoat
// ==/UserScript==


// ----- USER SETTINGS -----

var textureURL = "http://i.imgur.com/hMln1lJ.jpg"; // URL of the texture you want to use

var redColor = 0xFF00000; // Color of the red team tiles

var blueColor = 0x00000FF; // Color of the blue team tiles

var teamTileOpacity = 0.2; // between 0 and 1

// ----- END USER SETTINGS -----

log("Initialising ...");

var loader = new PIXI.ImageLoader(textureURL);
var textureLoaded = false;
loader.onLoaded = function () {
    log("Texture loaded");
    textureLoaded = true;
};
loader.load();

var image = new Image();
image.crossOrigin = "Anonymous";
image.src = textureURL;
var imageLoaded = false;
image.onload = function () {
    imageLoaded = true;
};

onReady(function () {

    var baseTexture = PIXI.Texture.fromImage(image.src, true);
    log("Base texture size: " + baseTexture.width + "x" + baseTexture.height);

    var fittedCanvas = document.createElement("canvas");
    fittedCanvas.width = baseTexture.width + 40;
    fittedCanvas.height = baseTexture.height + 40;

    var ctx = fittedCanvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    ctx.drawImage(image, baseTexture.width, 0);
    ctx.drawImage(image, 0, baseTexture.height);
    ctx.drawImage(image, baseTexture.width, baseTexture.height);

    var fittedTexture = PIXI.Texture.fromCanvas(fittedCanvas);

    var floorTiles = [
        2, // grey floor
        11, // red tt
        12, // blue tt
        17, // red goal
        18 // blue goal
    ];

    var TileType = {
        NORMAL: 2,
        RED_TEAM_TILE: 11,
        BLUE_TEAM_TILE: 12,
        RED_GOAL: 17,
        BLUE_GOAL: 18
    };

    log("Initialised");

    // cache every 40x40 block of the base texture
    function getTexture(x, y) {
        x %= baseTexture.width;
        y %= baseTexture.height;
        var key = "b" + x + "," + y;
        if (!PIXI.TextureCache[key]) {
            try {
                PIXI.TextureCache[key] = new PIXI.Texture(fittedTexture, new PIXI.Rectangle(x, y, 40, 40));
            } catch (e) {
                log("Error creating texture. Fitted texture:");
                console.log(fittedTexture);
                console.error(e);
            }
        }
        return PIXI.TextureCache[key];
    }

    var tagproTilesDraw = tagpro.tiles.draw;
    tagpro.tiles.draw = function (container, tileType, position, width, height, alpha, addAtBottom) {
        var isFloorTile = floorTiles.indexOf(tileType) !== -1;
        var caller = tagpro.tiles.draw.caller;
        var rightCaller = caller === tagpro.tiles.drawLayers || caller === tagpro.renderer.drawDynamicTile;
        if (isFloorTile && rightCaller) {
            var tile = tagpro.tiles[tileType];
            if (!tile || tile.draw) {
                return null;
            }

            var texture = getTexture(position.x, position.y);
            var sprite = new PIXI.Sprite(texture);
            sprite.position.x = position.x;
            sprite.position.y = position.y;
            sprite.width = width || 40;
            sprite.height = height || 40;
            sprite.alpha = alpha || 1;

            if (tileType == TileType.RED_TEAM_TILE) {
                sprite.addChild(createTileSprite(redColor));
            } else if (tileType == TileType.BLUE_TEAM_TILE) {
                sprite.addChild(createTileSprite(blueColor));
            } else if (tileType == TileType.RED_GOAL) {
                sprite.addChild(createCheckedTileSprite(redColor));
            } else if (tileType == TileType.BLUE_GOAL) {
                sprite.addChild(createCheckedTileSprite(blueColor));
            }
            addAtBottom ? container.addChildAt(sprite, 0) : container.addChild(sprite);

            return sprite;
        } else {
            return tagproTilesDraw(container, tileType, position, width, height, alpha, addAtBottom);
        }
    };

    function createTileSprite(color, size) {
        size = size || 40;
        var graphics = new PIXI.Graphics();
        graphics.lineStyle(0);
        graphics.beginFill(color, teamTileOpacity);
        graphics.drawRect(0, 0, size, size);
        graphics.endFill();
        return graphics;
    }

    function createCheckedTileSprite(color) {
        var tile = new PIXI.DisplayObjectContainer();
        var underlay = createTileSprite(color);
        var check1 = createTileSprite(color, 20, 20);
        var check2 = createTileSprite(color, 20, 20);
        check2.position.x = 20;
        check2.position.y = 20;
        tile.addChild(underlay);
        tile.addChild(check1);
        tile.addChild(check2);
        return tile;
    }

});

function onReady(f) {
    if (!tagpro || !tagpro.renderer || !tagpro.renderer.renderer || !imageLoaded || !textureLoaded) {
        setTimeout(function () {
            onReady(f);
        }, 10);
    } else {
        f();
    }
}

function log(message) {
    console.log("[BIG-TEXTURES] " + message);
}