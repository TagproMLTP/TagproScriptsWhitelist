// ==UserScript==
// @name          TagPro Extra Settings
// @version       0.1.5
// @description   Additional settings to TagPro just the way you want it
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// @author        Some Ball -1
// @grant         none
// ==/UserScript==

tagpro.ready(function() {
    // Change game border appearance
    var newBorderSize = 5; // number (in pixels) for the border, game default is 10
    
    // Show a pop-up confirmation message when trying to leave a game before it's over
    var DCConfirm = true; // true or false
    
    // Display your ball, name, degree, flag, and powerup status on top of all other balls every game
    var drawUsOnTop = true // true or false
    
    // Show special particles for the flag carrier
    var showFlagParticles = true; // true or false
    
    // Center names above player balls
    var centerNames = true; //true or false
    
    // Force player names to resize along with everything else when spectating (like the old game behavior)
    var forceNameResize = false; //true or false
    
    // Force player degrees to resize along with everything else when spectating (like the old game behvaior)
    var forceDegreeResize = true; //true or false
    
    // Force player flair to resize along with everything else when spectating (like the old game behavior)
    var forceFlairResize = true; //true or false
    
    // Center player flair in the middle of the ball
    var centerFlair = true; //true or false
    
    // Force flags on the flag carrier to resize along with everything else when spectating (like the old game behavior)
    var forceFlagsResize = true; //true or false
    
    // Move switch teams button up to the same line as the player name
    var moveSwitchButton = true; // true or false
    
    // Hide sharing elements from the scoreboard (reddit, facebook, and twitter links)
    var hideSharing = true; //true or false
    
    ///////////////////////////////////////////////
    /***********NO MORE OPTIONS TO EDIT***********/
    ///////////////////////////////////////////////
    var tr = tagpro.renderer;
    $('#viewportDiv').css('border',newBorderSize+'px solid white');
    tr.resizeView = function () {
        /* Resizes the canvas contained under the renderer. */
        if (!tr.renderer) {
            return;
        }
        var $window = $(window),
            width = $window.width() - newBorderSize,
            height = $window.height() - newBorderSize;
 
        if (width > tr.canvas_width) width = tr.canvas_width;
        if (height > tr.canvas_height) height = tr.canvas_height;
 
        var adjustedHeight = Math.round((width * tr.canvas_height) / tr.canvas_width);
        var adjustedWidth = 0;
 
        if (adjustedHeight > height) {
            adjustedWidth = Math.round(((height * tr.canvas_width) / tr.canvas_height));
            adjustedHeight = height;
        }
        else
            adjustedWidth = width;
 
        tr.renderer.resize(adjustedWidth, adjustedHeight);
    };
    tr.centerView = function () {
        /* Centers the canvas and canvasDiv. Resizes canvasDiv if necessary. */
        var viewport = $('#viewport');
        var viewportDiv = $('#viewportDiv');
        var height = $(window).height();
        var width = $(window).width();
        viewport.css({
            position: 'absolute',
            left: (width - viewport.outerWidth()) / 2,
            top: (height - viewport.outerHeight()) / 2
        });
        viewportDiv.css({
            position: 'absolute',
            width: viewport.outerWidth(),
            height: viewport.outerHeight(),
            left: (width - viewport.outerWidth()) / 2 - newBorderSize,
            top: (height - viewport.outerHeight()) / 2 - newBorderSize
        });
 
        var options = $("#options");
        options.css({
            position: 'absolute',
            left: ($(window).width() - options.width()) / 2,
            top: ($(window).height() - options.height()) / 2
        });
 
        tagpro.ui.resize(viewport.width(), viewport.height());
        tr.vpWidth = viewport.width();
        tr.vpHeight = viewport.height();
        tagpro.chat.resize();
    };
    tr.resizeAndCenterView();
    if(DCConfirm)
    {
        setTimeout(function() {
            window.addEventListener("beforeunload", function (e) {
                if(tagpro.state==1)
                {
                    var confirmationMessage = "You will be leaving your Tagpro Game. Are you sure ?";
                    (e || window.event).returnValue = confirmationMessage;     //Gecko + IE
                    return confirmationMessage;                                //Webkit, Safari, Chrome etc.
                }
            });
        }, 5000); //wait 5 secs to account for joiner bug
    }
    if(drawUsOnTop)
    {
        var oldAdd = tr.addPlayerSprite;
        tr.addPlayerSprite = function (player) {
            oldAdd(player);
            if(tagpro.players[tagpro.playerId].sprite && tr.layers.foreground.getChildAt(tr.layers.foreground.children.length-1)!==tagpro.players[tagpro.playerId].sprite)
            {
                tr.layers.foreground.setChildIndex(tagpro.players[tagpro.playerId].sprite,tr.layers.foreground.children.length-1);
            }
        };
        tr.updateGrip = function (player) {
            /* Updates whether a player should have jukejuice. */
            if (player.grip) {
                if (!player.sprites.grip) {
                    player.sprites.grip = tagpro.tiles.draw(player.sprites.ball, "grip", { x: 0, y: 23 }, 17, 17);
                } else {
                    player.sprites.ball.setChildIndex(player.sprites.grip, player.sprites.ball.children.length-1);
                }
            } else {
                if (player.sprites.grip) {
                    player.sprites.ball.removeChild(player.sprites.grip);
                    player.sprites.grip = null;
                }
            }
        };
    }
    if(showFlagParticles)
    {
        tagpro.particleDefinitions.redFlagSparks = {
            alpha: {
                start: .75,
                end: 0
            },
            scale: {
                start: 0,
                end: .2,
                minimumScaleMultiplier: 1
            },
            color: {
                start: "#FF8080",
                end: "#BB0000"
            },
            speed: {
                start: 30,
                end: 30
            },
            acceleration: {
                x: 0,
                y: 0
            },
            startRotation: {
                min: 0,
                max: 360
            },
            rotationSpeed: {
                min: 0,
                max: 0
            },
            lifetime: {
                min: .1,
                max: .9
            },
            pos: {
                x: 20,
                y: 20
            },
            spawnCircle: {
                x: 0,
                y: 0,
                r: 0
            },
            blendMode: "normal",
            frequency: .01,
            emitterLifetime: -1,
            maxParticles: 50,
            addAtBack: !0,
            spawnType: "point"
        };
        tagpro.particleDefinitions.blueFlagSparks = {
            alpha: {
                start: .75,
                end: 0
            },
            scale: {
                start: 0,
                end: .2,
                minimumScaleMultiplier: 1
            },
            color: {
                start: "#8080FF",
                end: "#0000BB"
            },
            speed: {
                start: 30,
                end: 30
            },
            acceleration: {
                x: 0,
                y: 0
            },
            startRotation: {
                min: 0,
                max: 360
            },
            rotationSpeed: {
                min: 0,
                max: 0
            },
            lifetime: {
                min: .1,
                max: .9
            },
            pos: {
                x: 20,
                y: 20
            },
            spawnCircle: {
                x: 0,
                y: 0,
                r: 0
            },
            blendMode: "normal",
            frequency: .01,
            emitterLifetime: -1,
            maxParticles: 50,
            addAtBack: !0,
            spawnType: "point"
        };
        tr.updatePlayerFlagParticles = function(player) {
            if(player.flag && !tr.options.disableParticles)
            {
                if(!player.sprites.flagSparks)
                {
                    player.sprites.flagSparks = new cloudkid.Emitter(
                        player.sprites.ball,
                        [tr.particleFireTexture],
                        player.team==1?tagpro.particleDefinitions.redFlagSparks:tagpro.particleDefinitions.blueFlagSparks);
                    player.sprites.flagSparks.player = player.id;
                    tr.emitters.push(player.sprites.flagSparks);
                }
            }
            else if(player.sprites.flagSparks)
            {
                player.sprites.flagSparks.emit = false;
                var sparksIndex = tr.emitters.indexOf(player.sprites.flagSparks);
                tr.emitters.splice(sparksIndex, 1);
                player.sprites.flagSparks.destroy();
                player.sprites.flagSparks = null;
            }
                }
        var old = tr.drawPlayer;
        tr.drawPlayer = function (player, context) {
            tr.updatePlayerFlagParticles(player);
            old(player,context);
        }
    }
    tr.drawName = function (player, forceRedraw) {
        if (!player.sprites.name || forceRedraw) {
            if (player.sprites.name) forceNameResize?player.sprite.removeChild(player.sprites.name):player.sprites.info.removeChild(player.sprites.name);
            var color = player.auth ? "#BFFF00" : "#ffffff";
            player.sprites.name = tr.veryPrettyText(player.name, color);
            player.nameWidth = 0;
            forceNameResize?player.sprite.addChildAt(player.sprites.name,2):player.sprites.info.addChild(player.sprites.name);
        }
        if(!player.nameWidth) player.nameWidth = (new PIXI.Text(player.name, {font: "bold 8pt Arial"})).width; //best guess for canvas text width
        player.sprites.name.x = centerNames?4-Math.round(player.nameWidth/2):20; //round so no blurriness
        player.sprites.name.y = -21;
    };
    if(forceDegreeResize)
    {
        tr.drawDegree = function (player) {
            if (!player.sprites.degrees && player.degree) {
                player.sprites.degrees = tr.veryPrettyText(player.degree + "°");
                //player.sprites.info.addChild(player.sprites.degrees);
                player.sprite.addChildAt(player.sprites.degrees,2);
            }
            if (player.sprites.degrees) {
                player.sprites.degrees.x = 25;
                player.sprites.degrees.y = -10;
            }
        };
    }
    tr.drawFlair = function (player) {
        if (player.flair && !player.sprites.flair) {
            var cacheKey = "flair-" + player.flair.x + "," + player.flair.y;
            var flairTexture = tr.getFlairTexture(cacheKey, player.flair);
            player.sprites.flair = new PIXI.Sprite(flairTexture);
            player.sprites.flair.x = 12;
            player.sprites.flair.y = centerFlair?12:-17;
            forceFlairResize?player.sprite.addChild(player.sprites.flair):player.sprites.info.addChild(player.sprites.flair);
        }
        if (!player.flair && player.sprites.flair) {
            forceFlairResize?player.sprite.removeChild(player.sprites.flair):player.sprites.info.removeChild(player.sprites.flair);
        }
    };
    if(forceFlagsResize)
    {
        tr.updatePlayerFlag = function (player) {
            /* Updates whether the player should have a flag sprite. Creates the layer if necessary. */
            if (!player.sprites.flagLayer) {
                player.sprites.flagLayer = new PIXI.DisplayObjectContainer();
                //player.sprites.info.addChildAt(player.sprites.flagLayer, 0)
                player.sprite.addChildAt(player.sprites.flagLayer,1); //put under name and degree and over ball
            }
            tr.checkSelfDestruct(player);
            if (player.flag) {
                var flagTile;
                if (player.flag == 1) {
                    flagTile = player.potatoFlag ? "redpotato" : "redflag";
                }
                else if (player.flag == 2) {
                    flagTile = player.potatoFlag ? "bluepotato" : "blueflag";
                }
                    else if (player.flag == 3) {
                        flagTile = player.potatoFlag ? "yellowpotato" : "yellowflag";
                    }
                    if (!player.sprites.flag || player.sprites.flag.name != flagTile) {
                        player.sprites.flag = tagpro.tiles.draw(player.sprites.flagLayer, flagTile, { x: 13, y: -32 }, null, null, null, true);
                        player.sprites.flag.name = flagTile;
                    }
            } else {
                if (player.sprites.flag) {
                    player.sprites.flagLayer.removeChild(player.sprites.flag);
                    player.sprites.flag = null;
                }
            }
        };
    }
    if(moveSwitchButton)
    {
        document.getElementById('name').parentElement.appendChild(document.getElementById('switchButton'));
        document.getElementById('switchButton').style.marginLeft = '50px';
    }
    if(hideSharing)
    {
        document.getElementById('optionsLinks').style.display = 'none';
    }
});