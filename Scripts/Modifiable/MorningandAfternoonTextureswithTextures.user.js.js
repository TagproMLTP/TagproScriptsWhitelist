// ==UserScript==
// @name         Tagpro Morning and Afternoon Textures with Japanese Bubble Gum Pop Explosion and Pastel Pro by BMO
// @namespace    http://your.homepage/
// @version      0.1
// @description  Uses different texture packs based on the time of day. THIS SPINS BALLS ALREADY!
// @author       Acid Rap(/u/kunmeh13)
// ==/UserScript==


//OPTIONS

//URLS FOR THE LIGHT TEXTURE
var lightTiles = 'http://i.imgur.com/22ehddn.png';            //Tiles
var lightNeutralBoosts = 'http://i.imgur.com/r7beMZp.png';    //Neutral Boosts
var lightRedBoosts = 'http://i.imgur.com/xAHMOOV.png';        //Red Team Boosts
var lightBlueBoosts = 'http://i.imgur.com/R1TGL5x.png';       //Blue Team Boosts
var lightSplats = 'http://i.imgur.com/NKBd7nE.png';           //Splats
var lightPortals = 'http://i.imgur.com/GbdQNJJ.png';          //Portals

//URLS FOR THE DARK TEXTURE
var darkTiles = 'http://i.imgur.com/btwMuof.png';            //Tiles
var darkNeutralBoosts = 'http://i.imgur.com/VCN9ztX.png';    //Neutral Boosts
var darkRedBoosts = 'http://i.imgur.com/hKlM7Ss.png';        //Red Team Boosts
var darkBlueBoosts = 'http://i.imgur.com/CZdCDml.png';       //Blue Team Boosts
var darkSplats = 'http://i.imgur.com/kbkOC6x.png';           //Splats
var darkPortals = 'http://i.imgur.com/gWep0Er.png';          //Portals

var earlyHour = 6; //Choose the hour you want the light texture to turn on(in military time)
var darkTime = 21; //Choose the hour you want the dark texture to turn on(in military time)







//SCRIPT \/

var date = new Date();
var hour = date.getHours();

//Light Texture
if(hour >= earlyHour && hour < darkTime){
    tagpro.loadAssets({
        "tiles": lightTiles,
        "splats": lightSplats,
        "speedpad": lightNeutralBoosts,
        "speedpadRed": lightRedBoosts,
        "speedpadBlue": lightBlueBoosts,
        "portal": lightPortals
    });
}

