// ==UserScript==
// @name            Reddit on TagPro
// @description     Put the latest posts from /r/tagpro (or whatever) on your TagPro homepage
// @version    	    1.0.5
// @include         http://tagpro-*.koalabeast.com
// @include         http://tagpro-*.koalabeast.com/
// @include         http://tangent.jukejuice.com
// @include         http://tangent.jukejuice.com/
// @include         http://*.newcompte.fr
// @include         http://*.newcompte.fr/
// @updateURL       https://gist.github.com/nabbynz/bcf2a1a470a6d9277c9a/raw/TagPro_RedditOnTagPro.user.js
// @downloadURL     https://gist.github.com/nabbynz/bcf2a1a470a6d9277c9a/raw/TagPro_RedditOnTagPro.user.js
// @grant           GM_xmlhttpRequest
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_deleteValue
// @grant           GM_addStyle
// @license         GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author          nabby
// ==/UserScript==

$(document).ready(function() {
    console.log('START: Reddit on TagPro...');

    var updateInterval = 120; //Interval between updating posts & checking messages in seconds (default:300 (5 mins), 0=disable)

    function checkUnreadMessages() {
        //You don't need to enter these values if you are already logged in to Reddit (thx to BoringCode for the tip).
        //But if you do enter them here they will override your login.
        //WARNING: Don't share your feed id with anyone as they will be able to read your mail!!!
        //You can find your feed id here: https://www.reddit.com/prefs/feeds/
        //If you don't know what to do, you're probably best not to do anything :)
        var feed = ''; //not needed if already logged in to reddit
        var user = ''; //not needed if already logged in to reddit
        var SaveFeedAndUserLocally = false; //set to true to save the above values locally (so when the script updates these values are still there)

        if (GM_getValue('FeedUser') !== undefined) {
            feed = GM_getValue('FeedUser').feed;
            user = GM_getValue('FeedUser').user;
        } else {
            if (SaveFeedAndUserLocally) {
                if (feed && user) {
                    GM_setValue('FeedUser', {'feed':feed, 'user':user});
                } else {
                    GM_deleteValue('FeedUser');
                }
            }
        }

        GM_xmlhttpRequest({
            method: "GET",
            timeout: 10000, //wait for response for 10 seconds
            url: 'http://www.reddit.com/message/unread.json' + ((feed&&user) ? '?feed='+feed+'&user='+user : ''),
            onload: function(xhr) {
                var data = JSON.parse(xhr.responseText);
                var divider = "\n—————————————————————————————";
                var title = "You have " + data.data.children.length + " new message"+(data.data.children.length === 1 ? '' : 's')+"! Click to view on Reddit..." + divider
                if (data.data.children.length > 0) {
                    var count = 0;
                    $('#ROT_MessagesState').css('color', '#0f0');
                    $('#ROT_MessagesState').attr('href', 'https://www.reddit.com/message/unread/');
                    $.each(data.data.children, function(key, value) {
                        if (count >= 10) {
                            title += "\n..." + divider;
                            return false;
                        }
                        //title += "\n[" + value.data.author + "]: " + value.data.subject + "\n" + new Date(value.data.created_utc*1000).toString() + "\n" + value.data.body.substr(0, 200).replace(/.{1,60}(?:[\?!%()'".,:;–—-]|\b)/, "$&\n") + divider;
                        title += "\n[" + value.data.author + "]: " + value.data.subject + "\n" + new Date(value.data.created_utc*1000).toString() + divider;
                        count++;
                    });
                    $('#ROT_MessagesState').attr('title', title);
                } else {
                    $('#ROT_MessagesState').css('color', '#900');
                    $('#ROT_MessagesState').attr('href', 'https://www.reddit.com/message/inbox/');
                    $('#ROT_MessagesState').attr('title', "You have no new messages (checking every "+updateInterval+" seconds).\nClick to see your Inbox on Reddit...");
                }
            },
            onerror: function(xhr) {
                $("#ROT_RedditPosts").empty();
                $("#ROT_RedditPosts").append('<br>Error getting data from Reddit<br><br><i>'+xhr.status+' '+xhr.responseText+'</i>');
            },
            ontimeout: function() {
                $("#ROT_RedditPosts").empty();
                $("#ROT_RedditPosts").append('Error getting data from Reddit (timed out)');
            }
        });
    }

    function getRedditPosts() {
        var subreddit = $('#ROT_SubRedditName').prop('value');
        var numberposts = $('#ROT_NumberPosts').prop('value');

        if (subreddit.indexOf('/') === 0) subreddit = subreddit.substr(1);
        if (subreddit.indexOf('/') === subreddit.length-1) subreddit = subreddit.substr(0, subreddit.length-1);

        if (!subreddit) {
            $("#ROT_RedditPosts").empty();
            $("#ROT_RedditPosts").append('No sub-reddit name');
            return false;
        }

        if ($('#ROT_NewHot').prop('checked')) {
            subreddit += '/new';
        }

        if (subreddit === GM_getValue('SubRedditName')) $("#ROT_RedditPosts").empty();

        GM_xmlhttpRequest({
            method: "GET",
            timeout: 10000, //wait for response for 10 seconds
            url: "http://www.reddit.com/r/"+subreddit + ".json?limit="+numberposts,
            onload: function(xhr) {
                var data = JSON.parse(xhr.responseText);
                var created;
                var now = Date.parse(new Date());
                
                $("#ROT_RedditPosts").empty();
                $("#ROT_RedditPosts").hide(0).delay(500).slideDown(800);
                
                $.each(data.data.children, function(key, value) {
                    created = new Date(value.data.created_utc * 1000);
                    created = Math.floor(((now-created)/3600000));
                    $("#ROT_RedditPosts").append('<div class="ROT_Reddit_Post"><div><a href="'+value.data.url+'" class="ROT_Reddit_Title TST" target="_blank" title="View'+(value.data.is_self ? ' Comments on Reddit' : ' on '+value.data.domain)+'">' + value.data.title + '</a> <span class="ROT_Reddit_FlairText" title="Score">['+value.data.score+']</span></div>' +
                                                 '<div class="ROT_Reddit_Author">'+value.data.author+' <span class="ROT_Reddit_FlairText">'+(value.data.author_flair_text?value.data.author_flair_text:'')+'</span> <span title="'+new Date(value.data.created_utc*1000).toString()+'\n'+new Date(value.data.created*1000).toLocaleString()+' [Their Time]">'+created+' hours ago</span> [<a href="http://www.reddit.com'+value.data.permalink+'" class="ROT_Reddit_Comments" target="_blank" title="View Comments on Reddit">'+value.data.num_comments+' Comments</a>]</span></div></div>');
                });
                GM_addStyle('.ROT_Reddit_Post { margin:5px 0 0 0; padding:0 0 5px 0; border-bottom:1px solid #aaa; }');
                GM_addStyle('.ROT_Reddit_Title { font-size:12px }');
                GM_addStyle('.ROT_Reddit_Title:hover { text-decoration:underline }');
                GM_addStyle('.ROT_Reddit_Author { font-size:10px; color:#66f }');
                GM_addStyle('.ROT_Reddit_FlairText { font-size:10px; color:#99f }');
                GM_addStyle('.ROT_Reddit_Comments { font-size:10px; color:#aaa }');
                GM_addStyle('.ROT_Reddit_Comments:hover { text-decoration:underline }');
            },
            onerror: function(xhr) {
                $("#ROT_RedditPosts").empty();
                $("#ROT_RedditPosts").append('<br>Error getting data from Reddit<br><br><i>'+xhr.status+' '+xhr.responseText+'</i>');
            },
            ontimeout: function() {
                $("#ROT_RedditPosts").empty();
                $("#ROT_RedditPosts").append('Error getting data from Reddit (timed out)');
            }
        });
    }
    
    $('a[href^="/maps"]').parent('div').after('<div id="ROT_Container" style="margin:20px auto 0; padding:10px; width:-webkit-fit-content; border-radius:8px; box-shadow:#fff 0px 0px 10px; background:rgba(0,0,0,0.1); overflow:hidden"></div>');
    
    var header = '<a id="ROT_MessagesState" href="https://www.reddit.com/message/inbox/" style="font-size:20px; color:#990000; margin-top:-10px; float:left;" target="_blank">&#9993;</a>' +
                 '<label title="Sub-Reddit Name (e.g. &quot;TagPro&quot;)">Sub: <input type="text" id="ROT_SubRedditName" value="' + GM_getValue('SubRedditName', 'tagpro') + '" style="font-size:11px; width:100px"></label>' +
                 '<select id="ROT_ChooseSub" class="button" href="javascript:void(0);" style="display:inline-block; margin-left:-5px; height:18px; width:19px; font-size:11px; border-radius:10px;">' +
                 '    <option value="tagpro">TagPro</option>' +
                 '    <option value="tagprotesting">TagPro Testing</option>' +
                 '    <option value="tagproscripts">TagPro Scripts</option>' +
                 '    <option value="tagproirl">TagPro IRL</option>' +
                 '    <option value="oceanictagpro">Oceanic TagPro</option>' +
                 '    <option value="eltp">ELTP</option>' +
                 '    <option value="mltp">MLTP</option>' +
                 '    <option value="minorltp">mLTP</option>' +
                 '    <option value="nltp">NLTP</option>' +
                 '    <option value="oltp">OLTP</option>' +
                 '    <option value="uscontenders">USContenders</option>' +
                 '</select>' +
                 '<label title="Unchecked will be &quot;Hot&quot; (reddit default)"><input type="checkbox" id="ROT_NewHot" style="font-size:11px"' + (GM_getValue('NewHot') ? ' checked' : '') + '>New</label>' +
                 '<label># Posts: <input type="number" id="ROT_NumberPosts" value="' + GM_getValue('NumberPosts', 8) + '" min="1" max="25" style="font-size:11px; width:32px"></label>' +
                 '<label><a id="ROT_GoButton" class="button" href="javascript:void(0);" style="display:inline-block; min-width:50px; padding:2px; font-size:11px; border-radius:3px">Refresh</a></label>';
    $('#ROT_Container').append('<div id="ROT_Header" style="margin:2px; font-size:11px; text-align:center">' + header + '</div>');
    $('#ROT_Container').append('<div id="ROT_RedditPosts" style="margin:0; height:100%; overflow-x:hidden; overflow-y:auto;"></div>');
    
    GM_addStyle('#ROT_Header label { margin:0 7px }');

    $('#ROT_SubRedditName').on('change', function(){
        GM_setValue('SubRedditName', this.value);
    });
    $('#ROT_SubRedditName').keydown(function(event) {
        if (event.which == 13) getRedditPosts(); //enter
    });
    $('#ROT_ChooseSub').on('change', function() {
        $('#ROT_SubRedditName').prop('value', this.value);
        GM_setValue('SubRedditName', this.value);
        getRedditPosts();
    });
    $('#ROT_NewHot').on('click', function() {
        GM_setValue('NewHot', $(this).is(':checked'));
    });
    $('#ROT_NumberPosts').on('change', function(){
        GM_setValue('NumberPosts', this.value);
    });
    $('#ROT_GoButton').on('click', function() {
        getRedditPosts();
    });
    $('#ROT_MessagesState').on('click', function() {
        checkUnreadMessages();
    });

    $('#ROT_ChooseSub').prop('value', GM_getValue('SubRedditName', 'tagpro'));
    getRedditPosts();
    checkUnreadMessages();
    if (updateInterval > 0) {
        updateInterval = (updateInterval < 10 ? 10 : updateInterval);
        setInterval(getRedditPosts, updateInterval * 1000);
        setInterval(checkUnreadMessages, updateInterval * 1000);
    }
});