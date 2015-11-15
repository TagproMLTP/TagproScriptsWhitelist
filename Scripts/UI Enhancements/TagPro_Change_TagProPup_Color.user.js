// ==UserScript==
// @name          TagPro Change TagProPup Color
// @description   change the color of the tagpro powerup
// @version       0.1
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://maptest*.newcompte.fr:*
// @include       http://tangent.jukejuice.com:*
// @author        ballparts
// ==/UserScript==

//------------------------//
// USER DEFINED VARIABLES //
//------------------------//

// THESE COLOR MUST BE HEX STRINGS (e.g., "#ff00ff")
// You can find these strings easily at a site like http://www.colorpicker.com/

// This will be the color of the actual ring around the ball
var tagproRingColor = "#ff00ff";

// These two are the start and end color of the particles emitted from the ball while it has tagpro
var tagproParticleStartColor = "#f67aff";
var tagproParticleEndColor = "#bb00bb";

//----------------------------//
// END USER DEFINED VARIABLES //
//----------------------------//



tagpro.ready(function() {
    var tagproHexInt = parseInt(tagproRingColor.replace(/^#/, ''), 16);
    tr=tagpro.renderer;
    tr.particleDefinitions.tagproSparks.color.start = tagproParticleStartColor;
    tr.particleDefinitions.tagproSparks.color.end = tagproParticleEndColor;
    tr.updateTagpro = function (player) {
        /* Updates whether a player should have tagpro. */
        if (player.tagpro) {
            if (!player.sprites.tagproTint) {
                var tint = player.sprites.tagproTint = new PIXI.Graphics();
                tint.beginFill(tagproHexInt, .35).lineStyle(3, tagproHexInt).drawCircle(20, 20, 20);
                player.sprites.ball.addChild(tint);
                if (!tr.options.disableParticles) {
                    player.sprites.tagproSparks = new cloudkid.Emitter(
                        player.sprites.ball,
                        [tr.particleFireTexture],
                        tagpro.particleDefinitions.tagproSparks);
                    player.sprites.tagproSparks.player = player.id;
                    tr.emitters.push(player.sprites.tagproSparks);
                }
            }
        } else {
            if (player.sprites.tagproTint) {
                player.sprites.ball.removeChild(player.sprites.tagproTint);
                player.sprites.tagproTint = null;
            }
            if (player.sprites.tagproSparks) {
                player.sprites.tagproSparks.emit = false;
                var sparksIndex = tr.emitters.indexOf(player.sprites.tagproSparks);
                tr.emitters.splice(sparksIndex, 1);
                player.sprites.tagproSparks.destroy();
                player.sprites.tagproSparks = null;
            }
        }
    };
});