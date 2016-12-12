(function () {
  'use strict';

  var dateRangePicker = angular.module('kt.datePicker');

  dateRangePicker.directive('ktDateRangePicker', ['ktDatePickerService',  function (datePickerService) {
    return {
      restrict: 'E',
      scope: {
        startDate: '=',
        endDate: '=',
        minDate: '=',
        maxDate: '='
      },
      templateUrl: 'html/kt-date-range-picker.html',
      link: function (scope, element) {
        scope.element = element;
        var currentPicker = 'start';

        scope.startDate =  datePickerService.getDateWithinBounds(scope.startDate, scope.minDate, scope.maxDate);
        scope.endDate =  datePickerService.getDateWithinBounds(scope.endDate, scope.minDate, scope.maxDate);

        scope.$watch('startDate', function (startDate) {
          scope.endDate = datePickerService.getDateWithinBounds(scope.endDate, startDate, scope.maxDate);
        }, true);

        scope.$on('datePicker:dateSelect', function (ev) {
          ev.stopPropagation();

          currentPicker = currentPicker === 'start' ? 'end' : 'start';
        });

        scope.isCurrentPicker = function (picker) {
          return currentPicker === picker;
        };

        scope.setCurrentPicker = function (picker) {
          currentPicker = picker;
        }
      }
    };
  }]);
})();