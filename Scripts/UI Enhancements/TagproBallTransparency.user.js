// ==UserScript==
// @name         TagPro Ball Transparency
// @version      0.1
// @description  Give balls some transparency
// @include		 http://tagpro-*.koalabeast.com:*
// @include		 http://tangent.jukejuice.com:*
// @include		 http://*.newcompte.fr:*
// @author		 Some Ball -1
// @grant        none
// ==/UserScript==

tagpro.ready(function run() {
    if(!tagpro.renderer) return setTimeout(run,50);
    
    
    
    
    // Transparency percentage from 0 (completely transparent) to 1 (completely opaque)
    var transparency = 0.8;
    
    
    
    
    
    var tr = tagpro.renderer,
        cbs = tr.createBallSprite,
        up = tr.updatePlayer;
    tr.createBallSprite = function (player) {
        cbs(player);
        player.sprites.actualBall.alpha = transparency;
    };
    tr.updatePlayer = function (player) {
        up(player);
        if(player.sprites.actualBall.alpha != transparency)
            player.sprites.actualBall.alpha = transparency;
    };
});