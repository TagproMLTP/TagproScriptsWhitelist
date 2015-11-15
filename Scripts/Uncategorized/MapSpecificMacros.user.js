// ==UserScript==
// @name          TagPro Chat Map-Specific Macros
// @namespace     github.com/karlding
// @description   Set custom macros for each map (with donger support)
// @include       http://*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// @license       GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author        Karl Ding
// @copyright     2014+, 0K
// @version       0.1.3
// ==/UserScript==

tagpro.ready(function() {
    
    /**
     * The common variable stores all the macros that will be accessible for every map. If you'd like to 
     *    use that key for some different macro on another map, setting it in the data variable will 
     *    override the common settings.
     * 
     * Setting up the common variable is quite similar to the macros portion of the data variable, so look 
     *    down there if you're confused. Remember that setting a key in the data section will override the 
     *    common key (take a look at "Jagged by Pirate" for an example, and note how the message 
     *    "i'll play d" is replaced).
     * 
     * Modify the data variable to suit your configuration. To find the mapString, either copy and paste 
     *    the map name, " by " and then the map-author, or open up the console and look for the 
     *    mapString there, when you're on the map
     * 
     * eg: "The mapString is: Cloud by Ball-E"
     *      Therefore, you would write map: "Cloud by Ball-E",
     *         followed by whatever macros you'd like to set
     * 
     * Begin with the keyCode, followed by the message, and then whether the message is to be sent to your 
     *    team or not
     *     
     * eg. macros: {66: {message: "please BLOCK, i'm BOOSTING IN", toAll: false} }
     *     `66` is the keyCode for the key `b`, meaning that the macro is triggered whenever you hit `b`
     *     what follows `message:` in quotations (message: "your message here") is the message to be sent
     *     `toAll: false` means that the message will only be sent to your team
     *             true will mean that the message is sent to everyone
     */
    
    var common = {
        219: {message: "tengo los libros", toAll: true},
        192: {message: "I blame lukemoo", toAll: true}, // `
        221: {message: "(⌐■_■)–︻╦╤─ --nice snipe!", toAll: false},
        18: {message: "I blame Ramrod", toAll: true},
        222: {message: "¯\(ツ)/¯", toAll: true}
    };
    
    var data = [
        {
            map: "Cloud by Ball-E",
            macros: {
                49: {message: "ლ༼ ▀̿ Ĺ̯ ▀̿ ლ༽", toAll: true}, // 1
                50: {message: "(┛ಠДಠ)┛彡┻━┻ please HOLD LE BUTTON", toAll: false}, // 2
            }
        },
        {
            map: "Hyperdrive by Rapture",
            macros: {
                112: {message: "the enemy FC is LEFT", toAll: false}, // F1
                113: {message: "the enemy FC is IN THE MIDDLE", toAll: false}, // F2
                114: {message: "the enemy FC is RIGHT", toAll: false}, // F3
                186: {message: "our base is CLEAR", toAll: false}, // ;
                67: {message: "ʕ ﹒ ᴥ ﹒ ʔ dear team: PLEASE CHASE.", toALL: false} // c
            }
        },
        {
            map: "IRON by bowtie",
            macros: {
                112: {message: "the enemy FC is GOING TOP", toAll: false}, // F1
                113: {message: "the enemy FC is GOING MID", toAll: false}, // F2
                114: {message: "the enemy FC is GOING GATES", toAll: false}, // F3
                186: {message: "our base is CLEAR", toAll: false}, // ;
                186: {message: "enemy TAGPRO in BASE", toAll: false} // [
            }
        },
        {
            map: "Jagged by Pirate",
            macros: {
                66: {message: "please BLOCK, i'm BOOSTING IN", toAll: false}, // b
                86: {message: "please BLOCK, i'm BOMBING IN", toAll: false}, // v
                192: {message: "this overrode the original message on `", toAll: false} // `
            }
        },
        {
            map: "Velocity by David Stern",
            macros: {
                112: {message: "the enemy FC is GOING 1", toAll: false}, // F1
                113: {message: "the enemy FC is GOING 2", toAll: false}, // F2
                114: {message: "the enemy FC is GOING 3", toAll: false}, // F3
                115: {message: "the enemy FC is GOING 4", toAll: false}, // F4
                116: {message: "the enemy FC is BOMBING IN", toAll: false}, // F5
                186: {message: "our base is CLEAR", toAll: false} // ;
            }
        }
    ];
    
    
    
    /*
     * ===========================================================
     * DO NOT MODIFY BELOW HERE UNLESS YOU KNOW WHAT YOU'RE DOING
     * MODIFY AT YOUR OWN RISK, I AM NOT TO BE HELD ACCOUNTABLE
     * HALT! BE WARNED, HERE BE DRAGONS
     * ===========================================================
     */
    
    var mapString = "";
    
    tagpro.socket.on('map', function(mapData) {
        mapString = mapData.info.name + " by " + mapData.info.author;
        console.log("The mapString is: " + mapString);
        
        var index = findWithAttr(data, "map", mapString);
        var macros = false;
        if (index != -1)
            var macros = data[index]['macros'];
            
        
        $(document).on('keydown', function(e) {
            if (macros !== false && e.keyCode in macros && !tagpro.disableControls) {
                e.preventDefault();
                
                tagpro.socket.emit('chat', {
                    message: macros[e.keyCode]['message'],
                    toAll: macros[e.keyCode]['toAll']
                })
            }
            else if (e.keyCode in common && !tagpro.disableControls) {
                e.preventDefault();
                
                tagpro.socket.emit('chat', {
                    message: common[e.keyCode]['message'],
                    toAll: common[e.keyCode]['toAll']
                })
            }
        });
    })
});


// Helper functions

/**
 * @function findWithAttr Performs a search in an array on the given key
 * @param {Object[]} arr - array object (haystack) on which the search should be performed
 * @param {string} attr - attribute to search through
 * @param {string} value - value (needle) to look for
 * @return {number} - returns the index that the value was located at, or -1 if not foud
 */
function findWithAttr(arr, attr, value) {
    for (var i = 0; i < arr.length; ++i) {
        if (arr[i][attr] === value) {
            return i;
        }
    }
    
    return -1;
}