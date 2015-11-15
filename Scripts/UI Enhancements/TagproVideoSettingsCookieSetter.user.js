// ==UserScript==
// @name          TagPro Video Settings Cookie Setter
// @namespace     github.com/karlding
// @description   Automatically sets the Video Settings cookies for you on each server
// @include       http://*.koalabeast.com:*
// @include       http://*.koalabeast.com/*
// @include       http://*.jukejuice.com:*
// @include       http://*.jukejuice.com/*
// @include       http://*.newcompte.fr:*
// @include       http://*.newcompte.fr/*
// @license       GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author        Karl Ding
// @copyright     2014+, 0K
// @version       0.1
// ==/UserScript==

$(document).ready(function(){
    /* 
     * If you don't want your viewport to scale, set this to true
     * If you'd like your viewport to scale, set this setting to false
     */
    $.cookie("disableViewportScaling", false);
    
    /*
     * If you'd like to disable particles, set this to true
     * If you don't want to disable particles, set this to false
     */
    $.cookie("disableParticles", true);
    
    /*
     * If you want to use the old renderer, set this to true
     * If you want to use the new PIXI.js renderer, set this to false
     */
    $.cookie("forceCanvasRenderer", false);
});