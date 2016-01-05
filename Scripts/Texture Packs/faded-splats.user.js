// ==UserScript==
// @name          TagPro Faded Splats Userscript
// @namespace     http://www.reddit.com/user/contact_lens_linux/
// @description   No more running into spikes (maybe).
// @include       http://tagpro-*.koalabeast.com:*
// @license       GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author        steppin
// ==/UserScript==

(function() {
    var splats = document.getElementById('splats');
    splats.src = 'http://i.imgur.com/9FHHMsR.png';
})();
