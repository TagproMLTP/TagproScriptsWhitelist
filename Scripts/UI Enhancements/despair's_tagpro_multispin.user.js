// ==UserScript==
// @name         Tagpro MultiSpin
// @description  Spin for various shapes
// @version      1.0
// @include      http://tagpro-*.koalabeast.com:*
// @include      http://tangent.jukejuice.com:*
// @include      http://*.newcompte.fr:*
// @license      2015
// @author       Despair, browncoat(emitters)
// ==/UserScript==

var browncoatEmit = true;

var drawShadows = false;

var randomShapes = false;

tagpro.ready(function (){
    
    var tr = tagpro.renderer;
    
    // - define sprites - //
    
    var TEX = {};
    TEX.Source = PIXI.Texture.fromImage('http://i.imgur.com/t9lep44.png');
    
    TEX.background = {
        red : new PIXI.Texture(TEX.Source, new PIXI.Rectangle(0, 0, 60, 60)),
        blue : new PIXI.Texture(TEX.Source, new PIXI.Rectangle(60, 0, 60, 60))
    };
    TEX.circle = {
        shadow : new PIXI.Texture(TEX.Source, new PIXI.Rectangle(120, 0, 60, 60)),
        red : new PIXI.Texture(TEX.Source, new PIXI.Rectangle(0, 60, 40, 40)),
        blue : new PIXI.Texture(TEX.Source, new PIXI.Rectangle(40, 60, 40, 40)),
        green : new PIXI.Texture(TEX.Source, new PIXI.Rectangle(80, 60, 40, 40))
    };
    TEX.square = {
        shadow : new PIXI.Texture(TEX.Source, new PIXI.Rectangle(120, 60, 60, 60)),
        red : new PIXI.Texture(TEX.Source, new PIXI.Rectangle(0, 100, 40, 40)),
        blue : new PIXI.Texture(TEX.Source, new PIXI.Rectangle(40, 100, 40, 40)),
        green : new PIXI.Texture(TEX.Source, new PIXI.Rectangle(80, 100, 40, 40))
    };
    TEX.triangle = {
        shadow : new PIXI.Texture(TEX.Source, new PIXI.Rectangle(120, 120, 60, 60)),
        red : new PIXI.Texture(TEX.Source, new PIXI.Rectangle(0, 140, 40, 40)),
        blue : new PIXI.Texture(TEX.Source, new PIXI.Rectangle(40, 140, 40, 40)),
        green : new PIXI.Texture(TEX.Source, new PIXI.Rectangle(80, 140, 40, 40))
    };
    
    // - define particle effects - //
    
    tagpro.particleDefinitions.customTP = {
        "alpha": {"start": 0.75, "end": 0},
        "scale": {"start": 0.35, "end": 0.25, "minimumScaleMultiplier": 1},
        "color": {"start": "#00cc00", "end": "#7cf575"},
        "speed": {"start": 0, "end": 0},
        "acceleration": {"x": 0, "y": 0},
        "startRotation": {"min": 0, "max": 360},
        "rotationSpeed": {"min": 0, "max": 0},
        "lifetime": {"min": 0.1, "max": 0.9},
        "blendMode": "normal",
        "frequency": 0.01,
        "emitterLifetime": -1,
        "maxParticles": 50,
        "pos": {"x": 0, "y": 0},
        "addAtBack": true,
        "spawnType": "circle",
        "spawnCircle": {"x": 20, "y": 20, "r": 20}
    };
    
    tagpro.particleDefinitions.customRB = {
        "alpha": {"start": 0.25, "end": 0},
        "scale": {"start": 0.5, "end": 0.2, "minimumScaleMultiplier": 1},
        "color": {"start": "#85888d", "end": "#100f0c"},
        "speed": {"start": 1, "end": 0},
        "acceleration": {"x": 0, "y": 0},
        "startRotation": {"min": 0, "max": 360},
        "rotationSpeed": {"min": 0, "max": 0},
        "lifetime": {"min": 0.5, "max": 2},
        "blendMode": "normal",
        "frequency": 0.025,
        "emitterLifetime": -1,
        "maxParticles": 50,
        "pos": {"x": 0, "y": 0},
        "addAtBack": false,
        "spawnType": "circle",
        "spawnCircle": {"x": 20, "y": 20, "r": 20}
    };
    
    function createPlayerEmitterProperties(color){
        var props = {
            "alpha": {"start": 0.1,"end": 0},
            "scale": {"start": 1,"end": 1,"minimumScaleMultiplier": 1},
            "color": {"start": color,"end": color},
            "speed": {"start": 0,"end": 0},
            "acceleration": {"x": 0,"y": 0},
            "startRotation": {"min": 0,"max": 0},
            "rotationSpeed": {"min": 0,"max": 0},
            "lifetime": {"min": 1,"max": 1},
            "blendMode": "normal",
            "frequency": 0.02,
            "emitterLifetime": -1,
            "maxParticles": 100,
            "pos": {"x": 20,"y": 20},
            "addAtBack": false,
            "spawnType": "point"
        };
        return props;
    }
    
    tagpro.particleDefinitions.customRedSpeed = createPlayerEmitterProperties('#D80000');
    tagpro.particleDefinitions.customBlueSpeed = createPlayerEmitterProperties('#0036D8');
    
    if(browncoatEmit){
        tagpro.particleDefinitions.death = {
            "alpha": {"start": 0.6,"end": 0.3},
            "scale": {"start": 0.3,"end": 0.001,"minimumScaleMultiplier": 1},
            "color": {"start": "#ffffff","end": "#ffffff"},
            "speed": {"start": 300,"end": 300},
            "acceleration": {"x": 0,"y": 0},
            "startRotation": {"min": 0,"max": 360},
            "rotationSpeed": {"min": 0,"max": 0},
            "lifetime": {"min": 0.001,"max": 0.4},
            "blendMode": "normal",
            "frequency": 0.001,
            "emitterLifetime": 0.02,
            "maxParticles": 50,
            "pos": {"x": 0,"y": 0},
            "addAtBack": false,
            "spawnType": "circle",
            "spawnCircle": {"x": 0,"y": 0,"r": 0}
        };
    }
    
    // - shapes and ploygons - //
    
    function getShape(){
        var fakePlayer = {
            bomb:true, sprite:new PIXI.DisplayObjectContainer(), sprites:{ball:new PIXI.DisplayObjectContainer(),}
        };
        fakePlayer.sprite.addChild(fakePlayer.sprites.ball);
        tr.updateRollingBomb(fakePlayer);
        var wat = fakePlayer.sprites.bomb.graphicsData[0].type;
        if(wat === 0) wat = 'triangle';
        if(wat === 1) wat = 'square';
        if(wat == 2) wat = 'circle';
        return wat;
    }
    
    var SHAPE = getShape();
    
    function getRandomShape(){
        var validShapes = ['circle','square','triangle'];
        return validShapes[Math.floor(Math.random()*validShapes.length)];
    }
    
    var cR = 13*Math.sqrt(3), cP = Math.PI/6,
        triPts = [cR*Math.cos(1*cP),cR*Math.sin(1*cP), cR*Math.cos(5*cP),cR*Math.sin(5*cP), cR*Math.cos(9*cP),cR*Math.sin(9*cP)];
    var TRIANGLE = new PIXI.Polygon(triPts[0],triPts[1], triPts[2],triPts[3], triPts[4],triPts[5]);
    
    var invertedSquare = new PIXI.Polygon(
        -30,-30, -17,-30, -17,17, 17,17, 17,-17, -17,-17, -17,-30, 30,-30, 30,30, -30,30
    );
    
    var invertedTriangle = new PIXI.Polygon(
        -40,triPts[3], triPts[0],triPts[1], triPts[4],triPts[5], triPts[2],triPts[3], -40,triPts[3], -40,-40, 40,-40, 40,40, -40,40
    );
    
    // - emitter helpers - //
    
    tr.addCustomEmitter = function(player, name, layer, texture, def){
        player.sprites[name] = new cloudkid.Emitter(
            (layer == "self") ? player.sprites.ball : tr.layers[layer],
            [tr[texture]], tagpro.particleDefinitions[def]);
        player.sprites[name].player = player.id;
        player.sprites[name].keep = true;
        player.sprites[name].emit = true;
        player.sprites[name].tileId = name;
        tr.emitters.push(player.sprites[name]);
    };
    
    tr.updateCustomEmitter = function(player, name, condition, updatePos){
        var pse = player.sprites[name];
        updatePos = updatePos || false;
        if(condition){
            if(!pse.emit) pse.emit = true;
            if(updatePos) pse.updateSpawnPos(player.x, player.y);
        }else{
            if(pse.emit){
                pse.emit = false;
                if(updatePos) pse.resetPositionTracking();
            }
        }
    };
    
    // - modify renderer - //
    
    var upsp = tr.updatePlayerSpritePosition;
    tr.updatePlayerSpritePosition = function(player){
        if(!player.shape) player.shape = randomShapes ? getRandomShape() : SHAPE;
        if(player.sprites.actualBall.alpha !== 0) player.sprites.actualBall.alpha = 0;
        tr.updatePlayerBackground(player);
        tr.updatePlayerSpin(player);
        tr.updatePlayerTint(player);
        tr.updatePlayerEmitters(player);
        if(drawShadows) tr.updatePlayerShadow(player);
        upsp(player);
    };
    
    var dp = tr.destroyPlayer;
    tr.destroyPlayer = function(player){
        var max = tr.emitters.length;
        for(var i = 0; i < max; i++){
            if(tr.emitters[i].player == player.id){
                if(tr.emitters[i].tileId){
                    player.sprites[tr.emitters[i].tileId].destroy();
                    player.sprites[tr.emitters[i].tileId] = null;
                    tr.emitters.splice(i, 1);
                    i--; max--;
                }
            }
        }
        dp(player);
    };
    
    tr.createPlayerEmitter = function (player) {
        if (tr.options.disableParticles) {return;}
        var emitter = player.team == 1 ? tagpro.particleDefinitions.customRedSpeed : tagpro.particleDefinitions.customBlueSpeed;
        if(browncoatEmit){
            player.sprites.emitter = new cloudkid.Emitter(tr.layers.midground, [tr.particleTexture], emitter);
            player.sprites.emitter.tileId = player.team === 1 ? 'red' : 'blue';
        }else{
            player.sprites.emitter = new cloudkid.Emitter(
                tr.layers.midground, [tr.particleTexture, tr.particleFireTexture], tagpro.particleDefinitions.playerEmitter
            );
        }
        player.sprites.emitter.keep = true;
        tr.emitters.push(player.sprites.emitter);
        player.sprites.emitter.emit = false;
    };
    
    var defaultStartDeathEmitter = tr.startDeathEmitter;
    tr.startDeathEmitter = function (startColor, stopColor, x, y) {
        var isRed = startColor == "ff0000";
        var color = isRed ? "D80000" : "0036D8";
        defaultStartDeathEmitter(color, stopColor, x, y);
    };
    
    tr.updatePlayerPowerUps = function(player, context, drawPos){
        tr.updateGrip(player, context, drawPos);
    };
    
    // - custom functions - //
    
    tr.updatePlayerBackground = function(player){
        if(!player.sprites.base){
            player.sprites.base = new PIXI.DisplayObjectContainer();
            player.sprites.ball.addChild(player.sprites.base);
        }
        if(player.sprites.base){
            var team = player.team === 1 ? 'red' : 'blue', shape;
            if(!player.shape) shape = 'circle';
            else shape = TEX[player.shape] ? player.shape : 'circle';
            if(!player.sprites.background){
                player.sprites.background = new PIXI.Sprite(TEX.background[team]);
                player.sprites.base.addChild(player.sprites.background);
                player.sprites.background.x = -10;
                player.sprites.background.y = -10;
                player.sprites.background.tileId = team;
            }
            if(player.sprites.background){
                if(player.sprites.background.tileId !== team){
                    player.sprites.background.setTexture(TEX.background[team]);
                    player.sprites.background.tileId = team;
                }
            }
            if(!player.sprites.masker){
                player.sprites.masker = new PIXI.Graphics();
                player.sprites.masker.position = {x:20, y:20};
                player.sprites.masker.tileId = 'empty';
                player.sprites.base.addChild(player.sprites.masker);
                player.sprites.base.mask = player.sprites.masker;
            }
            if(player.sprites.masker){
                if(player.sprites.masker.tileId !== shape){
                    player.sprites.masker.clear();
                    player.sprites.masker.lineStyle(0).beginFill(0xffffff, 0.25);
                    if(shape == 'circle') player.sprites.masker.drawCircle(0, 0, 19);
                    else if(shape == 'square') player.sprites.masker.drawRect(-17, -17, 34, 34);
                    else if(shape == 'triangle') player.sprites.masker.drawShape(TRIANGLE);
                    player.sprites.masker.tileId = shape;//used as shape reference
                    if(player.sprites.spin)player.sprites.spin.tileId = 'update';
                }
                player.sprites.masker.rotation = player.angle;
            }
        }
    };
    
    tr.updatePlayerSpin = function(player){
        var color = player.team === 1 ? "red" : "blue";
        var shape = player.sprites.masker.tileId || 'circle';
        if(!player.sprites.spin){
            player.sprites.spin = new PIXI.Sprite(TEX[shape][color]);
            player.sprites.ball.addChild(player.sprites.spin);
            player.sprites.spin.x = 20;
            player.sprites.spin.y = 20;
            player.sprites.spin.anchor = {x:0.5, y:0.5};
            player.sprites.spin.tileId = {color:color, shape:'update'};
        }
        if(player.sprites.spin){
            if(player.tagpro) color = 'green';
            if(player.sprites.spin.tileId.color !== color || player.sprites.spin.tileId.shape !== shape){
                player.sprites.spin.setTexture(TEX[shape][color]);
                player.sprites.spin.tileId.color = color;
                player.sprites.spin.tileId.shape = shape;
                player.sprites.spin.anchor.y = (shape == 'triangle') ? 0.6 : 0.5;
            }
            player.sprites.spin.rotation = player.angle;
        }
    };
    
    tr.updatePlayerTint = function(player){
        var state = 'empty', shape = player.sprites.masker.tileId || 'circle';
        if(player.bomb) state = 'rb';
        else if(player.tagpro) state = 'tp';
        if(!player.sprites.tint){
            player.sprites.tint = new PIXI.Graphics();
            player.sprites.tint.position = {x:20, y:20};
            player.sprites.tint.tileId = {state:'empty', shape:'update'};
            player.sprites.ball.addChild(player.sprites.tint);
        }
        if(player.sprites.tint){
            if(player.sprites.tint.tileId.state !== state || player.sprites.tint.tileId.shape !== shape){
                player.sprites.tint.clear();
                if(state !== 'empty'){
                    if(state == 'rb') player.sprites.tint.beginFill(0xFFFF00, 0.6);
                    else if(state == 'tp') player.sprites.tint.beginFill(0x00FF00, 0.25);
                    if(shape == 'circle') player.sprites.tint.drawCircle(0, 0, 19);
                    else if(shape == 'square') player.sprites.tint.drawRect(-17, -17, 34, 34);
                    else if(shape == 'triangle') player.sprites.tint.drawShape(TRIANGLE);
                }
                player.sprites.tint.tileId.state = state;
                player.sprites.tint.tileId.shape = shape;
            }
            if(state !== 'empty'){
                player.sprites.tint.rotation = player.angle;
                player.sprites.tint.alpha = (state == 'tp') ? 1 : 0.1 + Math.abs(0.6 * Math.sin(performance.now() / 150));
            }
        }
    };
    
    tr.updatePlayerEmitters = function(player){
        var color = player.team === 1 ? "red" : "blue";
        var canSee = player.draw && !player.dead, follow = false, browncoat, vanilla, a, index;
        if(browncoatEmit) follow = true;
        if(!tr.options.disableParticles){
            browncoat = {layer:'foreground', tpTex:'particleTexture', tpProp:'customTP', rbProp:'customRB'};
            vanilla = {layer:'self', tpTex:'particleFireTexture', tpProp:'tagproSparks', rbProp:'rollingBomb'};
            a = (browncoatEmit) ? browncoat : vanilla;
            if(!player.sprites.tagproSparks){tr.addCustomEmitter(player, "tagproSparks", a.layer, a.tpTex, a.tpProp);}
            if(!player.sprites.rollingBomb){tr.addCustomEmitter(player, "rollingBomb", a.layer, "particleTexture", a.rbProp);}
        }
        if(player.sprites.tagproSparks){tr.updateCustomEmitter(player, "tagproSparks", (player.tagpro && canSee), follow);}
        if(player.sprites.rollingBomb){tr.updateCustomEmitter(player, "rollingBomb", (player.bomb && canSee), follow);}
        // - default emitter
        if(browncoatEmit){
            if(player.sprites.emitter){
                if(player.sprites.emitter.tileId != color){
                    index = tr.emitters.indexOf(player.sprites.emitter);
                    player.sprites.emitter.destroy();
                    player.sprites.emitter = null;
                    tr.emitters.splice(index, 1);
                    tr.createPlayerEmitter(player);
                }
            }
        }
    };
    
    tr.updatePlayerShadow = function(player){
        var shape = player.sprites.masker.tileId || 'circle';
        if(!player.sprites.shade){
            player.sprites.shade = new PIXI.DisplayObjectContainer();
            player.sprites.ball.addChildAt(player.sprites.shade, 0);
        }
        if(player.sprites.shade){
            if(!player.sprites.shadow){
                player.sprites.shadow = new PIXI.Sprite(TEX[shape].shadow);
                player.sprites.shade.addChild(player.sprites.shadow);
                player.sprites.shadow.x = 15;
                player.sprites.shadow.y = 25;
                player.sprites.shadow.anchor = {x:0.5, y:0.5};
                player.sprites.shadow.tileId = shape;
            }
            if(player.sprites.shadow){
                if(player.sprites.shadow.tileId !== shape){
                    player.sprites.shadow.setTexture(TEX[shape].shadow);
                    player.sprites.shadow.tileId = shape;
                }
                player.sprites.shadow.rotation = (shape == 'circle') ? 0 : player.angle;
            }
            if(!player.sprites.shadowMask){
                player.sprites.shadowMask = new PIXI.Graphics();
                player.sprites.shadowMask.position = {x:20, y:20};
                player.sprites.shadowMask.tileId = 'empty';
                player.sprites.shade.addChild(player.sprites.shadowMask);
                player.sprites.shade.mask = player.sprites.shadowMask;
            }
            if(player.sprites.shadowMask){
                if(player.sprites.shadowMask.tileId !== shape){
                    player.sprites.shadowMask.clear();
                    if(shape != 'circle'){
                        player.sprites.shadowMask.lineStyle(0).beginFill(0xffffff, 0.75);
                        if(shape == 'square') player.sprites.shadowMask.drawShape(invertedSquare);
                        if(shape == 'triangle') player.sprites.shadowMask.drawShape(invertedTriangle);
                    }
                    player.sprites.shadow.anchor.y = (shape == 'triangle') ? 0.6 : 0.5;
                    player.sprites.shadowMask.tileId = shape;
                }
                player.sprites.shadowMask.rotation = player.angle;
            }
        }
    };
    
});