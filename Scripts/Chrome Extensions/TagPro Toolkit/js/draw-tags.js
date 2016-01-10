function draw()
{
    function reallyDraw()
    {
        var oldFunc = tagpro.events.drawPlayer; //store the other scripts version
        if(oldFunc)
        {
            oldFunc = oldFunc[0].drawPlayer; //for some reason the actual function ends up in here
        }

        var image = new Image(); image.src = document.getElementById('spin-image').src;

        delete tagpro.events.drawPlayer;
        tagpro.events.register({
            drawPlayer: function(player, context, drawPos, TILESIZE) {
                context.save();
                if(!oldFunc) //in case there isn't another script draw it ourselves
                {
                    if(toolkit.tags.draw.spin==false){tagpro.tiles.drawWithZoom(context, player.team == 1 ? "redball" : "blueball", drawPos);}
                }
                //draw user tags
                if(tagpro.zoom===1 && toolkit.tags.draw.live==true && toolkit.tags.draw.on==true)
                {
                    tagpro.liveTags=true;
                    if(typeof usertags[tagpro.players[player.id].name]!=="undefined"){
                        var colordraw=usertags[tagpro.players[player.id].name].color;
                    }else{var colordraw="#FFFFFF";}
                    context.font = 'bold 8pt Arial';
                    context.fillStyle=colordraw;
                    context.strokeStyle="#000000";
                    context.shadowColor="#000000";
                    context.shadowOffsetX=0;
                    context.shadowOffsetY=0;
                    context.lineWidth=1;
                    context.shadowBlur=1;
                    for (i in toolkit.tags.draw.values)
                    {
                        var drawValues=toolkit.tags.draw.values[i].input.split(' ')
                        if(drawValues[0]=="usertags"){
                            if(drawValues[1]=="plusminus"){
                                if(tagpro.players[player.id].auth==true && typeof usertags[tagpro.players[player.id].name]!="undefined"){var addition='['+usertags[tagpro.players[player.id].name].plus.with+'/'+usertags[tagpro.players[player.id].name].plus.against+']';
                                                                                                                                        }else{var addition=''}
                            }else if (drawValues[1]=="averagepm"){
                                if(tagpro.players[player.id].auth==true && typeof usertags[tagpro.players[player.id].name]!="undefined"){
                                    var withpoints=Math.round(usertags[tagpro.players[player.id].name].plus.with/(1+usertags[tagpro.players[player.id].name].games.total));
                                    var againstpoints=Math.round(usertags[tagpro.players[player.id].name].plus.against/(1+usertags[tagpro.players[player.id].name].games.total));
                                    var addition='['+withpoints+'/'+againstpoints+']';
                                }else{var addition=''}
                            }
                        }
                        else{if(drawValues.length==1){ var addition=tagpro.players[player.id][drawValues[0]];}else if(drawValues.length==2){var addition='['+tagpro.players[player.id][drawValues[0]]+'/'+tagpro.players[player.id][drawValues[1]]+']'}
                            }
                        context.strokeText(addition, (drawPos.x+TILESIZE+toolkit.tags.draw.values[i].x*TILESIZE/2), (drawPos.y+toolkit.tags.draw.values[i].y*TILESIZE/5));
                        context.fillText(addition, (drawPos.x+TILESIZE+toolkit.tags.draw.values[i].x*TILESIZE/2), (drawPos.y+toolkit.tags.draw.values[i].y*TILESIZE/5));
                    }
                }
                if(!oldFunc) //in case there isn't another script, use default
                {
                    context.translate(drawPos.x + (TILESIZE / 2) * (1 / tagpro.zoom), drawPos.y + (TILESIZE / 2) * (1 / tagpro.zoom));
                    context.rotate(player.angle)
                    context.translate(-drawPos.x - (TILESIZE / 2) * (1 / tagpro.zoom), -drawPos.y - (TILESIZE / 2) * (1 / tagpro.zoom));

                    if(toolkit.tags.draw.spin!==false){tagpro.tiles.drawWithZoom(context, player.team == 1 ? "redball" : "blueball", drawPos);}
                    //draw balls
                    if(toolkit.tags.draw.border==true){
                        if (player.team == 1)
                            context.drawImage(image, 0 * 40, 0, 40, 40, drawPos.x, drawPos.y, 40 / tagpro.zoom, 40 / tagpro.zoom);
                        else
                            context.drawImage(image, 1 * 40, 0, 40, 40, drawPos.x, drawPos.y, 40 / tagpro.zoom, 40 / tagpro.zoom);
                        if (player.tagpro)
                            context.drawImage(image, 2 * 40, 0, 40, 40	, drawPos.x, drawPos.y, 40 / tagpro.zoom, 40 / tagpro.zoom);
                        else
                            context.drawImage(image, 4 * 40, 0, 40, 40	, drawPos.x, drawPos.y, 40 / tagpro.zoom, 40 / tagpro.zoom);
                        if (player.bomb && Math.round(Math.random() * 4) == 1) {
                            context.globalAlpha = .7;
                            context.drawImage(image, 3 * 40, 0, 40, 40	, drawPos.x, drawPos.y, 40 / tagpro.zoom, 40 / tagpro.zoom);
                            context.globalAlpha = 1;
                        }
                    }else{
                        if (player.bomb && Math.round(Math.random() * 4) == 1) {
                            context.fillStyle = "rgba(255, 255, 0, .50)";
                            context.beginPath();
                            context.arc(drawPos.x + (TILESIZE / 2) * (1 / tagpro.zoom), drawPos.y + (TILESIZE / 2) * (1 / tagpro.zoom), 20  * (1 / tagpro.zoom), 0, Math.PI*2, true);
                            context.closePath();
                            context.fill();
                        };

                        if (player.tagpro) {
                            context.strokeStyle = "#00FF00";
                            context.fillStyle = "rgba(0, 255, 0, .25)";
                            context.lineWidth = 3 * (1 / tagpro.zoom);
                            context.beginPath();
                            context.arc(drawPos.x + (TILESIZE / 2) * (1 / tagpro.zoom), drawPos.y + (TILESIZE / 2) * (1 / tagpro.zoom), 20  * (1 / tagpro.zoom), 0, Math.PI*2, true);
                            context.closePath();
                            if (!player.bomb)
                                context.fill();
                            context.stroke();
                        }
                    }
                }
                else
                {
                    oldFunc(player, context, drawPos, TILESIZE); //call the other script's function to finish drawing whatever is left
                }
                context.restore();
            }
        });
    }


    tagpro.ready(function(){

        setTimeout(reallyDraw,250); //wait to make sure other script has defined tagpro.events.drawPlayer
        if(toolkit.tags.draw.live==false && tagpro.liveTags!==true && toolkit.tags.draw.on==true) //got rid of the tagpro.events.drawPlayer if, because with the delay it was causing double stats to be drawn
        {
            tagpro.socket.on('p', function(data) { 
                try{
                    if (data.u !== undefined){
                        for (pID in tagpro.players){
                            if(tagpro.players[pID].pmdrawn!=true){
                                if(usertags[tagpro.players[pID].name]!=undefined && tagpro.players[pID].auth==true)
                                {
                                    var addition = '['+usertags[tagpro.players[pID].name].plus.with+'/'+usertags[tagpro.players[pID].name].plus.against+']';
                                    console.log(addition);
                                    tagpro.prettyText(addition, 50, 27, usertags[tagpro.players[pID].name].color, !1, !1, tagpro.players[pID].cache.context);
                                    tagpro.players[pID].pmdrawn=true;
                                }
                            }
                        }}
                }
                catch(err) {
                    console.log(err);
                }
            });
            return;
        }
    });
}
function run(){if(typeof usertags!="undefined" && typeof toolkit!="undefined" && typeof tagpro!="undefined"){draw();}else{setTimeout(run,100);}}
run()