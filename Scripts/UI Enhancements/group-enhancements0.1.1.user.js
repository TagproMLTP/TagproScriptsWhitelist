// ==UserScript==
// @name         TagPro Group Enhancements
// @namespace    http://www.arfie.nl
// @version      0.1.1
// @description  Better group layout
// @author       Ruud Verbeek
// @include      http://tagpro-*.koalabeast.com/groups*
// @include 	 http://tangent.jukejuice.com/groups*
// @include      http://*.newcompte.fr/groups*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var path = document.location.pathname.split('/');

servers = {
    Regular: {
        Chord: {name: 'Chord', url: 'tagpro-chord.koalabeast.com'},
        Orbit: {name: 'Orbit', url: 'tagpro-orbit.koalabeast.com'},
        Diameter: {name: 'Diameter', url: 'tagpro-diameter.koalabeast.com'},
        Pi: {name: 'Pi', url: 'tagpro-pi.koalabeast.com'},
        Radius: {name: 'Radius', url: 'tagpro-radius.koalabeast.com'},
        Segment: {name: 'Segment', url: 'tagpro-segment.koalabeast.com'},
        Origin: {name: 'Origin', url: 'tagpro-origin.koalabeast.com'},
        Sphere: {name: 'Sphere', url: 'tagpro-sphere.koalabeast.com'},
        Centra: {name: 'Centra', url: 'tagpro-centra.koalabeast.com'},
        Arc: {name: 'Arc', url: 'tagpro-arc.koalabeast.com'}
    },
    Testing: {
        Tangent: {name: 'Tangent', url: 'tangent.jukejuice.com'},
        Maptest: {name: 'Maptest', url: 'tagpro-maptest.koalabeast.com'},
        NC1: {name: 'NC Europe', url: 'maptest.newcompte.fr'},
        NC2: {name: 'NC US East', url: 'maptest2.newcompte.fr'},
        NC3: {name: 'NC US West', url: 'maptest3.newcompte.fr'},
        NC4: {name: 'NC Oceanic', url: 'oceanic.newcompte.fr'}
    }
};

if(path.length < 3 || path[2] === '') {
    if(document.location.search.match(/err=banned/))
        $('<div class="section tiny bottomPadding"><div class="error">Sorry, you are banned from this group.</div></div>').insertBefore('.buttons');
    var currentServer = '';
    for(var type in servers) for(var server in servers[type]) {
        var d = servers[type][server];
        if(d.url === tagpro.serverHost)
            currentServer = d;
        else {
            GM_xmlhttpRequest({
                method: 'GET',
                url: 'http://' + d.url + '/groups/',
                onload: (function(d) {return function(response) {
                    var tr = $('<div>').html(response.response).find('tr:not(:first-child)').clone().prepend($('<td>').append($('<a>').attr('href', 'http://' + d.url).text(d.name).css('color', 'white'))).appendTo('.board');
                    tr.find('td:nth-child(2) a[href]').each(function() {$(this).attr('href', 'http://' + d.url + $(this).attr('href'));});
                };})(d)
            });
        }
    }
    $('.alt').removeClass('alt');
    GM_addStyle('.board tr:nth-child(odd) {background-color: #272727;} .board td:nth-child(1) {width: 25%;} .board td:nth-child(3) {width: 20%;}');
    $('.board tr:first-child').prepend('<th>Server</th>');
    $('.board tr:not(:first-child)').prepend($('<td>').append($('<a>').attr('href', 'http://' + currentServer.url).text(currentServer.name).css('color', 'white')));
    return;
}

if(path[2] === 'create') {
    $('form').prepend('<div><label for="server">Server:</label><div><select id="server"></select></div>');
    for(var type in servers) {
        var optgroup = $('<optgroup>').attr('label', type).appendTo('#server');
        for(var server in servers[type]) {
            $('<option value="' + servers[type][server].url + '">').text(servers[type][server].name).appendTo(optgroup);
        }
    }
    $('#server').val(tagpro.serverHost).change(function() {
        $('form').attr('action', 'http://' + $(this).val() + '/groups/create');
    }).css('margin-bottom', '1px');
    return;
}

