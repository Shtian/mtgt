'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp',
        ['myApp.config', 'myApp.filters', 'myApp.services', 'components', 'myApp.controllers', 'firebase', 'ngRoute', 'ui.bootstrap']
    )

    // configure views; note the authRequired parameter for authenticated pages
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

        $routeProvider.when('/Home', {
            templateUrl: 'partials/Home.html',
            controller: 'HomeCtrl'
        });

        $routeProvider.when('/login', {
            templateUrl: 'partials/Login.html',
            controller: 'LoginCtrl'
        });

        $routeProvider.when('/tournament', {
            templateUrl: 'partials/TournamentView.html',
            controller: 'TournamentCtrl'
        });

        $routeProvider.when('/account', {
            authRequired: true,
            templateUrl: 'partials/Account.html',
            controller: 'AccountCtrl'
        });

        $routeProvider.when('/tournament/:tournamentId', {
            templateUrl: 'partials/TournamentDetailsView.html',
            controller: 'TournamentDetailsCtrl'
        });

        $routeProvider.otherwise({redirectTo: '/Home'});

    }])

    // double-check that the app has been configured
    .run(['FBURL', function (FBURL) {
        if (FBURL === 'https://INSTANCE.firebaseio.com') {
            angular.element(document.body).html('<h1>Please configure app/js/config.js before running!</h1>');
        }
    }])

    // establish authentication
    .run(['angularFireAuth', 'FBURL', '$rootScope', function (angularFireAuth, FBURL, $rootScope) {
        angularFireAuth.initialize(FBURL, {scope: $rootScope, name: "auth", path: '/login'});
        $rootScope.FBURL = FBURL;
    }]);