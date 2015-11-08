// ==UserScript==
// @name          Tagpro Transparent Canvas + Background Changer
// @namespace     http://www.reddit.com/user/newcompte/
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// @author        NewCompte, Ruud, Arbybear

// ==/UserScript==

// Set this to false if you don't want a transparent viewport. If you chose an "outside" border, an opaque viewport will cover the border.
var transparent = true;

// Replace the url here either with one of the others below, or your own background.
$('html').css({'background-image':'url(https://i.imgur.com/aXMSkv7.png)'});

/* Default background http://tagpro-radius.koalabeast.com/images/background.jpg

       "Under" borders. If you are in the middle of a large map, you won't be able to see the border.

              White percentage of border, opacity percentage, url.

              100, 100, https://i.imgur.com/Ay6V7Ki.png
              75, 100, https://i.imgur.com/T4q3UtX.png
              65, 100, https://i.imgur.com/wPN0vzj.png
              50, 100, https://i.imgur.com/Ur9n2g3.png
              75, 40, https://i.imgur.com/aXMSkv7.png - default

       "Outside" borders. You can always see the border.

              White percentage of border, opacity percentage, url.

              100, 100, https://i.imgur.com/Gzw7ddR.png
              75, 100, https://i.imgur.com/4nz0M7u.png
              65, 100, https://i.imgur.com/AgXJ6Vm.png
              50, 100, https://i.imgur.com/DH47d8I.png
              75, 40, https://i.imgur.com/Dc54EPV.png

_____________________________________________Don't change anything past here!_________________________________________*/

tagpro.ready(function () {
   var oldCanvas = $(tagpro.renderer.canvas);
   var newCanvas = $('<canvas id="viewport" width="1280" height="800"></canvas>');
   oldCanvas.after(newCanvas);
   oldCanvas.remove();
   tagpro.renderer.canvas = newCanvas.get(0);
   tagpro.renderer.options.transparent = transparent;
   tagpro.renderer.renderer = tagpro.renderer.createRenderer();
   tagpro.renderer.resizeAndCenterView();
   newCanvas.show();
});