GM_addStyle(
    '.teams > div {width: 240px !important; float: none !important;}' +
    '#redTeam, #blueTeam {height: auto !important;}' +
    '#spectators, #waiting {position: absolute; right: -240px; height: 300px !important; overflow: visible;}' +
    '#spectators {top: 0;}' +
    '#waiting {bottom: -300px;}' +
    '.teams h2 {text-align: center;}' +
    '.teams li {display: block !important; width: 200px !important; color: inherit !important; height: 21px; margin: 1px 1px 2px 1px !important;}' + 
    '#redTeam ul, #blueTeam ul {min-height: 0 !important; height: 96px !important; overflow-y: auto !important;}' +
    '#spectators ul {overflow-y: auto !important;}' +
    '.teams li div {display: inline-block; max-width: 150px; overflow-x: hidden; text-overflow: ellipsis; white-space: nowrap;}' +
    '.teams li span {float: right; margin-top: 4px !important;}' + 
    '.teams li div::before, .playerName::before {width: 16px; height: 16px; content: ""; display: inline-block; margin-right: 4px;}' + 
    '.teams li.leader div::before, .playerName._leader::before {background-image: url(../images/flair.png); background-position: -32px 0; background-repeat: no-repeat; position: relative; top: 2px;}' +
    '.teams li.you:not(.leader) div::before, .playerName._you:not(._leader)::before {background-image: url(../images/flair.png); background-position: -16px -16px; background-repeat: no-repeat; position: relative; top: 2px;}' +
    '#redTeam input, #blueTeam input {width: 50%;}' +
    '.score {margin-top: 12px !important; margin-left: 0 !important;}' +
    '.score select {margin-left: 4px;}' +
    'body {position: absolute; width: 940px; left: calc(50% - 480px); height: 410px; top: calc(50% - 280px);}' +
    'header {position: absolute; font-size: 200%; font-weight: bold;}' +
    'header a {margin-right: 20px;}' +
    '.teams {position: absolute !important; left: auto !important;}' +
    '#chat {width: 600px; left: 40px !important; position: absolute !important; top: 70px !important; height: 300px; box-sizing: border-box; overflow-x: hidden !important;}' +
    '#chat a {text-decoration: underline; color: #49f;}' +
    '#chatSend {width: 592px !important; left: 40px !important; position: absolute !important; height: 16px; top: 390px;}' +
    '#actions {position: absolute !important; right: 50px !important; bottom: 0 !important; display: block !important; left: auto !important;}' +
    'button, a.button {margin: 10px !important; display: block; min-width: 200px !important;}' +
    '#settings {display: none !important;}' + 
    '#settingsOverview {position: absolute; top: 70px; left: -300px; bottom: auto; height: auto; border: 1px solid rgba(255,255,255,0.20); background-color: rgba(255,255,255,0.10); display: block; width: 300px;}' + 
    '#settingsOverview ul {list-style: initial; max-height: 200px; overflow-y: auto;}' + 
    '#settingsOverview hr {border: 1px solid rgba(255, 255, 255, 0.20); border-width: 1px 0 0 0;}' +
    '#settingsOverview > * {margin: 10px;}' + 
    '#settingsOverview ul li {margin: 5px 0 5px 20px;}' +
    '.changeSettingButton {float: right; color: #0f0; margin-right: 10px; font-size: 75%;}' + 
    '#status {position: absolute !important; right: -200px !important; top: 41px !important; left: auto !important;}' +
    '#playerOptions {display: none !important;}' +
    'body.groupLeader .teams li:hover .playerStatus {display: none !important;}' +
    '.teams li .playerAction {display: none; background-image: url(../images/flair.png); width: 16px; height: 16px; float: right; opacity: 0.4; cursor: pointer; margin: 0 4px; position: relative; top: -2px;}' +
    'body.groupLeader .teams li:hover .playerAction {display: inline-block;}' +
    '.teams li:hover .playerAction:hover {opacity: 1.0;}' +
    '.ban {background-position-x: -64px;}' +
    '.makeLeader {background-position-x: -32px;}' +
    '.leader .makeLeader {display: none !important;}' +
    '#mapSelector {position: absolute; left: -11px; border: 1px solid rgba(255,255,255,0.20); background-color: rgba(255,255,255,0.10); display: block; overflow-y: auto; width: 300px; padding: 10px; box-sizing: border-box;}' +
    '#mapSelectorCategory {width: 100%;}' +
    '.mapSelectorCategory {display: block; margin: 10px auto 0 auto; text-align: center;}' +
    'input[type=number] {width: 96px;}' +
    'input::-webkit-outer-spin-button, input::-webkit-inner-spin-button {-webkit-appearance: none; margin: 0;}' +
    '#mapPreview {width: 100%; margin-top: 10px;}' + 
    '#mapSelector_group5 {width: 100%;}' +
    '#switchServer {padding: 0 20px;}' +
    '#switchServerSelect {width: 100%;}' +
    '#mapTitle {text-align: center; font-weight: bold; font-size: 120%;}' +
    'body.groupLeader #mapTitle {display: none;}' +
    '#settingsOverview select:disabled {background: transparent; border: none; color: white; cursor: text; font: inherit; -webkit-appearance: initial;}' +
    '#settingsOverview input[type=number]:disabled {color: white; background: transparent; border: none; cursor: text;}' +
    '#settingsOverview input[type=checkbox]:not([gamemode=powerups]):disabled {-webkit-appearance: none; margin: 0; font: inherit;}' +
    '#settingsOverview input[type=checkbox]:not([gamemode=powerups]):disabled::after {display: inline; content: "no"; color: white; cursor: text;}' +
    '#settingsOverview input[type=checkbox]:not([gamemode=powerups]):disabled:checked::after {content: "yes";}' +
    '#settingsOverview label {cursor: text;}' +
    '#chat hr {border: 1px solid rgba(255,255,255,0.20); border-width: 1px 0 0 0;}' +
    '#rndTeamsButtons, #swapTeamsButtons {position: absolute; top: -163px; padding: 2px 4px; font-size: 70%; min-width: 25% !important; margin: 0 !important;}' +
    '#rndTeamsButtons {left: 10%;}' +
    '#swapTeamsButtons {right: 10%;}' +
    'input[gamemode=powerups] {-webkit-appearance: none; width: 40px; height: 40px; background-image: url(../images/tiles.png); background-position-x: calc(-12 * 40px);}' +
    'input[gamemode=powerups]:not(:checked) {opacity: 0.3;}' +
    'input[gamemode=powerups]:focus {outline: 0;}' +
    'input#GM_grip {background-position-y: calc(-4 * 40px);}' +
    'input#GM_tagpro {background-position-y: calc(-5 * 40px);}' +
    'input#GM_livingBomb {background-position-y: calc(-6 * 40px);}' +
    'input#GM_speed {background-position-y: calc(-7 * 40px);}' +
    'label[for=GM_grip], label[for=GM_tagpro], label[for=GM_livingBomb], label[for=GM_speed] {display: none;}' +
    'li[gamemode=powerups] div:not(:first-child) {display: inline;}' +
    '#settingsOverview ul select:not(#newRule):not(#newRuleValue):not(:disabled) {background-color: transparent; color: white; border: none; -webkit-appearance: none; font: inherit; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuNWWFMmUAAAA+SURBVChTlYtBDgAwCML8/6fZyQWVYUbSA1UCwBdSOqR0SOngsmUM3Oj+8HPSU+6lEJlxG2JDSoeUDinfIA7S+cJM75pd5gAAAABJRU5ErkJggg==); background-repeat: no-repeat; background-position: right; padding-right: 15px;}' +
    '#settingsOverview ul select:not(#newRule):not(#newRuleValue):not(:disabled) option {color: black;}' +
    '#settingsOverview ul select:not(#newRule):not(#newRuleValue):not(:disabled):focus {outline: 0}' +
    '@media(max-width: 1600px) {' +
        '#settingsOverview {top: 425px; left: 35px;}' +
        '#mapSelector {left:310px; top: 0px; margin: -1px; overflow: visible;}' +
        'body {top: calc(50% - 350px); left: calc(50% - 590px);}' +
        '#mapPreview {height: 171px; width: 171px; margin-left:calc(50% - 85.5px);}}' +
    '#settingsOverview, #mapSelector, #mapPreview, body {transition: left .5s, top .5s, width .5s, height .5s, margin .5s;}'
);

