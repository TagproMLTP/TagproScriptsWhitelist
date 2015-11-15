// ==UserScript==
// @name          TagPro Wins Until Next Degree
// @namespace     http://www.reddit.com/user/tpcarl/
// @description   Displays wins needed until next degree on score screen.
// @include       http://tagpro-*.koalabeast.com*
// @license       GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author        ben
// @version       .1
// ==/UserScript==

$('article > div.tiny').after( "<center><h3><p id='winsneeded'></p></h3></center>" );

url = $('a[href^="/profile"]').attr('href');
var n = url.lastIndexOf('/');
var profileNum = url.substring(n + 1);
profilePage = String('/profile/'+profileNum);

$( "#winsneeded" ).load(profilePage + ' article > h3 > div', function(){
    $('#winsneeded > div:last-child').css({'font-size':'50%'});
});

