var urlextension = chrome.extension.getURL("");

function myScript(url)
{
	tagpro.globalvolume = 1;
	function playSound (s, v)
	{
		if (tagpro.sound)
		{
			var src = url + s + ".mp3";
			var snd = new Audio(src);
			snd.volume = (v * tagpro.globalvolume) || 1;
			snd.play();	
		}
	}
	tagpro.ready( function () {tagpro.playSound = playSound;});
	function changeVolume (value, s, v)
	{
		tagpro.globalvolume = Math.pow(10, value/20);
//		console.log("value: " + value + " s: " + s + " v: " + v + " volume: " + tagpro.globalvolume);
		playSound(s, v);
	}
	var volumerange = document.getElementById("volume");
	volumerange.addEventListener("change", function () {changeVolume(volumerange.value, "click", 0.5); });
	volumerange.addEventListener("mouseup", function () {changeVolume(volumerange.value, "pop", 1); });
}

function refreshVolume()
{
	tagpro.globalvolume = Math.pow(10, document.getElementById("volume").value/20);
}

	var volumerange = document.createElement('input');
	volumerange.value = 0;
	chrome.storage.local.get("volume", function (result)
		{
			if (result.volume != undefined)
			{
				volumerange.value = result.volume;
				var source = "(" + refreshVolume + ")()";
				var scriptRV = document.createElement('script');
				scriptRV.setAttribute("type", "application/javascript");
				scriptRV.textContent = source;
				document.body.appendChild(scriptRV);
			}
		});
	//alert("2");
	volumerange.type = "range";
	volumerange.id = "volume";
	volumerange.min = -30;
	volumerange.max = 0;
	volumerange.style.width ="64px";
	//alert("3");
	volumerange.addEventListener("change", function () {chrome.storage.local.set({"volume": volumerange.value});});
	//alert("4");
	document.getElementById("sound").appendChild(volumerange);
//	document.getElementById("sound").innerHTML += " lol";

var source = "(" + myScript + ")(\"" + urlextension + "\")";
var thescript = document.createElement('script');
thescript.setAttribute("type", "application/javascript");
thescript.textContent = source;
//alert(thescript.textContent);
/*var bodyelmnt = document.getElementsByTagName('body')[0];
alert(typeof(bodyelmnt));
alert(typeof(bodyelmnt.appendChild));
alert(bodyelmnt.appendChild);
alert(source);
alert(typeof(thescript));
alert(thescript);*/
document.body.appendChild(thescript);

