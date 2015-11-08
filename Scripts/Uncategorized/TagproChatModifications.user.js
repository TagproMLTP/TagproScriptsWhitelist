// ==UserScript==
// @name       		Tagpro Chat Modifications
// @version    		1.1
// @description  	Use arrow keys with open chat box, prevent sticky arrow keys, change name from chat box, and type more than 70 char limit at once
// @include      	http://tagpro-*.koalabeast.com:*
// @include			http://tangent.jukejuice.com:*
// @include			http://maptest.newcompte.fr:*
// @author  		Some Ball -1
// ==/UserScript==

$(function()
  {
      //Enter your registered name below. In-game, typing "/reg" without quotes in the chat box will set your name to this
      var registeredName = 'Some Ball -1'; //only 12 characters max are allowed for names
      
      /*****nothing to edit below here********/
      var type = 0;
      var chat = $('#chat');
      chat.removeAttr('maxLength'); //get rid of maximum typable characters
      $(document).keydown(function(event) {
          if(chat.css('display')=='block') //if the chat window is visable
          {
              tagpro.disableControls = false; //prevent arrow keys from being disabled
              type = event.which; //save which key opened the chat box so we know where to send the chat
          }
      });
      tagpro.timeLeft = function(kind)
      {
          var end = tagpro.gameEndsAt;
          var curr = new Date();
          var ms = end.getMilliseconds()-curr.getMilliseconds();
          end = end.getMinutes()*60+end.getSeconds();
          curr = curr.getMinutes()*60+curr.getSeconds();
          if(curr>end) //stradling over an hour mark
          {
              end += 60*60; //add an hour to it
          }
          var min = Math.floor((end-curr)/60);
          var sec = Math.floor((end-curr)%60+ms/1000);
          if(ms<0)
          {
              ms += 1000;
          }
          ms = Math.round(ms/100);
          if(min<10)
          {
              min = '0'+min;
          }
          if(sec<10)
          {
              sec = '0'+sec;
          }
          if(kind==1) //just min
          {
              return min;
          }
          else if(kind==2) //just sec
          {
              return sec+'.'+ms;
          }
          return min+':'+sec+'.'+ms;
      }
      function sendChat(which,msg)
      {
          switch(which) //depending on which key opened the chat box, have to send chat to different places
          {
              case 13: //enter key --> all chat
                  tagpro.socket.emit('chat',{message:msg});
                  break;
              case 84: //team chat
                  tagpro.socket.emit('chat',{message:msg, toAll:0});
                  break;
              case 222: //team chat
                  tagpro.socket.emit('chat',{message:msg, toAll:0});
                  break;
              case 71: //group chat
                  if(tagpro.group.socket)
                  {
                      tagpro.group.socket.emit('chat',msg);
                  }
                  break;
              case 103: //group chat
                  if(tagpro.group.socket)
                  {
                      tagpro.group.socket.emit('chat',msg);
                  }
                  break;
              case 186: //group chat
                  if(tagpro.group.socket)
                  {
                      tagpro.group.socket.emit('chat',msg);
                  }
                  break;
              default: //default to all chat if it somehow has the wrong key
                  tagpro.socket.emit('chat',{message:msg});
                  break;
          }
      }
      chat.keydown(function(event) {
          if(event.which!=13 && (event.which<37 || event.which>40)) //if any key but arrow key and enter is pressed
          {
              event.stopPropagation(); //prevent the page from seeing you pressed the key
          }
          else if(event.which==13)
          {
              if(chat.getSelection().length==0) //text is no currently selected, so ok to send message
              {
                  event.stopPropagation();
                  var msg = chat.val(); //store current chat text
                  chat.val(''); //erase chat text
                  var press = $.Event('keydown');
                  press.which = 13;
                  press.keyCode = 13;
                  $(document).trigger(press); //now with cleared chat window press enter to close
                  
                  if(msg.charAt(0)==='/') //check if changing name
                  {
                      if(msg.slice(1)==='reg') //want registered name
                      {
                          tagpro.socket.emit('name',registeredName.slice(0,12));
                      }
                      else
                      {
                          tagpro.socket.emit('name',msg.slice(1,13));
                      }
                  }
                  else
                  {
                      msg = msg.replace(/\/t/g,tagpro.timeLeft(0));
                      msg = msg.replace(/\/m/g,tagpro.timeLeft(1));
                      msg = msg.replace(/\/s/g,tagpro.timeLeft(2));
                      var msgs = msg.split('/n');
                      msgs = msgs.filter(function(n){return n}); //remove any empty array elements
                      var toSend = new Array(msgs);
                      var j = 0;
                      for(var i = 0;i < msgs.length;i++)
                      {
                          toSend[j] = msgs[i].slice(0,70); //take first 70 char
                          if(msgs[i].length>70) //chat too long, shorten it out
                          {
                              while(msgs[i]!=='') //while still chars to slice
                              {
                                  msgs[i] = msgs[i].slice(70); //then set msg = to remaining char
                                  j++;
                                  toSend[j] = msgs[i].slice(0,70); //take next 70 char
                              }
                          }
                          j++;
                      }
                      
                      for(var i = 0;i < toSend.length;i++) //go through every group of 70 char messages
                      {
                          setTimeout(sendChat,i*510,type,toSend[i]); //offset each chat emit by 510 ms (the tagpro chat delay limit is somewhere around 505 ms, so 510 keeps it safe)
                      }
                  }
              }
          }
      });
      chat.blur(function() {
          if(chat.css('display')=='block')
          {
              chat.focus(); //make sure we retain focus if open (solves the issue with macros forcing chat to lose focus
          }
      });
  });