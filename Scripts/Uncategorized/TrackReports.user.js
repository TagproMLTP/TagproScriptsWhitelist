// ==UserScript==
// @name          Track Reports Against You
// @description   Track Reports Against You Per Day
// @include       http://tagpro-*.koalabeast.com*
// @license       GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author        ballparts
// @version       .1
// ==/UserScript==

// cookie functions
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

function setCookie(name, value, domain) { 
    var now = new Date();
    var time = now.getTime();
    var expireTime = time + 1000*60*60*24*365;
    now.setTime(expireTime);
    document.cookie = name+'='+value+';expires='+now.toGMTString()+';path=/; domain='+domain;
}


// initialize values

if(readCookie('reportCounter')===null) {
    setCookie('reportCounter', JSON.stringify([]), '.koalabeast.com');
}

// get rid of reports older than 24 hours
reports = JSON.parse(readCookie('reportCounter'))
for(i=0; i<reports.length; i++) {
    if(new Date().getTime() - reports[i] > 1000*60*60*24) {
        reports.shift();
        i--
    }
}
setCookie('reportCounter',JSON.stringify(reports), '.koalabeast.com');

if(document.URL.search('koalabeast.com:')>0) {
    setTimeout(function() {
        tagpro.ready(function() {
            tagpro.socket.on('chat',function(e){
                if(e.from === null & e.message.search('Someone has voted to kick you')==0) {
                    reports = JSON.parse(readCookie('reportCounter'))
                    reports = reports.concat(new Date().getTime())
                    setCookie('reportCounter', JSON.stringify(reports), '.koalabeast.com');
                }
            })
        })},1000)
} else if(document.URL.search('games/find')>0){
    reports = JSON.parse(readCookie('reportCounter'))
    $('#message').after('<div id=reportMessage>You have '+reports.length+(reports.length==1 ? ' report':' reports')+' against you.')
    $('#reportMessage')[0].style.textAlign='center'
    $('#reportMessage')[0].style.fontSize='25px'
    $('#reportMessage')[0].style.fontWeight='bold'
    switch(reports.length) {
        case 0:
            $('#reportMessage')[0].style.color='white'
            $('#reportMessage')[0].style.fontSize='15px'
            break;
        case 1:
        case 2:
        case 3:
            $('#reportMessage')[0].style.color='#45FF0D'         
            break;
        case 4:
        case 5:
            $('#reportMessage')[0].style.color='#F7FF03'         
            break;        
        default:
            $('#reportMessage')[0].style.color='#FF0505'
            $('#reportMessage')[0].style.fontSize='35px'
            break;        
    }
}