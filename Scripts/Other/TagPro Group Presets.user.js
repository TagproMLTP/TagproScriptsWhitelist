// ==UserScript==
// @name         TagPro Group Presets
// @namespace    http://www.arfie.nl
// @version      1.1.1
// @description  Allows you to create presets for group/private game settings
// @author       Ruud Verbeek
// @include      http://tagpro-*.koalabeast.com/groups/*
// @include 	 http://tangent.jukejuice.com/groups/*
// @include      http://maptest*.newcompte.fr/groups/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

function savePresets() {
    GM_setValue('presets', presets);
}

function loadPresets() {
    presets = GM_getValue('presets', {});
}

loadPresets();

var defaults = [
    ['redTeamName', 'Red Team Name', 'Red'],
    ['blueTeamName', 'Blue Team Name', 'Blue'],
    ['redTeamScore', 'Red Score', '0'],
    ['blueTeamScore', 'Blue Score', '0'],
    ['map', 'Map', ''],
    ['time', 'Time Limit', '12'],
    ['caps', 'Capture Limit', '3'],
    ['accel', 'Acceleration', '1'],
    ['topspeed', 'Top Speed', '1'],
    ['bounce', 'Bounciness', '1'],
    ['playerRespawnTime', 'Player Respawn Time', '3000'],
    ['speedPadRespawnTime', 'Boost Respawn Time', '10000'],
    ['dynamiteRespawnTime', 'Bomb Respawn Time', '30000'],
    ['buffRespawnTime', 'Powerup Respawn Time', '60000'],
    ['potatoTime', 'Potato', '0'],
    ['selfAssignment', 'Allow self-assignment', true]
];

presets['Default'] = {
    _defaults: true, // set other settings to default
    _standard: true // can't be removed
};
presets['Pick Up Game'] = {
    caps: 0,
    time: 10,
    
    _defaults: false,
    _standard: true
};
presets['Hockey'] = {
    map: 'Hockey',
    caps: 0,
    time: 10,
    
    _defaults: false,
    _standard: true
};
presets['Open Field Masters'] = {
    map: 'OFM',
    time: 5,
    
    _defaults: false,
    _standard: true
};
presets['Duel'] = {
    map: 'Duel',
    time: 5,
    playerRespawnTime: 1500,
    caps: 0,
    
    _defaults: false,
    _standard: true
};

function encodePreset(preset) {
    !(preset.hasOwnProperty('_defaults') && preset._defaults === false) || delete preset._defaults;
    return btoa(JSON.stringify(preset));
}

function decodePreset(preset) {
    return JSON.parse(atob(preset));
}

function readPreset() {
    var preset = {};
    for(var i in defaults) {
        var setting = defaults[i];
        var el = $('#preset-'+setting[0]);
        if($('#preset-enabled-'+setting[0]).prop('checked'))
            preset[setting[0]] = el.attr('type') === 'checkbox' ? el.prop('checked') : el.val();
    }
    preset._defaults = $('#defaults').prop('checked');
    return preset;
}

function updateCode() {
    $('#presetCode').val(encodePreset(readPreset()));
}

function isLeader() {return !$('[name=map]').prop('disabled');}

function apply(preset) {
    function set(setting, value) {
        tagpro.group.socket.emit('setting', {name: setting, value: value});
    }
    if(isLeader()) {
        var setDefaults = preset._defaults;
        for(var i in defaults) {
            var setting = defaults[i];
            if(preset[setting[0]] !== undefined)
                set(setting[0], preset[setting[0]]);
            else if(setDefaults)
                set(setting[0], setting[2]);
        }
    } else console.log('you need to be leader');
}

function fillPresetEditor(preset) {
    resetEditor();
    for(var setting in preset) {
        var val = preset[setting];
        switch(setting) {
            case '_defaults': $('#defaults').prop('checked', val); break;
            case 'selfAssignment':
                $('#preset-selfAssignment').prop('checked', val).parent().parent().css({color:'white'}).find('td:first-child input').prop('checked', true);
                break;
            default:
                $('#preset-'+setting).val(val).parent().parent().css({color:'white'}).find('td:first-child input').prop('checked', true);
                break;
        }
    }
}

