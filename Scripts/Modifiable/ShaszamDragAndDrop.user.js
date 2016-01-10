// ==UserScript==
// @name          TagPro Texture Pack Manager
// @description   Drag and drop to replace texture packs background wallpapers
// @version       1.5.0
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM_deleteValue
// @grant         GM_addStyle
// @include       http://tagpro-*.koalabeast.com*
// @include       http://tangent.jukejuice.com*
// @include       http://*.newcompte.fr*
// @updateURL     https://github.com/TagproMLTP/TagproScriptsWhitelist/blob/master/Scripts/Modifiable/ShaszamDragAndDrop.user.js
// @downloadURL   https://gist.github.com/nabbynz/474bfbfb841d9a328418/raw/TagPro_Texture_Pack_&_Background_Replacer_&_Spin.user.js
// @author        Dr.Holmes & ballparts & nabby
// ==/UserScript==

console.log('START: ' + GM_info.script.name + ' (v' + GM_info.script.version + ' by ' + GM_info.script.author + ')');

// Actual texture pack and wallpaper replacement
(function(){
    var Texture_Pack = GM_getValue('texturePack', getTexture());
    
    if (tagpro.loadAssets){
        tagpro.loadAssets({
            "tiles": Texture_Pack.tiles || '/images/tiles.png',
            "speedpad": Texture_Pack.speedpad || '/images/speedpad.png',
            "speedpadRed": Texture_Pack.speedpadred || '/images/speedpadred.png',
            "speedpadBlue": Texture_Pack.speedpadblue || '/images/speedpadblue.png',
            "portal": Texture_Pack.portal || '/images/portal.png',
            "splats": Texture_Pack.splats || '/images/splats.png'
        });
    }
    
    if (Texture_Pack.wallpaper.indexOf('#') === 0) { //just a color
        $('html').css('background', Texture_Pack.wallpaper);
    } else {
        $('html').css('background', '#000 url("'+Texture_Pack.wallpaper+'") no-repeat fixed center');
    }

    tagpro.ready(function(){
        if (window.location.port) {
            var doSpin = GM_getValue('TPTPR_Spin', true);
            var doTransBall = GM_getValue('TPTPR_TransparentBall', true);
            var doTransBack = GM_getValue('TPTPR_TransparentBackground', true);
            var tr = tagpro.renderer;
            
            if (doTransBack) {
                var oldCanvas = $(tr.canvas);
                var newCanvas = $('<canvas id="viewport" width="1280" height="800"></canvas>');
                oldCanvas.after(newCanvas);
                oldCanvas.remove();
                tr.canvas = newCanvas.get(0);
                tr.options.transparent = true;
                tr.renderer = tr.createRenderer();
                tr.resizeAndCenterView();
                newCanvas.show();
            }
            
            if (doSpin) {
                tr.anchorBall = function(player) {
                    player.sprites.actualBall.anchor.x = 0.5;
                    player.sprites.actualBall.anchor.y = 0.5;
                    player.sprites.actualBall.x = 20;
                    player.sprites.actualBall.y = 20;
                };

                var uPSP = tr.updatePlayerSpritePosition;
                tr.updatePlayerSpritePosition = function(player) {
                    if (!player.sprites.actualBall.anchor.x) {
                        tr.anchorBall(player);
                    }
                    player.sprites.actualBall.rotation = player.angle;
                    uPSP(player);
                };
            }
            
            if (doTransBall) {
                var cBS = tr.createBallSprite;
                tr.createBallSprite = function(player) {
                    cBS(player);
                    player.sprites.actualBall.alpha = 0.8;
                };
            }

        }
    });
})();

function getTexture(){
    var textureDefault = {
        "tiles": "/images/tiles.png",
        "speedpad": "/images/speedpad.png",
        "speedpadred": "/images/speedpadred.png",
        "speedpadblue": "/images/speedpadblue.png",
        "portal": "/images/portal.png",
        "splats": "/images/splats.png",
        "wallpaper": "/images/background.jpg"
    };
    return GM_getValue('texturePack', textureDefault);
}