//Dark Texture
if(hour < earlyHour || hour >= darkTime){
    tagpro.loadAssets({
        "tiles": darkTiles,
        "splats": darkSplats,
        "speedpad": darkNeutralBoosts,
        "speedpadRed": darkRedBoosts,
        "speedpadBlue": darkBlueBoosts,
        "portal": darkPortals
    });

    tagpro.ready(function () {
        var wisteriaColor = "#e9b6ff";
        var greenSeaColor = "#6adcb2";
        var redTeamColor = "16a085";
        var blueTeamColor = "8e44ad";
        var redTeamName = "Green Sea";
        var blueTeamName = "Wisteria";
        var tr = tagpro.renderer;

        // Written by NewCompte \/

        // Changes color of scoreboard
        tagpro.events.register({
            sortPlayers: function(players) {
                playerArray = players;
            },
            modifyScoreUI: function($table) {
                playerArray.forEach( function(player, i) {
                    $table.find("tr:nth-child(" + (i + 2) + " ) .scoreName").css("color", player.team == 1 ? greenSeaColor : wisteriaColor);
                });
            },
        });

        // Changes color of chat
        tagpro.socket.on("chat", function () {
            var newChat = $(".name").last();
            var color = newChat.css("color");
            switch (color) {
                case "#FFB5BD": case "rgb(255, 181, 189)":
                    color = greenSeaColor;
                    break;
                case "#CFCFFF": case "rgb(207, 207, 255)":
                    color = wisteriaColor;
                    break;
            }
            newChat.css("color", color);
        });

        // Written by NewCompte ^

        // Written by CFlakes and SB-1 \/
        var texture = PIXI.Texture.fromImage('http://i.imgur.com/o3XXY73.png'),
            redTexture = new PIXI.Texture(texture, new PIXI.Rectangle(0, 0, 40, 40)),
            blueTexture = new PIXI.Texture(texture, new PIXI.Rectangle(40, 0, 40, 40)),
            tagproTexture = new PIXI.Texture(texture, new PIXI.Rectangle(80, 0, 40, 40));

        tagpro.renderer.createSpin = function(player) {
            var teamTexture = player.team === 1 ? redTexture : blueTexture;
            if (!player.sprites.spin) {
                player.sprites.spin = new PIXI.Sprite(teamTexture);
                player.sprites.spin.anchor.x = 0.5;
                player.sprites.spin.anchor.y = 0.5;
                player.sprites.spin.x = 20;
                player.sprites.spin.y = 20;
                player.sprites.spin.tileId = player.sprites.actualBall.tileId;
                player.sprites.ball.addChild(player.sprites.spin);
            } else {
                player.sprites.spin.setTexture(teamTexture);
                player.sprites.spin.tileId = player.sprites.actualBall.tileId;
            }
        };

        var upsp = tagpro.renderer.updatePlayerSpritePosition;
        tagpro.renderer.updatePlayerSpritePosition = function(player) {
            if (!player.sprites.spin || player.sprites.actualBall.tileId !== player.sprites.spin.tileId) tagpro.renderer.createSpin(player);
            player.sprites.spin.rotation = player.angle;
            upsp(player);
        };

        tagpro.renderer.createBallSprite = function(player) {
            var texture = player.team === 1 ? "redball" : "blueball";
            player.sprites.actualBall = tagpro.tiles.draw(player.sprites.ball, texture, {x: 0, y: 0});
            player.sprites.actualBall.tileId = texture;
        };

        tagpro.renderer.updateTagpro = function(player) {
            if (player.tagpro) {
                if (!tagpro.renderer.options.disableParticles && !player.sprites.tagproSparks) {
                    player.sprites.tagproSparks = new cloudkid.Emitter(
                        player.sprites.ball,
                        [tagpro.renderer.particleFireTexture],
                        tagpro.particleDefinitions.tagproSparks);
                    tagpro.renderer.emitters.push(player.sprites.tagproSparks);
                }
                if (player.bomb) {
                    if (player.sprites.tagproTint) {
                        player.sprites.ball.removeChild(player.sprites.tagproTint);
                        player.sprites.tagproTint = null;
                    }
                } else {
                    if (!player.sprites.tagproTint) {
                        player.sprites.tagproTint = new PIXI.Graphics();
                        player.sprites.tagproTint.beginFill(0xFFFFFF, 0.0).drawCircle(20, 20, 19);
                        player.sprites.ball.addChild(player.sprites.tagproTint);
                    }
                }
                if (!player.sprites.tagproTexture) {
                    player.sprites.tagproTexture = new PIXI.Sprite(tagproTexture);
                    player.sprites.ball.addChild(player.sprites.tagproTexture);
                    player.sprites.tagproTexture.anchor.x = 0.5;
                    player.sprites.tagproTexture.anchor.y = 0.5;
                    player.sprites.tagproTexture.x = 20;
                    player.sprites.tagproTexture.y = 20;
                }
                player.sprites.tagproTexture.rotation = player.angle;
            } else {
                if (player.sprites.tagproTint || player.sprites.tagproTexture) {
                    player.sprites.ball.removeChild(player.sprites.tagproTint);
                    player.sprites.ball.removeChild(player.sprites.tagproTexture);
                    player.sprites.tagproTint = null;
                    player.sprites.tagproTexture = null;
                }
                if (player.sprites.tagproSparks) {
                    player.sprites.tagproSparks.emit = false;
                    var sparksIndex = tagpro.renderer.emitters.indexOf(player.sprites.tagproSparks);
                    tagpro.renderer.emitters.splice(sparksIndex, 1);
                    player.sprites.tagproSparks.destroy();
                    player.sprites.tagproSparks = null;
                }
            }
        };

        tagpro.renderer.updateRollingBomb = function(player) {
            if (player.bomb) {
                if (!player.sprites.bomb) {
                    if (!tagpro.renderer.options.disableParticles) {
                        player.sprites.rollingBomb = new cloudkid.Emitter(
                            player.sprites.ball,
                            [tagpro.renderer.particleTexture],
                            tagpro.particleDefinitions.rollingBomb);
                        tagpro.renderer.emitters.push(player.sprites.rollingBomb);
                    }
                    var bomb = player.sprites.bomb = new PIXI.Graphics();
                    bomb.beginFill(0xFFFF00, 0.6).drawCircle(20, 20, 19);
                    player.sprites.ball.addChild(bomb);
                } else {
                    player.sprites.bomb.alpha = Math.abs(0.6 * Math.sin(performance.now() / 150));
                }
            } else {
                if (player.sprites.bomb) {
                    player.sprites.ball.removeChild(player.sprites.bomb);
                    player.sprites.bomb = null;
                }
                if (player.sprites.rollingBomb) {
                    if (player.sprites.rollingBomb instanceof cloudkid.Emitter) {
                        player.sprites.rollingBomb.emit = false;
                        tagpro.renderer.emitters.splice(tagpro.renderer.emitters.indexOf(player.sprites.rollingBomb), 1);
                        player.sprites.rollingBomb.destroy();
                    } else {
                        player.sprites.rollingBomb.visible = false;
                    }
                    player.sprites.rollingBomb = null;
                }
            }
        };
        // Written by CFlakes and SB-1 ^

        // Written by Browncoat \/
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

                tagpro.ui.sprites.redScore = new PIXI.Text(n, {fill: redColorHex, stroke: redStroke, strokeThickness: 0, font: "bold 40pt Arial"});
                tagpro.ui.sprites.blueScore = new PIXI.Text(r, {fill: blueColorHex, stroke: blueStroke, strokeThickness: 0, font: "bold 40pt Arial"});
                tagpro.ui.sprites.redScore.alpha = .5;
                tagpro.ui.sprites.blueScore.alpha = .5;
                tagpro.ui.sprites.redScore.anchor.x = 1;
                tagpro.ui.sprites.blueScore.anchor.x = 0;
                tagpro.renderer.layers.ui.addChild(tagpro.ui.sprites.redScore);
                tagpro.renderer.layers.ui.addChild(tagpro.ui.sprites.blueScore);
            }
        };
        // Large alerts (match)
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
        // Written by Browncoat ^
    });
}