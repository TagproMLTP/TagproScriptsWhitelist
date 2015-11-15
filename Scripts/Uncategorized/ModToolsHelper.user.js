// ==UserScript==
// @name         Mod Tools Helper
// @namespace    http://www.reddit.com/u/bizkut
// @updateURL   https://github.com/mcgrogan91/TagProScripts/raw/master/modtools.user.js
// @version      1.1.10
// @description  It does a lot.
// @author       Bizkut
// @include      http://tagpro-*.koalabeast.com/moderate/*
// @include      http://tangent.jukejuice.com/moderate/*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.js
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==
if (window.location.pathname.indexOf("fingerprints") > -1) {
    $("div a").each(function (index, domObject) {
        var obj = $(domObject);
        $.get(obj[0].href, function (data) {
            var hoursago = ($($(data).children("form").children()[2]).children("span").text());
            var lastIp = ($($(data).children("form").children()[3]).children("a").text());
            obj.append(" - Last Played: " + hoursago + " | IP: " + lastIp)
            var hours = hoursago.split(" ")[0];
            var hoursAsFloat = parseFloat(hours);
            if (hoursAsFloat <= 1) {
                obj.css({
                    'color': 'green'
                });
            }
            if (data.indexOf("unbanButton") > -1) {
                obj.append(" (This user is currently banned)");
                obj.css({
                    'color': 'red',
                })
            }
        });
    });
}
if (window.location.pathname.indexOf("reports") > -1) {

    function bindReason(e) {
        var t = moderate.kickReasons["" + e];
        return t ? t.text : ""
    }
    function bindPlayerName(e) {
        return e ? e.reservedName : ""
    }

    function bindSince(e) {
        return e ? moment(e).format("MMMM D YYYY h:mm:ss A") : "-"
    }

    function bindDate(e) {
        return moment(e).format("LLL")
    }

    function bindChatTo(e) {
        switch (e) {
            case 1:
                return "All";
            case 2:
                return "Team";
            case 3:
                return "Mod";
            default:
                return ""
        }
    }

    function bindUserId(e) {
        return e ? e : ""
    }

    function bindGameState(e) {
        switch (e) {
            case 1:
                return "In Progress";
            case 2:
                return "Completed";
            case 3:
                return "Starting";
            default:
                return "I Dunno"
        }
    }

    function bindBool(e) {
        return e ? "Yes" : "No"
    }

    function bindValue(e) {
        return e ? e : ""
    }
    $("#filters").append("<input type='checkbox' id='toggleSys'>Hide system reports</input>");
    if(GM_getValue("hideSystem")===true){
        $("#toggleSys").prop('checked', true);
    }
    $("#toggleSys").on('change', function() {
        if($(this).is(":checked")) {
            GM_setValue("hideSystem", true)
        } else {
            GM_setValue("hideSystem", false)
        }
    })

    moderate.smartBind = function smartBind($template, data) {
            var games = {};
            function bind($template, obj) {
                var $result = $template.clone();
                return $result.find("[data-bind]").each(function() {
                    var property = $(this).attr("data-bind"),
                        format = $(this).attr("data-format"),
                        filterProperty = $(this).attr("data-filter-bind"),
                        value = null;
                    eval("value = obj." + property);
                    if(property === "gameId") {
                        games[value] = games[value]? games[value]+1 : 1;
                    }
                    if (filterProperty) {
                        var filterValue = null;
                        value && eval("filterValue = value." + filterProperty), $(this).attr("data-filter-value", filterValue)
                    }
                    if (format) {
                        var func = null;
                        eval("func = " + format), value = func(value)
                    }
                    if (GM_getValue("hideSystem")===true) {
                        if (property == "byIP" && value == null) {
                            $(this.parentNode.parentNode).css("display", "none")
                            return;
                        }
                    }
                    $(this).text(value)
                }), $result.find("button[data-link]").each(function() {
                    var e = "chat?",
                        t = $(this),
                        n = t.parents("tr:first"),
                        r = $(this).attr("data-params").split(" ").map(function(e) {
                            var t = n.find("[data-bind=" + e + "]"),
                                r = t.attr("data-filter-value") ? t.attr("data-filter-value") : t.text();
                            return e + "=" + r
                        }).join("&");
                    t.attr("data-link", e + r)
                }), $result.find("a[data-link]").each(function() {
                    var e = "chat?",
                        t = $(this),
                        n = t.parents("tr:first"),
                        r = $(this).attr("data-params").split(" ").map(function(e) {
                            var t = n.find("[data-bind=" + e + "]"),
                                r = t.attr("data-filter-value") ? t.attr("data-filter-value") : t.text();
                            return e + "=" + r
                        }).join("&");
                    t.attr("href", e + r)
                }), $result.find("[data-if]").each(function() {
                    var property = $(this).attr("data-if"),
                        value = null;
                    try {
                        eval("value = obj." + property)
                    } catch (e) {}
                    if (!value) return $(this).remove();
                    $(this).attr("href", $(this).attr("href").replace(/{value}/g, value))
                }), $result.find("[data-strike-if]").each(function() {
                    var property = $(this).attr("data-strike-if"),
                        value = null;
                    try {
                        eval("value = obj." + property)
                    } catch (e) {}
                    if (value) return $(this).css("text-decoration", "line-through")
                }), $result
            }

            var rows = Array.isArray(data) ? data.map(function(e) {
                return bind($template, e)
            }) : bind($template, data);
            rows.forEach(function(element) {
                var text = $(element).children()[6].innerText;
                if(games[text] > 2) {
                    $($(element).children()[6]).prepend("("+games[text]+") ").css({'color':'red'});
                }
            });
            return rows;
        };
}

