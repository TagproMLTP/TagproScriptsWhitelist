// ==UserScript==
// @name            Map Stats
// @description     Shows frequency & stats for maps you play.
// @version         1.3.0
// @include         http://tagpro-*.koalabeast.com*
// @include         http://*.newcompte.fr*
// @exclude         http://tagpro-maptest*.koalabeast.com*
// @updateURL       https://github.com/TagproMLTP/TagproScriptsWhitelist/blob/master/Scripts/Modifiable/FKU/fxuMapStats.user.js
// @downloadURL     https://gist.github.com/nabbynz/cf44259aded7b4c32df0/raw/TagPro_MapStats.user.js
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_deleteValue
// @grant           GM_addStyle
// @run-at          document-end
// @license         GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author          nabby
// ==/UserScript==

console.log('START: ' + GM_info.script.name + ' (v' + GM_info.script.version + ' by ' + GM_info.script.author + ')');

var options = {
    'showtotals':         { display:'Show Totals',                            value:true,    },
    'showheader':         { display:'Show Header (in game)',                  value:true,    },
    'MinimumGameTime':    { display:'Minimum Game Time Needed To Save Data',  value:10,      }, 
    'hidelowlymaps':      { display:'Hide Lowly Played Maps?',                value:true,    }, 
    'highlightmaxs':      { display:'Highlight Max Values?',                  value:true,    },
    'showborder':         { display:'Show Border?',                           value:true,    },
    'widescreen':         { display:'Attempt Widescreen Position',            value:false,   },
    //Columns...
    'timePlayed':         { display:'Time Played',                            value:true,    },
    'winpercent':         { display:'Win %',                                  value:true,    },
    'captures':           { display:'Captures',                               value:true,    },
    'grabs':              { display:'Grabs',                                  value:true,    },
    'hold':               { display:'Hold',                                   value:true,    },
    'drops':              { display:'Drops',                                  value:true,    },
    'tags':               { display:'Tags',                                   value:true,    },
    'pops':               { display:'Pops',                                   value:true,    },
    'returns':            { display:'Returns',                                value:true,    },
    'prevent':            { display:'Prevent',                                value:true,    },
    'support':            { display:'Support',                                value:true,    },
    'powerups':           { display:'Powerups',                               value:true,    },
    'capsgrab':           { display:'Caps/Grab',                              value:false,   },
    'tagspop':            { display:'Tags/Pop',                               value:false,   },
    'capshour':           { display:'Caps/Hour',                              value:true,    },
    'returnshour':        { display:'Returns/Hour',                           value:true,    },
    'preventhour':        { display:'Prevent/Hour',                           value:false,   },
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

function saveMapData(mapName, result, pups, mapAuthor, mapType) {
    if (mapAuthor === undefined) mapAuthor = '';
    if (mapType === undefined) mapType = '';
    
    if (mapFreq.hasOwnProperty(mapName)) { //map already exists
        mapFreq[mapName].playedCount++;
        if ((mapFreq[mapName].mapAuthor === '') || (!mapFreq[mapName].mapAuthor)) mapFreq[mapName].mapAuthor = mapAuthor;
        if ((mapFreq[mapName].mapType === '') || (!mapFreq[mapName].mapType)) mapFreq[mapName].mapType = mapType;
    } else { //first time
        mapFreq[mapName] = { mapAuthor:mapAuthor, mapType:mapType, playedCount:1, winCount:0, lossCount:0, saveCount:0, usaCount:0, tieCount:0, tags:0, pops:0, grabs:0, drops:0, hold:0, captures:0, prevent:0, returns:0, support:0, powerups:0, timePlayed:0 };
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
        if (mapFreq.hasOwnProperty('Wormy')) {
            if (!mapFreq.Wormy.hasOwnProperty('mapType')) {
                convertToNFCTF();
            }
        }
    }

    //convertToNFCTF(); //uncomment to add NF/CTF to current map data
    
    function convertToNFCTF() {
        $.each(mapFreq, function(key, value) {
            mapFreq[key].mapType = 'CTF';
        });
        if (mapFreq.hasOwnProperty('Ricochet')) mapFreq.Ricochet.mapType = 'NF';
        if (mapFreq.hasOwnProperty('Cloud')) mapFreq.Cloud.mapType = 'NF';
        if (mapFreq.hasOwnProperty('Kite')) mapFreq.Kite.mapType = 'NF';
        if (mapFreq.hasOwnProperty('Bulldog')) mapFreq.Bulldog.mapType = 'NF';
        if (mapFreq.hasOwnProperty('Shine')) mapFreq.Shine.mapType = 'NF';
        if (mapFreq.hasOwnProperty('Volt')) mapFreq.Volt.mapType = 'NF';
        if (mapFreq.hasOwnProperty('Rocketballs')) mapFreq.Rocketballs.mapType = 'NF';
        if (mapFreq.hasOwnProperty('Wombo Combo')) mapFreq['Wombo Combo'].mapType = 'NF';
        if (mapFreq.hasOwnProperty('Command Center')) mapFreq['Command Center'].mapType = 'NF';
        if (mapFreq.hasOwnProperty('Center Flag')) mapFreq['Center Flag'].mapType = 'NF';
        
        GM_setValue('mapFreq', mapFreq);
    }

    MapStats_Options = $.extend(true, {}, options, GM_getValue('MapStats_Options', options));
    $.each(MapStats_Options, function(key, value) {
        if ( (MapStats_Options.hasOwnProperty(key)) && (options.hasOwnProperty(key)) ) {
            MapStats_Options[key].display = options[key].display;
        } else if (MapStats_Options.hasOwnProperty(key)) { //something has been removed from the default options, so best we remove it from our saved options too...
            delete MapStats_Options[key];
            GM_setValue('MapStats_Options', MapStats_Options);
        }
    });
    if (GM_getValue('MapStats_Options') === undefined) { //first time
        GM_setValue('MapStats_Options', MapStats_Options);
    }

    if ((PageLoc === 'server')) { //show on server home page
        var MapFreq_Div = '<div id="MapFreq" style="position:relative; margin:20px auto 0 auto; padding:10px 0; width:-webkit-fit-content; font-size:12px; color:#fff; text-align:center; border-radius:8px;' + (MapStats_Options.showborder.value ? ' box-shadow:#fff 0px 0px 10px;' : '') + ' background:rgba(0,0,0,0.1); white-space:nowrap;"></div>';
        var MapFreq_Header = '<div id="MapStats_Pause" style="position:absolute; left:10px; display:inline-block; font-size:10px; text-align:center; margin-top:0px; height:11px; min-width:12px; border:2px solid #ed590c; border-radius:8px; cursor:pointer"></div>' +
            '<div id="MapStats_HideShowButton" style="display:inline-block; font-size:12px; text-align:center; margin-right:10px; height:14px; width:14px; background:#fff; color:#000; border-radius:3px; cursor:pointer" title="Hide/Show">&#8597;</div>Map Stats' +
            '<div id="MapStats_Options_Button" style="display:inline-block; font-size:11px; text-align:center; margin-left:10px; height:13px; width:14px; border:2px solid #808; border-radius:8px; cursor:pointer" title="Column Chooser">&#8286;</div>' +
            '<div style="position:absolute; display:inline-block; right:10px; margin-top:-3px; float:right;">' +
            '<label' + (GM_getValue('AllNFCTF', 'ms_ANC_All') === 'ms_ANC_All' ? ' style="color:#0a0"' : '') + '><input id="ms_ANC_All" type="radio" name="ms_AllNFCTF"' + (GM_getValue('AllNFCTF', 'ms_ANC_All') === 'ms_ANC_All' ? ' checked' : '') + '>All</label> ' +
            '<label' + (GM_getValue('AllNFCTF', false) === 'ms_ANC_NF' ? ' style="color:#0a0"' : '') + '><input id="ms_ANC_NF" type="radio" name="ms_AllNFCTF"' + (GM_getValue('AllNFCTF', false) === 'ms_ANC_NF' ? ' checked' : '') + '>NF</label>' +
            '<label' + (GM_getValue('AllNFCTF', false) === 'ms_ANC_CTF' ? ' style="color:#0a0"' : '') + '><input id="ms_ANC_CTF" type="radio" name="ms_AllNFCTF"' + (GM_getValue('AllNFCTF', false) === 'ms_ANC_CTF' ? ' checked' : '') + '>CTF</label>' +
            '<label id="ms_pergame_label" style="margin-left:15px"><input id="ms_pergame" type="checkbox" ' + (GM_getValue('PerGameStats') ? 'checked' : '') + '>Averages</label>' +
            '</div>';
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
                         "Graphite"               : 17754,
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
                         "Saigon"                 : 17656,
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
                         "Tombolo"                : 17622,
                         "Transilio"              : 9015,
                         "Ultradrive"             : 6008,
                         "Vee"                    : 365,
                         "Velocity"               : 4923,
                         "Volt"                   : 4918,
                         "Whirlwind 2"            : 898,
                         "Wombo Combo"            : 10135,
                         "Wormy"                  : 1167,
                        };

        var totals = { playedCount:0, winCount:0, lossCount:0, saveCount:0, usaCount:0, tieCount:0 };
        
        $.each(mapFreq, function(key, value) {
            mapFreqSorted.push( { mapName:key, mapAuthor:value.mapAuthor||'', mapType:value.mapType||'', playedCount:value.playedCount||0, winCount:value.winCount||0, lossCount:value.lossCount||0, saveCount:value.saveCount||0, usaCount:value.usaCount||0, tieCount:value.tieCount||0, tags:value.tags||0, pops:value.pops||0, grabs:value.grabs||0, drops:value.drops||0, hold:value.hold||0, captures:value.captures||0, prevent:value.prevent||0, returns:value.returns||0, support:value.support||0, powerups:value.powerups||0, timePlayed:value.timePlayed||0 } ); //
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
            $('#MapStats_Options_Button').after('<div id="MapStats_Options_Menu" style="display:none; position:absolute; width:300px; margin:-25px 0 0 90px; padding:10px 10px 15px; font-size:11px; text-align:left; background:linear-gradient(rebeccapurple, #111); opacity:0.95; border-radius:8px; box-shadow:0px 0px 8px #fff; z-index:6000"></div>');
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
                                 '<th class="prevent"      title="Sort by Prevent">Pr</th>' +
                                 '<th class="support"      title="Sort by Support">S</th>' +
                                 '<th class="powerups"     title="Sort by Powerups">P</th>' +
                                 '<th class="capsgrab"     title="Sort by Caps/Grab">CG</th>' +
                                 '<th class="tagspop"      title="Sort by Tags/Pop">TP</th>' +
                                 '<th class="capshour"     title="Sort by Caps/Hour">CH</th>' +
                                 '<th class="returnshour"  title="Sort by Returns/Hour">RH</th>' +
                                 '<th class="preventhour"  title="Sort by Prevent/Hour">PH</th>' +
                                 '</tr></thead><tbody id="ms_normaldata"></tbody><tbody id="ms_pergamedata"></tbody></table>'); //we're using 2x tbody's as that is much faster for hide/show'ing the averages
            GM_addStyle("#MF_Maps th { text-align:center; background:#fff; color:#000; cursor:pointer; }");


            //---------------------------------------------
            //Totals Row (x2)...
            $('#ms_normaldata').append('<tr id="mapstats_totals_normal" class="showtotals">' + 
                                       '<td></td>' +
                                       '<td></td>' + 
                                       '<td></td>' +
                                       '<td class="timePlayed"></td>' + 
                                       '<td class="winpercent"></td>' + 
                                       '<td class="captures"></td>' + 
                                       '<td class="grabs"></td>' + 
                                       '<td class="hold"></td>' + 
                                       '<td class="drops"></td>' + 
                                       '<td class="tags"></td>' + 
                                       '<td class="pops"></td>' + 
                                       '<td class="returns"></td>' + 
                                       '<td class="prevent"></td>' + 
                                       '<td class="support"></td>' + 
                                       '<td class="powerups"></td>' + 
                                       '<td class="capsgrab"></td>' + 
                                       '<td class="tagspop"></td>' + 
                                       '<td class="capshour"></td>' + 
                                       '<td class="returnshour"></td>' + 
                                       '<td class="preventhour"></td>' + 
                                       '</tr>');

            $('#ms_pergamedata').append('<tr id="mapstats_totals_pergame" class="showtotals">' + 
                                        '<td></td>' +
                                        '<td></td>' + 
                                        '<td></td>' +
                                        '<td class="timePlayed"></td>' + 
                                        '<td class="winpercent"></td>' + 
                                        '<td class="captures"></td>' + 
                                        '<td class="grabs"></td>' + 
                                        '<td class="hold"></td>' +  
                                        '<td class="drops"></td>' + 
                                        '<td class="tags"></td>' + 
                                        '<td class="pops"></td>' + 
                                        '<td class="returns"></td>' + 
                                        '<td class="prevent"></td>' + 
                                        '<td class="support"></td>' + 
                                        '<td class="powerups"></td>' + 
                                        '<td class="capsgrab"></td>' + 
                                        '<td class="tagspop"></td>' + 
                                        '<td class="capshour"></td>' + 
                                        '<td class="returnshour"></td>' + 
                                        '<td class="preventhour"></td>' + 
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
                    $('#ms_normaldata').append('<tr class="ms_datarow'+(value.playedCount < MapStats_Options.hidelowlymaps.value ? ' MapStats_Lowly' : '')+(value.mapType ? ' MapStats_MapType_'+value.mapType : '')+'">' + 
                                               '<td data-sortby="m'+trimmedMapName+'"' + (mapPreviewID ? 'data-previewid="'+mapPreviewID+'" data-mapauthor="'+value.mapAuthor+'" class="mapPreview" ' : '') + 'style="text-align:right; ' + (!mapPreviewID ? 'text-decoration:underline dotted;" title="No Preview Available"' : '"') + '>' + value.mapName + '</td>' + 
                                               '<td data-sortby="'+(value.winCount+value.saveCount)+'" data-wincount="'+value.winCount+'" data-losscount="'+value.lossCount+'" data-tiecount="'+value.tieCount+'" data-savecount="'+value.saveCount+'" data-usacount="'+value.usaCount+'" style="text-align:left"><div id="map1_'+trimmedMapName+'" style="width:'+(value.playedCount/highestPlayed*100).toFixed(2)+'%; height:8px; overflow:hidden; white-space:nowrap"></div></td>' + 
                                               
                                               '<td data-sortby="'+value.playedCount+'"                                                        class="playedCount"             title="'+value.mapName+' played '+value.playedCount+' times">'             + (value.playedCount/totals.playedCount*100).toFixed(2) + '% (' + value.playedCount + ')</td>' + 
                                               '<td data-sortby="'+value.timePlayed+'"                                                         class="timePlayed"              title="Total Time Played on '+value.mapName+'">'                           + secondsToHMS(value.timePlayed) + '</td>' +
                                               '<td data-sortby="'+(value.winCount+value.saveCount)/(value.playedCount-value.usaCount || 1)+'" class="winpercent"              title="Win Percentage on '+value.mapName+'">'                              + ((value.winCount+value.saveCount)/(value.playedCount-value.usaCount || 1)*100).toFixed(0) + '%</td>' +
                                               '<td data-sortby="'+value.captures+'"                                                           class="captures"                title="Total Caps on '+value.mapName+'">'                                  + value.captures + '</td>' +
                                               '<td data-sortby="'+value.grabs+'"                                                              class="grabs"                   title="Total Grabs on '+value.mapName+'">'                                 + value.grabs + '</td>' +
                                               '<td data-sortby="'+value.hold+'"                                                               class="hold"                    title="Total Hold on '+value.mapName+'">'                                  + secondsToHMS(value.hold) + '</td>' +
                                               '<td data-sortby="'+value.drops+'"                                                              class="drops"                   title="Total Drops on '+value.mapName+'">'                                 + value.drops + '</td>' +
                                               '<td data-sortby="'+value.tags+'"                                                               class="tags"                    title="Total Tags on '+value.mapName+'">'                                  + value.tags + '</td>' +
                                               '<td data-sortby="'+value.pops+'"                                                               class="pops"                    title="Total Popped on '+value.mapName+'">'                                + value.pops + '</td>' +
                                               '<td data-sortby="'+value.returns+'"                                                            class="returns"                 title="Total Returns on '+value.mapName+'">'                               + value.returns + '</td>' +
                                               '<td data-sortby="'+value.prevent+'"                                                            class="prevent"                 title="Total Prevent on '+value.mapName+'">'                               + secondsToHMS(value.prevent) + '</td>' +
                                               '<td data-sortby="'+value.support+'"                                                            class="support"                 title="Total Support on '+value.mapName+'">'                               + value.support + '</td>' +
                                               '<td data-sortby="'+value.powerups+'"                                                           class="powerups"                title="Total Powerups on '+value.mapName+'">'                              + value.powerups + '</td>' +
                                               '<td data-sortby="'+(value.captures/(value.grabs||1))+'"                                        class="capsgrab"                title="Caps/Grab on '+value.mapName+'">'                                   + (value.captures/(value.grabs||1)).toFixed(3) + '</td>' +
                                               '<td data-sortby="'+(value.tags/(value.pops||1))+'"                                             class="tagspop"                 title="Tags/Pop on '+value.mapName+'">'                                    + (value.tags/(value.pops||1)).toFixed(3) + '</td>' +
                                               '<td data-sortby="'+(value.captures/(value.timePlayed/3600))+'"                                 class="capshour"                title="Caps/Hour on '+value.mapName+'">'                                   + (value.captures/(value.timePlayed/3600)).toFixed(1) + '</td>' +
                                               '<td data-sortby="'+(value.returns/(value.timePlayed/3600))+'"                                  class="returnshour"             title="Returns/Hour on '+value.mapName+'">'                                + (value.returns/(value.timePlayed/3600)).toFixed(1) + '</td>' +
                                               '<td data-sortby="'+(value.prevent/(value.timePlayed/3600))+'"                                  class="preventhour"             title="Prevent/Hour on '+value.mapName+'">'                                + secondsToHMS(value.prevent/(value.timePlayed/3600)) + '</td>' +
                                               '</tr>');
                    if (value.winCount) $('#map1_'+trimmedMapName).append('<span style="display:inline-block; width:'+(value.winCount/value.playedCount*100).toFixed(2)+'%; height:10px; white-space:nowrap; background:#22DD22" title="Wins: '+value.winCount+ '"></span>');
                    if (value.saveCount) $('#map1_'+trimmedMapName).append('<span style="display:inline-block; width:'+(value.saveCount/value.playedCount*100).toFixed(2)+'%; height:10px; white-space:nowrap; background:#166C16" title="Saves: '+value.saveCount+ '"></span>');
                    if (value.lossCount) $('#map1_'+trimmedMapName).append('<span style="display:inline-block; width:'+(value.lossCount/value.playedCount*100).toFixed(2)+'%; height:10px; white-space:nowrap; background:#EE2020" title="Losses: '+value.lossCount+ '"></span>');
                    if (value.tieCount) $('#map1_'+trimmedMapName).append('<span style="display:inline-block; width:'+(value.tieCount/value.playedCount*100).toFixed(2)+'%; height:10px; white-space:nowrap; background:#ff9900" title="Ties: '+value.tieCount+ '"></span>');
                    if (value.usaCount) $('#map1_'+trimmedMapName).append('<span style="display:inline-block; width:'+(value.usaCount/value.playedCount*100).toFixed(2)+'%; height:10px; white-space:nowrap; background:#157798" title="Unsuccessful Save Attempts: '+value.usaCount+ '"></span>');

                    $('#ms_pergamedata').append('<tr class="ms_datarow'+(value.playedCount < MapStats_Options.hidelowlymaps.value ? ' MapStats_Lowly' : '')+(value.mapType ? ' MapStats_MapType_'+value.mapType : '')+'">' + 
                                                '<td data-sortby="m'+trimmedMapName+'"' + (mapPreviewID ? 'data-previewid="'+mapPreviewID+'" data-mapauthor="'+value.mapAuthor+'" class="mapPreview" ' : '') + 'style="text-align:right; ' + (!mapPreviewID ? 'text-decoration:underline dotted;" title="No Preview Available"' : '"') + '>' + value.mapName + '</td>' + 
                                                '<td data-sortby="'+(value.winCount+value.saveCount)+'" data-playedcount="'+value.playedCount+'" data-wincount="'+value.winCount+'" data-losscount="'+value.lossCount+'" data-tiecount="'+value.tieCount+'" data-savecount="'+value.saveCount+'" data-usacount="'+value.usaCount+'" style="text-align:left"><div id="map2_'+trimmedMapName+'" style="width:'+(value.playedCount/highestPlayed*100).toFixed(2)+'%; height:8px; overflow:hidden; white-space:nowrap"></div></td>' + 
                                                
                                                '<td data-sortby="'+value.playedCount+'"                                                        class="playedCount"            title="'+value.mapName+' played '+value.playedCount+' times">'               + (value.playedCount/totals.playedCount*100).toFixed(2) + '% (' + value.playedCount + ')</td>' + 
                                                '<td data-sortby="'+(value.timePlayed/value.playedCount)+'"                                     class="timePlayed"             title="Average Time Played on '+value.mapName+'">'                           + secondsToHMS(value.timePlayed/value.playedCount) + '</td>' +
                                                '<td data-sortby="'+(value.winCount+value.saveCount)/(value.playedCount-value.usaCount || 1)+'" class="winpercent"             title="Win Percentage on '+value.mapName+'">'                                + ((value.winCount+value.saveCount)/(value.playedCount-value.usaCount || 1)*100).toFixed(0) + '%</td>' +
                                                '<td data-sortby="'+(value.captures/value.playedCount)+'"                                       class="captures"               title="Average Caps on '+value.mapName+'">'                                  + (value.captures/value.playedCount).toFixed(2) + '</td>' +
                                                '<td data-sortby="'+(value.grabs/value.playedCount)+'"                                          class="grabs"                  title="Average Grabs on '+value.mapName+'">'                                 + (value.grabs/value.playedCount).toFixed(2) + '</td>' +
                                                '<td data-sortby="'+(value.hold/value.playedCount)+'"                                           class="hold"                   title="Average Hold on '+value.mapName+'">'                                  + secondsToHMS(value.hold/value.playedCount) + '</td>' +
                                                '<td data-sortby="'+(value.drops/value.playedCount)+'"                                          class="drops"                  title="Average Drops on '+value.mapName+'">'                                 + (value.drops/value.playedCount).toFixed(2) + '</td>' +
                                                '<td data-sortby="'+(value.tags/value.playedCount)+'"                                           class="tags"                   title="Average Tags on '+value.mapName+'">'                                  + (value.tags/value.playedCount).toFixed(2) + '</td>' +
                                                '<td data-sortby="'+(value.pops/value.playedCount)+'"                                           class="pops"                   title="Average Popped on '+value.mapName+'">'                                + (value.pops/value.playedCount).toFixed(2) + '</td>' +
                                                '<td data-sortby="'+(value.returns/value.playedCount)+'"                                        class="returns"                title="Average Returns on '+value.mapName+'">'                               + (value.returns/value.playedCount).toFixed(2) + '</td>' +
                                                '<td data-sortby="'+(value.prevent/value.playedCount)+'"                                        class="prevent"                title="Average Prevent on '+value.mapName+'">'                               + secondsToHMS(value.prevent/value.playedCount) + '</td>' +
                                                '<td data-sortby="'+(value.support/value.playedCount)+'"                                        class="support"                title="Average Support on '+value.mapName+'">'                               + (value.support/value.playedCount).toFixed(2) + '</td>' +
                                                '<td data-sortby="'+(value.powerups/value.playedCount)+'"                                       class="powerups"               title="Average Powerups on '+value.mapName+'">'                              + (value.powerups/value.playedCount).toFixed(2) + '</td>' +
                                                '<td data-sortby="'+(value.captures/(value.grabs||1))+'"                                        class="capsgrab"               title="Caps/Grab on '+value.mapName+'">'                                     + (value.captures/(value.grabs||1)).toFixed(3) + '</td>' +
                                                '<td data-sortby="'+(value.tags/(value.pops||1))+'"                                             class="tagspop"                title="Tags/Pop on '+value.mapName+'">'                                      + (value.tags/(value.pops||1)).toFixed(3) + '</td>' +
                                                '<td data-sortby="'+(value.captures/(value.timePlayed/3600))+'"                                 class="capshour"               title="Caps/Hour on '+value.mapName+'">'                                     + (value.captures/(value.timePlayed/3600)).toFixed(1) + '</td>' +
                                                '<td data-sortby="'+(value.returns/(value.timePlayed/3600))+'"                                  class="returnshour"            title="Returns/Hour on '+value.mapName+'">'                                  + (value.returns/(value.timePlayed/3600)).toFixed(1) + '</td>' +
                                                '<td data-sortby="'+(value.prevent/(value.timePlayed/3600))+'"                                  class="preventhour"            title="Prevent/Hour on '+value.mapName+'">'                                  + secondsToHMS(value.prevent/(value.timePlayed/3600)) + '</td>' +
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
            GM_addStyle(".MF_Max { color:#ca0 }");


            function doTotalsAndMaximums() {
                var prevMax, colTotal, visibleRowCount=0, playedCount=0, timePlayed=0, mapType='';
                var table = (GM_getValue('PerGameStats', false) ? 'ms_pergamedata' : 'ms_normaldata');
                var $table = $('#'+table), $column;

                if (GM_getValue('AllNFCTF', 'ms_ANC_All') === 'ms_ANC_NF') mapType = ' NF';
                else if (GM_getValue('AllNFCTF', 'ms_ANC_All') === 'ms_ANC_CTF') mapType = ' CTF';
                else mapType = ' All';
                $('#MF_Maps tr:eq(0) th:eq(0)').text(mapType + ' Maps');

                $($table).find('.MF_Max').removeClass('MF_Max');

                for (var i=3; i<=20; i++) {
                    $column = $('#'+table+' tr:gt(0) td:nth-child('+i+')');
                    prevMax = 0;
                    colTotal = 0;

                    $($column).each(function(k, v) {
                        if ($(this).is(':visible')) {
                            if (i === 3) visibleRowCount++;
                            colTotal += $(this).data('sortby');
                            if (MapStats_Options.highlightmaxs.value) {
                                if ($(this).data('sortby') > prevMax) {
                                    $($column).removeClass('MF_Max');
                                    $(this).addClass('MF_Max');
                                    prevMax = $(this).data('sortby');
                                } else if ($(this).data('sortby') === prevMax) {
                                    $(this).addClass('MF_Max');
                                }
                            }
                        }
                    });
                    if (i === 3) playedCount = colTotal;
                    if (i === 4) timePlayed = colTotal;

                    if (MapStats_Options.showtotals.value) {
                        switch (i-1) {
                            case 3:  //Time Played
                            case 7:  //Hold
                            case 12: //Prevent
                                if (table === 'ms_normaldata') {
                                    colTotal = secondsToHMS(colTotal);
                                } else {
                                    colTotal = secondsToHMS(colTotal / visibleRowCount);
                                }
                                break;

                            case 4: //Win Percentage
                                colTotal = (colTotal*100 / visibleRowCount).toFixed(2) + '%';
                                break;

                            case 15: // Caps/Grab
                            case 16: // Tags/Pop
                                colTotal = (colTotal / visibleRowCount).toFixed(3);
                                break;

                            case 17: // Caps/Hour
                            case 18: // Returns/Hour
                                colTotal = (colTotal / visibleRowCount).toFixed(2);
                                break;

                            case 19: //Prevent/Hour
                                colTotal = secondsToHMS(colTotal / visibleRowCount);
                                break;

                            default:
                                if (table === 'ms_normaldata') {
                                    colTotal = colTotal;
                                } else {
                                    colTotal = (colTotal / visibleRowCount).toFixed(2);
                                }
                                break;
                        }
                        $('#'+table+' tr:eq(0) td:eq('+(i-1)+')').text(colTotal);

                        if (mapType === ' All') mapType = '';
                        if (GM_getValue('PerGameStats', false)) {
                            $('#mapstats_totals_pergame').find('td').eq(0).text(visibleRowCount + '/' + mapFreqSorted.length).attr('title', 'Showing ' +visibleRowCount+mapType+ ' maps out of '+mapFreqSorted.length+' available' + (MapStats_Options.hidelowlymaps.value > 1 ? ' (games below ' +MapStats_Options.hidelowlymaps.value+ ' plays are not being shown)' : '') );
                        } else {
                            $('#mapstats_totals_normal').find('td').eq(0).text(visibleRowCount + '/' + mapFreqSorted.length).attr('title', 'Showing ' +visibleRowCount+mapType+ ' maps out of '+mapFreqSorted.length+' available' + (MapStats_Options.hidelowlymaps.value > 1 ? ' (games below ' +MapStats_Options.hidelowlymaps.value+ ' plays are not being shown)' : '') );
                        }

                    }
                }
                
                if (MapStats_Options.showtotals.value) {
                    $column = $('#'+table+' tr:gt(0) td:nth-child(2)');
                    totals = { playedCount:0, winCount:0, lossCount:0, saveCount:0, usaCount:0, tieCount:0 };
                    $($column).each(function(k, v) {
                        if ($(this).is(':visible')) {
                            $.each(totals, function(k2, v2) {
                                totals[k2] += $(v).data(k2.toLowerCase());
                            });
                        }
                    });
                    $('#'+table+' tr:eq(0) td:eq(1)').text( 'W:'+totals.winCount +' | L:'+totals.lossCount +' | T:'+totals.tieCount +' | S:'+totals.saveCount +' | U:'+totals.usaCount ).attr('title', 'Total Games: ' + totals.playedCount);
                }
            }

            //---------------------------------------------
            //Build the menu and perform some saved options...
            $.each(MapStats_Options, function(key, value) {
                if (key === 'hidelowlymaps') {
                    $('#MapStats_Options_Menu').append('<li style="list-style:none"><input type="checkbox" checked disabled><span>Hide Below:</span><input type="range" id="MapStats_HideLowly" min="1" max="' + highestPlayed + '" value="' + MapStats_Options.hidelowlymaps.value + '" style="width:100px" title="Hide Below # Games (1 = show all)"> <span id="MapStats_HideLowly_Value">' + MapStats_Options.hidelowlymaps.value + '</span> Games</li>');
                    
                } else if (key === 'MinimumGameTime') {
                    $('#MapStats_Options_Menu').append('<li style="list-style:none"><input type="checkbox" checked disabled><span>Minimum Game Time:</span><input type="range" id="MapStats_MinimumGameTime" min="0" max="100" value="' + MapStats_Options.MinimumGameTime.value + '" style="width:100px" title="Save to MapStats only if we played for at least this % of the game (0 = always save)"> <span id="MapStats_MinimumGameTime_Value">' + MapStats_Options.MinimumGameTime.value + '</span>%</li>');
                    
                } else {
                    if (key === 'timePlayed') $('#MapStats_Options_Menu').append('<div style="margin:8px 0 0 4px; color:yellow; font-weight:bold;">Columns...</div>');
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
            $('#MapStats_Options_Menu').append('<div style="position:absolute; bottom:2px; right:5px; text-align:right"><div id="MapStats_Reset" style="display:inline-block; margin:0 15px; padding:0 2px; font-size:7px; border:1px solid #CD0A0A; cursor:pointer" title="Clear/Reset all data">RESET</div><a href="https://gist.github.com/nabbynz/cf44259aded7b4c32df0" target="_blank" style="font-size:11px; color:#888" title="Version: ' + GM_info.script.version + '. Click to manually check for updates (script will auto-update if enabled)...">v' + GM_info.script.version + '</a</div>');


            //---------------------------------------------
            //Bind Events...
            $('#MapFreq input[name=ms_AllNFCTF]').on('click', function() {
                if (this.id === GM_getValue('AllNFCTF', 'ms_ANC_All')) return;

                if (this.id === 'ms_ANC_All') {
                    $('#MF_Maps .MapStats_MapType_NF').show(0);
                    $('#MF_Maps .MapStats_MapType_CTF').show(0);
                } else if (this.id === 'ms_ANC_NF') {
                    $('#MF_Maps .MapStats_MapType_NF').show(0);
                    $('#MF_Maps .MapStats_MapType_CTF').hide(0);
                } else if (this.id === 'ms_ANC_CTF') {
                    $('#MF_Maps .MapStats_MapType_NF').hide(0);
                    $('#MF_Maps .MapStats_MapType_CTF').show(0);
                } else {
                    return;
                }
                
                GM_setValue('AllNFCTF', this.id);
                $('#MapFreq input[name=ms_AllNFCTF]').parent('label').css('color', '#fff');
                $(this).parent('label').css('color', '#0a0');
                $('#MF_Maps .MapStats_Lowly').hide(0);
                setTimeout(doTotalsAndMaximums, 200);
            });
            
            $('#MapStats_Reset').on('click', function() {
                var response = confirm("Warning! All map data will be deleted.\n\nOK to continue?");
                if (response) {
                    GM_deleteValue('mapFreq');
                    $('#MF_Maps').remove();
                }
            });

            $('#MapStats_MinimumGameTime').on('input', function() {
                $('#MapStats_MinimumGameTime_Value').text(this.value);
            });
            $('#MapStats_MinimumGameTime').on('change', function() {
                MapStats_Options.MinimumGameTime.value = this.value;
                GM_setValue('MapStats_Options', MapStats_Options);
            });
            
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
                        } else {
                            $(this).show(0);
                        }
                    });
                    $.each($('#ms_pergamedata > tr:gt(0)'), function() {
                        if ($(this).find('td').eq(2).data('sortby') < MapStats_Options.hidelowlymaps.value) {
                            $(this).addClass('MapStats_Lowly');
                        } else {
                            $(this).show(0);
                        }
                    });
                }
                
                if (GM_getValue('AllNFCTF', 'ms_ANC_All') === 'ms_ANC_NF') {
                    $('#MF_Maps .MapStats_MapType_CTF').hide(0);
                } else if (GM_getValue('AllNFCTF', 'ms_ANC_All') === 'ms_ANC_CTF') {
                    $('#MF_Maps .MapStats_MapType_NF').hide(0);
                }

                $('#MF_Maps .MapStats_Lowly').hide(0);
                
                setTimeout(doTotalsAndMaximums, 200);
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
                setTimeout(doTotalsAndMaximums, 200);
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
                } else if ($(this).attr('id') === 'showborder') {
                    if ($(this).is(':checked')) {
                        $('#MapFreq').css('box-shadow', '#fff 0px 0px 10px');
                    } else {
                        $('#MapFreq').css('box-shadow', 'none');
                    }
                } else if ($(this).attr('id') === 'highlightmaxs') {
                    if ($(this).is(':checked')) {
                        setTimeout(doTotalsAndMaximums, 200);
                    } else {
                        $('#MF_Maps .MF_Max').removeClass('MF_Max');
                    }
                } else {
                    if ($(this).is(':checked')) {
                        $('.'+$(this).attr('id')).fadeIn(300);
                        setTimeout(doTotalsAndMaximums, 200);
                    } else {
                        $('.'+$(this).attr('id')).fadeOut(800);
                    }
                }
            });

            $('#MF_Maps .mapPreview').on('click', function() {
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
            $('#MF_Maps .mapPreview').hover(function() {
                if ($(this).data('previewid')) {
                    $(this).css('color', '#b0b');
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
            
            if (GM_getValue('AllNFCTF', 'ms_ANC_All') === 'ms_ANC_NF') {
                $('#ms_normaldata .MapStats_MapType_NF').show(0);
                $('#ms_normaldata .MapStats_MapType_CTF').hide(0);
                $('#ms_pergamedata .MapStats_MapType_NF').show(0);
                $('#ms_pergamedata .MapStats_MapType_CTF').hide(0);
            } else if (GM_getValue('AllNFCTF') === 'ms_ANC_CTF') {
                $('#ms_normaldata .MapStats_MapType_NF').hide(0);
                $('#ms_normaldata .MapStats_MapType_CTF').show(0);
                $('#ms_pergamedata .MapStats_MapType_NF').hide(0);
                $('#ms_pergamedata .MapStats_MapType_CTF').show(0);
            }

            $('#MF_Maps .MapStats_Lowly').hide(0);

            setTimeout(doTotalsAndMaximums, 600);
            
            //sort the table by last saved...
            $('#MF_Maps th:eq('+GM_getValue('MapStats_SortBy', 1)+')').trigger('click');

        } else {
            $('#MapFreq').append('<div>No Data for Map Stats (go play some games :)</div>');
        }
    }
    

    if (PageLoc === 'ingame') {
        var joinTime;
        var mapName='', mapAuthor='', mapType='';
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
            
            for (var i=0; i<tagpro.map.length; i++) {
                for (var j=0; j<tagpro.map[i].length; j++) {
                    if (tagpro.map[i][j] === 16) {
                        mapType = 'NF';
                    } else if (tagpro.map[i][j] === 3) {
                        mapType = 'CTF';
                    }
                }
            }
                    
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
                var fullTime = Date.parse(tagpro.gameEndsAt); //expected end of game time after 12 mins
                var endTime = (new Date).getTime(); //actual end of game time
                var startTime = fullTime - 12 * 60 * 1000; //start of game time
                var fullGameLength = (endTime-startTime)/1000; //how long the whole game lasted (with or without us)
                var playedGameLength = (endTime-joinTime)/1000; //how long we played for

                //if ( joinTime+30000 < endTime ) { //check we didn't join in the last 30 seconds of the game
                if (playedGameLength > fullGameLength * (MapStats_Options.MinimumGameTime.value / 100)) { //check we played for more than x% of the game                
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

                    saveMapData(mapName, result, pups, mapAuthor, mapType);
                }
            }
        });
    }
    
}); //tagpro.ready
