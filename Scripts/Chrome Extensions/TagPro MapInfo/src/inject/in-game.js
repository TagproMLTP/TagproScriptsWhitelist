$(document).ready(function() {
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
            var formula = formulas[i];
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

    listen('userCode', function(message) {
        formulas = message.formulas;
        defaultChecks = message.defaultChecks;

        tagpro.ready( function() {
            tagpro.socket.on('map',function(e){
                var tiles = e.tiles,
                    pathObj = {
                        graph: [],
                        redFlag: undefined,
                        blueFlag: undefined
                    },
                    mapInfo = {
                        "Map Width" : tiles.length,
                        "Map Height" : tiles[0].length,
                        "Total Area" : tiles.length * tiles[0].length,
                        "Adjusted Area" : 0,
                        "Shortest Path Between Flags" : "N/A",
                        "Percent Not Empty" : 0,
                        "Empty Spaces": 0,
                        "Walls": 0,
                        "Walls (Square)": 0,
                        "Walls (Diagonal)": 0,
                        "Floor Tiles": 0,
                        "Floor Tiles % of Interior" : 0,
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

                for(var col = 0; col < tiles.length; col++) {
                    pathObj.graph.push([]);
                    for(var row in tiles[col]) {
                        switch(Math.floor(tiles[col][row])) {
                            case 0:
                                mapInfo["Empty Spaces"]++;
                                pathObj.graph[col][row] = 0;
                                break;
                            case 1:
                                switch(tiles[col][row]) {
                                    case 1:
                                        mapInfo["Walls"]++;
                                        mapInfo["Walls (Square)"]++;
                                        pathObj.graph[col][row] = 0;
                                        break;
                                    default:
                                        mapInfo["Walls"]++;
                                        mapInfo["Walls (Diagonal)"]++;
                                        pathObj.graph[col][row] = 0;
                                        break;
                                }
                                break;
                            case 2:
                                mapInfo["Floor Tiles"]++;
                                pathObj.graph[col][row] = 1;
                                break;
                            case 3:
                                mapInfo["Flags (Red)"]++;
                                pathObj.graph[col][row] = 1;
                                pathObj.redFlag = {col: col, row: row};
                                break;
                            case 4:
                                mapInfo["Flags (Blue)"]++;
                                pathObj.graph[col][row] = 1;
                                pathObj.blueFlag = {col: col, row: row};
                                break;
                            case 5:
                                mapInfo["Speed Pads (Neutral)"]++;
                                mapInfo["Speed Pads (Total)"]++;
                                pathObj.graph[col][row] = 1;
                                break;
                            case 6:
                                mapInfo["Power-Ups"]++;
                                pathObj.graph[col][row] = 1;
                                break;
                            case 7:
                                mapInfo["Spikes"]++;
                                pathObj.graph[col][row] = 0;
                                break;
                            case 8:
                                mapInfo["Buttons"]++;
                                pathObj.graph[col][row] = 1;
                                break;
                            case 9:
                                pathObj.graph[col][row] = 1;
                                switch(tiles[col][row]) {
                                    case 9:
                                        mapInfo["Gates (Inactive)"]++;
                                        break;
                                    case 9.1:
                                        mapInfo["Gates (Green)"]++;
                                        break;
                                    case 9.2:
                                        mapInfo["Gates (Red)"]++;
                                        break;
                                    case 9.3:
                                        mapInfo["Gates (Blue)"]++;
                                        break;
                                }
                                break;
                            case 10:
                                mapInfo["Bombs"]++;
                                pathObj.graph[col][row] = 1;
                                break;
                            case 11:
                                mapInfo["Team Tiles (Red)"]++;
                                pathObj.graph[col][row] = 1;
                                break;
                            case 12:
                                mapInfo["Team Tiles (Blue)"]++;
                                pathObj.graph[col][row] = 1;
                                break;
                            case 13:
                                mapInfo["Portals"]++;
                                pathObj.graph[col][row] = 0;
                                break;
                            case 14:
                                mapInfo["Speed Pads (Red)"]++;
                                mapInfo["Speed Pads (Total)"]++;
                                pathObj.graph[col][row] = 1;
                                break;
                            case 15:
                                mapInfo["Speed Pads (Blue)"]++;
                                mapInfo["Speed Pads (Total)"]++;
                                pathObj.graph[col][row] = 1;
                                break;
                            case 16:
                                mapInfo["Flags (Yellow)"]++;
                                pathObj.graph[col][row] = 1;
                                break;
                            case 17:
                                mapInfo["Goal Tiles (Red)"]++;
                                pathObj.graph[col][row] = 1;
                                break;
                            case 18:
                                mapInfo["Goal Tiles (Blue)"]++;
                                pathObj.graph[col][row] = 1;
                                break;
                            case 19:
                                mapInfo["Potatoes (Red)"]++;
                                pathObj.graph[col][row] = 1;
                                break;
                            case 20:
                                mapInfo["Potatoes (Blue)"]++;
                                pathObj.graph[col][row] = 1;
                                break;
                            case 21:
                                mapInfo["Potatoes (Yellow)"]++;
                                pathObj.graph[col][row] = 1;
                                break;
                            case 22:
                                mapInfo["Gravity Wells"]++;
                                pathObj.graph[col][row] = 0;
                                break;
                        }
                    }
                }

                // determine % of tiles in map that aren't empty space
                mapInfo["Percent Not Empty"] = Math.round((1 - (mapInfo["Empty Spaces"] / (tiles.length * tiles[0].length))) * 10000) / 100 + '%';

                mapInfo["Adjusted Area"] = mapInfo["Total Area"] - mapInfo["Empty Spaces"];
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


                var mapInfoDiv = $('<div id=mapInfoDiv>');
                mapInfoDiv.append('<table><tbody id=mapInfoTableBody><tr><th>Tile<th>Number');
                document.body.appendChild(mapInfoDiv[0]);
                $('#mapInfoDiv').draggable();
                $('#mapInfoDiv').resizable();
                $('#mapInfoDiv').hide();
                var mapInfoTableBody = $('#mapInfoTableBody');
                for(var i in mapInfo) {
                    mapInfoTableBody.append('<tr><td>'+ i +'<td>'+ mapInfo[i]);
                }

                mapInfoDiv.append('<a id=saveMapInfoLink style="cursor:pointer">Save .csv')
                $('#saveMapInfoLink')[0].onclick = function() {
                    var mapInfoText = $('#mapInfoTableBody')[0].innerText;
                    var mapInfoTextCSV = mapInfoText.replace(/\t/g,',');
                    var blob = new Blob([mapInfoTextCSV], {type: "text/plain;charset=utf-8"});
                    saveAs(blob, $('#mapInfo').text().replace('Map: ','') + '.csv');
                }

                mapInfoDiv.css({"background-color" : "rgba(0, 0, 0, 0.5)",
                                "position" : "absolute",
                                "top" : $(document).height()/2 - mapInfoDiv.height()/2,
                                "left" : $(document).width()/2 - mapInfoDiv.width()/2,
                                "border" : "2px solid white"
                               });


                $('#sound').append($('<button id=showMapInfoButton>Show Map Info</button>'))
                $('#showMapInfoButton')[0].onclick = function() {
                    $('#mapInfoDiv').toggle();
                }
            });
        });

    });

    emit('ready','');
});