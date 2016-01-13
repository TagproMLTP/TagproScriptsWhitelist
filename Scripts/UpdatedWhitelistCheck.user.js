// ==UserScript==
// @name         TagPro Whitelisted Script Detector
// @match        http://*.koalabeast.com/*
// @match        http://*.jukejuice.com/*
// @match        http://*.newcompte.fr/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    var scriptVersion = '_v1_4';
    var whitelistScriptKey = 'whitelistedScripts' + scriptVersion;
    var lastUpdateKey = 'whitelistedScriptsLastUpdate' + scriptVersion;
    var scriptSeparator = '<|script|separator|>' + scriptVersion;
    var whitelistedScripts = GM_getValue(whitelistScriptKey);
    var lastUpdated = GM_getValue(lastUpdateKey);
    var runningScripts = [];
    var runningScriptsNames = [];

    unsafeWindow.Function = (function(Function) {
        function _Function() {
            var userscript = arguments[arguments.length - 1];
            var userscriptMatch = /\("\w+?:.+?'(.*?)'[^]*?(==UserScript==[^]*?)[\n\r]\}\)\}[\n\r]{0,3}$/;
            if (typeof userscript === 'string' && userscriptMatch.test(userscript)) {
                var userscriptMatches = userscript.match(userscriptMatch);
                runningScriptsNames.push(userscriptMatches[1]);
                runningScripts.push(formatUserscript(userscriptMatches[2]));
            }
            var args = Array.prototype.slice.call(arguments);
            args.unshift(Function);
            return new (Function.prototype.bind.apply(Function, args))();
        }
        _Function.prototype = Function.prototype;
        return _Function;
    })(unsafeWindow.Function);

    checkForUpdate(function(needsUpdate) {
        if (needsUpdate || typeof whitelistedScripts !== 'string') {
            getWhitelistedScripts();
        } else {
            whitelistedScripts = whitelistedScripts.split(scriptSeparator);
            setTimeout(compareScripts, 2000);
        }
    });

    function checkForUpdate(fn) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://api.github.com/repos/TagproMLTP/TagproScriptsWhitelist/contents',
            onload: function(response) {
                try {
                    var responseObj = JSON.parse(response.responseText);
                    for(var i = 0; i < responseObj.length; i++) {
                        var obj = responseObj[i];
                        if (obj.path === 'Scripts') {
                            if (obj.sha !== lastUpdated) {
                                lastUpdated = obj.sha;
                                GM_setValue(lastUpdateKey, lastUpdated);
                                return fn(true);
                            }
                            return fn();
                        }
                    }
                } catch(error) {}
                onFail();
            },
            onerror: onFail
        });
        function onFail(error) {
            console.warn('TagPro Whitelisted Script Detector: There was a problem checking for updates');
            fn();
        }
    }

    function generateHash(str) {
        var hash = 0;
        var char;
        for (var i = 0; i < str.length; i++) {
            char = str.charCodeAt(i);
            hash = char + (hash << 6) + (hash << 16) - hash;
        }
        return hash;
    }

    function formatUserscript(userscript) {
        var doubleQuoteStrings = /"[^"\\\r\n]*(?:(?:\\.[^"\\\r\n]*)|(?:\\[\r\n][^"\\\r\n]*))*"/g;
        var singleQuoteStrings = /'[^'\\\r\n]*(?:(?:\\.[^'\\\r\n]*)|(?:\\[\r\n][^'\\\r\n]*))*'/g;
        userscript = userscript
            .trim()
            .replace(doubleQuoteStrings, '')
            .replace(singleQuoteStrings, '');
        return generateHash(userscript);
    }

    function compareScripts() {
        if (!runningScripts.length) {
            return console.log('TagPro Whitelisted Script Detector: No userscripts seem to be running.');
        }
        var nonWhitelistScripts = 0;
        runningScripts.forEach(function(script, i) {
            if (whitelistedScripts.indexOf(script) === -1) {
                nonWhitelistScripts++;
                var scriptName = runningScriptsNames[i];
                console.log('TagPro Whitelisted Script Detector: Your userscript "' + scriptName + '" does not seem to be in the whitelist.');
            }
        });
        if (!nonWhitelistScripts) {
            console.log('TagPro Whitelisted Script Detector: Congratulations, all your scripts pass!');
        }
    }

    function getWhitelistedScripts() {
        whitelistedScripts = [];
        var whitelistUrl = 'https://api.github.com/repos/TagproMLTP/TagproScriptsWhitelist/git/trees/' + lastUpdated + '?recursive=1';

        function getContent(url, fn) {
            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                onload: function(response) {
                    fn(response.responseText);
                }
            });
        }

        function fetchAllScripts(scriptUrls) {
            scriptUrls.forEach(function(url) {
                getContent(url, function(script) {
                    var userscriptMatch = /(==UserScript==[^]*)/;
                    if (!userscriptMatch.test(script)) {
                        whitelistedScripts.push(0);
                        return;
                    }
                    var scriptMatch = script.match(userscriptMatch)[1];
                    whitelistedScripts.push(formatUserscript(scriptMatch));
                    if (whitelistedScripts.length === scriptUrls.length) {
                        GM_setValue(whitelistScriptKey, whitelistedScripts.join(scriptSeparator));
                        compareScripts();
                    }
                });
            });
        }

        getContent(whitelistUrl, function(response) {
            var responseObj = JSON.parse(response);
            var scriptUrls = responseObj.tree.filter(function(item) {
                return item.type === 'blob';
            }).map(function(script) {
                return 'https://github.com/TagproMLTP/TagproScriptsWhitelist/raw/master/Scripts/' + script.path;
            });
            fetchAllScripts(scriptUrls);
        });
    }
})();
