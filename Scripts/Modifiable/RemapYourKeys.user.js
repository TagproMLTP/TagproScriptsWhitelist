// ==UserScript==
// @name          Remap Your Keys!
// @namespace     github.com/karlding
// @description   Allows you to map your own custom keys in Tagpro!
// @include       http://*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://maptest.newcompte.fr:*
// @license       GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author        Karl Ding
// @copyright     2014+, 0K
// @version       0.1
// ==/UserScript==

tagpro.ready(function(){
    // arrow keys (default controls)
    var leftarrow = 37;
    var uparrow = 38;
    var rightarrow = 39;
    var downarrow = 40;
    
    // navigation keys
    var pgdown = 33;
    var pgup = 34;
    var end = 35;
    var home = 36;
    var ins = 45;
    var del = 46;
    
    // a-z keys
    var a = 65;
    var b = 66;
    var c = 67;
    var d = 68; 
    var e = 69; 
    var f = 70;
    var g = 71;
    var h = 72;
    var i = 73;
    var j = 74;
    var k = 75;
    var l = 76;
    var m = 77;
    var n = 78;
    var o = 79;
    var p = 80;
    var q = 81;
    var r = 81;
    var s = 83;
    var t = 84;
    var u = 85;
    var v = 86;
    var w = 87;
    var x = 88;
    var y = 89;
    var z = 90;
    
    // alphanumeric
    var backspace = 8;
    var tab = 9;
    var enter = 13;
    var shift = 16;
    var capslock = 20;
    var space = 32;
    var semicolon = 186;
    var equals = 187;
    var comma = 188;
    var dash = 189;
    var period = 190;
    var forwardslash = 191;
    var graveaccent = 192;
    var openbracket = 219;
    var backslash = 220;
    var closebracket = 221;
    var singlequote = 222;
    
    // numpad
    var num0 = 96;
    var num1 = 97;
    var num2 = 98;
    var num3 = 99;
    var num4 = 100;
    var num5 = 101;
    var num6 = 102;
    var num7 = 103;
    var num8 = 104;
    var num9 = 105;
    var star = 106;
    var add = 107;
    var subtract = 109;
    var decimal = 110;
    var divide = 111;
    var numlock = 144;
    
    // function keys
    var f1 = 112;
    var f2 = 113;
    var f3 = 114;
    var f4 = 115;
    var f6 = 117;
    var f7 = 118;
    var f8 = 119;
    var f9 = 120;
    var f10 = 121;
    var f11 = 122;
    var f12 = 123;
    
    // control keys
    var ctrl = 17;
    var alt = 18;
    var pausebreak = 19;
    var esc = 27;
    var leftwindows = 91;
    var rightwindows = 92;
    var select = 93;
    var scrolllock = 145;
    
    /*
     * Movement Configuration:
     * Change the following 4 variables below to whatever keys you'd like for movement.
     *   Note: This ADDS these keys in addition to the standard wasd/arrow keys
     *    * override_keys (bool): whether to override defaults, or simply extend (true, false)
     *    * direction_up_key (int): the key you'd like to use to move UP
     *    * direction_down_key (int): the key you'd like to use to move DOWN
     *    * direction_left_key (int): the key you'd like to use to move LEFT
     *    * direction_right_key (int): the key you'd like to use to move RIGHT
     * Example: The current setup OVERRIDES wasd/arrow keys, and uses ijkl
     */
    var override_default_keys = true;
    
    var direction_up_key = i;
    var direction_left_key = j;
    var direction_down_key = k;
    var direction_right_key = l;
    
    /*
     * Misc:
     * You can ignore this section's configuration if you only want to remap movement
     *    * chat_cancel_key: hides the chat box
     *    * chat_to_all_key: set chat recipients to all
     *    * chat_to_team_key: set chat recipients to team
     *    * chat_to_group_key: set chat recipients to group
     *    * chat_send_key: send the message
     *    * show_options_key: show the team stats
     */
    var chat_cancel_key = esc;
    var chat_to_all_key = enter;
    var chat_to_team_key = t;
    var chat_to_group_key = g;
    var chat_send_key = enter;
    var show_options_key = esc;
    
    
    /*
     * ===========================================================
     * DO NOT MODIFY BELOW HERE UNLESS YOU KNOW WHAT YOU'RE DOING
     * MODIFY AT YOUR OWN RISK, I AM NOT TO BE HELD ACCOUNTABLE
     * HALT! HERE BE DRAGONS
     * ===========================================================
     */
    tagpro.keys.cancelChat = [chat_cancel_key];
    tagpro.keys.chatToAll = [chat_to_all_key];
    tagpro.keys.chatToTeam = [222, chat_to_team_key];
    tagpro.keys.chatToGroup = [186, chat_to_group_key, 103];
    tagpro.keys.sendChat = [chat_send_key];
    tagpro.keys.showOptions = [show_options_key];
    
    if (override_default_keys)
    {
        tagpro.keys.up = [direction_up_key];
        tagpro.keys.left = [direction_left_key];
        tagpro.keys.down = [direction_down_key];
        tagpro.keys.right = [direction_right_key];
    }
    else {
        tagpro.keys.up.push(direction_up_key);
        tagpro.keys.left.push(direction_left_key);
        tagpro.keys.down.push(direction_down_key);
        tagpro.keys.right.push(direction_right_key);
    }    
});