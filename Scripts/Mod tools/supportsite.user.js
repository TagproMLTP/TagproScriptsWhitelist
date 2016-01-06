// ==UserScript==
// @name         Support Site Helper
// @namespace    http://www.reddit.com/u/bizkut
// @updateURL    https://github.com/TagproMLTP/TagproScriptsWhitelist/raw/42da613e010fe6cd0138c3f56a737325e3b207e8/Scripts/Mod%20tools/supportsite.user.js
// @version      0.5
// @description  Adds Good Standing button for default Good Standing reply.  Other button texts provided by Turtlemansam
// @author       Bizkut
// @include      http://support.koalabeast.com/*
// ==/UserScript==

//NOTE, CHANGE THIS TO THE NAME YOU WANT DISPLAYED AT THE END OF SOME MESSAGES
//IF YOU DONT YOU WILL LOOK LIKE A JERK
var modName = "A TagPro Moderator";

//First commented out line is the template for adding more buttons.
var buttons = {
    //'unique_value': ['Button Text', 'This text gets put into the text'],
    'standing_message': ['Good Standing',"Hi Some Ball,\n\nYou're playing on a shared IP that has been banned. To bypass this, you need an account in good standing.\n\n**Good Standing Requirements:**\n\n - A registered account ✓\n - Minimum 5 hours playtime\n - Maximum of 2 reports in past 24 hours\n\n*Please let us know if you have any further questions or concerns.*\n\n\- "+modName],
    'start_message': ['Start Format', "Hi Some Ball,\n\nMessage Here\n\n*Please let us know if you have any further questions or concerns.*\n\n\- "+modName],
    'afk_message': ['AFK Too Much', "Hi Some Ball,\n\nYou were banned for receiving 8 reports within 24 hours. Most of these reports are for not moving for 30 seconds, and getting kicked by the AFK timer. Please try to stay active in-game, and click the exit button if you need to leave. Also, try not to switch tabs inbetween games, because you might end up in a game and not realize it!\n\n*Please let us know if you have any further questions or concerns.*\n\n\- "+modName],
    'chat_message': ['Offensive Chat', "Hi Some Ball,\n\nYou were banned for your chat:\n\nChat Here!\n\n*Please let us know if you have any further questions or concerns.*\n\n\- "+modName],
    'no_account_message': ['No Profile ID', "Hi Some Ball,\n\nCan you please tell us your account name or your profile ID? Without this we have no idea who you are.\n\nIf you don't have an account, the only way you can play on a banned IP is through an account in Good Standing.\n\n**Good Standing Requirements:**\n\n - A registered account\n - Minimum 5 hours playtime\n - Maximum of 2 reports in past 24 hours\n\n*Please let us know if you have any further questions or concerns.*\n\n\- "+modName]
};
function makeButtons(){
    for (var key in buttons) {
        if (buttons.hasOwnProperty(key)) {
            if(!$("#"+key).length) {
                var item  =  $('<button id='+key+' class="btn btn-primary pull-right">'+buttons[key][0]+'</button>');
                item.on('click', function() {
                    $("#comment_text").val(buttons[this.id][1]);
                    $("#comment_preview").html(Autolinker.link(markdown.toHTML(buttons[this.id][1])))
                });
                $("#submit_comment").after(item);
            }
        }
    }
}
setInterval(makeButtons,1000);
