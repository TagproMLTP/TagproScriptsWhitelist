// ==UserScript==
// @name          TagPro Drag and Drop Texture Replacer
// @description   read texture files from hard disk
// @version       8
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM_deleteValue
// @grant         GM_addStyle
// @include       http://tagpro-*.koalabeast.com*
// @include       http://tangent.jukejuice.com*
// @include       http://*.newcompte.fr*
// @author        ballparts
// @updateURL     https://gist.github.com/ballparts/eeffb535bb370fadf7ea/raw/TagPro_DragNDropTextureReplacer.user.js
// @downloadURL   https://gist.github.com/ballparts/eeffb535bb370fadf7ea/raw/TagPro_DragNDropTextureReplacer.user.js
// ==/UserScript==

//******** USER DEFINED VARIABLES ********//

// Whether or not to make the canvas background transparent
var makeTransparent = true;

//****** END USER DEFINED VARIABLES ******//





// IF WE ARE IN A GAME
if(document.URL.search(/:[0-9]{4}/) > -1) {
    var images = {},
        tiles = GM_getValue('tiles'),
        speedpad = GM_getValue('speedpad'),
        speedpadred = GM_getValue('speedpadred'),
        speedpadblue = GM_getValue('speedpadblue'),
        portal = GM_getValue('portal'),
        splats = GM_getValue('splats'),
        gravitywell = GM_getValue('gravitywell');
    
    if(tiles) images.tiles = tiles;
    if(speedpad) images.speedpad = speedpad;
    if(speedpadred) images.speedpadRed = speedpadred;
    if(speedpadblue) images.speedpadBlue = speedpadblue;
    if(portal) images.portal = portal;
    if(splats) images.splats = splats;
    if(gravitywell) images.gravityWell = gravitywell;
    if(images.tiles || images.speedpad || images.speedpadred || images.speedpadblue || images.portal || images.splats || images.gravitywell) {
        tagpro.loadAssets(images);
    }
    
    tagpro.ready(function() {
        if(makeTransparent) {
            var oldCanvas = $(tagpro.renderer.canvas);
	        var newCanvas = $('<canvas id="viewport" width="1280" height="800"></canvas>');
	        oldCanvas.after(newCanvas);
	        oldCanvas.remove();
	        tagpro.renderer.canvas = newCanvas.get(0);
	        tagpro.renderer.options.transparent = true;
	        tagpro.renderer.renderer = tagpro.renderer.createRenderer();
	        tagpro.renderer.resizeAndCenterView();
	        newCanvas.show();
        }
    });
    
    // IF WE ARE NOT IN A GAME
} else {



    function handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        files = evt.dataTransfer.files; 

        for (var i = 0; i < files.length; i++) {
            var thisFile = files[i];
            var type = determineType(thisFile);
            if(type) {
                handleFile(thisFile, type);
            }
        }
    }

    function handleFile(file, type) {
        var reader = new FileReader();
        reader.onload = function(theFile) {
            URL = theFile.target.result;
            GM_setValue(type, URL);
            //console.log(type, theFile.target.result);
            Notification.requestPermission(function (permission) {
                // If the user is okay, let's create a notification
                if (permission === "granted") {
                    var notification = new Notification('Loaded ' + type + ' image!', {icon:URL});
                }
            });
            if(type === 'background') {
                replaceBackground();
            }
        }
        reader.readAsDataURL(file);
    }

    function handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy'; 
    }

    function determineType(file) {
        var basename = file.name.slice(0, file.name.length - 4).toLowerCase(),
            extension = file.name.substring(file.name.length - 4).toLowerCase(),
            fileTypes = ['tiles', 'speedpad', 'speedpadred', 'speedpadblue', 'portal', 'splats', 'gravitywell'],
            type;
        if(extension !== '.png') {
            //handle non-image input
            return;
        }

        fileTypes.forEach(function(fileType) {
            if(basename.search(fileType) > -1) {
                type = fileType;
            }
        });
        if(!type) type = "background";

        return type;
    }

    var dropZone = document.body;
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);
}

function replaceBackground() {

    backgroundImage = GM_getValue('background');
    if(backgroundImage) {
        GM_addStyle (
            "html.background { background: #000000 url('"+backgroundImage+"') no-repeat fixed center; background-size: cover }"
        );
    }
}

$(document).ready(replaceBackground);