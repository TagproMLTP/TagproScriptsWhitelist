// ==UserScript==
// @name         Tagpro Viewport Zoom
// @version      1.3
// @description  Get the most out of your small viewport
// @include      http://*.koalabeast.com:*
// @include      http://*.jukejuice.com:*
// @include      http://*.newcompte.fr:*
// @copyright    2014+, Despair
// ==/UserScript==
 
// variables - dont touch meh
var vpHighCache = 0;

// call functions after tagpro loads
tagpro.ready(function(){
    replaceCameraZoom();//re-enables zoom when not spec
    setTimeout(function(){
        var trodvs = tagpro.renderer.options.disableViewportScaling;
        if(!trodvs){trodvs = true;}
	    resizeLoop = setInterval(function(){checkResize();}, 1000);
    },1000);
});

function replaceCameraZoom(){
    tagpro.renderer.updateCameraZoom = function(){
        var n = tagpro.renderer;
        var e=n.options.disableViewportScaling?1:this.vpHeight/n.canvas_height;
        tagpro.zoom = tagpro.zoom + tagpro.zooming > 0.1 ? tagpro.zoom + tagpro.zooming : tagpro.zoom;
        var t=new PIXI.Point(1/tagpro.zoom*e,1/tagpro.zoom*e),r=new PIXI.Point(tagpro.zoom,tagpro.zoom);
        n.gameContainer.scale=t;
        for(var i in tagpro.players){
            if(!tagpro.players.hasOwnProperty(i))continue;
            var s=tagpro.players[i],o=s.sprites.info;
            o.x=19-tagpro.zoom*19; o.scale=r;
            if(s.sprites){
                var u=tagpro.zoom<n.zoomThreshold;
                s.sprites.flair&&(s.sprites.flair.visible=u),s.sprites.degrees&&(s.sprites.degrees.visible=u)
            }
        }
    };
}

// resize detector
function checkResize(){
    var vpHighCheck = tagpro.renderer.canvas.height;
    if(vpHighCheck != vpHighCache){
        vpHighCache = vpHighCheck;
        updateZoom();
    }
}

function updateZoom(){
    var vpHR = tagpro.renderer.canvas.height / 800,
    autoZoomInLvl = Math.round(40 * vpHR);
    tagpro.zoom = 40/autoZoomInLvl;
}