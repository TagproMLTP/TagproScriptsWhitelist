// ==UserScript==
// @name       disable all chats for tagpro
// @namespace  gist.github.com/thevdude
// @version    0.1
// @description  lol pls lebron
// @copyright  2014+, pooppants
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// ==/UserScript==

tagpro.ready(function(){
  tagpro.keys.chatToAll = [88];
  tagpro.keys.chatToGroup = [67];
  tagpro.keys.chatToTeam = [86]
});