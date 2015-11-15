// ==UserScript==
// @name       		Tagpro Milliseconds
// @version    		1.0
// @description  	Display hundreths of seconds on the tagpro clock as well as outlines the score
// @include 		http://tagpro-*.koalabeast.com:*
// @include			http://tangent.jukejuice.com:*
// @include			http://maptest.newcompte.fr:*
// @author  		Some Ball -1
// ==/UserScript==

$(function()
  {
      var showScoreStroke = true; //if set to true, will display outline around score numbers, false will display it normally
      
      var currTime = '00:00.0';
      var currState = 3;
      var refresh = true;
      var clearable;
      
      tagpro.socket.on('end', function(data) { //game is over (this can happen a few hundred millisecs after the final cap was actually made or after the time actually reached 00:00)
          clearInterval(clearable);
          refresh = false; //don't update any more
      });
      
      tagpro.socket.on('time', function(data) { //only occurs when you first join a game, and when the game actually starts
          currState = data.state; //3 for game hasn't started, 1 for in play (and 2 is maybe for no game happening on current port?)
      });
      
      function drawTime(e,t,n,r,min,milli) //actual function to draw the time on our screen
      {
          if(refresh)
          {
              var secs = milli/1000;
              var tsecs = secs+'';
              if(secs<10)
              {
                  tsecs = '0'+secs;
              }
              if(milli%1000==0)
              {
                  tsecs += '.0';
              }
              r = min+tsecs;
          }
          else
          {
              r = currTime;
          }
          
          var f = document.createElement('canvas'); //make a temp canvas
          f.style.width = e.canvas.style.width; //set sizes to the same as normal canvas
          f.style.height = e.canvas.style.height;
          f.style.display = 'none';
          f.width = e.canvas.width;
          f.height = e.canvas.height;
          f = f.getContext('2d');
          
          f.textAlign="center";
          f.fillStyle="rgba(255, 255, 255, 1)";
          f.strokeStyle="rgba(0, 0, 0, .75)";
          f.lineWidth=4;
          f.font="bold 30pt Arial";
          f.strokeText(r,t.x,n.height-25); //stroke as our destination
          f.globalCompositeOperation = "destination-out"; //shows only the parts of the destination that do NOT overlap with the source, ignores everything else
          f.fillText(r,t.x,n.height-25); //the text itself as our source
          
          e.save();
          e.clearRect(t.x-75,n.height-60,150,40); //clear out any old time
          e.textAlign="center";
          e.fillStyle="rgba(255, 255, 255, .6)";
          e.strokeStyle="black";
          e.lineWidth=4;
          e.font="bold 30pt Arial";
          e.drawImage(f.canvas,0,0); //draw our stroke outline (stroke usually borders text and so it overlaps and outlines, but we only want the outline because of transparency)
          e.fillText(r,t.x,n.height-25); //draw in the numbers, no stroke necessary
          e.restore();
          
          currTime = r;
      }
      
      tagpro.ui.timer = function(e,t,n,r)
      {
          if(r=='00:00')
          {
              if(currState==3) //state==3 for game hasn't started, so won't include time's up
              {
                  r = '12:00';
              }
              else //game over, stop the clock at 00:00 otherwise it will go a few 100 ms negative (explains why game can end with fc popped)
              {
                  currTime = '00:00.0';
                  refresh = false; //stop updating time
              }
          }
          var min = r.substring(0,3); //just the minutes + colon
          var milli = (r.substring(3,5)-0)*1000; //take the seconds count, multiply by 1000 to get ms (the -0 is so it handles it is a number and not a string)
          
          drawTime(e,t,n,r,min,milli); //display the time
          
          clearInterval(clearable); //stop counting down every millisec
          if(refresh)
          {
              clearable = setInterval(function() {
                  if(milli==0) //if it's 0, need to display properly
                  {
                      milli = 60000;
                      var tmin = min.substring(0,2)-1; //because 0 secs left mean it's down to 
                      min = tmin+':';
                      if(min.length<3)
                      {
                          min = '0'+min;
                      }
                      if(min=='-1:')
                      {
                          min = '00:';
                      }
                  }
                  milli -= 100; //take off 0.1 sec
                  drawTime(e,t,n,r,min,milli); //display the time
              }, 100);
          }
      }
      
      if(showScoreStroke)
      {
          tagpro.ui.scores = function(e,t,n)
          {
              e.save(),
                  e.textAlign="center",
                      e.fillStyle="rgba(255, 0, 0, .5)",
                          e.strokeStyle="black",
                              e.lineWidth=2,
                                  e.font="bold 40pt Arial",
                                      e.strokeText(tagpro.score.r,t.x-120,n.height-50),
                                          e.fillText(tagpro.score.r,t.x-120,n.height-50),
                                              e.lineWidth=1.5,
                                                  e.fillStyle="rgba(0, 0, 255, .5)",
                                                      e.strokeText(tagpro.score.b,t.x+120,n.height-50),
                                                          e.fillText(tagpro.score.b,t.x+120,n.height-50),
                                                              e.restore()
          }
      }
  });