var defaults = {
    time: {
        label: 'Time Limit',
        default: '12',
        optgroup: 'Basic'
    },
    caps: {
        label: 'Cap Limit',
        default: '3',
        optgroup: 'Basic'
    },
    accel: {
        label: 'Acceleration',
        default: '1',
        optgroup: 'Physics'
    },
    topspeed: {
        label: 'Top Speed',
        default: '1',
        optgroup: 'Physics'
    },
    bounce: {
        label: 'Bounciness',
        default: '1',
        optgroup: 'Physics'
    },
    playerRespawnTime: {
        label: 'Players',
        default: '3000',
        optgroup: 'Respawns'
    },
    speedPadRespawnTime: {
        label: 'Boosts',
        default: '10000',
        optgroup: 'Respawns'
    },
    dynamiteRespawnTime: {
        label: 'Bombs',
        default: '30000',
        optgroup: 'Respawns'
    },
    buffRespawnTime: {
        label: 'Powerups',
        default: '60000',
        optgroup: 'Respawns'
    },
    buffDelay: { // golden nub rule
        label: 'Delay Powerups',
        default: false,
        optgroup: 'Miscellaneous'
    },
    potatoTime: {
        label: 'Potato',
        default: '0',
        optgroup: 'Miscellaneous'
    }
};

