// ==UserScript==
// @name       		Browncoat's TagPro Mod
// @version    		2.0.0
// @description  	Better particles, drop shadows, spinning options (ball, flair, overlay)
// @include			http://*.koalabeast.com:*
// @include			http://*.jukejuice.com:*
// @include			http://*.newcompte.fr:*
// @author  		Browncoat
// ==/UserScript==

tagpro.ready(function () {

    // ignore this, options are below
    var SpinType = {OFF: 0, WHOLE_BALL: 1, OVERLAY: 2};

    // OPTIONS

    // Show a shine image on top of the ball, which won't spin
    var showBallShine = false;
    var shineUrl = "http://i.imgur.com/YsZccQv.png";

    /**
     *  How to handle the ball spinning.
     *   SpinType.OFF - no spinning
     *   SpinType.WHOLE_BALL - spin the entire ball as it is on your texture pack
     *   SpinType.OVERLAY - spin the specified overlay image url.
     */
    var spinType = SpinType.OVERLAY;

    // 40x40 image
    var spinOverlayUrl = "";

    // Puts the flair in the middle of the ball
    var centerFlair = false;

    // Spins the flair (only if centered)
    var spinFlair = true;

    // Drop shadows under each ball
    var drawDropShadows = false;
    var dropShadowUrl = "";

    // Ball transparency. 0 = invisible, 100 = opaque
    var ballTransparency = 80;

    // Team colors. Affects speed particles, death particles, score colors. Change if your texture pack is not red/blue
    var redTeamColor = "ff0000";
    var blueTeamColor = "0000ff";
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


    // Particles

    // https://cloudkidstudio.github.io/PixiParticlesEditor/
    tr.particleFireTexture = tr.particleTexture;


    tagpro.particleDefinitions.tagproSparks = {
        "alpha": {
            "start": 0.98,
            "end": 0
        },
        "scale": {
            "start": 0.25,
            "end": 0.25,
            "minimumScaleMultiplier": 1
        },
        "color": {
            "start": "#7cf575",
            "end": "#7cf575"
        },
        "speed": {
            "start": 0,
            "end": 0
        },
        "acceleration": {
            "x": 0,
            "y": 0
        },
        "startRotation": {
            "min": 0,
            "max": 360
        },
        "rotationSpeed": {
            "min": 0,
            "max": 0
        },
        "lifetime": {
            "min": 0.1,
            "max": 0.9
        },
        "blendMode": "normal",
        "frequency": 0.01,
        "emitterLifetime": -1,
        "maxParticles": 50,
        "pos": {
            "x": 20,
            "y": 20
        },
        "addAtBack": true,
        "spawnType": "circle",
        "spawnCircle": {
            "x": 0,
            "y": 0,
            "r": 20
        }
    };

    var redPlayerEmitter = {
        "alpha": {
            "start": 0.1,
            "end": 0
        },
        "scale": {
            "start": 1,
            "end": 1,
            "minimumScaleMultiplier": 1
        },
        "color": {
            "start": redColorHex,
            "end": redColorHex
        },
        "speed": {
            "start": 0,
            "end": 0
        },
        "acceleration": {
            "x": 0,
            "y": 0
        },
        "startRotation": {
            "min": 0,
            "max": 0
        },
        "rotationSpeed": {
            "min": 0,
            "max": 0
        },
        "lifetime": {
            "min": 1,
            "max": 1
        },
        "blendMode": "normal",
        "frequency": 0.02,
        "emitterLifetime": -1,
        "maxParticles": 100,
        "pos": {
            "x": 20,
            "y": 20
        },
        "addAtBack": false,
        "spawnType": "point"
    };

    var bluePlayerEmitter = {
        "alpha": {
            "start": 0.1,
            "end": 0
        },
        "scale": {
            "start": 1,
            "end": 1,
            "minimumScaleMultiplier": 1
        },
        "color": {
            "start": blueColorHex,
            "end": blueColorHex
        },
        "speed": {
            "start": 0,
            "end": 0
        },
        "acceleration": {
            "x": 0,
            "y": 0
        },
        "startRotation": {
            "min": 0,
            "max": 0
        },
        "rotationSpeed": {
            "min": 0,
            "max": 0
        },
        "lifetime": {
            "min": 1,
            "max": 1
        },
        "blendMode": "normal",
        "frequency": 0.02,
        "emitterLifetime": -1,
        "maxParticles": 100,
        "pos": {
            "x": 20,
            "y": 20
        },
        "addAtBack": false,
        "spawnType": "point"
    };

    tagpro.particleDefinitions.death = {
        "alpha": {
            "start": 0.6,
            "end": 0.3
        },
        "scale": {
            "start": 0.3,
            "end": 0.001,
            "minimumScaleMultiplier": 1
        },
        "color": {
            "start": "#ffffff",
            "end": "#ffffff"
        },
        "speed": {
            "start": 300,
            "end": 300
        },
        "acceleration": {
            "x": 0,
            "y": 0
        },
        "startRotation": {
            "min": 0,
            "max": 360
        },
        "rotationSpeed": {
            "min": 0,
            "max": 0
        },
        "lifetime": {
            "min": 0.001,
            "max": 0.4
        },
        "blendMode": "normal",
        "frequency": 0.001,
        "emitterLifetime": 0.02,
        "maxParticles": 50,
        "pos": {
            "x": 0,
            "y": 0
        },
        "addAtBack": false,
        "spawnType": "circle",
        "spawnCircle": {
            "x": 0,
            "y": 0,
            "r": 0
        }
    };

    tagpro.particleDefinitions.rollingBomb = {
        "alpha": {
            "start": 0.45,
            "end": 0
        },
        "scale": {
            "start": 0.5,
            "end": 0.2,
            "minimumScaleMultiplier": 1
        },
        "color": {
            "start": "#85888d",
            "end": "#100f0c"
        },
        "speed": {
            "start": 0,
            "end": 0
        },
        "acceleration": {
            "x": 0,
            "y": 0
        },
        "startRotation": {
            "min": 0,
            "max": 360
        },
        "rotationSpeed": {
            "min": 0,
            "max": 0
        },
        "lifetime": {
            "min": 0.5,
            "max": 2
        },
        "blendMode": "normal",
        "frequency": 0.001,
        "emitterLifetime": -1,
        "maxParticles": 50,
        "pos": {
            "x": 0,
            "y": 0
        },
        "addAtBack": false,
        "spawnType": "circle",
        "spawnCircle": {
            "x": 20,
            "y": 20,
            "r": 20
        }
    };

    // Override this to have different player emitters for red and blue
    tagpro.renderer.createPlayerEmitter = function (player) {
        if (tr.options.disableParticles) {
            return;
        }
        var emitter = player.team == 1 ? redPlayerEmitter : bluePlayerEmitter;
        player.sprites.emitter = new cloudkid.Emitter(tr.layers.midground, [tr.particleTexture], emitter);
        player.sprites.emitter.keep = true;
        tr.emitters.push(player.sprites.emitter);
        player.sprites.emitter.emit = false;
    };

    // Ensures emitter color is changed if a ball swaps teams
    var defaultUpdatePlayerColor = tr.updatePlayerColor;
    tr.updatePlayerColor = function (player) {
        var color = player.team == 1 ? "red" : "blue";
        var tileId = color + "ball";
        if (player.sprites.actualBall.tileId != tileId) {
            // remove old emitter
            tr.emitters.splice(tr.emitters.indexOf(player.sprites.emitter), 1);

            // create new one
            tr.createPlayerEmitter(player);
        }

        defaultUpdatePlayerColor(player);
    };

    // Use custom red/blue colors for the death emitter
    var defaultStartDeathEmitter = tr.startDeathEmitter;
    tr.startDeathEmitter = function (startColor, stopColor, x, y) {
        var isRed = startColor == "ff0000";
        var color = isRed ? redTeamColor : blueTeamColor;
        defaultStartDeathEmitter(color, stopColor, x, y);
    };


    // Override this to add tagpro particles to the foreground, meaning they leave a trail instead of following the player
    tr.updateTagpro = function (player) {
        /* Updates whether a player should have tagpro. */
        if (player.tagpro) {
            if (!player.sprites.tagproTint) {
                var tint = player.sprites.tagproTint = new PIXI.Graphics();
                tint.beginFill(0x00FF00, .35).lineStyle(2, 0x00FF00).drawCircle(20, 20, 19);
                player.sprites.ball.addChild(tint);
                if (!tr.options.disableParticles) {
                    player.sprites.tagproSparks = new cloudkid.Emitter(
                        tr.layers.foreground,
                        [tr.particleTexture],
                        tagpro.particleDefinitions.tagproSparks);
                    player.sprites.tagproSparks.player = player.id;
                    player.sprites.tagproSparks.keep = true;
                    tr.emitters.push(player.sprites.tagproSparks);
                }
            }
            if (player.sprites.tagproSparks) {
                var emit = !player.dead && player.sprite.visible;
                if (emit && !player.sprites.tagproSparks.emit) {
                    player.sprites.tagproSparks.emit = true;
                } else if (!emit && player.sprites.tagproSparks.emit) {
                    player.sprites.tagproSparks.emit = false;
                }
                player.sprites.tagproSparks.updateSpawnPos(player.x+20, player.y+20);
            }
        } else {
            if (player.sprites.tagproTint) {
                player.sprites.ball.removeChild(player.sprites.tagproTint);
                player.sprites.tagproTint = null;
            }
            if (player.sprites.tagproSparks) {
                player.sprites.tagproSparks.emit = false;
            }
        }
    };

    // Override this to add rb particles to the foreground, meaning they leave a trail instead of following the player
    tr.updateRollingBomb = function (player) {
        /* Updates whether a player should have rolling bomb.*/
        if (player.bomb) {
            if (!player.sprites.bomb) {
                if (!tr.options.disableParticles) {
                    player.sprites.rollingBomb = new cloudkid.Emitter(
                        tr.layers.foreground,
                        [tr.particleTexture],
                        tagpro.particleDefinitions.rollingBomb);
                    tr.emitters.push(player.sprites.rollingBomb);
                    player.sprites.rollingBomb.keep = true;
                }


                var bomb = player.sprites.bomb = new PIXI.Graphics();
                bomb.beginFill(0xFFFF00, .6).drawCircle(20, 20, 19);
                player.sprites.ball.addChild(bomb);
            } else {
                player.sprites.bomb.alpha = Math.abs(.6 * Math.sin(performance.now() / 150));
                if (player.sprites.rollingBomb) {
                    var emit = !player.dead && player.sprite.visible;
                    if (emit && !player.sprites.rollingBomb.emit) {
                        player.sprites.rollingBomb.emit = true;
                    } else if (!emit && player.sprites.rollingBomb.emit) {
                        player.sprites.rollingBomb.emit = false;
                    }
                    player.sprites.rollingBomb.updateSpawnPos(player.x, player.y);
                }
            }
        } else {
            if (player.sprites.bomb) {
                player.sprites.ball.removeChild(player.sprites.bomb);
                player.sprites.bomb = null;
            }
            if (player.sprites.rollingBomb) {
                if (player.sprites.rollingBomb instanceof cloudkid.Emitter) {
                    player.sprites.rollingBomb.emit = false;
                } else {
                    player.sprites.rollingBomb.visible = false;
                }
            }
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
        }

        // Create drop shadow
        if (drawDropShadows) {
            ensureShadowsLayer();
            if (!player.sprites.dropShadow) {
                player.sprites.dropShadow = new PIXI.Sprite(dropShadow);
                tr.layers.shadowLayer.addChild(player.sprites.dropShadow);
            }
            player.sprites.dropShadow.x = player.x - 10;
            player.sprites.dropShadow.y = player.y - 10;
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