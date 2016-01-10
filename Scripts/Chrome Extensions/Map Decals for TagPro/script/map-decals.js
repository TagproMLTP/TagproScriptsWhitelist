// ==UserScript==
// @name       		Map Decals for TagPro
// @namespace       http://tagpro-diameter.koalabeast.com/profile/5364c5f3da8958803739cca7
// @version    		1.0.0
// @description     Adds a bunch of decals (image overlays) on to maps in TagPro. Decal sets can be imported and configured from the server home page.
// @include			http://tagpro-*.koalabeast.com*
// @include			http://*.jukejuice.com*
// @include			http://*.newcompte.fr*
// @author  		Browncoat
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_listValues
// @grant           GM_deleteValue
// ==/UserScript==

/**
 * @namespace include
 */
(function () {
    var logging = true;
    function log(message) {
        if (logging) {
            console.log("[DECALS] " + message);
        }
    }
    
    function logObject(description, object) {
        if (logging) {
            log(description);
            console.log(object);
        }
    }
    var Page = {
        GAME: "GAME",
        SERVER_HOME: "SERVER_HOME",
        OTHER: "OTHER"
    };
    
    var currentPage = Page.OTHER;
    
    var url = window.location.href;
    if (url.indexOf(":8") > 0) {
        currentPage = Page.GAME;
    } else {
        //// remove last slash
        //if (url.lastIndexOf("/") == url.length - 1) {
        //    url = url.substring(0, url.length - 1);
        //}
        //var lastBit = url.substring(url.lastIndexOf(".") + 1, url.length);
        //var prodServerHomePage = url.indexOf("tagpro-") > 0 && lastBit == "com";
        //var jjServerHomePage = url.indexOf("jukejuice") > 0 && lastBit == "com";
        //var ncServerHomePage = url.indexOf("newcompte") > 0 && lastBit == "fr";
        //if (prodServerHomePage || jjServerHomePage || ncServerHomePage) {
        //    currentPage = Page.SERVER_HOME;
        //}
    
        var mapsLink = $('a[href="/maps"]').first();
        if (mapsLink) {
            currentPage = Page.SERVER_HOME;
        }
    }

    if (currentPage == Page.SERVER_HOME || currentPage == Page.GAME) {
        var link = document.createElement("link");
        link.href = "http://fonts.googleapis.com/css?family=Roboto:400,700,900";
        link.rel = "stylesheet";
        link.type = "text/css";
        (document.head || document.documentElement).appendChild(link);
        var id = 0;
        var defaultDecalSets = [
            {
                "decalSetName": "Pokémon Theme",
                "decalSetAuthor": "browncoat",
                "isDefault": true,
                "previewURL": "resources/sets/browncoat/pokemon/pokemon-screenshot.png",
                "textures": {
                    "tiles": "resources/sets/browncoat/pokemon/textures/tiles.png",
                    "speedpad": "resources/sets/browncoat/pokemon/textures/speedpad.png",
                    "speedpadred": "resources/sets/browncoat/pokemon/textures/speedpadred.png",
                    "speedpadblue": "resources/sets/browncoat/pokemon/textures/speedpadblue.png",
                    "portal": "resources/sets/browncoat/pokemon/textures/portal.png",
                    "splats": "resources/sets/browncoat/pokemon/textures/splats.png"
                },
                "maps": [
                    {
                        "name": "Ricochet",
                        "floorDecalURL": "resources/sets/browncoat/pokemon/ricochet.png"
                    }
                ]
            }
        ];
        var LocalValue = {
            DECAL_SETS: "decal_sets",
            SETTINGS: "settings"
        };
        
        var main_ = {};
        main_.defaultDecalSets = defaultDecalSets;
        
        // convert paths in defaultDecalSets into absolute URLs
        for (var i = 0; i < main_.defaultDecalSets.length; i++) {
            var decalSet = main_.defaultDecalSets[i];
            decalSet.previewURL = getAbsoluteURL(decalSet.previewURL);
        
            // Texture URLS
            if (decalSet.textures) {
                var tileTypes = ['tiles', 'speedpad', 'speedpadred', 'speedpadblue', 'portal', 'splats', 'flair'];
                for (var j = 0; j < tileTypes.length; j++) {
                    var type = tileTypes[j];
                    if (decalSet.textures[type]) {
                        decalSet.textures[type] = getAbsoluteURL(decalSet.textures[type]);
                    }
                }
            }
        
            // Map URLS
            for (j = 0; j < decalSet.maps.length; j++) {
                var map = decalSet.maps[j];
                map.previewURL = getAbsoluteURL(map.previewURL);
                map.floorDecalURL = getAbsoluteURL(map.floorDecalURL);
                map.wallDecalURL = getAbsoluteURL(map.wallDecalURL);
            }
        }
        
        function getAbsoluteURL(path) {
            if (path) {
                return chrome.extension.getURL(path);
            } else {
                return null;
            }
        }
        logObject("Converted default decal paths into absolute urls", main_.defaultDecalSets);
        
        // Load local vars
        main_.loadLocalValues = function (onLoad) {
            chrome.storage.local.get([LocalValue.SETTINGS, LocalValue.DECAL_SETS], function (values) {
                logObject("Loaded local values:", values);
        
                // Decal sets
                main_.localDecalSets = values[LocalValue.DECAL_SETS];
                if (!main_.localDecalSets) {
                    main_.localDecalSets = [];
                    setLocalValue(LocalValue.DECAL_SETS, main_.localDecalSets);
                }
                main_.allDecalSets = main_.defaultDecalSets.concat(main_.localDecalSets);
        
                // Settings
                main_.settings = values[LocalValue.SETTINGS];
                if (!main_.settings) {
                    main_.settings = {
                        enabled: true,
                        disabledSets: [],
                        disabledMaps: []
                    };
                    setLocalValue(LocalValue.SETTINGS, main_.settings);
                }
                if (main_.settings.enabled == undefined) {
                    main_.settings.enabled = true;
                }
                if (onLoad) {
                    onLoad();
                }
            });
        };
        main_.loadLocalValues();
        
        // Save local values
        main_.saveLocalValues = function (settings, localDecalSets, onSave) {
            var setObject = {};
            setObject[LocalValue.SETTINGS] = settings;
            setObject[LocalValue.DECAL_SETS] = localDecalSets;
            chrome.storage.local.set(setObject, function () {
                logObject("Saved local values:", setObject);
                main_.localDecalSets = localDecalSets;
                main_.allDecalSets = main_.defaultDecalSets.concat(main_.localDecalSets);
                main_.settings = settings;
                if (onSave) {
                    onSave();
                }
            });
        };
        
        //noinspection JSUnusedGlobalSymbols
        var settingsSample = {
            disabledSets: [
                {
                    setName: "Default",
                    setAuthor: "browncoat"
                },
                {
                    setName: "name2",
                    setAuthor: "arthur"
                }
            ],
            disabledMaps: [
                {
                    setName: "Default",
                    setAuthor: "browncoat",
                    mapName: "GeoKoala"
                }
            ]
        };
        
        main_.isEnabled = function (decalSet, workingSettings) {
            var settingsToUse = workingSettings || main_.settings;
            var disabledSets = settingsToUse.disabledSets;
            for (var i = 0; i < disabledSets.length; i++) {
                var setting = disabledSets[i];
                if (setting.setName == decalSet.decalSetName && setting.setAuthor == decalSet.decalSetAuthor) {
                    return false;
                }
            }
            return true;
        };
        
        
        main_.isMapEnabled = function (decalSet, mapName, workingSettings) {
            var settingsToUse = workingSettings || main_.settings;
            var disabledMaps = settingsToUse.disabledMaps;
            for (var i = 0; i < disabledMaps.length; i++) {
                var setting = disabledMaps[i];
                if (setting.setName == decalSet.decalSetName && setting.setAuthor == decalSet.decalSetAuthor && setting.mapName == mapName) {
                    return false;
                }
            }
            return true;
        };
        
        function setLocalValue(name, value, onSave) {
            var setObject = {};
            setObject[name] = value;
            chrome.storage.local.set(setObject, function () {
                if (onSave) {
                    onSave();
                }
            });
        }

        if (currentPage == Page.GAME) {
            // Inject a script that will have access to the tagpro object
            var script = document.createElement('script');
            script.src = chrome.extension.getURL('script/decal-renderer.js');
            var parent = (document.head || document.documentElement);
            parent.insertBefore(script, parent.firstChild);
            log("Injected renderer script (" + script.src + ")");
            
            // Wait for script to tell us it's ready
            window.addEventListener("message", function (event) {
                if (event.source != window) return;
                if (event.data.type && (event.data.type == "INJECTED_SCRIPT_READY")) {
                    ensureMainAndPost();
                }
            });
            
            function ensureMainAndPost() {
                // Make sure main vars have been loaded from local storage
                if (!main_.allDecalSets) {
                    main_.loadLocalValues(postMain);
                } else {
                    postMain();
                }
            }
            
            function postMain() {
                var mainString = JSON.stringify(main_);
                logObject("Posting 'main' message", mainString);
                window.postMessage({
                    type: "MAP_DECAL_MAIN",
                    mainString: mainString
                }, "*");
            }
        } else if (currentPage == Page.SERVER_HOME) {
            $(document).ready(function () {
                var previewMode = false;
                if (typeof previewPage !== "undefined") {
                    previewMode = previewPage;
                }
                var mapsLink = $('a[href="/maps"]').first();
                var smallLinks = mapsLink.parent();
                var decalsLink = $("<a id='decal-link' href='javascript:void(0)'>Decals</a>");
                decalsLink.css("margin-left", "10px");
                decalsLink.css("margin-right", "10px");
                decalsLink.on("click", showDecalPopup);
                smallLinks.append(decalsLink);
            
                var popup;
                var settings;
                var localDecalSets;
                var changesMade = false;
                var enabledChanges = [];
                var allDecalSets;
                var decalSetsTab;
                var decalMapsTab;
                var tableContainer;
            
                // Loading html from extension - http://stackoverflow.com/a/5643729/1446919
                var decalPopupURL = previewMode ? "../extension/resources/decal-popup.html" : chrome.extension.getURL("resources/decal-popup.html");
                $("body").append("<div id='decal-popup-container'/>");
                $("#decal-popup-container").load(decalPopupURL, function () {
                    popup = $("#decal-popup");
                    decalSetsTab = $("#decal-sets-tab");
                    decalMapsTab = $("#decal-maps-tab");
                    tableContainer = $("#table-scroll-pane");
                    $("#save-button").on("click", saveSettings);
                    $("#cancel-button").on("click", cancel);
                    $(".switch").click(toggleEnabled);
                    $(".cross").click(cancel);
                    decalSetsTab.on("click", showSetsTab);
                    decalMapsTab.on("click", showMapsTab);
                    $("#import-button").click(function () {
                        $("#file-upload").click();
                    });
            
                    var version = previewMode ? "Preview" : chrome.runtime.getManifest().version;
                    $(".sub-title").text("v" + version + " by Browncoat");
            
                    // Drag
                    var header = $(".header");
                    var dragging = false;
                    var dragStartMouseX = 0;
                    var dragStartMouseY = 0;
                    var dragStartPopupX = 0;
                    var dragStartPopupY = 0;
                    header.on("mousedown", function (event) {
                        var onDraggablePart = $(event.target).closest(".switch, .cross, .dropdown-arrow").length == 0;
                        if (onDraggablePart) {
                            dragging = true;
                            dragStartMouseX = event.pageX;
                            dragStartMouseY = event.pageY;
                            dragStartPopupX = popup.offset().left;
                            dragStartPopupY = popup.offset().top;
                            event.preventDefault();
                        }
                    });
            
                    $(document).on("mousemove", function () {
                        if (dragging) {
                            var x = (event.pageX - dragStartMouseX) + dragStartPopupX;
                            var y = (event.pageY - dragStartMouseY) + dragStartPopupY;
                            popup.offset({
                                left: x,
                                top: y
                            });
                        }
                    });
            
                    $(document).on("mouseup", function () {
                        dragging = false;
                    });
            
                    // Dropdown menu
                    var dropdown = $("<div class='decal-dropdown'></div>");
            
                    var dropdownArrow = $(".dropdown-arrow");
                    dropdownArrow.click(toggleDropdown);
            
                    $(document).click(function (event) {
                        var shouldCloseDropdown = $(event.target).closest(".dropdown-arrow, .decal-dropdown").length == 0;
                        if (shouldCloseDropdown) {
                            $(".decal-dropdown").remove();
                            dropdownArrow.removeClass("open");
                        }
                        var shouldClosePopup = $(".decal-message").length == 0
                            && $(event.target).closest("#decal-popup, .decal-message, #decal-link, .decal-dropdown").length == 0;
                        if (shouldClosePopup) {
                            cancel();
                        }
                    });
            
                    $(document).keydown(function (event) {
                        if (event.keyCode == 27) {
                            var messages = $(".decal-message");
                            var dropdown = $(".decal-dropdown");
                            if (messages.length > 0) {
                                messages.last().remove();
                            } else if (dropdown.length > 0) {
                                dropdown.remove();
                            } else {
                                cancel();
                            }
                        }
                    });
            
                    function toggleDropdown() {
                        var visible = $(".decal-dropdown").length > 0;
                        dropdownArrow.toggleClass("open", !visible);
                        if (visible) {
                            dropdown.remove();
                        } else {
                            dropdown.empty();
                            var list = $("<ul/>");
                            $("<li class='fa' id='wiki-link'>Wiki</li>")
                                .click(function () {
                                    window.open('http://www.reddit.com/r/TagPro/wiki/decals', '_blank');
                                })
                                .appendTo(list);
                            $("<li class='fa' id='reddit-link'>Discussion</li>")
                                .click(function () {
                                    window.open('http://redd.it/355m6n', '_blank');
                                })
                                .appendTo(list);
                            $("<li class='fa' id='contact-link'>Contact</li>")
                                .click(function () {
                                    window.open('http://www.reddit.com/message/compose/?to=Kabomb', '_blank');
                                })
                                .appendTo(list);
                            dropdown.append(list);
                            dropdown.css("left", dropdownArrow.offset().left);
                            dropdown.css("top", dropdownArrow.offset().top + 30);
                            $("body").append(dropdown);
                        }
                    }
            
                    // File uploader
                    var fileUpload = $("#file-upload");
                    fileUpload.change(function () {
                        var inputElement = this;
                        if (this.files.length > 0) {
                            var messages = $("<div/>");
                            var validSets = [];
                            for (var i = 0; i < this.files.length; i++) {
                                var file = this.files[i];
                                var fileId = i;
                                if (file.type == "text/plain" || file.type == "application/json") {
                                    var reader = new FileReader();
                                    reader.fileId = fileId;
                                    reader.onload = function (e) {
                                        var reader = e.target;
                                        var text = reader.result;
                                        try {
                                            var object = JSON.parse(text);
                                            onFileParsed(reader.fileId, object);
                                        } catch (error) {
                                            onFileParsed(reader.fileId, null, "Something went wrong parsing the JSON: " + error.message);
                                        }
                                    };
                                    reader.readAsText(file);
                                } else {
                                    onFileParsed(fileId, null, "Invalid file type.");
                                }
                            }
            
                            function onFileParsed(fileId, object, errorMessage) {
                                var message;
                                var success;
                                if (errorMessage) {
                                    success = false;
                                    message = errorMessage;
                                } else {
                                    var validation = validateDecalSet(object);
                                    success = validation.success;
                                    message = validation.message;
                                    if (validation.success == true) {
                                        validSets.push(object);
                                    }
                                }
                                var messageDiv = $("<div class='import-message'></div>");
                                messageDiv.addClass(success ? "message-success" : "message-error");
                                messageDiv.append("<strong>" + inputElement.files[fileId].name + "</strong>" + " - " + message);
                                messages.append(messageDiv);
                                if (messages.children().length == inputElement.files.length) {
                                    showMessage(messages);
                                    addDecalSets(validSets);
            
                                    // reset file upload
                                    fileUpload.wrap("<form>").closest("form").get(0).reset();
                                    fileUpload.unwrap();
                                }
                            }
                        }
                    });
            
                    if (previewMode) {
                        showDecalPopup();
                    }
                });
            
            
                function showDecalPopup() {
                    if (popup.css("display") == "none") {
                        main_.loadLocalValues(function () {
                            allDecalSets = main_.allDecalSets;
                            settings = main_.settings;
                            localDecalSets = main_.localDecalSets;
                            changesMade = false;
                            enabledChanges = [];
                            $(".switch").toggleClass("on", settings.enabled);
            
                            // build tables
                            showSetsTab();
                        });
                        popup.css("display", "block");
            
                    }}
            
                function showSetsTab() {
                    tableContainer
                        .empty()
                        .append(createSetsTable());
                    $("#tabs").find(".tab").removeClass("active");
                    decalSetsTab.addClass("active");
                }
            
                function showMapsTab() {
                    tableContainer
                        .empty()
                        .append(createMapsTable());
                    $("#tabs").find(".tab").removeClass("active");
                    decalMapsTab.addClass("active");
                }
            
                function createSetsTable() {
                    var setsTable = $("<table id='decal-sets-table' cellpadding='5' cellspacing='0'></table>");
            
                    // Add rows
                    for (var i = 0; i < allDecalSets.length; i++) {
                        var decalSet = allDecalSets[i];
                        var row = $("<tr></tr>");
                        row.appendTo(setsTable);
            
                        // Checkbox cell
                        var checkbox = $("<div class='fa checkbox'/>");
                        checkbox.attr("setId", i);
                        if (main_.isEnabled(decalSet, settings)) {
                            checkbox.addClass("checked");
                        }
                        row.append($("<td/>").append(checkbox));
            
                        // Icon preview
                        var previewURL = decalSet.previewURL;
                        var iconCell = $("<td />");
                        if (previewURL) {
                            var img = $("<img />")
                                .attr("class", "preview-icon")
                                .attr("src", previewURL)
                                .appendTo(iconCell);
            
                            img.click(function () {
                                window.open(this.src, "_blank");
                            });
            
                            img.hover(
                                function () {
                                    var imageView = $("<div class='image-view' />");
                                    $("body").append(imageView);
                                    $("<img/>")
                                        .attr("src", this.src)
                                        .appendTo(imageView);
            
                                    var windowHeight = $(window).height();
                                    var y = windowHeight / 2 - imageView.outerHeight() / 2;
                                    if (y < 0) {
                                        y = 0;
                                    }
                                    imageView
                                        .css("top", y + "px")
                                        .css("left", ($(this).offset().left + $(this).width() + 10) + "px")
                                        .fadeIn("fast");
                                },
                                function () {
                                    $(".image-view").remove();
                                }
                            );
                        }
                        row.append(iconCell);
            
                        // Description
                        var mapNames = [];
                        for (var j = 0; j < decalSet.maps.length; j++) {
                            var map = decalSet.maps[j];
                            mapNames.push(map.name);
                        }
                        var mapList = $("<p/>")
                            .addClass("map-list")
                            .html(mapNames.join(", "));
            
                        $("<td></td>")
                            .html("'" + decalSet.decalSetName + "' by " + decalSet.decalSetAuthor)
                            .append(mapList)
                            .appendTo(row);
            
                        // Delete button
                        if (decalSet.isDefault == true) {
                            $("<td></td>").appendTo(row);
                        } else {
                            var deleteButton = $("<button>Delete</button>");
                            deleteButton.attr("setId", i);
                            deleteButton.click(function () {
                                var setId = $(this).attr("setId");
                                var setToRemove = allDecalSets[setId];
                                removeDecalSet(setToRemove.decalSetName, setToRemove.decalSetAuthor);
                                logObject("Removed local decal set. New localDecalSets:", localDecalSets);
                            });
                            row.append($("<td></td>").append(deleteButton));
                        }
                    }
            
                    // Row click handlers
                    setsTable.find("tr").click(function (event) {
                        var shouldToggle = $(event.target).closest("button, img").length == 0;
                        if (shouldToggle) {
                            var checkbox = $(this).find(".checkbox").first();
                            checkbox.toggleClass("checked");
                            var setId = checkbox.attr("setId");
                            setDecalSetEnabled(setId, checkbox.hasClass("checked"));
                        }
                    });
            
                    return setsTable;
                }
            
                function createMapsTable() {
                    var mapsTable = $("<table id='decal-maps-table' cellpadding='5' cellspacing='0'></table>");
            
                    // Build a hashmap of map names to an array of decal sets
                    var maps = {};
                    for (var i = 0; i < allDecalSets.length; i++) {
                        var decalSet = allDecalSets[i];
                        for (var j = 0; j < decalSet.maps.length; j++) {
                            var setMap = decalSet.maps[j];
                            var mapName = setMap.name;
                            if (!(mapName in maps)) {
                                maps[mapName] = [];
                            }
                            maps[mapName].push(i)
                        }
                    }
            
                    for (var map in maps) {
                        if (maps.hasOwnProperty(map)) {
                            var mapNameRow = $("<tr class='heading'></tr>");
                            $("<td></td>").appendTo(mapNameRow);
                            $("<td></td>")
                                .html(map)
                                .appendTo(mapNameRow);
                            mapNameRow.appendTo(mapsTable);
                            var sets = maps[map];
                            for (i = 0; i < sets.length; i++) {
                                var setId = sets[i];
                                decalSet = allDecalSets[setId];
                                var row = $("<tr></tr>");
                                row.appendTo(mapsTable);
            
                                var checkbox = $("<div class='fa checkbox'/>");
                                checkbox.attr("setId", setId);
                                checkbox.attr("mapName", map);
                                if (main_.isMapEnabled(decalSet, map, settings)) {
                                    checkbox.addClass("checked");
                                }
                                row.append($("<td/>").append(checkbox));
            
                                $("<td></td>")
                                    .html("'" + decalSet.decalSetName + "' by " + decalSet.decalSetAuthor)
                                    .appendTo(row);
                            }
                        }
                    }
            
                    // Row click handlers
                    mapsTable.find("tr").click(function (event) {
                        var shouldToggle = $(event.target).closest("button, img").length == 0;
                        if (shouldToggle) {
                            var checkbox = $(this).find(".checkbox").first();
                            checkbox.toggleClass("checked");
                            var setId = checkbox.attr("setId");
                            var mapName = checkbox.attr("mapName");
                            setMapEnabled(setId, mapName, checkbox.hasClass("checked"));
                        }
                    });
            
                    return mapsTable;
                }
            
                function showMessage(message) {
                    var messageDiv;
                    messageDiv = $("<div/>").addClass("decal-message");
                    if (message instanceof jQuery) {
                        messageDiv.append(message);
                    } else {
                        messageDiv.append("<div>" + message + "</div>");
                    }
            
                    var closeButton = $("<button>Close</button>");
                    closeButton.click(function () {
                        messageDiv.remove();
                    });
            
                    var buttons = $("<div/>")
                        .addClass("decal-buttons right")
                        .append(closeButton);
            
                    messageDiv.append(buttons)
                        .appendTo($("body"));
                }
            
                function showConfirmMessage() {
                    var messageDiv = $("<div/>").addClass("decal-message");
                    messageDiv.append("<div>Do you want to save your changes?</div>");
            
                    var cancelButton = $("<button>Cancel</button>")
                        .click(function () {
                            messageDiv.remove();
                        });
            
                    var dontSaveButton = $("<button>Don't Save</button>")
                        .click(function () {
                            messageDiv.remove();
                            closePopup();
                        });
            
                    var saveButton = $("<button>Save</button>")
                        .addClass("default")
                        .click(function () {
                            messageDiv.remove();
                            saveSettings();
                        });
            
                    var buttonsLeft = $("<div/>")
                        .addClass("decal-buttons left")
                        .append(cancelButton);
            
                    var buttonsRight = $("<div/>")
                        .addClass("decal-buttons right")
                        .append(dontSaveButton)
                        .append(saveButton);
            
                    messageDiv
                        .append(buttonsLeft)
                        .append(buttonsRight)
                        .appendTo($("body"));
                }
            
                function toggleEnabled() {
                    settings.enabled = !settings.enabled;
                    toggleChange("enabled");
                    $(".switch").toggleClass("on", settings.enabled);
                    log("Set enabled = " + settings.enabled);
                }
            
                function cancel() {
                    if (popup.css("display") != "none") {
                        if (changesMade || enabledChanges.length > 0) {
                            showConfirmMessage();
                        } else {
                            closePopup();
                        }
                    }
                }
            
                function closePopup() {
                    settings = null;
                    localDecalSets = null;
                    popup.css("display", "none");
                }
            
                function saveSettings() {
                    main_.saveLocalValues(settings, localDecalSets);
                    closePopup();
                }
            
                function setDecalSetEnabled(setId, enabled) {
                    var decalSet = allDecalSets[setId];
                    var setting = {
                        setName: decalSet.decalSetName,
                        setAuthor: decalSet.decalSetAuthor
                    };
                    var i = indexOfSetSetting(setting);
                    var alreadyDisabled = i > -1;
                    if (enabled && alreadyDisabled) {
                        settings.disabledSets.splice(i, 1);
                        toggleChange(setId);
                    } else if (!enabled && !alreadyDisabled) {
                        settings.disabledSets.push(setting);
                        toggleChange(setId);
                    }
                }
            
                function setMapEnabled(setId, mapName, enabled) {
                    var decalSet = allDecalSets[setId];
                    var setting = {
                        setName: decalSet.decalSetName,
                        setAuthor: decalSet.decalSetAuthor,
                        mapName: mapName
                    };
                    var i = indexOfMapSetting(setting);
                    var alreadyDisabled = i > -1;
                    if (enabled && alreadyDisabled) {
                        settings.disabledMaps.splice(i, 1);
                        toggleChange(setId + mapName);
                    } else if (!enabled && !alreadyDisabled) {
                        settings.disabledMaps.push(setting);
                        toggleChange(setId + mapName);
                    }
                }
            
                function toggleChange(changeId) {
                    var i = $.inArray(changeId, enabledChanges);
                    if (i > -1) {
                        enabledChanges.splice(i, 1);
                    } else {
                        enabledChanges.push(changeId);
                    }
                }
            
                function indexOfSetSetting(setting) {
                    for (var i = 0; i < settings.disabledSets.length; i++) {
                        var disabledSet = settings.disabledSets[i];
                        if (setting.setName == disabledSet.setName && setting.setAuthor == disabledSet.setAuthor) {
                            return i;
                        }
                    }
                    return -1;
                }
            
                function indexOfMapSetting(setting) {
                    for (var i = 0; i < settings.disabledMaps.length; i++) {
                        var disabledMap = settings.disabledMaps[i];
                        if (setting.setName == disabledMap.setName && setting.setAuthor == disabledMap.setAuthor && setting.mapName == disabledMap.mapName) {
                            return i;
                        }
                    }
                    return -1;
                }
            
                function validateDecalSet(decalSet) {
                    var decalSetName = decalSet.decalSetName;
                    var decalSetAuthor = decalSet.decalSetAuthor;
                    var previewURL = decalSet.previewURL;
                    var maps = decalSet.maps;
            
                    // Check fields
                    if (!exists(decalSetName)) {
                        return err("Missing name");
                    }
                    if (!exists(decalSetAuthor)) {
                        return err("Missing author");
                    }
                    if (!exists(previewURL)) {
                        return err("Missing preview url");
                    }
                    if (!exists(maps)) {
                        return err("Missing maps");
                    }
            
                    var override = false;
                    for (var i = 0; i < allDecalSets.length; i++) {
                        var existingSet = allDecalSets[i];
                        if (existingSet.decalSetName == decalSetName && existingSet.decalSetAuthor == decalSetAuthor) {
                            override = true;
                            if (existingSet.isDefault == true) {
                                return err("Default set cannot be overidden (" + decalSetName + " by " + decalSetAuthor + "). Try using a different name.");
                            }
                        }
                    }
            
                    // Check maps
                    for (i = 0; i < maps.length; i++) {
                        var map = maps[i];
                        if (!(map.name && map.name.length > 0)) {
                            return err("maps[" + i + "] missing name");
                        }
                        var hasFloorDecalURL = map.floorDecalURL && map.floorDecalURL.length > 0;
                        var hasWallDecalURL = map.wallDecalURL && map.wallDecalURL.length > 0;
                        if (!hasFloorDecalURL && !hasWallDecalURL) {
                            return err("maps[" + i + "] missing both floorDecalURL and wallDecalURL");
                        }
                    }
            
                    // Success
                    return {
                        success: true,
                        message: decalSetName + " by " + decalSetAuthor + " " + (override ? "updated" : "added")
                    };
            
                    function exists(value) {
                        return value && value.length > 0;
                    }
            
                    function err(message) {
                        return {
                            success: false,
                            message: message
                        };
                    }
                }
            
                function addDecalSets(sets) {
                    for (var i = 0; i < sets.length; i++) {
                        var decalSet = sets[i];
                        for (var j = 0; j < localDecalSets.length; j++) {
                            var existingSet = localDecalSets[j];
                            if (existingSet.decalSetName == decalSet.decalSetName && existingSet.decalSetAuthor == decalSet.decalSetAuthor) {
                                // Override
                                localDecalSets.splice(j, 1);
                                break;
                            }
                        }
                        decalSet.isDefault = false;
                        localDecalSets.push(decalSet);
                    }
                    if (sets.length > 0) {
                        changesMade = true;
                    }
                    allDecalSets = main_.defaultDecalSets.concat(localDecalSets);
                    redrawTables();
                }
            
                function removeDecalSet(decalSetName, decalSetAuthor) {
                    for (var i = 0; i < localDecalSets.length; i++) {
                        var decalSet = localDecalSets[i];
                        if (decalSetName == decalSet.decalSetName && decalSetAuthor == decalSet.decalSetAuthor) {
                            localDecalSets.splice(i, 1);
                            allDecalSets = main_.defaultDecalSets.concat(localDecalSets);
                            changesMade = true;
                            redrawTables();
                            break;
                        }
                    }
                }
            
                function redrawTables() {
                    if (decalSetsTab.hasClass("active")) {
                        showSetsTab();
                    } else {
                        showMapsTab();
                    }
                }
            });
        }
    }

})();
