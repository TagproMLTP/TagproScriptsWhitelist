// ==UserScript==
// @name          Ghost Mario
// @version       0.1
// @include       http://*.koalabeast.com*
// @include       http://*.jukejuice.com*
// @include       http://*.newcompte.fr*
// @include		  http://108.61.192.74*
// @include		  http://107.191.46.174*
// @grant		  GM_setValue
// @grant 		  GM_getValue
// @grant 		  GM_deleteValue
// ==/UserScript==


//--------------------------------------//
// This section records data each match //
//--------------------------------------//

// Function to easily create array of null values
function createNullArray(N) {
    return (Array.apply(null, {length: N}).map(Number.call, function () {
        return (null);
    }))
}

// function to store data using GM_setValue
// this gets called when a player grabs a mario
// it compares the best time this round to the previously saved best time,
// and if this round's time is better it replaces the data there
function storeData(positions, id, name, time) {
    
    // get currently stored best time
    currentBest = GM_getValue('currentBestData');
    
    // compare this game's best to stored currently stored best time
    // if this game's is better, store this game's instead
    if(typeof currentBest === 'undefined' || JSON.parse(currentBest).time >= time) {
        winnerData = {
            positions : positions['player'+id],
            time : time,
            name : name
        };
        
        GM_setValue('currentBestData', JSON.stringify(winnerData));
    };
    
}

// function to start recording
function recordGhostData() {
    var positions = {};			// this object holds all position data 
    var fps = 60;				// how frequently we record player position data (e.g., 60 times per second)
    var saveDuration = 180;		// save data for maximum of 3 minutes
    
    // function to save game data
    saveGhostData = function () {
        
        // create player objects within positions objects for any player not already represented
        var currentPlayers = tagpro.players;
        for (player in currentPlayers) {
            if (!positions['player' + player]) {
                positions['player' + player] = {
                    x: 		createNullArray(saveDuration * fps),
                    y: 		createNullArray(saveDuration * fps),
                    //name: 	new Array(saveDuration * fps),
                    //dead: 	new Array(saveDuration * fps),
                    //auth: 	new Array(saveDuration * fps),
                    //degree:	new Array(saveDuration * fps),
                    //flair: 	new Array(saveDuration * fps)
                };
            };
        };
        
        // loop through those player attributes, shift each array, and append new values onto array
        // this is what actually records the data
        for (player in positions) {
            for (i in positions[player]) {
                positions[player][i].shift();
                positions[player][i].push(typeof tagpro.players[player.replace('player', '')] != 'undefined' ? tagpro.players[player.replace('player', '')][i] : null);
            };
        };
    }
    
    // interval for calling saveGameData function at proper frequency
    var recordInterval = setInterval(saveGhostData, 1000 / fps);
    
    // set up listener for chat event
    // if it includes the impossible player language, then that is the end.
    // this will fire the storeData function and stop the saveGameData interval
    tagpro.socket.on('chat', function (chat) {
        if(chat.from === null && chat.message.search('has reached the IMPOSSIBLE FLAIR') >= 0) {
            var timePart = chat.message.split(' in ')[1];
            var minutes = Number(timePart.split("'")[0]);
            var secondsWhole = timePart.split("'")[1];
            var seconds = Number(secondsWhole.split('"')[0]);
            var milliseconds = Number(secondsWhole.split('"')[1]);
            var time = (minutes*60*1000) + (seconds*1000) + milliseconds;
            
            var name = chat.message.split(' has ')[0];
            for(player in tagpro.players) {
                if(tagpro.players[player].name === name) {
                    var id = player;
                }
            }
            storeData(positions, id, name, time);
        	clearInterval(recordInterval);
        } 
    });
    
};




//----------------------------------------------//
// This section plays recorded data as a shadow //
//----------------------------------------------//

// function to get stored data and clean it.
function getStoredData() {
    var dat = GM_getValue('currentBestData');
    if(!dat) return
    dat = JSON.parse(dat);
    if(!dat.positions) { GM_deleteValue('currentBestData'); return}
    for(var i=0; i < dat.positions.x.length; i++) {
        if(dat.positions.x[i] === null) {
            dat.positions.x.shift();
            dat.positions.y.shift();
            i--
        }
    }
    return(dat)
}

// function to start ghost animation
function animateGhost(dat, ghost, ghostname) {
    if(!dat) return
    var i = 0;
    interval = setInterval(function(){
        ghost.position.x = dat.positions.x[i];
        ghost.position.y = dat.positions.y[i];
        ghostname.y = -21 * tagpro.zoom;
        ghostname.scale.x = tagpro.zoom;
        ghostname.scale.y = tagpro.zoom;
        i++;
        if(i >= dat.positions.x.length) clearInterval(interval);
    }, 1000/60)
}



//--------------------------------------------//
// Actually start the recording and animation //
//--------------------------------------------//


// actually start recording
$(document).ready(function() {
    // if we're in a game:
    if(document.URL.search(/:[0-9]{4}/) >= 0) {
        tagpro.ready(function() {
            var dat = getStoredData();
            var ghost;
            if(dat) { 
                ghost = tagpro.tiles.draw(tagpro.renderer.layers.foreground, 
                                          "blueball", 
                                          {x: dat.positions.x[0], y: dat.positions.x[0]}, 
                                          null, 
                                          null, 
                                          0.75, // change this to change the opacity (e.g., 0.75 is 75% opacity) 
                                          true);
                ghostname = ghost.addChild(tagpro.renderer.veryPrettyText(dat.name, "#BFFF00"));
                ghostname.x = 20;
                ghostname.y = -21;
                ghostname.alpha = 1/ghost.alpha;
            };
            tagpro.socket.on('time', function(time) {
                if(time.state === 1) {
                    recordGhostData();
                    animateGhost(dat, ghost, ghostname);
                };
            });
        });
    };
});


//--------------------------------------------//
// Make a group page button to reset the data //
//--------------------------------------------//

$(document).ready(function() {
    // if we're not in a game, but rather on the group page, make a button to reset the ghost data
    if(document.URL.search(/groups\/[a-z]{8}/) >= 0) { 
        $('#leaveButton').after('<Button id=rGButton>Reset Ghost');
        $('#rGButton').after('<txt id=rGConf>Deleted');
        $('#rGConf')[0].style.color='#66FF33';
        $('#rGConf').hide();
        $('#rGButton')[0].onclick = function(){
            GM_deleteValue('currentBestData');
            $('#rGConf').fadeIn();
            $('#rGConf').fadeOut(1000);
        }
    }
});