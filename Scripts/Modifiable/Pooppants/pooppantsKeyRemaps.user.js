// ==UserScript==
// @name       map ijkl as arrows for tagpro
// @namespace  gist.github.com/thevdude
// @version    0.1
// @description  lol pls lebron
// @copyright  2014+, pooppants
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// ==/UserScript==

tagpro.ready(function(){
  tagpro.keys.left.push(74); 
  tagpro.keys.down.push(75); 
  tagpro.keys.right.push(76); 
  tagpro.keys.up.push(73);
});