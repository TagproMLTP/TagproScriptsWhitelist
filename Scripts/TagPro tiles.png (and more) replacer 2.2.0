// ==UserScript==
// @name          TagPro tiles.png (and more) replacer
// @namespace     http://www.reddit.com/user/Watball
// @description   Provides an easy way to replace tiles.png, splats.png, flair.png, speedpad.png
// @include       http://tagpro-*.koalabeast.com*
// @include       http://*.jukejuice.com*
// @include       http://maptest.newcompte.fr*
// @license       WTFPL
// @author        Watball
// @version       2.2.0
// ==/UserScript==


// From http://www.quirksmode.org/js/cookies.html
function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

var stuff = ['tiles', 'splats', 'flair', 'speedpad', 'speedpadred', 'speedpadblue', 'portal'];

// Check for tiles, if it's there, replace errything.
if (document.getElementById('tiles')) {
    for (let i = 0; i < stuff.length; i++) {
        var url = readCookie(stuff[i] + 'url');
        if (url) {
            document.getElementById(stuff[i]).src = url;
        }
    }

    // Call redrawBackground after five seconds
    window.setTimeout(function() {
        // Redraw background. Location hack so no security concerns blah blah blah. void because WE CAN NEVER BE TOO SURE
        location.replace('javascript:tagpro.api.redrawBackground && tagpro.api.redrawBackground();void(0);');
        }, 5000);
}



// Check if we're at root, because checking for play now button is actually pretty dumbdumb and a roundabout way to do it
if (location.host === tagpro.serverHost && location.pathname === '/') {
    var rootDomain = /[A-Za-z0-9-]+\.([A-Za-z]{3}|[A-Za-z]{2}\.[A-Za-z]{2}|[A-za-z]{2})\b/.exec(location.host)[0];

    // Because let isn't implemented yet. From http://stackoverflow.com/a/750506
    function createFunc(cookie) {
        return function(){document.cookie = cookie + '=' + this.value.trim() + '; expires=Fri, 06 Mar 2043 18:23:17 GMT; domain=.' + rootDomain};
    }

    var urlDiv = document.createElement('div');
    urlDiv.style.margin = '8px';
    for (var i = 0; i < stuff.length; i++) {
        urlDiv.appendChild(document.createTextNode('URL to your ' + stuff[i] + '.png (blank for default):'));
        urlDiv.appendChild(document.createElement('br'));
        var urlInput = document.createElement('input');
        urlInput.type = 'text';
        urlInput.style.width = '80%';
        cookie = stuff[i] + 'url';
        urlInput.value = readCookie(cookie);
        cookieFunc = createFunc(cookie);
        urlInput.addEventListener('input', cookieFunc, false);
        urlDiv.appendChild(urlInput);
        urlDiv.appendChild(document.createElement('br'));
    }
    document.getElementsByClassName('section')[0].appendChild(urlDiv);
}