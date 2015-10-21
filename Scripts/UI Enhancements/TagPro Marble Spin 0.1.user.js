// ==UserScript==
// @name       		TagPro Marble Spin
// @version    		0.1
// @description  	Adds a marble overlay texture to the balls to show spin
// @include		    http://tagpro-*.koalabeast.com:*
// @include		    http://tangent.jukejuice.com:*
// @include		    http://*.newcompte.fr:*
// @author		    Some Ball -1 (Cflakes for the marble texture)
// ==/UserScript==

tagpro.ready(function() {
    tr = tagpro.renderer;
    tr.createSpin = function(player) {
        var marble = new PIXI.Sprite(PIXI.Texture.fromImage("http://i.imgur.com/yT42PHy.png"));
        player.sprites.marble = marble;
        player.sprites.ball.addChild(player.sprites.marble);
        player.sprites.marble.anchor.x = .5;
        player.sprites.marble.anchor.y = .5;
        player.sprites.marble.x = 20;
        player.sprites.marble.y = 20;
    }
    var old2 = tr.updatePlayerSpritePosition;
    tr.updatePlayerSpritePosition = function (player) {
        if(!player.sprites.marble)
        {
            tr.createSpin(player);
        }
        player.sprites.marble.rotation = player.angle;
        old2(player);
    };
});