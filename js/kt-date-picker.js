(function () {
  'use strict';

  var datePicker = angular.module('kt.datePicker', ['kt.util.style', 'kt.dropdown']);

  datePicker.directive('ktDatePicker', [function () {
    return {
      restrict: 'E',
      scope: {
        date: '=',
        minDate: '=',
        maxDate: '='
      },
      templateUrl: 'html/kt-date-picker.html',
      link: function (scope, element) {
        scope.element = element;
        var currentPicker = 'day';

        scope.setCurrentPicker = function (picker) {
          currentPicker = picker;
        };

        scope.isCurrentPicker = function (picker) {
          return currentPicker === picker;
        };

        scope.$on('dayPicker:daySelect', function (ev) {
          var parentElement = scope.$parent.element ? scope.$parent.element : undefined;

          if (parentElement && parentElement.prop('tagName').toLowerCase() === 'kt-date-range-picker') {
            scope.$emit('datePicker:dateSelect');
          }

          ev.stopPropagation();
        });

        scope.$on('dayPicker:monthClick', function (ev) {
          currentPicker = 'month';
          ev.stopPropagation();
        });

        scope.$on('monthPicker:monthSelect', function (ev) {
          currentPicker = 'day';
          ev.stopPropagation();
        });

        scope.$on('yearPicker:yearSelect', function (ev) {
          currentPicker = 'month';
          ev.stopPropagation();
        });

        scope.$on('monthPicker:yearClick', function (ev) {
          currentPicker = 'year';
          ev.stopPropagation();
        });
      }
    }
  }]);

  datePicker.directive('ktDatePickerInput', ['ktDatePickerService', function (datePickerService) {
    var instanceCount = 0;

    return {
      restrict: 'E',
      scope: {
        date: '=',
        minDate: '=',
        maxDate: '=',
        format: '@'
      },
      templateUrl: 'html/kt-date-picker-input.html',
      link: function (scope) {
        scope.instanceCount = instanceCount++;
        scope.dateString = '';

        scope.date = datePickerService.getDateWithinBounds(scope.date, scope.minDate, scope.maxDate);

        scope.$watch('date', function (date) {
          scope.dateString = date.format(scope.format);
        }, true);

        scope.dateStringChanged = function () {
          var date = moment(scope.dateString, scope.format, true);

          if (!date.isValid() || !datePickerService.isDateWithinBounds(date, scope.minDate, scope.maxDate, null, '[]')) {
            return;
          }

          scope.date.year(date.year()).month(date.month()).date(date.date());
        };
      }
    };
  }]);
})();
