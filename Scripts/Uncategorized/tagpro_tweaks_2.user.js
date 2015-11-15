// ==UserScript==
// @name         Tagpro Tweaks 2
// @version      1.0
// @description  Small tweaks for tagpro
// @author       Despair
// @include      http://*.koalabeast.com:*
// @include      http://*.jukejuice.com:*
// @include      http://*.newcompte.fr:*
// ==/UserScript==

var tweaks = {};

// - ### TWEAKS SETTINGS ### - //

// - button under sound icons to switch teams
tweaks.switchButton = true;
tweaks.switchButtonText = 'Switch Teams';
tweaks.switchButtonOpacity = 0.33;

// - button under scoreboard to switch name to preset
tweaks.nameButton = true;
tweaks.nameButtonText = 'Reserved';
tweaks.nameButtonName = 'NAME HERE';

// - change score text properties
tweaks.scoreText = true; // - false to disable change
tweaks.scoreTextOutline = true;
tweaks.scoreTextRed = 'rgba(255, 0, 0, 0.5)';
tweaks.scoreTextBlue = 'rgba(0, 64, 255, 0.5)';

// - change large alert properties (team win message)
tweaks.alertText = true; // - false to disable change
tweaks.alertTextRed = 'rgba(255, 0, 0, 0.8)';
tweaks.alertTextBlue = 'rgba(0, 64, 255, 0.8)';
tweaks.alertTextDefault = 'rgba(255, 255, 255, 1)';

// - show map name at start of game
tweaks.showMapName = true;

// - refresh chat position on resize (fix for some scripts locking chat position)
tweaks.chatPosition = true;
tweaks.chatEdge = false;// - far bottom-left instead of in viewport

// - disable rightclick menu (i right-click alot :/)
tweaks.disableContextMenu = false;

// - hide mouse when not moved
// - ### may not work consistently with drag/drop texture loaders
tweaks.hideIdleMouse = true;
tweaks.hideMouseTimeout = 3500;

// - place scoreboard on top of chat (stops chat from overlapping name box)
tweaks.scoreboardFix = true;

// - cleanup scoreboard (hide ad and share links - switch team on same line)
tweaks.hideAd = true;
tweaks.hideSharing = true;
tweaks.moveSwitchUp = true;

// - ### END OF SETTINGS ### - //

var resizeId, mouseTime = 0, isHidden = false, pls = {};

// call functions after startup
tagpro.ready(function(){
    
    tweakSwitchButton();
    tweakNameButton();
    tweakScoreText();
    tweakLargealert();
    tweakFixScoreboard();
    tweakHideMouse();
    tweakCleanScoreboard();
    tweakRightClick();
    tweakChatPosition();
    
});

function tweakSwitchButton(){
    if(tweaks.switchButton){
        var button = document.createElement('button');
        button.innerHTML = tweaks.switchButtonText;
        button.onclick = function(){tagpro.socket.emit('switch');};
        button.style.opacity = tweaks.switchButtonOpacity;
        button.style.cursor = 'pointer';
        button.onmouseover = function(){
            button.style.opacity = 1;
        };
        button.onmouseleave = function(){
            button.style.opacity = tweaks.switchButtonOpacity;
        };
        document.getElementById('sound').appendChild(button);
        
        var relocate = function(count){
            var hasRecord = !!document.getElementById('recordButton');
            if(hasRecord){
                button.style.position = 'absolute';
                button.style.right = '0px';
                button.style.bottom = '-100px';
            }else if(count < 5){
                count++;
                setTimeout(function(){relocate(count);}, 500);
            }
            else console.log('replay extention not detected');
        };
        
        relocate(0);
        
    }
}

function tweakNameButton(){
    if(tweaks.nameButton){
        var button = document.createElement('button');
        button.innerHTML = tweaks.nameButtonText;
        button.style.cursor = 'pointer';
        button.onclick = function(){
            tagpro.socket.emit('name', tweaks.nameButtonName.substring(0,12));
        };
        document.getElementById('optionsName').appendChild(button);
    }
}

