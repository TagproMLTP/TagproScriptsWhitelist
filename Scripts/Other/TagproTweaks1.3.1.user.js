// ==UserScript==
// @name         Tagpro Tweaks 1.3.1
// @version      1.3.1
// @description  Small tweaks for tagpro
// @author       Despair
// @include      http://*.koalabeast.com:*
// @include      http://*.jukejuice.com:*
// @include      http://*.newcompte.fr:*
// @grant        none
// ==/UserScript==
 
// Enable/Disable tweaks
var tkSwitchButton = true,// button to switch teams
    tkReservedButton = true,// button to set name to reserved
    //tkNarrowViewport = false,// make viewport border 1 px wide - BROKEN -
    tkHideAd = false,// hide scoreboard ad
    tkOutlineScore = true,// adds an outline to the team scores
    tkShowMapName = true,// show map name before game starts
    tkHideMouse = true,// hide the mouse when not in use
    tkDisableRClick = false;// disables the right click menu
 
// Settings
var reservedName = "NAME HERE",// your reserved name
    moveSwitch = false,// move switch teams button lower
    switchOpacity = 0.35,// make switch button transparent when mouse not on it
    mouseTimeDefault = 3000;// time(ms) after last movement to hide mouse
   
// Variables
var mouseTime = 0,// keeps track of time since mouse moved - counts down
    isMouseHidden = false;// if mouse is currently hidden
 
// call functions after startup
tagpro.ready(function(){
    replaceStartMsg();
    setTimeout(function(){
            startup();
    },1000);
});
 
function startup(){
    tweakSwitchButton();
    tweakReservedButton();
    //tweakViewPort();
    tweakHideAd();
    tweakOutlineScore();
    tweakRightClick();
    mouseTime = mouseTimeDefault;
}
 
//button to switch teams
function tweakSwitchButton(){
    if(tkSwitchButton){
        var button = document.createElement('button');
        button.innerHTML = "Switch Team";
        button.onclick=switchTeams;
        button.style.opacity=switchOpacity;
        button.onmouseover= function(){button.style.cursor="pointer";button.style.opacity=1;};
        button.onmouseleave= function(){button.style.opacity=switchOpacity;};
        document.getElementById("sound").appendChild(button);
        if(moveSwitch){
            button.style.position = "absolute";
            button.style.right = "0px";
            button.style.bottom = "-100px";
        }
    }
}
 
function switchTeams(){tagpro.socket.emit("switch");}
 
//button to set name as reserved
function tweakReservedButton(){
    if(tkReservedButton){
        var button = document.createElement('button');
        button.innerHTML = "Reserved";
        button.onclick=setName;
        button.onmouseover= function(){button.style.cursor="pointer";};
        document.getElementById("optionsName").appendChild(button);
    }
}
 
function setName(){tagpro.socket.emit("name", reservedName.substring(0,12));}
 
/*
// Makes the viewport border smaller
function tweakViewPort(){
    if(tkNarrowViewport){document.getElementById('viewPortDiv').style.border = '1px solid white';}
}
*/
 
// Hide scoreboard ad
function tweakHideAd(){
    if(tkHideAd){
        var ad = document.getElementById("optionsAd");
        ad.style.position = "absolute"; ad.style.bottom = "-500px";
    }
}
 
// Outline scores
function tweakOutlineScore(){
    if(tkOutlineScore){
        outlineLoop = setInterval(function(){
            checkUI();// check if window is in focus
        },1000);
    }
}
 
function checkUI(){
    if(tagpro.ui.sprites.redScore.alpha !== undefined){
        clearInterval(outlineLoop);
        changeUI();
    }
}
 
function changeUI(){
    var redScoreCache = tagpro.score.r, blueScoreCache = tagpro.score.b;
    var redText = tagpro.ui.sprites.redScore,
        blueText = tagpro.ui.sprites.blueScore;
    redText.alpha = 1; blueText.alpha = 1;
    redText.style.fill = "rgba(255, 0, 0, .5)"; redText.style.strokeThickness = 2;
    blueText.style.fill = "rgba(0, 0, 255, .5)"; blueText.style.strokeThickness = 2;
    tagpro.score.r = "-"; tagpro.score.b = "-";// force scores to update
    setTimeout(function(){
            tagpro.score.r = redScoreCache; tagpro.score.b = blueScoreCache;
    },1000);
}
 
//get map name
function getMapName(){
    var mapInfo = $("#mapInfo").text(), mapName, end;
    end = mapInfo.indexOf(" by ");
    mapName = mapInfo.substr(5,end-5);
    return mapName;
}
 
function replaceStartMsg(){
    tagpro.ui.largeAlert = function (e,t,n,r,i){
        if(tkShowMapName){
            if(r == "Match Begins Soon..."){r = getMapName();}
        }
        var s=tagpro.renderer.largeText(r,i);
        return s.x=Math.round(t.x-s.width/2),s.y=100,e.addChild(s),s;
    };
}
 
//hide idle mouse
mouseMoveTimer = setInterval(function(){
    mouseHider();
},500);
 
function mouseHider(){
    if(tkHideMouse){
        mouseTime = mouseTime - 500;
        if(mouseTime > 0 && isMouseHidden){
            document.body.style.cursor = 'auto';
            isMouseHidden = false;
        }else if(mouseTime <= 0 && !isMouseHidden){
            document.body.style.cursor = 'none';
            isMouseHidden = true;
        }
    }
}
 
window.onmousemove = mouseMoved;
function mouseMoved(){mouseTime = mouseTimeDefault;}
 
function tweakRightClick(){
    if(tkDisableRClick){
        window.oncontextmenu = function(){return false;};
    }
}