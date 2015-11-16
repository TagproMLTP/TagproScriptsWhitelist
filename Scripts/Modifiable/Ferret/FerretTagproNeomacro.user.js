/*
*   TagPro Neomacro | UserScript by Popcorn.
*   ========================================
*   Are you tired of overly complex chat macro systems? Have you forgotten whether you bound "Yes" to I or U?
*   This is Neomacro -- TagPro macro system that uses arrow keys, ctrl and 0 (zero) (you use WASD to control
*   the game, don't you?) to create powerful and easy-to-remember macro codes.
*   
*   1.0 update: Redesigned some macros, be sure to take a look.
*   1.1 update: Simplified code, added more comments
*   1.2 update: Goodbye, backspace and ctrl+something!
*   1.3 update: Added special handling for direction macros. Introduced 0 (zero) as a direction-giving key.
*               Added more direction macros.
*
*   It may contain bugs. If you notice one, please leave comment below ↓↓.
*   
*   Install this UserScript by pressing the <> in the upper right corner of the code ↗
*   
*   Find the macro combinations by scrolling down the script
*   (they're inside the config section, starting with "var teamMacros =", "var directionMacros ="
*   and "var globalMacros =") ↓
*   
*   Enter the combination by pressing the keys one by one (←↑→↓ arrow keys and ● ctrl).
*   
*   Some combinations have aliases: for example, ←↓ is the same as ↓←, and →←→ is the same as ←→←.
*   
*   Here's the macro dictionary. It will help you remember the codes:
*   
*   Directions to enemy FC: two arrow presses, for example:
*   ↑↑ Enemy FC on upper side (↑)
*   ↑→ or →↑ Enemy FC on upper right (↗)
*   Or a zero press:
*   0 Enemy FC in the middle (●)
*
*   (Directions to something else see below)
*
*   "Yes" and "No" codes are similar to head movements (shaking/nodding):
*   yes  ↑↓↑ or ↓↑↓
*   no   ←→← or →←→
*
*     Words used in sentences:
*     nouns           verbs
*   ---------    ---------------
*   I/me    ↓    defend        ↓
*   enemy   ↑    attack        ↑
*                trick/tactic  ←
*                use button    →
*   
*   Indicative sentences: (noun)●(verb)
*   examples: ↓●↓ I'll defend.
*             ↑●← Enemy's trying to trick us!
*
*   Questions: ●(verb)
*   Be aware about ●↑ Where's enemy FC?
*   examples: ●↓ Is our flag safe?
*             ●← What's our plan? How many defenders?
*             ●→ Is the button safe?
*
*   Giving commands: (verb)●●
*   examples: ↓●● Defend our flag!
*             ←●● Trick the enemy!
*
*   Giving directions: (noun)0(direction)
*             ↑0↑↑  Enemy on top. (↑)
*             ↓0↓↓  I'm coming bottom. (↓)
*             ←0←↑  Upper left is safe. (↖)
*   Directions to enemy FC are unprefixed, as mentioned before.
*
*   Emotes (messages chosen randomly):
*   ●●↑ happy
*   ●●↓ angry
*   ●●← really bad jokes
*   ●●→ promote Neomacro ('Cos it's best, that's why.)
*   
*   Have fun, don't forget to report bugs, and don't ever forget t**ALL GLORY TO THE HYPNOTOAD**
*/

// ==UserScript==
// @name TagPro Neomacro
// @namespace http://tiny.cc/neomacro
// @description Based on https://gist.github.com/steppin/5292526 by http://www.reddit.com/user/contact_lens_linux/
// @include http://tagpro-*.koalabeast.com:*
// @license GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author Popcorn
// @version 1.3
// ==/UserScript==

