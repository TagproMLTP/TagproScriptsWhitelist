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
    $('#tiles')[0].src = 'http://i.imgur.com/f6Cc0hH.png';
    $('#speedpad')[0].src = 'http://i.imgur.com/6h2Fna8.png';
    $('#speedpadred')[0].src = 'http://i.imgur.com/pF4l9SO.png';
    $('#speedpadblue')[0].src = 'http://i.imgur.com/NlepAuW.png';
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