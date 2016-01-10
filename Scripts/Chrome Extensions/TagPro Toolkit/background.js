chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	var versionNumber=chrome.app.getDetails().version;
	if(request.from === 'prefs'){
    if ((request.from === 'prefs') && (request.subject === 'profile')) {
		var newset=JSON.parse(request.settings);
		newset['version']=versionNumber;
         // Save it using the Chrome extension storage API.
        chrome.storage.sync.set({settings: newset}, function() {});
    }if ((request.from === 'prefs') && (request.subject === 'edittag')) {
		chrome.storage.local.get({usertags:[]}, function(data){
			//var testing = JSON.stringify(data);
			var test = data.usertags
			if (test[request.username]!=undefined){test[request.username].tag=request.newtag;test[request.username].color=request.newcolor;}else{test[request.username]={"plus":{"with": 0,"against": 0},"tag":request.newtag,"color":request.newcolor,"games":{"against":{"losses":0,"wins":0},"total":0,"with":{"losses":0,"wins":0}}};}
			chrome.storage.local.set({usertags: test}, function (tes) {});
		});
		
	}if ((request.from === 'prefs') && (request.subject === 'updatetags')) {
		if(request.utags!==undefined){
		var newvalue = JSON.parse(request.utags);
		chrome.storage.local.set({usertags: newvalue}, function (tes) {});
		}if(request.uscore!==undefined){
		var newhighscores = JSON.parse(request.uscore);
		chrome.storage.local.set({userhighscore: newhighscores}, function (tes) {});
		}if(request.serverscores!==undefined){
		var newserver  = JSON.parse(request.serverscores);
		chrome.storage.local.set({breakdownstats: newserver}, function (tes) {console.log(tes);});
		}
	}if ((request.from === 'prefs') && (request.subject === 'newscript')) {
		
	}
	}
	else {
		if (request.subject == "profile_id") {
		  chrome.storage.sync.get({settings:[]}, function(data) {
			  var defaultSet ={"leaderboards":{"plusminus":true},"profile":{"stats":true,"flairwins":true},"tags":{"collect":true,"nogroups":true,"draw":{"on":true,"live":true,"border":true,"spin":false,"values":[{"x":1,"y":1,"input":"usertags plusminus"}]}},"macros":{"enabled":true,"manual":{},"toggles":{},"switches":{},"auto":{"onEnd":{"enabled":true,"name":"Game's End","toSend":{"message":"gg","toAll":true}},"onJoin":{"enabled":false,"name":"Joining","toSend":{"message":"","toAll":true}},"onTeamCap":{"enabled":false,"name":"Team score","toSend":{"message":"","toAll":false}},"onWin":{"enabled":false,"name":"Win","toSend":{"message":"","toAll":false}},"onLoss":{"enabled":false,"name":"After a loss","toSend":{"message":"","toAll":false}}}}};
			  var newSet ={};
			  var update=false;
			  for(x in data.settings){newSet[x]=data.settings[x]};
			  var oldversion=data.settings.version;
			  if(data.settings.version==undefined || oldversion.split('.')[1]!==versionNumber.split('.')[1]){
				  chrome.tabs.create({
    				url: 'http://redd.it/2fmwjb'
 				 });
				 newSet['version']=versionNumber;
				 update=true;
				  }
			  for (x in defaultSet){if(newSet[x]==undefined){
				  newSet[x]=defaultSet[x];
				  update=true;
				  }
				  };
				for (x in defaultSet.macros.auto){if(newSet.macros.auto[x]==undefined){
				  newSet.macros.auto[x]=defaultSet.macros.auto[x];
				  update=true;
				  }
				  };
		if (update===true){chrome.storage.sync.set({settings: newSet}, function() {});}
		sendResponse(newSet);
		  });
      }else if (request.subject == "get_tags") {
		  chrome.storage.local.get({usertags:[]}, function(data){
				 if(data.usertags["TerraMaris"]!==undefined){sendResponse(data.usertags);
				 }else{
					 chrome.storage.local.set({usertags: {"Logic":{"plus":{"with":0,"against":0},"tag":"Logos","color":"#FFFFFF","games":{"against":{"losses":0,"wins":0},"total":0,"with":{"losses":0,"wins":0}}},"LuckySpammer":{"plus":{"with":0,"against":0},"tag":"TagPro Creator","color":"#FFFFFF","games":{"against":{"losses":0,"wins":0},"total":0,"with":{"losses":0,"wins":0}}},"time":{"plus":{"with":0,"against":0},"tag":":)","color":"#FFFFFF","games":{"against":{"losses":0,"wins":0},"total":0,"with":{"losses":0,"wins":0}}},"N i t r o":{"plus":{"with":0,"against":0},"tag":"Not N i r t o","color":"#FFFFFF","games":{"against":{"losses":0,"wins":0},"total":0,"with":{"losses":0,"wins":0}}},"TerraMaris":{"plus":{"with":0,"against":0},"tag":"TagPro Toolkit Creator","color":"#FFFFFF","games":{"against":{"losses":0,"wins":0},"total":0,"with":{"losses":0,"wins":0}}},"Micaso":{"plus":{"with":0,"against":0},"tag":"scrub(?)","color":"#FFFFFF","games":{"against":{"losses":0,"wins":0},"total":0,"with":{"losses":0,"wins":0}}}} }, function () {})};
					 sendResponse({"Logic":{"plus":{"with":0,"against":0},"tag":"","color":"#FFFFFF","games":{"against":{"losses":0,"wins":0},"total":0,"with":{"losses":0,"wins":0}}},"LuckySpammer":{"plus":{"with":0,"against":0},"tag":"TagPro Creator","color":"#FFFFFF","games":{"against":{"losses":0,"wins":0},"total":0,"with":{"losses":0,"wins":0}}},"time":{"plus":{"with":0,"against":0},"tag":":)","color":"#FFFFFF","games":{"against":{"losses":0,"wins":0},"total":0,"with":{"losses":0,"wins":0}}},"N i t r o":{"plus":{"with":0,"against":0},"tag":"","color":"#FFFFFF","games":{"against":{"losses":0,"wins":0},"total":0,"with":{"losses":0,"wins":0}}},"TerraMaris":{"plus":{"with":0,"against":0},"tag":"TagPro Toolkit Creator","color":"#FFFFFF","games":{"against":{"losses":0,"wins":0},"total":0,"with":{"losses":0,"wins":0}}},"Micaso":{"plus":{"with":0,"against":0},"tag":"","color":"#FFFFFF","games":{"against":{"losses":0,"wins":0},"total":0,"with":{"losses":0,"wins":0}}}});
			  });
	  }else if (request.subject == "get_high") {
		  chrome.storage.local.get({userhighscore:[]}, function(data){
			  if(data.userhighscore.lastreset!==undefined){sendResponse(data.userhighscore);
				 }else{
				 var defaultscores={"day":{"s-tags":{"value":0,"set":1404160479886},"s-pops":{"value":0,"set":1404160479886},"s-grabs":{"value":0,"set":1404160479886},"s-returns":{"value":0,"set":1404160479886},"s-captures":{"value":0,"set":1404160479886},"s-drops":{"value":0,"set":1404160479886},"s-support":{"value":0,"set":1404160479886},"s-hold":{"value":0,"set":1404160479886},"s-prevent":{"value":0,"set":1404160479886},"score":{"value":0,"set":1404160479886},"points":{"value":0,"set":1404160479886}},"week":{"s-tags":{"value":0,"set":1404160479886},"s-pops":{"value":0,"set":1404160479886},"s-grabs":{"value":0,"set":1404160479886},"s-returns":{"value":0,"set":1404160479886},"s-captures":{"value":0,"set":1404160479886},"s-drops":{"value":0,"set":1404160479886},"s-support":{"value":0,"set":1404160479886},"s-hold":{"value":0,"set":1404160479886},"s-prevent":{"value":0,"set":1404160479886},"score":{"value":0,"set":1404160479886},"points":{"value":0,"set":1404160479886}},"month":{"s-tags":{"value":0,"set":1404160479886},"s-pops":{"value":0,"set":1404160479886},"s-grabs":{"value":0,"set":1404160479886},"s-returns":{"value":0,"set":1404160479886},"s-captures":{"value":0,"set":1404160479886},"s-drops":{"value":0,"set":1404160479886},"s-support":{"value":0,"set":1404160479886},"s-hold":{"value":0,"set":1404160479886},"s-prevent":{"value":0,"set":1404160479886},"score":{"value":0,"set":1404160479886},"points":{"value":0,"set":1404160479886}},"lastreset":1404160479886,"all":{"s-tags":{"value":0,"set":1404160479886},"s-pops":{"value":0,"set":1404160479886},"s-grabs":{"value":0,"set":1404160479886},"s-returns":{"value":0,"set":1404160479886},"s-captures":{"value":0,"set":1404160479886},"s-drops":{"value":0,"set":1404160479886},"s-support":{"value":0,"set":1404160479886},"s-hold":{"value":0,"set":1404160479886},"s-prevent":{"value":0,"set":1404160479886},"score":{"value":0,"set":1404160479886},"points":{"value":0,"set":1404160479886}}};
				 chrome.storage.local.set({userhighscore: defaultscores}, function (tes) {});
				 sendResponse(defaultscores);
				 }
			  });
	  }else if (request.subject == "get_server_stats") {
		  chrome.storage.local.get({breakdownstats:[]}, function(data){
			  if(typeof data.breakdownstats.servers!=="undefined"){sendResponse(data.breakdownstats);
				 }else{
				 var defaultscores={"servers":{"pi":{"s-tags":0,"s-pops":0,"s-grabs":0,"s-returns":0,"s-captures":0,"s-drops":0,"s-support":0,"s-hold":0,"s-prevent":0,"score":0,"points":0,"games":0,"wins":0,"losses":0,"caps-for":0,"caps-against":0}},"maps":{"CFM by Flail":{"s-tags":0,"s-pops":0,"s-grabs":0,"s-returns":0,"s-captures":0,"s-drops":0,"s-support":0,"s-hold":0,"s-prevent":0,"score":0,"points":0,"games":0,"wins":0,"losses":0,"caps-for":0,"caps-against":0}}};
				 chrome.storage.local.set({breakdownstats: defaultscores}, function (tes) {});
				 sendResponse(defaultscores);
				 }
			  });
	  }
	  else {
        sendResponse({});
	  }
	}
	return true;
});