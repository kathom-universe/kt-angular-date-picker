(function () {
  'use strict';

  var datePicker = angular.module('kt.datePicker', ['kt.util.style', 'kt.dropdown']);

  datePicker.directive('ktDatePicker', [function () {
    return {
      restrict: 'E',
      scope: {
        date: '='
      },
      template:
      '<kt-day-picker date="$parent.date" ng-if="isCurrentPicker(\'day\')"></kt-day-picker>' +
      '<kt-month-picker date="$parent.date" ng-if="isCurrentPicker(\'month\')"></kt-month-picker>' +
      '<kt-year-picker date="$parent.date" ng-if="isCurrentPicker(\'year\')"></kt-year-picker> ',
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

  datePicker.directive('ktDatePickerInput', [function () {
    var instanceCount = 0;

    return {
      restrict: 'E',
      scope: {
        date: '=',
        format: '@'
      },
      template:
        '<input type="text" ng-model="dateString" ng-change="dateStringChanged()" kt-dropdown=".ktDatePickerInput_{{instanceCount}}">' +
        '<kt-date-picker class="ktDatePickerInput_{{instanceCount}}" date="date"></kt-date-picker>',
      link: function (scope) {
        scope.instanceCount = instanceCount++;
        scope.dateString = '';

        scope.$watch('date', function (date) {
          if (!date) {
            return;
          }

          scope.dateString = date.format(scope.format);
        }, true);

        scope.dateStringChanged = function () {
          var date = moment(scope.dateString, scope.format, true);

          if (!date.isValid()) {
            return;
          }

          if (!scope.date) {
            scope.date = date.clone();
          } else {
            scope.date.year(date.year()).month(date.month()).date(date.date());
          }
        };
      }
    };
  }]);

  datePicker.directive('ktDateRangePicker', [function () {
    return {
      restrict: 'E',
      scope: {
        startDate: '=',
        endDate: '='
      },
      templateUrl: 'html/kt-date-range-picker.html',
      link: function (scope, element) {
        scope.element = element;

        scope.startDate = scope.startDate || moment().clone();
        scope.endDate = scope.endDate || moment().clone();

        scope.date = scope.startDate;

        scope.$on('datePicker:dateSelect', function (ev) {
          ev.stopPropagation();
          if (scope.date === scope.startDate) {
            scope.date = scope.endDate;
            return;
          }
          if (scope.date === scope.endDate) {
            scope.date = scope.startDate;
            return;
          }
        });
      }
    };
  }]);
})();
