(function () {
  'use strict';

  angular.module('kt.datePicker').directive('ktDatePickerIcon', function ($document, $templateCache) {
    var svg = angular.element($templateCache.get('html/kt-date-picker-icons.svg')).addClass('ng-hide');

    angular.element($document[0].body).append(svg);

    return {
      restrict: 'E',
      scope: {
        icon: '@'
      },
      template: '<svg><use xlink:href="{{icon}}"></use></svg>',
      link: function (scope, elem) {

      }
    };
  });
})();
