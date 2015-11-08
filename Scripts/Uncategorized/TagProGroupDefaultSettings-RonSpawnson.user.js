// ==UserScript==
// @name       	 	Tagpro Group Default Settings
// @version    	 	0.4
// @description  	Adds a button to set all settings to their default values
// @include		 	http://tagpro-*.koalabeast.com/groups/*
// @include		 	http://tangent.jukejuice.com/groups/*
// @include			http://maptest.newcompte.fr/groups/*
// @author			Some Ball -1, RonSpawnson
// ==/UserScript==

$(function() {
    //if true, the value of caps will be expected to be set to No Limit
    //if false, the value of caps will ignored when making settings default
    var includeCaps = true;
    
    
    var defaulted = false;
    var isLeader = false;
    var values = {//map: '',
        caps: 0,
        time: 10,
        accel: 1,
        topspeed: 1,
        bounce: 1,
        playerRespawnTime: 3000,
        speedPadRespawnTime: 10000,
        dynamiteRespawnTime: 30000,
        buffRespawnTime: 60000};
    function isDefaulted()
    {
        var match = [0,0,0,0,0,0,0,0,0];
        var items = $('.setting.value');
        for(var i = 1;i < 10;i++)
        {
            if(items[i].value==values[items[i].name])
            {
                match[i-1] = 1;
            }
        }
        var sum = match.reduce(function(a, b) {
            return a + b;
        });
        if(sum==9 || (!includeCaps && sum==8))
        {
            return true;
        }
        return false;
    }
    
    function leaderCheck()
    {
        if(typeof $('.leader.you').data('model')!='undefined')
        {
            if(!isLeader) //now a leader
            {
            	$("#defaultSettings").show();
            	isLeader = true;
            }
        }
        else if(isLeader) //no longer a leader
        {
           $("#defaultSettings").hide();
            isLeader = false;
        }
    }
    
    $('#settings :first').after('<button id="defaultSettings" type="button">Default Settings</button>');
    $('#defaultSettings').click(function() {
        if(isLeader)
        {
            for(var x in values)
            {
                if((x=='caps' && includeCaps) || x!='caps')
                {
                    tagpro.group.socket.emit('setting',{
                        name: x,
                        value: values[x]
                    });
                }
            }
        }
    });
    leaderCheck();
    defaulted = isDefaulted();
    if (defaulted == true) {
        $("#defaultSettings").hide();  
    } else {
    	$("#defaultSettings").show();  
    }

    //$('#defaultSettings').prop('enabled',defaulted);
    tagpro.group.socket.on('setting',function(data) {
        if(data.name!='map' && typeof values[data.name]!='undefined') //not maps and a value we maybe care about
        {
            if((includeCaps && data.name=='caps') || data.name!='caps') //whether caps are important or not
            {
                defaulted = isDefaulted();
                if (defaulted == true) {
        			$("#defaultSettings").hide();  
    			} else {
    				$("#defaultSettings").show();  
    			}
            }
        }
    });
    setInterval(leaderCheck,500);
});