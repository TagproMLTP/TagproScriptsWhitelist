/* browser-action script */

var currentPage = chrome.extension.getBackgroundPage();

currentPage.getServers();
currentPage.joinerOrGroup();

angular.module('groupster', [])
  .controller('HomeCtrl', function ($http, $scope, $timeout) {
  	$scope.allServers = ['Radius', 'Segment', 'Pi', 'Origin', 'Sphere', 'Centra', 'Arc', 'Orbit', 'Chord', 'Diameter', 'Maptest1', 'Maptest2', 'Maptest3', 'Tangent']
    $scope.showMain = true;

    chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
      if(request.method.servers) $scope.servers = request.method.servers;
      if(request.method.groups) $scope.groupOn = request.method.groups;
      $scope.$apply();
    });

    $scope.handleClick = function(server) {
      $scope.groupOn ? $scope.makeGroupOn(server) : $scope.enterJoinerOn(server);
    }

    $scope.enterJoinerOn = function(server) {
      var joinerlink = 'http://tagpro-' + server.toLowerCase() + '.koalabeast.com/games/find';
      if(server == 'Maptest3') joinerlink = 'http://maptest3.newcompte.fr/games/find';
      if(server == 'Maptest2') joinerlink = 'http://maptest2.newcompte.fr/games/find';
      if(server == 'Maptest1') joinerlink = 'http://maptest.newcompte.fr/games/find';
      if(server == 'Tangent') joinerlink = 'http://tangent.jukejuice.com/games/find';
      window.open(joinerlink);
    }

    $scope.makeGroupOn = function(server) {
  		$http.get('http://serene-headland-9709.herokuapp.com/groupster/' + server.toLowerCase())
  			.success(function(link) {
  				var grouplink = 'http://tagpro-' + server.toLowerCase() + '.koalabeast.com/groups/' + link;
          if(server == 'Maptest3') grouplink = 'http://maptest3.newcompte.fr/groups/' + link;
  				if(server == 'Maptest2') grouplink = 'http://maptest2.newcompte.fr/groups/' + link;
          if(server == 'Maptest1') grouplink = 'http://maptest.newcompte.fr/groups/' + link;
          if(server == 'Tangent') grouplink = 'http://tangent.jukejuice.com/groups/' + link;
          window.open(grouplink);
  			})
  			.error(function(err) {
  				console.log(err);
  			})
  	}

    $scope.toggleGroupOn = function() {
      chrome.runtime.sendMessage({
          action: 'update',
          method: 'groups',
          args: { groups : !$scope.groupOn }
      })
      $scope.groupOn ? $scope.groupOn = false : $scope.groupOn = true;
    }

    $scope.toggleView = function() {
      if(!$scope.showMain) $scope.savePreferences(); //then we're going from settings -> main
      $scope.showMain ? $scope.showMain = false : $scope.showMain = true;
    }

    $scope.savePreferences = function() {
      chrome.runtime.sendMessage({
          action: 'update',
          method: 'preferences',
          args: { servers : $scope.servers }
        })
    }

    $scope.addServer = function(server) {
      if($scope.servers.indexOf(server) < 0) $scope.servers.push(server);
    }

    $scope.removeServer = function(server) {
      if($scope.servers.indexOf(server) > -1) $scope.servers.splice($scope.servers.indexOf(server), 1);
    }


  });