// ==UserScript==
// @name		    TagPro Scoreboard Enhancer
// @version		    0.4.4
// @description		Sort scoreboard by any category, highlight the highest scores
// @include		    http://tagpro-*.koalabeast.com:*
// @include		    http://tangent.jukejuice.com:*
// @include		    http://*.newcompte.fr:*
// @grant		    GM_setValue
// @grant		    GM_getValue
// @author		    Some Ball -1
// ==/UserScript==

$(function() {
    tagpro.ready(function() {
        setTimeout(function() {
            //if set to true, the highest scores in each column will be highlighted
            //if false, no highlighting will occur
            var highlightMax = true;
            
            //red team color in the form of rgba(R, G, B, a)
            //where R is the amount of red from 0 to 255, G is green from 0 to 255, B is blue from 0 to 255
            //a is the amount of alpha from 0 to 1. 0 alpha is 100% transparent, 1 is opaque
            //try picking a color you like from this site: http://www.rapidtables.com/web/color/RGB_Color.htm
            //once you find the color you want, copy over the R, G, and B values in place of x, y, and z, respectively
            var redTeamColor = 'rgba(255, 0, 0, .35)'; //default 'rgba(255, 0, 0, .35)'
            
            //blue team color, same format as above
            var blueTeamColor = 'rgba(0, 0, 255, .35)'; //default 'rgba(255, 0, 0, .35)'
            
            //how wide the scoreboard is (slightly wider will allow longer names to fit on a single line)
            var scoreboardWidth = 855; //game default is 765
            
            
            
            
            //// NOTHING MORE TO EDIT //////
            $('#options').css('width',scoreboardWidth+'px'); //game default is 765px
            var cats = $('.stats').prev().find('th'); //$('#options').find('th'); using this one includes teamStats headings which we don't want
            cats.splice(-1,1); //grab headings but ignore the 'report' column
            var sorter = GM_getValue('sorter');
            var desc;
            if(sorter)
            {
                sorter = parseInt(sorter);
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
            var clearable;
            for(var i=0;i < cats.length;i++)
            {
                cats.eq(i).attr('id',i);
                cats.eq(i).click(function() {
                    if(sorter==$(this).attr('id'))
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
                        desc = true;
                        clearTimeout(clearable);
                        clearable = setTimeout(function() {
                            GM_setValue('sorter',sorter.toString());
                            GM_setValue('desc',desc.toString());
                        }, 1000, sorter, desc);
                    }
                });
            }
            
            var shown = false;
            var order = ['name','score','s-tags','s-pops','s-grabs','s-drops','s-hold','s-captures','s-prevent','s-returns','s-support','points'];
            tagpro.showOptions = function (){
                var e=$("div#options");
                if(shown)
                {
                    shown = false;
                    e.hide();
                    return;
                }
                shown = true;
                e.find("#name").val(tagpro.players[tagpro.playerId].name);
                var t=function(){
                    var n=e.find("tbody.stats"),
                        i=n.find("tr.template"),
                        s=[],
                        max=[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
                        count = 0;
                    n.find("tr").not(".template").remove();
                    for(var o in tagpro.players)
                    {
                        s.push(tagpro.players[o]);
                        if(highlightMax)
                        {
                            count++;
                            for(var j = 0;j < max.length;j++)
                            {
                                if(tagpro.players[max[j][0]])
                                {
                                    if(tagpro.players[o][order[j+1]]>tagpro.players[max[j][0]][order[j+1]])
                                    {
                                        max[j] = [parseInt(o)];
                                    }
                                    else if(tagpro.players[o][order[j+1]]==tagpro.players[max[j][0]][order[j+1]])
                                    {
                                        max[j].push(parseInt(o));
                                    }
                                        }
                                else
                                {
                                    max[j] = [parseInt(o)];
                                }
                            }
                        }
                    }
                    s.sort(function(e,t){
                        //return t.score-e.score //t-e sorts descending, e-t sorts ascending
                        if(sorter==0) //by player name so need something special
                        {
                            if (e.name.toUpperCase() > t.name.toUpperCase())
                            {
                                return 1;
                            }
                            if (e.name.toUpperCase() < t.name.toUpperCase())
                            {
                                return -1;
                            }
                            return 0; //equal
                        } //else
                        return t[order[sorter]]-e[order[sorter]]
                    });
                    if(!desc)
                    {
                        s.reverse();
                    }
                        tagpro.events.sortPlayers&&tagpro.events.sortPlayers.forEach(function(e){
                            e.sortPlayers(s)
                        }),
                            s.forEach(function(e){
                                var t = i.clone().data("model", e).removeClass("template").appendTo(n).find("td");
                                if(highlightMax)
                                {
                                    for(var j = 0;j < max.length;j++)
                                    {
                                        if(max[j].length!=count)
                                        {
                                            if(max[j].indexOf(e.id)!=-1)
                                            {
                                                t.eq(j+1).css('background-color',e.team==1?redTeamColor:blueTeamColor);
                                            }
                                            else
                                            {
                                                t.eq(j+1).css('background-color','none');
                                            }
                                        }
                                    }
                                }
                                t.eq(0).find(".scoreName").text(e.name).css("color",e.team==1?"#FFB5BD":"#CFCFFF").end().find(".scoreAuth").html(e.auth?"&#x2713;":"").end(),
                                    t.eq(1).text(e.score),
                                        t.eq(2).text(e["s-tags"]),
                                            t.eq(3).text(e["s-pops"]),
                                                t.eq(4).text(e["s-grabs"]),
                                                    t.eq(5).text(e["s-drops"]),
                                                        t.eq(6).text(tagpro.helpers.timeFromSeconds(e["s-hold"],!0)),
                                                            t.eq(7).text(e["s-captures"]),
                                                                t.eq(8).text(tagpro.helpers.timeFromSeconds(e["s-prevent"],!0)),
                                                                    t.eq(9).text(e["s-returns"]),
                                                                        t.eq(10).text(e["s-support"]),
                                                                            t.eq(11).text(e["points"]==null?"-":e.points),t.find("a.kick").attr("href",e.id)
                            }),
                                tagpro.musicPlayer.current ? $("div#musicInfo").removeClass("hide").text("Music: " + (tagpro.musicPlayer.current.name || "Untitled") + " by " + (tagpro.musicPlayer.current.author || "Unknown")) : $("div#musicInfo").addClass("hide"),
                                    shown && setTimeout(t, 1e3),
                                        tagpro.events.modifyScoreUI && tagpro.events.modifyScoreUI.forEach(function(e) {
                                            e.modifyScoreUI($("#options > table:first"))
                                        })
                };
                shown && t(),
                    e.show(),
                        tagpro.kongregate && $("#exit, #soundEffects, #soundMusic").show();
            };
        },1000);
    });
});