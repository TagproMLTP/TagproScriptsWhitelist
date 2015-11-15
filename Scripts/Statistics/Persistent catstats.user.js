// ==UserScript==
// @name       		Persistent catstats
// @namespace  		http://www.reddit.com/user/goodygood_274/
// @version    		0.1
// @include       	http://tagpro-*.koalabeast.com:*
// @description  	Allows you to save leaderboard stats for every game until you tell it to stop.
// @license       	GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author        	ballparts (modified from lambda's original catstats)
// ==/UserScript==
 
 
 
 
 
var stats = null;
var players = {};
 
function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
 
function updateStatsAfterDeparture (player, now) {
    var now = now || Date.now();
    player['departure'] = tagpro.gameEndsAt - now;
    player['minutes'] = Math.round((player['arrival']-player['departure'])/6000)/10;
    if (player['bombtr']) {
        player['bombtime'] += now - player['bombstart'];
        player['bombtr'] = false;
    }
    if (player['tagprotr']) {
        player['tagprotime'] += now - player['tagprostart'];
        player['tagprotr'] = false;
    }
    if (player['griptr']) {
        player['griptime'] += now - player['gripstart'];
        player['griptr'] = false;
    }
    if (player['speedtr']) {
        player['speedtime'] += now - player['speedstart'];
        player['speedtr'] = false;
    }
}
 
function turnOn() {
    document.cookie = 'saveCSVStatus=true;domain=.koalabeast.com';
    $('#saveAsCSVLink').text('Data will be saved as .csv - click to disable')
    .click(turnOff);
    document.getElementById('saveAsCSVLink').style.color = 'red';
}    
 
function turnOff() {
    document.cookie = 'saveCSVStatus=false;domain=.koalabeast.com';
    $('#saveAsCSVLink').text('Click to save data as .csv')
    .click(turnOn);
    document.getElementById('saveAsCSVLink').style.color = '';
}
 
function setup() { 
    if(readCookie('saveCSVStatus') == null) {
        document.cookie = 'saveCSVStatus=false;domain=.koalabeast.com';
    }
    
    $(document).ready(function() {
        saveCSVStatus = readCookie('saveCSVStatus');
        if(saveCSVStatus == "false") {
            var $el = $('#options').find('table');
            var $export = $('<a>', {href: '#', id: 'saveAsCSVLink'})
            .text('Click to save data as .csv')
            .click(turnOn);
            $export.insertAfter($el);
            document.getElementById('saveAsCSVLink').style.color = '';
        } else {
            var $el = $('#options').find('table');
            var $export = $('<a>', {href: '#', id: 'saveAsCSVLink'})
            .text('Data will be saved as .csv - click to disable')
            .click(turnOff);
            $export.insertAfter($el);
            document.getElementById('saveAsCSVLink').style.color = 'red';
        }
    });
    
    
    tagpro.socket.on('p', function (newData) {
        newData = newData.u || newData;
        for(var i = 0; i < newData.length; i++) {
            var playerNewData = newData[i];
            var player = players[playerNewData.id];
            var now = Date.now();
            
            if(!player) {
                players[playerNewData.id] = {};
                player = players[playerNewData.id];
                player['arrival'] = tagpro.gameEndsAt - now;
                player['bombtime'] = 0;
                player['tagprotime'] = 0;
                player['griptime'] = 0;
                player['speedtime'] = 0;
                player['bombtr'] = false;
                player['tagprotr'] = false;
                player['griptr'] = false;
                player['speedtr'] = false;
                player['diftotal'] = 0;
                updatePlayerData(tagpro.players[playerNewData.id]);
            }
            else {
                updatePlayerData(playerNewData);
            }
            
            function updatePlayerData (playerNewData)
            {
                for(var statName in playerNewData) {
                    if (statName == 'bomb' || statName == 'tagpro' || statName == 'grip' || statName == 'speed') {
                        if (playerNewData[statName] && ! player[statName + 'tr']) { // the player has the statName powerup and we aren't tracking the amount of time with that powerup yet
                            player[statName+ 'tr'] = true;
                            player[statName + 'start'] = now;
                        }
                        if (! playerNewData[statName] && player[statName + 'tr']) { // the player hasn't the statName powerup and we were tracking the amount of time with that power up.
                            player[statName + 'time'] += now - player[statName + 'start'];
                            player[statName+ 'tr'] = false;
                        }
                    }
                    if (typeof (playerNewData[statName]) != "object" ) player[statName] = playerNewData[statName];
                }
            }
        }
    });
    
    var scoreRedTeam  = 0;
    var scoreBlueTeam = 0;
    
    tagpro.socket.on('score', function (e) {
        var incrementScoreRedTeam  = e.r - scoreRedTeam;
        var incrementScoreBlueTeam = e.b - scoreBlueTeam;
        for(var playerId in tagpro.players) {
            var player = players[playerId];
            player['diftotal'] += player.team == 1 ? incrementScoreRedTeam - incrementScoreBlueTeam : incrementScoreBlueTeam - incrementScoreRedTeam;
        }
        scoreRedTeam = e.r;
        scoreBlueTeam = e.b;
    });
    
    
    tagpro.socket.on('playerLeft',function(playerId) {
        switch (tagpro.state) {
            case 1: //During the game
                updateStatsAfterDeparture(players[playerId]);
                break;
            case 3: //Before the game
                delete players[playerId];
                break;
            default:
                break;
        }
    });
    
    tagpro.socket.on('time',function(e) {
        if(tagpro.state == 2) return; //Probably unneeded
        for(var playerId in players) players[playerId]['arrival'] = e.time; //players who were there before the game started have their arrival time set to the time when the game started
    });
    tagpro.socket.on('end', recordStats);
    registerExport();
}
 