function tweakScoreText(){
    if(tweaks.scoreText){
        tagpro.ui.scores = function (){
            var redText = tagpro.score.r ? tagpro.score.r.toString() : '0';
            var blueText = tagpro.score.b ? tagpro.score.b.toString() : '0';
            var showTeamNames = tagpro.settings.ui.teamNames=='always'||tagpro.settings.ui.teamNames=='spectating'&&tagpro.spectator==1;
            if(showTeamNames){
                if(tagpro.teamNames.redTeamName!=='Red') redText = tagpro.teamNames.redTeamName+' - '+redText;
                if(tagpro.teamNames.blueTeamName!=='Blue') blueText = blueText+' - '+tagpro.teamNames.blueTeamName;
            }
            if(tagpro.ui.sprites.redScore){
                tagpro.ui.sprites.redScore.text != redText && tagpro.ui.sprites.redScore.setText(redText);
                tagpro.ui.sprites.blueScore.text != blueText && tagpro.ui.sprites.blueScore.setText(blueText);
            }else{
                var ST = tweaks.scoreTextOutline ? 2 : 0;
                tagpro.ui.sprites.redScore = new PIXI.Text(redText, {fill: tweaks.scoreTextRed, stroke: '#000000', strokeThickness: ST, font: 'bold 40pt Arial'});
                tagpro.ui.sprites.blueScore = new PIXI.Text(blueText, {fill: tweaks.scoreTextBlue, stroke: '#000000', strokeThickness: ST, font: 'bold 40pt Arial'});
                tagpro.ui.sprites.redScore.anchor.x = 1; tagpro.ui.sprites.blueScore.anchor.x = 0;
                tagpro.renderer.layers.ui.addChild(tagpro.ui.sprites.redScore);
                tagpro.renderer.layers.ui.addChild(tagpro.ui.sprites.blueScore);
            }
        };
    }
}

function tweakLargealert(){
    if(tweaks.alertText || tweaks.showMapName){
        tagpro.renderer.largeText = function(text, color){
            var Default = '#ffffff';
            if(tweaks.alertText){
                if(color == '#ff0000' || color == '#FF0000'){
                    color = tweaks.alertTextRed;
                }else if(color == '#0000ff' || color == '#0000FF'){
                    color = tweaks.alertTextBlue;
                }
                Default = tweaks.alertTextDefault;
            }
            if(tweaks.showMapName){
                if(text == 'Match Begins Soon...'){text = getMapName();}
            }
            return new PIXI.Text(text,{
                font: 'bold 48pt arial',
                fill: color || Default,
                stroke: '#000000',
                strokeThickness: 2
            });
        };
    }
}

function getMapName(){
    var mapInfo = $('#mapInfo').text(), mapName, end;
    end = mapInfo.indexOf(' by ');
    mapName = mapInfo.substr(5,end-5);
    return mapName;
}

function tweakFixScoreboard(){
    if(tweaks.scoreboardFix){
        setTimeout(function(){
            document.getElementById('options').style.zIndex = '10';
        }, 2500);
    }
}

function tweakCleanScoreboard(){
    if(tweaks.hideAd){
        var ad = document.getElementById('optionsAd');
        ad.style.position = 'absolute'; ad.style.bottom = '-2500px';
    }
    if(tweaks.hideSharing){
        document.getElementById('optionsLinks').style.display = 'none';
    }
    if(tweaks.moveSwitchUp){
        document.getElementById('name').parentElement.appendChild(document.getElementById('switchButton'));
        document.getElementById('switchButton').style.marginLeft = '25px';
    }
}

function tweakChatPosition(){
    if(tweaks.chatPosition || tweaks.chatEdge){
        
        var chat = document.getElementById('chat'),
            history = document.getElementById('chatHistory');
        
        var reposition = function(){
            var screenHeight = window.innerHeight, xPos,
                viewportXPos = document.getElementById('viewport').style.left,
                chatbarHeight = chat.clientHeight || 21,
                historyHeight = history.clientHeight;
            viewportXPos = Number(viewportXPos.substring(0, viewportXPos.length-2));
            xPos = (tweaks.chatEdge) ? 10 : viewportXPos+10;
            chat.style.left = xPos+'px'; history.style.left = xPos+'px'; 
            chat.style.top = screenHeight-chatbarHeight - 15 + 'px';
            history.style.top = screenHeight-historyHeight-chatbarHeight - 20 + 'px';
        };
        
        if(tweaks.chatPosition) pls.reposChat = reposition;
        setTimeout(function(){reposition();}, 1500);
        
    }
}

function tweakHideMouse(){
    if(tweaks.hideIdleMouse){
        setInterval(function(){
            mouseHider();
        },250);
        var moved = function(){
            document.body.style.cursor = 'auto';
            isHidden = false; mouseTime = 0;
        };
        window.onmousemove = moved;
    }
}

function mouseHider(){
    mouseTime += 250;
    if(mouseTime >= tweaks.hideMouseTimeout && !isHidden){
        document.body.style.cursor = 'none';
        isHidden = true;
    }
}

function tweakRightClick(){
    if(tweaks.disableContextMenu){
        window.oncontextmenu = function(){return false;};
    }
}

$(window).on('resize', function(){
    clearTimeout(resizeId);
    resizeId = setTimeout(doneResizing, 500);
});

function doneResizing(){
    if(pls.reposChat) pls.reposChat();
}