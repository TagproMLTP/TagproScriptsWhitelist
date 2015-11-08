// ==UserScript==
// @name       Tantrew's Mom Music
// @namespace  http://reddit.com/u/haskelle/
// @version    1.0
// @description  enter something useful                 
// @include      http://tagpro-*.koalabeast.com:*
// @include		 	http://tangent.jukejuice.com:*
// @copyright  2014+, RonSpawnson
// ==/UserScript==a
    
(function() {
	tantrewsmom = "https://drive.google.com/uc?export=download&id=0B_Tw-xUoYewsd1lUUnp2TXl1SkU";

    function changeSrc() {
        if (typeof($("audio#music").get(0)) !== 'undefined' && $("audio#music").get(0).src != tantrewsmom) {
    		$("audio#music").get(0).src=tantrewsmom;
        }
    }
    setInterval(changeSrc, 500);
})();