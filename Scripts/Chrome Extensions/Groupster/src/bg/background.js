
chrome.storage.local.get('servers', function(val) {
		if(!val.servers) {
			chrome.storage.local.set({'servers': ['Radius', 'Segment', 'Pi', 'Origin', 'Sphere', 'Centra', 'Arc', 'Orbit', 'Chord', 'Diameter', 'Maptest2', 'Tangent']
		    }, function() {
			  console.log('Initialized.');
			});
		}
	})

chrome.storage.local.get('groups', function(val) {
		if(!val.groups) {
			chrome.storage.local.set({'groups': true
		    }, function() {
			  console.log('Initialized.');
			});
		}
	})

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if(message.method == 'preferences') {
		chrome.storage.local.set({'servers': message.args.servers
		    }, function() {
		  console.log('Saved.');
		});
	}
	if(message.method == 'groups') {
		chrome.storage.local.set({'groups': message.args.groups
		    }, function() {
		  console.log('Saved.');
		});
	}
});

function getServers() {
	chrome.storage.local.get('servers', function(val) {
		chrome.extension.sendRequest({method: val}, function(response) {
        	
      	});
	})
}

function joinerOrGroup() {
	chrome.storage.local.get('groups', function(val) {
		chrome.extension.sendRequest({method: val}, function(response) {
        	
      	});
	})
}

/*** just for dev purposes really ***/
chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
      var storageChange = changes[key];
      console.log('Storage key "%s" in namespace "%s" changed. ' +
                  'Old value was "%s", new value is "%s".',
                  key,
                  namespace,
                  storageChange.oldValue,
                  storageChange.newValue);
    }
});