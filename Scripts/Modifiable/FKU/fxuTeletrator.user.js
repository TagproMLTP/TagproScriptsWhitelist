// ==UserScript==
// @name            TagPro Telestrator
// @version         2.1.1
// @description     Use a telestrator while spectating TagPro!
// @include         http://tagpro-*.koalabeast.com:*
// @include         http://tangent.jukejuice.com:*
// @include         http://maptest*.newcompte.fr:*
// @author          BBQchicken
// @namespace       reddit.com/u/Splanky222
// @downloadURL     https://gist.github.com/JonathanDCohen/50aea7b437c64b728199/raw/tagpro_telestrator_2_0.user.js
// ==/UserScript==

tagpro.ready(function init() {
    if (!tagpro.playerId || !tagpro.renderer.layers.background) {
        return setTimeout(init, 200);
    }
    if (!tagpro.spectator) {
        return false;
    }
    tagpro.socket.on('spectator', function(spectating) {
        if (!spectating) {
            clearAllGraphics();
        }
    });

    var traceLayer = tagpro.renderer.layers.midground;
    var drawingLayer = tagpro.renderer.layers.foreground;

    // ---------- OPTIONS ---------- \\

var kickClick = true;
var traceLength = 5;
var blinkTime = 200;

var circleColor = 0xFF6600;
var pathColor = 0xFFFF00;
var arrowColor = 0xC800FA;

var autoTrace = true;
var traceDelay = 2000;

    // ---------- PATH -------------- \\

    var dashOn = true;

    function Path(start, color, alpha, dashed, layer) {
        this.points = [start, start, start];
        this.color = color;
        this.alpha = alpha || 0.6;
        this.dashed = dashed;
        this.graphics = new PIXI.Graphics();
        this.layer = layer || drawingLayer;
        this.layer.addChild(this.graphics);
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
    };

    Path.prototype.clear = function(delayMS) {
        var delay = delayMS || 0;
        var graphics = this.graphics;
        var layer = this.layer;
        setTimeout(function() {
            graphics.clear();
            layer.removeChild(graphics);
        }, delayMS);
    };


    // ---------- TRACE -------------- \\

    function Trace(player, auto) {
        this.player = player;
        this.path = new Path({x: player.x + 20, y: player.y + 20}, player.team === 1 ? 0xFF0000 : 0x0000FF, 0.4, true, traceLayer);
        this.active = true;
        this.flaccid = auto;
        var thisThing = this;  //because javascript scope rules
        this.flaccid && setTimeout(function() { thisThing.flaccid = false; }, 3000);
    }

    Trace.prototype.update = function() {
        this.active && this.path.update({x: this.player.x + 20, y: this.player.y + 20});
    };

    Trace.prototype.clear = function(delayMS) {
        this.path.clear(this.flaccid ? 0 : delayMS);
    };

    Trace.prototype.stop = function() {
        this.active = false;
    };

    // ---------- CIRCLE -------------- \\

    function Circle(center, color) {
        this.radius = 0;
        this.color = color || 0;
        this.center = center;
        this.graphics = new PIXI.Graphics();
        drawingLayer.addChild(this.graphics);
    }

    Circle.prototype.update = function(point) {
        this.radius = Math.sqrt(Math.pow((point.x - this.center.x), 2) + Math.pow(point.y - this.center.y, 2));
        this.graphics.clear();
        this.graphics.lineStyle(10, this.color, 0.6);
        this.graphics.drawCircle(this.center.x, this.center.y, this.radius);
    };

    Circle.prototype.clear = function() {
        this.graphics.clear();
        drawingLayer.removeChild(this.graphics);
    };

    // ---------- ARROW -------------- \\

    function Arrow(start, color) {
        this.start = new PIXI.Point(start.x, start.y);
        this.wingLength = 45;
        this.headAngle = 0.4;
        this.leftWing = this.start.clone();
        this.rightWing = this.start.clone();
        this.angle = 0;
        this.color = color || 0;

        this.graphics = new PIXI.Graphics();
        drawingLayer.addChild(this.graphics);
    }

    Arrow.prototype.rotateHead = function(end) {
        var phiRight = this.angle + this.headAngle;
        this.rightWing.x = end.x - this.wingLength * Math.cos(phiRight);
        this.rightWing.y = end.y - this.wingLength * Math.sin(phiRight);

        var phiLeft = this.angle - this.headAngle;
        this.leftWing.x = end.x - this.wingLength * Math.cos(phiLeft);
        this.leftWing.y = end.y - this.wingLength * Math.sin(phiLeft);
    };

    Arrow.prototype.draw = function(end) {
        this.graphics.clear();
        this.graphics.lineStyle(10, this.color, 0.6);
        this.graphics.moveTo(this.start.x, this.start.y);
        this.graphics.lineTo(end.x, end.y);
        this.graphics.moveTo(this.rightWing.x, this.rightWing.y);
        this.graphics.lineTo(end.x, end.y);
        this.graphics.lineTo(this.leftWing.x, this.leftWing.y);
    };

    Arrow.prototype.update = function(end) {
        //this.end = end;
        this.angle = Math.atan2(end.y - this.start.y, end.x - this.start.x);
        this.rotateHead(end);
        this.draw(end);
    };

    Arrow.prototype.clear = function() {
        this.graphics.clear();
        drawingLayer.removeChild(this.graphics);
    };


    // ---------- LOGIC -------------- \\

    var current = null, drawing = false, drawings = [], traces = {};
    var shift = false, alt = false;
    var stage = tagpro.renderer.stage;

    function addUniqueTrace(player, auto) {
        if (!traces[player.id]) {
            traces[player.id] = new Trace(player, auto || false);
        }
    }

    function removeTrace(id) {
        if (!traces[id]) { 
            return false; 
        }
        traces[id].stop();
        traces[id].clear(traceDelay);
        setTimeout(function() { delete traces[id]; }, traceDelay);
    }

    tagpro.socket.on('p', function (event) {
        var events = (tagpro.serverHost.search("map") !== -1) ? event.u : event;
        for (var idx in events) {
            var e = events[idx];
            if ((typeof(e.flag) !== 'undefined') && e.flag) {
                autoTrace && addUniqueTrace(tagpro.players[e.id], true);
            } else if((typeof(e['s-pops']) !== 'undefined') || (typeof(e['s-captures']) !== 'undefined')) {
                removeTrace(e.id);
            }
        }
    });

    tpKick = tagpro.kick.player;
    tagpro.kick.player = function (player) {
        var shiftAlt = (alt && shift);
        if (kickClick || !(tagpro.spectator || shiftAlt)) {
            tpKick(player);
        }
        if (shiftAlt) {
            addUniqueTrace(player, false);
        }
    };

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

        if (!event.shiftKey) {
            return false;
        }

        for (var i in traces) {
            traces[i] && traces[i].clear();
        }
        traces = {};
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
    };

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
    };

    window.onmouseup = function(click) {
        console.log("mouseup");
        drawing = false;
        current && drawings.push(current);
        current = null;
    };

    function drawAll() {
        for (var idx in traces) {
            trace = traces[idx];
            trace && trace.update();
        }
        requestAnimFrame(drawAll);
    }

    requestAnimFrame(drawAll);

    setInterval(function() {
        dashOn = !dashOn;
    }, blinkTime);
    
    function clearAllGraphics() {
        for (var i in drawings) {
            drawings[i].clear();
        }
        drawings = [];
        for (var i in traces) {
            traces[i] && traces[i].clear();
        }
        traces = {};
    };
});