function registerExport() {
    if(stats)
        return exportCSV();
    
    var hasCSVBeenDownloadedYet = false;
    tagpro.socket.on('end', function() {
        if (! hasCSVBeenDownloadedYet) {
            hasCSVBeenDownloadedYet = true;
            exportCSV();
        }
    });  
    window.addEventListener('beforeunload', function( event ) {
        if (! hasCSVBeenDownloadedYet) {
            hasCSVBeenDownloadedYet = true;
            getEmergencyCSV();
        }
    });
}
function getEmergencyCSV () {
    recordStats();
    exportCSV();
}
function recordStats() {
    var now = Date.now();
    for(var playerId in tagpro.players) updateStatsAfterDeparture(players[playerId], now); //tagpro.players is a list of all the players who are still in game
    var playerIds = Object.keys(players);
    stats = playerIds.map(function(id) {
        var player = players[id];
        return {
            'name':              player['name']       || '',
            'plusminus':         player['diftotal']   || 0,
            'minutes':           player['minutes']    || 0,
            'score':             player['score']      || 0,
            'tags':              player['s-tags']     || 0,
            'pops':              player['s-pops']     || 0,
            'grabs':             player['s-grabs']    || 0,
            'drops':             player['s-drops']    || 0,
            'hold':              player['s-hold']     || 0,
            'captures':          player['s-captures'] || 0,
            'prevent':           player['s-prevent']  || 0,
            'returns':           player['s-returns']  || 0,
            'support':           player['s-support']  || 0,
            'team captures':     player.team == 1 ? tagpro.score.r : tagpro.score.b,
            'opponent captures': player.team == 1 ? tagpro.score.b : tagpro.score.r,
            'arrival':           player['arrival']    || 0,
            'departure':         player['departure']  || 0,
            'bombtime':          player['bombtime']   || 0,
            'tagprotime':        player['tagprotime'] || 0,
            'griptime':          player['griptime']   || 0,
            'speedtime':         player['speedtime']  || 0
        }
    })
}
 
function exportCSV() {
    if( readCookie('saveCSVStatus') == 'true' ) {
        var fileContent = csv(stats);
        var file = new Blob([fileContent], {type: "data:text/csv;charset=utf-8"});
        
        var a = document.createElement('a');
        a.download = 'tagpro-'+Date.now()+'.csv';
        a.href = (window.URL || window.webkitURL).createObjectURL(file);
        
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, false);
        
        // trigger download
        a.dispatchEvent(event);
        
        (window.URL || window.webkitURL).revokeObjectURL(a.href);
    }
}
 
function csv(array) {
    var result = '';
    array.forEach(function(player, i) {
        var keys = Object.keys(player);
        
        // write header
        if(i == 0)
            result = keys.map(wrap).join(',') + '\r\n';
        
        // write row
        result += keys.map(function(k) { return wrap(player[k]); }).join(',') + '\r\n';
        
    });
    
    return result;
    
    function wrap(v) {
        return '"'+v+'"';
    }
}
 
setup();