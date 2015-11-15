// ==UserScript==
// @name          TagPro Googly Eyes
// @description   Adds dem fancy Googly eyes
// @version       1
// @grant         none
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// @license       2015
// @author        Indieveloper
// @downloadURL   http://phrysm.com/tp/googly.user.js
// ==/UserScript==

tagpro.ready(function () {
    var eyeWhite = PIXI.Texture.fromImage('http://i.imgur.com/kVglZMc.png');
    var eyeBlack = PIXI.Texture.fromImage('http://i.imgur.com/tm8z2fX.png');
    
    //Steal body object from the getPosition function for velocity use later
    Box2D.Dynamics.b2Body.prototype.GetPosition = function() {
        var player = tagpro.players[this.player.id];
        player.body = player.body || this;
        return this.m_xf.position;
    };
    
    tagpro.renderer.createEyes = function(player) {
        
        if (!player.offsetSpeeds) {
            player.offsetSpeeds = [0,0,0,0];
            player.offsetPosition = [0,0,0,0];
            player.prevVel = [0,0];
        }
        
        if (!player.sprites.eyeL) {
            player.sprites.eyeL = new PIXI.Sprite(eyeWhite);
            player.sprites.eyeL.anchor.x = 0.5;
            player.sprites.eyeL.anchor.y = 0.5;
            player.sprites.eyeL.x = 12;
            player.sprites.eyeL.y = 16;
            player.sprites.eyeL.tileId = player.sprites.ball.tileId;
            player.sprites.ball.addChild(player.sprites.eyeL);
        }
        if (!player.sprites.eyeR) {
            player.sprites.eyeR = new PIXI.Sprite(eyeWhite);
            player.sprites.eyeR.anchor.x = 0.5;
            player.sprites.eyeR.anchor.y = 0.5;
            player.sprites.eyeR.x = 40-12;
            player.sprites.eyeR.y = 16;
            player.sprites.eyeR.tileId = player.sprites.ball.tileId;
            player.sprites.ball.addChild(player.sprites.eyeR);
        }
        if (!player.sprites.pipL) {
            player.sprites.pipL = new PIXI.Sprite(eyeBlack);
            player.sprites.pipL.anchor.x = 0.5;
            player.sprites.pipL.anchor.y = 0.5;
            player.sprites.pipL.x = 20;
            player.sprites.pipL.y = 20;
            player.sprites.pipL.tileId = player.sprites.ball.tileId;
            player.sprites.ball.addChild(player.sprites.pipL);
        }
        if (!player.sprites.pipR) {
            player.sprites.pipR = new PIXI.Sprite(eyeBlack);
            player.sprites.pipR.anchor.x = 0.5;
            player.sprites.pipR.anchor.y = 0.5;
            player.sprites.pipR.x = 20;
            player.sprites.pipR.y = 20;
            player.sprites.pipR.tileId = player.sprites.ball.tileId;
            player.sprites.ball.addChild(player.sprites.pipR);
        }
    };
    
    var upsp = tagpro.renderer.updatePlayerSpritePosition;
    tagpro.renderer.updatePlayerSpritePosition = function(player) {
        if (!player.sprites.eye || !player.offsetPosition || !player.offsetSpeeds || player.sprites.actualBall.tileId !== player.sprites.eye.tileId) tagpro.renderer.createEyes(player);
        
        var velocity = {x:Math.random(), y:Math.random()};
        
        var bounce = 0.9;
        
        player.offsetSpeeds[0] -= (velocity.x-player.prevVel[0])/3.0;
        player.offsetSpeeds[1] -= (velocity.y-player.prevVel[1])/3.0;
        player.offsetSpeeds[2] -= (velocity.x-player.prevVel[0])/3.0;
        player.offsetSpeeds[3] -= (velocity.y-player.prevVel[1])/3.0;
        
        player.prevVel[0] = velocity.x;
        player.prevVel[1] = velocity.y;
        
        var sL = Math.sqrt(player.offsetSpeeds[0]*player.offsetSpeeds[0]+player.offsetSpeeds[1]*player.offsetSpeeds[1]);
        if(sL==0){
            player.offsetSpeeds[0] = 0;
            player.offsetSpeeds[1] = 0;
        }
        var sR = Math.sqrt(player.offsetSpeeds[0]*player.offsetSpeeds[0]+player.offsetSpeeds[1]*player.offsetSpeeds[1]);
        if(sR==0){
            player.offsetSpeeds[2] = 0;
            player.offsetSpeeds[3] = 0;
        }
        
        var rx,ry;
        rx = 0;
        ry = 0;
        
        player.offsetPosition[0] += player.offsetSpeeds[0];
        player.offsetPosition[1] += player.offsetSpeeds[1];
        player.offsetPosition[2] += player.offsetSpeeds[2];
        player.offsetPosition[3] += player.offsetSpeeds[3];
        
        if(player.grip){
            player.offsetPosition[0] = 2*(Math.random()*2-1);
            player.offsetPosition[1] = 2*(Math.random()*2-1);
            player.offsetPosition[2] = 2*(Math.random()*2-1);
            player.offsetPosition[3] = 2*(Math.random()*2-1);
        }
        if(player.tagpro){
            player.sprites.pipR.alpha = 0.2;
            player.sprites.pipL.alpha = 0.2;
        }
        else{
            player.sprites.pipR.alpha = 1;
            player.sprites.pipL.alpha = 1;  
        }
        
        var dL = Math.sqrt(player.offsetPosition[0]*player.offsetPosition[0]+player.offsetPosition[1]*player.offsetPosition[1]);
        if(dL==0){
            player.offsetPosition[0] = 0;
            player.offsetPosition[1] = 0;
        }
        else if(dL>4){
            if(Math.random()<0.01){
                rx = -0.2+0.4*Math.random();
                ry = -0.2+0.4*Math.random();
            }
            player.offsetSpeeds[0] = -player.offsetSpeeds[0]*bounce+rx;
            player.offsetSpeeds[1] = -player.offsetSpeeds[1]*bounce+ry;
            player.offsetPosition[0] = player.offsetPosition[0]/dL*4;
            player.offsetPosition[1] = player.offsetPosition[1]/dL*4;
        }
        var dR = Math.sqrt(player.offsetPosition[2]*player.offsetPosition[2]+player.offsetPosition[3]*player.offsetPosition[3]);
        if(dR==0){
            player.offsetPosition[2] = 0;
            player.offsetPosition[3] = 0;
        }
        else if(dR>4){
            if(Math.random()<0.01){
                rx = -0.2+0.4*Math.random();
                ry = -0.2+0.4*Math.random();
            }
            player.offsetSpeeds[2] = -player.offsetSpeeds[2]*bounce+rx;
            player.offsetSpeeds[3] = -player.offsetSpeeds[3]*bounce+ry;
            player.offsetPosition[2] = player.offsetPosition[2]/dR*4;
            player.offsetPosition[3] = player.offsetPosition[3]/dR*4;
        }
        
        player.sprites.pipL.x = player.sprites.eyeL.x+player.offsetPosition[0];
        player.sprites.pipL.y = player.sprites.eyeL.y+player.offsetPosition[1];
        player.sprites.pipR.x = player.sprites.eyeR.x+player.offsetPosition[2];
        player.sprites.pipR.y = player.sprites.eyeR.y+player.offsetPosition[3];
        
        var sca = 1.0;
        
        var players = tagpro.players;
        var playerArr = [];
        for (var prop in players) {
            playerArr.push(players[prop]);
        }
        var closest = 9999;
        for(var i=0;i<playerArr.length;i++){
            if(playerArr[i].team != player.team){
                if(playerArr[i]!=player && !playerArr[i].dead){
                    var p1 = player;
                    var p2 = playerArr[i];
                    var distance = Math.sqrt((p2.x-p1.x)*(p2.x-p1.x)+(p2.y-p1.y)*(p2.y-p1.y));
                    if(distance<closest && distance < 120){
                        closest = distance;
                    }
                }
            }
        }
        if(closest != 9999){
            sca = 0.5+0.5*((closest-40.0)/80.0);
        }
        if(player.bomb){
            sca = 0.3;
        }
        
        player.sprites.pipL.scale.x = sca;
        player.sprites.pipL.scale.y = sca;
        player.sprites.pipR.scale.x = sca;
        player.sprites.pipR.scale.y = sca;
        upsp(player);
    };
});