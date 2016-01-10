
var formulas,
    defaultChecks;
chrome.storage.sync.get(['formulas', 'defaultChecks'], function(result) {
    formulas = result.formulas;
    defaultChecks = result.defaultChecks;
});

function runUserDefinedCode(formulas, defaultChecks, mapInfo) {
    if(!formulas) formulas = [];
    if(!defaultChecks) {
        defaultChecks = [];
        for(var check = 0; check < mapInfo.length; check++) {
            defaultChecks.push(false);
        }
    }
    var userDefinedCode = '',
        minIndex = 0,
        maxIndex = 0,
        allChecks = defaultChecks,
        formulasCopy = formulas.slice();

    for(var i = 0; i < formulasCopy.length; i++) {
        var formula = formulasCopy[i];
        mapInfo[formula.name] = 0;
        minIndex = Math.min(minIndex, Number(formula.index));
        maxIndex = Math.max(maxIndex, Number(formula.index));
        allChecks.push(formula.dontDisplay);
    }

    formulasCopy.sort(function(a,b){return(a.index > b.index);});
    formulasCopy.forEach(function(formula) {
        userDefinedCode += 'mapInfo["' + formula.name + '"] = ' + formula.actualFormula + ';';
    });

    eval(userDefinedCode);


    // get rid of things we don't want to be displayed
    var mapInfoKeys = Object.keys(mapInfo);
    for(var j = allChecks.length; j > 0; j--) {
        if(allChecks[j-1]) {
            delete(mapInfo[mapInfoKeys[j-1]]);
        }
    }
    
    return(mapInfo);

}




////////////////////////
// MAP EDITOR VERSION //
////////////////////////


