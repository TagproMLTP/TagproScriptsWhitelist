// ==UserScript==
// @name           Private Group Maker
// @author         eagles.
// @exclude        http://*.newcompte.fr:*
// @exclude        http://tagpro-*.koalabeast.com:*
// @exclude        http://tangent.jukejuice.com:*
// @include        http://tagpro-*.koalabeast.com*
// @include        http://tangent.jukejuice.com*
// @include        http://*.newcompte.fr*
// @grant          none
// ==/UserScript==


$(document).ready(function() {

  if (location.hash == '#privategroup' && window.location.href.indexOf("/groups/create") >= 0) {
    $("#public").prop("checked", false);
    parent.location.hash = '';
    $(".button").click();
  }

  else if (window.location.port == '' && window.location.origin.length >= window.location.href.length-1) {
    function getButtonWidth() {
        return parseInt($(".buttons.smaller").css("width").split("px")[0]);
    }

    function addButtonsAndStyle(width) {
      buttonWidth = width+100;
      $(".buttons.smaller").css("width", String(buttonWidth)+"px");
      $(".buttons.smaller").append("<a class='button' href='/groups/create#privategroup')>Private<span>private group</span></a>");
    }

    function checkIfButtonsReady() {
      width = getButtonWidth();
      if(width == 0) {
        setTimeout(checkIfButtonsReady, 250);
      } else {
        addButtonsAndStyle(width);
        return true;
      }
    }
    checkIfButtonsReady();
  }

});