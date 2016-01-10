function tags(){
    Object.size = function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };

    function usertable(sortCol,ascending){
        if(document.getElementById("best-users")!==null){
            document.getElementById("best-users").remove();
        }
        var pmlist=document.createElement("tbody");
        pmlist.id="best-users";
        var userData=[], aggPM=0, withPM=0,againstPM=0,totalGames=0;
        for (x in usertags){
            totalGames=usertags[x].games.total;
            if(totalGames>0){
                aggPM=((usertags[x].plus.with+usertags[x].plus.against)/Math.pow(totalGames,0.5)).toFixed(2);
                withPM=(usertags[x].plus.with/Math.pow(totalGames,0.5)).toFixed(2);
                againstPM=(usertags[x].plus.against/Math.pow(totalGames,0.5)).toFixed(2);
                userData.push([x,aggPM,withPM,againstPM,totalGames,usertags[x].games.with.wins+usertags[x].games.with.losses,usertags[x].games.with.wins,usertags[x].games.with.losses,usertags[x].plus.with,usertags[x].games.against.wins+usertags[x].games.against.losses,usertags[x].games.against.wins,usertags[x].games.against.wins,usertags[x].plus.against]);
            }
        }
        userData.sort(function(a,b){return a[sortCol] - b[sortCol]});
        if (ascending!=="a"){
            userData.reverse();
        }
        var userTHlabels=["Users","Total","With","Against","Games","With","W","L","+-","Against","W","L","+-"]
        var userTableLabels=document.createElement("tr");
        for (z=0;z<userTHlabels.length;z++){
            var newCell=document.createElement("th");
            newCell.textContent=userTHlabels[z];
            if(ascending=="d"){
                newCell.id=z+"-a";
            }else{newCell.id=z+"-d";}
            newCell.onclick=function () {
                usertable(this.id.split('-')[0],this.id.split('-')[1]);
            };
            userTableLabels.appendChild(newCell);
        }
        pmlist.appendChild(userTableLabels);
        for(x in userData){if(x<50){
            var newRow=document.createElement('tr');
            for(i=0;i<userData[x].length;i++){
                var newCell=document.createElement('td');
                newCell.textContent=userData[x][i];
                newRow.appendChild(newCell);
            }
            pmlist.appendChild(newRow);
        }
                          }
        document.getElementById("best-table").appendChild(pmlist);
    }

    if(document.getElementById('showSettings')!==null){
        var userTable = document.createElement('table');
        userTable.className="board smaller";
        userTable.id="best-table";
        userTable.style.display="none";
        userTable.style.marginTop="0px";
        $('table.board:last-of-type').before(userTable);
        usertable(1,"d");
        if(Object.size(usertags)>10){
            $('#stats-buttons').append('<button id="best-button">Best Users</button>');
        }
        $('#stats-buttons').append('<button id="total-button">Totals</button><button id="map-button">By Map</button><button id="server-button">By Server</button>');



        var bestmaps=[];
        var scoreAtt = ['games','wins','losses','caps-for','caps-against','s-tags', 's-pops', 's-grabs', 's-returns', 's-captures','s-drops', 's-support', 's-hold', 's-prevent', 'score', 'points','played'];
        for (x in serverstats.maps){var mapdata=[];mapdata.push(x);for(z in scoreAtt){mapdata.push(serverstats.maps[x][scoreAtt[z]])};bestmaps.push(mapdata);};
        bestmaps.sort(function(a,b){return a[1] - b[1]});
        bestmaps.reverse();

        var pmlist = document.createElement('table');
        pmlist.className="board smaller";
        pmlist.id="maps-table";
        pmlist.style.display="none";
        pmlist.style.marginTop="0px";
        pmlist.innerHTML='<tr><th>Maps</th><th>Games</th><th>Wins</th><th>Losses</th><th>%</th><th title="Caps For">CF</th><th title="Caps Against">CA</th><th>Tags</th><th>Pops</th><th>Returns</th><th>Caps</th><th>Seconds / Game</th></tr>';
        for(x in bestmaps){
            var newline = document.createElement('tr');var tableList=[1,2,3,4,5,6,7,9,10];
            for(z in bestmaps[x]){
                for(y in tableList){
                    if (tableList[y]==z){
                        var newcell = document.createElement('td');
                        newcell.textContent=bestmaps[x][z];
                        newline.appendChild(newcell);
                        if (z==3){
                            var newcell = document.createElement('td');
                            newcell.textContent=Math.round(100*bestmaps[x][2]/bestmaps[x][1]);
                            newcell.className="alt";
                            newline.appendChild(newcell);
                        }
                    }
                }if(z==0){
                    var newcell = document.createElement('th');
                    newcell.textContent=bestmaps[x][z].split(" by ")[0];
                    newline.appendChild(newcell);
                }
            }
            var newcell = document.createElement('td');
            newcell.textContent=Math.round(bestmaps[x][17]/bestmaps[x][1])
            newline.appendChild(newcell);
            pmlist.appendChild(newline);}
        pmlist.innerHTML+="</table>";
        $('table.board:last-of-type').before(pmlist);
        var bestmaps=[];
        var scoreAtt = ['games','wins','losses','caps-for','caps-against','s-tags', 's-pops', 's-grabs', 's-returns', 's-captures','s-drops', 's-support', 's-hold', 's-prevent', 'score', 'points','played'];
        for (x in serverstats.servers){var mapdata=[];mapdata.push(x);for(z in scoreAtt){mapdata.push(serverstats.servers[x][scoreAtt[z]])};bestmaps.push(mapdata);};
        bestmaps.sort(function(a,b){return a[1] - b[1]});
        bestmaps.reverse();

        var pmlist = document.createElement('table');
        pmlist.className="board smaller";
        pmlist.id="server-table";
        pmlist.style.display="none";
        pmlist.style.marginTop="0px";
        pmlist.innerHTML="<tr><th>Maps</th><th>Games</th><th>Wins</th><th>Losses</th><th>Caps for</th><th>Caps Against</th><th>Tags</th><th>Pops</th><th>Returns</th><th>Caps</th></tr>";
        for(x in bestmaps){
            var newline = document.createElement('tr');var tableList=[1,2,3,4,5,6,7,9,10];
            for(z in bestmaps[x]){
                for(y in tableList){
                    if (tableList[y]==z){
                        var newcell = document.createElement('td');
                        newcell.textContent=bestmaps[x][z];
                        newline.appendChild(newcell);
                    }}if(z==0){
                        var newcell = document.createElement('th');
                        newcell.textContent=bestmaps[x][z];
                        newline.appendChild(newcell);
                    }
            }pmlist.appendChild(newline);}
        pmlist.innerHTML+="</table>";
        $('table.board:last-of-type').before(pmlist);

    }

    $(document).on('click','#best-button',function(){
        $('table.board.smaller').hide();
        $('#best-table').show();
    });
    $(document).on('click','#worst-button',function(){
        $('table.board.smaller').hide();
        $('#worst-table').show();
    });

    $(document).on('click','#map-button',function(){
        $('table.board.smaller').hide();
        $('#maps-table').show();
    });

    $(document).on('click','#server-button',function(){
        $('table.board.smaller').hide();
        $('#server-table').show();
    });
}

function runtags() {if(typeof usertags==='undefined' || typeof serverstats === 'undefined'){
    setTimeout(runtags,100);
}else{
    tags()
}
                   }

runtags();