// Not in game
$(window).ready(function(){    
    if (!window.location.port){
		var texturePack = getTexture();

	   	// Create UI
		var	image = 'tiles',
            imageFriendly = 'Tiles',
			//$ball = $('div.flag-carrier');
            $ball = $('h1');

		// CSS
		var dropContainerCSS = {
			display: 'flex',
			position: 'relative',
			backgroundColor: '#DADFE1',
			width: '570px',
            padding: '3px',
			borderRadius: '5px',
			zIndex: '100',
			margin: '15px auto'
		},
		leftCSS = {
		},
		rightCSS = {
            margin: '10px auto',
			width: '320px'
		},
		botCSS = {
			height: 'auto'
		},
		packsCSS = {
			backgroundColor: '#ccc',
			height: 'auto',
            width: '320px',
			display: 'none',
            borderBottom: '3px solid gray',
            borderRadius: '0px 0px 5px 5px',
			position: 'relative'
		},
        dropZoneCSS = {
			width: '320px',
			height: '200px',
            border:'2px dotted silver',
			position: 'relative'
		},
		exitCSS = {
			position: 'absolute',
			color: '#000000',
			top: '0px',
			right: '5px',
			fontWeight: 'bold',
			fontSize: '16px',
			opacity: '0.4',
			cursor: 'pointer',
			textDecoration: 'none',
			zIndex: '2'
		};

		var $table = $('<table class="board smaller"></table>').append($('<tbody>')),
			$dropZone = $('<div id="drop"></div>').css(dropZoneCSS),
			$packs = $('<div id="packs"></div>').css(packsCSS),
			$exit = $('<a>').text('x').css(exitCSS);

        var randomPup = Math.floor(Math.random()*3);

        // Create tr & th for table
		for (var i in texturePack){
			var heading; 
			switch(i){
				case 'tiles': heading = 'Tiles'; break;
				case 'speedpad': heading = 'Speedpad Neutral'; break;
				case 'speedpadred': heading = 'Speedpad Red'; break;
				case 'speedpadblue': heading = 'Speedpad Blue'; break;
				case 'portal': heading = 'Portal'; break;
				case 'splats': heading = 'Splats'; break;
				case 'wallpaper': heading = 'Wallpaper'; break;
			}
			$table.find('tbody').append('<tr><th id="TPTPR_TextureButton_'+i+'" value="'+i+'" style="width:200px; cursor:pointer"><span>'+heading+'</span></th></tr>'); //style="display:none; float:right; font-size:12px; color:#0d0" ✔
		}
        
        
        /********************************************************************************/
        var TPTPR_Packs = {
                     'vanilla':              { displayname:'Vanilla',                          author:'TagPro Defaults',          url:{tiles:'/images/tiles.png',
                                                                                                                                       speedpad:'/images/speedpad.png', 
                                                                                                                                       speedpadred:'/images/speedpadred.png', 
                                                                                                                                       speedpadblue:'/images/speedpadblue.png', 
                                                                                                                                       splats:'/images/splats.png', 
                                                                                                                                       portal:'/images/portal.png'} },
                     'mydnd':                 { displayname:'My Drag and Dropped',              author:'Me!',                      url:{tiles:'', 
                                                                                                                                       speedpad:'', 
                                                                                                                                       speedpadred:'', 
                                                                                                                                       speedpadblue:'', 
                                                                                                                                       splats:'', 
                                                                                                                                       portal:''} },
            
                     'aaron215':             { displayname:'Aaron215',                         author:'Aaron215',                 url:{tiles:'http://i.imgur.com/pHTyBeO.png', 
                                                                                                                                       speedpad:'http://i.imgur.com/p7yauSo.png', 
                                                                                                                                       speedpadred:'http://i.imgur.com/1pq6LLP.png', 
                                                                                                                                       speedpadblue:'http://i.imgur.com/KbRQdOb.png', 
                                                                                                                                       splats:'http://i.imgur.com/tDsbgPv.png', 
                                                                                                                                       portal:'http://i.imgur.com/K0PQHJ6.png'} },        
                     'briochelight':         { displayname:'Brioche Light',                    author:'brioche',                  url:{tiles:'http://i.imgur.com/WDLyCrr.png', 
                                                                                                                                       speedpad:'http://i.imgur.com/wtpkZWw.png', 
                                                                                                                                       speedpadred:'http://i.imgur.com/l6OMel5.png', 
                                                                                                                                       speedpadblue:'http://i.imgur.com/IAAOkQz.png', 
                                                                                                                                       splats:'http://i.imgur.com/kbkOC6x.png', 
                                                                                                                                       portal:'http://i.imgur.com/CXgNNTs.png'} },
                     'camspp_lh':            { displayname:'Cam\'sPP Light',                   author:'StrayCam',                 url:{tiles:'http://i.imgur.com/22NGRaG.png', 
                                                                                                                                       speedpad:'http://i.imgur.com/4N7Moqk.png', 
                                                                                                                                       speedpadred:'http://i.imgur.com/z4H9yVL.png', 
                                                                                                                                       speedpadblue:'http://i.imgur.com/L9AvmXe.png', 
                                                                                                                                       splats:'http://i.imgur.com/pJ3HlcS.png', 
                                                                                                                                       portal:'http://i.imgur.com/a0JUw8q.png'} },
                     'camspp_dsh':           { displayname:'Cam\'sPP Dark Sniper Horizontal',  author:'StrayCam',                 url:{tiles:'http://i.imgur.com/2B8Vaux.png', 
                                                                                                                                       speedpad:'http://i.imgur.com/lVixtut.png', 
                                                                                                                                       speedpadred:'http://i.imgur.com/7Fe8iFB.png', 
                                                                                                                                       speedpadblue:'http://i.imgur.com/kU7LnOW.png', 
                                                                                                                                       splats:'http://i.imgur.com/pJ3HlcS.png', 
                                                                                                                                       portal:'http://i.imgur.com/mp79U9E.png'} },
                     'camspp_lsd':           { displayname:'Cam\'sPP Light Sniper Diagonal',   author:'StrayCam',                 url:{tiles:'http://i.imgur.com/bhFWbNW.png', 
                                                                                                                                       speedpad:'http://i.imgur.com/22eydBT.png', 
                                                                                                                                       speedpadred:'http://i.imgur.com/mdS1Ex7.png', 
                                                                                                                                       speedpadblue:'http://i.imgur.com/oWxNfsx.png', 
                                                                                                                                       splats:'http://i.imgur.com/pJ3HlcS.png', 
                                                                                                                                       portal:'http://i.imgur.com/mp79U9E.png'} },
                     'cmyk':                 { displayname:'cMYK',                             author:'MagicPigeon',              url:{tiles:'http://i.imgur.com/v9VK5Oq.png', 
                                                                                                                                       speedpad:'http://i.imgur.com/5SFGnrT.png', 
                                                                                                                                       speedpadred:'http://i.imgur.com/qcgBVls.png', 
                                                                                                                                       speedpadblue:'http://i.imgur.com/nKExBLD.png', 
                                                                                                                                       splats:'http://i.imgur.com/7yhZMNT.png', 
                                                                                                                                       portal:'http://i.imgur.com/DTGpCj1.png'} },
                     'crystal':              { displayname:'Crystal',                          author:'MagicPigeon',              url:{tiles:'http://i.imgur.com/ixFW9oE.png', 
                                                                                                                                       speedpad:'http://i.imgur.com/VZKNMH1.png', 
                                                                                                                                       speedpadred:'http://i.imgur.com/VsGp8i1.png', 
                                                                                                                                       speedpadblue:'http://i.imgur.com/EQn1E5s.png', 
                                                                                                                                       splats:'http://i.imgur.com/mtH38yR.png', 
                                                                                                                                       portal:'http://i.imgur.com/70X2UY4.png'} },
                     'derezzed':             { displayname:'Derezzed',                          author:'-salt-',                  url:{tiles:'http://i.imgur.com/H9qQUAW.png', 
                                                                                                                                       speedpad:'http://i.imgur.com/BXtUHQG.png', 
                                                                                                                                       speedpadred:'http://i.imgur.com/G92Af0J.png', 
                                                                                                                                       speedpadblue:'http://i.imgur.com/R9FAvpp.png', 
                                                                                                                                       splats:'http://i.imgur.com/WXHAA3I.png', 
                                                                                                                                       portal:'http://i.imgur.com/vJDZam9.png'} },
                     'electric':             { displayname:'Electric',                         author:'Bug',                      url:{tiles:'http://i.imgur.com/iFeKuuV.png', 
                                                                                                                                       speedpad:'http://i.imgur.com/XrVvThx.png', 
                                                                                                                                       speedpadred:'http://i.imgur.com/GLHA3R8.png', 
                                                                                                                                       speedpadblue:'http://i.imgur.com/UcFhoVC.png', 
                                                                                                                                       splats:'http://i.imgur.com/wxJ2ImS.png', 
                                                                                                                                       portal:'http://i.imgur.com/GqZyi5s.png'} },
                     'funhouse':             { displayname:'Funhouse',                         author:'Sunna',                    url:{tiles:'http://i.imgur.com/eJebHd6.png', 
                                                                                                                                       speedpad:'http://i.imgur.com/pv0jGMF.png', 
                                                                                                                                       speedpadred:'http://i.imgur.com/7DibrCL.png', 
                                                                                                                                       speedpadblue:'http://i.imgur.com/syjTZuf.png', 
                                                                                                                                       splats:'http://i.imgur.com/KJ8hdEc.png', 
                                                                                                                                       portal:'http://i.imgur.com/4lmhtGF.png'} },
                     'kindergarten':         { displayname:'Kindergarten',                     author:'Clydas',                   url:{tiles:'http://i.imgur.com/y3tbmOS.png', 
                                                                                                                                       speedpad:'http://i.imgur.com/UEpX1wb.png', 
                                                                                                                                       speedpadred:'http://i.imgur.com/tUC9CMG.png', 
                                                                                                                                       speedpadblue:'http://i.imgur.com/5yA3IOx.png', 
                                                                                                                                       splats:'http://i.imgur.com/ZGSTp2s.png', 
                                                                                                                                       portal:'http://i.imgur.com/6Lbd9Aw.png'} },
                     'minima':               { displayname:'Minima',                           author:'Canvas',                   url:{tiles:'http://i.imgur.com/jGAtqcr.png', 
                                                                                                                                       speedpad:'http://i.imgur.com/pJEZKnh.png', 
                                                                                                                                       speedpadred:'http://i.imgur.com/OlDPpdM.png', 
                                                                                                                                       speedpadblue:'http://i.imgur.com/HgmJ9yg.png', 
                                                                                                                                       splats:'http://i.imgur.com/ytIIuQS.png', 
                                                                                                                                       portal:'http://i.imgur.com/DeevRGe.png'} },
                     'modern':               { displayname:'Modern',                           author:'Mitzimoto',                url:{tiles:'http://i.imgur.com/stGySx9.png', 
                                                                                                                                       speedpad:'http://i.imgur.com/aCHBxVO.png', 
                                                                                                                                       speedpadred:'http://i.imgur.com/xKupyqI.png', 
                                                                                                                                       speedpadblue:'http://i.imgur.com/4dybmaE.png', 
                                                                                                                                       splats:'http://i.imgur.com/gXpvWEE.png', 
                                                                                                                                       portal:'http://i.imgur.com/KAo7jkl.png'} },
                     'musclecups':           { displayname:'Muscle\'s Cup',                    author:'Muscle Cups',              url:{tiles:'http://i.imgur.com/Px8cdyU.png', 
                                                                                                                                       speedpad:'http://i.imgur.com/FjdVdQG.png', 
                                                                                                                                       speedpadred:'http://i.imgur.com/MtTupDg.png', 
                                                                                                                                       speedpadblue:'http://i.imgur.com/FZNnJZf.png', 
                                                                                                                                       splats:'http://i.imgur.com/3m8yX7z.png', 
                                                                                                                                       portal:'http://i.imgur.com/RQXDv00.png'} },
                     'nilla':                { displayname:'Nilla',                            author:'Dotsarecool',              url:{tiles:'http://i.imgur.com/Tdwjnkn.png', 
                                                                                                                                       speedpad:'http://i.imgur.com/bawbyQm.png', 
                                                                                                                                       speedpadred:'http://i.imgur.com/tDxnPWm.png', 
                                                                                                                                       speedpadblue:'http://i.imgur.com/NQaEKB0.png', 
                                                                                                                                       splats:'http://i.imgur.com/kHUlTwP.png', 
                                                                                                                                       portal:'http://i.imgur.com/v8aO03S.png'} },
                     'pastelpro':            { displayname:'Pastel Pro',                       author:'BMO',                      url:{tiles:'http://i.imgur.com/22ehddn.png', 
                                                                                                                                       speedpad:'http://i.imgur.com/r7beMZp.png', 
                                                                                                                                       speedpadred:'http://i.imgur.com/xAHMOOV.png', 
                                                                                                                                       speedpadblue:'http://i.imgur.com/R1TGL5x.png', 
                                                                                                                                       splats:'http://i.imgur.com/NKBd7nE.png', 
                                                                                                                                       portal:'http://i.imgur.com/GbdQNJJ.png'} },
                     'seaweedrb':            { displayname:'Seaweed Red/Blue',                 author:'Borgen',                   url:{tiles:'http://i.imgur.com/e4UjsQs.png', 
                                                                                                                                       speedpad:'http://i.imgur.com/ONxlcFL.png', 
                                                                                                                                       speedpadred:'http://i.imgur.com/DwUHM2I.png', 
                                                                                                                                       speedpadblue:'http://i.imgur.com/DpJS96w.png', 
                                                                                                                                       splats:'http://i.imgur.com/ZrimG2x.png', 
                                                                                                                                       portal:'http://i.imgur.com/44fPSBq.png'} },
                     'sleek':                { displayname:'Sleek',                            author:'DaEvil1',                  url:{tiles:'http://i.imgur.com/1zgobTs.png', 
                                                                                                                                       speedpad:'http://i.imgur.com/zI4SzAE.png', 
                                                                                                                                       speedpadred:'http://i.imgur.com/8Ucws0m.png', 
                                                                                                                                       speedpadblue:'http://i.imgur.com/VDIrsng.png', 
                                                                                                                                       splats:'http://i.imgur.com/AlkZRug.png', 
                                                                                                                                       portal:'http://i.imgur.com/1RRAMHe.png'} },
                     'starwars':             { displayname:'Star Wars',                        author:'Moosen',                   url:{tiles:'http://i.imgur.com/lxV0cnH.png', 
                                                                                                                                       speedpad:'http://i.imgur.com/WgeuDEz.png', 
                                                                                                                                       speedpadred:'http://i.imgur.com/cqY1LTe.png', 
                                                                                                                                       speedpadblue:'http://i.imgur.com/bCUoqXq.png', 
                                                                                                                                       splats:'http://i.imgur.com/XIndyGS.png', 
                                                                                                                                       portal:'http://i.imgur.com/FtLHfuz.png'} },
                     'tranquilitydark':      { displayname:'Tranquility Dark',                 author:'R e t r o',                url:{tiles:'http://i.imgur.com/WyfRfld.png', 
                                                                                                                                       speedpad:'http://i.imgur.com/tZE7l6b.png', 
                                                                                                                                       speedpadred:'http://i.imgur.com/AGMgt6S.png', 
                                                                                                                                       speedpadblue:'http://i.imgur.com/nokGBIr.png', 
                                                                                                                                       splats:'http://i.imgur.com/tDsbgPv.png', 
                                                                                                                                       portal:'http://i.imgur.com/gFC1dUu.png'} },
                     'tranquilitylight':     { displayname:'Tranquility Light',                author:'R e t r o',                url:{tiles:'http://i.imgur.com/cM7dUPy.png', 
                                                                                                                                       speedpad:'http://i.imgur.com/qhr6Z6b.png', 
                                                                                                                                       speedpadred:'http://i.imgur.com/cVyjSvA.png', 
                                                                                                                                       speedpadblue:'http://i.imgur.com/ZqlxWI5.png', 
                                                                                                                                       splats:'http://i.imgur.com/ay5FAXS.png', 
                                                                                                                                       portal:'http://i.imgur.com/ZvBGaJF.png'} },
                     'ultrasmooth':          { displayname:'Ultra Smooth',                     author:'Professor Tag',            url:{tiles:'http://i.imgur.com/zltfpGb.png', 
                                                                                                                                       speedpad:'http://i.imgur.com/zxubWbQ.png', 
                                                                                                                                       speedpadred:'http://i.imgur.com/yJGhLPt.png', 
                                                                                                                                       speedpadblue:'http://i.imgur.com/K02G9jE.png', 
                                                                                                                                       splats:'http://i.imgur.com/tDsbgPv.png', 
                                                                                                                                       portal:'http://i.imgur.com/hffUZ2J.png'} },
                     'vortex':               { displayname:'Vortex',                           author:'Clydas',                   url:{tiles:'http://i.imgur.com/jlbr0Gr.png', 
                                                                                                                                       speedpad:'http://i.imgur.com/hL1YlFu.png', 
                                                                                                                                       speedpadred:'http://i.imgur.com/gxQeYTw.png', 
                                                                                                                                       speedpadblue:'http://i.imgur.com/pbXh4b1.png', 
                                                                                                                                       splats:'http://i.imgur.com/36fUJG2.png', 
                                                                                                                                       portal:'http://i.imgur.com/H1cHH5w.png'} },
        };
        var customTexturePack = GM_getValue('customTexturePack', TPTPR_Packs.mydnd.url);

        $table.find('tbody').append('<tr><td style="font-size:11px; width:200px">' +
                                        '<label><input type="checkbox"'+(GM_getValue('TPTPR_Spin', true) ? ' checked' : '') + ' id="TPTPR_Spin">Spin</label><br>' + 
                                        '<label><input type="checkbox"'+(GM_getValue('TPTPR_TransparentBall', true) ? ' checked' : '') + '  id="TPTPR_TransparentBall">Semi-Transparent Ball</label><br>' +
                                        '<label><input type="checkbox"'+(GM_getValue('TPTPR_TransparentBackground', true) ? ' checked' : '') + '  id="TPTPR_TransparentBackground">Transparent Game Background</label>' +
                                    '</td></tr>');
        
        $table.find('tbody').append('<tr><td style="width:200px"><span id="TPTPR_HideShowPacks" style="color:black; font-size:12px; font-weight:bold; text-decoration:underline; cursor:pointer" title="Show/Hide">Get Texture Packs</span><div id="TPTPR_TexturePacks"></div></td></tr>');
        GM_addStyle('#TPTPR_TexturePacks { display:flex; flex-wrap:wrap; justify-content:center; font-size:11px; overflow:hidden }');
        
        $table.find('tbody').append('<tr><td id="TPTPR_HideShowMySavedPacks" style="width:200px; color:black; font-size:12px; font-weight:bold; text-decoration:underline; cursor:pointer" title="Show/Hide">My Saved Packs</td></tr>');

        // Append components
        $('h1').after('<div id="TPTPR_drop-container" class="drop-container"></div>');
		$('#TPTPR_drop-container').css(dropContainerCSS)
			.append($exit)
			.append($('<div></div>').css(leftCSS))
			.append($('<div></div>').css(rightCSS));
		$('#TPTPR_drop-container > div:eq(0)').append($table);
		$('#TPTPR_drop-container > div:eq(1)').append($dropZone);
		$('#TPTPR_drop-container > div:eq(1)').append('<div id="TPTPR_Messages" style="font-weight:bold; background:#c00; border-radius:8px; margin:5px auto">&nbsp;</div>');
		$('#TPTPR_drop-container > div:eq(1)').append($packs); //.append($dropdown)
        
		// Select first tab
		$('#TPTPR_drop-container').find('table th:eq(0)').css({backgroundColor:'#DADFE1',color:'#aa0000'});
        confirmText('Textures Loaded');

        $('#TPTPR_drop-container').hide(0);

		// Add saved textures
		var savedTextures = JSON.parse(GM_getValue('savedTextures','{}'));
		for (var i in savedTextures){
			createPreview(i);
		}
        
 		// Saved Packs Heading...
        $packs.before('<div id="TPTPR_PacksHeading" style="color:black; background:#ccc; font-weight:bold; border-top:3px solid gray; border-radius:5px 5px 0px 0px; display:none">My Saved Texture Packs...</div>');

        // Save Button in packs container
        $packs.append('<div id="TPTR_addNewPack" title="Save Current Texture Set">+</div>');
        GM_addStyle('#TPTR_addNewPack { margin:10px auto; width:80px; opacity:0.5; font-size:40px; color:#7f8c8d; background:#ccc; border: 1px dashed black; border-radius:10px; cursor:pointer; }');

        // User interaction
        $ball.on('dblclick', function() {
            $('#TPTPR_drop-container').slideToggle(400);
        });
        
		$('#TPTPR_HideShowMySavedPacks').click(function(){
		    if ($packs.css('display') == 'none') {
                $('#TPTPR_PacksHeading').show(0);
                $packs.slideDown();
            } else {
                $packs.slideUp(400, function(){
                    $('#TPTPR_PacksHeading').hide(0);
                });
            }
		});	

		$('#TPTPR_drop-container table th').click(function(){
			$('#TPTPR_drop-container table th').css({backgroundColor:'#535353',color:'#ffffff'});
			$(this).css({backgroundColor:'#DADFE1',color:'#aa0000'});
			image = $(this).attr('value');
            imageFriendly = $(this).text();
            confirmText(imageFriendly, '(this will be used in games)');
		});

		$('#TPTPR_drop-container th').hover(function(){
			$(this).css('opacity','0.7');
		}, function(){
			$(this).css('opacity','1');
		});

		$('#TPTPR_drop-container a')
			.hover(function(){
				$(this).css('opacity','0.8');
			}, function(){
				$(this).css('opacity','0.4');
			})
			.click(function(){
				$(this).parent().slideUp();
			});

		$packs.on('click', '.preview', function(){
			var textureName = $(this).attr('value');
			var pack = savedTextures[textureName];
			for (var i in pack){
				texturePack[i] = pack[i];
				setTexture(i, pack[i]);
                $('#TPTPR_TextureButton_'+i).children('span').fadeOut(200).fadeIn(600);
			}
			confirmText('Saved Texture Pack Loaded', '"'+textureName+'"');
		});
		$packs.on('mouseenter', '.preview', function(){
			$(this).css('opacity', '0.7');
		}).on('mouseleave', '.preview', function(){
			$(this).css('opacity', '1');
		});

		$packs.on('click', '.delete-preview', function(e){
			e.stopPropagation();
			e.preventDefault();
			var confirmDelete = confirm('Delete saved texture pack?');
			if (confirmDelete) {
				var preview = $(this).parent();
				preview.fadeOut(function(){
					delete savedTextures[preview.attr('value')];
					preview.remove();
					GM_setValue('savedTextures', JSON.stringify(savedTextures));
				});			
			}
		});

		$('#TPTR_addNewPack').click(function(){
			var name = prompt('Texture pack name:');
			if (name){
				var texturePackTemp = JSON.parse(JSON.stringify(texturePack));
				delete texturePackTemp.wallpaper;
				savedTextures[name] = texturePackTemp;
				if ((JSON.stringify(savedTextures)*2/1024)/1024 > 30) {
                    alert('Storage limit exceeded.');
                    delete savedTextures[name];
                }
                else {
                    GM_setValue('savedTextures', JSON.stringify(savedTextures));
                    createPreview(name);
                }
			} 
		}).hover(function(){
			$(this).css('opacity', '0.8');
		}, function(){
			$(this).css('opacity', '0.5');
		});

        $('#TPTPR_Spin').on('click', function() {
            GM_setValue('TPTPR_Spin', $(this).is(':checked'));
            confirmText('Ball Spin: ' + ($(this).is(':checked') ? 'Enabled' : 'Disabled'));
        });
        $('#TPTPR_TransparentBall').on('click', function() {
            GM_setValue('TPTPR_TransparentBall', $(this).is(':checked'));
            confirmText('Ball Transparency: ' + ($(this).is(':checked') ? 'Enabled' : 'Disabled'));
        });
        $('#TPTPR_TransparentBackground').on('click', function() {
            GM_setValue('TPTPR_TransparentBackground', $(this).is(':checked'));
            confirmText('Game Background Transparency: ' + ($(this).is(':checked') ? 'Enabled' : 'Disabled'));
        });
        
        $.each(TPTPR_Packs, function(key, value) {
            $('#TPTPR_TexturePacks').append('<span id="'+key+'" class="TPTPR_TexturePacksItem" title="By '+value.author+'">'+value.displayname+'</span>');
            if (key === 'vanilla') {
                $('#'+key).addClass('TPTPR_SpecialPack');
            } else if (key === 'mydnd') {
                $('#'+key).addClass('TPTPR_SpecialPack');
                $('#TPTPR_TexturePacks').append('<div style="width:100%"></div>');
            }
        });
        $('#TPTPR_TexturePacks').append('<div style="width:100%"></div>');
        $('#TPTPR_TexturePacks').append('<label><input type="checkbox"'+(GM_getValue('TPTPR_CompletePack', true) ? ' checked' : '') + ' id="TPTPR_CompletePack">Load Complete Pack?</label>');
        GM_addStyle('.TPTPR_TexturePacksItem { margin:1px 4px; padding:0 3px; background:#fff; color:#777; border-radius:6px; cursor:default }');
        GM_addStyle('.TPTPR_SpecialPack { font-style:italic; }');
        GM_addStyle('.TPTPR_TexturePacksItem:hover { background:#777; color:#fff }');

 		// Selected item preview...
        $('#drop').before('<div style="color:black; font-weight:bold">Current Game Texture...</div>');

        $('#TPTPR_TexturePacks').hide(0);
        $('#TPTPR_HideShowPacks').on('click', function() {
            $('#TPTPR_TexturePacks').slideToggle(400);
        });
        
        $('.TPTPR_TexturePacksItem').hover(function() {
            $('#TPTPR_PackPreview').remove();
            
            if (GM_getValue('TPTPR_CompletePack', true)) {
                $('#'+this.id).after('<div id="TPTPR_PackPreview" style="position:absolute; padding:5px 10px; background:white; border:2px dashed purple; border-radius:5px; z-index:9999;"></div>');
                createPreview(this.id, 'author', '#TPTPR_PackPreview', false);
            } else {
                if (this.id === 'mydnd') {
                    $('#'+this.id).after('<div id="TPTPR_PackPreview" style="position:absolute; width:300px; z-index:9999; height:200px; border:2px solid black; border-radius:5px; background:#fff url(\''+customTexturePack[image]+'\') center no-repeat; background-size:contain;"></div>');
                } else {
                    $('#'+this.id).after('<div id="TPTPR_PackPreview" style="position:absolute; width:300px; z-index:9999; height:200px; border:2px solid black; border-radius:5px; background:#fff url(\''+TPTPR_Packs[this.id].url[image]+'\') center no-repeat; background-size:contain;"></div>');
                }
            }
        }, function() {
            $('#TPTPR_PackPreview').remove();
        });

        $('#TPTPR_CompletePack').on('click', function() {
            GM_setValue('TPTPR_CompletePack', $(this).is(':checked'));
        });

        $('.TPTPR_TexturePacksItem').on('click', function() {
            $('#TPTPR_PackPreview').remove();
            if (this.id === 'vanilla') {
                if (GM_getValue('TPTPR_CompletePack', true)) {
                    for (var i in texturePack) {
                        if (i !== 'wallpaper') {
                            setTexture(i, "/images/"+i+".png");
                            $('#TPTPR_TextureButton_'+i).children('span').fadeOut(200).fadeIn(600);
                        }
                    }
                    confirmText('Texture Pack Loaded', TPTPR_Packs[this.id].displayname);
                } else {
                    setTexture(image, "/images/"+image+".png");
                    $('#TPTPR_TextureButton_'+image).children('span').fadeOut(200).fadeIn(600);
                    confirmText(imageFriendly + ' Loaded', TPTPR_Packs[this.id].displayname);
                }
                
            } else if (this.id === 'mydnd') { //drag and dropped
                if (GM_getValue('TPTPR_CompletePack', true)) {
                    for (var i in texturePack) {
                        if (i !== 'wallpaper') {
                            setTexture(i, customTexturePack[i]);
                            $('#TPTPR_TextureButton_'+i).children('span').fadeOut(200).fadeIn(600);
                        }
                    }
                    confirmText('Texture Pack Loaded', TPTPR_Packs[this.id].displayname);
                } else {
                    setTexture(image, customTexturePack[image]);
                    $('#TPTPR_TextureButton_'+image).children('span').fadeOut(200).fadeIn(600);
                    confirmText(imageFriendly + ' Loaded', TPTPR_Packs[this.id].displayname);
                }

            } else {
                if (GM_getValue('TPTPR_CompletePack', true)) {
                    for (var i in texturePack) {
                        if (i !== 'wallpaper') {
                            setTexture(i, TPTPR_Packs[this.id].url[i]);
                            $('#TPTPR_TextureButton_'+i).children('span').fadeOut(200).fadeIn(600);
                        }
                    }
                    confirmText('Texture Pack Loaded', TPTPR_Packs[this.id].displayname);
                } else {
                    setTexture(image, TPTPR_Packs[this.id].url[image]);
                    $('#TPTPR_TextureButton_'+image).children('span').fadeOut(200).fadeIn(600);
                    confirmText(imageFriendly + ' Loaded', TPTPR_Packs[this.id].displayname);
                }
            }
        });
        
        // Drop functions
		$dropZone
			.on('dragenter', function(e) {
				e.stopPropagation();
				e.preventDefault();
				$(this).css({border:'2px dotted red'});
			})
			.on('dragover', function(e) {
				e.stopPropagation();
				e.preventDefault();
				$(this).css({background:'green', opacity:0.3});

			})
			.on('dragleave', function(e) {
				e.stopPropagation();
				e.preventDefault();
				$(this).css({background:'none', opacity:1});
			})
			.on('drop', function(e) {
				e.stopPropagation();
			    e.preventDefault();
				$(this).css({border:'2px dotted silver', background:'none', opacity:1});
				handleDrop(e);
			})
			.on('dblclick', function(e) {
				e.stopPropagation();
				e.preventDefault();
            
                var confirmVanilla = confirm('Reset ' + imageFriendly + ' to Vanilla/Defaults?');
                if (confirmVanilla) {
                    if (image == 'wallpaper') {
                        var confirmImageOrGray = confirm("OK - Tagpro Image Background\n\nCancel - Black");
                        if (confirmImageOrGray) {
                            setTexture("wallpaper", "/images/background.jpg");
                            $('html').css('backgroundImage', "url('/images/background.jpg') no-repeat fixed center; background-size:cover");
                            confirmText('Wallpaper Set To Default');
                        } else {
                            setTexture("wallpaper", "#000000");
                            $('html').css('background', "#000000");
                            confirmText('Wallpaper Set To Black');
                        }
                    } else {
                        setTexture(image, "/images/"+image+".png");
                        confirmText('Texture Set To Default', imageFriendly);
                    }
                }
            });

		function handleDrop(e){
			var data = e.originalEvent.dataTransfer;
            var URL;
			// Handle as a file
			if (data.files[0]){
				var file = data.files[0];
				var reader = new FileReader();
				reader.onload = function(f){
					URL = f.target.result;
					setTexture(image, URL);
                    saveToCustomTexturePack(image, URL);
                    confirmText('Success - File Saved!', imageFriendly);
				};
				reader.readAsDataURL(file);
			}
			// Handle as a URL
			else {
				data.items[0].getAsString(function(u){
					setTexture(image, u);
                    saveToCustomTexturePack(image, u);
                    URL = u;
                    confirmText('Success - URL Saved!', imageFriendly);
				});
			}
		}
        
        function checkAllHaveValues() {
            return true;
        }

        function saveToCustomTexturePack(image, url) {
            customTexturePack[image] = url;
			GM_setValue('customTexturePack', customTexturePack);
        }
        
		function setTexture(image, url){
			texturePack[image] = url;
			GM_setValue('texturePack', texturePack);
            
            if (image === 'wallpaper') {
                if (url.indexOf('#') === 0) { //color
                    $('html').css('background', url);
                } else {
                    $('html').css('background', '#000 url("'+texturePack.wallpaper+'") no-repeat fixed center');
                }
            }
		}

		function confirmText(header, message) {
            if (header === undefined) header = 'Done!';
            if (message === undefined) message = '';

            $('#TPTPR_Messages').html('<span style="color:yellow">'+header+'</span><br><span style="color:white">'+message+'</span>');
            $('#TPTPR_Messages').stop().animate({"opacity":1}, 200, "swing", function(){
                $('#TPTPR_Messages').stop().animate({"null":1}, 3000, function(){
                    $('#TPTPR_Messages').stop().animate({"opacity":0}, 2000, "swing", function(){
                    });
                });
            });
            
            if (texturePack[image]) {
                $dropZone.html('').css('background', 'url(\''+texturePack[image]+'\') center no-repeat').css('background-size','contain');
            } else {
                $dropZone.css('background', '#a00').html('<div id="" style="margin:40px">No File Loaded!<br>(Vanilla defaults will be used)</div>');
            }
		}

        function createPreview(name, type, elementToAppendTo, addNamePlate){
            if (type === undefined) type = 'saved';
            if (elementToAppendTo === undefined) elementToAppendTo = $packs;
            if (addNamePlate === undefined) addNamePlate = true;
            
            var textureUrl;
            var boostTextureUrl;
            if (type === 'saved') {
                textureUrl = savedTextures[name].tiles;
                boostTextureUrl = savedTextures[name].speedpad;
            } else if (type === 'author') {
                if (name === 'mydnd') {
                    textureUrl = customTexturePack.tiles;
                    boostTextureUrl = customTexturePack.speedpad;
                } else {
                    textureUrl = TPTPR_Packs[name].url.tiles;
                    boostTextureUrl = TPTPR_Packs[name].url.speedpad;
                }
            }

            var $preview = $('<div class="preview" value="'+name+'" title="Load This Texture Pack...">').css({
                    'position': 'relative',
                    'display': 'inline-block',
                    'margin': '10px 5px',
                    'border-spacing': '0',
                    'cursor': 'pointer'
                });
            
            // Create actual preview
            var previewOutline = {
                1: {
                    1:'',
                    2:'',
                    3:'',
                    4:''
                },
                2: {
                    1:'wall1',
                    2:'',
                    3:'',
                    4:''
                },
                3: {
                    1:'wall2',
                    2:'wallA',
                    3:'pup',
                    4:''
                }   
            };

            var tile = {x:-520, y:-160},
                wall1 = {x:-280, y:-120},
                wallA = {x:-80, y:-360},
                wall2 = {x:-280, y:-400},
                spad = {x:'0px', y:'0px'},
                pup = (function(){                       
                    var yPosition = -160 - 40 * randomPup;
                    return {x:-480, y: yPosition};
                })(),
                fc = {x:'-560px', y:'0px'},
                flag = {x:'-600px', y:'-40px'};

            for (var i in previewOutline){
                var row = $('<div/>');
                if (i == 1 || i == 3) row.css('height','30px');
                else row.css('height','40px');

                for (var j in previewOutline[i]){
                    var tilePos = JSON.parse(JSON.stringify(tile));
                    if (i == 1) tilePos.y += -10;
                    if (j == 1) tilePos.x += -10;

                    tilePos = tilePos.x+'px '+tilePos.y+'px';
                    var $tile = $('<div></div>').css({
                        'backgroundImage': 'url('+textureUrl+')',
                        'backgroundPosition': tilePos,
                        'height': 'inherit',
                        'width': '40px',
                        'display': 'table-cell'
                    });

                    if (i == 1 || i == 3) row.find('.tile').css('backgroundPosition',tilePos.x +' '+ tilePos.y);

                    var $tileImage = $('<div/>').css({
                        'backgroundImage': 'url('+textureUrl+')',
                        'height': 'inherit',
                        'width': 'inherit'
                    });
                    var position;
                    switch(previewOutline[i][j]){
                        case 'wall1':
                            position = JSON.parse(JSON.stringify(wall1));
                            break;
                        case 'wall2':
                            position = JSON.parse(JSON.stringify(wall2));
                            break;
                        case 'wallA':
                            position = JSON.parse(JSON.stringify(wallA));
                            break;
                        case 'pup':
                            position = JSON.parse(JSON.stringify(pup));
                            break;
                        default:
                            position = {x:40, y:40};
                            break;
                    }

                    if (j == 1) {
                        position.x += -10;
                        $tile.css('width','30px');
                    }
                    else if (j == 4) {
                        $tile.css('width','40px');
                    }
                    position = position.x+'px '+position.y+'px';
                    $tileImage.css('backgroundPosition', position);
                    if (((i == 2) && (j == 1)) || ((i == 3) && (j == 1)) || ((i == 3) && (j == 2)) || ((i == 3) && (j == 3))) {
                        $tile.append($tileImage);
                    }
                    row.append($tile);
                }
                $preview.append(row);
            }
            $preview.append($('<div class="flag-carrier"></div>').css({
                'backgroundPosition': fc.x +' '+ fc.y,
                'backgroundImage': 'url('+textureUrl+')',
                top: '37px',
                left: '35px'
            }));
            $preview.find('.flag-carrier').append($('<div class="flag-carrier"></div>').css({
                'backgroundPosition': flag.x +' '+ flag.y,
                'backgroundImage': 'url('+textureUrl+')',
                top: '-33px'
            }));
            $preview.append($('<div id="TPTR_Preview_Boost"></div>').css({
                'backgroundPosition': spad.x +' '+ spad.y,
                'backgroundImage': 'url('+boostTextureUrl+')',
                position: 'absolute',
                top: '30px',
                left: '110px',
                width: '40px',
                height: '40px'
            }));

            // Create name plate
            if (addNamePlate) {
                var nameplateCSS = {
                    position: 'absolute',
                    width: '100%',
                    zIndex: '3',
                    backgroundColor: '#000000',
                    bottom: '-14px',
                    fontSize: '11px',
                    padding: '1px 0px'
                };
                var $nameplate = $('<div class="nameplate"></div>').css(nameplateCSS);

                $nameplate.append($('<span/>').css('margin','0px 10px').text(name));
                $preview.append($nameplate);
            }

            // Delete button
            var deleteCSS = {
                position: 'absolute',
                color: '#ffffff',
                top: '4px',
                right: '4px',
                fontWeight: 'bold',
                fontSize: '12px',
                opacity: '0.3',
                cursor: 'pointer',
                textDecoration: 'none',
                zIndex: '2',
                backgroundColor:'red',
                borderRadius: '50%',
                textAlign: 'center',
                width: '15px',
                height: '15px'
            };
            var $delete = $('<div class="delete-preview" title="Delete This Saved Pack"></div>').css(deleteCSS).text('x');
            $delete.hover(function(){
                $(this).css('opacity', '1');
            }, function(){
                $(this).css('opacity', '0.3');
            });
            $preview.prepend($delete);

            // Append
            $(elementToAppendTo).prepend($preview);
        }
    }
});
