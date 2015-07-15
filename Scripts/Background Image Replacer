// ==UserScript==
// @name		    TagPro Background Image Replacer
// @version		    0.1.0
// @description		Replaces the background image.
// @include		    http://tagpro-*.koalabeast.com:*
// @include		    http://tangent.jukejuice.com:*
// @include		    http://*.newcompte.fr:*
// @author		    AnkhMorpork
// ==/UserScript==

var imgUrl = "http://i.imgur.com/iCPoVew.jpg";  // The image URL
var transparent = false;  						 // Should the canvas be transparent?
var hideBorder = false;							 // Should the border be hidden?

$(document).ready(function () {
GM_addStyle (
    "html.background { background: #000000 "
    + "url('"+imgUrl+"')"
    + " no-repeat fixed center; }"
);
    if (hideBorder) {
    	$("#viewportDiv")[0].style.border = "10px solid rgba(0,0,0,0)";
    }
})

tagpro.ready(function () {
    tagpro.renderer.options.transparent = transparent;
});
