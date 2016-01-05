// ==UserScript==
// @name          Specatator Mode
// @namespace     http://reddit.com/u/samwilber
// @description   Never accidentally join a game again
// @include       http://tangent.jukejuice.com*
// @include       http://tagpro-*.koalabeast.com*
// @author        turtlemansam and help from bizkut's script
// @version       1.2
// @grant         GM_getValue
// @grant         GM_setValue
// ==/UserScript==

$(document).ready(function(){
    if(document.URL.endsWith(".com/") === true || document.URL.endsWith("/?spectator=true") === true ) {
        $('article div.section.smaller:eq(0)').append("<input type='checkbox' id='tglSpec'>Spectator Mode</input>");
        $('#optionsName').append("<input type='checkbox' id='tglSpec'>Spectator Mode</input>");
    }
    if (GM_getValue("specMode") === true) {
        $("#tglSpec").prop('checked', true);
    }
    $("#tglSpec").on('change', function () {
        if ($(this).is(":checked")) {
            GM_setValue("specMode", true)
        } else {
            GM_setValue("specMode", false)
        }
    });
    if (GM_getValue("specMode") === true) {
        if(document.URL.search('games/find') >= 0) {
        window.location.href = "/";
        }
    }
});