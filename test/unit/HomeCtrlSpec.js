'use strict';

describe('MyApp', function () {
  var scope;
  var players;
  beforeEach(module('MyApp'));
  beforeEach(module(function ($provide) {

    $provide.value('Firebase', firebaseStub());
    $provide.value('$location', stub('path'));
    $provide.value('FBURL', 'FAKE_FB_URL');
  }));
  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    $controller('HomeCtrl', {$scope: scope});

    players = [
      {name: "Stian", score: 0},
      {name: "Espen", score: 0},
      {name: "Sofien", score: 0},
      {name: "Joakim", score: 0}
    ];
  }));


  //tests

  it('should have a variable text = "Test"', function () {
    expect(scope.text).toBe('Test');
  });
});