var gameModes = (tagpro.serverHost.indexOf('newcompte') >= 0) ? {
    gravity: {
        label: 'Gravity',
        settings: {
            juggle: {
                label: 'Juggle',
                default: true
            },
            maxJumpCount: {
                label: 'Jump Amount',
                default: 2
            },
            jumpKey: {
                label: 'Jump Key',
                default: 'up'
            },
            jumpY: {
                label: 'Jump Strength',
                default: -0.5
            },
            gravityY: {
                label: 'Gravity Force',
                default: 4.9
            }
        }
    },
    shapes: {
        label: 'Weird Shapes',
        settings: {
            shape: {
                label: 'Shape',
                default: 'square'
            }
        }
    },
    ffa: {
        label: 'Free for All',
        settings: {
            singleTeam: {
                label: 'Single Team',
                default: true
            },
            deathMatchMode: {
                label: 'Deathmatch',
                default: true
            },
            neutralToggle: {
                label: 'Green Buttons',
                default: true
            }
        }
    },
    gameSettings: {
        label: 'Moar Game Settings', //nc pls
        settings: {
            speedpadModifier: {
                label: 'Boost Power',
                default: '1'
            },
            powerupExpiration: {
                label: 'Pup Duration',
                default: '20000'
            },
            afterPickupInvulnerability: {
                label: 'FC Invulnerability',
                default: '250'
            },
            fcHelp: {
                label: 'FC help',
                default: '0'
            },
            redHelp: {
                label: 'Red Team help',
                default: '0'
            },
            blueHelp: {
                label: 'Blue Team help',
                default: '0'
            }
        }
    },
    powerups: {
        label: 'Select Powerups',
        settings: {
            grip: {
                label: 'Juke Juice',
                default: true
            },
            tagpro: {
                label: 'TagPro',
                default: true
            },
            livingBomb: {
                label: 'Rolling Bomb',
                default: true
            },
            speed: {
                label: 'Top Speed',
                default: false
            }
        }
    },
    modifyExplosions: {
        label: 'Modify Explosions',
        settings: {
            redForce: {
                label: 'Red Pop Force',
                default: '1'
            },
            redDistance: {
                label: 'Red Pop Range',
                default: '3.5'
            },
            blueForce: {
                label: 'Blue Pop Force',
                default: '1'
            },
            blueDistance: {
                label: 'Blue Pop Range',
                default: '3.5'
            },
            rollingForce: {
                label: 'Rolling Bomb Force',
                default: 3
            },
            rollingDistance: {
                label: 'Rolling Bomb Range',
                default: 5
            },
            bombForce: {
                label: 'Bomb Force',
                default: 5
            },
            bombDistance: {
                label: 'Bomb Range',
                default: 7
            },
            portalForce: {
                label: 'Portal Boost Force',
                default: 1
            },
            portalDistance: {
                label: 'Portal Boost Range',
                default: 4
            }
        }
    },
    ghosts: {
        label: 'Ghost Mode',
        settings: []
    }
} : {};

$('#settings').after($('<section>').attr('id', 'settingsOverview'));
$('#settingsOverview').addClass('privateGame').append($('<h2>').text('Game Settings')).append($('<ul>'));
setTimeout(function() {
    $('#settings h2 span').appendTo('#settingsOverview h2').addClass('leader');
}, 1);
$('#rndTeamsButtons').text('Random');
$('#swapTeamsButtons').text('Swap');
$('#settings form div:last-child').css({position: 'absolute', right: '120px', top: '40px'}).addClass('privateGame').appendTo('body');
$('#chat').append($('<div>').attr('id', 'chatInner'));
updateSettings();

