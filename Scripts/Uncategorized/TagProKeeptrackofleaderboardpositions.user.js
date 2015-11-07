// ==UserScript==
// @name         TagPro Keep track of leaderboard positions
// @namespace    http://arfie.nl/
// @version      0.1
// @description  Keeps track of leaderboard position after every game.
// @author       Ruud Verbeek
// @include      http://tagpro-*.koalabeast.com*
// @include 	 http://tangent.jukejuice.com*
// @include      http://maptest*.newcompte.fr*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

function addReady(fn) {
    if(typeof tagpro !== "undefined")
        tagpro.ready(fn);
    else setTimeout(function() {addReady(fn);}, 0);
}

var empty = '[0,0,0,0,0,0,0,0]';

addReady(function() {
    tagpro.socket.on('end', function(groupID, time, winner) {
        var myScore = tagpro.players[tagpro.playerId].score, pos = 0;
        for(var i in tagpro.players) {
            var player = tagpro.players[i];
            console.log(player.score);
            if(player.score > myScore)
                ++pos;
        }
        
        var positions = JSON.parse(GM_getValue('leaderboardPositions', empty));
        ++positions[pos];
        console.log(myScore);
        console.log(pos);
        console.log(positions);
        GM_setValue('leaderboardPositions', JSON.stringify(positions));
    });
});

if(document.title === 'TagPro Capture the Flag') {
    var positions = JSON.parse(GM_getValue('leaderboardPositions', empty));
    console.log(positions);
    $('<div id="leaderboardPositions"></div>').appendTo('article');
    $('#leaderboardPositions').css({
        'position':'absolute',
        'left':'.5em',
        'bottom':'.5em'
    })
    .html('<b>Best leaderboard positions</b><table></table>');
    for(var i=0; i<8; ++i) {
        $('<tr></tr>').appendTo('#leaderboardPositions table')
        .append('<td>'+(i+1)+': </td><td>'+positions[i]+'</td>');
    }
    $('#leaderboardPositions table').append('<tr><td colspan="2"><a id="resetLB" href>Reset</a></td></tr>');
    $('#resetLB').click(function() {
        GM_setValue('leaderboardPositions', empty);
        $('#leaderboardPositions table tr td:nth-child(2)').text('0');
    });
}