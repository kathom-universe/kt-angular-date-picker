(function () {
  'use strict';

  var monthPicker = angular.module('kt.datePicker');

  monthPicker.directive('ktMonthPicker', [function () {
    var months;

    function getMonths() {
      if (!months) {
        months = [];
        for (var i = 0; i < 12; i++) {
          months.push(i);
        }
      }

      return months;
    }

    return {
      restrict: 'E',
      scope: {
        date: '='
      },
      templateUrl: 'html/kt-month-picker.html',
      link: function (scope) {
        scope.monthPicker = {
          year: scope.date ? scope.date.year : moment().clone().year(),
          months: getMonths()
        };

        scope.$watch('date', function (date) {
          if (!date) {
            date = moment().clone();
          }

          scope.monthPicker.year = date.year();
        }, true);

        scope.isSelected = function (month) {
          if (!scope.date) {
            return false;
          }

          return scope.date.year() === scope.monthPicker.year && scope.date.month() === month;
        };

        scope.selectMonth = function (month) {
          if (!scope.date) {
            scope.date = moment().clone().year(scope.monthPicker.year).month(month);
          } else {
            scope.date.year(scope.monthPicker.year).month(month);
          }

          var parentElement = scope.$parent.element ? scope.$parent.element : undefined;

          if (parentElement && parentElement.prop('tagName').toLowerCase() === 'kt-date-picker') {
            scope.$emit('monthPicker:monthSelect');
          }
        };

        scope.previousYear = function () {
          scope.monthPicker.year = scope.monthPicker.year - 1;
        };

        scope.nextYear = function () {
          scope.monthPicker.year = scope.monthPicker.year + 1;
        };

        scope.yearClick = function () {
          var parentElement = scope.$parent.element ? scope.$parent.element : undefined;

          if (parentElement && parentElement.prop('tagName').toLowerCase() === 'kt-date-picker') {
            scope.$emit('monthPicker:yearClick');
          }
        };
      }
    };
  }]);
})();