function updateSettings() {
    function getValue(el) {
        return $(el).prop('tagName') === 'INPUT' && $(el).attr('type') === 'checkbox' ? $(el).prop('checked') : $(el).attr('type') === 'number' || $(el).attr('jsType') === 'number' ? parseFloat($(el).val()) : $(el).val();
    }
    
    $('#settingsOverview ul > *').remove();
    
    var count = 0;
    var not = [];
    
    // Add rule items
    for(var key in defaults) {
        var val = getValue($('#settings .setting[name=' + key + ']')),
            setting = defaults[key];
        if(val != setting.default) {
            $('<li>')
              .attr('setting', key)
              .text(setting.label + (key === 'buffDelay' ? '' : ': '))
              .append(key === 'buffDelay' ? '' :
                $('#settings .setting[name=' + key + ']').clone().change((function(key) {
                    return function() {
                        tagpro.group.socket.emit('setting', {name: key, value: $(this).val()});
                    };
                })(key)).val(val)
              )
              .append(
                $('<a>') // remove button
                  .attr('href', '#')
                  .addClass('leader')
                  .addClass('changeSettingButton')
                  .text('remove')
                  .click(
                      function(key, val) {
                          return function() {
                              tagpro.group.socket.emit('setting', {
                                  name: key,
                                  value: val
                              });
                          };
                      }(key, setting.default)
                  )
            ).appendTo('#settingsOverview ul');
            ++count;
            not.push(key);
        }
    }
    
    if(count === 0)
        $('<li>').text('Default Settings').appendTo('#settingsOverview ul');
    
    // GameModes
    
    var any = false;
    
    for(var key in gameModes) {
        var gm = gameModes[key],
            enabled = $('.gameModeEnable[gamemode=' + key + ']').prop('checked');
        
        if(enabled) {
            if(!any)
                $('#settingsOverview ul').append($('<hr>'));
            any = true;
            not.push(key);
            var remove = $('<a>').attr('href', '#').text('remove').addClass('changeSettingButton').addClass('leader'),
                div = $('<li>').attr('gamemode', key).append($('<div>').text(gm.label).append(remove));
            $('#settingsOverview ul').append(div);
            remove.click((function(key) {return function() {
                tagpro.group.socket.emit('setting', {
                    gameMode: key,
                    value: false,
                    name: ''
                });
            };})(key));
            for(var child in gm.settings) {
                var setting = gm.settings[child],
                    childDiv = $('<div>').css('margin-left', '10px');
                var input = $('[name=' + child + ']').clone().attr('name','').attr('id', 'GM_' + child).change((function(key, child){return function() {
                    tagpro.group.socket.emit('setting', {
                        gameMode: key,
                        name: child,
                        value: getValue($(this))
                    });
                };})(key, child));
                childDiv.append($('<label>').attr('for', 'GM_' + child).text(setting.label + ': ')).append(input).appendTo(div);
            }
        }
    }
    
    $('<hr>').addClass('leader').appendTo('#settingsOverview ul');
    
    // New Rule
    var newRule = $('<select>')
                    .attr('id', 'newRule')
                    .append(
                        $('<option>')
                          .attr('value', '')
                          .text('Add rule...')
                    )
                    .css('max-width', '120px');
    
    for(key in defaults)
        if(not.indexOf(key) < 0) {
            var optgroup = defaults[key].optgroup;
            if(newRule.find('optgroup[label="' + optgroup + '"]').length === 0)
                newRule.append($('<optgroup>').attr('label', optgroup));
            newRule.find('optgroup[label="' + optgroup + '"]').append(
              $('<option>')
                .attr('value', key)
                .text(defaults[key].label)
              );
        }
    
    if(tagpro.serverHost.indexOf('newcompte') >= 0)
        newRule.append($('<optgroup>').attr('label', 'Special Settings'));
    
    for(var key in gameModes)
        if(not.indexOf(key) < 0)
            newRule.find('optgroup[label="Special Settings"]').append(
              $('<option>')
                .attr('value', 'GM_' + key)
                .text(gameModes[key].label)
              );
    
    newRule.change(function() {
        $('#newRuleValue').remove();
        
        var key = $(this).val();
        if(key.startsWith('GM_'))
            tagpro.group.socket.emit('setting', {
                gameMode: key.substring(3),
                name: '',
                value: true
            });
        else if(key !== "") {
            if(key === 'buffDelay')
                tagpro.group.socket.emit('setting', {name: key, value: true});
            else newRule.after(
              $('#settings .setting[name=' + key + ']').clone()
                .attr('id', 'newRuleValue')
                .removeClass('setting')
                .attr('name', '')
                .css('margin-left', '20px')
                .change(function() {
                  tagpro.group.socket.emit('setting', {
                      name: newRule.val(),
                      value: getValue($('#newRuleValue'))
                  });
                })
            );
        }
    });
    $('<li>').append(newRule).addClass('leader').appendTo('#settingsOverview ul');

    if(!$('body').hasClass('groupLeader'))
        $('#settingsOverview .leader').addClass('hide');
}

$('header').append('Play with Friends');

tagpro.group.socket._callbacks.banned = function() {
    document.location.href = '/groups/?err=banned';
};

tagpro.group.socket.on('removed', function() {if(document.location.href === '/')document.location.href = '/groups/?err=banned';});

unread = 0;
active = true;

$(window).focus(function() {active = true; document.title = 'TagPro Group'; unread = 0;});
$(window).blur(function() {active = false;});

function addChat(msg) {
    $(msg).appendTo('#chat');
    $('#chat').scrollTop($('#chat').get(0).scrollHeight);
    
    var history = GM_getValue('history_' + document.location.pathname.split('/')[2]) || [];
    history.push('<div>' + msg.html() + '</div>');
    GM_setValue('history_' + document.location.pathname.split('/')[2], history);
    
    if(!active)
        document.title = '(' + (++unread) + ') TagPro Group';
}

tagpro.group.socket._callbacks.chat[0] = function(e) {
    var msg = $('<div>');
    
    // parse URLs
    e.message = e.message.replace(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/, function(url) {
        return '<a target="_blank" href="' + url + '">' + url + '</a>';
    });
    
    if(e.from) {
        var leader = false, you = false, color = "#AAAAAA";
        $('.teams li').each(function() {
            var p = $(this).clone();
            p.find('span').remove();
            if(p.text() == e.from) {
                leader = $(this).hasClass('leader');
                you = $(this).hasClass('you');
                switch($(this).parent().parent().attr('id')) {
                    case 'redTeam':
                        color = '#FF6666';
                        break;
                    case 'blueTeam':
                        color = '#6666FF';
                }
            }
        });
        if(e.message.startsWith('[#] ') && leader)
            e.message = e.message.substring(3);
        else
            msg.append($('<span>').addClass('playerName').addClass(leader ? '_leader' : you ? '_you' : '').css('color', color).text(e.from + ': '));
    }
    
    addChat(msg.append(e.message));
};

