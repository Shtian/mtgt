'use strict';

/* Directives */


angular.module('components', [])
    .directive('magicIcons', function () {
      return {
        restrict: "A",
        template: "<div class='magic-icons'>" +
            "<img src='/img/MTGWhite.png' />" +
            "<img src='/img/MTGGreen.png' />" +
            "<img src='/img/MTGRed.png' />" +
            "<img src='/img/MTGBlack.png' />" +
            "<img src='/img/MTGBlue.png' />" +
            "</div>",
        replace: true
      }
    })
    .directive('autoComplete', function () {
      return {
        restrict: "A",
        replace: false,
        transclude: true,
        template: "<div class='autocomplete'>" +
            "</div>",
        controller: ["$scope", "$element", "$attrs", "$transclude",
          function ($scope, $element, $attrs, $transclude) {
          }]
      }
    })
    .directive('appVersion', ['version', function(version) {
      return function(scope, elm) {
        elm.text(version);
      };
    }]);