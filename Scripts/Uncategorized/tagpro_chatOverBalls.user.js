// ==UserScript==
// @name          Runescape Chat Bubbles
// @description   add BUBBLES ABOVE UR BALLS
// @version       2
// @grant         none
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// @author        Lej
// @namespace     http://www.reddit.com/user/Lej
// @license       2015
// ==/UserScript==


var secondsToShowMessage = 2.5;
var maxCharacters = 25;
var cleanUpChats = true;

function addMessage(fromId, message, toId) {
    var randomizeColor = false;
    removeMessage(fromId, true);
    tagpro.players[fromId].lastMessageTime = Date.now();

    if (message.length > maxCharacters) {
        message = jQuery.trim(message).substring(0, maxCharacters).slice(0, -1) + '...';
    }

    if ('team' == toId) {
        if (1 == tagpro.players[fromId].team) {
            fillColor = '#ffd0d0';
        } else if (2 == tagpro.players[fromId].team) {
            fillColor = '#d0d0ff';
        }
    } else {
        fillColor = 'white';
    }

    if ('@gre@' == message.substring(0, 5)) {
        fillColor = '#92f3a0';
        message = message.slice(5);
    } else if ('@cya@' == message.substring(0, 5)) {
        fillColor = '#92f3f0';
        message = message.slice(5);
    } else if ('@mag@' == message.substring(0, 5)) {
        fillColor = '#f292f3';
        message = message.slice(5);
    } else if ('@ora@' == message.substring(0, 5)) {
        fillColor = '#f3d492';
        message = message.slice(5);
    } else if ('@ran@' == message.substring(0, 5)) {
        fillColor = randomColor();
        randomizeColor = true;
        message = message.slice(5);
    }

    tagpro.players[fromId].sprites.bubbleText = new PIXI.Text(message, {
        font: 'Bold 16px Helvetica',
        fill: fillColor,
        strokeThickness: 3,
        stroke: 'black'
    });

    tagpro.players[fromId].sprites.bubbleText.x = 20;
    tagpro.players[fromId].sprites.bubbleText.y = 18;
    tagpro.players[fromId].sprites.bubbleText.anchor.set(0.5, 0.5);
    tagpro.players[fromId].sprites.ball.addChild(tagpro.players[fromId].sprites.bubbleText);
    tagpro.players[fromId].thisI = 0;

    if(randomizeColor) {
        tagpro.players[fromId].doRandom = true;
        tagpro.players[fromId].randomizeColors = randomizeColors;
        tagpro.players[fromId].randomizeColors();
    }
    setTimeout(function() {
        removeMessage(fromId);
    }, 1000 * secondsToShowMessage);
}


function removeMessage(playerId, deleteNow) {
    if (Date.now() - tagpro.players[playerId].lastMessageTime >= 1000 * secondsToShowMessage || deleteNow) {
        tagpro.players[playerId].sprites.ball.removeChild(tagpro.players[playerId].sprites.bubbleText);
        tagpro.players[playerId].doRandom = false;
    }
}

function removeGameChat(chatMessage) {
    var gameChats = jQuery('#chatHistory').children();
    gameChats.each(function(chatIndex, gameChat) {
        var gameChatName = jQuery(gameChat).find('.name').text(),
            gameChatMessage = jQuery(gameChat).find('.message').text(),
            chatMessageName = tagpro.players[chatMessage.from].name;
        if(gameChatName === chatMessageName && gameChatMessage === chatMessage.message) {
            gameChat.remove();
        }
    });
}

function randomColor() {
    var colors = ['#ffd0d0', '#d0d0ff', '#92f3a0', '#92f3f0', '#f292f3', '#f3d492'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function randomizeColors() {
    if(this.doRandom) {
        requestAnimationFrame(this.randomizeColors.bind(this));
    }
    this.thisI += 1;
    if(this.thisI % 20 === 0) {
        var style = this.sprites.bubbleText.style;
        style.fill = randomColor();
        this.sprites.bubbleText.setStyle(style);
    }
};

tagpro.ready(function() {
    tagpro.socket.on("chat", function(e) {
        if (e.from) {
            if(tagpro.players[e.from].draw && cleanUpChats) {
                removeGameChat(e);
            }
            addMessage(e.from, e.message, e.to);
        }
    })
});