tagpro.group.leader = '-';

tagpro.group.socket.on('member', function(e) {
    if(e.leader) {
        if(tagpro.group.leader !== e.id && tagpro.group.leader !== "-")
            addChat($("<div>'" + e.name + "' was set as group leader.</div>"));
        tagpro.group.leader = e.id;
    }
});

tagpro.group.socket.on('setting', updateSettings);

if(!($('.teams li').length >= 4 || tagpro.serverHost.indexOf('maptest') >= 0))
    $('.privateGame').addClass('hide');

function playerButtons() {
    $('.teams li').each(function() {
        var c = $(this).children().clone().addClass('playerStatus');
        $(this).children().remove();
        $(this).html('<div>'+$(this).data('model').name+'</div>').prepend(c);
    }).append($('<span>').addClass('ban').addClass('playerAction').attr('title', 'Ban from Group').click(function() {
        tagpro.group.socket.emit('kick', $(this).parent().data('model').id);
    })).append($('<span>').addClass('makeLeader').addClass('playerAction').attr('title', 'Make Leader').click(function() {
        tagpro.group.socket.emit('leader', $(this).parent().data('model').id);
    }));
}

['port', 'you', 'member', 'private', 'removed'].forEach(function(x) {
    tagpro.group.socket.on(x, playerButtons);
});

playerButtons();

// Maps

categories = [];
maps = {};
$('#settings .setting[name=map] > *').each(function(x) {
    if($(this).prop('tagName') === 'OPTGROUP') {
        categories.push(['group' + x, $(this).attr('label'), []]);
        $(this).find('option').each(function() {
            categories[categories.length - 1][2].push([$(this).attr('value'), $(this).text()]);
            maps[$(this).attr('value')] = {
                category: categories.length - 1
            };
        });
    } else {
        if($(this).attr('value') === '[object Object]') {
            categories.push(['jj1', 'maps.jukejuice.com']);
            categories.push(['jj2', 'unfortunate-maps.jukejuice.com']);
        } else
            categories.push(['random', 'Random Map']);
    }
});

mapIds = { // positive is unfortunate-maps.jukejuice.com, negative is maps.jukejuice.com. always prefer unfortunate-maps because it has better previews. this was a lot of work so respect it pls
    '45': 28,
    '00101010': 5660,
    'AngryPig': 5430,
    'Backdoor': 5416,
    'Basketball': -6503,
    'Battledome2': -1879,
    'BomberDOME': -1913,
    'Boosts': -1594,
    'BotBattle': 16050,
    'Bounce': -3318,
    'BuddySystem': 1184,
    'Bulldog': 9201,
    'CFB': 4931,
    'ChaosBall': -3453,
    'Classico': 4995,
    'Cloud': 5433,
    'CommandCenter': 3,
    'Constriction': 4915,
    'DZ4': 11158,
    'DangerZone': 13358,
    'Diamond': 6295,
    'Dodgeball': 763,
    'Draft': 13383,
    'Duel': 4999,
    'EMERALD': 5436,
    'FindTheKey': -2320,
    'Flame': 5057,
    'Foozball': 4934,
    'Frontdoor': 5439,
    'GameMode': -3335,
    'GateKeeper': 2620,
    'GrailOfSpeed': 4916,
    'Hockey': 12334,
    'HolySee': 373,
    'Hornswoggle': 584,
    'Hourglass': 4906,
    'Hub': 9200,
    'Hurricane2': 2730,
    'HyperReactor': 374,
    'Hyperdrive': 4914,
    'IRON': 170,
    'IceRink': -1974,
    'Jagged': 4935,
    'Kite': 5327,
    'Madness': -1789,
    'Micro': 4929,
    'Monarch': 9637,
    'OFM': -3299,
    'Penalties': -3300,
    'Pilot': 690,
    'Platypus': 7666,
    'PushIt': -3302,
    'RedRover': -1851,
    'Renegade': 5481,
    'Rink': 4926,
    'RiskAndReward': 376, //glory hole
    'RocketBalls': 4912,
    'Rugby': 16051,
    'Rush': 12192,
    'SaM': 16052, //sharks and minnows
    'Shine': 4917,
    'Simplicity': 377,
    'Smirk': 4913,
    'SuperDuperStamp': 2731,
    'TRArcTurnSpike': 6742,
    'TRCalmSlopes': 6661,
    'TRMagic8Lanes': 11803,
    'TRPokeBomb': -3541,
    'TRRainbowRoad': 6740,
    'TRSerpentSwerve': 8995,
    'TRSnooTrack': 3041,
    'TRSpaceShuttle': 158,
    'TRSpinoutRaceway': 6664,
    'TRThreeCourseMeal': 702,
    'TRTickTock': 157,
    'TRWonky': 161,
    'TRWormy': 8997,
    'ThinkingWithPortals': 5937,
    'ThunderDome': -1834, //mirrored version but only i could find
    'Transilio': 9015,
    'Ultradrive': 6008,
    'Volt': 4918,
    'WTFdome': -1984,
    'War': -679,
    'WelcomeToMars': -1636,
    'Wombo_Combo': 10135,
    'arena': -1588,
    'battery': 362,
    'bird': 365,
    'blastoff': 366,
    'bomber': 367,
    'boombox': 368,
    'caravan': 6291,
    'centerflag': 4891,
    'clutch': 4892,
    'colors': 370,
    'community1': 4902, //Pokeball
    'elimination1v1multi': -1956,
    'elimination4v4': -1954,
    'evenhorizon2': 6632,
    'fullspeed': 4893,
    'gamepad': 372,
    'lold': 4907,
    'map2-2': 4895, //Figure 8
    'marsballrace': -2303,
    'nfm': -2758,
    'oval': 375,
    'reflex2': 4911,
    'ricochet': 4920,
    'shortcut': 4903,
    'snes': 4938,
    'snipers2': -2121,
    'snipers3': -1623,
    'speedway': 4904,
    'spiders': 4930,
    'star': 378,
    'swoop': 379,
    'teamwork': 4898, //GeoKoala
    'thinking': -2276, //Thinking with neutral flags
    'twister': 4996,
    'vee2': 4921, //Big Vird
    'velocity': 4923,
    'whirlwind': 898,
    'wormy': 1167,
    'yiss 3.2': 4940,
    'Fiend': 14696,
    'Sediment': 16449,
    'Citadel': 17623,
    'Graphite': 17775,
    'Saigon': 17656,
    'Tombolo': 17615
};

