function updatescorecashe(){
	scorecashe.red=tagpro.score.r;
	scorecashe.blue=tagpro.score.b;
}

function addtags(){
	for (pID in tagpro.players){
		if(usertags[tagpro.players[pID].name]==undefined && tagpro.players[pID].auth==true){
			usertags[tagpro.players[pID].name]={"plus":{"with": 0,"against": 0},"tag":"","games":{"against":{"losses":0,"wins":0},"total":0,"with":{"losses":0,"wins":0}},"color":"#FFFFFF"};
		}
	}
}

function updatepm(){
	if(tagpro.spectator!==false){
		return;
	}
	var oldc = document.getElementById('usertags-log');
	if(oldc!=null){oldc.remove();}
	var container = document.createElement('div');
	container.id="usertags-log";
	container.textContent=JSON.stringify(usertags);
	document.head.appendChild(container);
	var plteam = tagpro.players[tagpro.playerId].team;
	if(	toolkit.tags.collect==true && tagpro.group.socket==null || toolkit.tags.nogroups==false){
		if(tagpro.state==1){
			if(typeof tagpro.players[tagpro.playerId]['played']!=="undefined"){tagpro.players[tagpro.playerId]['played']+=1;}else{tagpro.players[tagpro.playerId]['played']=0;}
		}
		if(scorecashe.red!==tagpro.score.r){
			scorecashe.red=tagpro.score.r;
			for (pID in tagpro.players){
				if(usertags[tagpro.players[pID].name]!==undefined && tagpro.players[pID].auth==true){
					if(plteam==tagpro.players[pID].team){
						if(plteam==1){
							usertags[tagpro.players[pID].name].plus.with+=1;
						}else{
							usertags[tagpro.players[pID].name].plus.with-=1;
						}
					}else{
						if(plteam==1){
							usertags[tagpro.players[pID].name].plus.against-=1;
						}else{
							usertags[tagpro.players[pID].name].plus.against+=1;
						}
					}
				}
			}
		}
		if(scorecashe.blue!==tagpro.score.b){
			scorecashe.blue=tagpro.score.b;
			for (pID in tagpro.players){
				if(usertags[tagpro.players[pID].name]!==undefined && tagpro.players[pID].auth==true){
					if(plteam==tagpro.players[pID].team){
						if(plteam==2){
							usertags[tagpro.players[pID].name].plus.with+=+1;
						}else{
							usertags[tagpro.players[pID].name].plus.with+=-1;
						}
					}else{
						if(plteam==2){
							usertags[tagpro.players[pID].name].plus.against+=-1;
						}else{
							usertags[tagpro.players[pID].name].plus.against+=1;
						}
					}
				}
			}
		}

		var pnum=0;
		for(x in tagpro.players){pnum+=1}
		if(pnum>4 && tagpro.players[tagpro.playerId]['played']>30){
			var server=tagpro.host.split('.')[0].split('-')[1];
			var map=document.getElementById('mapInfo').textContent;
			map=map.replace("Map: ","");
			if(server==null){server="test"}
			var scoreAtt = ['s-tags', 's-pops', 's-grabs', 's-returns', 's-captures','s-drops', 's-support', 's-hold', 's-prevent', 'score', 'points','played'];
			if(tagpro.state!==2){
				if(typeof serverstats.servers[server]=="undefined"){serverstats.servers[server]={};for(x in scoreAtt){serverstats.servers[server][scoreAtt[x]]=0;serverstats.servers[server]['games']=0;serverstats.servers[server]['wins']=0;serverstats.servers[server]['losses']=0;serverstats.servers[server]['caps-for']=0;serverstats.servers[server]['caps-against']=0;}};
				if(typeof serverstats.maps[map]=="undefined"){serverstats.maps[map]={};for(x in scoreAtt){serverstats.maps[map][scoreAtt[x]]=0;serverstats.maps[map]['games']=0;serverstats.maps[map]['wins']=0;serverstats.maps[map]['losses']=0;serverstats.maps[map]['caps-for']=0;serverstats.maps[map]['caps-against']=0;}};
				toolkit.updateserverstats=true;}
			if(tagpro.state==2){
				var plteam = tagpro.players[tagpro.playerId].team;
				for (pID in tagpro.players){
					if(usertags[tagpro.players[pID].name]!==undefined && tagpro.players[pID].auth==true && tagpro.players[pID].gameupdate!=true){
						usertags[tagpro.players[pID].name].games.total+=1;
						tagpro.players[pID].gameupdate=true;
						if(tagpro.score.r>tagpro.score.b){
							if(plteam==tagpro.players[pID].team){
								if(plteam==1){
									usertags[tagpro.players[pID].name].games.with.wins+=+1;
								}else{
									usertags[tagpro.players[pID].name].games.with.losses+=+1;
								}
							}else{
								if(plteam==1){
									usertags[tagpro.players[pID].name].games.against.losses+=+1;
								}else{
									usertags[tagpro.players[pID].name].games.against.wins+=+1;
								}
							}
						}else if(tagpro.score.r>tagpro.score.b){
							if(plteam==tagpro.players[pID].team){
								if(plteam==2){
									usertags[tagpro.players[pID].name].games.with.wins+=+1;
								}else{
									usertags[tagpro.players[pID].name].games.with.losses+=+1;
								}
							}else{
								if(plteam==2){
									usertags[tagpro.players[pID].name].games.against.losses+=+1;
								}else{
									usertags[tagpro.players[pID].name].games.against.wins+=+1;
								}
							}
						}
					}
				}
				if(toolkit.updateserverstats==true){
					toolkit.updateserverstats=false;
					serverstats.servers[server]['games']+=1;
					serverstats.maps[map]['games']+=1;
					var plteam = tagpro.players[tagpro.playerId].team;
					if(tagpro.score.r>tagpro.score.b){
						if(plteam==1){
							serverstats.servers[server]['wins']+=1;
							serverstats.servers[server]['losses']+=0;
							serverstats.maps[map]['wins']+=1;
							serverstats.maps[map]['losses']+=0;
						}else{
							serverstats.servers[server]['wins']+=0;
							serverstats.servers[server]['losses']+=1;
							serverstats.maps[map]['wins']+=0;
							serverstats.maps[map]['losses']+=1;
						}
					}else if(tagpro.score.r<tagpro.score.b){
						if(plteam==1){
							serverstats.servers[server]['wins']+=0;
							serverstats.servers[server]['losses']+=1;
							serverstats.maps[map]['wins']+=0;
							serverstats.maps[map]['losses']+=1;
						}else{
							serverstats.servers[server]['wins']+=1;
							serverstats.servers[server]['losses']+=0;
							serverstats.maps[map]['wins']+=1;
							serverstats.maps[map]['losses']+=0;
						}
					}
					if(plteam==1){
						serverstats.servers[server]['caps-for']+=tagpro.score.r;
						serverstats.servers[server]['caps-against']+=tagpro.score.b;
						serverstats.maps[map]['caps-for']+=tagpro.score.r;
						serverstats.maps[map]['caps-against']+=tagpro.score.b;
					}else{
						serverstats.servers[server]['caps-for']+=tagpro.score.b;
						serverstats.servers[server]['caps-against']+=tagpro.score.r;
						serverstats.maps[map]['caps-for']+=tagpro.score.b;
						serverstats.maps[map]['caps-against']+=tagpro.score.r;
					}
					for(x in scoreAtt){
						serverstats.servers[server][scoreAtt[x]]+=tagpro.players[tagpro.playerId][scoreAtt[x]];
						serverstats.maps[map][scoreAtt[x]]+=tagpro.players[tagpro.playerId][scoreAtt[x]];
					} 
				}
				var oldc = document.getElementById('serverscore-log');
				if(oldc!=null){oldc.remove();}

				var servercont = document.createElement('div');
				servercont.id='serverscore-log';
				servercont.textContent=JSON.stringify(serverstats);
				document.head.appendChild(servercont);
				scoreAtt = ['s-tags', 's-pops', 's-grabs', 's-returns', 's-captures','s-drops', 's-support', 's-hold', 's-prevent', 'score', 'points'];
				var newhighscores = {};
				var timeNow = Date.now()-10800000;
				timeNow= new Date(timeNow);
				for (x in scoreAtt){newhighscores[scoreAtt[x]]=tagpro.players[tagpro.playerId][scoreAtt[x]];
									var oldscore = highscores;
									if(oldscore.day!==undefined){
										var oldTime = new Date(oldscore.lastreset);
										if(oldTime.getUTCDay()!==timeNow.getUTCDay()){
											oldscore.lastreset=timeNow;
											for (x in scoreAtt){oldscore.day[scoreAtt[x]]={"value":0,"set":timeNow};}
											if(timeNow.getUTCDay()==1){
												for (x in scoreAtt){oldscore.week[scoreAtt[x]]={"value":0,"set":timeNow};}
											}
										}
										if(oldTime.getUTCMonth()!==timeNow.getUTCMonth()){
											for (x in scoreAtt){oldscore.month[scoreAtt[x]]={"value":0,"set":timeNow};}
										}
										for (x in scoreAtt){
											if(newhighscores[scoreAtt[x]]>oldscore.day[scoreAtt[x]].value){
												oldscore.day[scoreAtt[x]].value=newhighscores[scoreAtt[x]];
												oldscore.day[scoreAtt[x]].set=timeNow;
											}
											if(newhighscores[scoreAtt[x]]>oldscore.week[scoreAtt[x]].value){
												oldscore.week[scoreAtt[x]].value=newhighscores[scoreAtt[x]];
												oldscore.week[scoreAtt[x]].set=timeNow;
											}
											if(newhighscores[scoreAtt[x]]>oldscore.month[scoreAtt[x]].value){
												oldscore.month[scoreAtt[x]].value=newhighscores[scoreAtt[x]];
												oldscore.month[scoreAtt[x]].set=timeNow;
											}
											if(newhighscores[scoreAtt[x]]>oldscore.all[scoreAtt[x]].value){
												oldscore.all[scoreAtt[x]].value=newhighscores[scoreAtt[x]];
												oldscore.all[scoreAtt[x]].set=timeNow;
											}
										}
									}else{
										var oldscore = {};
										oldscore.day={};
										oldscore.week={};
										oldscore.month={};
										oldscore.all={};
										for (x in scoreAtt){oldscore.day[scoreAtt[x]]={"value":newhighscores[scoreAtt[x]],"set":timeNow};}
										for (x in scoreAtt){oldscore.week[scoreAtt[x]]={"value":newhighscores[scoreAtt[x]],"set":timeNow};}
										for (x in scoreAtt){oldscore.month[scoreAtt[x]]={"value":newhighscores[scoreAtt[x]],"set":timeNow};}
										for (x in scoreAtt){oldscore.all[scoreAtt[x]]={"value":newhighscores[scoreAtt[x]],"set":timeNow};}
										oldscore.lastreset=timeNow;
									}
								   }
				var oldc = document.getElementById('userscore-log');
				if(oldc!=null){oldc.remove();}
				var highcontainer = document.createElement('div');
				highcontainer.id="userscore-log";
				highcontainer.textContent=JSON.stringify(oldscore);
				document.head.appendChild(highcontainer);
			}}
	}
}

setTimeout(updatescorecashe,1000);
setInterval(updatepm,1000);
setInterval(addtags,10000);
function run(){if(typeof usertags!="undefined"){addtags();}else{setTimeout(run,100);}}
run();