// ==UserScript==
// @name          TagPro Chat Macros Userscript UPDATED
// @namespace     http://www.reddit.com/user/contact_lens_linux/
// @description   Help your team with quick chat macros.
// @include		    http://tagpro-*.koalabeast.com:*
// @include		    http://tangent.jukejuice.com:*
// @include		    http://*.newcompte.fr:*
// @license       GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author        steppin, Watball, Some Ball -1
// @version       0.4
// ==/UserScript==

(function() {
    /********************
    **EDIT THESE VALUES**
    ********************/
    //all macros by defult will be sent to your team
    //if you want your macro sent to all chat, to group chat, or to not actually send (just fill in the text), then follow these instructions
    
    //Step 1. Scroll down and find the lines which have all your macros
    //Step 2. Choose which ones you want to be sent to everyone
    //Step 3. Copy down the number to the left of every macro you went sent to the regular chat everyone sees
    //Step 4. Add the numbers between the square brackets below with commas between each number (if you only have 1 number, then no commas, if you don't want any, then leave it alone
    		//So the line should like this where the numbers are taken from your macros below (don't worry about spaces, you can add them or not it doesn't matter)
    		//			var allChatMacros = [1, 2, 3, 4];
    var allChatMacros = [49, 50, 51, 52, 53, 54, 55];
    
    //Step 5. Repeat Steps 2-4 but this time choose the number that corresponds to the macros you want to be sent to group chat, then fill them in between the squarey brackets below
    		//Again, it should like similar to this but with your own numbers in there, if you only have one number, then do not put any commas, if no numbers, then leave the brackets empty
    		//			var groupChatMacros = [28, 27, 12];
    var groupChatMacros = [];
    
    //Step 6. Repeat Steps 2-4 but this time you're picking which macros you want to not be sent
    		//These macros will instead autofill in your chat bar as if you've typed them, but they will not actually be sent
    		//A potential use might be when new powerups will spawn
    		//Your macro would be "Powerups will be respawning at: ", allowing you to then manually enter the time before hitting enter
    		//Make sure to an extra space at the end so anything you type after isn't attached to your last word
    		//By default, after you add additional text and hit enter, the chat will go to team chat
    var notSentTeamChatMacros = [];
    
    //All macros not included above will be sent to team chat by default
    
    /************
    **END EDITS**
    ************/
    
    function contentEval(source) {
        // Check for function input.
        if ('function' == typeof source) {
            // Execute this function with no arguments, by adding parentheses.
            // One set around the function, required for valid syntax, and a
            // second empty set calls the surrounded function.
            source = '(' + source + ')();';
        }
        
        // Create a script node holding this  source code.
        var script = document.createElement('script');
        script.setAttribute("type", "application/javascript");
        script.textContent = source;
        
        // Insert the script node into the page, so it will run, and immediately
        // remove it to clean up.
        document.body.appendChild(script);
        document.body.removeChild(script);
    }
    
    function actualScript(allChatMacros,groupChatMacros,notSentTeamChatMacros) {
        var macros = {};
        macros[81] = "Their FC is ↖ TOP LEFT ↖"; // Q
        macros[87] = "Their FC is ↑ TOP ↑"; // W
        macros[69] = "Their FC is ↗ TOP RIGHT ↗"; // E
        macros[65] = "Their FC is ← LEFT ←"; // A
        macros[83] = "Their FC is ⊗ MIDDLE ⊗"; // S
        macros[68] = "Their FC is → RIGHT →"; // D
        macros[90] = "Their FC is ↙ BOTTOM LEFT ↙"; // Z
        macros[88] = "Their FC is ↓ BOTTOM ↓"; // X
        macros[67] = "Their FC is ↘ BOTTOM RIGHT ↘"; // C
        macros[49] = "¯\\_(ツ)_/¯"; // 1
        macros[50] = "Awesome Snipe! ༼ つ ◕_◕ ༽つ︻デ┳═ー"; // 2
        macros[51] = "(☞ﾟヮﾟ)☞ Great Job! ☜(ﾟヮﾟ☜) "; // 3
        macros[52] = "✿◕ ‿ ◕✿ GG everybody! ✿◕ ‿ ◕✿"; // 4
        macros[53] = "( ͡° ͜ʖ ͡°)"; // 5
        macros[54] = "Looks like you weren't ready for our SUPA HOT FIYA"; // 6
        macros[55] = "It was sidewalk's fault"; // 7
        macros[70] = "(¯`·._.· Base is Clear! ·._.·´¯)"; // F
        macros[82] = "(¯`·._.· Base is NOT Clear! ·._.·´¯)"; // R
        macros[86] = "Watch out for PUPS"; // V
        
        
        // Game bindings overriding adapted from JohnnyPopcorn's NeoMacro https://gist.github.com/JohnnyPopcorn/8150909
        var handlerbtn = $('#macrohandlerbutton');
        handlerbtn.keydown(keydownHandler)
        		  .keyup(keyupHandler);
        handlerbtn.focus();
        
        $(document).keydown(documentKeydown);
        function documentKeydown(event) {
            if (!tagpro.disableControls) {
                handlerbtn.focus(); // The handler button should be always focused
            }
        }
        
        // Prevent TagPro binds from firing on the same stuff as we have bound
        function keyupHandler(event) {
            if (event.keyCode in macros && !tagpro.disableControls) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
        
        var lastMessage = 0;
        function chat(chatMessage,code) {
            var limit = 500 + 10;
            var now = new Date();
            var timeDiff = now - lastMessage;
            if (timeDiff > limit) {
                if(allChatMacros.indexOf(code)>-1) //macro is in all chat array
                {
                    tagpro.socket.emit("chat", {
                        message: chatMessage,
                        toAll: 1
                    });
                }
                else if(groupChatMacros.indexOf(code)>-1 && tagpro.group.socket) //macro is in group chat array
                {
                    tagpro.group.socket.emit("chat", chatMessage);
                }
                else if(notSentTeamChatMacros.indexOf(code)>-1) //macro is in don't hit enter array
                {
                    var press = $.Event('keydown');
                    press.which = 84;
                    press.keyCode = 84;
                    handlerbtn.trigger(press);
                    $('#chat').val(chatMessage);
                }
                else
                {
                    tagpro.socket.emit("chat", {
                        message: chatMessage,
                        toAll: 0
                    });
                }
                lastMessage = new Date();
            } else if (timeDiff >= 0) {
                setTimeout(chat, limit - timeDiff, chatMessage)
            }
                }
        
        function keydownHandler(event) {
            var code = event.keyCode || event.which;
            if (code in macros && !tagpro.disableControls) {
                chat(macros[code],code);
                event.preventDefault();
                event.stopPropagation();
                //console.log(macros[code]);
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
    
    contentEval(actualScript(allChatMacros,groupChatMacros,notSentTeamChatMacros));
})();