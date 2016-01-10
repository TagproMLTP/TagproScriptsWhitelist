document.addEventListener("DOMContentLoaded", function() {

    var serverSelect = document.getElementById("serverSelect");

    serverSelect.addEventListener("change", function() {
        var server = serverSelect.children[serverSelect.selectedIndex].value;
        localStorage["server"] = server;
    });

    var server = localStorage["server"],
        request = new XMLHttpRequest();

    request.open("GET", "http://tagpro.koalabeast.com/servers", true);
    request.onload = function() {
        var servers = JSON.parse(request.response);

        servers.forEach(function(someServer) {
            var option = document.createElement("option");

            option.text = someServer.name + " (" + someServer.location + ")";
            option.value = someServer.name.toLowerCase();
            option.selected = someServer.name.toLowerCase() == localStorage["server"];

            serverSelect.options.add(option);
        });
    };

    request.send(null);
});