// Body of this function is injected into the HTML page
function Script()
{
    /**************************
    *                         *
    * START OF CONFIG SECTION *
    *                         *
    **************************/

    // These are JS keycodes (event.keyCode)  with corresponding character
    // Find them here: http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
    var buttons = {
        65:"←",
        87:"↑",
        68:"→",
        83:"↓",
        16:"●",
        81:"0"
    };

    // All generated messages are prefixed with this
    var messagePrefix = "➜ ";

    // Maximal interval beteween two keypresses (ms)
    var keypressLimit = 1000;

    // Minimal interval beteween two messages sent (ms)
    var messageLimit = 300;

    // All macros support random messages - for example, you can replace
    // "↑↓↑": "Yes"
    // with
    // "↑↓↑": ["Yes", "Yeah", "Yea", "Whatever..."]

    // Macros sent to your team only (the T-key chat)
    var teamMacros = {
        // Yes/No
        "←→←": "No",
        "↑↓↑": "Yes",

        // Indicative sentences
        "↓●↑": "I'll attack!",
        "↓●↓": "I'll defend!",
        "↓●←": "I'll trick the enemies!",
        "↓●→": "I'll control the button!",
        "↑●↑": "Enemy's attacking!",
        "↑●↓": "Enemy's defending!",
        "↑●←": "Enemy's trying to trick us!",
        "↑●→": "Enemy's controlling the button!",
        
        // Questions
        "●↓" : "Is our flag safe?",
        "●↑" : "Where is enemy FC?",
        "●←" : "Powerups spawning soon! Get them!",
        "●→" : "Who's controlling the button?",

        // Commands
        "↓●●" : "Enemies in base.",
        "↑●●" : "Base is clear!",
        "←●●" : "Trick the enemy!",
        "→●●" : "Control the button!",
    };

    // Prefixes for giving directions. Two arrow presses indicating the direction comes after them.
    // First macro is empty: it's triggered just by two arrow presses
    // [Direction], [direction] and [arrow] are wildcards.
    // Sent to your team only.
    var directionMacros = {
        "" : "Enemy FC on [direction]. ([arrow])",
        "↑0" : "Enemy on [direction]. ([arrow])",
        "↓0" : "I'm coming [direction]. ([arrow])",
        "←0" : "[Direction] is safe. ([arrow])",
    };

    // Macros sent to everyone (Enter-key chat)
    var globalMacros = {
        // Positive emotions
        "●●↑" : [
            "Yea!",
            "We're good!",
            "YES WE CAN",
            "Dream team.",
            "Well played."
        ],

        // Angry emotions
        "●●↓" : [
            "Shazbot!",
            "Oh noez!",
            "I've let you win this time.",
            "C'mon team!",
            "This made me angry."
        ],

        // Bad jokes
        "●●←" : [
            "ALL GLORY TO THE HYPNOTOAD",
            "So game. Much flag. Many ball. Amaze.",
            "I have a UDP joke for you, but I'm afraid you won't get it.",
            "I'm a linguist. I love ambiguity more than most people.",
            "What's green and eats nuts? Syphilis.", // by /u/EstherHarshom
            "A blind man walks into a bar. And a table. And a chair.", // by /u/VinciFox
            "Life without women would be a pain in the ass.", // by /u/-Minnow-
            "Where did Sally go during the bombing? Everywhere.", // by /u/My_Name_Is_Not_Chris
        ],

        // Use often. Very often.
        "●●→" : "Neomacro! TagPro macro system. http://tiny.cc/neomacro",
    };

    // Aliases for some combinations. Alias comes first, real code second.
    // You can setup more aliases for a macro.
    // If you setup the same alias as the macro itself (for example, "←←":"←←"), the universe will explode
    var aliases = {
        "→←→":"←→←", // No
        "↓↑↓":"↑↓↑", // Yes
        
        "●●●":"0" // Backwards compatibility
    };

    /************************
    *                       *
    * END OF CONFIG SECTION *
    *                       *
    ************************/

    // Why would you change this?
    var directions = {
        "↓←": ["lower left", "↙"],
        "←←": ["left", "←"],
        "↑←": ["upper left", "↖"],
        "↑↑": ["top", "↑"],
        "↑→": ["upper right", "↗"],
        "→→": ["right", "→"],
        "↓→": ["lower right", "↘"],
        "↓↓": ["bottom", "↓"],
        "0":  ["middle", "●"]
    };

    directions["←↓"] = directions["↓←"];
    directions["←↑"] = directions["↑←"];
    directions["→↓"] = directions["↓→"];
    directions["→↑"] = directions["↑→"];

    // Because the game's keypress handlers are more prioritized, they're circumvented using a dummy input
    var handlerbtn = document.getElementById("macrohandlerbutton");
    handlerbtn.focus();
    handlerbtn.addEventListener('keydown', keydownHandler, false);
    handlerbtn.addEventListener('keyup', keyupHandler, false);
    

    document.addEventListener('keydown', documentKeydown, false);
    function documentKeydown(event)
    {
        if(!tagpro.disableControls)
        {
            handlerbtn.focus(); // The handler button should be always fucused

            // Disables backspace and all ctrl interactions -- prevents leaving page by accident
            if((event.keyCode==8 || event.ctrlKey) && !tagpro.disableControls)
            {
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
        }
    }

    // Relasing arrow key tricks TagPro to think that you relased WASD-key too, even if you didn't
    // This code prevents that from happening
    function keyupHandler(event)
    {
        if(event.keyCode in buttons && !tagpro.disableControls)
        {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    // Main macro keypresses handler
    var lastKey = 0;
    var currentMacro = "";
    function keydownHandler(event)
    {
        if(!(event.keyCode in buttons) || tagpro.disableControls)
            return;

        event.preventDefault();
        event.stopPropagation();

        var now = new Date();
        if((now - lastKey) > keypressLimit)
        {
            currentMacro = "";
        }
        lastKey = now;

        currentMacro += buttons[event.keyCode];

        var message = getMacro(currentMacro);
        if(message)
        {
            chat(message);
            currentMacro = "";
        }
    }

    // Utility function to get corresponding message for macro code
    function getMacro(x)
    {
        function capitalize(s)
        {
            return s[0].toUpperCase() + s.slice(1);
        }

        function isDirectionMacro(s)
        {
            return s.substring(0,s.length-2) in directionMacros && s.substring(s.length-2, s.length) in directions;
        }

        function getDirectionMacro(s)
        {
            var direction = directions[s.substring(s.length-2, s.length)];
            return select(directionMacros[s.substring(0,s.length-2)])
                .replace(/\[Direction\]/g, capitalize(direction[0]))
                .replace(/\[direction\]/g, direction[0])
                .replace(/\[arrow\]/g, direction[1]);
        }

        if(isDirectionMacro(x))
            return {text:getDirectionMacro(x), global:0};

        // When array is supplied, return random message - ideal to add variety to your messages
        function select(x)
        {
            if(typeof x == "object")
                return x[Math.floor(Math.random()*x.length)];
            return x;
        }

        if(x in teamMacros)
            return {text:select(teamMacros[x]), global:0};

        if(x in globalMacros)
            return {text:select(globalMacros[x]), global:1};
        
        if(x in aliases)
            return getMacro(aliases[x]);
        
        return false;
    }

    // This functions does what expected - sends a chat message
    var lastMessage = 0;
    function chat(chatMessage)
    {
        var now = new Date();
        var timeDiff = now - lastMessage;
        if (timeDiff > messageLimit)
        {
            tagpro.socket.emit("chat",
            {
                message: messagePrefix + chatMessage.text,
                toAll: chatMessage.global
            });
            lastMessage = new Date();
        }
        else if (timeDiff >= 0)
        {
            setTimeout(chat, messageLimit - timeDiff, chatMessage);
        }
    }
}

// This dummy input will handle macro keypresses
var btn = document.createElement("input");
btn.style.opacity = 0;
btn.style.position = "absolute";
btn.style.top = "-100px";
btn.style.left = "-100px";
btn.id = "macrohandlerbutton";
document.body.appendChild(btn);

// Create a script node holding this source code
var script = document.createElement('script');
script.setAttribute("type", "application/javascript");
script.textContent = '(' + Script + ')();';
document.body.appendChild(script);