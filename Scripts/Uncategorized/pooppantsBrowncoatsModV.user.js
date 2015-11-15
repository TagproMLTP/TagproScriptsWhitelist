// ==UserScript==
// @name       		Browncoat's TagPro Mod V POOPPANTS
// @version    		2.0.0
// @description  	Better particles, drop shadows, spinning options (ball, flair, overlay)
// @include			http://*.koalabeast.com:*
// @include			http://*.jukejuice.com:*
// @include			http://*.newcompte.fr:*
// @author  		Browncoat
// ==/UserScript==

tagpro.ready(function () {

    // ignore this, options are below
    var SpinType = 2;

    // OPTIONS

    // Show a shine image on top of the ball, which won't spin
    var showBallShine = true;
    var shineUrl = "http://i.imgur.com/CEkwOz6.png";
    // http://i.imgur.com/fGC4bPC.png

    /**
     *  How to handle the ball spinning.
     *   SpinType.OFF - no spinning
     *   SpinType.WHOLE_BALL - spin the entire ball as it is on your texture pack
     *   SpinType.OVERLAY - spin the specified overlay image url.
     */
    var spinType = SpinType.OVERLAY;

    // 40x40 image
    var spinOverlayUrl = "http://i.imgur.com/ZX498ko.png";

    // Puts the flair in the middle of the ball
    var centerFlair = false;

    // Spins the flair (only if centered)
    var spinFlair = true;

    // Drop shadows under each ball
    var drawDropShadows = false;
    var dropShadowUrl = "http://i.imgur.com/hBCuN9J.png";

    // Ball transparency. 0 = invisible, 100 = opaque
    var ballTransparency = 100;

    // Team colors. Affects speed particles, death particles, score colors. Change if your texture pack is not red/blue
    var redTeamColor = "F23A3A";
    var blueTeamColor = "42ADE3";
    var redTeamName = "Red";
    var blueTeamName = "Blue";


    // END OPTIONS. Only the bravest dare go on.


    var tr = tagpro.renderer;

    var redColorHex = "#" + redTeamColor;
    var blueColorHex = "#" + blueTeamColor;

    // Team score colors
    tagpro.ui.scores = function () {
        var n = tagpro.score.r ? tagpro.score.r.toString() : "0";
        var r = tagpro.score.b ? tagpro.score.b.toString() : "0";
        if (tagpro.ui.sprites.redScore) {
            tagpro.ui.sprites.redScore.text != n && tagpro.ui.sprites.redScore.setText(n);
            tagpro.ui.sprites.blueScore.text != r && tagpro.ui.sprites.blueScore.setText(r);
        } else {

            var redStroke = "#000000";
            if (redColorHex == "#000000") {
                redStroke = "#FFFFFF"
            }
            var blueStroke = "#000000";
            if (blueColorHex == "#000000") {
                blueStroke = "#FFFFFF"
            }

            tagpro.ui.sprites.redScore = new PIXI.Text(n, {fill: redColorHex, stroke: redStroke, strokeThickness: 2, font: "bold 40pt Arial"});
            tagpro.ui.sprites.blueScore = new PIXI.Text(r, {fill: blueColorHex, stroke: blueStroke, strokeThickness: 2, font: "bold 40pt Arial"});
            tagpro.ui.sprites.redScore.alpha = .5;
            tagpro.ui.sprites.blueScore.alpha = .5;
            tagpro.ui.sprites.redScore.anchor.x = 1;
            tagpro.ui.sprites.blueScore.anchor.x = 0;
            tagpro.renderer.layers.ui.addChild(tagpro.ui.sprites.redScore);
            tagpro.renderer.layers.ui.addChild(tagpro.ui.sprites.blueScore);
        }
    };

    // Transparency
    if (ballTransparency < 100 && ballTransparency > 0) {
        var defaultCreateBallSprite = tr.createBallSprite;
        tr.createBallSprite = function (player) {
            defaultCreateBallSprite(player);
            player.sprites.actualBall.alpha = ballTransparency/100;
        };
    }

    // Large alerts (match
    tr.largeText = function (text, color) {
        if (color == "#ff0000" || color == "#FF0000") {
            color = redColorHex;
        } else if (color == "#0000ff" || color == "#0000FF") {
            color = blueColorHex;
        }

        var stroke = "#000000";
        if (color == "#000000") {
            stroke = "#FFFFFF";
        }

        if (text == "Red Wins!") {
            text = redTeamName + " Wins!";
        } else if(text == "Blue Wins!") {
            text = blueTeamName + " Wins!";
        }

        return new PIXI.Text(text,
            {
                font: "bold 48pt arial",
                fill: color || "#ffffff",
                stroke: stroke,
                strokeThickness: 2
            });
    };

    // Ball shine & spin

    var shineTexture = PIXI.Texture.fromImage(shineUrl);
    var spinOverlay = PIXI.Texture.fromImage(spinOverlayUrl);
    var dropShadow = PIXI.Texture.fromImage(dropShadowUrl);

    function ensureShadowsLayer() {
        if (!tr.layers.shadowLayer) {
            tr.layers.shadowLayer = new PIXI.DisplayObjectContainer();
            var foregroundIndex = tr.gameContainer.getChildIndex(tr.layers.foreground);
            tr.gameContainer.addChildAt(tr.layers.shadowLayer, foregroundIndex);
        }
    }

    var defaultUpdatePlayerSpritePosition = tr.updatePlayerSpritePosition;
    tr.updatePlayerSpritePosition = function (player) {
        // Create shine
        if (showBallShine && !player.sprites.shine) {
            player.sprites.shine = new PIXI.Sprite(shineTexture);
            player.sprites.ball.addChild(player.sprites.shine);
            //player.sprites.shine.x = -40;
            //player.sprites.shine.y = -40;
        }

        // Create drop shadow
        if (drawDropShadows) {
            ensureShadowsLayer();
            if (!player.sprites.dropShadow) {
                player.sprites.dropShadow = new PIXI.Sprite(dropShadow);
                tr.layers.shadowLayer.addChild(player.sprites.dropShadow);
            }
            player.sprites.dropShadow.x = player.x + 4;
            player.sprites.dropShadow.y = player.y + 4;
        }

        if (spinType == SpinType.WHOLE_BALL) {
            // Set rotation anchor
            if (!player.sprites.actualBall.anchor.x) {
                player.sprites.actualBall.anchor.x = 0.5;
                player.sprites.actualBall.anchor.y = 0.5;
                player.sprites.actualBall.x = 20;
                player.sprites.actualBall.y = 20;
            }

            // Set rotation
            player.sprites.actualBall.rotation = player.angle;
        } else if (spinType == SpinType.OVERLAY) {
            if (!player.sprites.spinOverlay) {
                player.sprites.spinOverlay = new PIXI.Sprite(spinOverlay);
                player.sprites.ball.addChild(player.sprites.spinOverlay);
                player.sprites.spinOverlay.anchor.x = 0.5;
                player.sprites.spinOverlay.anchor.y = 0.5;
                player.sprites.spinOverlay.x = 20;
                player.sprites.spinOverlay.y = 20;
            }
            player.sprites.spinOverlay.rotation = player.angle;
        }

        defaultUpdatePlayerSpritePosition(player);
    };

    // Flair
    if (centerFlair) {
        tr.drawFlair = function (player) {
            /* Draws the player's flair if it doesn't exist.
             * @param player {object} The player object.
             * */
            if (player.flair) {
                if (!player.sprites.flair) {
                    var cacheKey = "flair-" + player.flair.x + "," + player.flair.y;
                    var flairTexture = tr.getFlairTexture(cacheKey, player.flair);
                    player.sprites.flair = new PIXI.Sprite(flairTexture);
                    player.sprites.flair.x = 20;
                    player.sprites.flair.y = 20;
                    player.sprites.flair.anchor.x = 0.5;
                    player.sprites.flair.anchor.y = 0.5;
                    player.sprites.info.addChild(player.sprites.flair);
                }
                if (spinFlair) {
                    player.sprites.flair.rotation = player.angle;
                }
            }
            if (!player.flair && player.sprites.flair) {
                player.sprites.info.removeChild(player.sprites.flair);
            }
        };
    }

});