if(document.URL.search('http://unfortunate-maps.jukejuice.com/editor') >= 0 ) {

    chrome.runtime.sendMessage({type: 'view'}, function(response) {console.log(response.message);});


    var mapInfoDiv = $('<div id=mapInfoDiv>');
    document.body.appendChild(mapInfoDiv[0]);
    $('#mapInfoDiv').draggable();
    $('#mapInfoDiv').hide();

    $('#palette').after($('<button id=showMapInfoButton>Show Map Info</button>'));
    $('#showMapInfoButton')[0].onclick = function() {
        if($('#mapInfoDiv').css('display') === "none") {
            extractMapData(mapInfoDiv);
        } else {
            $('#mapInfoTableBody').remove();
            $('#saveMapInfoLink').remove();
            $('#mapInfoDiv').hide();
        }
    };


    function testForWall(thisTile) {
        var quadrants = thisTile[0].children;
        var wallQuadrants = 0;
        for(var quadrant = 0; quadrant < 4; quadrant++) {
            if(thisTile[0].children[quadrant].style.display === "inline-block") {
                wallQuadrants++;
            }
        }
        return wallQuadrants;
    }

    function returnTileCoords(thisTile) {
        var X = thisTile[0].style.backgroundPositionX.replace('px','');
        var Y = thisTile[0].style.backgroundPositionY.replace('px','');
        return X+Y;
    }

    function extractMapData(mapInfoDiv) {

        var map = $('#map'),
            mapRows = map.children(),
            numMapRows = mapRows.length,
            numMapCols = mapRows[0].children.length,
            pathObj = {
                graph: [],
                redFlag: undefined,
                blueFlag: undefined
            },
            mapInfo = {
                "Map Width" : numMapCols,
                "Map Height" : numMapRows,
                "Total Area" : numMapCols * numMapRows,
                "Adjusted Area" : 0,
                "Shortest Path Between Flags" : "N/A",
                "Percent Not Empty" : 0,
                "Empty Spaces": 0,
                "Walls": 0,
                "Walls (Square)": 0,
                "Walls (Diagonal)": 0,
                "Floor Tiles": 0,
                "Floor Tiles % of Interior": 0,
                "Flags (Red)": 0,
                "Flags (Blue)": 0,
                "Flags (Yellow)": 0,
                "Speed Pads (Total)": 0,
                "Speed Pads (Neutral)": 0,
                "Speed Pads (Red)": 0,
                "Speed Pads (Blue)": 0,
                "Power-Ups": 0,
                "Spikes": 0,
                "Buttons": 0,
                "Gates (Inactive)" : 0,
                "Gates (Green)" : 0,
                "Gates (Red)" : 0,
                "Gates (Blue)" : 0,
                "Bombs" : 0,
                "Team Tiles (Red)" : 0,
                "Team Tiles (Blue)" : 0,
                "Portals" : 0,
                "Goal Tiles (Red)" : 0,
                "Goal Tiles (Blue)" : 0,
                "Gravity Wells": 0
            };



        for(var row = 0; row < numMapRows; row++) {
            pathObj.graph.push([]);
            for(var col = 0; col < numMapCols; col++) {
                var thisTile = map.children()[row].children[col].children;

                // first test if this tile is a portal, speedpad, gravity well, or empty spaces
                var thisTileBackgroundImage = $(thisTile).css('background-image');
                if(thisTileBackgroundImage.search('portal.png') >= 0) {
                    pathObj.graph[row][col] = 0;
                    mapInfo["Portals"]++;
                    continue;
                }
                
                if(thisTileBackgroundImage.search('gravitywell.png') >= 0) {
                    pathObj.graph[row][col] = 0;
                    mapInfo["Gravity Wells"]++;
                    continue;
                }

                if(thisTileBackgroundImage.search('speedpad') >= 0) {
                    pathObj.graph[row][col] = 1;
                    mapInfo["Speed Pads (Total)"]++;
                    if(thisTileBackgroundImage.search('speedpadred') >= 0) {
                        mapInfo["Speed Pads (Red)"]++;
                        continue;
                    } else if(thisTileBackgroundImage.search('speedpadblue') >= 0) {
                        mapInfo["Speed Pads (Blue)"]++;
                        continue;
                    } else {
                        mapInfo["Speed Pads (Neutral)"]++;
                        continue;
                    }
                }

                if($(thisTile)[0].style.backgroundColor === 'black') {
                    pathObj.graph[row][col] = 0;
                    mapInfo["Empty Spaces"]++;
                    continue;
                }

                // next test for walls
                switch(testForWall(thisTile)) {
                    case 0:
                        break;
                    case 1:
                    case 2:
                    case 3:
                        pathObj.graph[row][col] = 0;
                        mapInfo["Walls"]++;
                        mapInfo["Walls (Diagonal)"]++;
                        continue;
                    case 4:
                        pathObj.graph[row][col] = 0;
                        mapInfo["Walls"]++;
                        mapInfo["Walls (Square)"]++;
                        continue;
                    default:
                        break;
                }

                // last test for all other tile types
                switch(returnTileCoords(thisTile)) {
                    case "-6000":
                    case "-5600":
                    case "-520-160":
                        pathObj.graph[row][col] = 1;
                        mapInfo["Floor Tiles"]++;
                        continue;
                    case "-560-40":
                        pathObj.graph[row][col] = 1;
                        pathObj.redFlag = {col: col, row: row};
                        mapInfo["Flags (Red)"]++;
                        continue;
                    case "-600-40":
                        pathObj.graph[row][col] = 1;
                        pathObj.blueFlag = {col: col, row: row};
                        mapInfo["Flags (Blue)"]++;
                        continue;
                    case "-520-40":
                        pathObj.graph[row][col] = 1;
                        mapInfo["Flags (Yellow)"]++;
                        continue;
                    case "-480-280":
                        pathObj.graph[row][col] = 1;
                        mapInfo["Power-Ups"]++;
                        continue;
                    case "-4800":
                        pathObj.graph[row][col] = 0;
                        mapInfo["Spikes"]++;
                        continue;
                    case "-520-240":
                        pathObj.graph[row][col] = 1;
                        mapInfo["Buttons"]++;
                        continue;
                    case "-480-120":
                        pathObj.graph[row][col] = 1;
                        mapInfo["Gates (Inactive)"]++;
                        continue;
                    case "-520-120":
                        pathObj.graph[row][col] = 1;
                        mapInfo["Gates (Green)"]++;
                        continue;
                    case "-560-120":
                        pathObj.graph[row][col] = 1;
                        mapInfo["Gates (Red)"]++;
                        continue;
                    case "-600-120":
                        pathObj.graph[row][col] = 1;
                        mapInfo["Gates (Blue)"]++;
                        continue;
                    case "-480-40":
                        pathObj.graph[row][col] = 1;
                        mapInfo["Bombs"]++;
                        continue;
                    case "-560-160":
                        pathObj.graph[row][col] = 1;
                        mapInfo["Team Tiles (Red)"]++;
                        continue;
                    case "-600-160":
                        pathObj.graph[row][col] = 1;
                        mapInfo["Team Tiles (Blue)"]++;
                        continue;
                    case "-560-200":
                        pathObj.graph[row][col] = 1;
                        mapInfo["Goal Tiles (Red)"]++;
                        continue;
                    case "-600-200":
                        pathObj.graph[row][col] = 1;
                        mapInfo["Goal Tiles (Blue)"]++;
                        continue;
                }
            }
        }

        mapInfo["Percent Not Empty"] = Math.round((1 - (mapInfo["Empty Spaces"] / (mapInfo["Map Width"] * mapInfo["Map Height"]))) * 10000)/100 + '%';
        mapInfo["Adjusted Area"] = mapInfo["Total Area"] - mapInfo["Empty Spaces"];
        var ftPercent = mapInfo["Floor Tiles"] / mapInfo["Adjusted Area"];
        mapInfo["Floor Tiles % of Interior"] = Math.round(ftPercent * 10000) / 100 + '%';

        // determine shortest distance between two flags
        if(pathObj.redFlag && pathObj.blueFlag) {
            var graph = new Graph(pathObj.graph, { diagonalOnlyWhenNoObstacles: true });
            var start = graph.grid[pathObj.redFlag.row][pathObj.redFlag.col];
            var end = graph.grid[pathObj.blueFlag.row][pathObj.blueFlag.col];
            var result = astar.search(graph, start, end, { heuristic: astar.heuristics.diagonal });
            mapInfo["Shortest Path Between Flags"] = result.length;
        }


        mapInfo = runUserDefinedCode(formulas, defaultChecks, mapInfo);


        var textStyle = 'padding-left: 3px; padding-right: 3px; text-align: left; color: white; font: 14px \"Lucida Grande\", Helvetica, Arial, sans-serif';
        mapInfoDiv.append('<table><tbody id=mapInfoTableBody><tr><th style="' + textStyle + '">Tile<th style="' + textStyle + '">Number');
        var mapInfoTableBody = $('#mapInfoTableBody');
        for(var i in mapInfo) {
            mapInfoTableBody.append('<tr><td style="' + textStyle + '">' + i + '<td style="' + textStyle + '">' + mapInfo[i]);
        }
        mapInfoDiv.append('<a id=saveMapInfoLink style="cursor:pointer; color:#00FF00">Save .csv');
        $('#saveMapInfoLink')[0].onclick = function() {
            var mapInfoText = $('#mapInfoTableBody')[0].innerText;
            var mapInfoTextCSV = mapInfoText.replace(/\t/g,',');
            var blob = new Blob([mapInfoTextCSV], {type: "text/plain;charset=utf-8"});
            saveAs(blob, 'MapInfo.csv');
        };

        mapInfoDiv.css({"background-color" : "rgba(0, 0, 0, 0.5)",
                        "position" : "absolute",
                        "top" : $(document).height()/2 - mapInfoDiv.height()/2,
                        "left" : $(document).width()/2 - mapInfoDiv.width()/2,
                        "border" : "2px solid white"
                       });

        $('#mapInfoDiv').show();

    }





///////////////////////
// JUKEJUICE VERSION //
///////////////////////


} else if(document.URL.search('maps.jukejuice.com') >= 0) {

    chrome.runtime.sendMessage({type: 'view'}, function(response) {console.log(response.message);});


    function getPixelValues(img) {
        var canvas = document.createElement('canvas'),
            context = canvas.getContext && canvas.getContext('2d'),
            rgb = '', 
            count = 0,
            data, 
            length,
            result = [],
            width,
            height,
            col = 0,
            row = 0;

        // return the base colour for non-compliant browsers
        if (!context) { throw(' error: canvas context could not be created.'); }

        // set the height and width of the canvas element to that of the image
        height = canvas.height = img.naturalHeight || img.offsetHeight || img.height;
        width = canvas.width = img.naturalWidth || img.offsetWidth || img.width;

        context.drawImage(img, 0, 0);

        try {
            data = context.getImageData(0, 0, width, height);
        } catch(e) {
            // catch errors - usually due to cross domain security issues
            throw(e);
        }

        data = data.data;
        length = data.length;
        count = 0;

        for(var c = 0; c < width; c++) {
            result.push([]);
        }


        for(var i = 0; i + 4 <= length; i+=4) {
            row = Math.floor(count / width);
            col = count % width;
            rgb = 'r'+data[i]+'g'+data[i+1]+'b'+data[i+2];
            result[col][row] = rgb;
            //result.push(rgb.all)
            count++;
        }

        return result;
    }

    function decipherPixelValues(pixels) {
        var nCols = pixels.length,
            nRows = pixels[0].length,
            pathObj = {
                graph: [],
                redFlag: undefined,
                blueFlag: undefined
            },
            mapInfo = {
                "Map Width" : nCols,
                "Map Height" : nRows,
                "Total Area" : nCols * nRows,
                "Adjusted Area" : 0,
                "Shortest Path Between Flags" : "N/A",
                "Percent Not Empty" : 0,
                "Empty Spaces": 0,
                "Walls": 0,
                "Walls (Square)": 0,
                "Walls (Diagonal)": 0,
                "Floor Tiles": 0,
                "Floor Tiles % of Interior": 0,
                "Flags (Red)": 0,
                "Flags (Blue)": 0,
                "Flags (Yellow)": 0,
                "Speed Pads (Total)": 0,
                "Speed Pads (Neutral)": 0,
                "Speed Pads (Red)": 0,
                "Speed Pads (Blue)": 0, 
                "Power-Ups": 0,
                "Spikes": 0,
                "Buttons": 0,
                "Gates (Inactive)" : 0,
                "Gates (Green)" : 0,
                "Gates (Red)" : 0,
                "Gates (Blue)" : 0,
                "Bombs" : 0,
                "Team Tiles (Red)" : 0,
                "Team Tiles (Blue)" : 0,
                "Portals" : 0,
                "Goal Tiles (Red)" : 0,
                "Goal Tiles (Blue)" : 0,
                "Gravity Wells": 0
            };

        for( var col = 0; col < nCols; col++ ) {
            pathObj.graph.push([]);
            for( var row = 0; row < nRows; row++ ) {
                switch( pixels[col][row] ) {
                    case "r0g0b0":
                        mapInfo["Empty Spaces"]++;
                        pathObj.graph[col][row] = 0;
                        break;
                    case "r120g120b120":
                        mapInfo["Walls"]++;
                        mapInfo["Walls (Square)"]++;
                        pathObj.graph[col][row] = 0;
                        break;
                    case "r64g128b80":
                    case "r64g80b128":
                    case "r128g64b112":
                    case "r128g112b64":
                        mapInfo["Walls"]++;
                        mapInfo["Walls (Diagonal)"]++;
                        pathObj.graph[col][row] = 0;
                        break;
                    case "r212g212b212":
                    case "r155g0b0":
                    case "r0g0b155":
                        mapInfo["Floor Tiles"]++;
                        pathObj.graph[col][row] = 1;
                        break;
                    case "r255g0b0":
                        mapInfo["Flags (Red)"]++;
                        pathObj.graph[col][row] = 1;
                        pathObj.redFlag = {col: col, row: row};
                        break;
                    case "r0g0b255":
                        mapInfo["Flags (Blue)"]++;
                        pathObj.graph[col][row] = 1;
                        pathObj.blueFlag = {col: col, row: row};
                        break;
                    case "r255g255b0":
                        mapInfo["Speed Pads (Neutral)"]++;
                        mapInfo["Speed Pads (Total)"]++;
                        pathObj.graph[col][row] = 1;
                        break;
                    case "r0g255b0":
                        mapInfo["Power-Ups"]++;
                        pathObj.graph[col][row] = 1;
                        break;
                    case "r55g55b55":
                        mapInfo["Spikes"]++;
                        pathObj.graph[col][row] = 0;
                        break;
                    case "r185g122b87":
                        mapInfo["Buttons"]++;
                        pathObj.graph[col][row] = 1;
                        break;
                    case "r255g128b0":
                        mapInfo["Bombs"]++;
                        pathObj.graph[col][row] = 1;
                        break;
                    case "r220g186b186":
                        mapInfo["Team Tiles (Red)"]++;
                        pathObj.graph[col][row] = 1;
                        break;
                    case "r187g184b221":
                        mapInfo["Team Tiles (Blue)"]++;
                        pathObj.graph[col][row] = 1;
                        break;
                    case "r202g192b0":
                        mapInfo["Portals"]++;
                        pathObj.graph[col][row] = 0;
                        break;
                    case "r255g115b115":
                        mapInfo["Speed Pads (Red)"]++;
                        mapInfo["Speed Pads (Total)"]++;
                        pathObj.graph[col][row] = 1;
                        break;
                    case "r115g115b255":
                        mapInfo["Speed Pads (Blue)"]++;
                        mapInfo["Speed Pads (Total)"]++;
                        pathObj.graph[col][row] = 1;
                        break;
                    case "r128g128b0":
                        mapInfo["Flags (Yellow)"]++;
                        pathObj.graph[col][row] = 1;
                        break;
                    case "r185g0b0":
                        mapInfo["Goal Tiles (Red)"]++;
                        pathObj.graph[col][row] = 1;
                        break;
                    case "r25g0b148":
                        mapInfo["Goal Tiles (Blue)"]++;
                        pathObj.graph[col][row] = 1;
                        break;
                    case "r0g117b0":
                        pathObj.graph[col][row] = 1;
                        break;
                    case "r32g32b32":
                        mapInfo["Gravity Wells"]++;
                        pathObj.graph[col][row] = 0;
                        break;
                } 
            }
        }

        // determine % of tiles in map that aren't empty space
        var percentNotEmpty = 1 - (mapInfo["Empty Spaces"] / (nCols * nRows));
        mapInfo["Percent Not Empty"] = Math.round((percentNotEmpty) * 10000) / 100 + '%';
        
        // calculate adjusted area of map
        mapInfo["Adjusted Area"] = mapInfo["Total Area"] - mapInfo["Empty Spaces"];
        
        // calculate percent that floor tiles make up of the interior of the map
        var ftPercent = mapInfo["Floor Tiles"] / mapInfo["Adjusted Area"];
        mapInfo["Floor Tiles % of Interior"] = Math.round(ftPercent * 10000) / 100 + '%';

        // determine shortest distance between two flags
        if(pathObj.redFlag && pathObj.blueFlag) {
            var graph = new Graph(pathObj.graph, { diagonalOnlyWhenNoObstacles: true });
            var start = graph.grid[pathObj.redFlag.col][pathObj.redFlag.row];
            var end = graph.grid[pathObj.blueFlag.col][pathObj.blueFlag.row];
            var result = astar.search(graph, start, end, { heuristic: astar.heuristics.diagonal });
            mapInfo["Shortest Path Between Flags"] = result.length;
        }
        
        mapInfo = runUserDefinedCode(formulas, defaultChecks, mapInfo);

        return mapInfo;
    }


    function getGates(mapInfo, json) {
        for( var field in json.fields ) {
            var thisCol = field.split(',')[0],
                thisRow = field.split(',')[1];
            switch(json.fields[field].defaultState) {
                case 'off':
                    mapInfo["Gates (Inactive)"]++;
                    break;
                case 'on':
                    mapInfo["Gates (Green)"]++;
                    break;
                case 'red':
                    mapInfo["Gates (Red)"]++;
                    break;
                case 'blue':
                    mapInfo["Gates (Blue)"]++;
                    break;
            }
        }
        return mapInfo;
    }

    function createCSVText(mapInfo) {
        var result = 'Tile,Number\n';
        for(var f in mapInfo) {
            result += f + ',' + mapInfo[f] + '\n';
        }
        return result;
    }

    function createMapInfo() {
        var mapId = this.closest('.map').id.replace('map_', ''),
            img = new Image;
        img.src = document.URL.replace(/.com.*/,'.com/') + "static/maps/" + mapId + ".png";
        img.onload = function() {
            $.getJSON(document.URL.replace(/.com.*/,'.com/') + 'static/maps/' + mapId + '.json', function(json) {
                var pixels = getPixelValues(img),
                    mapInfo = decipherPixelValues(pixels),
                    mapInfoComplete = getGates(mapInfo, json),
                    csvText = createCSVText(mapInfoComplete),
                    csvName = json.info.name + ' by ' + json.info.author + '.csv';

                var blob = new Blob([csvText], {type: "text/plain;charset=utf-8"});
                saveAs(blob, csvName);
            });
        }
    }

    $(document).ready(function() {
        $('.maprow').children().each(function(a,b){$(b).find('.caption').append('<div class="pull-right" style="margin-top:-13px; margin-right:-10px; cursor:pointer"><a class=mapSaveLink>Save Map Info')});
        $('.mapSaveLink').each(function(){this.onclick = createMapInfo});
    });





/////////////////////
// IN-GAME VERSION //
/////////////////////


} else if(document.URL.search(/:[0-9]{4}/) >= 0) {

    // This is an easy method wrapper to dispatch events
    function emit(event, data) {
        var e = new CustomEvent(event, {detail: data});
        window.dispatchEvent(e);
    }

    // this function sets up a listener wrapper
    function listen(event, listener) {
        window.addEventListener(event, function (e) {
            listener(e.detail);
        });
    }

    listen('ready', function () {
        var message = {formulas: formulas,
                       defaultChecks: defaultChecks
                      };
        emit('userCode', message);
    });

    chrome.runtime.sendMessage({type: 'view'}, function(response) {console.log(response.message);});

    function injectScript(path) {
        var script = document.createElement('script');
        script.setAttribute("type", "application/javascript");
        script.src = chrome.extension.getURL(path);
        script.onload = removeScript;
        (document.head || document.documentElement).appendChild(script);
    }

    function removeScript() {
        this.parentNode.removeChild(this);
    }


    var scripts = [ 
        "lib/jquery-ui.min.js",
        "lib/FileSaver.min.js",
        "lib/astar.js",
        "src/inject/in-game.js"
    ];

    scripts.forEach(injectScript);


}















