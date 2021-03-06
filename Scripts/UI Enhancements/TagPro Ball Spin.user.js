// ==UserScript==
// @name       		TagPro Ball Spin
// @version    		0.1
// @description  	Rotates balls to show the spin
// @include		http://tagpro-*.koalabeast.com:*
// @include		http://tangent.jukejuice.com:*
// @include		http://*.newcompte.fr:*
// @author		Some Ball -1
// ==/UserScript==

tagpro.ready(function() {
    tr = tagpro.renderer;
	tr.anchorBall = function(player) {
	    player.sprites.actualBall.anchor.x = .5
	    player.sprites.actualBall.anchor.y = .5;
	    player.sprites.actualBall.x = 20;
	    player.sprites.actualBall.y = 20;
	}
	var old = tr.updatePlayerSpritePosition;
	tr.updatePlayerSpritePosition = function (player) {
	    if(!player.sprites.actualBall.anchor.x)
	    {
	        tr.anchorBall(player);
	    }
	    player.sprites.actualBall.rotation = player.angle;
	    old(player);
	};
});