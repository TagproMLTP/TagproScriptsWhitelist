// ==UserScript==
// @name            Map Stats
// @description     Shows frequency & stats for maps you play.
// @version         1.2.0
// @include         http://tagpro-*.koalabeast.com*
// @include         http://*.newcompte.fr*
// @exclude         http://tagpro-maptest*.koalabeast.com*
// @updateURL       https://github.com/TagproMLTP/TagproScriptsWhitelist/raw/1b5eb646d4a18d65734162e6e9bf4edb060be8e4/Scripts/Statistics/TagproMapStats.user.js
// @downloadURL     https://gist.github.com/nabbynz/cf44259aded7b4c32df0/raw/TagPro_MapStats.user.js
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_addStyle
// @grant           GM_deleteValue
// @run-at          document-end
// @license         GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author          nabby
// ==/UserScript==

console.log('START: ' + GM_info.script.name + ' (v' + GM_info.script.version + ' by ' + GM_info.script.author + ')');

var options = {
    'timePlayed':    { display:'Time Played',                            value:true,             },
    'winpercent':    { display:'Win %',                                  value:true,             },
    'captures':      { display:'Captures',                               value:true,             },
    'grabs':         { display:'Grabs',                                  value:true,             },
    'hold':          { display:'Hold',                                   value:true,             },
    'drops':         { display:'Drops',                                  value:true,             },
    'tags':          { display:'Tags',                                   value:true,             },
    'pops':          { display:'Pops',                                   value:true,             },
    'returns':       { display:'Returns',                                value:true,             },
    'prevent':       { display:'Prevent',                                value:true,             },
    'support':       { display:'Support',                                value:true,             },
    'powerups':      { display:'Powerups',                               value:true,             },
    'capsgrab':      { display:'Caps/Grab',                              value:false,            },
    'capshour':      { display:'Caps/Hour',                              value:true,             },
    'tagspop':       { display:'Tags/Pop',                               value:false,            },
    'returnshour':   { display:'Returns/Hour',                           value:true,             },
    'preventhour':   { display:'Prevent/Hour',                           value:false,            },
    'showtotals':    { display:'Show Totals',                            value:true,             },
    'showheader':    { display:'Show Header (in game)',                  value:true,             },
    'hidelowlymaps': { display:'Hide Lowly Played Maps?',                value:true,             },
    'highlightmaxs': { display:'Highlight Max Values?',                  value:true,             },
    'showborder':    { display:'Show Border?',                           value:true,             },
    'widescreen':    { display:'Attempt Widescreen Position',            value:false,            },
};
var MapStats_Options; // = options;

var mapFreq = {};

function WhichPageAreWeOn(){
    if (window.location.port) { //In a real game
        return('ingame');
    } else if (document.URL.indexOf('/games/find') > 0) { //Joining page
        return('joining');
    } else if ($('#play').length) { //Chosen server homepage
        return('server');
    } else if (document.URL.indexOf('/profile/') > 0) {
        if ($('#showSettings').length) {
            return('profile'); //Profile page and logged in
        } else {
            return('profileNotOurs'); //Profile page, but not our one (or we're logged out)
        }
    } else if ( ((window.location.host == 'tagpro.koalabeast.com') || (window.location.host == 'tagpro.gg')) && (window.location.pathname === '/') ) { //Choose server homepage
        return('home');
    }
}
var PageLoc = WhichPageAreWeOn();

function secondsToHMS(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s);
}

function comparer(index) {
    return function(a, b) {
        var valA = getCellValue(a, index), valB = getCellValue(b, index);
        return $.isNumeric(valA) && $.isNumeric(valB) ? valB - valA : valA.localeCompare(valB);
    };
}
function getCellValue(row, index){
    return $(row).children('td').eq(index).data('sortby');
}

function saveMapData(mapName, result, pups, mapAuthor) {
    if (mapFreq.hasOwnProperty(mapName)) { //map already exists
        mapFreq[mapName].playedCount++;
        if ((mapFreq[mapName].mapAuthor === '') || (!mapFreq[mapName].mapAuthor)) mapFreq[mapName].mapAuthor = mapAuthor;
    } else { //first time
        mapFreq[mapName] = { mapAuthor:mapAuthor, playedCount:1, winCount:0, lossCount:0, saveCount:0, usaCount:0, tieCount:0, tags:0, pops:0, grabs:0, drops:0, hold:0, captures:0, prevent:0, returns:0, support:0, powerups:0, timePlayed:0 };
    }

    switch (result) {
        case 1: //Win
            mapFreq[mapName].winCount++;
            break;
        case 2: //Loss
            mapFreq[mapName].lossCount++;
            break;
        case 11: //Successful Save
            mapFreq[mapName].saveCount++;
            break;
        case 4: //Unsuccessful Save Attempt
            mapFreq[mapName].usaCount++;
            break;
        case 5: //Tie
            mapFreq[mapName].tieCount++;
            break;
    }

    $.each(pups, function(key, value) {
        mapFreq[mapName][key] += value;
    });

    GM_setValue('mapFreq', mapFreq);
}


