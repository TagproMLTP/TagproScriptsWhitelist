// ==UserScript==
// @name         Tagpro Morning and Afternoon Textures
// @namespace    http://your.homepage/
// @version      0.1
// @description  Uses different texture packs based on the time of day
// @author       Acid Rap(/u/kunmeh13)
// ==/UserScript==


//OPTIONS

//URLS FOR THE LIGHT TEXTURE
var lightTiles = 'http://i.imgur.com/whatever.png';            //Tiles
var lightNeutralBoosts = 'http://i.imgur.com/whatever.png';    //Neutral Boosts
var lightRedBoosts = 'http://i.imgur.com/whatever.png';        //Red Team Boosts
var lightBlueBoosts = 'http://i.imgur.com/whatever.png';       //Blue Team Boosts
var lightSplats = 'http://i.imgur.com/whatever.png';           //Splats
var lightPortals = 'http://i.imgur.com/whatever.png';          //Portals

//URLS FOR THE DARK TEXTURE
var darkTiles = 'http://i.imgur.com/whatever.png';            //Tiles
var darkNeutralBoosts = 'http://i.imgur.com/whatever.png';    //Neutral Boosts
var darkRedBoosts = 'http://i.imgur.com/whatever.png';        //Red Team Boosts
var darkBlueBoosts = 'http://i.imgur.com/whatever.png';       //Blue Team Boosts
var darkSplats = 'http://i.imgur.com/whatever.png';           //Splats
var darkPortals = 'http://i.imgur.com/whatever.png';          //Portals

var earlyHour = 6;//Choose the hour you want the light texture to turn on(in military time)
var darkTime = 21;//Choose the hour you want the dark texture to turn on(in military time)




//SCRIPT \/

var date = new Date();
var hour = date.getHours();

//Light Texture
if(hour >= earlyHour && hour < darkTime){
    tagpro.loadAssets({
        "tiles": lightTiles,
        "splats": lightSplats,
        "speedpad": lightNeutralBoosts,
        "speedpadRed": lightRedBoosts,
        "speedpadBlue": lightBlueBoosts,
        "portal": lightPortals
    });
}

//Dark Texture
if(hour < earlyHour || hour >= darkTime){
    tagpro.loadAssets({
        "tiles": darkTiles,
        "splats": darkSplats,
        "speedpad": darkNeutralBoosts,
        "speedpadRed": darkRedBoosts,
        "speedpadBlue": darkBlueBoosts,
        "portal": darkPortals
    });
}