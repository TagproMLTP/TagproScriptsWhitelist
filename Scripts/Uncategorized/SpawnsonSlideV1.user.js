// ==UserScript==
// @name          Spawnson Slide
// @description   Add a description here
// @version       1.0
// @grant         none
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// @author        RonSpawnson
// @namespace     http://www.reddit.com/user/haskelle
// @license       2014
// ==/UserScript==

tagpro.ready(function timers() {
    
    if (!tagpro.playerId) {
        return setTimeout(timers, 250);
    }
    
    var tr = tagpro.renderer,
        self = tagpro.players[tagpro.playerId],
        tileTimer = [],
        ballTimer = [],
        gameEnd = false,
        playerCount = 0,
        xOffset = 0,
        yOffset = 0;
    
    window.addEventListener('keydown', handleKeyDown, true)
    window.addEventListener('keyup', handleKeyUp, true)
    
    var maxspeed = 3;
    var yforce = 0;
    var xforce = 0;
    var pixely = 0;
    var pixelx = 0;
    var key_up = false;
    var key_down = false;
    var key_left = false;
    var key_right = false;
    var UP_KEY = 87  //38;
    var DOWN_KEY = 83 //40;
    var LEFT_KEY = 65 //37;
    var RIGHT_KEY = 68 //39;
   
    function handleKeyDown(event) {
        if (event.keyCode == UP_KEY) {
            key_up = true;
        	event.stopPropagation();
    	} else if (event.keyCode == DOWN_KEY) {
            key_down = true;
           	event.stopPropagation();
        } else if (event.keyCode == LEFT_KEY) {
            key_left = true;
            event.stopPropagation();
        } else if (event.keyCode == RIGHT_KEY) {
            key_right = true;
            event.stopPropagation();
        }
    }

	function handleKeyUp(event) {
        if (event.keyCode == UP_KEY) {
            key_up = false;
        	event.stopPropagation();
    	} else if (event.keyCode == DOWN_KEY) {
            key_down = false;
           	event.stopPropagation();
        } else if (event.keyCode == LEFT_KEY) {
            key_left = false;
            event.stopPropagation();
        } else if (event.keyCode == RIGHT_KEY) {
            key_right = false;
            event.stopPropagation();
        }
    }
    
    tr.centerContainerToPoint = function (x, y) {
        if (key_up) {
      		yforce--;
    	}
        
        if (key_down) {
            yforce++;
        }
        
        if (key_right) {
         	xforce++;   
        }
        
        if (key_left) {
            xforce--;
        }

    	if (yforce > maxspeed)
        	yforce = maxspeed;
    	if (yforce < -maxspeed)
        	yforce = -maxspeed;
		if (xforce > maxspeed)
            xforce = maxspeed;
        if (xforce < -maxspeed)
            xforce = -maxspeed;

    	if (!key_down && !key_up) {
            yforce = 0;
        } else {      
            pixely += yforce;
        }

        if (!key_left && !key_right) {
            xforce = 0;
        } else {      
            pixelx += xforce;
        }
        
        x = x + pixelx;
        y = y + pixely;
        var viewport = $('#viewport');
        var vpWidth = viewport.outerWidth();
        var vpHeight = viewport.outerHeight();
        var resizeScaleFactor = (vpHeight / tr.canvas_height).toFixed(2);
        tr.gameContainer.x = Math.round(vpWidth/2 - (x / tagpro.zoom * resizeScaleFactor));
        tr.gameContainer.y = Math.round(vpHeight/2 - (y / tagpro.zoom * resizeScaleFactor));
    };
    
    tagpro.socket.on("p", function(data) {
        data = data.u || data;
        for (var i = 0, l = data.length; i !== l; i++) {
            handlePlayerUpdate(data[i], data[i].id);
        }
    });
    
    function handlePlayerUpdate(data, id) {
        var player = tagpro.players[id];
        if (!player.countCheck) {
            player.countCheck = true;
            playerCount++;
        }
        if (data.grip !== undefined || data.bomb !== undefined || data.tagpro !== undefined || data.draw !== undefined || data.dead !== undefined) {
            ballTimer[id] = ballTimer[id] || {jj: {}, rb: {}, tp: {}};
            handlePlayers(data.id);
        }
    }
    
    tagpro.socket.on('playerLeft', function() {
        playerCount--;
    });
        
   
    
});