$('#settingsOverview').append($('<section>').addClass('privateGame').attr('id', 'mapSelector').append($('<div>').addClass('leader').append($('<select>').addClass('setting').attr('id', 'mapSelectorCategory'))));

categories.forEach(function(x) {
    $('#mapSelectorCategory').append($('<option>').attr('value', x[0]).text(x[1]));
    var $el;
    switch(x[0]) {
        case 'random': return;
        case 'jj1': case 'jj2': $el = $('<input>').attr('type', 'number').attr('placeholder', 'ID'); break;
        default: $el = $('<select>').append($('<option>').attr('value', '__none__').text('')); x[2].forEach(function(y) {
            $el.append($('<option>').attr('value', y[0]).text(y[1]));
        });
    }
    $el.attr('id', 'mapSelector_' + x[0]).addClass('setting').addClass('mapSelectorCategory').appendTo('#mapSelector > div').hide();
});

$('#mapSelector').append($('<h3>').attr('id', 'mapTitle')).append($('<img>').attr('id', 'mapPreview').fadeOut().on('load', function() {$(this).fadeIn();}));

$('#mapSelectorCategory').change(function() {
    if($(this).val() === 'random')
        tagpro.group.socket.emit('setting', {name: 'map', value: ''});
    $('.mapSelectorCategory').hide();
    $('#mapSelector_' + $(this).val()).show();
});

changeTimeout = 0;

function setPreview(url) {
    changeTimeout > 0 && clearTimeout(changeTimeout);
    changeTimeout = setTimeout(function() {
        $('#mapPreview').fadeOut();
        setTimeout(function() {
            $('#mapPreview').attr('src', url);
        }, 250);
    }, 750);
}

$('select.mapSelectorCategory').change(function() {
    if($(this).val() !== '__none__') {
        tagpro.group.socket.emit('setting', {name: 'map', value: $(this).val()});
        setPreview('http://' + (mapIds[$(this).val()] > 0 ? 'unfortunate-maps' : 'maps') + '.jukejuice.com/static/thumbs/' + Math.abs(mapIds[$(this).val()]) + '.png');
    }
});

jjSelectTimeout = 0;

function updateJJ(id, val) {
    tagpro.group.socket.emit('setting', {
        name: 'mapId',
        value: val
    });
    tagpro.group.socket.emit('setting', {
        name: 'mapSite',
        value: id === 'mapSelector_jj2' ? 1 : 0
    });
}

$('#mapSelector_jj1, #mapSelector_jj2').keyup(function() {
    setPreview('http://' + ($(this).attr('id') === 'mapSelector_jj2' ? 'unfortunate-maps' : 'maps') + '.jukejuice.com/static/thumbs/' + $(this).val() + '.png');
    jjSelectTimeout > 0 && clearTimeout(jjSelectTimeout);
    jjSelectTimeout = setTimeout(updateJJ, 500, $(this).attr('id'), $(this).val());
});
    
