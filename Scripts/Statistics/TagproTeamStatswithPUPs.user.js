// ==UserScript==
// @name          TagPro Team Stats
// @namespace     http://www.reddit.com/user/thevdude/
// @description   Adds team stats to score boards (with PUPs). Updated for v3.2.
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://maptest*.newcompte.fr:*
// @include       http://justletme.be:*
// @copyright     2014+ thevdude
// @author        thevdude, yank
// @version       1.2
// ==/UserScript==

function updateTeamStats() {
  tagpro.redStats = {
    "s-captures": 0,
    "s-drops": 0,
    "s-grabs": 0,
    "s-hold": 0,
    "s-pops": 0,
    "s-prevent": 0,
    "s-returns": 0,
    "s-support": 0,
    "s-tags": 0,
    "s-powerups": 0,
    "score": 0,
    "points": 0
  }
  
  tagpro.blueStats = {
    "s-captures": 0,
    "s-drops": 0,
    "s-grabs": 0,
    "s-hold": 0,
    "s-pops": 0,
    "s-prevent": 0,
    "s-returns": 0,
    "s-support": 0,
    "s-tags": 0,
    "s-powerups": 0,
    "score": 0,
    "points": 0
  }
  
  rS = tagpro.redStats;
  bS = tagpro.blueStats;
  
  for (x in tagpro.players) {
    tpP = tagpro.players[x];
  
    if ( tpP.team == 1 ) {
      rS["s-captures"] += tpP["s-captures"]
      rS["s-drops"] += tpP["s-drops"]
      rS["s-grabs"] += tpP["s-grabs"]
      rS["s-hold"] += tpP["s-hold"]
      rS["s-pops"] += tpP["s-pops"]
      rS["s-prevent"] += tpP["s-prevent"]
      rS["s-returns"] += tpP["s-returns"]
      rS["s-support"] += tpP["s-support"]
      rS["s-tags"] += tpP["s-tags"]
      rS["s-powerups"] += tpP["s-powerups"]
      rS["score"] += tpP["score"]
      if(tpP["points"]) rS["points"] += tpP["points"]
    } else if (tpP.team == 2 ) {
      bS["s-captures"] += tpP["s-captures"]
      bS["s-drops"] += tpP["s-drops"]
      bS["s-grabs"] += tpP["s-grabs"]
      bS["s-hold"] += tpP["s-hold"]
      bS["s-pops"] += tpP["s-pops"]
      bS["s-prevent"] += tpP["s-prevent"]
      bS["s-returns"] += tpP["s-returns"]
      bS["s-support"] += tpP["s-support"]
      bS["s-tags"] += tpP["s-tags"]
      bS["s-powerups"] += tpP["s-powerups"]
      bS["score"] += tpP["score"]
      if(tpP["points"]) bS["points"] += tpP["points"]
    }
  }
  var rStable = $('.redStats').find("td");
  var bStable = $('.blueStats').find("td");
  rStable.eq(1).text(rS.score), 
  rStable.eq(2).text(rS["s-tags"]), 
  rStable.eq(3).text(rS["s-pops"]), 
  rStable.eq(4).text(rS["s-grabs"]), 
  rStable.eq(5).text(rS["s-drops"]), 
  rStable.eq(6).text(tagpro.helpers.timeFromSeconds(rS["s-hold"], !0)), 
  rStable.eq(7).text(rS["s-captures"]), 
  rStable.eq(8).text(tagpro.helpers.timeFromSeconds(rS["s-prevent"], !0)), 
  rStable.eq(9).text(rS["s-returns"]), 
  rStable.eq(10).text(rS["s-support"]),
  rStable.eq(11).text(rS["s-powerups"]), 
  rStable.eq(12).text(rS["points"] == 0 ? "-" : rS.points);

  bStable.eq(1).text(bS.score), 
  bStable.eq(2).text(bS["s-tags"]), 
  bStable.eq(3).text(bS["s-pops"]), 
  bStable.eq(4).text(bS["s-grabs"]), 
  bStable.eq(5).text(bS["s-drops"]), 
  bStable.eq(6).text(tagpro.helpers.timeFromSeconds(bS["s-hold"], !0)), 
  bStable.eq(7).text(bS["s-captures"]), 
  bStable.eq(8).text(tagpro.helpers.timeFromSeconds(bS["s-prevent"], !0)), 
  bStable.eq(9).text(bS["s-returns"]), 
  bStable.eq(10).text(bS["s-support"]),
  bStable.eq(11).text(bS["s-powerups"]), 
  bStable.eq(12).text(bS["points"] == 0 ? "-" : bS.points);
}

var teamStatsTable = '<table><tbody><tr><th>Team</th><th>Score</th><th>Tags</th><th>Popped</th><th>Grabs</th><th>Drops</th><th>Hold</th><th>Captures</th><th>Prevent</th><th>Returns</th><th>Support</th><th>Power-ups</th><th>Rank Pts</th></tr></tbody><tbody class="teamStats"><tr class="redStats"><td><span class="scoreName" style="color: #FFB5BD;">RED</span></td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>00:00</td><td>0</td><td>00:00</td><td>0</td><td>0</td><td>0</td><td>-</td></tr><tr class="blueStats"><td><span class="scoreName" style="color: #CFCFFF;">BLUE</span></td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>00:00</td><td>0</td><td>00:00</td><td>0</td><td>0</td><td>0</td><td>-</td></tr></tbody></table>'

$('#options').find('table').after(teamStatsTable);
$('.redStats').css('background-color', 'rgba(180, 85, 85, .5)');
$('.blueStats').css('background-color', 'rgba(85, 85, 180, .5)');

setInterval(updateTeamStats, 1000);