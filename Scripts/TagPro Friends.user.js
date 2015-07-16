// ==UserScript==
// @name          TagPro Friends
// @include       http://tagpro-*.koalabeast.com*
// @include       http://tangent.jukejuice.com*
// @include       http://*.newcompte.fr*
// @require       http://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @require       http://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.js
// @require       http://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js
// @version       2.6
// @author        Lej
// ==/UserScript==

$(document).ready(function() {
    function updateSelf(group, leave) {
        $.ajax({
            type: "POST",
            url: "http://lejdesigns.com/rankedPUGs/userscript/updateSelf.php",
            data: {title: document.title, url: document.URL, group: group, ga: $.cookie('_ga'), version: 2.6},
            timeout: 3000,
            success: function(data) {
                console.log(data);
            },
            error: function(request, status, err) {
                if(status == "timeout") {
                    console.log("ERROR! Lej is lagging!\nError: "+err);
                }
            },
            complete: function() {
                if (leave) document.location.href="http://"+tagpro.serverHost+"/groups/leave/";
            }
        });
    }

    var group = false;
    if (tagpro.group && tagpro.group.socket != null) {
        group = true;
    }

    updateSelf(group);

    $("#leaveButton").hide();
    $("#actions").append('<button id="RP_leaveButton">Leave</button>');
    $("#RP_leaveButton").click(function() {
        updateSelf(false, true);
    });
    
	$(window).on('beforeunload', function(){
        $.post('http://lejdesigns.com/rankedPUGs/userscript/updateSelf.php', {title: "Offline", url: "Offline", group: false, ga: $.cookie('_ga'), version: 2.5});
	});

    if (document.title.indexOf("TagPro Ball:") > -1) {
        var profileName = document.title.split(": ");
        $("h3").append("<iframe style='height: 75px;border: 0px; width: 600px;' src='http://lejdesigns.com/rankedPUGs/userscript/friendCheck.php?name="+profileName[1]+"'></iframe>");
    }

    if (!$.cookie('listLeft')) {
        $.cookie('listLeft', 0, { path:'/' });
        $.cookie('listTop', 0, { path:'/' });
    }

    $("body").append("<div id='RP_Friendslist' style='position:fixed;left:"+$.cookie('listLeft')+"px;top:"+$.cookie('listTop')+"px;width: 500px;'><div id='RP_chatHeader' style='cursor:move;background-color: green;padding: 2px;font-weight: bold;'>Friends List<div id='RP_toggleChat' style='cursor:pointer;float: right;'></div></div><div id='RP_list' style='display:"+$.cookie('listDisplay')+";width:500px;'><iframe id='RP_iframe' style='background-color: rgba(37, 37, 37, 0.60);width:100%;height:500px;border:0px;'></iframe></div></div>");

    if ($.cookie('listDisplay')=="none") {
        $("#RP_toggleChat").html("⇓");
        $("#RP_Friendslist").css("width","120px");
    }
    else {
        $("#RP_toggleChat").html("⇑");
        $("#RP_iframe").attr("src","http://lejdesigns.com/rankedPUGs/userscript/friends.php?ga="+$.cookie('_ga'));
    }

    $("#RP_toggleChat").click(function() {
        if ($("#RP_list").css("display") == "none") {
            $("#RP_iframe").attr("src","http://lejdesigns.com/rankedPUGs/userscript/friends.php?ga="+$.cookie('_ga'));
            $("#RP_Friendslist").animate({width: "500px"}, 200);
            $("#RP_list").slideToggle(200, function() {
                $("#RP_toggleChat").html("⇑");
                $.cookie('listDisplay','block', { path:'/' });
            });
        }
        else {
            $("#RP_Friendslist").animate({width: "120px"}, 200);
            $("#RP_list").slideToggle(200, function() {
                $.cookie('listDisplay','none', { path:'/' });
                $("#RP_toggleChat").html("⇓");
                $("#RP_iframe").removeAttr("src");
            });
        }
    });

    $('#RP_Friendslist').draggable({
        snap: true,
        stop: function(event, ui) {
            if (ui.offset.left<0) {
                ui.offset.left = 0;
                $('#RP_Friendslist').animate({left: "0px"});
            }
            if (ui.offset.top<0) {
                ui.offset.top = 0;
                $('#RP_Friendslist').animate({top: "0px"});
            }
            $.cookie('listLeft', ui.offset.left, { path:'/' });
            $.cookie('listTop', ui.offset.top, { path:'/' });
        }
    });
});