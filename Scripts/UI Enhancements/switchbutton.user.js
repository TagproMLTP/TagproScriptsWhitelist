// ==UserScript==
// @name          Switch button - All servers
// @namespace     http://www.reddit.com/user/NewCompte
// @description   Adds switch button to games
// @include       http://tagpro-*.koalabeast.com*
// @license       WTFPL
// @author        NewCompte
// @version       1.4
// ==/UserScript==

function switchTeams ()
{
    tagpro.socket.emit("switch");
}

function mySwitchTeamButtonScript ()
{
    $("#myOwnSwitchButton").click(switchTeams);
}


if (document.getElementById("switchButton") != null)
{
    var button = document.createElement('button');
    button.value = "Switch Teams";
    button.innerHTML = "Switch Teams";
    button.id = "myOwnSwitchButton";
    document.getElementById("sound").appendChild(button);
    var source = switchTeams + "("+ mySwitchTeamButtonScript + ")()";
    var script = document.createElement('script');
    script.setAttribute("type", "application/javascript");
    script.textContent = source;

    document.body.appendChild(script);
}