// ==UserScript==
// @name         TagPro Flag Carrier Name
// @namespace    http://www.reddit.com/user/snaps_/
// @description  Adds the name of the flag carrier next to the flags on the TagPro game UI.
// @license      GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html 
// @version      0.1.3
// @author       snaps
// @downloadURL  https://gist.github.com/chrahunt/03a399925e42f7c4f1e6/raw/tagpro-fc-status.user.js
// @include      http://tagpro-*.koalabeast.com:* 
// @include      http://tangent.jukejuice.com:* 
// @include      http://maptest*.newcompte.fr:* 
// @grant        none
// ==/UserScript==

// Wait until the tagpro object exists, and add the function to tagpro.ready
function addToTagproReady(fn) {
    // Make sure the tagpro object exists.
    if (typeof tagpro !== "undefined") {
        tagpro.ready(fn);
    } else {
        // If not ready, try again after a short delay.
        setTimeout(function() {
            addToTagproReady(fn);
        }, 0);
    }
}

addToTagproReady(function() {
    /**
     * Make text for display. Initially not visible.
     * @return {PIXI.Text} - The created text.
     */
    function makeText() {
        var text = new PIXI.Text("", {
            font: "bold 8pt Arial",
            fill: "#FFFFFF",
            stroke: "#000000",
            strokeThickness: 3,
            align: "center"
        });
        text.alpha = 0.8;
        text.visible = false;
        return text;
    }

    /**
     * Update the given text with the content to display for the flag
     * carrier, making the text visible if needed.
     * @param text {PIXI.Text} - The text object to alter.
     * @param content {string} - The content to display after FC.
     */
    function showFCText(text, content) {
        text.text.visible = true;
        text.text.setText("FC:\n" + content);
    }

    /**
     * Hide the given text.
     * @param text {PIXI.Text} - The text object to hide.
     */
    function hideFCText(text) {
        text.text.visible = false;
    }

    // Execute passed function when the score sprites are present.
    function waitForSprites(fn) {
        if (tagpro.ui.sprites && tagpro.ui.sprites.redScore &&
            tagpro.ui.sprites.blueScore) {
            fn();
        } else {
            setTimeout(function() {
                waitForSprites(fn);
            }, 0);
        }
    }

    // Holds spriteInfo for fc text.
    var text = {
        red: {
            text: makeText(),
            xOffsetAdjust: -1,
            elt: false
        },
        blue: {
            text: makeText(),
            xOffsetAdjust: 1,
            elt: false
        }
    };
    text.red.text.anchor = new PIXI.Point(1, 0);

    // Add text to UI.
    tagpro.renderer.layers.ui.addChild(text.red.text);
    tagpro.renderer.layers.ui.addChild(text.blue.text);

    // Populate elements that text is relative to when the sprites are
    // available.
    waitForSprites(function() {
        text.red.elt = tagpro.ui.sprites.redScore;
        text.blue.elt = tagpro.ui.sprites.blueScore;
    });

    /**
     * Retrieve the players carrying the flag.
     * @return {object.<string, Array.<player>>} - Object with
     *   properties red and blue that have arrays with the player
     *   objects of the flag carriers for each team.
     */
    function getFlagCarriers() {
        var red = [];
        var blue = [];
        var team = {
            1: red,
            2: blue
        };
        for (var id in tagpro.players) {
            var player = tagpro.players[id];
            if (player.flag) {
                team[player.team].push(player);
            }
        }
        return {
            red: red,
            blue: blue
        };
    }

    var needUpdate = true;

    // Check whether update is needed.
    tagpro.socket.on("p", function(updates) {
        updates = updates.u || updates;
        updates.forEach(function(update) {
            if (update.hasOwnProperty("flag") ||
                update.hasOwnProperty("name")) {
                needUpdate = true;
            }
        });
    });

    // Update positioning if score changes, since we're relative to the
    // score text.
    tagpro.socket.on("score", function() {
        needUpdate = true;
    });

    // Listen for screen resize function so we can update the FC text
    // location.
    var stdUIResize = tagpro.ui.resize;
    tagpro.ui.resize = function() {
        needUpdate = true;
        stdUIResize.apply(null, arguments);
    };

    var stdAlignUI = tagpro.ui.alignUI;
    var xUiBuffer = 15;
    tagpro.ui.alignUI = function() {
        if (!tagpro.ui.sprites) {
            setTimeout(tagpro.ui.alignUI, 1e3);
            return;
        }
        if (needUpdate) {
            // Put flag carrier text relative to element.
            for (var fcText in text) {
                var spriteInfo = text[fcText];
                var elt = spriteInfo.elt;
                if (spriteInfo.text.visible && elt) {
                    spriteInfo.text.x = elt.x +
                        elt.width * spriteInfo.xOffsetAdjust +
                        xUiBuffer * spriteInfo.xOffsetAdjust;
                    spriteInfo.text.y = elt.y +
                        (elt.height - spriteInfo.text.height) / 4;
                }
            }
        }
        stdAlignUI.apply(null, arguments);
    };


    var stdUIUpdate = tagpro.ui.update;
    tagpro.ui.update = function(layer, origin) {
        if (needUpdate) {
            var flagCarriers = getFlagCarriers();
            if (flagCarriers.blue.length > 0) {
                if (flagCarriers.blue.length == 1) {
                    showFCText(text.blue, flagCarriers.blue[0].name);
                } else {
                    showFCText(text.blue, "(multiple)");
                }
            } else {
                hideFCText(text.blue);
            }
            if (flagCarriers.red.length > 0) {
                if (flagCarriers.red.length == 1) {
                    showFCText(text.red, flagCarriers.red[0].name);
                } else {
                    showFCText(text.red, "(multiple)");
                }
            } else {
                hideFCText(text.red);
            }
            stdUIUpdate.apply(null, arguments);
            needUpdate = false;
        } else {
            stdUIUpdate.apply(null, arguments);
        }
    };

    // Periodically check for presence of Team Count Indicator by
    // browncoat, adjusting FC text position if found.
    var teamCountCheck = setInterval(function() {
        if (tagpro.ui.sprites && tagpro.ui.sprites.ballIndicators) {
            clearInterval(teamCountCheck);
            xUiBuffer = 55;
            tagpro.ui.alignUI();
        }
    }, 1e3);
});
