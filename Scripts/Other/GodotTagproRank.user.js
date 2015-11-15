// ==UserScript==
// @name          TagPro Rank Userscript
// @namespace     http://www.reddit.com/user/-omicron-/
// @description   Displays ranks on users ingame based on tagpro-stats.com data
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://maptest.newcompte.fr:*
// @include       http://maptest2.newcompte.fr:*
// @include       http://justletme.be:*
// @license       GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author        OmicroN
// @version       0.7
// ==/UserScript==

tagpro.ready(function() {
  // Stores the options for user to customize the script
  rankoptions = []

  /*
          The identifier to use to pull either the actual number
            or rank for the various different stats available

         See http://www.tagpro-stats.com/profile.php?userid=20338

                                Number            Rank
        Win Percent       | win-percent | win-percent-rank
        Wins              | wins        | wins-rank
        Losses            | losses      | losses-rank
        Games             | games       | games-rank
        Hours             |
        Minutes/Game      | minute-game | minute-game-rank
        Disconnects       | dcs         | dcs-rank

        Grabs             | grabs       | grabs-rank
        Grabs/Game        | grab_game   | grab-game-rank
        Grabs/Hour        | grab-hour   | grab-hour-rank
        Drops             | drops       | drops-rank
        Drops/Game        | drop-game   | drop-game-rank
        Drops/Hour        | drop-hour   | drop-hour-rank
        Popped            | popped      | popped-rank
        Pops/Game         | pop-game    | pop-game-rank
        Pops/Hour         | pop-hour    | pop-hour-rank

        Tags              | tags        | tags-rank
        Tags/Game         | tag-game    | tag-game-rank
        Tags/Hour         | tag-hour    | tag-hour-rank
        Returns           | returns     | returns-rank
        Returns/Game      | return-game | return-game-rank
        Returns/Hours     | return-hour | return-hour-rank
        Captures          | captures    | captures-rank
        Captures/Game     | cap-game    | cap-game-rank
        Captures/Hour     | cap-hour    | cap-hour-rank

        Captures/Grab     | caps-grab   | caps-grab-rank
        Tags/Pop          | tag-pop     | tag-pop-rank
        Non-Return Tags   | nrtags      | nrtags-rank

        Support           | support     | support-rank
        Hold              | hold        | hold-rank
        Prevent           | prevent     | prevent-rank
  */
  rankoptions['query'] = 'win-percent';

  // Timespan to pull data from 'all' for all time or 'month' for monthly stats.
  rankoptions['timespan'] = 'month';

  // HTML HEX color of the injected stats text for authorized/non authorized users
  rankoptions['color-auth'] = '#FDD017'; // Default #FDD017 (gold)
  rankoptions['color-nonauth'] = '#CCCCCC'; // Default #FFFFFF (white)

  // Position to place stat text relative to top left corner of player name
  // limited to a x/width of 200 and y/height of 45
  rankoptions['position'] = {x: 50, y: 27};

  // END CUSTOMIZABLE VARIABLES

  // Stores the playerid/names of players who have already been parsed/ranked in the current game
  ranked = [];

  // Simple function to get the length of an object
  function objectLength(obj) {
    	var result = 0;

    	for(var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
        		result++;
      	}
    	}

    	return result;
  }

  // Variable to hold the name/value pair playerids and names for our GET request
  var querystring = '';

  // Loop through all current players in the game and build querystring variable
  for (var pID in tagpro.players)
  {
    	// Add player to ranked array so we don't pull stats for them again this game
    	ranked[pID] = tagpro.players[pID].name;

    	querystring += "player[" + pID + "]=" + encodeURIComponent(tagpro.players[pID].name) + "&";
  }

  if (querystring) {
    // Use the options and the list of players in the game and make an AJAX get request to stats query page/site
    $.get('http://tagpro-stats.com/stats.php?query=' + rankoptions['query'] + '&timespan=' + rankoptions['timespan'] + '&' + querystring, function(data) {
    	// Parse returned results as JSON, results are returned key/value of playerid/requested stat
    	var results = $.isPlainObject(data) ? data : $.parseJSON(data);

    	// Loop through the results and draw the requested stat next to each players ball using the options set above in the script
    	for (pID in results)
      {
        var rank = tagpro.renderer.prettyText(results[pID], tagpro.players[pID].auth ? rankoptions['color-auth'] : rankoptions['color-nonauth']);
        rank.x = 70; rank.y = -4; tagpro.players[pID].sprites.name.parent.addChild(rank);
    	}
    });
  }

  // Create a listener on the tagpro socket object for the 'p' event which is used for
  // various aspects of the game but also used when a new player joins the game
  tagpro.socket.on('p', function(data) {
  	data = data.u || data;

    setTimeout(function() {
    	// This whole code block is similar to the one above except when your spectating a game a new player joins for some reason there
    	// is no u object assocated with the passed data and instead is passed as an array in the first key so we check that first key to
    	if (typeof data[0] !== "undefined" && typeof data[0].name !== "undefined" && typeof ranked[data[0].id] === "undefined")
    	{
    		querystring = '';

    		for (var i = 0; i < objectLength(data); i++)
    		{
        	// Add player to ranked array so we don't pull stats for them again this game
        	ranked[data[i].id] = data[i].name;

        	querystring += "player[" + data[i].id + "]=" + encodeURIComponent(data[i].name) + "&";
    		}

        if (querystring) {
    	    // Use the options and the list of players in the game and make an AJAX get request to stats query page/site
    	    $.get('http://tagpro-stats.com/stats.php?query=' + rankoptions['query'] + '&timespan=' + rankoptions['timespan'] + '&' + querystring, function(data) {
          	// Parse returned results as JSON, results are returned key/value of playerid/requested stat
          	var results = $.isPlainObject(data) ? data : $.parseJSON(data);

          	// Loop through the results and draw the requested stat next to each players ball using the options set above in the script
          	for (pID in results)
          	{
              var rank = tagpro.renderer.prettyText(results[pID], tagpro.players[pID].auth ? rankoptions['color-auth'] : rankoptions['color-nonauth']);
              rank.x = 70; rank.y = -4; tagpro.players[pID].sprites.name.parent.addChild(rank);
          	}
    	    });
        }
      }
    }, 1000);
  });
});