function fillInPresets() {
    function usePreset(preset) {
        return function() {
            $('.presetsWindow').fadeOut();
            apply(preset);
        };
    }
    function editPreset(name, preset) {
        return function() {
            fillPresetEditor(preset);
            $('#presetName').val(name);
            updateCode();
            $('#newPresetSave').css({opacity: name ? '1.0' : '0.25'});
            $('#newPresetWindow').fadeIn();
        };
    }
    $('#presetsWindow table tr').remove();
    for(var preset in presets) {
        var tr = $('<tr></tr>');
        tr.append('<td style="width: 60%;"><a class="presetUse">'+preset+'</a></td>');
        if(!presets[preset]._standard)
            tr.append('<td style="width: 20%;"><a class="presetEdit">edit</a></td><td style="width: 20%;"><a class="presetRemove">delete</a></td>');
        else
            tr.find('td').attr('colspan', 3);
        
        tr.appendTo('#presetsWindow table');
        
        tr.find('td a.presetUse').click(usePreset(presets[preset]));
        tr.find('td a.presetEdit').click(editPreset(preset, presets[preset]));
        tr.find('td a.presetRemove').click(function(preset){return function() {
            delete presets[preset];
            savePresets();
            fillInPresets();
        };}(preset));
    }
    $('#presetsWindow table').append('<tr><td style="background-color:transparent"><a id="newPresetButton">New preset</a></td><td style="background-color:transparent"/><td style="background-color:transparent"/></tr>');
    $('#newPresetButton').click(editPreset('', {}));
}

function resetEditor() {
    $('#defaults').prop('checked', false);
    for(var i in defaults) {
        var setting = defaults[i];
        $('#preset-enabled-'+setting[0]).prop('checked', false).parent().parent().css({color:'gray'});
        if(setting[0] === 'selfAssignment')
            $('#preset-selfAssignment').prop('checked', true);
        else
            $('#preset-'+setting[0]).val(setting[2]);
    }
}

$('#settings h2').append('<span><a id="presetsButton">Presets</a><a id="resetButton">Reset</a></span>');

$('body').append('<div id="presetsWindow" class="window presetsWindow"></div><div class="presetsWindow" id="presetsWindowOverlay"></div>');
$('#presetsWindow')
	.append('<h2>Presets</h2>')
	.append('<table style="border-collapse: separate; border-spacing: 2px;"></table>')
	.append('<a id="presetsClose">Close</a>');

$('body').append('<div class="window" id="newPresetWindow"></div>');
$('#newPresetWindow')
	.append('<h2>New Preset<a id="resetEditor">Reset</a></h2>')
	.append('<input type="text" id="presetName" placeholder="Name..." />')
	.append('<table></table>')
    .append('<input type="checkbox" id="defaults"/><label for="defaults">Reset other settings to defaults</label>')
    .append('<div id="presetCodeDiv"><label for="presetCode">Code to share:</label><input id="presetCode"/></div>')
	.append('<a style="opacity:0.25" id="newPresetSave">Save</a><a id="newPresetCancel">Cancel</a>');

$('#presetCode').click(function() {
    $(this).select();
}).keyup(function() {
    $(this).css('border-color', 'white');
    try {
        fillPresetEditor(decodePreset($(this).val()));
    } catch(e) {
        $(this).css('border-color', 'red');
    }
});

for(var i in defaults) {
    var setting = defaults[i];
    var tr = $('<tr></tr>');
    tr.append('<td style="width:24px;"><input type="checkbox" id="preset-enabled-'+setting[0]+'"/></td>');
    tr.append('<td style="width:160px;"><label for="preset-'+setting[0]+'">'+setting[1]+'</label></td>');
    tr.append('<td></td>');
    var el = $('[name='+setting[0]+']').clone().appendTo(tr.find('td:last-child')).attr('id', 'preset-'+setting[0]).attr('name', null).unbind();
    if(setting[0] === 'map') {
        el.find('option[value=marsballrace]').text('Anger Management');
        el.find('> option:nth-child(2)').remove();
    }
    tr.appendTo('#newPresetWindow table');
    
    if(setting[0] === 'selfAssignment')
        el.prop('checked', true);
    else
        el.val(setting[2]);
    
    tr.find('td:first-child input').change(function(name, def){return function() {
    	if(!$(this).prop('checked'))
            $('#preset-'+name).val(def);
        $(this).parent().parent().css({color: $(this).prop('checked') ? 'white' : 'gray'});
        updateCode();
    };}(setting[0], setting[2]));
    
    el.on(el.attr('type') === undefined && el.prop('tagName') === 'INPUT' ? 'keyup' : 'change', function(def){return function(){
        var val = $(this).attr('type') === 'checkbox' ? $(this).prop('checked') : $(this).val();
    	$(this).parent().prev().prev().find('input').prop('checked', val != def);
        $(this).parent().parent().css({color: val != def ? 'white' : 'gray'});
        updateCode();
    };}(setting[2]));
}

