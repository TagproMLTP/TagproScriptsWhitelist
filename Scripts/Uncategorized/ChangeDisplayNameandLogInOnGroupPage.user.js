// ==UserScript==
// @name       		Change Display Name and Log In On Group Page
// @namespace  		http://www.reddit.com/user/goodygood_274/
// @version    		0.2
// @include       	http://tagpro-*.koalabeast.com/*
// @description  	Change your display name and Log In from the group page
// @license       	GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author        	ballparts
// ==/UserScript==
 
// Find and save the URL and the HTML for the main tagpro page.
sessionStorage.setItem('mainPageURL', document.URL.replace(/.com\/.+/,'.com/'));
mainPageHTML = $.get(sessionStorage.getItem('mainPageURL' )); 
 
// This saves your profile page URL in local storage for use later
url = $('a[href^="/profile"]').attr('href');
if(url !== undefined) {
	var n = url.lastIndexOf('/');
	var profileNum = url.substring(n + 1);
	profilePage = String('profile/'+profileNum);
    	localStorage.setItem('profilePage2',profilePage);
}
 
// If you are on the group page, draw a "change displayed name" input box and button, and a login button
if( document.URL.search(/(groups).[a-zA-Z]{8}/) >= 0 ) {
    $('#leaveButton').after('<Button id="loginButton">Log in</Button>');
    $('#loginButton').after('<Button id="changeDisplayName">Change Display Name</Button>');
    $('#changeDisplayName').after('<Input id="displayNameText"></Input>');
    $('#changeDisplayName').click(function() {
        dnt = document.getElementById('displayNameText');
        sessionStorage.setItem('displayName',dnt.value);
        sessionStorage.setItem('changeName','yes');
        sessionStorage.setItem('groupURL', window.location.href);
	window.location.href = sessionStorage.getItem('mainPageURL')+localStorage.getItem('profilePage2');    
    });
    $('#loginButton').click(function() {
        sessionStorage.setItem('login','yes');
        sessionStorage.setItem('groupURL', window.location.href);
        window.location.href = sessionStorage.getItem('mainPageURL');
    });
    
    // determine if the user is logged in. if so, hide the login button.
    function checkLoginStatus() {
    	if(mainPageHTML.responseText !== undefined) {	    	
    		loggedInTest = mainPageHTML.responseText.search('profile');
    		if( loggedInTest >= 0 ) {
    	    		document.getElementById('loginButton').style.display = 'none';
    		}
        }
    }
    checkLoginStatus();
}
 
// If you are on the profile page AND the 'changeName' variable is 'yes,' change the displayed name
if( document.URL.search('profile') >= 0 & sessionStorage.getItem('changeName') == 'yes') {
	$('#displayedName').val(sessionStorage.getItem('displayName'));
	updateButton = document.getElementById('saveReservedName');
	updateButton.click();
    	sessionStorage.setItem('changeName', 'no');
	window.location.href = sessionStorage.getItem('groupURL');
}
 
// If you are on the main page AND the 'login' variable is 'yes,' then:
//    if the login button is there, press it
//    if you're already loggen in, go back to the group
if( window.location.href == sessionStorage.getItem('mainPageURL') & sessionStorage.getItem('login') == 'yes') {
    profileTest = $('a[href^="/profile"]').attr('href');
    if(profileTest === undefined) {
        $('body>article>div>a.button')[1].click();
    } else {
        sessionStorage.setItem('login','no');
        window.location.href = sessionStorage.getItem('groupURL');
    }
}
 
setInterval(checkLoginStatus, 200);