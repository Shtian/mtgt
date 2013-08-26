'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp',
        ['myApp.config', 'myApp.filters', 'myApp.services', 'myApp.directives', 'myApp.controllers', 'firebase', 'ngRoute']
    )

  // configure views; note the authRequired parameter for authenticated pages
    .config(['$routeProvider', function ($routeProvider) {

      $routeProvider.when('/view2', {
        templateUrl: 'partials/view2.html',
        controller: 'MyCtrl2'
      });

      $routeProvider.when('/account', {
        authRequired: true,
        templateUrl: 'partials/Account.html',
        controller: 'AccountCtrl'
      });

      $routeProvider.when('/login', {
        templateUrl: 'partials/Login.html',
        controller: 'LoginCtrl'
      });

      $routeProvider.when('/tournament/:tournamentId', {
        templateUrl: 'partials/TournamentView.html',
        controller: 'TournamentCtrl'
      });

      $routeProvider.when('/Home', {
        templateUrl: 'partials/Home.html',
        controller: 'HomeCtrl'
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