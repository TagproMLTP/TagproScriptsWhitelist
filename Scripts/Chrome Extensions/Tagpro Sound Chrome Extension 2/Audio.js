var urlextension = chrome.extension.getURL("");

function myScript(url)
{
	tagpro.globalvolume = 1;
	var logging = true;
	function networkStateToStr(a)
	{
		switch(a)
		{
			case 0:
				return "NETWORK_EMPTY";
			break;
			case 1:
				return "NETWORK_IDLE";
			break;
			case 2:
				return "NETWORK_LOADING";
			break;
			case 3:
				return "NETWORK_NO_SOURCE";
			break;
			default:
			return "lol";
		
		}
	}

	function readyStateToStr(a)
	{
		switch(a)
		{
			case 0:
				return "HAVE_NOTHING";
			break;
			case 1:
				return "HAVE_METADATA";
			break;
			case 2:
				return "HAVE_CURRENT_DATA";
			break;
			case 3:
				return "HAVE_FUTURE_DATA";
			break;
			case 4:
				return "HAVE_ENOUGH_DATA";
			break;
			default:
			return "lol";
		
		}
	}
	function errorCodeToStr(a)
	{
		switch(a)
		{
			case 1:
				return "MEDIA_ERR_ABORTED";
			break;
			case 2:
				return "MEDIA_ERR_NETWORK";
			break;
			case 3:
				return "MEDIA_ERR_DECODE";
			break;
			case 4:
				return "MEDIA_ERR_SRC_NOT_SUPPORTED";
			break;
			default:
			return "lol";
		
		}
	}

	function log(event, elmnt, logplus)
	{
/*		if (event == "play")
		{
			var str;
			str = elmnt.id+ ": \n";
			if (elmnt.error)
			str+= "error : "+ elmnt.error.code +"\n";
			str+= "muted : "+ elmnt.muted +"\n";
			str+= "paused : "+ elmnt.paused +"\n";
			str+= "currentTime : "+ elmnt.currentTime +"\n";
			str+= "ended : "+ elmnt.ended +"\n";
			str+= "duration : "+ elmnt.duration +"\n";
			str+= "readyState : "+ readyStateToStr(elmnt.readyState) +"\n";
			str+= "currentSrc : "+ elmnt.currentSrc +"\n";
			var j = 0;
			for(j=0;j<elmnt.played.length;j++)
			{
				str+= j + "th Start: " + elmnt.played.start(j) + " End: " + elmnt.played.end(j) + "\n";
			}
			console.log (str);
		}*/
//		console.log ("%s, %O",event + " happened to " + elmnt.id + " at fps " + tagpro.fps + " and wADBC" + songs[i].webkitAudioDecodedByteCount, elmnt);
		if (event == "error") console.log (event + " happened to " + elmnt.src.replace(url, "") + " with networkState " + networkStateToStr(elmnt.networkState) + " and readyState " + readyStateToStr(elmnt.readyState) + " at currenttime " + elmnt.currentTime);
		if (elmnt.error) console.log("ERROR: " + errorCodeToStr(elmnt.error.code));
		if (logplus)
		{
			var notended = true;
			function on_ended() 
			{
				notended = false;
				elmnt.removeEventListener("durationchange",on_ended);
//				elmnt.removeEventListener("ended",on_ended);

			}

			elmnt.addEventListener("durationchange", on_ended);
//			elmnt.addEventListener("ended", on_ended);
			setTimeout(function(){
//				console.log("timeout for %s is happening ; notended = %s ", elmnt.src.replace(url, ""), notended);
				if(notended)
				{
					console.log("IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII");
					console.log ("failed loading happened to " + elmnt.src.replace(url, "") + " with networkState " + networkStateToStr(elmnt.networkState) + " and readyState " + readyStateToStr(elmnt.readyState) + " at currenttime " + elmnt.currentTime);
					if (elmnt.error) console.log("ERROR: " + errorCodeToStr(elmnt.error.code));
					else console.log("no error");
					/*var newsrc = elmnt.currentSrc;
					newsrc = newsrc.slice(0, -3);
					newsrc += "m4a";
					console.log("asking %O to reload " + newsrc, elmnt);
					elmnt.load(newsrc);
					console.log("asked %O to reload " + newsrc, elmnt);*/
				}
			
			}, 1000);
//			}, elmnt.duration*1000 + 10000);
		}
	}

	function logpause ()
	{
		log("pause", this, false);
	}
	function logplay ()
	{
		log("play", this, false);
	}
	function logplaying ()
	{
		log("playing", this, false);
	}
	function logplaying2 ()
	{
		log("playing", this, false);
	}
	function logwaiting ()
	{
		log("waiting", this, false);
	}
	function logended ()
	{
		log("ended", this, false);
	}
	function logtimeupdate ()
	{
		log("timeupdate", this, false);
	}
	function logloadstart()
	{
		log("loadstart", this, true);
	}
	function logprogress()
	{
		log("progress", this, false);
	}
	function logcanplay()
	{
		log("canplay", this, false);
	}
	function logcanplaythrough()
	{
		log("canplaythrough", this, false);
	}
	function logvolumechange ()
	{
		log("volumechange", this, false);
	}
	function logdurationchange ()
	{
		log("durationchange", this, false);
	}
	function logloadedmetadata ()
	{
		log("loadedmetadata", this, false);
	}
	function logloadeddata ()
	{
		log("loadeddata", this, false);
	}
	function logerror ()
	{
		console.log ("ERRROOOORRRRR");
		log("error", this, false);
	}

//	console.log("Je suis dans myScript(\""+url+"\")");
	function playSound (s, v)
	{
		if (tagpro.sound)
		{
			var src = url + s + ".mp3";
			var snd = new Audio(src);
			snd.volume = (v * tagpro.globalvolume) || 1;
			snd.play();	
			if (logging)
			{
//				console.log("the sound " + snd.src + " will be played at volume " + snd.volume);
/*				snd.addEventListener("pause", logpause);
				snd.addEventListener("play", logplay);
				snd.addEventListener("ended", logended);
				snd.addEventListener("timeupdate", logtimeupdate);
				snd.addEventListener("waiting", logwaiting);
				snd.addEventListener("playing", logplaying);*/
				snd.addEventListener("loadstart", logloadstart);
				snd.addEventListener("error", logerror);
/*				snd.addEventListener("durationchange", logdurationchange);
				snd.addEventListener("loadedmetadata", logloadedmetadata);
				snd.addEventListener("loadeddata", logloadeddata);
				snd.addEventListener("progress", logprogress);
				snd.addEventListener("canplay", logcanplay);
				snd.addEventListener("canplaythrough", logcanplaythrough);
				snd.addEventListener("volumechange", logvolumechange);*/
			}
		}
	}
	tagpro.playSound = playSound;
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

