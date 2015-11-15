// ==UserScript==
// @name          Tagpro Fair Teams Userscript
// @namespace     http://www.reddit.com/user/happytagpro/
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// @license       WTFPL
// @author        CocoaBotter (Original version by happy)
// @version       0.2
// ==/UserScript==

//set preferences HERE:
automaticallySwitchTeams = true //whenever the regular conditions are satisfied AND you don't have the flag, switch teams
useUnfairTeamsWarning = true //tint the screen slightly when the other team has fewer players then your's does, but the team switching conditions are not met.
requestSwitch = true //if conditions are met, request that someone on the other team to switch to yours

// Wait until the tagpro object exists, and add the function to tagpro.ready
function addToTagproReady(fn) {
	// Make sure the tagpro object exists.
	if (typeof tagpro !== "undefined") {
		tagpro.ready(fn);
	} else {
		// If not ready, try again after a short delay.
		setTimeout(function() {
			addToTagproReady(fn);
		}, 0);
	}
}
addToTagproReady(function() {
	//requests that someone switch teams in chat is limited to once per game.
	alreadyRequested = false
	//ensure that this runs at least once when joining a game
	setTimeout(checkConditions, 500)
	//hide switch team button because you don't need it any more
	if (automaticallySwitchTeams) {
		$("#switchButton").css("display", "none")
	}
	//check team switching requirements if someone leaves/joins the game.
	tagpro.socket.on('chat', function(m) {
			if (m.from == null) {
				setTimeout(checkConditions, 200);
			}
		})
		//check team switching requirements if someone scores or drops the flag.
	tagpro.socket.on("sound", function(message) {
		if (["friendlydrop"].indexOf(message.s) > -1) {
			setTimeout(checkConditions, 3000)
		} else if (["cheering"].indexOf(message.s) > -1) {
			setTimeout(checkConditions, 200)
		}
	});
	function checkConditions() {
		if (tagpro.state != 2) {
			//count number of players on each team
			rCount = 0
			bCount = 0
			for (id in tagpro.players) {
				rCount += (tagpro.players[id].team == 1)
				bCount += (tagpro.players[id].team == 2)
			}
			playerCount = {
					r: rCount,
					b: bCount
				}
				//get team colors
			myTeam = tagpro.players[tagpro.playerId].team == 1 ? 'r' : 'b';
			opponentTeam = myTeam == 'r' ? 'b' : 'r';
			//check conditions for switching teams, tinting, switchteam request
			if (((playerCount[myTeam] - playerCount[opponentTeam] > 1) | (playerCount[myTeam] > playerCount[opponentTeam] & tagpro.score[myTeam] > tagpro.score[opponentTeam])) & !tagpro.players[tagpro.playerId].flag & automaticallySwitchTeams) {
				tagpro.socket.emit("switch")
				switchingTeamWarning()
			} else if (playerCount[myTeam] > playerCount[opponentTeam]) {
				if (useUnfairTeamsWarning) {
					unevenTeamsWarning("ON")
				}
			} else if ((playerCount[opponentTeam] - playerCount[myTeam] > 1) | (playerCount[opponentTeam] > playerCount[myTeam] & tagpro.score[opponentTeam] > tagpro.score[myTeam])) {
				if (requestSwitch) {
					if (!alreadyRequested) {
						tagpro.socket.emit("chat", {
							message: "can someone switch teams?",
							toAll: true
						})
						alreadyRequested = true
					}
				}
			} else if (playerCount[myTeam] <= playerCount[opponentTeam]) {
				unevenTeamsWarning("OFF")
			}
		}
	}
	//unfair team warning tinted overlay 
	var unevenTeamsOverlayCSS = {
		height: "100%",
		width: "100%",
		position: "fixed",
		left: 0,
		top: 0,
		background: "rgba(200,200,200,.35)",
		display: "none"
	}
	var unevenTeamsOverlay = '<div class="unevenTeamsOverlay"></div>'
	$('body').find('#sound').after(unevenTeamsOverlay);
	$(".unevenTeamsOverlay").css(unevenTeamsOverlayCSS)
	function unevenTeamsWarning(m) {
		if (m == "ON") {
			$(".unevenTeamsOverlay").css("display", "")
		} else {
			$(".unevenTeamsOverlay").css("display", "none")
		}
	}
	//message/overlay when switching teams
	var switchingTeamOverlayCSS = {
		height: "100%",
		width: "100%",
		position: "fixed",
		left: 0,
		top: 0,
		background: "rgba(10,10,10,.7)",
		display: "none",
		"text-align": "center",
		"line-height": "300px",
		"font-size": "x-large"
	}
	var switchingTeamOverlay = '<div class="switchingTeamOverlay"><h3>Switching Teams...</h3></div>'
	$('body').find('#sound').after(switchingTeamOverlay);
	$(".switchingTeamOverlay").css(switchingTeamOverlayCSS)
	function switchingTeamWarning() {
		$(".switchingTeamOverlay").css("display", "")
		setTimeout(function() {
			$(".switchingTeamOverlay").css("display", "none")
		}, 2000);
	}
	//disable overlays at end of game 
	tagpro.socket.on("end", function() {
		$(".unevenTeamsOverlay").remove()
		$(".switchingTeamOverlay").remove()
	})
});