// ==UserScript==
// @name            TagPro Telestrator
// @version         2.0.1
// @description     Use a telestrator while spectating TagPro!
// @include         http://tagpro-*.koalabeast.com:*
// @include         http://tangent.jukejuice.com:*
// @include         http://maptest*.newcompte.fr:*
// @author          BBQchicken
// ==/UserScript==

tagpro.ready(function init() {
    if (!tagpro.playerId || !tagpro.renderer.layers.foreground) {
        return setTimeout(init, 200);
    }
    if (!tagpro.spectator) {
        return false;
    }

// ---------- OPTIONS ---------- \\

	var kickClick = false;
	var traceLength = Infinity;
    var blinkTime = 250;
    
    var circleColor = 0xFF6600;
    var pathColor = 0xFFFF00;
    var arrowColor = 0xC800FA;
    
// ---------- PATH -------------- \\
    
    var dashOn = true;
    
    function Path(start, color, alpha, dashed) {
        this.points = [start, start, start];
        this.color = color;
        this.alpha = alpha || 0.6;
        this.dashed = dashed;
        this.graphics = new PIXI.Graphics();
        tagpro.renderer.layers.foreground.addChild(this.graphics);
    }
    
    Path.prototype.update = function(point) {
        var points = this.points;
        this.graphics.lineStyle(10, this.color, this.alpha);
        var from = points.shift();
        points.push(point);
        this.graphics.moveTo(from.x, from.y);
//        this.graphics.quadraticCurveTo(points[0].x, points[0].y, points[1].x, points[1].y);
//        this.graphics.bezierCurveTo(points[0].x, points[0].y, points[1].x, points[1].y, points[2].x, points[2].y);
        (!this.dashed || dashOn) && this.graphics.lineTo(points[0].x, points[0].y);
        
    }
    
    Path.prototype.clear = function() { 
        this.graphics.clear();
        tagpro.renderer.layers.foreground.removeChild(this.graphics);
    }
    
    function Trace(player) {
        this.player = player;
        this.path = new Path({x: player.x + 20, y: player.y + 20}, player.team === 1 ? 0xFF0000 : 0x0000FF, 0.6, true);
    }
    
    Trace.prototype.update = function() {
        this.path.update({x: this.player.x + 20, y: this.player.y + 20});
    };

    Trace.prototype.clear = function(delayMS) {
        this.path.clear(delayMS);
    };
    
    function Circle(center, color) {
        this.radius = 0;
        this.color = color || 0;
        this.center = center;
        this.graphics = new PIXI.Graphics();
        tagpro.renderer.layers.foreground.addChild(this.graphics);
    }
    
    Circle.prototype.update = function(point) {
        this.radius = Math.sqrt(Math.pow((point.x - this.center.x), 2) + Math.pow(point.y - this.center.y, 2));
        this.graphics.clear();
        this.graphics.lineStyle(10, this.color, 0.6);
        this.graphics.drawCircle(this.center.x, this.center.y, this.radius);
    }
    
    Circle.prototype.clear = function() {
        this.graphics.clear();
        tagpro.renderer.layers.foreground.removeChild(this.graphics);
    }

    function Arrow(start, color) {
        console.log("Arrow constructor start");
        this.start = new PIXI.Point(start.x, start.y);
        this.wingLength = 45;
        this.headAngle = .4;
        this.leftWing = this.start.clone();
        this.rightWing = this.start.clone();
        //this.end = this.start.clone();
        this.angle = 0;
        this.color = color || 0;
        
        console.log("Arrow Graphics creation");
        this.graphics = new PIXI.Graphics();
        tagpro.renderer.layers.foreground.addChild(this.graphics);
        console.log("Arrow constructor end");
    }
    
    Arrow.prototype.rotateHead = function(end) {
        console.log("Arrow rotate right wing");
        var phiRight = this.angle + this.headAngle;
        this.rightWing.x = end.x - this.wingLength * Math.cos(phiRight);
        this.rightWing.y = end.y - this.wingLength * Math.sin(phiRight);

        console.log("Arrow rotate left wing");
        var phiLeft = this.angle - this.headAngle;
        this.leftWing.x = end.x - this.wingLength * Math.cos(phiLeft);
        this.leftWing.y = end.y - this.wingLength * Math.sin(phiLeft);
    }
    
    Arrow.prototype.draw = function(end) {
        console.log("Arrow draw begin");
        this.graphics.clear();
        this.graphics.lineStyle(10, this.color, .6);
        this.graphics.moveTo(this.start.x, this.start.y);
        this.graphics.lineTo(end.x, end.y);
        this.graphics.moveTo(this.rightWing.x, this.rightWing.y);
        this.graphics.lineTo(end.x, end.y);
        this.graphics.lineTo(this.leftWing.x, this.leftWing.y);
        console.log("Arrow draw end");
    }
    
    Arrow.prototype.update = function(end) {
        console.log("Arrow update begin");
        //this.end = end;
        this.angle = Math.atan2(end.y - this.start.y, end.x - this.start.x);
        this.rotateHead(end);
        this.draw(end);
        console.log("Arrow update end");
    }
    
    Arrow.prototype.clear = function() {
        this.graphics.clear();
        tagpro.renderer.layers.foreground.removeChild(this.graphics);
    }
    
    
    var current = null, drawing = false, drawings = [], traces = [];
    var shift = false, alt = false;
    var stage = tagpro.renderer.stage;
    
    tpKick = tagpro.kick.player;
    tagpro.kick.player = function (player) {
        console.log("kick.player called");
        var shiftAlt = (alt && shift);
        if (kickClick || !(tagpro.spectator || shiftAlt)) {
            tpKick(player);
        }
        if (shiftAlt) {
            console.log("trace added");
            traces.push(new Trace(player));
        }
    }
    
    $(document).on("keydown keyup", function (event) {
        shift = event.shiftKey;
        alt = event.altKey;
    });
    
    $(document).dblclick(function(event) {
        window.getSelection().removeAllRanges();
        
        for (var i in drawings) {
            drawings[i].clear();
        }
        drawings = [];
        
        for (var i in traces) {
            traces[i].clear();
        }
        traces = [];
    });
    
    //thanks to ProfessorTag
    function canvasMousePosition(e) {
        var tr = tagpro.renderer;
        var resizeScaleFactor = tr.options.disableViewportScaling ? 1 : (tr.vpHeight / tr.canvas_height).toFixed(2),
            scale = (tagpro.zoom / resizeScaleFactor),
            x1 = tr.gameContainer.x * scale,
            x2 = x1 - tr.vpWidth * scale,
            x = - Math.round((x1 + x2) / 2 - (e.x - innerWidth / 2) * scale),
            y1 = tr.gameContainer.y * scale,
            y2 = y1 - tr.vpHeight * scale,
            y = - Math.round((y1 + y2) / 2 - (e.y - innerHeight / 2) * scale);
        return {x: x, y: y};
	}
    
    window.onmousedown = function (click) {
        drawing = true;
    }
    
    window.onmousemove = function(click) {
        if (!drawing) {
            return false;
        } else if (current) {
            current.update(canvasMousePosition(click));
        } else {
            if (shift && alt) {
                drawing = false;
            } else if (shift) {
                current = new Arrow(canvasMousePosition(click), arrowColor);
            } else if (alt) {
                current = new Circle(canvasMousePosition(click), circleColor);
            } else {
                current = new Path(canvasMousePosition(click), pathColor);
            }
        }
    }
    
    window.onmouseup = function(click) {
        console.log("mouseup");
        drawing = false;
        current && drawings.push(current);
        current = null;
    }
    
    function drawAll() {
        traces.forEach(function(trace, traceIdx) {
            trace && trace.update();
        });
        requestAnimFrame(drawAll);
    }
    
    requestAnimFrame(drawAll);
    
    setInterval(function() {
        dashOn = !dashOn;
    }, blinkTime);
});