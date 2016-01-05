// ==UserScript==
// @name          TagPro Capture Capture
// @namespace     http://reddit.com/user/snaps_
// @description   Follow the Flag Carrier, or someone else, automatically!
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://maptest*.newcompte.fr:*
// @downloadURL   https://gist.github.com/chrahunt/990a5792a22acd260120/raw/tagpro-capture-capture.user.js
// @require       https://gist.github.com/chrahunt/4843f0258c516882eea0/raw/loopback.user.js
// @require       https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.6/moment.min.js
// @license       MIT
// @author        snaps
// @version       0.1.0
// ==/UserScript==
/*
 * Follows flag carrier around, or a random player if no flag carrier
 * is available. When spectating, press E to enable, and D to disable.
 * Feedback should be visible through the chat. Caps are recorded regardless
 * if you have the beta version of TagProReplays.
 */
(function(window, document) {

// Wait until the tagpro object is available before running the
// provided function.
function runOnTagpro(fn) {
  if (typeof tagpro !== 'undefined') {
    fn();
  } else {
    setTimeout(function() {
      runOnTagpro(fn);
    }, 0);
  }
}

function setImmediate(fn) {
  setTimeout(function () {
    fn();
  }, 0);
}

// Keys to be removed/added from tagpro.keys when following.
var KEYS = {
  centerZoom: [67],
  resetZoom: [90],
  specBlueFC: [83],
  specNext: [81],
  specPrev: [87],
  specRedFC: [65],
  toggleAutoJoin: [32],
  zoomIn: [61, 187],
  zoomOut: [173, 189]
};

// Flags that may be picked up.
var FLAGS = [3, 4, 16, 19, 20, 21];

// tagpro team<->number correspondences.
var TEAMS = {
  red: 1,
  blue: 2
};

// Key codes for keys used in this script.
var KEY_CODES = {
  e: 69,
  d: 68
};

// Array of numbers in KEY_CODES.
var LISTENED_KEYS = [69, 68];

// Remove keys from tagpro.keys.
function removeKeys() {
  if (typeof tagpro == "undefined") return;
  for (var key in KEYS) {
    tagpro.keys[key] = [];
  }
}

// Add keys to tagpro.keys.
function addKeys() {
  if (typeof tagpro == "undefined") return;
  for (var key in KEYS) {
    tagpro.keys[key] = KEYS[key].slice();
  }
}

// Whether the player-following behavior is enabled.
var enabled = false;

// Prevent macro keys from impacting tagpro play.
runOnTagpro(function() {
  tagpro.ready(function() {
    // Run function once before removing.
    tagpro.rawSocket.once("spectator", function() {
      init();
    });

    // Initialize the script if spectating.
    function init() {
      // Listen for flag events.
      tagpro.socket.on("mapupdate", function(e) {
        if (enabled) {
          var val = e.v;
          if (FLAGS.indexOf(Math.floor(Number(val))) !== -1) {
            // Flag tile updated.
            // Delay to allow player update to occur.
            setTimeout(getTarget, 125);
          }
        }
      });

      // Record caps.
      tagpro.socket.on('p', function (updates) {
        updates = updates.u || updates;
        updates.forEach(function (update) {
          if (update["s-captures"]) {
            if (typeof TagProReplays !== "undefined") {
              // Delay recording 2 seconds.
              setTimeout(function () {
                var names = [tagpro.teamNames.redTeamName, tagpro.teamNames.blueTeamName].sort(),
                  end = moment(tagpro.gameEndsAt),
                  cap = tagpro.score.r + tagpro.score.b,
                  player_name = tagpro.players[update.id].name;

                TagProReplays.capture({
                  player_id: update.id,
                  name: names[0] + ' v ' + names[1] + ' ' + end.format("MM/DD HH:mm") + ' cap ' + cap + ' (' + player_name + ')'
                });
              }, 2e3);
            }
          }
        });
      });

      // Add document listener for enable/disable keys.
      document.addEventListener("keydown", function(e) {
        var keyCode = Number(e.keyCode);
        if (LISTENED_KEYS.indexOf(keyCode) !== -1) {
          e.preventDefault();
          e.stopPropagation();
          if (keyCode == KEY_CODES.e) {
            followEnable();
          } else if (keyCode == KEY_CODES.d) {
            followDisable();
          }
        }
      }, false);
      // Delay for a few seconds so it's visible after the Spectator
      // text.
      setTimeout(function() {
        showInfo("Loaded! Press E to enable and D to disable.");
      }, 3e3);
    }
  });
});

// Enable the player-following behavior.
function followEnable() {
  if (!enabled) {
    enabled = true;
    // Remove keys from tagpro.
    removeKeys();
    tagpro.viewport.followPlayer = true;
    tagpro.zoom = 1;
    tagpro.zooming = 0;
    getTarget();
    showInfo("Enabled.");
  }
}

// Disable the player-following behavior.
function followDisable() {
  if (enabled) {
    enabled = false;
    addKeys();
    showInfo("Disabled.");
  }
}

// Retrieve target player to follow and follow them.
function getTarget() {
  // Get flag carriers.
  var flagCarriers = [];
  for (var p in tagpro.players) {
    if (tagpro.players[p].flag !== null) {
      flagCarriers.push(p);
    }
  }

  if (flagCarriers.length > 0) {
    // Pick a flag carrier.
    var i = Math.floor(Math.random() * flagCarriers.length);
    var id = flagCarriers[i];
    var player = tagpro.players[id];
    if (player.team == TEAMS.red) {
      tagpro.socket.emit("redflagcarrier");
    } else {
      tagpro.socket.emit("blueflagcarrier");
    }
  } else {
    // Go to the next person.
    tagpro.socket.emit("next");
  }
}

// Show feedback to user.
function showInfo(message) {
  if (typeof io !== "undefined" && io.__loopback &&
    typeof tagpro !== "undefined") {
    tagpro.socket.emit("local:chat", {
      to: "all",
      from: null,
      message: "Player Follower: " + message
    });
  }
}

})(window, document);
