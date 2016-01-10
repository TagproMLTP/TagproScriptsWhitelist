function macros() {

    function contentEval(source) {
        // Check for function input.
        if ('function' == typeof source) {
            // Execute this function with no arguments, by adding parentheses.
            // One set around the function, required for valid syntax, and a
            // second empty set calls the surrounded function.
            source = '(' + source + ')();'
        }

        // Create a script node holding this  source code.
        var script = document.createElement('script');
        script.setAttribute("type", "application/javascript");
        script.textContent = source;

        // Insert the script node into the page, so it will run, and immediately
        // remove it to clean up.
        document.body.appendChild(script);
        document.body.removeChild(script);
    }

    function actualScript() {
        var macros = {};
        for (x in toolkit.macros.manual){
            macros[x]=toolkit.macros.manual[x];
        }

        var  togglekeys={};
        for (i in toolkit.macros.toggles){for (x in toolkit.macros.toggles[i]){for(z in toolkit.macros.toggles[i]["keyvalues"]){togglekeys[z]={"value":toolkit.macros.toggles[i]["keyvalues"][z],"edits":i};}}};

        var toggledictionary={}
        for (i in toolkit.macros.toggles){toggledictionary[i]=toolkit.macros.toggles[i]["default"]}

        // Game bindings overriding adapted from JohnnyPopcorn's NeoMacro https://gist.github.com/JohnnyPopcorn/8150909
        var handlerbtn = $('#macrohandlerbutton');
        handlerbtn.keydown(keydownHandler)
        .keyup(keyupHandler);
        handlerbtn.focus();

        $(document).keydown(documentKeydown);
        function documentKeydown(event) {
            if (!tagpro.disableControls) {
                handlerbtn.focus(); // The handler button should be always focused
            }
        }

        function keydownHandler(event) {
            var code = event.keyCode || event.which;
            if (code in macros && !tagpro.disableControls) {
                sendMessage(macros[code]);
                event.preventDefault();
                event.stopPropagation();
                //console.log(macros[code]);
            }if (code in togglekeys && !tagpro.disableControls) {
                toggledictionary[togglekeys[code]["edits"]]=togglekeys[code]["value"];
                tagpro.prettyText(togglekeys[code]["value"],10,(document.getElementById('viewPort').height-100),null)
                event.preventDefault();
                event.stopPropagation(); 
            }
        }

        function keyupHandler(event) {
            if (event.keyCode in macros && !tagpro.disableControls) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
        function sendMessage(e){
            var newMessage=e.message;
            for (i in toggledictionary){
                var toggleTester= new RegExp("\{"+i+"\}");
                if (toggleTester.test(newMessage)){
                    console.log(i);
                    newMessage=newMessage.replace(toggleTester,toggledictionary[i]);
                }
            }
            if (newMessage.indexOf("{?}")>-1){
                newMessage=newMessage.split("{?}")[Math.floor(Math.random() * newMessage.split("{?}").length)];
            }
            if (newMessage.indexOf("{mypups}")>-1){
                var powerups={"grip":"Juke Juice","tagpro":"TagPro","bomb":"Rolling Bomb","speed":"Speed"};
                var activePups=[];
                for (x in powerups){if (tagpro.players[tagpro.playerId][x]==true){activePups.push(powerups[x]);}};
                if (activePups.length==0){activePups.push("no powerups");}
                newMessage=newMessage.replace("{mypups}",activePups.join('/'))};
            if (newMessage.indexOf("{viewopp}")>-1){
                var enemiesInView=0;
                for (x in tagpro.players){
                    if(tagpro.players[x].draw==true &&tagpro.players[x].team!=tagpro.players[tagpro.playerId].team){
                        enemiesInView+=1;}
                }newMessage=newMessage.replace("{viewopp}",enemiesInView);
            }
            if (newMessage.indexOf("{s")>-1){
                var currentSeconds=Math.round(((tagpro.gameEndsAt-new Date())/1000)%60);

                var allSecondKeycodes=newMessage.match("\{s.\\d{1,2}\}");
                if (newMessage.indexOf("+")>-1){
                    for ( var x = 0; x < allSecondKeycodes.length; x++ ) {
                        var futureSeconds=currentSeconds+parseInt(allSecondKeycodes[x].match("\\d{1,2}")[0]);
                        if (futureSeconds>=60){futureSeconds=futureSeconds-60;}
                        newMessage=newMessage.replace(allSecondKeycodes[x],futureSeconds);
                    }
                }else{newMessage=newMessage.replace("{s}",currentSeconds);}
            }
            if (newMessage.indexOf("{ping}")>-1){
                newMessage=newMessage.replace("{ping}",tagpro.ping.avg);
            }
            if (newMessage.indexOf("{myLocation}")>-1){
                var angle=Math.atan2(-(tagpro.players[tagpro.playerId].y-(40*tagpro.map[1].length/2)),(tagpro.players[tagpro.playerId].x-(40*tagpro.map.length/2)))/Math.PI;
                var accuracy=0.1;
                var newLocation=null;
                if(Math.abs(tagpro.players[tagpro.playerId].y-(40*tagpro.map[1].length/2))<(40*tagpro.map[1].length/4) && Math.abs(tagpro.players[tagpro.playerId].x-(40*tagpro.map.length/2))<(40*tagpro.map.length/4)){
                    newLocation="MIDDLE";
                }else{
                    if (angle<0){angle=2+angle;}
                    if(angle>=(0+accuracy) && angle<(0.5-accuracy)){
                        newLocation="TOP RIGHT";
                    }else if(angle>=(0.5-accuracy) && angle<(0.5+accuracy)){
                        newLocation="TOP";
                    }else if(angle>=(0.5+accuracy) && angle<(1-accuracy)){
                        newLocation="TOP LEFT";
                    }else if(angle>=(1-accuracy) && angle<(1+accuracy)){
                        newLocation="LEFT";
                    }else if(angle>=(1+accuracy) && angle<(1.5-accuracy)){
                        newLocation="BOTTOM LEFT";
                    }else if(angle>=(1.5-accuracy) && angle<(1.5+accuracy)){
                        newLocation="BOTTOM";
                    }else if(angle>=(1.5+accuracy) && angle<(2-accuracy)){
                        newLocation="BOTTOM RIGHT";
                    }else{
                        newLocation="RIGHT";
                    }
                }
                newMessage=newMessage.replace("{myLocation}",newLocation);
            }
            chat({"message":newMessage,"toAll":e.toAll})
        }

        var lastMessage = 0;
        var active = false;
        function chat(chatMessage) {
            var limit = 500 + 10;
            var now = new Date();
            var timeDiff = now - lastMessage;
            if (timeDiff > limit) {
                tagpro.socket.emit("chat", chatMessage);
                lastMessage = new Date();
            } else if (timeDiff >= 0 && !active) {
                active = true;
                setTimeout(function(chatMessage) { chat(chatMessage); active = false }, limit - timeDiff, chatMessage);
            }
        }

        function autoMacros(){
            var offsetTime=0;
            if (toolkit.macros.auto.onJoin.enabled==true){
                toolkit.macros.auto.onJoin.enabled=false;
                setTimeout(function(){sendMessage(toolkit.macros.auto.onJoin.toSend);},500);
            }if (toolkit.macros.auto.onEnd.enabled==true){
                tagpro.socket.on("end", function(e) {
                    try{
                        setTimeout(function(){sendMessage(toolkit.macros.auto.onEnd.toSend);},550);
                        offsetTime+=550;
                        if (e.winner=="red"){
                            if(tagpro.players[tagpro.playerId].team==1){
                                setTimeout(function(){sendMessage(toolkit.macros.auto.onWin.toSend);},550+offsetTime);
                            }else{
                                setTimeout(function(){sendMessage(toolkit.macros.auto.onLoss.toSend);},550+offsetTime);
                            }
                        }else if (e.winner=="blue"){
                            if(tagpro.players[tagpro.playerId].team==2){
                                setTimeout(function(){sendMessage(toolkit.macros.auto.onWin.toSend);},550+offsetTime);
                            }else{
                                setTimeout(function(){sendMessage(toolkit.macros.auto.onLoss.toSend);},550+offsetTime);
                            }
                        }
                    }
                    catch(err) {
                        console.log(err);
                    }
                });
            }
            tagpro.socket.on("sound", function(e) {
                try{
                    if (e.s=="cheering" && tagpro.score.r!=2 &&tagpro.score.b!=2){
                        sendMessage(toolkit.macros.auto.onTeamCap.toSend);
                    }
                }
                catch(err) {
                    console.log(err);
                }
            });
        };
        autoMacros()
    }


    // This dummy input will handle macro keypresses
    var btn = document.createElement("input");
    btn.style.opacity = 0;
    btn.style.position = "absolute";
    btn.style.top = "-100px";
    btn.style.left = "-100px";
    btn.id = "macrohandlerbutton";
    document.body.appendChild(btn);

    contentEval(actualScript);

};

function run(){if(typeof usertags!="undefined" && typeof toolkit!="undefined" && typeof tagpro!="undefined"){macros();}else{setTimeout(run,100);}}
run()