fillInPresets();

$('#presetsButton').click(function() {$('.presetsWindow').fadeIn();});
$('#resetButton').click(function() {apply({_defaults:true});});
$('#presetsClose').click(function() {$('.presetsWindow').fadeOut();});

$('#resetEditor').click(function() {
    $('#presetName').val('');
    $('#newPresetSave').css({opacity:'0.25'});
    resetEditor();
    updateCode();
});

$('#presetName').keyup(function() {
    $('#newPresetSave').css({opacity: $(this).val() === '' ? '0.25' : '1.0'});
});

$('#newPresetSave').click(function() {
    if($('#presetName').val() !== '') {
        presets[$('#presetName').val()] = readPreset();
        savePresets();
        $('#newPresetWindow').fadeOut();
        setTimeout(resetEditor, 500);
        fillInPresets();
    }
});
$('#newPresetCancel').click(function() {
    $('#newPresetWindow').fadeOut();
    setTimeout(resetEditor, 500);
});

$('.presetsWindow, #newPresetWindow').hide();

$('body').append('<style type="text/css">' +
'h2 > span {position: absolute; top: 10px; right: 6px; text-align: right; font-size: 12px;}' +
'#presetsWindow {z-index: 10; border: 4px solid white; background-color: rgba(0, 0, 0, 0.9); width: 320px; height: 480px; position: fixed; margin: auto; left: 0; top: 0; right: 0; bottom: 0; text-align: center; padding: .5em;}' +
'#presetsWindowOverlay {background-color: rgba(0, 0, 0, 0.5); position: absolute; left: 0; top: 0; width: 100%; height: 100%;}' +
'#presetsClose {color: black; text-decoration: none; display: inline-block; padding: 5px 10px; width: 150px; font-size: 14pt; cursor: pointer; background-color: #ace600; border: 1px solid #608100; text-align: center; position: absolute; bottom: 1.5em; right: 85px;}' +
'#presetsButton, #resetButton, .presetUse, .presetEdit, .presetRemove, #newPresetButton, #resetEditor {color: #0f0; cursor: pointer; display: block; height: 100%;}' +
'a:hover {text-decoration: none;}' +
'#presetsWindow table {width: 100%;}' +
'#presetsWindow table tbody {width: 100%; height: 370px; overflow: auto; float: left;}' +
'#presetsWindow table tbody tr {display: table; width: 100%; text-align: left;}' +
'#presetsWindow table tr:nth-child(even) td {background-color: #666;}' + 
'#presetsWindow table tr:nth-child(odd) td {background-color: #444;}' +
'#newPresetWindow table tr {color: gray; -webkit-transition: color .25s; transition: color .25s;}' +
'#newPresetWindow {z-index: 11; border: 4px solid white; background-color: rgba(0, 0, 0, 0.9); width: 480px; height: 720px; position: fixed; margin: auto; left: 0; top: 0; right: 0; bottom: 0; text-align: center; padding: .5em;}' +
'#newPresetSave, #newPresetCancel {color: black; text-decoration: none; display: inline-block; padding: 5px 10px; width: 150px; font-size: 14pt; cursor: pointer; background-color: #ace600; border: 1px solid #608100; text-align: center; position: absolute; bottom: 1.5em;}' +
'#newPresetSave {left: 1.5em; transition: opacity .25s; -webkit-transition: opacity .25s;}' +
'#resetEditor {float:right;}' +
'#newPresetCancel {right: 1.5em;}' +
'#presetCodeDiv {margin-top: 24px;}' +
'label[for=presetCode] {display:block;}' +
'#presetCode {cursor: default; background-color: black; color: white; border: 1px solid white;}' +
'#presetName {margin-bottom: 16px;}' +
'</style>');