// ==UserScript==
// @name           MLTP.info Season 9
// @version        1.0
// @description    captains' catstats script for MLTP.info S9
// @author         ballparts / Gem
// @include        http://tagpro-*.koalabeast.com*
// @include        http://tangent.jukejuice.com*
// @include        http://maptest*.newcompte.fr*
// @grant          GM_setValue
// @grant          GM_getValue
// @grant          GM_xmlhttpRequest
// @require        https://raw.githubusercontent.com/ballparts/TagProReplays/master/jquery.js
// @require        https://gist.githubusercontent.com/ballparts/6a4e635e83ba94f0077b/raw/ac84a0d5c172de5dd3285e3daefb93f24785dac9/ClassyWiggle.min.js
// @require        https://gist.githubusercontent.com/ballparts/6bb586a6ff3168607848/raw/eddfac3bf68b74f99a33b2feebc7a77a45149494/jquery.blockUI.js
// ==/UserScript==
 
(function(window, document, undefined) {
 
    //--------------------------------------//
    // THESE VALUES MIGHT NEED TO BE EDITED //
    //--------------------------------------//
 
    // Links to post data for 1) score updates, and 2) final stats
    UPDATEURL = 'http://serene-headland-9709.herokuapp.com/api/live';
    FINALURL  = 'http://serene-headland-9709.herokuapp.com/api/games';
 
    // User ID for identification purposes
    KEY = ""; // YOU WILL PUT YOUR KEY HERE, BETWEEN THE QUOTES
    if ( new Date().getDay() == 1 && new Date().getHours() >= 17 ) { // if Monday / minors
       KEY += "_m";
    }
 
    // whether to actually send stats to server or not - set false when developing
    sendStats = true;
 
    // This is the minimum number of players in a game for the script to run
    MINPLAYERS = 1;
 
    //------------------------//
    // END OF EDITABLE VALUES //
    //------------------------//
 
 
    GM_xmlhttpRequest({
        method: "GET",
        url: "https://raw.githubusercontent.com/gemberly/mltp-info/master/captains.js",
        onload: function(response) {
            eval(response.responseText);
        }
    });
 
 
})(unsafeWindow, document);