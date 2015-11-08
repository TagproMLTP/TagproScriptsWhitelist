// ==UserScript==
// @name       SpawnsonSoundPack
// @namespace  http://reddit.com/u/haskelle/
// @version    1.0
// @description  enter something useful                 
// @include      http://tagpro-*.koalabeast.com:*
// @include		 	http://tangent.jukejuice.com:*
// @copyright  2014+, RonSpawnson
// ==/UserScript==a
    
(function() {
    coysgetbutton_click = "https://docs.google.com/uc?export=download&id=0B_xZCL2l6cHlOUpCRncwcTVmYWM";
    embarassingcap_sigh = "https://docs.google.com/uc?export=download&id=0B_xZCL2l6cHlZzVNS2lyalFIXzQ";
    pieceofcandy_powerup = "https://docs.google.com/uc?export=download&id=0B_xZCL2l6cHlR2ZfdkxSTXBVX1k";
    rekt_drop = "https://docs.google.com/uc?export=download&id=0B_xZCL2l6cHlbHQ0ZmRuNEItTzQ";
    ronsnipeson_burst = "https://docs.google.com/uc?export=download&id=0B_xZCL2l6cHlUUZWZVgtcUNMc0E";
    woah_alert = "https://docs.google.com/uc?export=download&id=0B_xZCL2l6cHldFZzSkZHWkNnZUU";
    aaahhh_pop = "https://docs.google.com/uc?export=download&id=0B_xZCL2l6cHlOVFsZGpDdnpnSHM";
    amazingcap_cheering = "https://docs.google.com/uc?export=download&id=0B_xZCL2l6cHlSGU3a0dydFNVRmc";
    
    
    $("audio#click").get(0).src=coysgetbutton_click;
    $("audio#sigh").get(0).src=embarassingcap_sigh;
    $("audio#powerup").get(0).src=pieceofcandy_powerup;
    $("audio#drop").get(0).src=rekt_drop;
    $("audio#burst").get(0).src=ronsnipeson_burst;
    $("audio#alert").get(0).src=woah_alert;
    $("audio#pop").get(0).src=aaahhh_pop;
    $("audio#cheering").get(0).src=amazingcap_cheering;


})();