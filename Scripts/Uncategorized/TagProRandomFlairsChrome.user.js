// ==UserScript==
// @name          Random flairs
// @namespace     http://www.reddit.com/user/Bob_Smith_IV/
// @description   Randomly choose a new flair each game
// @include       http://tagpro-*.koalabeast.com*
// @author        BobSmithIV, with some code inspired by ballparts' extensions
// @version       2.8
// @grant         GM_getValue
// @grant         GM_setValue
// @downloadURL   https://raw.githubusercontent.com/BobSmithIV/TagProRandomFlairs/master/TagProRandomFlairs.user.js
// ==/UserScript==

// Note that unlike in version 1.X of this script, to change which flairs to include in the flair rotation, visit your profile and tick the checkboxes of those flairs you want included. 

//the name TagPro gives to each of the flairs
var flairNames = ['special.developer', 'special.helper', 'special.mod', 'special.supporter', 'special.supporter2', 'special.supporter3', 'special.supporter4', 'special.bitcoin', 
                  'special.contest', 'boards.month', 'boards.week', 'boards.day', 'winRate.insane', 'winRate.awesome', 'winRate.good', 
                  'event.birthday', 'event.stPatricksDay', 'event.aprilFoolsDay', 'event.easter', 'event.hacked', 'event.halloween', 'event.survivor', 'event.birthday2', 
                  'event.platformer', 'event.stPatricksDay2', 'event.aprilFoolsDay2', 'event.easter2', 'event.carrot', 'event.lgbt',
                  'degree.bacon', 'degree.moon', 'degree.penguin', 'degree.freezing', 'degree.dolphin', 'degree.alien', 'degree.roadsign', 'degree.peace', 'degree.magma', 
                  'degree.flux', 'degree.microphone', 'degree.boiling', 'degree.dalmatians', 'degree.abc', 'degree.plane', 'degree.love', 'degree.pokemon', 'degree.phi', 
                  'degree.uturn', 'degree.world', 'degree.boiling2', 'degree.atomic', 'degree.boxing', 'degree.bowling','degree.pi'
                 ];

//intialize variables the first time the script is run
if((!GM_getValue('version'))||(GM_getValue('version')!='2.8')){
    console.log('Script updated: resetting flair rotation');
    GM_setValue('randomizeState','unrandomized');
    GM_setValue('version','2.8');
    GM_setValue('savedFlairRotation',new Array(flairNames.length + 1).join('1'));
}

//fill the array from the saved string (silly TamperMonkey can't store arrays)
var flairsToInclude = [];
for (var i = 0; i<flairNames.length;i++){
    if (GM_getValue('savedFlairRotation').charAt(i)=='1'){
        flairsToInclude[i]=true;
    }else{
        flairsToInclude[i]=false;
    }
}

//create the flair rotation
var flairRotation = [];
for (var i = 0; i<flairsToInclude.length; i++){
    if (flairsToInclude[i]){
        flairRotation.push(flairNames[i]);
    }
}


//work out the user's current server:
GM_setValue('server', window.location.href.substring(window.location.href.indexOf('tagpro-')+7, window.location.href.indexOf('.koalabeast.com')));



//if on the home page, get the user's profile id and get ready to randomize
if (document.URL.substring(document.URL.search('.com/')+5).length===0){
    //work out the user's profile id:
    url = $('a[href^="/profile"]').attr('href');
	if(url !== undefined) {
	    var n = url.lastIndexOf('/');
	    var profileNum = url.substring(n + 1);
	    GM_setValue('profileNum',profileNum);
	}
    GM_setValue('randomizeState','unrandomized');
}


//if you're starting a new game and aren't in a group, go to the profile to randomize flairs
if(document.URL.search('games/find')>=0 && !(tagpro.group.socket) && GM_getValue('randomizeState')=='unrandomized') {
    GM_setValue('randomizeState','sentToRandomizeFromJoiner');
    window.location.href = 'http://tagpro-'+GM_getValue('server')+'.koalabeast.com/profile/'+GM_getValue('profileNum');
}

