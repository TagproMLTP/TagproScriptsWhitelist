// ==UserScript==
// @name          TagPro Texture Pack and Background Replacer
// @description   Drag and drop to replace texture packs background wallpapers
// @version       1.0
// @grant         GM_getValue
// @grant         GM_setValue
// @include       http://tagpro-*.koalabeast.com*
// @include       http://tangent.jukejuice.com*
// @include       http://*.newcompte.fr*
// @author        Dr.Holmes & ballparts
// ==/UserScript==

/////// SET TO EITHER TRUE OR FALSE /////////

var Transparent_Background = true;


/////////////////////////////////////////////

// Actual texture pack and wallpaper replacement
(function(){
    var Texture_Pack = JSON.parse(GM_getValue('texturePack', 'false'));
    if (Texture_Pack){
        if (tagpro.loadAssets){
            tagpro.loadAssets({
                "tiles": Texture_Pack.tiles,
                "speedpad": Texture_Pack.speedpad,
                "speedpadRed": Texture_Pack.speedpadRed,
                "speedpadBlue": Texture_Pack.speedpadBlue,
                "portal": Texture_Pack.portal,
                "splats": Texture_Pack.splats
            });
        }
        $('html').css('backgroundImage', "url('"+Texture_Pack.wallpaper+"')");
    }
    tagpro.ready(function(){
    	if (window.location.port && Transparent_Background){
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
})();

// Not in game
$(window).ready(function(){    
    if (!window.location.port){
		var texturePack = getTexture();

	   	$('div.flag-carrier').css('backgroundImage', 'url('+texturePack.tiles+')');
	   	$('div.flag').css('backgroundImage', 'url('+texturePack.tiles+')');
	   	$('div.goal').css('backgroundImage', 'url('+texturePack.tiles+')');

	   	// Create UI
		var	image = 'tiles',
			$ball = $('div.flag-carrier');

		// CSS
		var dropContainerCSS = {
			display: 'none',
			position: 'relative',
			backgroundColor: '#DADFE1',
			opacity: '1',
			height: 'auto',
			width: '420px',
			borderRadius: '5px',
			margin: '15px auto'
		},
		leftCSS = {
			float: 'left',
			width: '145px',
			height: '200px'
		},
		rightCSS = {
			float: 'none',
			marginLeft: '146px',
			height: '200px'
		},
		botCSS = {
			height: 'auto'
		},
		dropZoneCSS = {
			margin: '2px',
			height: '100%',
			position: 'relative'
		},
		dropdownCSS = {
			backgroundColor: '#2c3e50',
			borderRadius: '0px 0px 5px 5px',
			height: '12px',
			cursor: 'pointer',
			textAlign: 'center',
			fontSize: '11px'
		},
		packsCSS = {
			backgroundColor: '#DADFE1',
			height: 'auto',
			borderTop: '2px #2c3e50 solid',
			display: 'none',
			position: 'relative'
		}
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

		var $table = $('<table class="board smaller"></table>').append($('<tbody/>')),
			$dropZone = $('<div id="drop"></div>').css(dropZoneCSS),
			$dropdown = $('<div id="dropdown"></div>').css(dropdownCSS).text('='),
			$packs = $('<div id="packs"></div>').css(packsCSS),
			$exit = $('<a/>').text('x').css(exitCSS);

		// Create tr & th for table
		for (i in texturePack){
			var heading; 
			switch(i){
				case 'tiles': heading = 'Tiles'; break;
				case 'speedpad': heading = 'Speedpad Neutral'; break;
				case 'speedpadRed': heading = 'Speedpad Red'; break;
				case 'speedpadBlue': heading = 'Speedpad Blue'; break;
				case 'portal': heading = 'Portal'; break;
				case 'splats': heading = 'Splats'; break;
				case 'wallpaper': heading = 'Wallpaper'; break;
			}
			var $tr = $('<tr/>').append($('<th/>').text(heading).attr('value',i).css({cursor:'pointer'}));
			$table.find('tbody').append($tr);
		}
		// Label in packs container
		$packs.append($('<span/>')
			.text('Saved Texture Packs')
			.css({
				textAlign: 'center',
				width: '100%',
				fontWeight: 'bold',
				color: '#000000',
				margin: '2px 0',
				bottom: '-20px',
				left: '0px',
				position: 'absolute'
			})
		);

		// Append components
		$('div.hideIfExternal.section').before('<div class="drop-container"></div>');
		$('.drop-container').css(dropContainerCSS)
			.append($exit)
			.append($('<div></div>').css(leftCSS))
			.append($('<div></div>').css(rightCSS))
			.append($('<div ></div>').css(botCSS))
		$('.drop-container > div:eq(0)').append($table);
		$('.drop-container > div:eq(1)').append($dropZone);
		$('.drop-container > div:eq(2)').append($packs).append($dropdown);
		// Select first tab
		$('.drop-container').find('table th:eq(0)').css({backgroundColor:'#DADFE1',color:'#000000'});
		$dropZone.css('background', 'url('+texturePack[image]+') center / 100% no-repeat');

		// Add saved textures
		var savedTextures = JSON.parse(GM_getValue('savedTextures','{}'));
		for (i in savedTextures){
			createPreview(i);
		}
		$packs.append(
			$('<div class="add"></div>').css({
				height: '100px',
				width: '130px',
				position: 'relative',
				display: 'inline-block',
				backgroundColor: '#FFFFFF',
				opacity: '0.5',
				margin: '10px 5px',
				fontSize: '88px',
				color: '#7f8c8d',
				cursor: 'pointer'
			}).append($('<div/>').css({
				display: 'table',
				width: '100%'
			}).append($('<span>+</span>').css({
				display: 'table-cell',
				textAlign: 'center'
			})))
		).append(
			$('<div></div>').css({
				width: '100%',
				margin: '20px 0px'
			})
		);

		// User interaction
		$ball
			.mousedown(function(){
				hold = setTimeout(function(){
					$('.drop-container').slideDown();
				}, 300);
			})
			.mouseup(function(){
				clearTimeout(hold);
			});

		$dropdown.click(function(){
		    if ($packs.css('display') == 'none') $packs.slideDown();
		    else $packs.slideUp();
		});	

		$('.drop-container table th').click(function(){
			$('.drop-container table th').css({backgroundColor:'#535353',color:'#ffffff'});
			$(this).css({backgroundColor:'#DADFE1',color:'#000000'});
			image = $(this).attr('value');
			$dropZone.css('background', 'url('+texturePack[image]+') center / 100% no-repeat');
		});

		$('.drop-container th').hover(function(){
			$(this).css('opacity','0.7');
		}, function(){
			$(this).css('opacity','1');
		});

		$('.drop-container a')
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
			for (i in pack){
				texturePack[i] = pack[i];
				setTexture(i, pack[i]);
			}
			confirmText();
		});
		$packs.on('mouseenter', '.preview', function(){
			$(this).css('opacity', '0.7');
		}).on('mouseleave', '.preview', function(){
			$(this).css('opacity', '1');
		});

		$packs.find('.add').click(function(){
			var name = prompt('Texture pack name:');
			if (name){
				var texturePackTemp = JSON.parse(JSON.stringify(texturePack));
				delete texturePackTemp['wallpaper'];
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

		$packs.find('.preview').on('click', '.delete-preview', function(e){
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


		// Drop functions
		$dropZone
			.on('dragover', function(e) {
				e.stopPropagation();
				e.preventDefault();
				$(this).css({opacity:'0.6'});

			})
			.on('dragleave', function(e) {
				e.stopPropagation();
				e.preventDefault();
				$(this).css({opacity:'1'});
			})
			.on('drop', function(e) {
				e.stopPropagation();
			    e.preventDefault();
				$dropZone.css({opacity:'1'});
				handleDrop(e);
			});



		function handleDrop(e){
			var data = e.originalEvent.dataTransfer;
			// Handle as a file
			if (data.files[0]){
				var file = data.files[0];
				var reader = new FileReader();
				reader.onload = function(f){
					URL = f.target.result;
					setTexture(image, URL)
				}
				//console.log(file);
				reader.readAsDataURL(file);
			}
			// Handle as a URL
			else {
				//console.log(data.items[0]);
				data.items[0].getAsString(function(u){
					setTexture(image, u)
				});
			}
			
			confirmText();
		}

		function setTexture(image, url){
			texturePack[image] = url;
			GM_setValue('texturePack', JSON.stringify(texturePack));
		}

		function getTexture(){
			var textureDefault = JSON.stringify(new Object({
				"tiles": "/images/tiles.png",
		        "speedpad": "/images/speedpad.png",
		        "speedpadRed": "/images/speedpadred.png",
		        "speedpadBlue": "/images/speedpadblue.png",
		        "portal": "/images/portal.png",
		        "splats": "/images/splats.png",
		        "wallpaper": "/images/background.jpg"
			}));
			return JSON.parse(GM_getValue('texturePack', textureDefault));
		}

		function confirmText(){
			var textCSS = {
			  	width: '100%',
			  	position: 'absolute',
			  	color: '#FF0000',
			  	textAlign: 'center',
			  	fontSize: '42px',
			  	fontWeight: 'bold',
			  	zIndex: '1',
			  	marginTop: '62px',
			  	display: 'none'
			},
			overlayCSS = {
				width: '100%',
				height: '100%',
			  	position: 'absolute',
			  	backgroundColor: '#DADFE1',
			  	opacity: '0.9',
			  	borderRadius: '0 5px 0 0',
			  	display: 'none'
			}
			$text = $('<span/>').text('Added').css(textCSS),
			$overlay = $('<div/>').css(overlayCSS),
			$textContainer = $('<div/>');

			$textContainer.append($text).append($overlay);
			$dropZone.append($textContainer);
			
			$overlay.show();
			$text.fadeIn();
			setTimeout(function(){
				$text.fadeOut(function(){
					$textContainer.remove();
					$dropZone.css('background', 'url('+texturePack[image]+') center / 100% no-repeat')
				});
			},800);
		}

		function createPreview(name){
			var textureUrl = savedTextures[name].tiles,
				$preview = $('<div/>').css({
					'position': 'relative',
					'display': 'inline-block',
					'margin': '10px 5px',
					'cursor': 'pointer'
				});
				$preview.attr('value', name).attr('class', 'preview');

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
			    pup = (function(){                       
			        var yPosition = -160 - 40 * Math.floor(Math.random()*3);
			        return {x:-480, y: yPosition};
			    })(),
			    fc = {x:'-560px', y:'0px'},
			    flag = {x:'-600px', y:'-40px'};

			for (i in previewOutline){
			    var row = $('<div/>');
			    if (i == 1 || i == 3) row.css('height','30px');
			    else row.css('height','40px');

			    for (j in previewOutline[i]){
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
			        	$tile.css('width','20px');
			        }
			        position = position.x+'px '+position.y+'px';
			        $tileImage.css('backgroundPosition', position);
			        $tile.append($tileImage);
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

			// Create name plate
			var nameplateCSS = {
				position: 'absolute',
				width: '100%',
				height: 'auto',
				zIndex: '3',
				backgroundColor: '#000000',
				opacity: '0.7',
				bottom: '0',
				padding: '1px 0px'
			};
			var $nameplate = $('<div class="nameplate"></div>').css(nameplateCSS);
		
			$nameplate.append($('<span/>').css('margin','0px 10px').text(name));
			$preview.append($nameplate);

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
			var $delete = $('<div class="delete-preview"></div>').css(deleteCSS).text('x');
			$delete.hover(function(){
				$(this).css('opacity', '1');
			}, function(){
				$(this).css('opacity', '0.3');
			});
			$preview.prepend($delete);

			// Append
			$packs.prepend($preview);
		}
	}
});
