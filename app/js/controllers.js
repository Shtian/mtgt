'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('MyCtrl2', ['$scope', 'FBURL', 'Firebase', 'angularFireCollection', function ($scope, FBURL, Firebase, angularFireCollection) {
      $scope.newMessage = null;

      // constrain number of messages by passing a ref to angularFire
      var ref = new Firebase(FBURL + '/messages').limit(10);
      // add the array into $scope
      $scope.messages = angularFireCollection(ref);

      // add new messages to the list
      $scope.addMessage = function () {
        if ($scope.newMessage) {
          $scope.messages.add({text: $scope.newMessage});
          $scope.newMessage = null;
        }
      };
    }])

    .controller('LoginCtrl', ['$scope', 'loginService', function ($scope, loginService) {
      $scope.email = null;
      $scope.pass = null;
      $scope.confirm = null;
      $scope.createMode = false;

      $scope.login = function (callback) {
        $scope.err = null;
        loginService.login($scope.email, $scope.pass, '/account', function (err, user) {
          $scope.err = err || null;
          typeof(callback) === 'function' && callback(err, user);
        });
      };

      $scope.createAccount = function () {
        if (!$scope.email) {
          $scope.err = 'Please enter an email address';
        }
        else if (!$scope.pass) {
          $scope.err = 'Please enter a password';
        }
        else if ($scope.pass !== $scope.confirm) {
          $scope.err = 'Passwords do not match';
        }
        else {
          loginService.createAccount($scope.email, $scope.pass, function (err, user) {
            if (err) {
              $scope.err = err;
            }
            else {
              // must be logged in before I can write to my profile
              $scope.login(function (err) {
                if (!err) {
                  loginService.createProfile(user.id, user.email);
                }
              });
            }
          });
        }
      };
    }])

    .controller('AccountCtrl', ['$scope', 'loginService', 'angularFire', 'FBURL', '$timeout', function ($scope, loginService, angularFire, FBURL, $timeout) {

      angularFire(FBURL + '/users/' + $scope.auth.id, $scope, 'user', {});

      $scope.logout = function () {
        loginService.logout('/login');
      };

      $scope.oldpass = null;
      $scope.newpass = null;
      $scope.confirm = null;

      function reset() {
        $scope.err = null;
        $scope.msg = null;
      }

      $scope.updatePassword = function () {
        reset();
        loginService.changePassword(buildPwdParms());
      };

      $scope.$watch('oldpass', reset);
      $scope.$watch('newpass', reset);
      $scope.$watch('confirm', reset);

      function buildPwdParms() {
        return {
          email: $scope.auth.email,
          oldpass: $scope.oldpass,
          newpass: $scope.newpass,
          confirm: $scope.confirm,
          callback: function (err) {
            if (err) {
              $scope.err = err;
            }
            else {
              $scope.msg = 'Password updated!';
            }
          }
        }
      }

    }])

    .controller('HomeCtrl', ['$scope', '$location', 'angularFireCollection', 'FBURL', '$timeout',
      function HomeCtrl($scope, $location, angularFireCollection, FBURL, $timeout) {
        $scope.text = 'Test';
        $scope.tournaments = angularFireCollection(FBURL + '/tournaments', $scope, 'tournaments');

        function ArrangeRounds(players) {
          if (players.length % 2) {
            players.push({name: "Dummy Player", score: 0});
          }
          var num = players.length;
          var roundData = {
            numberOfPlayers: num,
            numberOfTotalMatches: ((num / 2) * (num - 1)),
            matchesEachRound: (num / 2),
            numberOfRounds: (num - 1),
            rounds: []
          };

          for (var partner = 0; partner <= (num - 2); partner++) {
            var round = [];
            round.push({
              player: players[num - 1].name,
              opponent: players[partner].name,
              match1: 0,
              match2: 0,
              match3: 0
            });
            for (var pair = 1; pair <= ((num - 2) / 2); pair++) {
              var p1 = (partner - pair) % (num - 1);
              if (p1 < 0) p1 += num - 1;
              var p2 = (partner + pair) % (num - 1);
              if (p2 < 0) p2 += num - 1;
              console.log("pair = " + pair + ", partner = " + partner + ", p1 = " + p1 + ", p2 = " + p2);
              round.push({
                player: players[p1].name,
                opponent: players[p2].name,
                match1: 0,
                match2: 0,
                match3: 0
              });
            }
            roundData.rounds.push(round);
          }
          return roundData;
        }


        $scope.createTournament = function () {
          var playerdata = [];
          var playerNameArray = angular.copy($scope.players);
          for (var i = 0; i < playerNameArray.length; i++) {
            playerdata.push({
              name: playerNameArray[i], score: 0
            });
          }

          var rounds = ArrangeRounds(playerdata);
          var today = new Date().getTime();
          $scope.tournaments.add({
            title: angular.copy($scope.newTournamentName),
            players: angular.copy($scope.players),
            completed: false,
            date: today,
            rounds: rounds
          });

          $scope.newTournamentName = null;
          $scope.players = null;
        };

        function capitalizeFirstLetter(word) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }

        // Add players
        $scope.players = [];

        $scope.addPlayer = function () {
          if ($scope.newPlayerName) {
            var player = {
              name: capitalizeFirstLetter($scope.newPlayerName)
            }
            $scope.players.push(player);
            $scope.newPlayerName = null;
          }
        };

        $scope.removePlayer = function (index) {
          $scope.players.splice(index, 1)
        };
        // Enable creation when player count > 1
        $scope.disableCreation = function () {
          return ((!$scope.players) || ($scope.players.length < 3) || (!$scope.newTournamentName));
        };

      }])


    .controller('TournamentCtrl', ['$scope', '$location', '$routeParams', 'angularFire', 'FBURL', '$timeout',
      function TournamentCtrl($scope, $location, $routeParams, angularFire, FBURL, $timeout) {

        angularFire(FBURL + '/tournaments/' + $routeParams.tournamentId, $scope, 'remote', {}).
            then(function () {
              $scope.tournament = angular.copy($scope.remote);
              $scope.players = angular.copy($scope.remote.players);
              $scope.tournament.$id = $routeParams.tournamentId;
            });
      }])

;