'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('HeaderCtrl', ['$scope', 'loginService', '$location', function ($scope, loginService, $location) {
        $scope.navTitle = "MTG: Tournament";
    }])

    .controller('LoginCtrl', ['$scope', 'loginService', function ($scope, loginService) {
        $scope.email = null;
        $scope.pass = null;
        $scope.confirm = null;
        $scope.createMode = false;

        $scope.login = function (callback) {
            $scope.err = null;
            loginService.login($scope.email, $scope.pass, '/tournament', function (err, user) {
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

    .controller('HomeCtrl', ['$scope', 'loginService', function ($scope, loginService) {

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

    .controller('TournamentCtrl', ['$scope', '$location', 'angularFireCollection', 'FBURL', '$timeout',
        function TournamentCtrl($scope, $location, angularFireCollection, FBURL, $timeout) {

            $scope.tournaments = angularFireCollection(FBURL + '/tournaments', $scope, 'tournaments');

            /* Generates a round robin tournament arrangement of matches. All play all. */
            function ArrangeRounds(players) {
                var dummyPlayer = players.length % 2;
                if (players.length % 2) {
                    players.push({name: "Dummy Player", score: 0});
                }
                var num = players.length;
                var roundData = {
                    numberOfPlayers: num - dummyPlayer,
                    numberOfTotalMatches: ((num / 2) * (num - 1)),
                    matchesEachRound: (num / 2),
                    numberOfRounds: (num - 1),
                    numberOfMatchesPlayed: 0,
                    rounds: []
                };

                for (var partner = 0; partner <= (num - 2); partner++) {
                    var round = [];
                    round.push({
                        player: players[num - 1].name,
                        opponent: players[partner].name,
                        winner: ""
                    });
                    for (var pair = 1; pair <= ((num - 2) / 2); pair++) {
                        var p1 = (partner - pair) % (num - 1);
                        if (p1 < 0) p1 += num - 1;
                        var p2 = (partner + pair) % (num - 1);
                        if (p2 < 0) p2 += num - 1;
                        round.push({
                            player: players[p1].name,
                            opponent: players[p2].name,
                            winner: ""
                        });
                    }
                    // Subtract all matches with a dummy player from the total matches count.
                    for (var i = 0; i < round.length; i++) {
                        if (round[i].player == 'Dummy Player' || round[i].opponent == 'Dummy Player') {
                            roundData.numberOfTotalMatches--;
                        }
                    }
                    roundData.rounds.push(round);
                }
                return roundData;
            }

            /* Adds a tournament to the firebase collection */
            $scope.createTournament = function () {
                var playerdata = [];
                var playerNameArray = angular.copy($scope.players);

                for (var i = 0; i < playerNameArray.length; i++) {
                    playerdata.push({
                        name: playerNameArray[i].name, score: 0
                    });
                }
                // Generate all rounds with matches
                var rounds = ArrangeRounds(playerdata);

                var today = new Date().getTime();

                $scope.tournaments.add({
                    title: angular.copy($scope.newTournamentName),
                    players: playerdata,
                    completed: false,
                    date: today,
                    roundData: rounds
                });
                // Reset Data
                $scope.newTournamentName = null;
                $scope.players = null;
            };

            /* Utility function to capitalize the first letter of a string */
            function capitalizeFirstLetter(word) {
                return word.charAt(0).toUpperCase() + word.slice(1);
            }

            /* Always start out with an empty list */
            $scope.players = [];

            /* Add a player to the array on the $scope */
            $scope.addPlayer = function () {
                if ($scope.newPlayerName) {
                    var player = {
                        name: capitalizeFirstLetter($scope.newPlayerName)
                    }
                    $scope.players.push(player);
                    $scope.newPlayerName = null;
                }
            };

            /* Remove a player from the array at a given index */
            $scope.removePlayer = function (index) {
                $scope.players.splice(index, 1)
            };

            /* As long as there are less than three players or the name of the tournament is empty,
             tournament creation is disabled */
            $scope.disableCreation = function () {
                return ((!$scope.players) || ($scope.players.length < 3) || (!$scope.newTournamentName));
            };

        }])

    .controller('TournamentDetailsCtrl', ['$scope', '$location', '$routeParams', 'angularFire', 'FBURL', '$timeout',
        function TournamentDetailsCtrl($scope, $location, $routeParams, angularFire, FBURL, $timeout) {

            angularFire(FBURL + '/tournaments/' + $routeParams.tournamentId, $scope, 'remote', {}).
                then(function () {
                    $scope.dummyClass = function (player, opponent) {
                        if (player == 'Dummy Player' || opponent == 'Dummy Player') {
                            return "dummy-match";
                        }
                        return "";
                    }

                    $scope.isWinner = function (playerName, match) {
                        return match.matchWinner == playerName;
                    }

                    $scope.toggleWinner = function (playerName, match) {
                        // Matches with dummy players should not be counted
                        if (match.opponent == 'Dummy Player' || match.player == 'Dummy Player') {
                            return;
                        }

                        // no winner, go through and increment score, set winner and increment matches played
                        if (match.winner == "") {
                            for (var i = 0; i < $scope.remote.players.length; i++) {
                                if ($scope.remote.players[i].name == playerName) {
                                    $scope.remote.players[i].score++;
                                    match.winner = playerName;
                                    $scope.remote.roundData.numberOfMatchesPlayed++;
                                    break;
                                }
                            }
                        }
                        else {
                            //Decrease score and remove winner if the player is already the winner
                            if (match.winner == playerName) {
                                for (var i = 0; i < $scope.remote.players.length; i++) {
                                    if ($scope.remote.players[i].name == playerName) {
                                        $scope.remote.players[i].score--;
                                        match.winner = "";
                                        $scope.remote.roundData.numberOfMatchesPlayed--;
                                        break;
                                    }
                                }
                            }
                            else {
                                // winner is not the current winner and the winner is already set.
                                // find current winner and remove, set new winner.
                                for (var i = 0; i < $scope.remote.players.length; i++) {
                                    if ($scope.remote.players[i].name == match.winner) {
                                        $scope.remote.players[i].score--;
                                        match.winner = "";
                                        $scope.remote.roundData.numberOfMatchesPlayed--;
                                        break;
                                    }
                                }
                                for (var i = 0; i < $scope.players.length; i++) {
                                    if ($scope.remote.players[i].name == playerName) {
                                        $scope.remote.players[i].score++;
                                        match.winner = playerName;
                                        $scope.remote.roundData.numberOfMatchesPlayed++;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                });


        }])

;