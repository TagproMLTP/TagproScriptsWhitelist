// ==UserScript==
// @name            TagPro Site Themer
// @description     Change colors & shit
// @version    	    0.1.6
// @include         http://tagpro-*.koalabeast.com*
// @include         http://tangent.jukejuice.com*
// @include         http://*.newcompte.fr*
// @updateURL       https://gist.github.com/nabbynz/962e2178bf0c7a6d34e3/raw/TagPro_SiteThemer.user.js
// @downloadURL     https://gist.github.com/nabbynz/962e2178bf0c7a6d34e3/raw/TagPro_SiteThemer.user.js
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_deleteValue
// @grant           GM_addStyle
// @run-at          document-end
// @license         GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author          nabby
// ==/UserScript==


var presets = {
    'default':                    { display:'Default',           values:{ TST_Buttons:'#ACE600',         TST_ButtonsText:'#000000',   TST_ButtonsBorder:'#608100',   TST_ButtonsHover:'#ACE600',         TST_Links:'#00FF00', TST_BackgroundColor:'#000000',           TST_ShowButtonsBorder:3,  TST_ShowButtonsShadow:0,  TST_ButtonsBorderRadius:0,  TST_ButtonsFont:'Monospace',      TST_MainFont:'Arial',      TST_MainLogo:'/images/logo.png'} },
    'uired':                      { display:'UI Red',            values:{ TST_Buttons:'#DD0000,#4A0000', TST_ButtonsText:'#FFFFFF',   TST_ButtonsBorder:'#EE0000',   TST_ButtonsHover:'#EE0000',         TST_Links:'#999999', TST_BackgroundColor:'#5E1313,#000000',   TST_ShowButtonsBorder:1,  TST_ShowButtonsShadow:8,  TST_ButtonsBorderRadius:5,  TST_ButtonsFont:'Courier New',    TST_MainFont:'Arial',      TST_MainLogo:'http://i.imgur.com/O4uUPLD.png'} },
    'uiblue':                     { display:'UI Blue',           values:{ TST_Buttons:'#00005B,#000032', TST_ButtonsText:'#FFFFFF',   TST_ButtonsBorder:'#FFFFFF',   TST_ButtonsHover:'#0000CA,#000032', TST_Links:'#999999', TST_BackgroundColor:'#000064,#000032',   TST_ShowButtonsBorder:1,  TST_ShowButtonsShadow:0,  TST_ButtonsBorderRadius:25, TST_ButtonsFont:'Arial Narrow',   TST_MainFont:'Arial',      TST_MainLogo:'http://i.imgur.com/enMGRMN.png'} },
    'custom1':                    { display:'Custom #1',         values:{ TST_Buttons:'#008040,#00AAAA', TST_ButtonsText:'#000000',   TST_ButtonsBorder:'#AAAA00',   TST_ButtonsHover:'#80FFFF',         TST_Links:'#8080FF', TST_BackgroundColor:'#000040,#004000',   TST_ShowButtonsBorder:2,  TST_ShowButtonsShadow:8,  TST_ButtonsBorderRadius:25, TST_ButtonsFont:'Calibri',        TST_MainFont:'Arial',      TST_MainLogo:'https://cdn2.colorlib.com/wp/wp-content/uploads/sites/2/2014/02/Olympic-logo.png'} },
    'custom2':                    { display:'Custom #2',         values:{ TST_Buttons:'#8080C0,#8000FF', TST_ButtonsText:'#FFFFFF',   TST_ButtonsBorder:'#FFFFFF',   TST_ButtonsHover:'#400040',         TST_Links:'#FFFFFF', TST_BackgroundColor:'#242424,#B1B1B1',   TST_ShowButtonsBorder:0,  TST_ShowButtonsShadow:8,  TST_ButtonsBorderRadius:0,  TST_ButtonsFont:'Arial Narrow',   TST_MainFont:'Arial',      TST_MainLogo:'https://www.google.co.nz/images/srpr/logo11w.png'} },
    'custom3':                    { display:'Custom #3',         values:{ TST_Buttons:'#122345,#C0C0C0', TST_ButtonsText:'#000000',   TST_ButtonsBorder:'#808000',   TST_ButtonsHover:'#000040,#C0C0C0', TST_Links:'#8080C0', TST_BackgroundColor:'#000000,#552B00',   TST_ShowButtonsBorder:2,  TST_ShowButtonsShadow:30, TST_ButtonsBorderRadius:8,  TST_ButtonsFont:'Georgia',        TST_MainFont:'Arial',      TST_MainLogo:'http://screenrant.com/wp-content/uploads/Star-Wars-Logo-Art.jpg'} },
};

