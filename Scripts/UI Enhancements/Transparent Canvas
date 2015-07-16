// ==UserScript==
// @name         Tagpro Transparent Canvas 3.0
// @namespace    http://www.reddit.com/user/newcompte/
// @author       NewCompte
// @include      http://tagpro-*.koalabeast.com:*
// ==/UserScript==

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
