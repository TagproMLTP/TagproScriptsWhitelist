// ==UserScript==
// @name                tagpro-catstats
// @namespace           http://www.reddit.com/user/TOJO_IS_LIFE
// @version             1.6.3
// @description         tagpro-catstats as a userscript
// @include             http://tagpro-*.koalabeast.com:*
// @include             http://tangent.jukejuice.com:*
// @include             http://maptest*.newcompte.fr:*
// @copyright           2014+, TOJO
// @author                      TOJO, ballparts version adding powerups
// ==/UserScript==
 
(function() {
    
 
  // simple ignore
  if(location.port < 8000)
    return;
 
  function injectScript(path) {
    var script = document.createElement("script");
    script.setAttribute("type", "application/javascript");
    script.src = path;
    script.onload = removeScript;
    (document.head||document.documentElement).appendChild(script);
  }
 
  function removeScript() {
    this.parentNode.removeChild(this);
      
  }
 
  var scripts = [
    "//cdn.jsdelivr.net/filesaver.js/0.2/FileSaver.min.js",
    "https://cdn.rawgit.com/ballparts/tagpro-catstats-userscript/v1.6.3/catstats.js",
  ];
  scripts.forEach(injectScript);
 
})();