if(window.location.pathname.indexOf('chat') > -1) {
    moderate.smartBind = function smartBind($template, data) {
        function bind($template, obj) {
            var $result = $template.clone();
            return $result.find("[data-bind]").each(function() {
                var property = $(this).attr("data-bind"),
                    format = $(this).attr("data-format"),
                    filterProperty = $(this).attr("data-filter-bind"),
                    value = null;
                eval("value = obj." + property);
                if (filterProperty) {
                    var filterValue = null;
                    value && eval("filterValue = value." + filterProperty), $(this).attr("data-filter-value", filterValue)
                }
                if (format) {
                    var func = null;
                    eval("func = " + format), value = func(value)
                }
                $(this).text(value)
            }), $result.find("button[data-link]").each(function() {
                var e = "chat?",
                    t = $(this),
                    n = t.parents("tr:first"),
                    r = $(this).attr("data-params").split(" ").map(function(e) {
                        var t = n.find("[data-bind=" + e + "]"),
                            r = t.attr("data-filter-value") ? t.attr("data-filter-value") : t.text();
                        return e + "=" + r
                    }).join("&");
                t.attr("data-link", e + r)
            }), $result.find("a[data-link]").each(function() {
                var e = "chat?",
                    t = $(this),
                    n = t.parents("tr:first"),
                    r = $(this).attr("data-params").split(" ").map(function(e) {
                        var t = n.find("[data-bind=" + e + "]"),
                            r = t.attr("data-filter-value") ? t.attr("data-filter-value") : t.text();
                        return e + "=" + r
                    }).join("&");
                t.attr("href", e + r)
            }), $result.find("[data-if]").each(function() {
                var property = $(this).attr("data-if"),
                    value = null;
                try {
                    eval("value = obj." + property)
                } catch (e) {}
                if (!value) return $(this).remove();
                $(this).attr("href", $(this).attr("href").replace(/{value}/g, value))
            }), $result.find("[data-strike-if]").each(function() {
                var property = $(this).attr("data-strike-if"),
                    value = null;
                try {
                    eval("value = obj." + property)
                } catch (e) {}
                if (value) return $(this).css("text-decoration", "line-through")
            }), $result
        }
        return Array.isArray(data) ? data.map(function(e) {
            return bind($template, e)
        }) : bind($template, data)
    };
    function bindDate(e) {
        return moment(e).format("MMMM D YYYY h:mm:ss A");
    }
    $('#reportRows').on('click', 'th', function() {
        var $this = $(this);
        if ($this.parent().children()[6] != this) { return; }

        if ($this.data('selected')) {
            $this.removeData('selected');
        } else {
            $this.data('selected', true);
        }
        $this.css('background-color', $this.data('selected')?'#444':'');
    });

    $('#report .buttons').append($('<button id="copyToClipboard" class="small">Get Selected Text</button>').click(function() {
        var copyStr = "";
        $('#reportRows tr').find('th:eq(6)').each(function(idx, el) {
            var $el = $(el);
            if ($el.data('selected')) {
                copyStr = $el.prev().text()+ ": " + $el.text() + "   \n" + copyStr;
            }
        });
        copyStr = ">"+copyStr;

        $('.copybox').remove();
        var $text = $('<textarea class="copybox" style="height:1.2em;vertical-align:bottom"></textarea>').text(copyStr);
        $('#report .buttons').append($text);
        $text.select();
    } ))
}

