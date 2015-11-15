// ==UserScript==
// @name          Zmiana drużyn
// @namespace     http://reddit.com/user/snaps_
// @description   Switch Teams Fast
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://maptest*.newcompte.fr:*
// @include       http://tangent.jukejuice.com:*
// @downloadURL   https://gist.github.com/chrahunt/0212e8517a7e6974eeb0/raw/tagpro-team-switcher.user.js
// @resource      switch_icon       http://i.imgur.com/aryEWao.png
// @resource      switch_back_icon  http://i.imgur.com/m5H2595.png
// @license       MIT
// @author        snaps
// @version       0.1.2
// ==/UserScript==
/*
 * Switch teams easily using icons in the upper-right of the game screen or configurable
 * shortcut keys.
 */
(function(window, document) {
// Config.
// Keys to switch teams.
// Whether shortcut keys should be enabled.
var SHORTCUT_ENABLED = false;
// Switch to other team and back.
var QUICK_SWITCH_TEAMS_KEY = 188; // The ,/< key
// Just switch to other team.
var SWITCH_TEAMS_KEY = 190; // The ./> key
// End Config.

var LISTENED_KEYS = [QUICK_SWITCH_TEAMS_KEY, SWITCH_TEAMS_KEY];

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

// tagpro team<->number correspondences.
var TEAMS = {
  red: 1,
  blue: 2
};

// Make an icon div with the given id and image name.
// backgroundImage is a string identifying the userscript resource
// to be used. Should correspond to a resource specified in the
// userscript header.
function makeDiv(id, backgroundImage) {
  var elt = document.createElement("div");
  elt.setAttribute('id', id);
  elt.style.setProperty('width', '32px');
  elt.style.setProperty('height', '32px');
  elt.style.setProperty('float', 'left');
  elt.style.setProperty('cursor', 'pointer');
  if (backgroundImage) {
    elt.style.setProperty('background-image',
      'url("' + GM_getResourceURL(backgroundImage) + '")');
  }
  return elt;
}

function controlsDisabled() {
  return typeof tagpro !== "undefined" && tagpro.disableControls;
}

// Prevent macro keys from impacting tagpro play.
runOnTagpro(function() {
  tagpro.ready(function() {
    // Don't display button if spectating.
    var socket = tagpro.rawSocket;

    // Reset changes if user is a spectator.
    socket.once("spectator", function() {
      reset();
    });

    init();

    if (SHORTCUT_ENABLED) {
      document.addEventListener("keydown", keyDownHandler);
    }

    // Add UI elements.
    function init() {
      // Make divs and add to page.
      var container = document.getElementById("sound");
      container.style.setProperty('width', '128px');
      var child = document.getElementById("soundEffects");
      var stDiv = makeDiv("switchTeams", "switch_icon");
      var qstDiv = makeDiv("quickSwitchTeams", "switch_back_icon");
      container.insertBefore(stDiv, child);
      container.insertBefore(qstDiv, child);

      // Set click behaviors.
      stDiv.addEventListener("click", switchTeams);
      qstDiv.addEventListener("click", quickSwitch);

      // Other UI changes.
      var slider = document.getElementById("volumeSlider");
      if (slider) {
        slider.style.setProperty('float', 'right');
      }
    }

    // Reset userscript changes.
    function reset() {
      var container = document.getElementById("sound");
      var stDiv = document.getElementById("switchTeams");
      var qstDiv = document.getElementById("quickSwitchTeams");
      // Remove elements
      container.removeChild(stDiv);
      container.removeChild(qstDiv);
      // Reset style.
      container.style.setProperty('width', '64px');
      // Remove key listener.
      if (SHORTCUT_ENABLED) {
        document.removeEventListener("keydown", keyDownHandler);
      }

      // Other UI changes.
      var slider = document.getElementById("volumeSlider");
      if (slider) {
        slider.style.removeProperty('float');
      }
    }

    // Just switch teams.
    function switchTeams() {
      socket.emit("switch");
    }

    // Whether currently quick-switching.
    var switching = false;
    // Switch teams, but switch back ASAP.
    function quickSwitch() {
      if (switching) {
        return;
      } else {
        switching = true;
      }
      // Listener for can't switch chat.
      function chatListener(e) {
        var m = "You can't switch teams right now.";
        if (e.from === null && e.message == m) {
          socket.removeListener("chat", chatListener);
          socket.removeListener("p", spawnListener);
          switching = false;
        }
      }

      // Listen for respawn.
      function spawnListener(updates) {
        updates = updates.u;
        for (var i = 0; i < updates.length; i++) {
          var update = updates[i];
          if (update.id === tagpro.playerId) {
            if (update.dead === false) {
              socket.removeListener("p", spawnListener);
              socket.removeListener("chat", chatListener);
              socket.emit("switch");
              switching = false;
            }
          }
        }
      }

      socket.on("chat", chatListener);
      socket.on("p", spawnListener);
      socket.emit("switch");
    }

    function keyDownHandler(e) {
      if (controlsDisabled()) return;
      var keyCode = e.keyCode;
      if (LISTENED_KEYS.indexOf(keyCode) !== -1) {
        e.preventDefault();
        e.stopPropagation();
        switch(keyCode) {
        case QUICK_SWITCH_TEAMS_KEY:
          quickSwitch();
          break;
        case SWITCH_TEAMS_KEY:
          switchTeams();
          break;
        }
      }
    }
  });
});

})(window, document);