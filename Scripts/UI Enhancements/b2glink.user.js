// ==UserScript==
// @name        Back to group button
// @description Adds a button that goes straight back to your group.
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// @grant         GM_getValue
// @grant         GM_setValue
// ==/UserScript==

tagpro.ready(function()
             {
    if (tagpro.group.socket) {
        var groupPage = window.location.protocol + "//" + tagpro.serverHost + tagpro.group.socket.nsp;
        var groupButton = document.createElement('a');
        groupButton.setAttribute('href', groupPage);
        var linkText = document.createTextNode("Click here to go back to group!");
        groupButton.appendChild(linkText);
        document.getElementById('stats').parentNode.insertBefore(groupButton, document.getElementById('stats').nextSibling);
}
}
             );