if(window.location.pathname.indexOf('users') > -1 || window.location.pathname.indexOf('ips') > -1) {
        if(window.location.pathname.indexOf('users') > -1) {
          var fingerprints = $('a[href*="fingerprints"]').parent();
          //fingerprints.hide();
          var par = fingerprints.parent();
          var togglePrints = $("<span id='togglePrints'>[-] Collapse</span>");
          if(GM_getValue("hideFingerprints")===true) {
            togglePrints = $("<span id='togglePrints'>[+] Expand</span>");
            fingerprints.hide();
          }
          togglePrints.on('click', function(e) {
              if(fingerprints.is(':visible')) {
                  fingerprints.hide();
                  GM_setValue("hideFingerprints", true);
                  togglePrints.text('[+] Expand');
              } else {
                fingerprints.show();
                GM_setValue("hideFingerprints", false);
                togglePrints.text('[-] Collapse');
              }
          })
          $(par.children()[0]).after(togglePrints);

        }
        var selectCopy = $("#banSelect").clone();
        selectCopy.attr('id', "banCopy");
        var prevChild = $("#banSelect").prev();
        $("#banSelect").remove();
        prevChild.after(selectCopy);

        $("#unbanButton").remove();
        var unban = $("<button id='unbanButton' class='tiny'>Unban</button>");
        prevChild.parent().prev().append(unban);

        var currentBanCount = $("#banCount").val();
        var select = $("<select id = 'removeCount'/>");
        var error = null;
        for(var i=1; i<= currentBanCount;i++)
        {
            $("<option />", {value: i, text: i}).appendTo(select);
        }
        select.appendTo(unban.prev());
        $("#unbanButton").off('click');
        unbanClicked = false;
        $("#unbanButton").on('click.bizkut',function(e){
            e.preventDefault();
            var removeBans = $("#removeCount").val();
            if(unbanClicked === false) {
              unbanCallback();
            } else {
              alert("You already clicked unban once u dink");
            }

            function unbanCallback()
            {
                unbanClicked = true;
                if(removeBans > 0)
                {
                    console.log('removing 1 ban');
                    removeBans--;
                    $.post(document.location.href + "/unban", {}, function(e) {
                        if (!e) return;
                        if(e.alert)
                        {
                            alert(e.alert);
                            error = true;
                        }
                        if(!error){
                            unbanCallback();
                        }
                    });
                }
                else
                {
                    location.reload();
                }
            }
        });

    var banAmount = $("<select id='banAmount' />");
    for(var x = 1;x<=10;x++)
    {
        $("<option />", {value: x, text: x}).appendTo(banAmount);
    }

    prevChild.parent().append(banAmount);

    var submitBan = $("<button id='submitBan' class='tiny'>BAN EM</button>");
    var banClicked = false;
    submitBan.on('click', function(e) {
        e.preventDefault();
        var banReason = $("#banCopy").val();


        var start = parseInt($("#banCount").val());
        var finish = start + parseInt($("#banAmount").val());


        if(banClicked === false){
          banCallback();
        } else {
          alert("You already clicked ban once u dink");
        }

        function banCallback()
        {
            banClicked = true;
            if(start < finish)
            {
                start++;
                console.log('banning');
                $.post(document.location.href + "/ban", {
                            reason: banReason,
                            banCount: start
                        }, banCallback);
            }
            else
            {
                location.reload();
            }
        }
    });
    prevChild.parent().append(submitBan);

    var profId = window.location.pathname.substr(window.location.pathname.lastIndexOf('/') + 1);
    if(profId !== 'users') {
        $("<h2 id='comment_title'>Comments</h2>").appendTo("#content");

        $.get("http://104.236.225.6/comment/"+profId, function (data) {
            $(data).insertAfter("#comment_title");

            $("<textarea id='comment_box' />").insertAfter($('#comments'));

            var makeComment = $("<button id='submitComment' class='tiny'>Submit</button>");
            var cancelComment = $("<button id='cancelComment' class='tiny'>Cancel</button>")
            var commented = false;
            makeComment.on('click', function() {
              var text = $("#comment_box").val();
              if($.trim(text).length !== 0) {
                if(commented === false) {
                  commented = true;
                  $.get(window.location.origin, function (data) {
                      var hrf = $(data).find("a:contains('Profile')")[0].href;
                      $.get(hrf, function (data2) {
                            var username = $(data2).find("#reservedName").val();
                             $.post( "http://104.236.225.6/comment", { profile: profId, comment: text, modName: username })
                               .done(function( data ) {
                                 location.reload();
                             });
                            //alert("Comment saving under construction, "+username);
                      });
                  });
                } else {
                  alert("You already clicked comment once u dink");
                }
              }
            });
            cancelComment.on('click', function() {
              $("#comment_box").val("");
            });

            makeComment.insertAfter($("#comment_box"));
            cancelComment.insertAfter(makeComment);
            $("<br/>").insertBefore(makeComment);
        });
    }
}
