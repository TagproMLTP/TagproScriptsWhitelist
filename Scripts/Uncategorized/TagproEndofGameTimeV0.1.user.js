// ==UserScript==
// @name         TagPro End of Game Timer
// @version      0.1
// @description  Show how much time is left once a game ends until you're put back into the joiner
// @include		 http://tagpro-*.koalabeast.com:*
// @include		 http://tangent.jukejuice.com:*
// @include      http://*.newcompte.fr:*
// @author       Some Ball -1
// @grant        none
// ==/UserScript==

tagpro.ready(function() {
    tagpro.socket.on('end',function() {
        var timeleft = 20,
            timer = new PIXI.Text('20 seconds left',
                                  {
                                      font: "bold 48pt arial",
                                      fill: "#ffffff",
                                      stroke: "#000000",
                                      strokeThickness: 2
                                  });
        	timer.anchor.x = 0.5, timer.anchor.y = 0.5, timer.x = document.getElementById('viewport').width/2, timer.y = 75;
        tagpro.renderer.layers.ui.addChild(timer);
        setInterval(function() {
            timer.setText(--timeleft+' seconds left');
        },1000);
    });
});