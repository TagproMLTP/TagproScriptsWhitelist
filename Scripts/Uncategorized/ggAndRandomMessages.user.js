// ==UserScript==
// @name       gg and random messages
// @version    0.2
// @include        http://tagpro-*.koalabeast.com:*
// @include        http://tangent.jukejuice.com:*
// @include        http://maptest*.newcompte.fr:*
// @author  ballparts
// ==/UserScript==

var messages = ['message1','message2','message3']; // add as many as you like 
 
tagpro.ready(function() {
    tagpro.socket.on('end', function() {
        tagpro.socket.emit("chat",{message:'gg',toAll:true})
        setTimeout(function() {
            tagpro.socket.emit("chat",{message:messages[Math.floor(Math.random() * messages.length)],toAll:true});
        }, 3000);
    });
});
