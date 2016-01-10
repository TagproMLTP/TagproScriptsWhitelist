// ==UserScript==
// @name           TagPro Milliseconds
// @version        2.2.3
// @description    Display tenths of seconds on the tagpro clock and add outlines to the score
// @include        http://tagpro-*.koalabeast.com:*
// @author         Some Ball -1
// @grant          none
// ==/UserScript==

tagpro.ready(function() {
    
    var startTime = 60; //time in seconds to begin showing fractional seconds, set to 0 to turn off
    var scoreStroke = true; //true or false, whether or not to show score outline
    //////////////////////////////////////////////////////////////////////////

    var end = false;
    function outlineScore()
    {
        if(tagpro.renderer.layers.ui.children.length>1) //timer put in first so >1
        {
            tagpro.renderer.layers.ui.removeChild(tagpro.ui.sprites.redScore)
            tagpro.renderer.layers.ui.removeChild(tagpro.ui.sprites.blueScore)
        }
        tagpro.ui.sprites.redScore = new PIXI.Text(tagpro.score.r ? tagpro.score.r.toString() : "0", {
            fill: "#FF0000",
            stroke: "black",
            strokeThickness: scoreStroke*3,
            font: "bold 40pt Arial"
        }), tagpro.ui.sprites.blueScore = new PIXI.Text(tagpro.score.b ? tagpro.score.b.toString() : "0", {
            fill: "#0000FF",
            stroke: "black",
            strokeThickness: scoreStroke*3,
            font: "bold 40pt Arial"
        });
        tagpro.ui.sprites.redScore.alpha = .5, tagpro.ui.sprites.blueScore.alpha = .5, tagpro.ui.sprites.redScore.anchor.x = 1, tagpro.ui.sprites.blueScore.anchor.x = 0, tagpro.renderer.layers.ui.addChild(tagpro.ui.sprites.redScore), tagpro.renderer.layers.ui.addChild(tagpro.ui.sprites.blueScore);
    }
    if(!tagpro.renderer.layers.ui)
    {
        var lay = tagpro.renderer.createLayers;
        tagpro.renderer.createLayers = function() {
            lay();
            outlineScore();
        }
    }
    else
    {
        outlineScore();
    }
    tagpro.socket.on('end',function() {
        end = (new Date).getTime();
    })
    tagpro.ui.timer = function(e, t, n, r) { //replace r with custom time
        var i = tagpro.ui.sprites.timer;
        if(!i)
        {
            i = tagpro.ui.sprites.timer = new PIXI.Text("", {
                fill: "#FFFFFF",
                strokeThickness: 4,
                stroke: "#000000",
                font: "bold 30pt Arial"
            }), i.alpha = .5, i.anchor.x = .5, e.addChild(tagpro.ui.sprites.timer);
        }
        
        var time = tagpro.gameEndsAt - (end || (new Date).getTime()), //use current time or whenever game ended
            hour = time/6e4 > 60 ? Math.floor(time / 6e4 / 60) + ":" : "", //if more than 60 min, add hour
            min = "0" + Math.floor((time / 6e4) % 60),
            sec = "0" + Math.floor(time % 6e4 / 1e3); //needs to be Math.ceil on newcompte's server for pre-game (tagpro.state===3), idk why
        if(min < 0) min = "00"; if(sec < 0) sec = "00";
        
        var clock = hour + min.substr(-2) + ":" + sec.substr(-2); //should match r argument except if >60 min
        if(time/1000<startTime) //not <= incase set to 0
        {
            sec = "0" + Math.floor(time % 6e4 / 1e2)/10 + ".0"; //add .0 in case it's whole number;
            clock = hour + min.substr(-2) + ":" + sec.substr(Math.ceil((sec.length-7)/2)*-2-6,4); //quick formula to handle either (0X.0 || 0XX.0) or (0X.X.0 || 0XX.X.0)
            if(time<=0)
                clock = '00:00.0'; //because the clock keeps running sometimes
        }
        if (i.text != clock)
            i.setText(clock);
    }
});