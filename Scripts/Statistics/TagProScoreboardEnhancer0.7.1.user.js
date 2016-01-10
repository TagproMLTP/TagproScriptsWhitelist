// ==UserScript==
// @name           TagPro Scoreboard Enhancer
// @version        0.7.1
// @description    Adds multiple features and functionality to the game scoreboard
// @include	   http://tagpro-*.koalabeast.com:*
// @include	   http://tangent.jukejuice.com:*
// @include	   http://*.newcompte.fr:*
// @require        https://github.com/SaM-Solutions/jquery.tableScroll/raw/master/jquery.tablescroll.js
// @grant	   GM_setValue
// @grant	   GM_getValue
// @author	   Some Ball -1
// ==/UserScript==

tagpro.ready(function() {
    // Number of players to display before the scoreboard height remains fixed and scrolling begins
    // Fractional number of rows are allowed (and make it easy to see that there are more rows below)
    // Set to a large number (eg 50) to disable
    var maxRowsToShow = 17; //numeric value
    
    // Keeps track of players who left the game by continuing to include them on the scoreboard, 2 lines below the regular scoreboard
    // Players who left are shown just below the normal scoreboard and are moved back onto the regular scoreboard if they rejoin (so long as their name hasn't changed)
    var keepTrackOfLeftPlayers = false; //true or false
    
    // The minimum number of players that must be in the game before your ball's row on the scoreboard is given a white line beside it (so greater than or equal to this number)
    // Set to a very large number (eg 1000) to disable
    var minDistinguishPlayer = 0; //integer value
    
    // Highlight the max scores/times in each column
    var highlightMax = true; //true or false
    
    // Red team highlight color in the form of rgba(R, G, B, a)
    // where R is the amount of red from 0 to 255, G is green from 0 to 255, B is blue from 0 to 255
    // a is the amount of alpha from 0 to 1. 0 alpha is 100% transparent, 1 is opaque
    // try picking a color you like from this site: http://www.rapidtables.com/web/color/RGB_Color.htm
    // once you find the color you want, copy over the R, G, and B values in place of x, y, and z, respectively
    var redTeamColor = 'rgba(255, 0, 0, .35)'; //default 'rgba(255, 0, 0, .35)'
    
    // Blue team highlight color, same format as above
    var blueTeamColor = 'rgba(0, 0, 255, .35)'; //default 'rgba(255, 0, 0, .35)'
    
    // How wide the scoreboard is (slightly wider will allow longer names to fit on a single line)
    var scoreboardWidth = 900; //game default is 800
    
    
    
    
    //// NOTHING MORE TO EDIT //////
    if($('#options').css('width')==='800px') //only modify width if it hasn't already been modified from game default (800px)
    {
        $('#options').css('width',scoreboardWidth+'px');
        tagpro.renderer.centerView();
    }
    var shifting = false,
        stayShifting = 0;
    $(document).keydown(function(key) {
        shifting = key.shiftKey;
    });
    var cats = $('#stats').children().eq(0).find('th'), //grab column headers
        sorter = GM_getValue('sorter'),
        sortBy = 'score',
        order = ['name','score','s-tags','s-pops','s-grabs','s-drops','s-hold','s-captures','s-prevent','s-returns','s-support','s-powerups','points'],
        countOrder = 0,
        desc;
    cats.splice(-1,1); //grab headings but ignore the last column ('report' column)
    for(var i=0;i < cats.length;i++) //setup column header clicking, names, and ids
    {
        var col = cats.eq(i);
        col.attr('id',i);
        if(!col.attr('name'))
        {
            col.attr('name',order[i]);
            countOrder++;
        }
        if(sorter===i) sortBy = col.attr('name');
        col.click(function() {
            if(sorter===$(this).attr('id')) //already sorting by this column
            {
                if(desc) //currently descending so switch
                {
                    $(this).css('text-decoration','overline');
                }
                else
                {
                    $(this).css('text-decoration','underline');
                }
                desc = !desc;
                clearTimeout(clearable);
                clearable = setTimeout(function() { //no need to setValue all the time if people are just clicking around
                    GM_setValue('desc',desc.toString());
                }, 1000, desc);
            }
            else
            {
                $('#'+sorter).css('text-decoration','none');
                $(this).css('text-decoration','underline');
                sorter = $(this).attr('id');
                sortBy = $(this).attr('name');
                desc = true;
                clearTimeout(clearable);
                clearable = setTimeout(function() {
                    GM_setValue('sorter',sorter.toString());
                    GM_setValue('desc',desc.toString());
                }, 1000, sorter, desc);
            }
        });
    }
    if(sorter && cats.eq(sorter).attr('name'))
    {
        sorter = parseInt(sorter);
        sortBy = cats.eq(sorter).attr('name');
        desc = (GM_getValue('desc')==='true');
        if(desc)
        {
            cats.eq(sorter).css('text-decoration','underline');
        }
        else
        {
            cats.eq(sorter).css('text-decoration','overline');
        }
    }
    else //first-time load
    {
        cats.eq(1).css('text-decoration','underline');
        sorter = 1;
        desc = true;
        GM_setValue('sorter',sorter.toString());
        GM_setValue('desc',desc.toString());
    }
    var sorted = [],
        idOrder = [],
        max = [],
        cache = {},
        showOld = [],
        wasDistinguished = false,
        clearable;
    tagpro.events.register({
        sortPlayers: function(players) {
            if(stayShifting<2 || !sorted.length)
            {
                players.sort(function(a,b){
                    //return b.score-a.score
                    //b-a sorts descending, a-b sorts ascending
                    if(sorter==0) //by player name so don't want to differentiate between upper/lowercase
                    {
                        if (a.name.toUpperCase() > b.name.toUpperCase())
                        {
                            return 1;
                        }
                        if (a.name.toUpperCase() < b.name.toUpperCase())
                        {
                            return -1;
                        }
                        return 0; //equal
                    }
                    return b[sortBy]-a[sortBy];
                });
                if(!desc)
                {
                    players.reverse();
                }
                sorted = $.extend([],players);
                if(keepTrackOfLeftPlayers && showOld.length)
                {
                    players.push({});
                    for(var i = 0;i < showOld.length;i++)
                    {
                        players.push(showOld[i]);
                    }
                }
                if(stayShifting===1)
                {
                    stayShifting++;
                    idOrder = [];
                    for(var i = 0;i < sorted.length;i++) idOrder.push(sorted[i].id);
                }
            }
            else if(stayShifting===2)
            {
                players.sort(function(a,b){ //sort based on the saved order of IDs
                    //return b.score-a.score
                    //b-a sorts descending, a-b sorts ascending
                    var aplace = idOrder.indexOf(a.id);
                    var bplace = idOrder.indexOf(b.id);
                    if(aplace<0)
                    {
                        idOrder.push(a.id); //if a new player joins while in static scoreboard mode then stick them at the end
                        if(bplace<0) 
                        {
                            idOrder.push(b.id);
                            return 0;
                        }
                        return 1;
                    }
                    if(bplace<0)
                    {
                        idOrder.push(b.id);
                        return -1;
                    }
                    return idOrder.indexOf(a.id)-idOrder.indexOf(b.id);
                });
                sorted = $.extend([],players);
                if(keepTrackOfLeftPlayers && showOld.length)
                {
                    players.push({});
                    for(var i = 0;i < showOld.length;i++)
                    {
                        players.push(showOld[i]);
                    }
                }
            }
            if(highlightMax)
            {
                max = [];
                for(var i = 0;i < sorted.length;i++) //player
                {
                    for(var j = 0;j < cats.length-1;j++) //for each element that can be highlighted (-1 so no name)
                    {
                        if(!max[j]) max[j] = [i];
                        else
                        {
                            if(sorted[i][cats.eq(j+1).attr('name')]>sorted[max[j][0]][cats.eq(j+1).attr('name')])
                            {
                                max[j] = [i];
                            }
                            else if(sorted[i][cats.eq(j+1).attr('name')]==sorted[max[j][0]][cats.eq(j+1).attr('name')])
                            {
                                max[j].push(i);
                            }
                        }
                    }
                }
            }
        },
        modifyScoreUI: function() {
            if(highlightMax)
            {
                for(var i = 0;i < max.length;i++)
                {
                    if(max[i].length!==sorted.length) //don't highlight if everyone has max value
                    {
                        var current = $('.template').next();
                        for(var j = 0;j < sorted.length;j++)
                        {
                            if(max[i].indexOf(j)>-1)
                            {
                                current.children().eq(i+1).css('background-color',sorted[j].team===1?redTeamColor:blueTeamColor);
                            }
                            else
                            {
                                current.children().eq(i+1).css('background-color','none');
                            }
                            current = current.next();
                        }
                    }
                }
            }
            /*var curr = $('.template').next();
            for(var i = 0;i < sorted.length;i++)
            {
                if(sorted[i].degree)
                {
                    curr.children().get(0).innerHTML += '<sup>'+sorted[i].degree+'</sup>';
                }
                curr = curr.next();
            }*/
            if(!tagpro.spectator && sorted.length>=minDistinguishPlayer)
            {
                var current = $('.template').next();
                for(var i = 0;i < sorted.length;i++)
                {
                    if(sorted[i].id===tagpro.playerId)
                    {
                        current.children().eq(0).css({'border-left': '2px solid white'});
                    }
                    else
                    {
                        current.children().eq(0).css({'border-left': 'none'});
                    }
                    current = current.next();
                }
                wasDistinguished = true;
            }
            else if(wasDistinguished)
            {
                var current = $('.template').next();
                for(var i = 0;i < sorted.length;i++)
                {
                    current = current.children().eq(0).css({'border-left': 'none'}).next();
                }
                wasDistinguished = false;
            }
            //adapted from http://stackoverflow.com/a/28289155
            if($('#options').css('display')!=='none')
            {
                $('#stats tbody:first th').each(function(i) {
                    $('#header th:eq('+i+')').width($(this).width()); //set scrolling header to hidden real header width
                });
            }
    	}
    });
    if(keepTrackOfLeftPlayers)
    {
        var first = false;
        tagpro.socket.on('p',function(data) {
            data = data.u || data;
            for(var i = 0;i < data.length;i++)
            {
                if(!cache[data[i].id])
                {
                    first = data[i].id;
                    cache[data[i].id] = data[i];
                }
                else if(first===data[i].id)
                {
                    first = false;
                    var amatch = false;
                    var where = -1;
                    var scores = ['name','s-captures','s-drops','s-grabs','s-hold','s-pops','s-powerups','s-prevent','s-returns','s-support','s-tags'];
                    for(var j = 0;j < showOld.length;j++)
                    {
                        var breaker = false;
                        for(var k = 0;k < scores.length;k++)
                        {
                            if(data[i][scores[k]]!==showOld[j][scores[k]])
                            {
                                breaker = true;
                                break;
                            }
                        }
                        if(!breaker) //someone matched
                        {
                            amatch = true;
                            where = j;
                            break;
                        }
                    }
                    if(amatch) //everything was the same, the same guy is back
                    {
                        showOld.splice(where,1);
                    }
                }
            }
        });
        tagpro.socket.on('playerLeft',function(id) {
            if(tagpro.state!==1) return;
            if(cache[id])
            {
                cache[id].score = '';
                showOld.push(cache[id]);
            }
            else console.log('Error: Wasn\'t able to catch the guy that just left');
        });
        var tfs = tagpro.helpers.timeFromSeconds;
        tagpro.helpers.timeFromSeconds = function(val) {
            if(val===undefined) return '' //get rid of those pesky NaN:NaN
            return tfs.apply(this,arguments);
        };
    }
    var old = tagpro.showOptions,
        init = false;
    tagpro.showOptions = function() {
        stayShifting = shifting ? 1 : 0;
        old.apply(this,arguments);
        if(!init)
        {
            init = true;
            var head = $('#stats > tbody:first').clone().css('visibility','hidden');
            $('<thead id="header"></thead').append($('#stats > tbody:first').children()).prependTo($('#stats')).next().remove(); //convert tbody column headers to thead
            var temp = $('.template').clone();
            $('#stats').tableScroll({height: Math.round(maxRowsToShow*25)}); //enable scrolling when there's more than maxRowsToShow rows
            $('.tablescroll_head').css('border-spacing','2px 0px'); //put spacing back in header (tablescroll.js seems to remove this)
            head.prependTo($('#stats')); //add hidden header to regular table so cell spacing is correct
            $('#stats').css({'position': 'relative', 'top': '-23px'}); //offset table up a bit to cover up the invisible header row
            temp.insertBefore($('.template')).next().remove(); //replace template with the old one which has cells with no specified 'width'
        }
    };
    setTimeout(function openup() {// quickly open and close scoreboard after loading to make scrolling setup invisible
        window.requestAnimationFrame(function() {
            if(!tagpro.playerId || !tagpro.players[tagpro.playerId] || !tagpro.players[tagpro.playerId].name) return setTimeout(openup,50);
            var toSend = $.Event('keyup');
            toSend.which = toSend.keyCode = tagpro.keys.showOptions[0];
            $(document).trigger(toSend); //open
            $(document).trigger(toSend); //close
        });
    }, 1000);
});