//if you've just joined/rejoined a group, go to the profile to randomize flairs
if(document.URL.match(/groups\/./) && document.URL.search('create')<0 && GM_getValue('randomizeState')=='unrandomized') {
    GM_setValue('groupName',window.location.href.substring(window.location.href.lastIndexOf('/')+1));
    GM_setValue('randomizeState','sentToRandomizeFromGroup');
    window.location.href = 'http://tagpro-'+GM_getValue('server')+'.koalabeast.com/profile/'+GM_getValue('profileNum');
}


//if you're on the profile, add the new column to allow users to select the flair rotation
if( document.URL.search('profile') >= 0 ){
    //create the new column's header:
    x=getBoard().firstChild.childNodes;
    var newCell = x[0].appendChild(document.createElement('th'));
    newCell.innerHTML = 'Rotation';
    
    for (var i = 1; i<x.length;i++){
        //create the new cell
        newCell = x[i].appendChild(document.createElement('td'));
        
        //if you've earned the flair,
        if ((x[i].className!='fade')){
            //check that the flair is currently supported
            indexOfFlair = flairNames.indexOf(x[i].childNodes[3].firstChild.value);
            if (indexOfFlair<0){
                newCell.innerHTML="Flair not supported - check github.com/BobSmithIV, then message Bob at reddit.com/u/Bob_Smith_IV if it's yet to be updated";
            }else{
                //add a checkbox to the cell
                checkbox = newCell.appendChild(document.createElement('input'));
                checkbox.type = "checkbox";
                checkbox.id = indexOfFlair;
                
                if (flairsToInclude[indexOfFlair]){
                    checkbox.checked=true;
                }
                
                //toggle this flair in/out of rotation when the checkbox is clicked
                checkbox.onclick = function() {
                    if (this.checked){
                        flairsToInclude[this.id]=true;
                    }else{
                        flairsToInclude[this.id]=false;
                    }
                    stringified='';
                    for (var j=0; j<flairsToInclude.length;j++){
                        stringified= stringified+(flairsToInclude[j]?'1':'0');
                    }
                    GM_setValue('savedFlairRotation',stringified);
                };
            }
        }
    }
    
    //if you've been sent to the profile to randomize flairs, pick any available flair at random, then go back to where you came from
    if (GM_getValue('randomizeState').search('sentToRandomize')>=0){
        
        
        //randomly select a flair to use
        elements = document.getElementsByTagName('input');
        flairs = [];
        for(var i=0; i<elements.length; i++) {
            //if the object found is indeed a flair radio, and that flair is in the current flair rotation, add that to the chooseable options
            if(elements[i].name=="selectedFlair" && flairRotation.indexOf(elements[i].value)>=0){
                flairs.push(elements[i]);
            }
        }
        
        //if the user has at least one flair in the rotation, click one at random
        if (flairs.length>0){
            chosenFlair = flairs[Math.floor(Math.random()*flairs.length)];
            chosenFlair.click();
        }
        //if sent from group, set to return to group, else set to return to joiner
        if (GM_getValue('randomizeState')=='sentToRandomizeFromGroup'){
            returnTo='http://tagpro-'+GM_getValue('server')+'.koalabeast.com/groups/'+GM_getValue('groupName');
        }else{
            returnTo = 'http://tagpro-'+GM_getValue('server')+'.koalabeast.com/games/find/';
        }

        //save that we've now randomized the flair
        GM_setValue('randomizeState','randomized');

        //return to whence you came
        window.location.href = returnTo;
    }
}


//if a game starts, not from a group, get ready to randomize the flair afterwards
if( document.URL.search(':80') >= 0){
	GM_setValue('randomizeState','unrandomized');
}

//get the leaderboard from the dom
function getBoard(){
    var x = document.getElementsByClassName("board");
    for (var i=x.length-1;i>=0;i--){
        if (x[i].childNodes[0].childNodes[0].childNodes[1].innerText=="Award"){
            return x[i];
        }
    }
}

