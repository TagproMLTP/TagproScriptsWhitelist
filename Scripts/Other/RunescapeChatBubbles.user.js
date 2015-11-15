// ==UserScript==
// @name          Runescape Chat Bubbles
// @description   add BUBBLES ABOVE UR BALLS
// @version       1
// @grant         none
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// @author        Lej
// @namespace     http://www.reddit.com/user/Lej
// @license       2015
// ==/UserScript==

var secondsToShowMessage = 3;
tagpro.ready(function e(){function r(){requestAnimationFrame(r);for(var e in tagpro.players)Date.now()-tagpro.players[e].messageTime<1e3*secondsToShowMessage&&!tagpro.players[e].bubble?(tagpro.players[e].sprites.bubble=new PIXI.Sprite(bubbleSprite),tagpro.players[e].sprites.bubble.x=-28,tagpro.players[e].sprites.bubble.y=5,tagpro.players[e].sprites.bubbleText=new PIXI.Text(tagpro.players[e].lastMessage,{font:"12px Helvetica",align:"left"}),tagpro.players[e].sprites.bubbleText.x=22,tagpro.players[e].sprites.bubbleText.y=14,tagpro.players[e].sprites.bubbleText.anchor.set(.5,.5),tagpro.players[e].sprites.ball.addChild(tagpro.players[e].sprites.bubble),tagpro.players[e].sprites.ball.addChild(tagpro.players[e].sprites.bubbleText),tagpro.players[e].bubble=!0):tagpro.players[e].bubble&&Date.now()-tagpro.players[e].messageTime>=1e3*secondsToShowMessage&&s(tagpro.players[e])}function s(e){e.sprites.ball.removeChild(e.sprites.bubble),e.sprites.ball.removeChild(e.sprites.bubbleText),e.sprites.bubble=null,e.sprites.bubbleText=null,e.bubble=!1}return tagpro.playerId?(bubbleSprite=PIXI.Texture.fromImage("http://i.imgur.com/Sp4NgZ1.png"),tagpro.socket.on("chat",function(e){console.log(e);for(var r in tagpro.players)tagpro.players[r].id==e.from&&tagpro.players[r].draw&&!tagpro.players[r].dead&&(e.message.length>12&&(e.message=jQuery.trim(e.message).substring(0,12).slice(0,-1)+"..."),tagpro.players[r].lastMessage=e.message,tagpro.players[r].messageTime=Date.now(),s(tagpro.players[r]))}),void requestAnimationFrame(r)):setTimeout(e,100)});