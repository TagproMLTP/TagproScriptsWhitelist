// ==UserScript==
// @name       		TagPro Maps Page Enhancer
// @version    		0.3
// @description  	Show map previews and the ratio percentages on hover. Also, click column headers to sort maps by any column.
// @include			http://tagpro-*.koalabeast.com/
// @include			http://tagpro-*.koalabeast.com/maps
// @include			http://tangent.jukejuice.com/
// @include			http://tangent.jukejuice.com/maps
// @author  		Some Ball -1
// ==/UserScript==

$(function() {
    //the number, in pixels, of the maximum allowed map preview width
    //images that are too large will be scaled down accordingly to meet the max-width and max-heigh constraints
    //whichever dimension is largest will be the one that equals the max, the smaller dimension will be scaled to an appropraite value
    //images smaller than the max are NOT scaled up, they remain at their smaller size
    var maxPreviewWidth = '400'; //default is 400
    var maxPreviewHeight = '400'; //default is 400
    
    //if set to true, an extra button will be placed on the homepage that leads to the /maps page
    //if set to false, the homepage will appear as normal
    var addHomepageButton = false; //default is false
    
    
    
    //////////////////////////////////////////////////////////////
    if(window.location.pathname=='/') //on homepage
    {
        if(addHomepageButton)
        {
            $('body').children().eq(0).css('width','1000px');
    	    $('.button').eq(-1).after($('<a href="/maps" class="button">Maps<span>view maps page</span></a>'));
        }
    }
    else //on map page
    {
        var mapinfo = {};
        $('body').append('<div id="popup" style="position: absolute; background-color: #333333; border: 1px solid gray; left: 0px; top: 0px;"></div>');
        $('#popup').hide();
        $('body').append('<image id="preview" style="position: absolute; left: 0px; top: 0px; border: 1px solid gray; max-width: '+maxPreviewWidth+'px; max-height: '+maxPreviewHeight+'px" src="" ></image>');
        $('#preview').hide();
        var mousepos = {x: 0,y: 0};
        var clearable;
        var oldmap = '';
        var out = false;
        $('#preview').on('load',function() { //on image load position mouse appropriately
            setPrevPos(mousepos.x,mousepos.y);
            clearTimeout(clearable);
            $('#popup').hide();
            if(!out)
            {
                $('#preview').show();
            }
        });
        $('<input id="download" type="submit" value="Dump Map Data" style="position: relative;"></input>').insertAfter($('.show').children().eq(1));
        $('#download').css('left',($('.show').children().eq(1).width()-$('#download').outerWidth())/2+'px');
        $('#download').click(function(data) {
            var names = ['Name','Rating','Votes','Plays','Votes/Play','Likes','Indifferent','Dislike'];
            var csvData = [];
            for(var i = 0;i < Object.keys(mapinfo).length;i++)
            {
                csvData.push([$('body').find('h3').eq(i).text()]);
                csvData.push([names]);
                for(var j = 0;j < mapinfo[i].length;j++)
                {
                    var like = $('#'+i+'map'+mapinfo[i][j].slice(-1)).find('span').eq(0).get(0).style.width;
                    var ind = $('#'+i+'map'+mapinfo[i][j].slice(-1)).find('span').eq(1).get(0).style.width;
                    var dis = $('#'+i+'map'+mapinfo[i][j].slice(-1)).find('span').eq(2).get(0).style.width;
                    csvData.push([mapinfo[i][j].slice(0,-1),like,ind,dis]);
                }
                csvData.push([[]]);
            }
            var csvString = csvData.join('\r\n');
            var a = document.createElement('a');
            a.href = 'data:attachment/csv,' + encodeURIComponent(csvString);
            a.target = '_blank';
            a.download = 'mapRatingData.csv';
            document.body.appendChild(a);
            a.click();
        });
        var maps = [];
        $.ajax({ //grab map previews from my imgur album
            url: 'https://api.imgur.com/3/album/gG10d/images',
            headers: {
                'Authorization': 'Client-ID d9ac388143def6c' //don't steal my client-id. get your own very quickly from here: https://api.imgur.com/oauth2/addclient
            },
            type: 'GET',
            success: function(data) { 
                data.data.forEach(function(curr) {
                    maps[curr.title.toUpperCase()] = curr.link;
                });
            },
        });
        var allmaps = $('.ratio'); //grab all map percentage bars
        for(var i = 0;i < allmaps.length;i++) //set up the mouseover percentages
        {
            var percents = allmaps.eq(i).children();
            for(var j = 0;j < percents.length;j++)
            {
                percents.eq(j).on('mousemove',function(data) {
                    $('#popup').css({left: data.pageX+10,
                                     top: data.pageY-15,});
                });
                percents.eq(j).hover(function(data) { //mouseenter
                    $('#popup').text($(this).attr('class').charAt(0).toUpperCase()+$(this).attr('class').substring(1)+': '+$(this).get(0).style.width);
                    $('#popup').css({left: data.pageX+10,
                                     top: data.pageY-15,});
                    $('#popup').show();
                }, function(data) { //mouseleave
                    $('#popup').hide();
                });
            }
        }
        var old = 1;
        var desc = true;
        var headers = [];
        for(var i = 0;i < $('.board.smaller tr:nth-child(1)').length;i++) //for each table (in rotation, retired, etc.)
        {
            $('.board.smaller tr:nth-child(1)').eq(i).attr('id','mapsHeader'+i).children().eq(3).after($('<th style="width: 15%">Votes/Play</th>')).next().next().css('width','20%');
            var head = $('#mapsHeader'+i);
            headers.push(head);
            var header = $('#mapsHeader'+i).children(); //map list header
            header.splice(-1,1); //no Ratio column
            for(var j = 0;j < header.length;j++) //set up click header to sort
            {
                header.eq(j).click(function(data) {
                    var same = false;
                    if(head.children().eq(old).text()===$(this).text())
                    {
                        console.log(same);
                        desc = !desc;
                        same = true;
                    }
                    sortColumns($(this).index(),same);
                });
            }
        }
        for(var k = 0;k < $('.board.smaller').length;k++) //for each separate maps table
        {
            mapinfo[k] = [];
            var maplist = $('.board.smaller').eq(k).find('tr'); //all maps, but i=1 to ignore header
            for(var i = 1;i < maplist.length;i++) //collect map data and set up map image mouseover
            {
                mapinfo[k][i-1] = [];
                maplist.eq(i).attr('id',k+'map'+i).children().eq(3).after($('<td></td>'));
                var cols = maplist.eq(i).children();
                for(var j = 0;j < cols.length-1;j++)
                {
                    if(j==0)
                    {
                        cols.eq(0).on('mousemove',function(data) {
                            if(maps[$(this).text().toUpperCase()])
                            {
                                mousepos.x = data.pageX;
                                mousepos.y = data.pageY;
                                if($('#popup').css('display')!='none') //if our image hasn't loaded yet
                                {
                                    showText();
                                }
                                else
                                {
                                    setPrevPos(data.pageX,data.pageY); //set image pos
                                }
                            }
                            else
                            {
                                mousepos.x = data.pageX;
                                mousepos.y = data.pageY;
                                showText('No Map Image Found');
                            }
                        });
                        cols.eq(0).hover(function(data) { //mouseenter
                            if(maps[$(this).text().toUpperCase()])
                            {
                                out = false;
                                mousepos.x = data.pageX;
                                mousepos.y = data.pageY;
                                if(oldmap==$(this).text()) //if left and coming back to same map, no onload event is called
                                {
                                    $('#popup').hide();
                                    $('#preview').show();
                                }
                                else
                                {
                                    $('#preview').attr('src',maps[$(this).text().toUpperCase()]);
                                    clearable = setTimeout(showText, 250); //delay slightly so you don't always see it right away
                                }
                            }
                            else
                            {
                                mousepos.x = data.pageX;
                                mousepos.y = data.pageY;
                                showText('No Map Image Found');
                            }
                        }, function(data) { //mouseleave
                            if(maps[$(this).text().toUpperCase()])
                            {
                                clearTimeout(clearable); //make sure to remove any lingering map loading checks
                                $('#preview').hide();
                                $('#popup').hide();
                                out = true;
                                oldmap = $(this).text(); //so we can check if new map is same as the old one
                            }
                            else
                            {
                                $('#popup').hide();
                            }
                        });
                    }
                    else if(j==4) //votes per play
                    {
                        cols.eq(4).text((cols.eq(2).text()/cols.eq(3).text()).toFixed(2))
                    }
                    mapinfo[k][i-1][j] = cols.eq(j).text();
                }
                mapinfo[k][i-1][j] = i;
            }
        }
        for(var i = 0;i < headers.length;i++) //init with Rate underlined
        {
            headers[i].children().eq(1).css('text-decoration','underline');
        }
        function showText(text)
        {
            $('#popup').text(text || 'Loading...');
            $('#popup').css({left: mousepos.x-(text?160:80),
                             top: mousepos.y-5,});
            $('#popup').show();
        }
        function sortColumns(value, same)
        {
            if(same)
            {
                if(desc)
                {
                    for(var i = 0;i < headers.length;i++)
                    {
                        headers[i].children().eq(old).css('text-decoration','underline');
                    }
                }
                else
                {
                    for(var i = 0;i < headers.length;i++)
                    {
                        headers[i].children().eq(old).css('text-decoration','overline');
                    }
                }
                for(var i = 0;i < Object.keys(mapinfo).length;i++)
                {
                    mapinfo[i].reverse();
                }
            }
            else
            {
                desc = true;
                if(value==0) //name
                {
                    for(var i = 0;i < headers.length;i++)
                    {
                        headers[i].children().eq(old).css('text-decoration','none');
                        headers[i].children().eq(0).css('text-decoration','underline');
                    }
                    for(var i = 0;i < Object.keys(mapinfo).length;i++)
                    {
                        mapinfo[i].sort(function(a,b) {
                            if(a[0].toUpperCase()>b[0].toUpperCase())
                            {
                                return 1;
                            }
                            if(a[0].toUpperCase()<b[0].toUpperCase())
                            {
                                return -1;
                            }
                            return 0;
                        });
                    }
                    old = 0;
                }
                else
                {
                    for(var i = 0;i < headers.length;i++)
                    {
                        headers[i].children().eq(old).css('text-decoration','none');
                        headers[i].children().eq(value).css('text-decoration','underline');
                    }
                    for(var i = 0;i < Object.keys(mapinfo).length;i++)
                    {
                        mapinfo[i].sort(function(a,b) {
                            return b[value]-a[value];
                        });
                    }
                    old = value;
                }
            }
            for(var i = 0;i < headers.length;i++)
            {
                for(var j = (mapinfo[i].length-1);j >= 0;j--)
                {
                    $('#'+i+'map'+mapinfo[i][j].slice(-1)).insertAfter(headers[i]);
                }
            }
        }
        function setPrevPos(mousex, mousey)
        {
            if($('#preview').width()!=0)
            {
                var leftside = mousex-$('#preview').width()-25;
                var topside = mousey-$('#preview').height()/2;
                if(leftside<10+$(window).scrollLeft())
                {
                    leftside = mousex+25;
                }
                if(leftside+$('#preview').width()>$(window).scrollLeft()+$(window).width()) //not else if because it could now apply to the new leftside in previous if
                {
                    leftside = $(window).scrollLeft()+$(window).width()-$('#preview').width()-10;
                }
                if(topside<10+$(window).scrollTop())
                {
                    topside = 10+$(window).scrollTop();
                }
                else if(topside+$('#preview').height()>$(window).scrollTop()+$(window).height())
                {
                    topside = $(window).scrollTop()+$(window).height()-$('#preview').height()-10;
                }
                $('#preview').css({left: leftside,
                                   top: topside});
            }
            else
            {
                $('#preview').css({left: mousex-325,
                                   top: mousey-150});
            }
        }
    }
});