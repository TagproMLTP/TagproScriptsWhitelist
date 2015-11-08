// ==UserScript==
// @name          Ghost Mario Test (Caps)
// @version       0.1
// @include       http://*.koalabeast.com*
// @include       http://*.jukejuice.com*
// @include       http://*.newcompte.fr*
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
            time : time
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
    
    // set up listener for mario grabbed event
    // this will fire the storeData function and stop the saveGameData interval
    tagpro.socket.on('score', function (mario) {
        if(mario.r==0 && mario.b==0) return
        storeData(positions, tagpro.playerId, 'somename', 46);
        clearInterval(recordInterval);
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
function animateGhost(dat, ghost) {
    if(!dat) return
    var i = 0;
    interval = setInterval(function(){
        ghost.position.x = dat.positions.x[i];
        ghost.position.y = dat.positions.y[i];
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
            if(dat) ghost = tagpro.tiles.draw(tagpro.renderer.layers.foreground, 
                                              "blueball", 
                                              {x: dat.positions.x[0], y: dat.positions.x[0]}, 
                                              null, 
                                              null, 
                                              0.75, 
                                              true);
            tagpro.socket.on('time', function(time) {
                if(time.state === 1) {
                    recordGhostData();
                    animateGhost(dat, ghost);
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