var options = {
    'TST_Buttons':                { display:'Buttons',                                  type:'color',          value:'',  value2:'',  enabled:true },
    'TST_ButtonsText':            { display:'Buttons Text',                             type:'color',          value:'',  value2:'',  enabled:true },
    'TST_ButtonsBorder':          { display:'Buttons Border',                           type:'color',          value:'',  value2:'',  enabled:true },
    'TST_ButtonsHover':           { display:'Buttons Hover',                            type:'color',          value:'',  value2:'',  enabled:true },
    'TST_Links':                  { display:'Links',                                    type:'color',          value:'',  value2:'',  enabled:true },
    'TST_BackgroundColor':        { display:'Background Color',                         type:'color',          value:'',  value2:'',  enabled:true },
    'TST_MainLogo':               { display:'Main Logo',                                type:'imagelink',      value:'',  value2:'',  enabled:true },
    'TST_ButtonsBorderRadius':    { display:'Rounded Buttons?',                         type:'cssrange',       value:15,  value2:30,  enabled:true },
    'TST_ShowButtonsBorder':      { display:'Border on Buttons?',                       type:'cssrange',       value:2,   value2:10,  enabled:true },
    'TST_ShowButtonsShadow':      { display:'Hover Glow?',                              type:'cssrange',       value:8,   value2:30,  enabled:true },
    'TST_ButtonsFont':            { display:'Buttons Font',                             type:'cssfont',        value:'Monospace',   value2:'Monospace,Lucida Grande,Courier New,Helvetica,Arial,Arial Black,Arial Narrow,Verdana,Calibri,Georgia',  enabled:true },
    'TST_MainFont':               { display:'Main Font',                                type:'cssfont',        value:'Arial',       value2:'Monospace,Lucida Grande,Courier New,Helvetica,Arial,Arial Black,Arial Narrow,Verdana,Calibri,Georgia',  enabled:true },
    'TST_ShowBackgroundColor':    { display:'Show Background Color?',                   type:'option',         value:'',  value2:'',  enabled:true },
    'TST_ShowMainLogo':           { display:'Show the Main Logo?',                      type:'option',         value:'',  value2:'',  enabled:true },
    'TST_ShowRedditLink':         { display:'Show the Reddit Link?',                    type:'option',         value:'',  value2:'',  enabled:true },
    'TST_ShowDonationBar':        { display:'Show the Donation Bar?',                   type:'option',         value:'',  value2:'',  enabled:true },
    'TST_ShowChangeServer':       { display:'Show the "Change Server" Link?',           type:'option',         value:'',  value2:'',  enabled:true },
    'TST_ShowArrowKeys':          { display:'Show the Arrow Keys?',                     type:'option',         value:'',  value2:'',  enabled:true },
    'TST_ShowSocialLinks':        { display:'Show the Social Links?',                   type:'option',         value:'',  value2:'',  enabled:true },
    'TST_ShowKoalaBeast':         { display:'Show the KoalaBeast Logo?',                type:'option',         value:'',  value2:'',  enabled:true },
    'TST_ModifyGroups':           { display:'Modify Groups Layout?',                    type:'option',         value:'',  value2:'',  enabled:true },
    'TST_HideMenuButton':         { display:'Make the Menu Button Invisible?',          type:'option',         value:'',  value2:'',  enabled:false },
};

function WhichPageAreWeOn(){
    if (window.location.port) { //In a real game
        return('ingame');
    } else if (document.URL.indexOf('/games/find') > 0) { //Joining page
        return('joining');
    } else if (document.URL.indexOf('/groups/') > 0) { //Groups page
        return('groups');
    } else if ($('#play').length) { //Chosen server homepage
        return('server');
    } else if (document.URL.indexOf('/profile/') > 0) { 
        if ($('#showSettings').length) {
            return('profile'); //Profile page and logged in
        } else {
            return('profileNotOurs'); //Profile page, but not our one (or we're logged out)
        }
    } else if ( ((window.location.host == 'tagpro.koalabeast.com') || (window.location.host == 'tagpro.gg')) && (window.location.pathname === '/') ) { //Choose server homepage
        return('home');
    }
}
var PageLoc = WhichPageAreWeOn();

