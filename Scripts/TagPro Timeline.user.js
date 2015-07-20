// ==UserScript==
// @name          TagPro Timeline
// @namespace     http://www.reddit.com/user/Bob_Smith_IV
// @version       1.0
// @description   Displays and saves a timeline of hold at the end of the game
// @include       http://tagpro-*.koalabeast.com*
// @include       http://tangent.jukejuice.com*
// @include       http://maptest.newcompte.fr:*
// @author        BobSmithIV
// @copyright     2014+, BobSmithIV
// ==/UserScript==
 
tagpro.ready(function() {
    
    // Initialize variables
    var currState=0,
        timelineRectangleData=[],
        flagState=0; // 0 for both flags in base, 1 for red holding, 2 for blue holding, 3 for both holding
 
    
    // Timeline variables
    var red='#fb0000',
        blue='#003fba',
        noGrabGrey='#909090',
        jointPurple='#800080',
        redTimelineTop=0,
        blueTimelineTop=20,
        mainTimelineTop=44;
    
    function updateTimeline(){     // Checks every 20ms
        if(currState==1){    // If the game is in progress
            
            var oldFlagState = flagState;    // Save the previous flag state
            
            // Calculate the new flag state{
            flagState=0;
            if (tagpro.ui.blueFlagTaken || tagpro.ui.yellowFlagTakenByRed){
                flagState+=1;
            }
            if (tagpro.ui.redFlagTaken || tagpro.ui.yellowFlagTakenByBlue){
                flagState+=2;
            }
            // Calculate the new flag state}
            
            if (oldFlagState>1 && flagState<2){    // If a red player has just dropped or capped the fla
                timelineRectangleData.push([flagState,new Date()-new Date(0)]);
            }
            if (oldFlagState%2==1&&flagState%2==0){    // If a blue player has just dropped or capped the flag
                timelineRectangleData.push([flagState,new Date()-new Date(0)]);
            }
            if (oldFlagState<2&&flagState>1){    // If a red player has just grabbed the flag
                timelineRectangleData.push([flagState,new Date()-new Date(0)]);
            }
            if (oldFlagState%2==0&&flagState%2==1){  // If a blue player has just grabbed the flag
                timelineRectangleData.push([flagState,new Date()-new Date(0)]);
            }
        }
    }
    
    var updaterTimer = setInterval(updateTimeline, 20);    // Keep checking every 20ms
    
    function startTimeline(){    // If joining a game early, wait until the game starts, then save the initial state.  If joining late, just start straight away
        if(currState==1&&tagpro.ui){
            clearTimeout(starter);
            flagState=0;
            if (tagpro.ui.blueFlagTaken || tagpro.ui.yellowFlagTakenByRed){
                flagState+=1;
            }
            if (tagpro.ui.redFlagTaken || tagpro.ui.yellowFlagTakenByBlue){
                flagState+=2;
            }
            timelineRectangleData.push([flagState,new Date()-new Date(0)]);
        }
    }
    
    var starter = setInterval(startTimeline, 5);    // Keep checking if the game has started every 5ms until it has
    
    tagpro.socket.on('end', function(data) { // Once the game ends,
        clearTimeout(updaterTimer); // Stop collecting data
        updateTimeline(); // Save the final position
        drawTimelineRectangle(); // Draw the timeline on screen
    });
    
    tagpro.socket.on('time', function(data) { // Only occurs when you first join a game, and when the game actually starts
        currState = data.state; // 3 for game hasn't started, 1 for in play (and 2 is maybe for no game happening on current port?)
    });
    
    
    function drawTimelineRectangle(){ // Draw the timeline on screen
        var data = timelineRectangleData;
        
        // Draw the timeline background{
        var timeline = document.createElement('div');
        timeline.id = 'timeline';
        timeline.style.width = '1001px';
        timeline.style.height = '60px';
        timeline.style.top = '3px';
        timeline.style.marginLeft = '50%';
        timeline.style.left = '-500px';
        timeline.style.position = 'absolute';
        timeline.style.backgroundColor = '#202020';
        document.body.appendChild(timeline);
        // Draw the timeline background}
        
        // Draw the three grey bar backgrounds{
        for (var i = 0; i<3; i++){
            back = document.createElement('div');
            back.id = 'back'+i;
            back.style.width = '1001px';
               back.style.height = '16px';
            back.style.position = 'absolute';
            back.style.backgroundColor = noGrabGrey;
            back.style.top = mainTimelineTop+'px';
            document.getElementById('timeline').appendChild(back);
        }
        document.getElementById('back1').style.top = blueTimelineTop+'px';
        document.getElementById('back2').style.top = redTimelineTop+'px';
        // Draw the three grey bar backgrounds{
        
        // Initialize variables{
        var end = data[data.length-1][1],
            start = data[0][1],
            scale = 1000/(end-start);
        
        var colour='',
            chunk,
            redChunk,
            blueChunk,
            greyChunk,
            length,
            startPoint,
            offset=0;
        // Initialize variables}
        
        // Draw all the red, blue and purple chunks{
        for (var i = 0; i<data.length; i++){    // For each change of state,
            
            // Calculate the dimensions of the chunk to be drawn{
            startPoint= (data[i][1]-start)*scale+offset;
            if (i==data.length-1){ 
                length=0;
            }else{ 
                length = (data[i+1][1]-data[i][1])*scale;
            }
            if (length<1&&i!=data.length-1){
                length=1;
                offset++;
            }else{
                offset=0;
            }
            startPoint = Math.round(startPoint);
            length = Math.round(length);
            // Calculate the dimensions of the chunk to be drawn}
            
            // Draw the chunks in the red/blue timeline and work out what colour to draw in the main timeline{
            if (data[i][0]==0){    // If you're drawing a grey chunk,
                colour=noGrabGrey; // No grab colour
                createGreyChunk(length,startPoint,blueTimelineTop);
                createGreyChunk(length,startPoint,redTimelineTop);
            }else if (data[i][0]==1){    // If you're drawing a red chunk,
                colour=red;    // Red grab colour
                createRedChunk(length,startPoint);
                createGreyChunk(length,startPoint,blueTimelineTop);
            }else if (data[i][0]==2){    // If you're drawing a blue chunk,
                colour=blue; // Blue grab colour
                createBlueChunk(length,startPoint);
                createGreyChunk(length,startPoint,redTimelineTop);
 
            }else if (data[i][0]==3){    // If you're drawing a purple chunk,
                colour=jointPurple; // Both grab colour
                createRedChunk(length,startPoint);
                createBlueChunk(length,startPoint);
            }
            // Draw the chunks in the red/blue timeline and work out what colour to draw in the main timeline}
            
            // Draw the chunk in the main timeline{
            chunk = document.createElement('div');
            chunk.id = 'chunk'+i;
            chunk.style.width = length+'px';
            chunk.style.height = '16px';
            chunk.style.left = startPoint+'px';
            chunk.style.top = mainTimelineTop+'px';
            chunk.style.position = 'absolute';
            chunk.style.backgroundColor = colour;
            document.getElementById('timeline').appendChild(chunk);
            //draw the chunk in the main timeline}
        }
        // Draw all the red, blue and purple chunks}
        
        // Draw the download button{
        var downloadBtn = document.createElement('div');
        downloadBtn.id = 'downloadBtn';
        downloadBtn.style.width = '160px';
        downloadBtn.style.height = '23px';
        downloadBtn.style.top = '63px';
        downloadBtn.style.paddingTop = '5px';
        downloadBtn.style.marginLeft = '50%';
        downloadBtn.style.left = '-80px';
        downloadBtn.style.position = 'absolute';
        downloadBtn.style.backgroundColor = '#000000';
        downloadBtn.style.textAlign = '-webkit-center';
        downloadBtn.style.fontSize = '14px';
        downloadBtn.style.cursor = 'pointer';
        downloadBtn.style.color = '#00FF00';
        downloadBtn.style.webkitUserSelect= 'none';
        downloadBtn.innerText = 'Download as .png';
        document.body.appendChild(downloadBtn);
        downloadBtn.onclick = exportTimelineRectangle;
        // Draw the download button}
    }
    
    // Draw a chunk in the red timeline of length 'elementLength' with x position 'elementStart'
    function createRedChunk(elementLength,elementStart){
        var redChunk = document.createElement('div');
        redChunk.id = 'redChunk';
        redChunk.style.width = elementLength+'px';
        redChunk.style.height = '16px';
        redChunk.style.left = elementStart+'px';
        redChunk.style.top = redTimelineTop+'px';
        redChunk.style.position = 'absolute';
        redChunk.style.backgroundColor = red;
        document.getElementById('timeline').appendChild(redChunk);
    }
    
    // Draw a chunk in the blue timeline of length 'elementLength' with x position 'elementStart'
    function createBlueChunk(elementLength,elementStart){
        var blueChunk = document.createElement('div');
        blueChunk.id = 'blueChunk';
        blueChunk.style.width = elementLength+'px';
        blueChunk.style.height = '16px';
        blueChunk.style.left = elementStart+'px';
        blueChunk.style.top = blueTimelineTop+'px';
        blueChunk.style.position = 'absolute';
        blueChunk.style.backgroundColor = blue;
        document.getElementById('timeline').appendChild(blueChunk);
    }
    
    // Draw a chunk in either the red or blue timeline of length 'elementLength' with x position 'elementStart' and y position 'elementTop'
    function createGreyChunk(elementLength,elementStart, elementTop){
        var greyChunk = document.createElement('div');
        greyChunk.id = 'greyChunk';
        greyChunk.style.width = elementLength+'px';
        greyChunk.style.height = '16px';
        greyChunk.style.left = elementStart+'px';
        greyChunk.style.top = elementTop+'px';
        greyChunk.style.position = 'absolute';
        greyChunk.style.backgroundColor = noGrabGrey;
        document.getElementById('timeline').appendChild(greyChunk);
    }
    
    // Download the image as a png file
    // Note that to do this, we first create it in a canvas, as these can be easily downloaded, whereas we're displaying it as a div.
    // This is to do with some funny business on the TagPro website where the canvas couldn't display properly due to the website's canvas interfering.
    function exportTimelineRectangle(){
        var data = timelineRectangleData;
        
        // Create the background{
        var timeline = document.createElement('canvas');
        timeline.id = 'timelineCanvas';
        timeline.width = '1001';
        timeline.height = '60';
        timeline.style.bottom = '16px';
        timeline.style.marginLeft = '50%';
        timeline.style.left = '-50000px';
        timeline.style.position = 'absolute';
        timeline.style.backgroundColor = '#202020';
        document.body.appendChild(timeline);
        // Create the background}
        
        // Initialize variables{
        var end = data[data.length-1][1],
            start = data[0][1],
            scale = 1000/(end-start),
            colour='',
            length=0,
            startPoint=0,
            offset=0;
        timeline= document.getElementById("timelineCanvas");
        timeline = timeline.getContext("2d");
        // Initialize variables}
        
        // Draw the three grey bar backgrounds{
        timeline.fillStyle=noGrabGrey;
        timeline.fillRect(0,redTimelineTop,1000,16);
        timeline.fillRect(0,blueTimelineTop,1000,16);
        timeline.fillRect(0,mainTimelineTop,1000,16);
        // Draw the three grey bar backgrounds}
        
        // Draw all the red, blue and purple chunks{
        for (var i = 0; i<data.length; i++){    // For each change of state,
            
            // Calculate the dimensions of the chunk to be drawn{
            startPoint=(data[i][1]-start)*scale+offset ;
            if (i==data.length-1){ 
                length=0;
            }else{ 
                length = (data[i+1][1]-data[i][1])*scale;
            }
            if (length<1&&i!=data.length-1){
                length=1;
                offset++;
            }else{
                offset=0;
            }
            startPoint = Math.round(startPoint);
            length = Math.round(length);
            // Calculate the dimensions of the chunk to be drawn}
            
            // Draw the chunks in the red/blue timeline and work out what colour to draw in the main timeline{
            if (data[i][0]==0){    // If you're drawing a grey chunk,
                colour=noGrabGrey; // No grab colour
                timeline.fillStyle=colour;
                timeline.fillRect(startPoint,redTimelineTop,length,16);
                timeline.fillRect(startPoint,blueTimelineTop,length,16);
            }else if (data[i][0]==1){    // If you're drawing a red chunk,
                colour=red; // Red grab colour
                timeline.fillStyle=colour;
                timeline.fillRect(startPoint,redTimelineTop,length,16);
                timeline.fillStyle=noGrabGrey;
                timeline.fillRect(startPoint,blueTimelineTop,length,16);
            }else if (data[i][0]==2){    // If you're drawing a blue chunk,
                colour=blue; // Blue grab colour
                timeline.fillStyle=colour;
                timeline.fillRect(startPoint,blueTimelineTop,length,16);
                timeline.fillStyle=noGrabGrey;
                timeline.fillRect(startPoint,redTimelineTop,length,16);
            }else if (data[i][0]==3){    // If you're drawing a purple chunk,
                colour=jointPurple; // Both grab colour
                timeline.fillStyle=red;
                timeline.fillRect(startPoint,redTimelineTop,length,16);
                timeline.fillStyle=blue;
                timeline.fillRect(startPoint,blueTimelineTop,length,16);
            }
            // Draw the chunks in the red/blue timeline and work out what colour to draw in the main timeline}
            
            // Draw the chunk in the main timeline{
            timeline.fillStyle = colour;
            timeline.fillRect(startPoint,mainTimelineTop,length,16);
            // Draw the chunk in the main timeline}
        }
        // Draw all the red, blue and purple chunks}
        
        // Download the canvas image{
        var pngFile = document.getElementById('timelineCanvas');
        pngFile = pngFile.toDataURL("image/png");
        var download = document.createElement('a');
        download.href = 'data:image/png;"'+pngFile;
        download.download = 'holdTimeline.png';
        download.click();
        // Download the canvas image}
    }
 
    
});  