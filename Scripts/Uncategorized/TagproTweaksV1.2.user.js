// ==UserScript==
// @name         Tagpro Tweaks
// @version      1.2
// @description  Small tweaks for tagpro
// @author       Despair
// @include      http://*.koalabeast.com:*
// @include      http://*.jukejuice.com:*
// @include      http://*.newcompte.fr:*
// @grant        none
// ==/UserScript==

var tkSwitchButton = true,// button to switch teams
    tkReservedButton = true,// button to set name to reserved
    tkNarrowViewport = true,// make viewport border 1 px wide
    tkHideDonate = true,// hide the donation button
    tkOutlineScore = true,// adds an outline to the team scores
    tkShowMapName = true,// show map name before game starts
    tkHideMouse = true,// hide the mouse when not in use
    tkGoSoundJoin = true;// play go sound when you join a game in progress

var reservedName = "NAME HERE",// your reserved name
    mouseTimeDefault = 2500,// time(ms) after last movement to hide mouse
    hideButtonOnLeave = true,// hide switch button when mouse not on it
    mouseTime = 0;// keeps track of time since mouse moved - counts down

// call functions after startup
setTimeout(function(){
	startup()
},1000);

function startup(){
    tweakSwitchButton()
    tweakReservedButton()
    tweakViewPort()
    tweakHideDonate()
    tweakOutlineScore()
    tweakGoSound()
    mouseTime = mouseTimeDefault
}

//button to switch teams
function tweakSwitchButton(){
    if(tkSwitchButton){
        var button = document.createElement('button');
        button.value = "Switch Teams";
        button.innerHTML = "Switch Teams";
        button.onclick=switchTeams;
        if(hideButtonOnLeave){button.style.opacity=0}
        button.onmouseover= function(){button.style.cursor="pointer",button.style.opacity=1;}
        button.onmouseleave= function(){if(hideButtonOnLeave){button.style.opacity=0;}}
        document.getElementById("sound").appendChild(button);
    }
}

function switchTeams(){tagpro.socket.emit("switch")}

//button to set name as reserved
function tweakReservedButton(){
    if(tkReservedButton){
        var button = document.createElement('button');
        button.value = "Reserved Name";
        button.innerHTML = "Reserved Name";
        button.onclick=setName;
        button.onmouseover= function(){button.style.cursor="pointer";}
        document.getElementById("optionsName").appendChild(button);
    }
}

function setName(){tagpro.socket.emit("name", reservedName.substring(0,12));}

// Makes the viewport border smaller
function tweakViewPort(){
    if(tkNarrowViewport){document.getElementById('viewPortDiv').style.border = '1px solid white'}
}

// Hide the donation button
function tweakHideDonate(){
    if(tkHideDonate){document.getElementById("donate").style.bottom = "-100px"}
}

// Outline scores
function tweakOutlineScore(){
    if(tkOutlineScore){
        tagpro.ui.scores = function(e,t,n){
            var r="",i="";
            e.save(),e.textAlign="right",e.fillStyle="rgba(255, 0, 0, .5)",e.strokeStyle="black",e.lineWidth=2,e.font="bold 40pt Arial";
            if(tagpro.settings.ui.teamNames==="always"||tagpro.settings.ui.teamNames==="spectating"&&tagpro.spectator)tagpro.teamNames.redTeamName!=="Red"&&(r=tagpro.teamNames.redTeamName+" - "),tagpro.teamNames.blueTeamName!=="Blue"&&(i=" - "+tagpro.teamNames.blueTeamName);
            e.strokeText(r+tagpro.score.r,t.x-80,n.height-50),e.fillText(r+tagpro.score.r,t.x-80,n.height-50),e.lineWidth=2,e.textAlign="left",e.fillStyle="rgba(0, 0, 255, .5)",e.strokeText(tagpro.score.b+i,t.x+80,n.height-50),e.fillText(tagpro.score.b+i,t.x+80,n.height-50),e.restore()
        }
    }
}

//get map name
setTimeout(function(){
    mapInfo = $("#mapInfo").text()
    end = mapInfo.indexOf(" by ")
    mapName = mapInfo.substr(5,end-5)
},900)
 
//hide 'game starting soon...' alert so that you can see the map
setTimeout(function(){
    tagpro.ui.largeAlert = function (e,t,n,r,i){
        if (r == "Match Begins Soon..."){
            if(tkShowMapName){r=mapName}
            else{r=""}
        }
        e.save(),e.textAlign="center",e.lineWidth=2,e.font="bold 48pt Arial",e.fillStyle=i||"#ffffff",e.strokeStyle="#000000",e.fillText(r,t.x,100),e.strokeText(r,t.x,100),e.restore
    }
},1000)

//hide idle mouse
mouseMoveTimer = setInterval(function(){
    mouseHider();
},100);

var isMouseHidden = false;// if mouse is currently hidden
function mouseHider(){
    if(tkHideMouse){
        mouseTime = mouseTime - 100
        if(mouseTime > 0 && isMouseHidden){
            document.body.style.cursor = 'auto';
            isMouseHidden = false
        }else if(mouseTime < 0 && !isMouseHidden){
            document.body.style.cursor = 'none';
            isMouseHidden = true
        }
    }
}

window.onmousemove = mouseMoved;
function mouseMoved(){
    mouseTime = mouseTimeDefault
}

//play go sound
var goSound = new Audio("http://tagpro-origin.koalabeast.com/sounds/go.mp3");
function tweakGoSound(){
    if(tkGoSoundJoin && tagpro.state == 1 && !tagpro.spectator){goSound.play()}
}