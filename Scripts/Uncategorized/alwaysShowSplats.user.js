// ==UserScript==
// @name          Always Show Splats
// @version       0.1
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// ==/UserScript==

tagpro.ready(function wait() {
    if(!tagpro.renderer) setTimeout(wait,10);
    var addSplat = tagpro.renderer.addSplat;
    tagpro.renderer.addSplat = function(team,x,y,fade) {
        addSplat(team,x,y,false);
    }
});