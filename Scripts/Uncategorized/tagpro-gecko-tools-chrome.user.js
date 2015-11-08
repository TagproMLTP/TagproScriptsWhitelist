// ==UserScript==
// @name          Gecko Tools
// @namespace     http://www.reddit.com/user/thevdude
// @description   A suite of customization options for TagPro
// @include       http://tagpro-*.koalabeast.com*
// @include       http://tangent.jukejuice.com*
// @include       http://*.newcompte.fr*
// @license       GNU General Public License
// @author        GeckoPie & pooppants
// @version       1.1.0.5
// @require       http://code.jquery.com/jquery-2.1.1.min.js
// @require       https://gist.githubusercontent.com/SomeBall-1/bfca136d833686c1eaee/raw/6115940f56f9765b344db0cebae9288f021b29c9/TagPro%20Tile%20Refresh.js
// @grant         GM_getValue
// @grant         GM_setValue
// ==/UserScript==
/******************************************
****** GLOBAL CONFIGURATION SETTINGS ******
*******************************************/

tagpro.ready(function() {    
    tagpro.renderer.options.transparent = true;
});

// used for mod manager only, pulling that out!
var fileref = document.createElement('link');
fileref.setAttribute('rel', 'stylesheet');
fileref.setAttribute('type', 'text/css');
fileref.setAttribute('href', 'http://thevdude.github.io/stylesheets/mm.css');
document.getElementsByTagName('head') [0].appendChild(fileref);

window.menuOpen = false;
window.resizeTimer = false;

// Load settings from local storage
window.gt_customSounds = true;
if (GM_getValue('gt_customSounds') != undefined) {
  gt_customSounds = eval(GM_getValue('gt_customSounds'));
  console.log(gt_customSounds + "CUSTOM SOUNDS");
}

window.gt_drawTiles = true;
if (GM_getValue('gt_drawTiles') != undefined) {
  gt_drawTiles = eval(GM_getValue('gt_drawTiles'));
  console.log(gt_drawTiles + "DRAW TILES");
}

window.gt_drawWallpaper = true;
if (GM_getValue('gt_drawWallpaper') != undefined) {
  gt_drawWallpaper = eval(GM_getValue('gt_drawWallpaper'));
  console.log(gt_drawWallpaper + "DRAW WALLPAPER");
}

window.gt_transparentBackground = false;
if (GM_getValue('gt_transparentBackground') != undefined) {
  gt_transparentBackground = eval(GM_getValue('gt_transparentBackground'));
  console.log(gt_transparentBackground + "TRANS BACKGROUND");
}

/*
//TODO: FIX THIS WHEN PATCH IS PUSHED TO MAPTEST! IN THE MEANTIME, SET TO FALSE
window.gt_maximize = false;
if (GM_getValue('gt_maximize') != undefined) {
  gt_maximize = eval(GM_getValue('gt_maximize'));
}
*/

window.gt_maximize = false;
GM_setValue('gt_maximize', false);

window.gt_hideBorder = false;
if (GM_getValue('gt_hideBorder') != undefined) {
  gt_hideBorder = eval(GM_getValue('gt_hideBorder'));
  console.log(gt_hideBorder + "HIDE BORDER");
}

window.gt_hideIcons = false;
if (GM_getValue('gt_hideIcons') != undefined) {
  gt_hideIcons = eval(GM_getValue('gt_hideIcons'));
  console.log(gt_hideIcons + "HIDE ICONS");
}

window.gt_showOptions = true;

// mod manager settings below, probably pulling these out
window.mm_loaded = false;

window.mm_draw = false;
if (GM_getValue('mm_draw') != undefined) {
  mm_draw = GM_getValue('mm_draw');
  console.log(mm_draw + "MM DRAW");
}

window.mm_storedid = 'vanilla';
if (GM_getValue('mm_storedid') != undefined) {
  mm_storedid = GM_getValue('mm_storedid');
  console.log(mm_storedid + "MM ID");
}

window.mm_files = {};
if (GM_getValue('mm_files') != undefined) {
  mm_files = GM_getValue('mm_files');
  console.log(mm_files + "MM FILES");
}