tagpro.ready(function() {
    if (GM_getValue('mapFreq')) {
        mapFreq = GM_getValue('mapFreq');
        if (mapFreq.hasOwnProperty('Death Trap')) {
            delete mapFreq['Death Trap'];
            GM_setValue('mapFreq', mapFreq);
        }
    }

    MapStats_Options = $.extend(true, {}, options, GM_getValue('MapStats_Options', options));
    $.each(MapStats_Options, function(key, value) {
        MapStats_Options[key].display = options[key].display;
    });
    if (GM_getValue('MapStats_Options') === undefined) { //first time
        GM_setValue('MapStats_Options', MapStats_Options);
    }

    if ((PageLoc === 'server')) { //show on server home page
        var MapFreq_Div = '<div id="MapFreq" style="position:relative; margin:20px auto 0 auto; padding:10px 0; width:-webkit-fit-content; font-size:12px; color:#fff; text-align:center; border-radius:8px;' + (MapStats_Options.showborder.value ? ' box-shadow:#fff 0px 0px 10px;' : '') + ' background:rgba(0,0,0,0.1); white-space:nowrap;"></div>';
        var MapFreq_Header = '<div id="MapStats_Pause" style="position:absolute; left:10px; display:inline-block; font-size:10px; text-align:center; margin-top:0px; height:11px; min-width:12px; border:2px solid #ed590c; border-radius:8px; cursor:pointer"></div>' +
            '<div id="MapStats_HideShowButton" style="display:inline-block; font-size:12px; text-align:center; margin-right:10px; height:14px; width:14px; background:#fff; color:#000; border-radius:3px; cursor:pointer" title="Hide/Show">&#8597;</div>Map Stats' +
            '<div id="MapStats_Options_Button" style="display:inline-block; font-size:11px; text-align:center; margin-left:10px; height:13px; width:14px; border:2px solid #808; border-radius:8px; cursor:pointer" title="Column Chooser">&#8286;</div>' +
            '<div style="position:absolute; display:inline-block; right:10px; margin-top:-3px; float:right;"><label id="ms_pergame_label"><input id="ms_pergame" type="checkbox" ' + (GM_getValue('PerGameStats') ? 'checked' : '') + '>Averages</label></div>';
        var totalPlays = 0;
        var highestPlayed = 0;
        var mapFreqSorted = [];
        var trimmedMapName = '';
        var mapPreviewID = '';

        //the following are id's on http://unfortunate-maps.jukejuice.com and used only for map previews (I don't know of a better way to do this)
        //names must be exact for this to work
        //message me if you want others added (with the map name and id)
        var knownMaps = {"45"                     : 363,
                         "Angry Pig"              : 4924,
                         "Arena"                  : 4925,
                         "Backdoor"               : 4919,
                         "Battery"                : 381,
                         "Big Vird"               : 4921,
                         "Blast Off"              : 366,
                         "Bombing Run"            : 367,
                         "Boombox"                : 368,
                         "Boostsv2.1"             : 369,
                         "Bulldog"                : 8445,
                         "Center Flag"            : 4891,
                         "CFB"                    : 4931,
                         "Citadel"                : 16395,
                         "Command Center"         : 278,
                         "Constriction"           : 4915,
                         "Cloud"                  : 777,
                         "Clutch"                 : 4892,
                         "Colors"                 : 370,
                         "Danger Zone 3"          : 371,
                         "DZ4"                    : 11158,
                         "Draft"                  : 6060,
                         "Dumbbell"               : 4893,
                         "EMERALD"                : 5436,
                         "Fiend"                  : 15557,
                         "Figure 8"               : 4895,
                         "Flame"                  : 2668,
                         "Foozball"               : 4934,
                         "Frontdoor"              : 5439,
                         "GamePad"                : 372,
                         "Gatekeeper"             : 2842,
                         "GeoKoala"               : 4898,
                         "Glory Hole"             : 376,
                         "Grail of Speed"         : 4916,
                         "Hornswoggle"            : 5493,
                         "Hurricane"              : 4922,
                         "Hyper Reactor"          : 374,
                         "Hyperdrive"             : 4914,
                         "Hub"                    : 9200,
                         "IRON"                   : 170,
                         "Jagged"                 : 4935,
                         "Kite"                   : 5619,
                         "Mars Ball Explorer"     : 117,
                         "Micro"                  : 4929,
                         "Monarch"                : 252,
                         "Oval"                   : 375,
                         "Pilot"                  : 690,
                         "Platypus"               : 8446,
                         "Reflex2"                : 4911,
                         "Renegade"               : 5481,
                         "Ricochet"               : 4920,
                         "Rink"                   : 4926,
                         "RocketBalls"            : 4912,
                         "Rush"                   : 12265,
                         "Sediment"               : 16365,
                         "Shine"                  : 5426,
                         "Simplicity"             : 377,
                         "Smirk"                  : 4913,
                         "SNES v2"                : 4938,
                         "Speedway"               : 4904,
                         "Spiders"                : 4930,
                         "Star"                   : 378,
                         "SuperDuperStamp"        : 5328,
                         "Swoop"                  : 379,
                         "The Holy See"           : 373,
                         "Thinking With Portals"  : 6070,
                         "Transilio"              : 9015,
                         "Ultradrive"             : 6008,
                         "Vee"                    : 365,
                         "Velocity"               : 4923,
                         "Volt"                   : 4918,
                         "Whirlwind 2"            : 898,
                         "Wombo Combo"            : 10135,
                         "Wormy"                  : 1167,
                        };

        var totals = { playedCount:0, winCount:0, lossCount:0, saveCount:0, usaCount:0, tieCount:0, tags:0, pops:0, grabs:0, drops:0, hold:0, captures:0, prevent:0, returns:0, support:0, powerups:0, timePlayed:0 };
        $.each(mapFreq, function(key, value) {
            mapFreqSorted.push( { mapName:key, mapAuthor:value.mapAuthor||'', playedCount:value.playedCount||0, winCount:value.winCount||0, lossCount:value.lossCount||0, saveCount:value.saveCount||0, usaCount:value.usaCount||0, tieCount:value.tieCount||0, tags:value.tags||0, pops:value.pops||0, grabs:value.grabs||0, drops:value.drops||0, hold:value.hold||0, captures:value.captures||0, prevent:value.prevent||0, returns:value.returns||0, support:value.support||0, powerups:value.powerups||0, timePlayed:value.timePlayed||0 } );
            if (value.playedCount > highestPlayed) highestPlayed = value.playedCount;
            $.each(totals, function(key2, value2) {
                totals[key2] += value[key2];
            });
        });

        if (PageLoc === 'server') {
            $('#play').parent().next().after(MapFreq_Div);
        }

        if (mapFreqSorted.length > 0) {
            //---------------------------------------------
            //Header Row...
            $('#MapFreq').append('<div id="MapFreq_Header" style="min-width:600px">'+MapFreq_Header+'</div>');
            $('#MapStats_Options_Button').after('<div id="MapStats_Options_Menu" style="display:none; position:absolute; width:250px; margin:-25px 0 0 90px; padding:10px 10px 15px; text-align:left; background:#808; opacity:0.9; border-radius:8px; box-shadow:0px 0px 8px #fff; z-index:6000"></div>');
            $('#MapStats_Options_Menu').append('<div style="margin:0 auto; padding-bottom:5px; font-size:16px; font-weight:bold; color:#000; text-align:center; text-shadow:2px 1px 2px #aaa;">Maps Stats Options</div>');
            $('#MapFreq').append('<table id="MF_Maps" width="98%" style="font-size:11px; margin:0 auto"><thead><tr>' +
                                 '<th                      title="Sort by Map Name">Maps</th>' +
                                 '<th                      title="Sort by Wins" width="40%">Results</th>' +
                                 '<th                      title="Sort by Most Played">Games' +
                                 '<th class="timePlayed"   title="Sort by Time Played">Time</th>' +
                                 '<th class="winpercent"   title="Sort by Win %">W%</th>' +
                                 '<th class="captures"     title="Sort by Caps">C</th>' +
                                 '<th class="grabs"        title="Sort by Grabs">G</th>' +
                                 '<th class="hold"         title="Sort by Hold">H</th>' +
                                 '<th class="drops"        title="Sort by Drops">D</th>' +
                                 '<th class="tags"         title="Sort by Tags">T</th>' +
                                 '<th class="pops"         title="Sort by Popped">P</th>' +
                                 '<th class="returns"      title="Sort by Returns">R</th>' +
                                 '<th class="prevent"      title="Sort by Prevent">P</th>' +
                                 '<th class="support"      title="Sort by Support">S</th>' +
                                 '<th class="powerups"     title="Sort by Powerups">P</th>' +
                                 '<th class="capsgrab"     title="Sort by Caps/Grab">CG</th>' +
                                 '<th class="capshour"     title="Sort by Caps/Hour">CH</th>' +
                                 '<th class="tagspop"      title="Sort by Tags/Pop">TP</th>' +
                                 '<th class="returnshour"  title="Sort by Returns/Hour">RH</th>' +
                                 '<th class="preventhour"  title="Sort by Prevent/Hour">PH</th>' +
                                 '</tr></thead><tbody id="ms_normaldata"></tbody><tbody id="ms_pergamedata"></tbody></table>'); //we're using 2x tbody's as that is much faster for hide/show'ing the averages
            GM_addStyle("#MF_Maps th { text-align:center; background:#fff; color:#000; cursor:pointer; }");

            var winpercentage = (totals.winCount+totals.saveCount)/(totals.playedCount-totals.usaCount)*100;


            //---------------------------------------------
            //Totals Row (x2)...
            $('#ms_normaldata').append('<tr id="mapstats_totals_normal" class="showtotals">' +
                                       '<td>'                          + mapFreqSorted.length + '</td>' +
                                       '<td>W:' + totals.winCount + ' | L:' + totals.lossCount + ' | T:' + totals.tieCount + ' | S:' + totals.saveCount + ' | U:' + totals.usaCount + '</td>' +
                                       '<td>'                          + totals.playedCount + '</td>' +
                                       '<td class="timePlayed">'       + secondsToHMS(totals.timePlayed) + '</td>' +
                                       '<td class="winpercent">'       + winpercentage.toFixed(2) + '</td>' +
                                       '<td class="captures">'         + totals.captures + '</td>' +
                                       '<td class="grabs">'            + totals.grabs + '</td>' +
                                       '<td class="hold">'             + secondsToHMS(totals.hold) + '</td>' +
                                       '<td class="drops">'            + totals.drops + '</td>' +
                                       '<td class="tags">'             + totals.tags + '</td>' +
                                       '<td class="pops">'             + totals.pops + '</td>' +
                                       '<td class="returns">'          + totals.returns + '</td>' +
                                       '<td class="prevent">'          + secondsToHMS(totals.prevent) + '</td>' +
                                       '<td class="support">'          + totals.support + '</td>' +
                                       '<td class="powerups">'         + totals.powerups + '</td>' +
                                       '<td class="capsgrab">'         + (totals.captures/totals.grabs).toFixed(3) + '</td>' +
                                       '<td class="capshour">'         + (totals.captures/(totals.timePlayed/3600)).toFixed(1) + '</td>' +
                                       '<td class="tagspop">'          + (totals.tags/totals.pops).toFixed(3) + '</td>' +
                                       '<td class="returnshour">'      + (totals.returns/(totals.timePlayed/3600)).toFixed(1) + '</td>' +
                                       '<td class="preventhour">'      + (totals.prevent/(totals.timePlayed/3600)).toFixed(1) + '</td>' +
                                       '</tr>');

            $('#ms_pergamedata').append('<tr id="mapstats_totals_pergame" class="showtotals">' +
                                        '<td>' + mapFreqSorted.length   + '</td>' +
                                        '<td>W:' + totals.winCount + ' | L:' + totals.lossCount + ' | T:' + totals.tieCount + ' | S:' + totals.saveCount + ' | U:' + totals.usaCount + '</td>' +
                                        '<td>'                          + totals.playedCount + '</td>' +
                                        '<td class="timePlayed">'       + secondsToHMS(totals.timePlayed / totals.playedCount) + '</td>' +
                                        '<td class="winpercent">'       + winpercentage.toFixed(2) + '</td>' +
                                        '<td class="captures">'         + (totals.captures / totals.playedCount).toFixed(2) + '</td>' +
                                        '<td class="grabs">'            + (totals.grabs / totals.playedCount).toFixed(2) + '</td>' +
                                        '<td class="hold">'             + secondsToHMS(totals.hold / totals.playedCount) + '</td>' +
                                        '<td class="drops">'            + (totals.drops / totals.playedCount).toFixed(2) + '</td>' +
                                        '<td class="tags">'             + (totals.tags / totals.playedCount).toFixed(2) + '</td>' +
                                        '<td class="pops">'             + (totals.pops / totals.playedCount).toFixed(2) + '</td>' +
                                        '<td class="returns">'          + (totals.returns / totals.playedCount).toFixed(2) + '</td>' +
                                        '<td class="prevent">'          + secondsToHMS(totals.prevent / totals.playedCount) + '</td>' +
                                        '<td class="support">'          + (totals.support / totals.playedCount).toFixed(2) + '</td>' +
                                        '<td class="powerups">'         + (totals.powerups / totals.playedCount).toFixed(2) + '</td>' +
                                        '<td class="capsgrab">'         + (totals.captures/totals.grabs).toFixed(3) + '</td>' +
                                        '<td class="capshour">'         + (totals.captures/(totals.timePlayed/3600)).toFixed(1) + '</td>' +
                                        '<td class="tagspop"> '         + (totals.tags/totals.pops).toFixed(3) + '</td>' +
                                        '<td class="returnshour">'      + (totals.returns/(totals.timePlayed/3600)).toFixed(1) + '</td>' +
                                        '<td class="preventhour">'      + (totals.prevent/(totals.timePlayed/3600)).toFixed(1) + '</td>' +
                                        '</tr>');
            GM_addStyle("#mapstats_totals_normal, #mapstats_totals_pergame td { text-align:center; background:#aaa; color:#000; cursor:pointer; }");
            GM_addStyle(".ms_datarow { line-height:0 }");

            //---------------------------------------------
            //Data Row (x2)...
            $.each(mapFreqSorted, function(key, value) {
                trimmedMapName = value.mapName.replace(/[\?\!\.\s]/g, "_");
                mapPreviewID = '';
                if (knownMaps.hasOwnProperty(value.mapName)) {
                    mapPreviewID = knownMaps[value.mapName];
                }

                if (value.playedCount === value.winCount + value.lossCount + value.saveCount + value.usaCount + value.tieCount) {
                    $('#ms_normaldata').append('<tr class="ms_datarow'+(value.playedCount < MapStats_Options.hidelowlymaps.value ? ' MapStats_Lowly' : '')+'">' +
                                               '<td data-sortby="m'+trimmedMapName+'"' + (mapPreviewID ? 'data-previewid="'+mapPreviewID+'" data-mapauthor="'+value.mapAuthor+'" class="mapPreview" ' : '') + 'style="text-align:right; ' + (!mapPreviewID ? 'text-decoration:underline dotted;" title="No Preview Available"' : '"') + '>' + value.mapName + '</td>' +
                                               '<td data-sortby="'+(value.winCount+value.saveCount)+'" style="text-align:left"><div id="map1_'+trimmedMapName+'" style="width:'+(value.playedCount/highestPlayed*100).toFixed(2)+'%; height:8px; overflow:hidden; white-space:nowrap"></div></td>' +

                                               '<td data-sortby="'+value.playedCount+'"                                                        class="playedCount"             title="'+value.mapName+' played '+value.playedCount+' times">'       + (value.playedCount/totals.playedCount*100).toFixed(2) + '% (' + value.playedCount + ')</td>' +
                                               '<td data-sortby="'+value.timePlayed+'"                                                         class="timePlayed"              title="Time Played on '+value.mapName+'">'                           + secondsToHMS(value.timePlayed) + '</td>' +
                                               '<td data-sortby="'+(value.winCount+value.saveCount)/(value.playedCount-value.usaCount || 1)+'" class="winpercent"              title="Win Percentage on '+value.mapName+'">'                        + ((value.winCount+value.saveCount)/(value.playedCount-value.usaCount || 1)*100).toFixed(0) + '%</td>' +
                                               '<td data-sortby="'+value.captures+'"                                                           class="captures"                title="Caps on '+value.mapName+'">'                                  + value.captures + '</td>' +
                                               '<td data-sortby="'+value.grabs+'"                                                              class="grabs"                   title="Grabs on '+value.mapName+'">'                                 + value.grabs + '</td>' +
                                               '<td data-sortby="'+value.hold+'"                                                               class="hold"                    title="Hold on '+value.mapName+'">'                                  + secondsToHMS(value.hold) + '</td>' +
                                               '<td data-sortby="'+value.drops+'"                                                              class="drops"                   title="Drops on '+value.mapName+'">'                                 + value.drops + '</td>' +
                                               '<td data-sortby="'+value.tags+'"                                                               class="tags"                    title="Tags on '+value.mapName+'">'                                  + value.tags + '</td>' +
                                               '<td data-sortby="'+value.pops+'"                                                               class="pops"                    title="Popped on '+value.mapName+'">'                                + value.pops + '</td>' +
                                               '<td data-sortby="'+value.returns+'"                                                            class="returns"                 title="Returns on '+value.mapName+'">'                               + value.returns + '</td>' +
                                               '<td data-sortby="'+value.prevent+'"                                                            class="prevent"                 title="Prevent on '+value.mapName+'">'                               + secondsToHMS(value.prevent) + '</td>' +
                                               '<td data-sortby="'+value.support+'"                                                            class="support"                 title="Support on '+value.mapName+'">'                               + value.support + '</td>' +
                                               '<td data-sortby="'+value.powerups+'"                                                           class="powerups"                title="Powerups on '+value.mapName+'">'                              + value.powerups + '</td>' +
                                               '<td data-sortby="'+(value.captures/(value.grabs||1))+'"                                        class="capsgrab"                title="Caps/Grab on '+value.mapName+'">'                             + (value.captures/(value.grabs||1)).toFixed(3) + '</td>' +
                                               '<td data-sortby="'+(value.captures/(value.timePlayed/3600))+'"                                 class="capshour"                title="Caps/Hour on '+value.mapName+'">'                             + (value.captures/(value.timePlayed/3600)).toFixed(1) + '</td>' +
                                               '<td data-sortby="'+(value.tags/(value.pops||1))+'"                                             class="tagspop"                 title="Tags/Pop on '+value.mapName+'">'                              + (value.tags/(value.pops||1)).toFixed(3) + '</td>' +
                                               '<td data-sortby="'+(value.returns/(value.timePlayed/3600))+'"                                  class="returnshour"             title="Returns/Hour on '+value.mapName+'">'                          + (value.returns/(value.timePlayed/3600)).toFixed(1) + '</td>' +
                                               '<td data-sortby="'+(value.prevent/(value.timePlayed/3600))+'"                                  class="preventhour"             title="Prevent/Hour on '+value.mapName+'">'                          + (value.prevent/(value.timePlayed/3600)).toFixed(1) + '</td>' +
                                               '</tr>');
                    if (value.winCount) $('#map1_'+trimmedMapName).append('<span style="display:inline-block; width:'+(value.winCount/value.playedCount*100).toFixed(2)+'%; height:10px; white-space:nowrap; background:#22DD22" title="Wins: '+value.winCount+ '"></span>');
                    if (value.saveCount) $('#map1_'+trimmedMapName).append('<span style="display:inline-block; width:'+(value.saveCount/value.playedCount*100).toFixed(2)+'%; height:10px; white-space:nowrap; background:#166C16" title="Saves: '+value.saveCount+ '"></span>');
                    if (value.lossCount) $('#map1_'+trimmedMapName).append('<span style="display:inline-block; width:'+(value.lossCount/value.playedCount*100).toFixed(2)+'%; height:10px; white-space:nowrap; background:#EE2020" title="Losses: '+value.lossCount+ '"></span>');
                    if (value.tieCount) $('#map1_'+trimmedMapName).append('<span style="display:inline-block; width:'+(value.tieCount/value.playedCount*100).toFixed(2)+'%; height:10px; white-space:nowrap; background:#ff9900" title="Ties: '+value.tieCount+ '"></span>');
                    if (value.usaCount) $('#map1_'+trimmedMapName).append('<span style="display:inline-block; width:'+(value.usaCount/value.playedCount*100).toFixed(2)+'%; height:10px; white-space:nowrap; background:#157798" title="Unsuccessful Save Attempts: '+value.usaCount+ '"></span>');

                    $('#ms_pergamedata').append('<tr class="ms_datarow'+(value.playedCount < MapStats_Options.hidelowlymaps.value ? ' MapStats_Lowly' : '')+'">' +
                                                '<td data-sortby="m'+trimmedMapName+'"' + (mapPreviewID ? 'data-previewid="'+mapPreviewID+'" data-mapauthor="'+value.mapAuthor+'" class="mapPreview" ' : '') + 'style="text-align:right; ' + (!mapPreviewID ? 'text-decoration:underline dotted;" title="No Preview Available"' : '"') + '>' + value.mapName + '</td>' +
                                                '<td data-sortby="'+(value.winCount+value.saveCount)+'" style="text-align:left"><div id="map2_'+trimmedMapName+'" style="width:'+(value.playedCount/highestPlayed*100).toFixed(2)+'%; height:8px; overflow:hidden; white-space:nowrap"></div></td>' +

                                                '<td data-sortby="'+value.playedCount+'"                                                        class="playedCount"            title="'+value.mapName+' played '+value.playedCount+' times">'       + (value.playedCount/totals.playedCount*100).toFixed(2) + '% (' + value.playedCount + ')</td>' +
                                                '<td data-sortby="'+(value.timePlayed/value.playedCount)+'"                                     class="timePlayed"             title="Time Played on '+value.mapName+'">'                           + secondsToHMS(value.timePlayed/value.playedCount) + '</td>' +
                                                '<td data-sortby="'+(value.winCount+value.saveCount)/(value.playedCount-value.usaCount || 1)+'" class="winpercent"             title="Win Percentage on '+value.mapName+'">'                        + ((value.winCount+value.saveCount)/(value.playedCount-value.usaCount || 1)*100).toFixed(0) + '%</td>' +
                                                '<td data-sortby="'+(value.captures/value.playedCount)+'"                                       class="captures"               title="Caps on '+value.mapName+'">'                                  + (value.captures/value.playedCount).toFixed(2) + '</td>' +
                                                '<td data-sortby="'+(value.grabs/value.playedCount)+'"                                          class="grabs"                  title="Grabs on '+value.mapName+'">'                                 + (value.grabs/value.playedCount).toFixed(2) + '</td>' +
                                                '<td data-sortby="'+(value.hold/value.playedCount)+'"                                           class="hold"                   title="Hold on '+value.mapName+'">'                                  + secondsToHMS(value.hold/value.playedCount) + '</td>' +
                                                '<td data-sortby="'+(value.drops/value.playedCount)+'"                                          class="drops"                  title="Drops on '+value.mapName+'">'                                 + (value.drops/value.playedCount).toFixed(2) + '</td>' +
                                                '<td data-sortby="'+(value.tags/value.playedCount)+'"                                           class="tags"                   title="Tags on '+value.mapName+'">'                                  + (value.tags/value.playedCount).toFixed(2) + '</td>' +
                                                '<td data-sortby="'+(value.pops/value.playedCount)+'"                                           class="pops"                   title="Popped on '+value.mapName+'">'                                + (value.pops/value.playedCount).toFixed(2) + '</td>' +
                                                '<td data-sortby="'+(value.returns/value.playedCount)+'"                                        class="returns"                title="Returns on '+value.mapName+'">'                               + (value.returns/value.playedCount).toFixed(2) + '</td>' +
                                                '<td data-sortby="'+(value.prevent/value.playedCount)+'"                                        class="prevent"                title="Prevent on '+value.mapName+'">'                               + secondsToHMS(value.prevent/value.playedCount) + '</td>' +
                                                '<td data-sortby="'+(value.support/value.playedCount)+'"                                        class="support"                title="Support on '+value.mapName+'">'                               + (value.support/value.playedCount).toFixed(2) + '</td>' +
                                                '<td data-sortby="'+(value.powerups/value.playedCount)+'"                                       class="powerups"               title="Powerups on '+value.mapName+'">'                              + (value.powerups/value.playedCount).toFixed(2) + '</td>' +
                                                '<td data-sortby="'+(value.captures/(value.grabs||1))+'"                                        class="capsgrab"               title="Caps/Grab on '+value.mapName+'">'                             + (value.captures/(value.grabs||1)).toFixed(3) + '</td>' +
                                                '<td data-sortby="'+(value.captures/(value.timePlayed/3600))+'"                                 class="capshour"               title="Caps/Hour on '+value.mapName+'">'                             + (value.captures/(value.timePlayed/3600)).toFixed(1) + '</td>' +
                                                '<td data-sortby="'+(value.tags/(value.pops||1))+'"                                             class="tagspop"                title="Tags/Pop on '+value.mapName+'">'                              + (value.tags/(value.pops||1)).toFixed(3) + '</td>' +
                                                '<td data-sortby="'+(value.returns/(value.timePlayed/3600))+'"                                  class="returnshour"            title="Returns/Hour on '+value.mapName+'">'                          + (value.returns/(value.timePlayed/3600)).toFixed(1) + '</td>' +
                                                '<td data-sortby="'+(value.prevent/(value.timePlayed/3600))+'"                                  class="preventhour"            title="Prevent/Hour on '+value.mapName+'">'                          + (value.prevent/(value.timePlayed/3600)).toFixed(1) + '</td>' +
                                                '</tr>');
                    if (value.winCount) $('#map2_'+trimmedMapName).append('<span style="display:inline-block; width:'+(value.winCount/value.playedCount*100).toFixed(2)+'%; height:10px; white-space:nowrap; background:#22DD22" title="Wins: '+value.winCount+ '"></span>');
                    if (value.saveCount) $('#map2_'+trimmedMapName).append('<span style="display:inline-block; width:'+(value.saveCount/value.playedCount*100).toFixed(2)+'%; height:10px; white-space:nowrap; background:#166C16" title="Saves: '+value.saveCount+ '"></span>');
                    if (value.lossCount) $('#map2_'+trimmedMapName).append('<span style="display:inline-block; width:'+(value.lossCount/value.playedCount*100).toFixed(2)+'%; height:10px; white-space:nowrap; background:#EE2020" title="Losses: '+value.lossCount+ '"></span>');
                    if (value.tieCount) $('#map2_'+trimmedMapName).append('<span style="display:inline-block; width:'+(value.tieCount/value.playedCount*100).toFixed(2)+'%; height:10px; white-space:nowrap; background:#ff9900" title="Ties: '+value.tieCount+ '"></span>');
                    if (value.usaCount) $('#map2_'+trimmedMapName).append('<span style="display:inline-block; width:'+(value.usaCount/value.playedCount*100).toFixed(2)+'%; height:10px; white-space:nowrap; background:#157798" title="Unsuccessful Save Attempts: '+value.usaCount+ '"></span>');
                }
            });
            GM_addStyle("#MF_Maps td { text-align:center; cursor:default; padding:1px 1px 0 1px }");
            GM_addStyle("#MF_Maps th:hover { text-decoration:underline }");
            GM_addStyle("#MF_Maps tr.ms_datarow:hover { color:#0bb }");
            GM_addStyle("#MF_Maps td:hover { color:#b0b }");
            GM_addStyle("tr.ms_datarow { text-shadow:1px 1px 1px #000 }");


            function highlightMaximums() {
                $('#MF_Maps .MF_Max').removeClass('MF_Max');
                var prevMax;
                for (var i=3; i<=20; i++) {
                    prevMax = 0;
                    if (GM_getValue('PerGameStats', false) === false) {
                        $('#ms_normaldata tr:gt(0) td:nth-child('+i+')').each(function () {
                            if ( $(this).is(':visible') && ($(this).data('sortby') > prevMax) ) {
                                $('#ms_normaldata').find('tr:gt(0) td:nth-child('+i+')').removeClass('MF_Max');
                                $(this).addClass('MF_Max');
                                prevMax = $(this).data('sortby');
                            }
                        });
                    } else {
                        $('#ms_pergamedata tr:gt(0) td:nth-child('+i+')').each(function () {
                            if ( $(this).is(':visible') && ($(this).data('sortby') > prevMax) ) {
                                $('#ms_pergamedata').find('tr:gt(0) td:nth-child('+i+')').removeClass('MF_Max');
                                $(this).addClass('MF_Max');
                                prevMax = $(this).data('sortby');
                            }
                        });
                    }
                }
            }

            GM_addStyle(".MF_Max { color:#ca0 }");

            //---------------------------------------------
            //Build the menu and perform some saved options...
            $.each(MapStats_Options, function(key, value) {
                if (key === 'hidelowlymaps') {
                    $('#MapStats_Options_Menu').append('<li style="list-style:none"><input type="checkbox" checked disabled><span>Hide Below:</span><input type="range" id="MapStats_HideLowly" min="0" max="' + highestPlayed + '" value="' + MapStats_Options.hidelowlymaps.value + '" style="width:100px" title="Hide Below # Games"> <span id="MapStats_HideLowly_Value">' + MapStats_Options.hidelowlymaps.value + '</span> Games</li>');
                    if (value.value === true) {
                        $('.MapStats_Lowly').hide(0);
                        $('#mapstats_totals_normal').find('td').eq(0).text(($('.MapStats_Lowly').length / 2) + ' ('+mapFreqSorted.length+')');
                        $('#mapstats_totals_pergame').find('td').eq(0).text(($('.MapStats_Lowly').length / 2) + ' ('+mapFreqSorted.length+')');
                    }
                } else {
                    $('#MapStats_Options_Menu').append('<li style="list-style:none"><label><input type="checkbox" id="' + key + '" ' + (value.value === true ? 'checked' : '') + '>' + value.display + '</label></li>');
                    if (key === 'widescreen') {
                        if (value.value === true) {
                            $('#R300_WinNextHeader').css('position','absolute'); //if this is present it needs to be absolute
                            $('body').css('display', 'flex');
                            $('body').css('flex-wrap','wrap');
                            $('body').css('justify-content','center');
                            $('body').css('align-items','flex-start');
                            MapFreq_Div = $('#MapFreq');
                            $('#MapFreq').detach();
                            $('body').append(MapFreq_Div);
                        }
                    } else if (key === 'showborder') {
                        if (value.value === false) {
                            $('#MapFreq').css('box-shadow', 'none');
                        }
                    } else {
                        if (value.value === false) {
                            $('.'+key+'').hide(0);
                        }
                    }
                }
            });
            $('#MapStats_Options_Menu').append('<div style="position:absolute; bottom:2px; right:5px; text-align:right"><a href="https://gist.github.com/nabbynz/cf44259aded7b4c32df0" target="_blank" style="font-size:11px; color:#888" title="Version: ' + GM_info.script.version + '. Click to manually check for updates (script will auto-update if enabled)...">v' + GM_info.script.version + '</a</div>');


            //---------------------------------------------
            //Bind Events...
            $('#MapStats_HideLowly').on('input', function() {
                $('#MapStats_HideLowly_Value').text(this.value);
            });
            $('#MapStats_HideLowly').on('change', function() {
                MapStats_Options.hidelowlymaps.value = this.value;
                GM_setValue('MapStats_Options', MapStats_Options);

                if (this.value === '0') { //show all
                    $('#MF_Maps .MapStats_Lowly').fadeIn(400);
                    $('#MF_Maps .MapStats_Lowly').removeClass('MapStats_Lowly');
                } else {
                    $('#MF_Maps .MapStats_Lowly').removeClass('MapStats_Lowly');
                    $.each($('#ms_normaldata > tr:gt(0)'), function() {
                        if ($(this).find('td').eq(2).data('sortby') < MapStats_Options.hidelowlymaps.value) {
                            $(this).addClass('MapStats_Lowly');
                            $(this).hide(0);
                        } else {
                            $(this).show(0);
                        }
                    });
                    $.each($('#ms_pergamedata > tr:gt(0)'), function() {
                        if ($(this).find('td').eq(2).data('sortby') < MapStats_Options.hidelowlymaps.value) {
                            $(this).addClass('MapStats_Lowly');
                            $(this).hide(0);
                        } else {
                            $(this).show(0);
                        }
                    });
                }

                if (MapStats_Options.highlightmaxs.value) {
                    highlightMaximums();
                }
            });

            $('#MapStats_Pause').on('click', function() {
                if (GM_getValue('MapStats_Pause') === 'paused') {
                    GM_setValue('MapStats_Pause', '');
                    $('#MapStats_Pause').html('ll');
                    $('#MapStats_Pause').attr('title', 'MapStats is Currently Saving - Press to Pause...');
                } else {
                    GM_setValue('MapStats_Pause', 'paused');
                    $('#MapStats_Pause').html('&nbsp;PAUSED&nbsp;');
                    $('#MapStats_Pause').attr('title', 'MapStats is Currently Paused - Press to Resume...');
                }
            });

            $('#ms_pergame').on('click', function() {
                if ($(this).is(':checked')) {
                    GM_setValue('PerGameStats', true);
                    $('#ms_normaldata').hide(0);
                    $('#ms_pergamedata').show(0);
                } else {
                    GM_setValue('PerGameStats', false);
                    $('#ms_normaldata').show(0);
                    $('#ms_pergamedata').hide(0);
                }
                $('#MF_Maps th:eq('+GM_getValue('MapStats_SortBy', 1)+')').trigger('click', true);
                highlightMaximums();
            });

            $('#MapStats_Options_Button').on('click', function() {
                $('#MapStats_Options_Menu').slideToggle(400);
            });
            $("#MapStats_Options_Menu").mouseleave(function() {
                $('#MapStats_Options_Menu').fadeOut(100);
            });

            $('#MapStats_Options_Menu input[type=checkbox]').on('click', function() {
                MapStats_Options[$(this).attr('id')].value = $(this).is(':checked');
                GM_setValue('MapStats_Options', MapStats_Options);
                if ($(this).attr('id') === 'widescreen') {
                    if ($(this).is(':checked')) {
                        $('body').css('display', 'flex');
                        $('body').css('flex-wrap','wrap');
                        $('body').css('justify-content','center');
                        $('body').css('align-items','flex-start');
                        MapFreq_Div = $('#MapFreq');
                        $('#MapFreq').detach();
                        $('body').append(MapFreq_Div);
                    } else {
                        $('body').css('display', 'block');
                        $('body').css('flex-wrap','');
                        $('body').css('justify-content','');
                        $('body').css('align-items','');
                        MapFreq_Div = $('#MapFreq');
                        $('#MapFreq').detach();
                        $('#play').parent().next().after(MapFreq_Div);
                    }
                } else if ($(this).attr('id') === 'hidelowlymaps') {
                    if ($(this).is(':checked')) {
                        $('.lowly').hide(0);
                        $('#mapstats_totals_normal').find('td').eq(0).text(($('.lowly').length / 2) + ' ('+mapFreqSorted.length+')');
                        $('#mapstats_totals_pergame').find('td').eq(0).text(($('.lowly').length / 2) + ' ('+mapFreqSorted.length+')');
                    } else {
                        $('.lowly').show(0);
                        $('#mapstats_totals_normal').find('td').eq(0).text(mapFreqSorted.length);
                        $('#mapstats_totals_pergame').find('td').eq(0).text(mapFreqSorted.length);
                    }
                } else if ($(this).attr('id') === 'showborder') {
                    if ($(this).is(':checked')) {
                        $('#MapFreq').css('box-shadow', '#fff 0px 0px 10px');
                    } else {
                        $('#MapFreq').css('box-shadow', 'none');
                    }
                } else if ($(this).attr('id') === 'highlightmaxs') {
                    if ($(this).is(':checked')) {
                        highlightMaximums();
                    } else {
                        $('#MF_Maps .MF_Max').removeClass('MF_Max');
                    }
                } else {
                    if ($(this).is(':checked')) {
                        $('.'+$(this).attr('id')).fadeIn(300);
                    } else {
                        $('.'+$(this).attr('id')).fadeOut(800);
                    }
                }
            });

            $('.mapPreview').on('click', function() {
                if ($(this).data('previewid')) {
                    var mapPreviewURL = "http://unfortunate-maps.jukejuice.com/static/previews/" + $(this).data('previewid') + ".png";
                    if ( ($('#mapPreviewWindow').is(':visible')) && ($('#mapPreviewWindow').data('previewid') === $(this).data('previewid')) ) {
                        $('#mapPreviewWindow').remove();
                    } else {
                        $('#mapPreviewWindow').remove();
                        $(this).next('td').prepend('<div id="mapPreviewWindow" data-previewid="'+$(this).data('previewid')+'" style="display:none; position:absolute; margin-top:10px; border:2px solid #b0b; border-radius:5px; text-shadow:1px 2px 1px #000; width:671px; height:400px; z-index:1000"><div style="margin-top:5px; color:#fff">'+$(this).text()+' by '+$(this).data('mapauthor')+'</div></div>');
                        $('.mapPreview').css('color', '#fff');
                        $(this).css('color', '#b0b');
                        $('#mapPreviewWindow').css('background', '#000 url(\''+mapPreviewURL+'\')');
                        $('#mapPreviewWindow').css('background-size', 'contain');
                        $('#mapPreviewWindow').css('background-repeat', 'no-repeat');
                        $('#mapPreviewWindow').css('background-position', 'center');
                        $('#mapPreviewWindow').fadeIn(400);
                    }
                }
            });
            $('#MF_Maps').on('click', 'div', function() {
                $('#mapPreviewWindow').remove();
                $('.mapPreview').css('color', '#fff');
            });
            $('.mapPreview').hover(function() {
                if ($(this).data('previewid')) {
                    $(this).css('color', '#b0b');
                } else {
                    //$(this).css('color', '#fff');
                }
            }, function() {
                if ( ($('#mapPreviewWindow').is(':visible')) && ($('#mapPreviewWindow').data('previewid') === $(this).data('previewid')) ) {
                    if ($(this).data('previewid')) $(this).css('color', '#b0b');
                } else {
                    if ($(this).data('previewid')) $(this).css('color', '#fff');
                }
            });

            $('#MF_Maps th').click(function(e, preventReverse) {
                GM_setValue('MapStats_SortBy', $(this).index()); //save the header we're sorting by
                $('#MF_Maps th').css('color', '#000');
                $(this).css('color', '#b0b');
                var tbody = $('#ms_pergame').is(':checked') ? 'ms_pergamedata' : 'ms_normaldata';
                var table = $('#'+tbody);
                var rows = table.find('tr:gt(0)').toArray().sort(comparer($(this).index()));
                if (!preventReverse) {
                    this.asc = !this.asc;
                    if (!this.asc) rows = rows.reverse();
                }
                for (var i = 0; i < rows.length; i++) { table.append(rows[i]); }
            });

            $('#MapStats_HideShowButton').on('click', function() {
                GM_setValue('HideShowButton', !$('#MF_Maps').is(':visible'));
                $('#MF_Maps').fadeToggle(400);
                $('#MapStats_Options_Button').fadeToggle(400);
                $('#ms_pergame_label').fadeToggle(400);
            });


            //---------------------------------------------
            //set some options...
            if (GM_getValue('MapStats_Pause') === 'paused') {
                $('#MapStats_Pause').html('&nbsp;PAUSED&nbsp;');
                $('#MapStats_Pause').attr('title', 'MapStats is Currently Paused - Press to Resume...');
            } else {
                $('#MapStats_Pause').html('ll');
                $('#MapStats_Pause').attr('title', 'MapStats is Currently Saving - Press to Pause...');
            }

            if (GM_getValue('HideShowButton')) {
                $('#MF_Maps').show(0);
                $('#MapStats_Options_Button').show(0);
                $('#ms_pergame_label').show(0);
            } else {
                $('#MF_Maps').hide(0);
                $('#MapStats_Options_Button').hide(0);
                $('#ms_pergame_label').hide(0);
            }

            if (GM_getValue('PerGameStats') === true) {
                $('#ms_normaldata').hide(0);
                $('#ms_pergamedata').show(0);
            } else {
                $('#ms_normaldata').show(0);
                $('#ms_pergamedata').hide(0);
            }

            $('.MapStats_Lowly').hide(0);
            $('#mapstats_totals_normal').find('td').eq(0).text(($('.MapStats_Lowly').length / 2) + ' ('+mapFreqSorted.length+')');
            $('#mapstats_totals_pergame').find('td').eq(0).text(($('.MapStats_Lowly').length / 2) + ' ('+mapFreqSorted.length+')');

            if (MapStats_Options.highlightmaxs.value) {
                setTimeout(highlightMaximums, 1000);
            }

            //sort the table by last saved...
            $('#MF_Maps th:eq('+GM_getValue('MapStats_SortBy', 1)+')').trigger('click');

        } else {
            $('#MapFreq').append('<div>No Data for Map Frequency Table</div>');
        }
    }


    if (PageLoc === 'ingame') {
        var joinTime;
        var mapName = '';
        var mapAuthor = '';
        var result=0;
        var saveAttempt = false;
        var groupPause = false;

        tagpro.socket.on('time', function(message) {
            if (tagpro.state == 3) { //before the actual start
                joinTime = new Date().getTime();
            } else if (tagpro.state == 1) { //game has started
                if (joinTime) {
                    joinTime = Date.parse(tagpro.gameEndsAt) - 12 * 60 * 1000; //time game started (end - 12 mins)
                } else {
                    joinTime = new Date().getTime(); //time we joined (mid-game)
                }
            }
        });

        tagpro.socket.on('map', function(data) {
            mapName = data.info.name;
            mapAuthor = data.info.author;

            if ((tagpro.group.socket) && (tagpro.group.socket.connected)) {
                groupPause = true;
                $('#MapStats_Pause').html('&nbsp;PAUSED (GROUP)&nbsp;');
                $('#MapStats_Pause').attr('title', 'MapStats is Currently Paused (this game won\'t be saved)');
            } else if (GM_getValue('MapStats_Pause') === 'paused') {
                $('#MapStats_Pause').html('&nbsp;PAUSED&nbsp;');
                $('#MapStats_Pause').attr('title', 'MapStats is Currently Paused (this game won\'t be saved)');
            } else {
                $('#MapStats_Pause').html('ll');
                $('#MapStats_Pause').attr('title', 'MapStats is Currently Saving - Press to Pause...');
            }

            //add header...
            if (MapStats_Options.showheader.value) {
                if ($('#R300_WinNextHeader').length) {
                    $('#R300_WinNextHeader').append('<div id="MapStats_Header" style="font-size:11px; font-style:italic"></div>');
                } else {
                    $('body').prepend('<div id="MapStats_Header" style="margin:1px auto; font-size:12px; font-weight:bold; font-style:italic; color:#fff; text-align:center; text-shadow:1px 2px 1px #222; clear:both"></div>');
                }

                if (mapFreq.hasOwnProperty(mapName)) {
                    var winpercentage = (mapFreq[mapName].winCount+mapFreq[mapName].saveCount)/(mapFreq[mapName].playedCount-mapFreq[mapName].usaCount)*100;
                    var totalPlayedCount = 0;
                    $.each(mapFreq, function(key, value) {
                        totalPlayedCount += value.playedCount;
                    });
                    $('#MapStats_Header').append('<span style="color:#bbb">Win % on ' + mapName + ': ' + winpercentage.toFixed(2) + '%</span> | ' +
                                                 '<span style="color:#999">Average Game Lasts: ' + secondsToHMS(mapFreq[mapName].timePlayed/mapFreq[mapName].playedCount) + '</span> | ' +
                                                 '<span style="color:#bbb">Played %: ' + (mapFreq[mapName].playedCount / totalPlayedCount * 100).toFixed(2) + '% (' + mapFreq[mapName].playedCount + ' times)</span>' +
                                                 '<span id="MapStats_Pause" style="display:inline-block; margin-left:5px; font-size:9px; font-style:normal; text-align:center; height:9px; min-width:11px; border:2px solid #ed590c; border-radius:7px; cursor:pointer"></span>');
                } else {
                    $('#MapStats_Header').append('<span style="color:#bbb">Win % on ' + mapName + ': N/A (not played previously)</span>' +
                                                 '<span id="MapStats_Pause" style="display:inline-block; margin-left:5px; font-size:9px; font-style:normal; text-align:center; height:9px; min-width:11px; border:2px solid #ed590c; border-radius:7px; cursor:pointer"></span>');
                }

                //---------------------------------------------
                //set the default options...
                if ((GM_getValue('MapStats_Pause') === 'paused') || groupPause) {
                    $('#MapStats_Pause').html('&nbsp;PAUSED&nbsp;');
                    $('#MapStats_Pause').attr('title', 'MapStats is Currently Paused - Press to Resume...');
                } else {
                    $('#MapStats_Pause').html('ll');
                    $('#MapStats_Pause').attr('title', 'MapStats is Currently Saving - Press to Pause...');
                }

                $('#MapStats_Pause').on('click', function() {
                    if ((GM_getValue('MapStats_Pause') === 'paused') || groupPause) {
                        GM_setValue('MapStats_Pause', '');
                        groupPause = false;
                        $('#MapStats_Pause').html('ll');
                        $('#MapStats_Pause').attr('title', 'MapStats is Currently Saving - Press to Pause...');
                    } else {
                        GM_setValue('MapStats_Pause', 'paused');
                        $('#MapStats_Pause').html('&nbsp;PAUSED&nbsp;');
                        $('#MapStats_Pause').attr('title', 'MapStats is Currently Paused (this game won\'t be saved)');
                    }
                });
            }
        });

        tagpro.socket.on('chat', function(data) {
            if (data.from === null) { //system message
                if (data.message.indexOf('This is a save attempt!') >= 0) {
                    saveAttempt = true;
                }
            }
        });

        tagpro.socket.on('end', function(data) {
            $('#MapStats_Pause').hide(0);

            if ((!tagpro.spectator) && (GM_getValue('MapStats_Pause') !== 'paused') && !groupPause) {
                var pups = {};
                var endTime = (new Date).getTime();
                if ( joinTime+30000 < endTime ) { //check we didn't join in the last 30 seconds of the game
                    if (data.winner == 'tie') {
                        result = 5; //tie
                    } else if ( ((data.winner == 'red') && (tagpro.players[tagpro.playerId].team == 1)) || ((data.winner == 'blue') && (tagpro.players[tagpro.playerId].team == 2)) ) {
                        if (!saveAttempt) {
                            result = 1; //win
                        } else {
                            result = 11; //successful save attempt
                        }
                    } else if ( ((data.winner == 'red') && (tagpro.players[tagpro.playerId].team == 2)) || ((data.winner == 'blue') && (tagpro.players[tagpro.playerId].team == 1)) ) {
                        if (!saveAttempt) {
                            result = 2; //loss
                        } else {
                            result = 4; //unsuccessful save attempt
                        }
                    } else { //probably an event, which we won't record...
                        return false;
                    }

                    pups.tags = tagpro.players[tagpro.playerId]["s-tags"];
                    pups.pops = tagpro.players[tagpro.playerId]["s-pops"];
                    pups.grabs = tagpro.players[tagpro.playerId]["s-grabs"];
                    pups.drops = tagpro.players[tagpro.playerId]["s-drops"];
                    pups.hold = tagpro.players[tagpro.playerId]["s-hold"];
                    pups.captures = tagpro.players[tagpro.playerId]["s-captures"];
                    pups.prevent = tagpro.players[tagpro.playerId]["s-prevent"];
                    pups.returns = tagpro.players[tagpro.playerId]["s-returns"];
                    pups.support = tagpro.players[tagpro.playerId]["s-support"];
                    pups.powerups = tagpro.players[tagpro.playerId]["s-powerups"];
                    pups.timePlayed = (endTime-joinTime)/1000;

                    saveMapData(mapName, result, pups, mapAuthor);
                }
            }
        });
    }

}); //tagpro.ready
