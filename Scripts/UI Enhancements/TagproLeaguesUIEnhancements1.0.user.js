// ==UserScript==
// @name     TagPro Leagues UI Enhancements
// @include  http://www.tagproleague.com/*
// @grant    GM_addStyle
// @run-at document-start
// @author RonSpawnsonTP
// @version 1.0
// ==/UserScript==

GM_addStyle ( "                                     \
    .TickerNews {                                   \
        margin-top: 50px;                           \
    }                                               \
    #headerwrap {                                   \
        display: none;                              \
    }                                               \
" );

var html="<form class=\"form-inline\" role=\"form\" action=\"search.php\" method=\"get\" style=\" display: inline; float: left; \"><div class=\"form-group\" style=\" float: left; \">    \
              <input style=\"height: 46px;width: 300px;\" type=\"search\" name=\"s\" placeholder=\"e.g. Legman or Ghostboosters\" results=\"5\" value=\"\"></div>                         \
			  <button type=\"submit\" class=\"btn btn-warning btn-lg\">Search</button></form>"

function DOM_ContentReady () {
              $(html).insertAfter( ".navbar-header" );
}

document.addEventListener ("DOMContentLoaded", DOM_ContentReady);