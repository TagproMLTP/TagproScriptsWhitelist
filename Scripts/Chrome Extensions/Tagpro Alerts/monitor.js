(function(context) {

    var notify = true,
        lastServerResult = null,
        lastBother = 0,
        botherSpan = 0,
        notification = null;

    function checkForGames() {
        if (!localStorage["server"])
            return;

        if (!notify)
            return;

        if (!(new Date().getTime() - lastBother >= botherSpan))
            return;

        var request = new XMLHttpRequest();

        request.open("GET", "http://tagpro.koalabeast.com/servers", true);
        request.onload = function() {
            var servers = JSON.parse(request.response),
                server = null;

            servers.forEach(function(someServer) {
                if (someServer.name.toLowerCase() == localStorage["server"])
                    server = someServer;
            });

            if (!server)
                return;

            if (server.players > 0) {
                lastServerResult = server;

                chrome.notifications.create(
                    "FolksPlaying",
                    {
                        type: "basic",
                        title: "Balls Unite!",
                        message: "There is currently " + lastServerResult.players + " balls in " + lastServerResult.games + " TagPro games.",
                        iconUrl: "icon_128.png",
                        buttons: [
                            { title: "Snooze for 2 Hours" },
                            { title: "Snooze for 8 Hours" }
                        ]
                    },
                    function() { });
            }
            else
                chrome.notifications.clear("FolksPlaying", function () {});
        };

        request.send(null);
    }

    chrome.notifications.onClicked.addListener(function(notificationId) {
        if (notificationId == "SelectServer") {
            chrome.tabs.create({
                url: chrome.extension.getURL("options.html")
            });

            chrome.notifications.clear("SelectServer", function () {});

            return;
        }

        chrome.notifications.clear("FolksPlaying", function () {});
        chrome.tabs.create({url: lastServerResult.url});
        context.snooze(2);
    });

    chrome.notifications.onButtonClicked.addListener(function(notificationId, index) {
        chrome.notifications.clear("FolksPlaying", function () {});
        context.snooze(index == 0 ? 2 : 8);
    });

    chrome.notifications.onClosed.addListener(function(notificationId, byUser) {
        if (notificationId == "FolksPlaying" && byUser)
            context.snooze(2);
    });

    setInterval(checkForGames, 30000);
    checkForGames();

    context.snooze = function(howLong) {
        botherSpan = howLong * 3600000;
        lastBother = new Date().getTime();
    };

})(this);

if (!localStorage["server"] || localStorage["server"] == "" || localStorage["server"].indexOf("tagpro") > -1) {
    localStorage["server"] == "";

    var notification = webkitNotifications.createNotification(
        "icon.png",
        "TagPro",
        "Click Here to select your server"
    );

    chrome.notifications.create(
        "SelectServer",
        {
            type: "basic",
            title: "TagPro",
            message: "Click Here to select your server",
            iconUrl: "icon_128.png"
        },
        function() { });
}