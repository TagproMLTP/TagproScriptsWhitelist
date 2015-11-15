// ==UserScript==
// @name          TagPro Wins Until Next Degree
// @namespace     http://www.reddit.com/user/tpcarl/
// @description   Displays wins needed until next degree on score screen.
// @include       http://tagpro-*.koalabeast.com*
// @license       GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author        ben, modified by ballparts
// @version    a   .1
// ==/UserScript==
 
$('article > div.section.smaller').after( "<center><h2><div><p id='winsneeded'></p></div></h2></center>" );

url = $('a[href^="/profile"]').attr('href');
if(url !== undefined) {
	var n = url.lastIndexOf('/');
	var profileNum = url.substring(n + 1);
	profilePage = String('/profile/'+profileNum);
    localStorage.setItem('profilePage',profilePage);

}


if(document.URL.search('profile')<1) {
	$( "#winsneeded" ).load(localStorage.getItem('profilePage') + ' article > h3 > div', function(){
		$('#winsneeded > div:last-child').css({'font-size':'50%'});
	});
}