//$(document).ready(function() {
tagpro.ready(function() {
    console.log("START: TagPro Site Themer");

    var TST_Selections = $.extend(true, options, GM_getValue('TST_Selections', options));
    var TST_Presets = $.extend(true, presets, GM_getValue('TST_Presets', presets));
    
    if (GM_getValue('TST_Selections') === undefined) { //first time
        GM_setValue('TST_Presets', TST_Presets);
        GM_setValue('TST_Selections_Preset', 'default');
        $.each(TST_Presets.default.values, function(key, value) {
            TST_Selections[key].value = value;
        });
        GM_setValue('TST_Selections', TST_Selections);
    }

    //=================================================================
    function updateAll(addStyles) {
        addStyles = (typeof addStyles === "undefined") ? true : addStyles;
        var color1 = '';
        var color2 = '';
        
        if (addStyles) {
            //Background color...
            if (TST_Selections.TST_ShowBackgroundColor.enabled) {
                color1 = TST_Selections.TST_BackgroundColor.value.split(',')[0] || presets.default.values.TST_BackgroundColor;
                color2 = TST_Selections.TST_BackgroundColor.value.split(',')[1] || color1;
                $('#TST_BackgroundColor').prop('value', color1);
                $('#TST_BackgroundColor2').prop('value', color2);
                if ((color2 === undefined) || (color1 === color2)) {
                    $('html').css('background', color1);
                } else {
                    $('html').css('background', 'linear-gradient(' + color1 + ', ' + color2 + ') fixed no-repeat');
                }
            }

            //Logo...
            $('#TST_MainLogo').prop('value', TST_Selections.TST_MainLogo.value);
            if (TST_Selections.TST_ShowMainLogo.enabled) {
                $('h1').css('background', 'transparent url("'+TST_Selections.TST_MainLogo.value+'") no-repeat top center');
                $('h1').css('background-size', 'contain');
                $('h1').show(0);
            } else {
                $('h1').hide(0);
            }

            //Buttons...
            $('#TST_ShowButtonsBorder').prop('value', TST_Selections.TST_ShowButtonsBorder.value);
            $('#TST_ButtonsBorderRadius').prop('value', TST_Selections.TST_ButtonsBorderRadius.value);
            $('#TST_ShowButtonsShadow').prop('value', TST_Selections.TST_ShowButtonsShadow.value);
            $('#TST_ButtonsText').prop('value', TST_Selections.TST_ButtonsText.value);
            $('#TST_ButtonsBorder').prop('value', TST_Selections.TST_ButtonsBorder.value);
            $('#TST_ButtonsFont').prop('value', TST_Selections.TST_ButtonsFont.value);
            $('#TST_MainFont').prop('value', TST_Selections.TST_MainFont.value);
            color1 = TST_Selections.TST_Buttons.value.split(',')[0] || presets.default.values.TST_Buttons;
            color2 = TST_Selections.TST_Buttons.value.split(',')[1] || color1;
            $('#TST_Buttons').prop('value', color1);
            $('#TST_Buttons2').prop('value', color2);
            if ((color2 === undefined) || (color1 === color2)) {
                GM_addStyle('a.button, button.button, button { font-family:'+TST_Selections.TST_ButtonsFont.value+'; color:'+TST_Selections.TST_ButtonsText.value+'; background:'+color1+'; border:'+TST_Selections.TST_ShowButtonsBorder.value+'px solid '+TST_Selections.TST_ButtonsBorder.value+'; border-radius:'+TST_Selections.TST_ButtonsBorderRadius.value+'px; }');
            } else {
                GM_addStyle('a.button, button.button, button { font-family:'+TST_Selections.TST_ButtonsFont.value+'; color:'+TST_Selections.TST_ButtonsText.value+'; background:linear-gradient(' + color1 + ', ' + color2 + '); border:'+TST_Selections.TST_ShowButtonsBorder.value+'px solid '+TST_Selections.TST_ButtonsBorder.value+'; border-radius:'+TST_Selections.TST_ButtonsBorderRadius.value+'px; }');
            }
            color1 = TST_Selections.TST_ButtonsHover.value.split(',')[0] || presets.default.values.TST_ButtonsHover;
            color2 = TST_Selections.TST_ButtonsHover.value.split(',')[1] || color1;
            $('#TST_ButtonsHover').prop('value', color1);
            $('#TST_ButtonsHover2').prop('value', color2);
            if ((color2 === undefined) || (color1 === color2)) {
                GM_addStyle('a.button:hover, button.button:hover, button:hover { background:'+color1+'; box-shadow:#ffffff 0 0 '+TST_Selections.TST_ShowButtonsShadow.value+'px }');
            } else {
                GM_addStyle('a.button:hover, button.button:hover, button:hover { background:linear-gradient(' + color1 + ', ' + color2 + '); box-shadow:#ffffff 0 0 '+TST_Selections.TST_ShowButtonsShadow.value+'px }');
            }


            //Links...
            $('a[href^="/maps"]').parent('div').css('display', 'flex');
            $('a[href^="/maps"]').parent('div').css('justify-content', 'center');
            $('a[href^="/maps"]').parent('div').css('flex-wrap', 'wrap');
            $('#TST_Links').prop('value', TST_Selections.TST_Links.value);
            GM_addStyle('.TST { color:'+TST_Selections.TST_Links.value+' }'); 
            GM_addStyle('.TST:hover { text-decoration:underline }');
            $('a').not('.button, .redditLink').addClass('TST');

            //Change Main Font...
            GM_addStyle('body { font-family:'+TST_Selections.TST_MainFont.value+' }');

        } //addStyles
        
        
        //Add Text Shadow (easier to read on light backgrounds)...
        if ((PageLoc != 'joining') && (PageLoc != 'profile')) $('.section > a').css('text-shadow', '1px 1px 1px #000000');

        //Modify Groups Page...
        if ((PageLoc === 'groups') && (TST_Selections.TST_ModifyGroups.enabled)) {
            groupCSS();
        }
        
        if (TST_Selections.TST_ShowRedditLink.enabled) {
            $('.redditLink').parent('div').show(0);
        } else {
            $('.redditLink').parent('div').hide(0);
        }

        if (TST_Selections.TST_ShowChangeServer.enabled) {
            $('a:contains("(change server)")').parent('div').show(0);
        } else {
            $('a:contains("(change server)")').parent('div').hide(0);
        }

        if (TST_Selections.TST_ShowSocialLinks.enabled) {
            $('div.section.lineup').show(0);
        } else {
            $('div.section.lineup').hide(0);
        }

        if (TST_Selections.TST_ShowArrowKeys.enabled) {
            $('ul.controls').show(0);
        } else {
            $('ul.controls').hide(0);
        }

        if (TST_Selections.TST_ShowDonationBar.enabled) {
            $('a[href^="/donate"]').parent('div').show(0);
        } else {
            $('a[href^="/donate"]').parent('div').hide(0);
        }
        
        if (TST_Selections.TST_ShowKoalaBeast.enabled) {
            $('h2.footer').parent('a').show(0);
            $('h2.footer').parent('a').css('display','');
        } else {
            $('h2.footer').parent('a').hide(0);
        }

        if (TST_Selections.TST_HideMenuButton.enabled) {
            $('#TST_Menu_Button').css({'opacity':0})
        } else {
            $('#TST_Menu_Button').css({'opacity':0.1})
        }
    }

    function showMessage(message, seconds, background) {
        message = message || '';
        seconds = seconds || 3;
        background = background || '#BB00BB';

        $('#TST_Message').html(message);
        $('#TST_Message').css('background', background);
        $('#TST_Message').hide(0).fadeIn(200).delay(seconds*1000).fadeOut(400);
    }


    //=================================================================
    if (PageLoc !== 'ingame') {
        $('body').append('<div id="TST_Menu_Button" style="position:fixed; bottom:20px; right:10px; background:#fff; color:#0b0; opacity:'+(TST_Selections.TST_HideMenuButton.value ? '0' : '0.1')+'; padding:0px 6px; font-size:28px; text-align:center; border-radius:25px; cursor:pointer" title="Site Themer">&#9998;</div>');
        $('#TST_Menu_Button').after('<div id="TST_Menu" style="position:fixed; bottom:0px; right:0px; background:#171717; color:#C0B866; padding:30px 10px 40px 10px; font-size:12px; border:2px solid #AAA; border-radius:6px; overflow:hidden; z-index:1000; display:none"></div>');
        $('#TST_Menu').append('<div id="TST_Message" style="position:absolute; padding:1px; top:5px; left:30px; right:30px; text-align:center; border-radius:5px; font-size:14px; color:#FFF; background:#BB00BB; display:none"></div>');
        $('#TST_Menu').append('<div id="TST_Menu_Container" style="display:flex"></div>');
        $('#TST_Menu_Container').append('<div id="TST_Menu_Presets" style="position:relative; background:#01010D; border-radius:3px; margin:0; padding:8px"></div>');
        $('#TST_Menu_Container').append('<div id="TST_Menu_CSS" style="position:relative; background:#01010D; border-radius:3px; margin:0 0 0 20px; padding:8px"></div>');
        $('#TST_Menu_CSS').append('<div id="TST_Menu_CSS_Colors" style="display:inline-block; top:5px"></div>');
        $('#TST_Menu_CSS').append('<div id="TST_Menu_CSS_Options" style="display:inline-block; top:5px; vertical-align:top"></div>');
        $('#TST_Menu_Container').append('<div id="TST_Menu_Options" style="position:relative; background:#01010D; border-radius:3px; margin:0 0 0 20px; padding:8px"></div>');
        $('#TST_Menu').append('<div id="TST_Menu_Close" title="Close" style="position:absolute; right:5px; top:5px; text-align:center; padding:2px; width:13px; height:13px; color:#fff; background:#600; border:1px solid #a00; border-radius:4px; cursor:pointer">X</div>');

        //Build the menu...
        $.each(TST_Presets, function(key, value) {
            $('#TST_Menu_Presets').append('<li style="list-style:none"><label><input type="radio" id="'+key+'" class="TST_presets" name="TST_presets"' + (GM_getValue('TST_Selections_Preset') === key ? ' checked' : '') + '><span>' + value.display + '</span></label></li>');
        });

        $.each(TST_Selections, function(key, value) {
            if (value.type === 'color') {
                var color1 = value.value.split(',')[0];
                var color2 = value.value.split(',')[1] || color1;
                $('#TST_Menu_CSS_Colors').append('<li style="list-style:none; margin:0 0 0 10px; padding:2px 0 0;"><label><input type="color" id="'+key+'" class="'+value.type+'" name="'+value.type+'" value="'+color1+'"> ' + value.display + '</label></li>');
                if ((key === 'TST_Buttons') || (key === 'TST_ButtonsHover') || (key === 'TST_BackgroundColor')) $('#'+key).after('<input type="color" id="'+key+'2" class="'+value.type+'" name="'+value.type+'" value="'+color2+'">');
            } else if (value.type === 'imagelink') {
                $('#TST_Menu_CSS').append('<div style="margin:10px 0 0 0; padding:2px 0 0; text-align:center;">' + value.display + ':<input type="text" style="width:230px; font-size:11px" id="'+key+'" class="'+value.type+'" name="'+value.type+'" value="'+value.value+'"> <a href="javascript:void(0);" class="imagelinkupdate">Update</a></div>');
            } else if (value.type === 'option') {
                $('#TST_Menu_Options').append('<li style="list-style:none; margin:0 0 0 10px; padding:2px 0 0"><label><input type="checkbox" id="'+key+'" class="cssoption"'+ (TST_Selections[key].enabled ? ' checked' : '') + '> ' + TST_Selections[key].display + '</label></li>');
            } else if (value.type === 'cssoption') {
                $('#TST_Menu_CSS_Options').append('<li style="list-style:none; margin:0 0 0 10px; padding:2px 0 0"><label><input type="checkbox" id="'+key+'" class="cssoption"'+ (TST_Selections[key].enabled ? ' checked' : '') + '> ' + TST_Selections[key].display + '</label></li>');
            } else if (value.type === 'cssrange') {
                $('#TST_Menu_CSS_Options').append('<li style="list-style:none; margin:0 0 0 10px; padding:2px 0 0"><label><input type="range" id="'+key+'" class="cssrange" value="'+value.value+'" min="0" max="'+TST_Selections[key].value2+'" style="width:50px"> ' + TST_Selections[key].display + '</label></li>');
            } else if (value.type === 'cssfont') {
                $('#TST_Menu_CSS_Options').append('<li style="list-style:none; margin:5px 0 0 10px; padding:2px 0 0"><label><select id="'+key+'" class="cssfont" value="'+value.value+'" style="width:100px"></select> ' + TST_Selections[key].display + '</label></li>');
                var fonts = TST_Selections[key].value2.split(',');
                $.each(fonts, function(index, fontName) {
                    $('#'+key).append('<option value="'+fontName+'"' + (fontName === TST_Selections[key].value ? ' selected' : '') + '>'+fontName+'</option>');
                });
                    
            }
        });
        $('#custom1').parent().parent().css('margin-top', '5px');
        $('[id^=custom]').parent('label').css('color', '#9e2626');

        $('#TST_Menu_Container').after('<div style="position:absolute; bottom:15px; width:100%">' +
                                       '<span id="TST_Save_custom1" class="TST_savecustom" title="Save Current to Custom #1">Save to #1</span>' +
                                       '<span id="TST_Save_custom2" class="TST_savecustom" title="Save Current to Custom #2">Save to #2</span>' +
                                       '<span id="TST_Save_custom3" class="TST_savecustom" title="Save Current to Custom #3">Save to #3</span>' +
                                       '<a href="javascript:void(0);" id="TST_Export" style="margin:2px 0 0 10px; padding:2px; font-size:11px; color:#FFF; background:#666666; border-radius:4px; cursor:pointer" title="Export Current Options to File">Export</a>' +
                                       '<a href="javascript:void(0);" id="TST_Import" style="margin:2px 0 0 2px; padding:2px; font-size:11px; color:#FFF; background:#666666; border-radius:4px; cursor:pointer" title="Import Options from File">Import</a><input type="file" id="TST_Import_Open" accept="text/json" style="display:none">' +
                                       '<span id="TST_Reset" style="margin:2px 40px 0 0; float:right; padding:2px; font-size:11px; color:#000; background:#AA0000; border-radius:4px; cursor:pointer" title="Reset all values to defaults">Reset All</span>' +
                                       '</div>');
        GM_addStyle('.TST_savecustom { margin:2px; padding:2px; font-size:11px; color:#fff; background:#690000; border-radius:4px; cursor:pointer }');
        GM_addStyle('.TST_savecustom:hover { background:#FF0000 }');
        
        updateAll();

        
        //=================================================================
        $('.TST_savecustom').on('click', function() {
            var id = $(this).attr('id').substring(9);
            var response = prompt("Enter a name for this theme...", TST_Presets[id].display);
            if (response !== null) {
                response = response.substring(0, 32);
                if (response === "") response = TST_Presets[id].display;
                $('#'+id).next().text(response);
                TST_Presets[id].display = response;
                TST_Presets[id].values.TST_ButtonsFont = $('#TST_ButtonsFont').prop('value');
                TST_Presets[id].values.TST_MainFont = $('#TST_MainFont').prop('value');
                $('#TST_Menu_CSS input').each(function(key, value) {
                    if (value) {
                        if (($(this).attr('id') === 'TST_Buttons') || ($(this).attr('id') === 'TST_Buttons2')) {
                            TST_Presets[id].values.TST_Buttons = $('#TST_Buttons').prop('value') + ',' + $('#TST_Buttons2').prop('value');
                        } else if (($(this).attr('id') === 'TST_ButtonsHover') || ($(this).attr('id') === 'TST_ButtonsHover2')) {
                            TST_Presets[id].values.TST_ButtonsHover = $('#TST_ButtonsHover').prop('value') + ',' + $('#TST_ButtonsHover2').prop('value');
                        } else if (($(this).attr('id') === 'TST_BackgroundColor') || ($(this).attr('id') === 'TST_BackgroundColor2')) {
                            TST_Presets[id].values.TST_BackgroundColor = $('#TST_BackgroundColor').prop('value') + ',' + $('#TST_BackgroundColor2').prop('value');
                        } else {
                            TST_Presets[id].values[value.id] = $(value).prop('value');
                        }
                    }
                });
                GM_setValue('TST_Presets', TST_Presets);
                GM_setValue('TST_Selections_Preset', id);
                $('#'+id).prop('checked', true);
                showMessage('Save Successful!', 3, '#0a0');
            }
        });

        $('.TST_presets').on('click', function() {
            var id = $(this).attr('id');
            if (GM_getValue('TST_Selections_Preset') === id) {
                GM_deleteValue('TST_Selections_Preset');
                $(this).prop('checked', false);
            } else {
                GM_setValue('TST_Selections_Preset', id);
                $.each(TST_Presets[id].values, function(key, value) {
                    TST_Selections[key].value = value;
                });
                GM_setValue('TST_Selections', TST_Selections);
                updateAll();
            }
        });

        $('#TST_Reset').on('click', function() {
            var response = confirm("Your saved themes will be lost, and this page will reload.\n\nOK to continue?");
            if (response) {
                GM_deleteValue('TST_Selections');
                GM_deleteValue('TST_Presets');
                GM_deleteValue('TST_Selections_Preset');
                window.location.reload();
            }
        });

        $('#TST_Export').on('click', function() {
            var TST_Selections_Copy = jQuery.extend(true, {}, TST_Selections);
            delete TST_Selections_Copy.TST_ShowBackgroundColor;
            delete TST_Selections_Copy.TST_ShowMainLogo;
            delete TST_Selections_Copy.TST_ShowRedditLink;
            delete TST_Selections_Copy.TST_ShowDonationBar;
            delete TST_Selections_Copy.TST_ShowChangeServer;
            delete TST_Selections_Copy.TST_ShowArrowKeys;
            delete TST_Selections_Copy.TST_ShowSocialLinks;
            delete TST_Selections_Copy.TST_ShowKoalaBeast;
            delete TST_Selections_Copy.TST_ModifyGroups;
            delete TST_Selections_Copy.TST_HideMenuButton;
            var json = JSON.stringify(TST_Selections_Copy);
            var blob = new Blob([json], {type: "application/json"});
            var url = URL.createObjectURL(blob);
            var currentPreset = $('#TST_Menu_Presets').find('input:checked').next('span').text() || 'My TagPro Site Theme';
            this.download = 'TagPro Site Theme - ' + currentPreset + '.json';
            this.href = url;
        });

        $('#TST_Import').on('click', function() {
            $("#TST_Import_Open").click();
        });
        $('#TST_Import_Open').change(function(event) {
            var input = event.target;
            var reader = new FileReader();
            reader.onload = function() {
                var TST_Selections_New = jQuery.extend(true, {}, JSON.parse(reader.result));
                $.each(TST_Selections_New, function(key, value) {
                    if (TST_Selections.hasOwnProperty(key)) {
                        TST_Selections[key].value = TST_Selections_New[key].value;
                    }
                });
                GM_setValue('TST_Selections', TST_Selections);
                updateAll();
            };
            reader.readAsText(input.files[0]);
            $("#TST_Import_Open")[0].value = '';
            showMessage('Import Successful! Click a Save # if you want to keep it.', 5, '#0a0');
        });

        $('#TST_Menu .color').change(function() {
            if (($(this).attr('id') === 'TST_Buttons') || ($(this).attr('id') === 'TST_Buttons2')) {
                TST_Selections.TST_Buttons.value = $('#TST_Buttons').prop('value') + ',' + $('#TST_Buttons2').prop('value');
            } else if (($(this).attr('id') === 'TST_ButtonsHover') || ($(this).attr('id') === 'TST_ButtonsHover2')) {
                TST_Selections.TST_ButtonsHover.value = $('#TST_ButtonsHover').prop('value') + ',' + $('#TST_ButtonsHover2').prop('value');
            } else if (($(this).attr('id') === 'TST_BackgroundColor') || ($(this).attr('id') === 'TST_BackgroundColor2')) {
                TST_Selections.TST_BackgroundColor.value = $('#TST_BackgroundColor').prop('value') + ',' + $('#TST_BackgroundColor2').prop('value');
            } else {
                TST_Selections[$(this).attr('id')].value = $(this).prop('value');
            }
            GM_setValue('TST_Selections', TST_Selections);
            updateAll();
        });

        $('.cssoption').on('click', function() {
            TST_Selections[$(this).attr('id')].enabled = $(this).is(':checked');
            GM_setValue('TST_Selections', TST_Selections);
            if ($(this).attr('id') === 'TST_ShowBackgroundColor') showMessage('Reload this page to see changes...', 3, '#066');
            if (($(this).attr('id') === 'TST_ShowRedditLink') || 
                ($(this).attr('id') === 'TST_ShowChangeServer') ||
                ($(this).attr('id') === 'TST_ShowSocialLinks') ||
                ($(this).attr('id') === 'TST_ShowArrowKeys') ||
                ($(this).attr('id') === 'TST_ShowDonationBar') ||
                ($(this).attr('id') === 'TST_ShowKoalaBeast') ||
                ($(this).attr('id') === 'TST_HideMenuButton')) {
                updateAll(false);
            } else {
                updateAll();
            }
        });

        $('.cssrange').on('change', function() {
            TST_Selections[$(this).attr('id')].value = this.value;
            GM_setValue('TST_Selections', TST_Selections);
            updateAll();
        });

        $('.cssfont').on('change', function() {
            TST_Selections[this.id].value = this.value;
            GM_setValue('TST_Selections', TST_Selections);
            updateAll();
        });

        $('.imagelinkupdate').on('click', function() {
            var id = $(this).prev('input').attr('id');
            var link = $(this).prev('input').prop('value');
            TST_Selections[id].value = link;
            GM_setValue('TST_Selections', TST_Selections);
            updateAll();
        });

        $('#TST_Menu_Button').on('click', function() {
            $('#TST_Menu').fadeTo(200, 1);
        });
        $('#TST_Menu_Button').mouseenter(function() {
            $('#TST_Menu_Button').fadeTo(200, 1);
        });
        $('#TST_Menu_Button').mouseleave(function() {
            $('#TST_Menu_Button').fadeTo(200, (TST_Selections.TST_HideMenuButton.enabled ? 0 : 0.1));
        });
        $("#TST_Menu_Close").on('click', function() { 
            $('#TST_Menu').fadeOut(100);
        });
    }

    
    var handle;
    function groupCSS(){
        clearInterval(handle);
        if ((tagpro.group.socket === null) || (tagpro.group.socket.connected === false)) {
            handle = setInterval(groupCSS, 100);
        }
        
        if ((tagpro.group.socket) && (tagpro.group.socket.connected)) {
            if (TST_Selections.TST_ShowBackgroundColor.enabled) {
                color1 = TST_Selections.TST_BackgroundColor.value.split(',')[0] || presets.default.values.TST_BackgroundColor;
                color2 = TST_Selections.TST_BackgroundColor.value.split(',')[1] || color1;
                $('#TST_BackgroundColor').prop('value', color1);
                $('#TST_BackgroundColor2').prop('value', color2);
                if ((color2 === undefined) || (color1 === color2)) {
                    $('html').css('background', color1);
                } else {
                    $('html').css('background', 'linear-gradient(' + color1 + ', ' + color2 + ') fixed no-repeat');
                }
            }

            $('div.teams').css({'display'          : 'flex',
                                'height'           : '350px',
                                'left'             : ($('#players').is(':hidden') ? '335px' : '0px'),
                                'right'            : '5px',
                                'margin'           : '0' });

            $('a').css({'color'                    : '#FFFFFF'});

            $('.score').css({'margin'              : '5px 5px 0 0'});
            
            $('#settings').css({'top'              : '70px',
                                'left'             : '5px',
                                'width'            : '320px',
                                'border-radius'    : '5px' });

            $('#redTeam').css({'position'          : '',
                               'width'             : '25%',
                               'margin'            : '0',
                               'border'            : '1px solid rgba(255,255,255,0.20)',
                               'border-radius'     : '5px',
                               'background-color'  : 'rgba(239, 66, 62, 0.5)'});

            $('#blueTeam').css({'position'         : '',
                                'width'            : '25%',
                                'margin'           : '0 0 0 5px',
                                'border'           : '1px solid rgba(255,255,255,0.20)',
                                'border-radius'    : '5px',
                                'background-color' : 'rgba(79, 175, 255, 0.5)'});

            $('#spectators').css({'position'       : '',
                                  'width'          : '30%',
                                  'margin'         : '0 0 0 5px',
                                  'top'            : '0px',
                                  'right'          : '0px',
                                  'border'         : '1px solid rgba(255,255,255,0.20)',
                                  'border-radius'  : '5px' });

            $('#waiting').css({'position'          : '',
                               'width'             : '20%',
                               'margin'            : '0 0 0 5px',
                               'top'               : '0px',
                               'right'             : '0px',
                               'border'            : '1px solid rgba(255,255,255,0.20)',
                               'border-radius'     : '5px' });

            $('#players').css({'position'          : '',
                               'width'             : '100%',
                               'margin'            : '0 0 0 5px',
                               'top'               : '0px',
                               'left'              : '0px',
                               'right'             : '0px',
                               'border'            : '1px solid rgba(255,255,255,0.20)',
                               'border-radius'     : '5px' });
            
            $('#chat').css({'position'             : 'absolute',
                            'margin'               : '40px -35px 0 -35px',
                            'border'               : '1px solid rgba(255,255,255,0.20)',
                            'border-radius'        : '5px' });

            $('#chatSend').css({'margin'           : '0 -35px 0 -35px',
                                'position'         : 'absolute',
                                'border-radius'    : '5px' });

            $('label').css({'padding'              : '0 5px 0 0' });

            $('.ui-sortable').css({'font-weight'   : 'bold' });

            $('leader.you').css({'color'           : '#FFFFFF' });
            
            $('input.h2').css({'width'             : '58%' });

            $('#playerOptions').children('a').css('color', '#000000');
            
        }
    }
});