tagpro.group.socket.on('setting', function(s) {
    if(s.name === 'map') {
        var jj = typeof s.value === 'object', map = jj ? {category: 1 + s.value.site} : maps[s.value] || {category: 0}, category = categories[map.category];
        $('#mapSelectorCategory').val(category[0]);
        $('select.mapSelectorCategory').val('__none__');
        $('#mapSelector_jj1, #mapSelector_jj2').val('');
        $('.mapSelectorCategory').hide();
        $('#mapSelector_' + category[0]).val(jj ? s.value.id : s.value).show();
        if(jj || s.value != NaN)
            setPreview(jj ? 'http://' + ['maps', 'unfortunate-maps'][s.value.site] + '.jukejuice.com/static/thumbs/' + s.value.id + '.png'
                          : 'http://' + (mapIds[s.value] > 0 ? 'unfortunate-maps' : 'maps') + '.jukejuice.com/static/thumbs/' + Math.abs(mapIds[s.value]) + '.png');
        $('#mapTitle').text(jj ? s.value.name : $('#mapSelector option[value=' + s.value + ']').text() || 'Random Map');
    }
});

// Chat History

function loadLog(log) {
    var history = log;

    if(history.length > 0)
        $('#chat').prepend($('<hr>'));

    $('#chat').prepend(history.join(''));
}
loadLog(GM_getValue('history_' + document.location.pathname.split('/')[2]) || []);

setTimeout(function(){$('#chat').scrollTop($('#chat').get(0).scrollHeight);},500);

// Server switcher

newGroupForm = $('<form>').attr('method', 'POST').attr('target', '_blank').append($('<input>').attr('name','name')).append($('<input>').attr('type','checkbox').attr('name','public'));

$('#actions').append($('<div>').attr('id', 'switchServer').addClass('leader').append($('<select>').attr('id', 'switchServerSelect').append($('<option>').attr('value', '').text('Switch Server...'))));
for(var type in servers) {
    var optgroup = $('<optgroup>').attr('label', type);
    for(var server in servers[type])if(servers[type][server].url !== tagpro.serverHost) {
        var option = $('<option>').attr('value', servers[type][server].url).text(servers[type][server].name).appendTo(optgroup);
        ping(servers[type][server], function(x) {
            $('option[value="' + x.url + '"]').text(x.name + (x.error ? '' : ' (' + x.players + (x.players === 1 ? ' player' : ' players') + ')'));
        });
    }
    optgroup.appendTo('#switchServerSelect');
}

$('#switchServerSelect').change(function() {
    var transferredSettings = {};
    $('.setting').each(function() {
        if(!($('.setting[name=map]').val() !== '[object Object]' && ($(this).attr('name') === 'mapId' || $(this).attr('name') === 'mapSite')))
            transferredSettings[$(this).attr('name')] = ($(this).attr('type') === 'checkbox' ? $(this).prop('checked') : $(this).val());
    });
    console.log('Switching to ' + $(this).val() + ' with settings ' + JSON.stringify(transferredSettings));
    GM_setValue('transferredSettings', transferredSettings);
    GM_setValue('transferredChatLog', GM_getValue('history_' + document.location.pathname.split('/')[2]));
    GM_deleteValue('newGroupURL');
    newGroupForm.attr('action', 'http://' + $(this).val() + '/groups/create').submit();
    tagpro.group.socket.emit('chat', '[#] Creating a new group on ' + $(this).val() + '...');
    $(this).val('').prop('disabled', true);
    interval = setInterval(function() {
        if(GM_getValue('newGroupURL')) {
            clearInterval(interval);
            $('#switchServerSelect').prop('disabled', false);
            tagpro.group.socket.emit('chat', '[#] New group: ' + GM_getValue('newGroupURL'));
        }
    }, 10);
});

if(GM_getValue('transferredSettings')) {
    var transferredSettings = GM_getValue('transferredSettings');
    GM_setValue('history_' + document.location.pathname.split('/')[2], GM_getValue('transferredChatLog'));
    loadLog(GM_getValue('transferredChatLog') || []);
    GM_deleteValue('transferredSettings');
    GM_deleteValue('transferredChatLog');
    console.log('Restoring settings ' + JSON.stringify(transferredSettings));
    for(var key in transferredSettings)
        tagpro.group.socket.emit('setting', {name: key, value: transferredSettings[key]});
    GM_setValue('newGroupURL', document.location.href);
}

function ping(server, callback) {
    $.ajax({
        url:'http://'+server.url+'/stats?callback=?',
        timeout:1000,
        success:function(response) {
            server.players = response.players;
            server.error = false;
            callback(server);
        },
        error:function() {
            server.error = true;
            callback(server);
        },
        dataType:'json'
    });
}