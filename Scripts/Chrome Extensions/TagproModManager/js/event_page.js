// Generated by CoffeeScript 1.6.3
(function() {
  chrome.storage.local.get(["sid", "files"], function(vals) {
    if (typeof vals.sid !== "string") {
      chrome.storage.local.set({
        sid: "vanilla"
      }, function() {
        return console.log("Saved default sid");
      });
    }
    if (typeof vals.files !== "object") {
      return chrome.storage.local.set({
        files: {}
      }, function() {
        return console.log("Saved default files");
      });
    }
  });

  chrome.tabs.onUpdated.addListener(function(tabID, delta, tab) {
    var parser;
    parser = document.createElement("a");
    parser.href = tab.url;
    console.log("ph", parser.hostname);
    if (/^tagpro[a-z\-]*\.koalabeast\.com$/i.test(parser.hostname) || /^[a-z]*.jukejuice.com$/i.test(parser.hostname)) {
      console.log("MATCH");
      return chrome.pageAction.show(tabID);
    }
  });

}).call(this);