// ==UserScript==
// @name          TagPro Spectator Center and Move
// @version       0.2.1
// @description   Center and autozoom map when joining as a spectator and allow camera movement with arrow keys, hold shift to double speed and ctrl to halve it
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// @author        Some Ball -1, Cflakes
// ==/UserScript==

tagpro.ready(function() {
    // Change the camera type
    var cameraType = 1; //1 for the camera with friction and acceleration, 2 for the basic camera
    
    //CAMERA TYPE 1 SETTINGS
    
    // Modify various movement settings
    var friction = 2,
        acceleration = 1.5,
        maxSpeed = 2;
    
    //CAMERA TYPE 2 SETTINGS
    
    // Change this number to modify the speed of the basic camera movement
    // 2 is on the slower end, 5 is decent, 10 is pretty fast, play around with it
    var speed = 7; //default is 7
    
    
    ///////////////////////////////////////////
    function begin()
    {
        var shift = false,
            ctrl = false,
            followPlayer = false,
            adds = [0,0,0,0],
            move = {
                x: 0,
                y: 0,
                t: 0,
                t1: 0
            },
            current = {x: tagpro.map.length*20, y: tagpro.map[0].length*20}; //default to map center
        tagpro.socket.on('id',function(id) {
            if(!followPlayer)
            {
                tagpro.viewport.followPlayer = false;
                setTimeout(function() {
                    if(!tagpro.spectator) //in case now a player
                        tagpro.viewport.followPlayer = followPlayer = true;
                }, 250);
            }
            else
                followPlayer = true;
        });
        var cctp = tagpro.renderer.centerContainerToPoint;
        tagpro.renderer.centerContainerToPoint = function (x, y) { //x and y == tagpro.map.length*40/2 if not following player
            if(tagpro.spectator)
            {
                if(cameraType==1)
                {
                    var date = Date.now();
                    if (date > move.t1) {
                        move.t = (date - move.t1);
                        move.t1 = Date.now();
                    }
                    if(tagpro.viewport.followPlayer)
                    {
                        move.x = 0;
                        move.y = 0;
                    }
                }
                if(!tagpro.viewport.followPlayer)
                {
                    if(cameraType==1)
                    {
                        switch (true) {
                            case (adds[2] === 1 && adds[0] === 1) || (adds[2] === 0 && adds[0] === 0):
                                if (move.x > 0) move.x = Math.max(move.x - move.t * friction, 0);
                                if (move.x < 0) move.x = Math.min(move.x + move.t * friction, 0);
                                break;
                            case adds[2] === 1:
                                if (move.x >= 0) move.x = Math.min(move.x + move.t * (acceleration*(shift?2:1)*(ctrl?.5:1)), (maxSpeed*(shift?2:1)*(ctrl?.5:1)) * move.t * 70);
                                if (move.x < 0) move.x = Math.min(move.x + move.t * ((acceleration*(shift?2:1)*(ctrl?.5:1)) + friction), (maxSpeed*(shift?2:1)*(ctrl?.5:1)) * move.t * 70);
                                break;
                            case adds[0] === 1:
                                if (move.x <= 0) move.x = Math.max(move.x - move.t * (acceleration*(shift?2:1)*(ctrl?.5:1)), -(maxSpeed*(shift?2:1)*(ctrl?.5:1)) * move.t * 70);
                                if (move.x > 0) move.x = Math.max(move.x - move.t * ((acceleration*(shift?2:1)*(ctrl?.5:1)) + friction), -(maxSpeed*(shift?2:1)*(ctrl?.5:1)) * move.t * 70);
                                break;
                        }
                        switch (true) {
                            case (adds[3] === 1 && adds[1] === 1) || (adds[3] === 0 && adds[1] === 0):
                                if (move.y > 0) move.y = Math.max(move.y - move.t * friction, 0);
                                if (move.y < 0) move.y = Math.min(move.y + move.t * friction, 0);
                                break;
                            case adds[3] === 1:
                                if (move.y >= 0) move.y = Math.min(move.y + move.t * (acceleration*(shift?2:1)*(ctrl?.5:1)), (maxSpeed*(shift?2:1)*(ctrl?.5:1)) * move.t * 70);
                                if (move.y < 0) move.y = Math.min(move.y + move.t * ((acceleration*(shift?2:1)*(ctrl?.5:1)) + friction), (maxSpeed*(shift?2:1)*(ctrl?.5:1)) * move.t * 70);
                                break;
                            case adds[1] === 1:
                                if (move.y <= 0) move.y = Math.max(move.y - move.t * (acceleration*(shift?2:1)*(ctrl?.5:1)), -maxSpeed * move.t * 70);
                                if (move.y > 0) move.y = Math.max(move.y - move.t * ((acceleration*(shift?2:1)*(ctrl?.5:1)) + friction), -(maxSpeed*(shift?2:1)*(ctrl?.5:1)) * move.t * 70);
                                break;
                        }
                        current.x += (move.x * tagpro.zoom) / 200;
                        current.y += (move.y * tagpro.zoom) / 200;
                    }
                    else if(cameraType==2)
                    {
                        current.x += (adds[2]-adds[0])*speed*(shift?2:1)*(ctrl?.5:1); //to modify viewport source directly so it works with scaling
                        current.y += (adds[3]-adds[1])*speed*(shift?2:1)*(ctrl?.5:1);
                    }
                    x = current.x;
                    y = current.y;
                }
                else
                {
                    current.x = x; //back to player
                    current.y = y;
                }
            }
            return cctp.apply(this, arguments);
        };
        $(document).keydown(function(key) { //37 left, 38 up, 39 right, 40 down
            if(tagpro.spectator)
            {
                if(tagpro.keys.specNext.indexOf(key.keyCode) != -1 || tagpro.keys.specPrev.indexOf(key.keyCode) != -1  || tagpro.keys.specRedFC.indexOf(key.keyCode) != -1 || tagpro.keys.specBlueFC.indexOf(key.keyCode) != -1 || (tagpro.keys.centerZoom.indexOf(key.keyCode) != -1 && !followPlayer))
                {
                    followPlayer = true;
                }
                else if(tagpro.keys.centerZoom.indexOf(key.keyCode) != -1)
                {
                    followPlayer = false;
                    current = {x: tagpro.map.length*20, y: tagpro.map[0].length*20}; //center on map
                }
                shift = key.shiftKey;
                ctrl = key.ctrlKey;
                if(key.which>=37 && key.which<=40)
                {
                    adds[key.which-37] = 1;
                    tagpro.viewport.followPlayer = false;
                    followPlayer = false;
                }
            }
        }).keyup(function(key) {
            if(tagpro.spectator)
            {
                shift = key.shiftKey;
                ctrl = key.ctrlKey;
                if(key.which>=37 && key.which<=40)
                {
                    adds[key.which-37] = 0;
                }
            }
        });
    }
    function centerAndZoom()
    {
        if(tagpro.viewport.followPlayer)
        {
            tagpro.viewport.followPlayer = false; //auto centers camera in v3
            var max = {x: tagpro.map.length, y: tagpro.map[0].length},
                viewport = document.getElementById('viewport');
            max = Math.max(max.x*40/viewport.width,max.y*40/viewport.height);
            var zooms = [1, 4/3, 5/3, 2, 2.5, 10/3, 4, 5, max]; //throw max as last element in case >5
            for(var i = 0;i < zooms.length;i++)
            {
                if(zooms[i]>=max)
                {
                    tagpro.zoom = zooms[i];
                    break;
                }
            }
        }
        begin();
    }
    if(!tagpro.spectator)
    {
        var spec = false;
        tagpro.socket.on('spectator',function() {
            if(!spec)
            {
                centerAndZoom();
                spec = true;
            }
        });
    }
    else
    {
        centerAndZoom();
    }
});