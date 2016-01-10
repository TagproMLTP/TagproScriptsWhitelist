// ==UserScript==
// @name       Tagpro.me Sync Agent
// @namespace  http://tagpro.me/downloads.php
// @version    1.0.0
// @description  Uploads game data from Tagpro to Tagpro.me stat-tracking service.
// @match      http://*.koalabeast.com/*, http://*.jukejuice.com/*, http://tagpro.me/*
// @copyright  2014 bluesoul, forked from MercuryRising/tagpro-catstats https://github.com/MercuryRising/tagpro-catstats
// ==/UserScript==

catstats = (function(catstats) {

  var stats = null;
  var players = {};
  function updateStatsAfterDeparture (player, now) {
    var now = now || Date.now();
    player['departure'] = tagpro.gameEndsAt - now;
    player['played'] = Math.round((player['arrival']-player['departure'])/1000); // give us a seconds count for tracking stats per minute with better accuracy.
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

  init();
  function init () {
    if (window.tagpro && tagpro.socket && window.jQuery)
      return setup();
    setTimeout(init, 0);
  }

  function setup() {
    
    tagpro.socket.on('p', function (newData) {
      newData = newData.u || newData;
      for(var i = 0; i < newData.length; i++) {
        var playerNewData = newData[i];
        var player = players[playerNewData.id];
        var now = Date.now();

        if(!player) {
          players[playerNewData.id] = {};
          player = players[playerNewData.id];
          player['team'] = player.team;
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
          player['bombs'] = 0;
          player['hadbomb'] = false;
          player['tagpros'] = 0;
          player['hadtagpro'] = false;
          player['grips'] = 0;
          player['hadgrip'] = false;
          player['powerups'] = 0;
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
            if(!player["had"+statName] && playerNewData[statName]) {
              player[statName+"s"] += 1;
              player["powerups"] += 1;
              player["had"+statName] = true;
            }
            else if (player["had"+statName] && !playerNewData[statName]) {
              player["had"+statName] = false;
            }
          }
            if (typeof (playerNewData[statName]) != "object" ) {
              player[statName] = playerNewData[statName];

            }

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
  function sum(players, stat) {
    var sum = 0;
    for(var x=0; x<players.length; x++) {
      if(players[x] !== undefined) {
      var player = players[x] ? players[x] : {};
      sum += player[stat] ? player[stat] : 0;
    }
  }
    return sum;
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
        'played':            player['played']    || 0,
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
        'teamcaps':     player.team == 1 ? tagpro.score.r : tagpro.score.b, // removing space for easier work with DB
        'oppcaps': player.team == 1 ? tagpro.score.b : tagpro.score.r, // removing space for easier work with DB
        'arrival':           player['arrival']    || 0,
        'departure':         player['departure']  || 0,
        'bombtime':          player['bombtime']   || 0,
        'tagprotime':        player['tagprotime'] || 0,
        'griptime':          player['griptime']   || 0,
        'speedtime':         player['speedtime']  || 0,
        'tagpros':           player['tagpros']    || 0,
        'grips':             player['grips']      || 0,
        'bombs':             player['bombs']      || 0,
        'powerups':          player['powerups']   || 0,
        'team':              player.team == 1 ? "1" : "0", // we'll translate it back to red/blue on the web side. 1 is red, 0 is blue.
        'degree':            player.degree,
		'win':				 tagpro.score.r == tagpro.score.b ? '2' : tagpro.score.r > tagpro.score.b ? '1' : '0', // the two bits this takes up outweighs the math to determine the winner
		'map':               $("#mapInfo").text(), // TODO: send this as a one-off in the POST to avoid sending the same map data a dozen times per request. adds ~300 bytes to transmission.
		'host':		tagpro.host,
		'auth':		player['auth'] == true ? "1" : "0",
      }
    });

  } // team stats have been removed as they can be extrapolated from the existing data

  function exportCSV() {
    var file = csv(stats);
	var put = "csv=";
	put += file;
	
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("POST","http://tagpro.me/ajax.php",true);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlhttp.send(put);

    var a = document.createElement('a');
    var event = document.createEvent('MouseEvents')
    event.initEvent('click', true, false);

    // trigger download
    a.dispatchEvent(event);
  }

  function csv(array) {
	var result = '';
	array.forEach(function(player, i) {
	var keys = Object.keys(player);
	var comma = String.fromCharCode(127);
	var linefeed = String.fromCharCode(129);
      // write header
      if(i == 0)
        result = keys.map(wrap).join(comma) + '\r\n'; //ASCII dec 32-126 are available namespace for players

      // write row
      result += keys.map(function(k) { return wrap(player[k]); }).join(comma) + '\r\n'; //ASCII dec 32-126 are available namespace for players

    });

    return result;

    function wrap(v) {
		var quotes = String.fromCharCode(128);
		var w = encodeURIComponent(v);
      return quotes + w + quotes; //ASCII dec 32-126 are available namespace for players
    }
  }

  catstats.getEmergencyCSV = getEmergencyCSV;
  catstats.exportCSV = exportCSV;
  catstats.players = players;

  return catstats

}({}))