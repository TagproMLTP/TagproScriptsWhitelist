// ==UserScript==
// @name          TagPro Triple Jump
// @version       0.1
// @grant         none
// @include       http://tagpro-maptest.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// ==/UserScript==

tagpro.ready(function init() {
    if (!tagpro.playerId) return setTimeout(init, 200);
    
    var self = tagpro.players[tagpro.playerId],
        key = {go: false, sent: {}, press: {}, dir: ['right', 'left'], count: 1, emit: tagpro.socket.emit},
        body = {},
        savedLoc = null;
    
    tagpro.socket.emit = function(event, data) {
        if (event === 'keydown' || event === 'keyup') {
            data.t = key.count++;
        }
        key.emit(event, data);
    };
    
    document.onkeydown = function(e) { handleKeys(e, true, 'keydown'); };
    document.onkeyup = function(e) { handleKeys(e, false, 'keyup'); };
    
    function handleKeys(a, b, c) {
        if (a.which === 18) key.go = b;
        if (!b) releaseKeys();
        key.dir.forEach(function(d) {
            if (a.which === tagpro.keys[d][0]) { key.press[d] = c; key.sent[d] = c; }
        });
    }
    
    function sendKey(keyState, direction) {
        if (key.press[direction] === 'keydown' || key.sent[direction] === keyState) return;
        key.sent[direction] = keyState;
        var e = $.Event(keyState);
        e.keyCode = tagpro.keys[direction][0];
        $('#viewport').trigger(e);
    }
    
    function releaseKeys() {
        key.dir.forEach(function(d) {
            if (key.press[d] === 'keydown') sendKey('keydown', d);
            else sendKey('keyup', d);
        });
    }
    
    Box2D.Dynamics.b2Body.prototype.GetPosition = function () {
        if (!body[this.player.id]) {
            body[this.player.id] = this;
        }
        return this.m_xf.position;
    };
    
    function move(destination) {
        if (destination >= 0.25 || destination <= -0.25) {
            if (destination >= 0.5) {
                sendKey('keyup', 'left');
                sendKey('keydown', 'right');
            } else {
                if (destination <= -0.5) {
                    sendKey('keyup', 'right');
                    sendKey('keydown', 'left');
                }
            }
        } else {
            sendKey('keyup', 'right');
            sendKey('keyup', 'left');
        }
    }
    
    function loop() {
        if (!body[tagpro.playerId]) return;
        var velocity = body[tagpro.playerId].GetLinearVelocity(),
            position = body[tagpro.playerId].GetPosition(),
            location = position.x * 100 + velocity.x * 25;
        if (key.go && position.y > 9.1 && position.y < 9.3 && (velocity.x > 1.75 || velocity.x < -1.75)) {
            if (!savedLoc) savedLoc = location;
            var seek = (Math.round((savedLoc - 20) / 40) * 40) - (position.x * 100 - 20),
                offset = null;
            if (velocity.x > 1.75) {
                offset = (velocity.x * (1 + ((velocity.x - 1.75) / 4.5))) * (tagpro.ping.current / 9);
                if (seek < offset) {
                    tagpro.socket.emit('keydown', {k: 'up', t: key.count});
                }
            } else {
                if (velocity.x < -1.75) {
                    var vel = Math.abs(velocity.x);
                    offset = (vel * (1 + ((vel - 1.75) / 4.5))) * (tagpro.ping.current / 9);
                    if (seek > -offset) {
                        tagpro.socket.emit('keydown', {k: 'up', t: key.count});
                    }
                }
            }
            console.log(seek);
        } else {
            savedLoc = null;
        }
    }
    setInterval(loop, 0);
});