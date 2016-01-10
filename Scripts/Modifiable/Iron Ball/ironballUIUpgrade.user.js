// ==UserScript==
// @name         TagPro UI Upgrade
// @include	     http://*.newcompte.fr*
// @include	     http://tagpro.gg*
// @include	     http://tagpro.koalabeast.com*
// @include	     http://capturetheflag.us*
// @include	     http://tagpro-*.koalabeast.com*
// @version      1.1
// @description  Script that modifies the css of TagPro pages
// @author       SuperSans
// ==/UserScript==

gray_background = false;
var page = window.location.pathname;
var host = (window.location.host.split("."))[1];
var smallGroup = true;
console.log(page);

function pageSelect(){
    if (page.includes("groups") && page.length >=16) {
        groupCSS();
    } else if (page.includes("/maps")){
        baseChange();
        defaultCSS();
        mapsCSS();
    } else {
        baseChange();
        defaultCSS();
    }
}

function baseChange(){
    
    var body = document.getElementsByTagName("body");
    for(i=0; i<body.length; i++) {
        body[i].style.overflowY = "auto";
    }
    
    var social_things = document.getElementsByClassName("section lineup");
    for(i=0; i<social_things.length; i++) {
        social_things[i].style.display= 'none';
    }
    
    var section_smaller = document.getElementsByClassName("section smaller");
    for(i=0; i<section_smaller.length; i++) {
        section_smaller[i].style.paddingTop = "25px";
    }
    
    var weekly_donation = document.getElementsByClassName("hideIfExternal section");
    for(i=0; i<weekly_donation.length; i++) {
        weekly_donation[i].style.display= 'none';
    }
    
    var h1 = document.getElementsByTagName("h1");
    for(i=0; i<h1.length; i++) {
        h1[i].style.marginTop = "100px";
        h1[i].style.paddingBottom = "20px";
        h1[i].style.background = "transparent url(http://i.imgur.com/g2oUgS3.png) no-repeat top left";
        h1[i].style.width = "650px";
        h1[i].style.height = "137px";
    }
    
    var article = document.getElementsByTagName("article");
    for(i=0; i<article.length; i++) {
        article[i].style.width = "1000px";
    }
}

function defaultCSS(){
    
    
    
    var reddit = document.getElementsByClassName("section tiny bottomPadding");
    for(i=0; i<reddit.length; i++) {
        reddit[i].style.display = "none";
    }
    
    var a = document.getElementsByTagName("a");
    for(i=0; i<a.length; i++) {
        a[i].style.color = "white";
    }
    
    var playbacklinks = document.getElementsByClassName("playback-link");
    for(i=0; i<playbacklinks.length; i++) {
        playbacklinks[i].style.color = "#428bca";
    }
    
    var buttons = document.getElementsByClassName("button");
    for(i=0; i<buttons.length; i++) {
        buttons[i].style.backgroundColor = '#2F65FF';
        buttons[i].style.border = "solid 3px #FFFFFF";
        buttons[i].style.color = "black";
        buttons[i].style.minWidth = "14%";
    }
    
    tagpro.ready(function() {
        if (tagpro.state){ //If we are in game
            var mapInfo = document.getElementById("mapInfo");
            mapInfo.style.float = "none";
            mapInfo.style.marginLeft = "auto";
            mapInfo.style.marginRight = "auto";
            mapInfo.style.width = "100%";
            mapInfo.style.fontSize = "150%";
            mapInfo.style.fontWeight = "bold";
            mapInfo.style.textAlign = "center";
            
            var social_things = document.getElementById("optionsLinks");
            social_things.style.display = "none";
            
            var name = document.getElementById("optionsName");
            name.style.position = "absolute";
            name.style.top = "28px";
            name.style.width = "96.8%";
            name.style.textAlign = "center";
            
            var switch_teams = document.getElementById("switchButton");
            switch_teams.style.position = "absolute";
            switch_teams.style.top = "18px";
            switch_teams.style.right = "18px";
            
            document.getElementById("name").style.marginLeft = "5px";
            
            var options = document.getElementById("options");
            options.style.width = "1000px";
            options.style.left = "0";
            options.style.right = "0";
            options.style.top = "0";
            options.style.bottom = "0";
            options.style.margin = "auto";
            options.style.boxShadow = "10px 10px 20px 0px rgba(0,0,0,0.35)";
            options.style.backgroundColor = "rgba(50,50,50,0.75)";
            options.style.border = "none";
            
            setTimeout(function() {
                var wrapper = document.getElementsByClassName("tablescroll_wrapper")[0];
                if (wrapper){

                    var table = document.querySelectorAll("div#options > div + div")[1];
                    table.style.marginTop = "55px";
                    table.style.fontSize = "16px";

                    wrapper.style.fontFamily = "sans-serif";


                } else {
                    var table_original = document.getElementById("stats");
                    table_original.style.marginTop = "55px";
                    table_original.style.fontSize = "16px";                    
                    table_original.style.marginBottom = "25px";
                    document.getElementsByClassName("stats")[0].style.fontFamily = "sans-serif";
                }
            }, (2 * 1000));
            
        }
    });
}

