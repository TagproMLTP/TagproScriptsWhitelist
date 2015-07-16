// ==UserScript==
// @name         TagPro Replays Report Recorder
// @version      0.2
// @description  Automatically initiates the replays extension to record when you receive a report
// @include      http://tagpro-*.koalabeast.com:*
// @include      http://tangent.jukejuice.com:*
// @include      http://*.newcompte.fr:*
// @grant        none
// ==/UserScript==

tagpro.ready(function() {
    tagpro.socket.on('chat',function(data) {
        if(!data.from && data.message.match(/Someone has voted to kick you for/))
        {
            if($('#recordButton'))
            {
                setTimeout(function() { $('#recordButton').click(); }, 1000);
            }
        }
    });
});
