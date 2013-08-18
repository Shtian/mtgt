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

        $scope.tournaments = angularFireCollection(FBURL + '/tournaments', $scope, 'tournaments');

        $scope.createTournament = function () {

          var today = new Date().getTime();
          $scope.tournaments.add({
            title: angular.copy($scope.newTournamentName),
            players: angular.copy($scope.players),
            completed: false,
            date: today
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