window.addEventListener('DOMContentLoaded', function (e) {
  /*******************************************
	****** CONSTRUCT THE GECKO TOOLS MENU ******
	********************************************/
  // Build the message div
  var message_div = document.createElement('div');
  message_div.id = 'message_div';
  message_div.width = '140px';
  message_div.style.opacity = '0.0';
  message_div.style.display = 'none';
  message_div.style.bottom = '20px';
  message_div.style.marginLeft = '50%'
  message_div.style.left = '-70px';
  message_div.style.position = 'absolute';
  message_div.style.backgroundColor = '#070707';
  message_div.style.color = '#47953d';
  message_div.style.borderRadius = '4px';
  message_div.style.padding = '8px';
  message_div.innerHTML = 'Files Accepted';
  message_div.style.transition = 'opacity 0.25s linear';
  document.body.appendChild(message_div);

  // Build the icon
  var gecko_icon = document.createElement('img');
  gecko_icon.id = 'gecko_icon'
  gecko_icon.src = 'http://i.imgur.com/eenIpmO.png';
  gecko_icon.onclick = toggleMenu;
  gecko_icon.style.opacity = '0.0';
  gecko_icon.onmouseover = function () {
    gecko_icon.style.opacity = '1.0';
    gecko_icon.style.cursor = 'pointer';
  }
  gecko_icon.onmouseout = function () {
    gecko_icon.style.opacity = menuOpen ? '1.0' : '0.0';
  }
  gecko_icon.style.transition = 'opacity 0.25s linear';
  document.body.appendChild(gecko_icon);
  
  // Position the icon
  function repositionIcon() {
    gecko_icon.style.position = 'absolute';
    gecko_icon.style.right = '20px';
    gecko_icon.style.bottom = '20px';
  }
  
  // Build the menu
  var gecko_menu = document.createElement('div');
  gecko_menu.id = 'gecko_menu';
  gecko_menu.style.zIndex = '2';
  gecko_menu.style.opacity = '0.0';
  gecko_menu.style.backgroundColor = '#7eaeca';
  gecko_menu.style.background = 'linear-gradient(#7db5d4,#598ca9)';
  gecko_menu.style.borderRadius = '4px';
  gecko_menu.style.padding = '0px';
  gecko_menu.style.boxShadow = '0px 0px 8px #000000';
  gecko_menu.style.transition = 'opacity 0.25s linear';
  var inner_div = document.createElement('div');
  inner_div.id = 'inner_div';
  inner_div.style.margin = '10px';
  inner_div.style.display = 'none';
  inner_div.innerHTML = '<div style="background-color:#070707;border-radius:4px;width:inherit;height:1em;padding:8px;">' +
  '<div id="gt_btn">' +
  '<strong>Gecko Tools 1.0.4</strong></div>' +
  '<div id="mm_btn">' +
  '<strong>Mod Manager</strong></div>' +
  '</div>' +
  '<br>' +
  '<div id="GT_div">' +
  '<table class="gt_table">' +
  '<tr><td><span style="color:#000000;font-weight:bold;">Custom Sounds</span>' +
  '<br><small>Drag and drop your sound files onto the browser window</small></td>' +
  '<td width=60>&nbsp;</td>' +
  '<td align="right"><span style="color:#47953d;font-weight:bold;background-color:#070707;' +
  'border-radius:16px;padding:8px;cursor:pointer;" id="btn_sounds">On</span></td></tr>' +
  '<tr height=8><td></td></tr>' +
  '<tr><td><span style="color:#000000;font-weight:bold;">Custom Tiles</span>' +
  '<br><small>Drag and drop your tiles onto the browser window</small></td>' +
  '<td width=60>&nbsp;</td>' +
  '<td align="right"><span style="color:#47953d;font-weight:bold;background-color:#070707;' +
  'border-radius:16px;padding:8px;cursor:pointer;" id="btn_tiles">On</span></td></tr>' +
  '<tr height=8><td></td></tr>' +
  '<tr><td><span style="color:#000000;font-weight:bold;">Custom Wallpaper</span>' +
  '<br><small>Drag and drop your wallpaper onto the browser window</small></td>' +
  '<td width=60>&nbsp;</td>' +
  '<td align="right"><span style="color:#47953d;font-weight:bold;background-color:#070707;' +
  'border-radius:16px;padding:8px;cursor:pointer;" id="btn_wallpaper">On</span></td></tr>' +
  '<tr height=8><td></td></tr>' +
  '<tr><td><span style="color:#000000;font-weight:bold;">Transparent Background</span>' +
  '<br><small>Removes the black background around the outside of the map</small></td>' +
  '<td width=60>&nbsp;</td>' +
  '<td align="right"><span style="color:#ff011f;font-weight:bold;background-color:#070707;' +
  'border-radius:16px;padding:8px;cursor:pointer;" id="btn_background">Off</span></td></tr>' +
  '<tr height=8><td></td></tr>' +
/*
  '<tr><td><span style="color:#000000;font-weight:bold;">Maximize Viewport</span>' +
  '<br><small>Stretches the viewport to fill up the entire browser window</small></td>' +
  '<td width=60>&nbsp;</td>' +
  '<td align="right"><span style="color:#ff011f;font-weight:bold;background-color:#070707;' +
  'border-radius:16px;padding:8px;cursor:pointer;" id="btn_maximize">Off</span></td></tr>' +
  '<tr height=8><td></td></tr>' +
*/
  '<tr><td><span style="color:#000000;font-weight:bold;">Hide Border</span>' +
  '<br><small>Hides the border around the viewport, may help FPS</small></td>' +
  '<td width=60>&nbsp;</td>' +
  '<td align="right"><span style="color:#ff011f;font-weight:bold;background-color:#070707;' +
  'border-radius:16px;padding:8px;cursor:pointer;" id="btn_hideBorder">On</span></td></tr>' +
  '<tr height=8><td></td></tr>' +
  '<tr><td><span style="color:#000000;font-weight:bold;">Hide Icons</span>' +
  '<br><small>Hides the exit, donate, music and sound buttons during game</small></td>' +
  '<td width=60>&nbsp;</td>' +
  '<td align="right"><span style="color:#ff011f;font-weight:bold;background-color:#070707;' +
  'border-radius:16px;padding:8px;cursor:pointer;" id="btn_hideIcons">On</span></td></tr>' +
  '</table></div>' +
  '<div id="MM_div" style="display:none;overflow:auto;">' +
  '<div class="mods" id="mods"></div>' +
  '</div>';
  document.body.appendChild(gecko_menu);
  gecko_menu.appendChild(inner_div);
  
  // Toggle showing gecko tools options:
  var gt_btn = document.getElementById('gt_btn');
  var GT_div = document.getElementById('GT_div');
  gt_btn.onclick = show_GTdiv;
  function show_GTdiv() {
    gt_showOptions = true;
    gt_btn.style.backgroundColor = '#777777';
    mm_btn.style.backgroundColor = '#272727';
    GT_div.style.display = gt_showOptions ? 'block' : 'none';
    MM_div.style.display = gt_showOptions ? 'none' : 'block';
  }
  
  // Toggle showing Mod Manager screen:
  var mm_btn = document.getElementById('mm_btn');
  var MM_div = document.getElementById('MM_div');
  mm_btn.onclick = show_MMdiv;
  function show_MMdiv() {
    gt_showOptions = false;
    mm_btn.style.backgroundColor = '#777777';
    gt_btn.style.backgroundColor = '#272727';
    var MM_height = $('#GT_div').height();
    GT_div.style.display = gt_showOptions ? 'block' : 'none';
    MM_div.style.display = gt_showOptions ? 'none' : 'block';
    MM_div.style.height = MM_height + 'px';
    if (!mm_loaded) {
      mm_loadMods();
    }
  }
  
  // Populate the Mod Manager list:
  function mm_loadMods() {
    mm_loaded = true;
    var tpmmServer = 'http://tagpro-mod-manager.herokuapp.com';
    $.getJSON(''+ tpmmServer + '/mods', function (data) {
      var mods,
      ul;
      mods = data;
      ul = document.getElementById('mods');
      var mm_author,
      mm_author_text,
      mm_div,
      mm_img,
      mm_li,
      mm_mod,
      mm_sid,
      mm_title,
      mm_title_text,
      _i,
      _len,
      _results;
      mm_sid = mm_storedid;
      _results = [];
      for (_i = 0, _len = mods.length; _i < _len; _i++) {
        mod = mods[_i];
        li = document.createElement('li');
        li.dataset.modid = mod._id !== '5292f07824c79b0b50000001' ? mod._id : 'vanilla';
        if (mm_sid === li.dataset.modid) {
          li.className = 'mod sidmatch';
        } else {
          li.className = 'mod';
        }
        ul.appendChild(li);
        mm_div = document.createElement('div');
        mm_div.className = 'modinfo';
        mm_title = document.createElement('div');
        mm_title.className = 'modtitle';
        mm_div.appendChild(mm_title);
        mm_title_text = document.createTextNode(mod.name);
        mm_title.appendChild(mm_title_text);
        mm_author = document.createElement('div');
        mm_author.className = 'modauthor';
        mm_div.appendChild(mm_author);
        mm_author_text = document.createTextNode('By ' + mod.author);
        mm_author.appendChild(mm_author_text);
        li.appendChild(mm_div);
        mm_img = document.createElement('img');
        mm_img.src = mod.thumbnail;
        li.appendChild(mm_img);
        _results.push(li.addEventListener('click', function () {
          mm_sid = this.dataset.modid;
          mm_draw = true;
          $.getJSON(tpmmServer + '/files/' + this.dataset.modid, function (m_data) {
            GM_setValue('mm_files', JSON.stringify(m_data.files));
            GM_setValue('mm_storedid', mm_sid);
            GM_setValue('mm_draw', true);
            console.log('set mod manager settings!');
            updateTilesMM();
          });
          var ele,
          _j,
          _len1,
          _ref;
          _ref = document.getElementsByClassName('mod');
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            ele = _ref[_j];
            ele.dataset.modid == mm_sid ? ele.className = 'mod sidmatch' : ele.className = 'mod';
          }
        }));
      }
    });
  }
  
  // Position the menu
  function repositionMenu() {
    gecko_menu.style.position = 'absolute';
    gecko_menu.style.right = (gecko_icon.width * 0.9 + 20) + 'px';
    gecko_menu.style.bottom = (gecko_icon.height * 0.9 + 20) + 'px';
  }
  
  // Toggle the menu
  function toggleMenu() {
    menuOpen = !menuOpen;
    if (menuOpen) {
      showMenu();
    } else {
      hideMenu();
    }
  }
  function showMenu() {
    gecko_icon.style.cursor = 'pointer';
    gecko_menu.style.opacity = '1.0';
    gecko_icon.style.opacity = '1.0';
    inner_div.style.display = 'inline-block';
  }
  function hideMenu() {
    gecko_icon.style.cursor = 'default';
    gecko_menu.style.opacity = '0.0';
    gecko_icon.style.opacity = '0.0';
    inner_div.style.display = 'none';
  }
  
  // Add drag-and-drop functionality
  function handleDragOver(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }
  function handleFileSelect(e) {
    e.stopPropagation();
    e.preventDefault();
    var files = e.dataTransfer.files;
    var tileTypes = [
    ];
    var soundTypes = [
    ];
    for (var i = 0, file; file = files[i]; i++) {
      if (file.type.match('image.*')) {
        var reader = new FileReader();
        // Determine what kind of tile it is
        var name = escape(file.name);
        if (name.match(/[tiles|splats|speedpad|speedpadred|speedpadblue|portal]\.png/)) {
          mm_draw = false;
          GM_setValue('mm_draw', false);
          console.log('dropping files, set MM setting to FALSE ' + GM_getValue('mm_draw'));
          var regex = /(.*)\.png/;
          var tileType = regex.exec(name) [1];
          tileTypes.push(tileType);
          eval('reader.onload = (function(thisFile) {' +
          'return function(x) {' +
          'GM_setValue(\'gt_' + tileType + '\', x.target.result);' +
          '};' +
          '})(file);');
        } else {
          // It must be a wallpaper, load it as a wallpaper
          reader.onload = (function (thisFile) {
            return function (x) {
              GM_setValue('gt_wallpaper', x.target.result);
              setTimeout(function () {
                updateWallpaper();
              }, 200);
            };
          }) (file);
        }
        reader.readAsDataURL(file);
      } else {
        // Most likely a sound file
        var name = escape(file.name);
        if (name.match(/[burst|alert|cheering|drop|sigh|powerup|pop|click|explosion|countdown|friendlydrop|friendlyalert|alertlong|go|degreeup|teleport]\.[mp3|m4a|ogg]/)) {
          var reader = new FileReader();
          var regex = /(.*)\.[mp3|m4a|ogg]/;
          var soundType = regex.exec(name) [1];
          soundTypes.push(soundType);
          eval('reader.onload = (function(thisFile) {' +
          'return function(x) {' +
          'GM_setValue(\'gt_' + soundType + '\', x.target.result);' +
          '};' +
          '})(file);');
          reader.readAsDataURL(file);
        }
      }
    }
    //Call update on all items dropped
    //tileTypes.length > 0 && setTimeout(function () {
    //  updateTiles();
    //}, 100);
    tileTypes.length > 0 && setTimeout(updateTiles, 100);
    soundTypes.length > 0 && setTimeout(function () {
      updateSounds();
    }, 100);
    if (tileTypes.length > 0 || soundTypes.length > 0) {
      message_div.style.display = 'inline-block';
      setTimeout(function () {
        message_div.style.opacity = '1.0';
      }, 10);
      setTimeout(function () {
        message_div.style.opacity = '0.0';
        setTimeout(function () {
          message_div.style.display = 'none';
        }, 250);
      }, 1250);
    }
  }
  document.documentElement.addEventListener('dragover', handleDragOver, false);
  document.documentElement.addEventListener('drop', handleFileSelect, false);
  // Toggle tiles button:
  var btn_tiles = document.getElementById('btn_tiles');
  btn_tiles.onclick = toggle_btnTiles;
  function toggle_btnTiles() {
    gt_drawTiles = !gt_drawTiles;
    GM_setValue('gt_drawTiles', gt_drawTiles.toString());
    console.log('set custom tiles setting! ' + GM_getValue('gt_drawTiles'));
    update_btnTiles();
    updateTiles();
  }
  function update_btnTiles() {
    btn_tiles.innerHTML = gt_drawTiles == true ? 'On' : 'Off';
    btn_tiles.style.color = gt_drawTiles == true ? '#47953d' : '#ff011f';
  }
  
  // Update the tiles:
  function updateTiles() {
    if (gt_drawTiles && GM_getValue('gt_drawTiles') && !mm_draw) {
      if (document.getElementById('tiles')) {
        var tileTypes = [
          'tiles',
          'splats',
          'speedpad',
          'speedpadred',
          'speedpadblue',
          'portal'
        ];
        for (var i = 0; i < tileTypes.length; i++) {
          if (document.getElementById(tileTypes[i])) {
            document.getElementById(tileTypes[i]).crossOrigin = 'Anonymous';
            document.getElementById(tileTypes[i]).src = '';
            document.getElementById(tileTypes[i]).src = (gt_drawTiles && GM_getValue('gt_' + tileTypes[i])) ? GM_getValue('gt_' + tileTypes[i])  : 'http://' + tagpro.host +  '/images/' + tileTypes[i] + '.png';
          }
        }
        setTimeout(tagpro.renderer.refresh, 100);
      }
    }
  }
  
  // Update the tiles with mod manager:
  function updateTilesMM() {
    if (gt_drawTiles && GM_getValue('mm_files') && mm_draw) {
      files = JSON.parse(GM_getValue('mm_files'));
      if (document.getElementById('tiles')) {
        var tileTypes = [
          'tiles',
          'splats',
          'speedpad',
          'speedpadred',
          'speedpadblue',
          'portal'
        ];
        for (i in tileTypes) {
          if (document.getElementById(tileTypes[i])) {
            document.getElementById(tileTypes[i]).crossOrigin = 'Anonymous';
            document.getElementById(tileTypes[i]).src = '';
            document.getElementById(tileTypes[i]).src = files[tileTypes[i]] != undefined ? files[tileTypes[i]] : 'http://' + tagpro.host + '/images/' + tileTypes[i] + '.png';
          }
        }
        setTimeout(tagpro.renderer.refresh, 100);
      }
    }
  }
  
  // Toggle sounds button:
  var btn_sounds = document.getElementById('btn_sounds');
  btn_sounds.onclick = toggle_btnSounds;
  function toggle_btnSounds() {
    gt_customSounds = !gt_customSounds;
    GM_setValue('gt_customSounds', gt_customSounds.toString());
    console.log('set custom sounds setting! ' + GM_getValue('gt_customSounds'));
    update_btnSounds();
    updateSounds();
  }
  function update_btnSounds() {
    btn_sounds.innerHTML = gt_customSounds == true ? 'On' : 'Off';
    btn_sounds.style.color = gt_customSounds == true ? '#47953d' : '#ff011f';
  }
  
  // Update the sounds
  function updateSounds() {
    if (document.getElementById('countdown')) {
      var soundTypes = [
        'burst',
        'alert',
        'cheering',
        'drop',
        'sigh',
        'powerup',
        'pop',
        'click',
        'explosion',
        'countdown',
        'friendlydrop',
        'friendlyalert',
        'alertlong',
        'go',
        'degreeup',
        'teleport'
      ];
      for (var i = 0; i < soundTypes.length; i++) {
        if (document.getElementById(soundTypes[i])) {
          if (gt_customSounds && GM_getValue('gt_' + soundTypes[i]) != undefined) {
            var newSource = document.createElement('source');
            newSource.src = GM_getValue('gt_' + soundTypes[i]);
            var regex = /data:(.*);base64/;
            var type = regex.exec(newSource.src) [1];
            newSource.type = type;
            var audioTag = eval('document.getElementsByTagName("audio").' + soundTypes[i]);
            audioTag.innerHTML = '';
            audioTag.appendChild(newSource);
            audioTag.load();
          } else {
            var audioTag = eval('document.getElementsByTagName("audio").' + soundTypes[i]);
            audioTag.innerHTML = '<source type="audio/mp3" src="http://' + document.location.hostname + '/sounds/' + soundTypes[i] + '.mp3"></source><source type="audio/m4a" src="http://' + document.location.hostname + '/sounds/' + soundTypes[i] + '.m4a"></source><source type="audio/ogg" src="http://' + document.location.hostname + '/sounds/' + soundTypes[i] + '.ogg"></source>';
            audioTag.load();
          }
        }
      }
    }
  }
  
  // Toggle wallpaper button:
  var btn_wallpaper = document.getElementById('btn_wallpaper');
  btn_wallpaper.onclick = toggle_btnWallpaper;
  function toggle_btnWallpaper() {
    gt_drawWallpaper = !gt_drawWallpaper;
    GM_setValue('gt_drawWallpaper', gt_drawWallpaper.toString());
    console.log('set custom wallpaper setting! ' + GM_getValue('gt_drawWallpaper'));
    update_btnWallpaper();
    updateWallpaper();
  }
  function update_btnWallpaper() {
    btn_wallpaper.innerHTML = gt_drawWallpaper == true ? 'On' : 'Off';
    btn_wallpaper.style.color = gt_drawWallpaper == true ? '#47953d' : '#ff011f';
  }
  
  // Update the wallpaper
  function updateWallpaper() {
    if (gt_drawWallpaper && GM_getValue('gt_wallpaper')) {
      document.documentElement.style.background = 'url(' + GM_getValue('gt_wallpaper') + ')';
    } else {
      document.documentElement.style.background = 'url("http://' + document.location.hostname + '/images/background.jpg")';
    }
    document.documentElement.style.backgroundRepeat = 'no-repeat';
    document.documentElement.style.backgroundAttachment = 'fixed';
    document.documentElement.style.backgroundPosition = 'center center';
    document.documentElement.style.backgroundSize = 'cover';
  }
  
  // Toggle background button:
  var btn_background = document.getElementById('btn_background');
  btn_background.onclick = toggle_btnBackground;
  function toggle_btnBackground() {
    gt_transparentBackground = !gt_transparentBackground;
    GM_setValue('gt_transparentBackground', gt_transparentBackground.toString());
    console.log('set transparent background setting! ' + GM_getValue('gt_transparentBackground'));
    update_btnBackground();
  }
  function update_btnBackground() {
    btn_background.innerHTML = gt_transparentBackground == true ? 'On' : 'Off';
    btn_background.style.color = gt_transparentBackground == true ? '#47953d' : '#ff011f';
    updateBackground();
  }
  function updateBackground() {
    if (document.getElementById('viewportDiv')) {
      var vp = document.getElementById('viewport');
      vp.style.backgroundColor = gt_transparentBackground ? 'rgba(0,0,0,0)' : 'black';
      var vpd = document.getElementById('viewportDiv');
      vpd.style.backgroundColor = gt_transparentBackground ? 'rgba(0,0,0,0)' : 'black';
    }
  }
 
/*

//TODO: FIX MAXIMIZE, NEED THE LATEST PATCH TO BE ON MAPTEST
 
  // Toggle maximize button:
  var btn_maximize = document.getElementById('btn_maximize');
  btn_maximize.onclick = toggle_btnMaximize;
  function toggle_btnMaximize() {
    gt_maximize = !gt_maximize;
    GM_setValue('gt_maximize', gt_maximize.toString());
    update_btnMaximize();
    updateMaximize();
  }
  function update_btnMaximize() {
    btn_maximize.innerHTML = gt_maximize == true ? 'On' : 'Off';
    btn_maximize.style.color = gt_maximize == true ? '#47953d' : '#ff011f';
  }
  function updateMaximize() {
    if (document.getElementById('viewPort')) {
      var vp = document.getElementById('viewPort');
      var vpd = document.getElementById('viewPortDiv');
      var vw = vpd.width;
      var vh = vpd.height;
      if (gt_maximize) {
        // Stetch to fit while maintaining aspect ratio
        var w = window.innerWidth;
        var h = window.innerHeight;
        var ratio = w / h;
        if (ratio > vw / vh) {
          // Width dominates, the top/bottom will have to be clipped
          vp.style.width = w + 'px';
          vp.style.height = w * (vh / vw) + 'px';
          vp.style.marginLeft = '0px';
          vp.style.marginTop = (window.innerHeight - parseInt(vp.style.height)) / 2 + 'px';
          vpd.style.width = w + 'px';
          vpd.style.height = w * (vh / vw) + 'px';
          vpd.style.marginLeft = '0px';
          vpd.style.marginTop = (window.innerHeight - parseInt(vp.style.height)) / 2 + 'px';
        } else {
          // Height dominates, the left/right will have to be clipped
          vp.style.height = h + 'px';
          vp.style.width = h * (vw / vh) + 'px';
          vp.style.marginTop = '0px';
          vp.style.marginLeft = (window.innerWidth - parseInt(vp.style.width)) / 2 + 'px';
          vpd.style.height = h + 'px';
          vpd.style.width = h * (vw / vh) + 'px';
          vpd.style.marginTop = '0px';
          vpd.style.marginLeft = (window.innerWidth - parseInt(vp.style.width)) / 2 + 'px';
        }
        vp.style.border = 'none';
      } else {
        // Revert back to normal
        vp.style.width = vw + 'px';
        vp.style.height = vh + 'px';
        vp.style.border = '10px solid white';
        vp.style.marginTop = (window.innerHeight - (vh + 20)) / 2 + 'px';
        vp.style.marginLeft = (window.innerWidth - (vw + 20)) / 2 + 'px';
      }
    }
  }

*/

  // Toggle border button:
  var btn_hideBorder = document.getElementById('btn_hideBorder');
  btn_hideBorder.onclick = toggle_btnHideBorder;
  function toggle_btnHideBorder() {
    gt_hideBorder = !gt_hideBorder;
    GM_setValue('gt_hideBorder', gt_hideBorder.toString());
    console.log('set hide border setting! ' + GM_getValue('gt_hideBorder'));
    update_btnHideBorder();
    updateHideBorder();
  }
  function update_btnHideBorder() {
    btn_hideBorder.innerHTML = gt_hideBorder == true ? 'On' : 'Off';
    btn_hideBorder.style.color = gt_hideBorder == true ? '#47953d' : '#ff011f';
  }

  // Update the border
  function updateHideBorder() {
    if (document.getElementById('viewportDiv')){
      var vpd = document.getElementById('viewportDiv');
      gt_hideBorder ? vpd.style.border = 'none' : vpd.style.border = '10px solid white';
    }
  }

  // Toggle icons button:
  var btn_hideIcons = document.getElementById('btn_hideIcons');
  btn_hideIcons.onclick = toggle_btnHideIcons;
  function toggle_btnHideIcons() {
    gt_hideIcons = !gt_hideIcons;
    GM_setValue('gt_hideIcons', gt_hideIcons.toString());
    console.log('set hide icons setting! ' + GM_getValue('gt_hideIcons'));
    update_btnHideIcons();
    updateHideIcons();
  }
  function update_btnHideIcons() {
    btn_hideIcons.innerHTML = gt_hideIcons == true ? 'On' : 'Off';
    btn_hideIcons.style.color = gt_hideIcons == true ? '#47953d' : '#ff011f';
  }
  
  // Update the icons
  function updateHideIcons() {
    if (gt_hideIcons) {
      if (document.getElementById('soundEffects')) {
        document.getElementById('soundEffects').style.visibility = 'hidden';
        document.getElementById('soundEffects').style.display = 'none';
      }
      if (document.getElementById('soundMusic')) {
        document.getElementById('soundMusic').style.visibility = 'hidden';
        document.getElementById('soundMusic').style.display = 'none';
      }
      if (document.getElementById('exit')) {
        document.getElementById('exit').style.visibility = 'hidden';
        document.getElementById('exit').style.display = 'none';
      }
      if (document.getElementById('donate')) {
        document.getElementById('donate').style.visibility = 'hidden';
        document.getElementById('donate').style.display = 'none';
      }
    } else {
      if (document.getElementById('soundEffects')) {
        document.getElementById('soundEffects').style.visibility = 'visible';
        document.getElementById('soundEffects').style.display = 'inline-block';
      }
      if (document.getElementById('soundMusic')) {
        document.getElementById('soundMusic').style.visibility = 'visible';
        document.getElementById('soundMusic').style.display = 'inline-block';
      }
      if (document.getElementById('exit')) {
        document.getElementById('exit').style.visibility = 'visible';
        document.getElementById('exit').style.display = 'inline-block';
      }
      if (document.getElementById('donate')) {
        document.getElementById('donate').style.visibility = 'visible';
        document.getElementById('donate').style.display = 'inline-block';
      }
    }
  }
  
  // Position menu and load initial button states
  setTimeout(function () {
    repositionIcon();
    repositionMenu();
    update_btnTiles();
    updateTiles();
    updateTilesMM();
    update_btnSounds();
    updateSounds();
    update_btnWallpaper();
    update_btnBackground();
    updateBackground();
    updateWallpaper();
    update_btnHideIcons();
    updateHideIcons();
    update_btnHideBorder();
    setTimeout(updateHideBorder, 1000);
  }, 100);
  
  // Handle resize event
  window.onresize = function () {
    repositionIcon();
    repositionMenu();
    if (resizeTimer) {
      clearTimeout(resizeTimer);
      resizeTimer = false;
    }
    resizeTimer = setTimeout(function () {
      updateHideBorder();
      resizeTimer = false;
//      tagpro.renderer.resizeAndCenter();
    }, 1100);
  }
});
