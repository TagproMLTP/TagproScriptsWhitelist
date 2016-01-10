// ==UserScript==
// @name Tagpro Transparent Canvas 3.0
// @namespace http://www.reddit.com/user/newcompte/
// @author NewCompte
// @include http://tagpro-*.koalabeast.com*
// @include http://tangent.jukejuice.com*
// @include http://tagpro-*.koalabeast.com/groups/*
// @include http://tangent.jukejuice.com/groups/*
// @include http://*.newcompte.fr:*
// ==/UserScript==

$('html').css({'background-image':'url(http://i.imgur.com/2P3Md72.jpg)'});

tagpro.ready(function () {
var oldCanvas = $(tagpro.renderer.canvas);
var newCanvas = $('<canvas id="viewport" width="1280" height="800"></canvas>');
oldCanvas.after(newCanvas);
oldCanvas.remove();
tagpro.renderer.canvas = newCanvas.get(0);
tagpro.renderer.options.transparent = true;
tagpro.renderer.renderer = tagpro.renderer.createRenderer();
tagpro.renderer.resizeAndCenterView();
newCanvas.show();
}); 