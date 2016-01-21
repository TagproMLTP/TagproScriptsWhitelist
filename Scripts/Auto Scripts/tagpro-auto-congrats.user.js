// ==UserScript==
// @name         TagPro Auto Congrats
// @version      0.1
// @description  Automatically congratulates users when they earn a degree.
// @include      http://*.koalabeast.com:*
// @include      http://*.jukejuice.com:*
// @include      http://*.newcompte.fr:*
// @grant        none
// ==/UserScript==

tagpro.ready(function() {
    if (!tagpro.playerId) return setTimeout(arguments.callee);
    var names = [];
    tagpro.socket.on('chat', function(e) {
        if (e.from === null) {
            names.push(e.message.match(/^.+(?= has reached)/));
        }
    });
    tagpro.socket.on('end', function() {
        setTimeout(function() {
            var i = 0;
            names.forEach(function(name) {
                if (name) {
                    setTimeout(sendGrats, i * 1000, name);
                    i++;
                }
            });
        }, 1000);
    });
    
    function sendGrats(name) {
        tagpro.socket.emit('chat', { message: 'Congrats ' + name + '!', toAll: true });
    }
});
