The public whitelist for Tagpro Scripts.

To install a script, browse to the Scripts folder and click the script that interests you. Copy its text into a new script in whatever userscript extension you use (Greasemonkey, Tampermonkey, etc).

To request a script be added to the whitelist, fill out [this form](https://docs.google.com/forms/d/1bepsR7F0Nh5p0XEc2yakD0fqsiY9hUPx63CyZBaLN8w/viewform).


###What is not allowed?

Certain code snippets or userscript features will cause a script to be denied. 

* Autoupdating code
  
  >// @updateURL     https://gist.github.com/ballparts/eeffb535bb370fadf7ea/raw/TagPro_DragNDropTextureReplacer.user.js
* Auto-Macros
* Eval() usage (in most cases)
* Improper information given to the player. Such as powerup timers to path predictions. Anything giving information on events happening off screen is in general not acceptable.
* Anything extremely obsene or negative
  

####Spectator Scripts

Some scripts that give too much information to a player will be approved if the script is made spectator only. Generally these are scripts that provide neat interfaces for streaming. To make a script spectator only, insert the following code as the first code to be executed:

> if (!tagpro.spectator) return;