function groupCSS(){
    
    var h1 = document.getElementsByTagName("h1");
    for(i=0; i<h1.length; i++) {
        h1[i].style.top = "20px";
        h1[i].style.background = "transparent url(http://i.imgur.com/tBD5l91.png) no-repeat top left";
        h1[i].style.width = "166px";
        h1[i].style.height = "35px";
    }
    
    var a = document.getElementsByTagName("a");
    for(i=0; i<a.length; i++) {
        a[i].style.color = "white";
    }
    
    document.getElementById("settings").style.top = "70px";
    
    var red_box = document.getElementById("redTeam");
    red_box.style.width = "38%";
    red_box.style.marginRight = "18px";
    red_box.style.border = "1px solid rgba(255,255,255,0.20)";
    red_box.style.backgroundColor = "rgba(239, 66, 62, 0.5)";
    
    var blue_box = document.getElementById("blueTeam");
    blue_box.style.width = "38%";
    blue_box.style.border = "1px solid rgba(255,255,255,0.20)";
    blue_box.style.backgroundColor = "rgba(79, 175, 255, 0.5)";
    
    var spectators = document.getElementById("spectators");
    spectators.style.width = "21.6%";
    spectators.style.marginLeft = "79.3%";
    spectators.style.marginTop = "-302px";
    spectators.style.border = "1px solid rgba(255,255,255,0.20)";
    
    var waiting = document.getElementById("waiting");
    waiting.style.width = "21.6%";
    waiting.style.marginLeft = "79.3%";
    waiting.style.marginTop = "18px";
    waiting.style.border = "1px solid rgba(255,255,255,0.20)";
    waiting.style.height = "452px!important"; //TODO: This doesn't work
    
    var label = document.getElementsByTagName("label");
    for(i=0; i<label.length; i++) {
        label[i].style.paddingRight = "5px";
    }
    
    var players = document.getElementsByClassName("ui-sortable");
    for(i=0; i<players.length; i++) {
        players[i].style.fontWeight = "bold";
    }
    
    var leader_you = document.getElementsByClassName("leader.you");
    for(i=0; i<leader_you.length; i++) {
        leader_you[i].style.color = "white";
    }
    
    var setting_value = document.getElementsByClassName("setting value");
    for(i=0; i<setting_value.length; i++) {
        setting_value[i].style.paddingTop = "2px";
        setting_value[i].style.paddingBottom = "2px";
        setting_value[i].style.border = "1px solid rgba(255,255,255,1)";
        setting_value[i].style.marginBottom = "2px";
        setting_value[i].style.fontFamily = "sans-serif";
    }
    
    var button = document.querySelectorAll("button");
    for(i=0; i<button.length; i++) {
        button[i].style.backgroundColor = '#2F65FF';
        button[i].style.border = "2px white solid";
    }
    
    var listener = setInterval(checkPlayerCount, 250);
    
    
}

function mapsCSS(){
    
    var like = document.getElementsByClassName("like");
    for(i=0; i<like.length; i++) {
        like[i].style.backgroundColor = "#30ABD6";
    }
    
    var indifferent = document.getElementsByClassName("indifferent");
    for(i=0; i<indifferent.length; i++) {
        indifferent[i].style.backgroundColor = "#BBBB17";
    }
    
    var dislike = document.getElementsByClassName("dislike");
    for(i=0; i<dislike.length; i++) {
        dislike[i].style.backgroundColor = "#EF423E";
    }
}

function checkPlayerCount(){
    
    var status = document.getElementById("status").innerHTML;
    status = status.split(" - ");
    var player_count = 0;
    for (i=0; i<status.length; i++) {
        player_count += parseInt((status[i].split("/"))[0]);
    }
    if (host == "newcompte" || player_count > 4){
        if (smallGroup){
            smallGroup = false;
            var team_boxes = document.getElementsByClassName("teams");
            for(i=0; i<team_boxes.length; i++) {
                team_boxes[i].style.left = "370px";
            }
            document.getElementById("chat").style.right = "19.75%";
        }
    } else if (!smallGroup){
        smallGroup = true;
        var team_boxes = document.getElementsByClassName("teams");
        for(i=0; i<team_boxes.length; i++) {
            team_boxes[i].style.left = "40px";
        }
        document.getElementById("chat").style.right = "40px";
    }
    
    
}

if (gray_background){
    var html = document.getElementsByTagName("html");
    for(i=0; i<html.length; i++) {
        html[i].style.background = "#1f1f1f";
    }
}
document.onDomContentLoaded = pageSelect();