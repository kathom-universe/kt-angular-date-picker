(function () {
  'use strict';

  angular.module('kt.datePicker')

    .directive('ktMonthPicker', ['ktDateBoundsService', function (ktDateBounds) {
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
        restrict   : 'E',
        require: ['ngModel', '?^ktDatePicker'],
        scope      : {
          options: '='
        },
        templateUrl: 'html/kt-month-picker.html',
        link       : function (scope, element, attributes, controllers) {
          var ngModelController = controllers[0];
          var ktDatePicker = controllers[1];
          var monthsPerRow = 3;

          scope.options = scope.options || {};

          function chunk(arr, size) {
            var newArr = [];
            for (var i = 0; i < arr.length; i += size) {
              newArr.push(arr.slice(i, i + size));
            }
            return newArr;
          }

          scope.monthPicker = {
            year  : scope.date ? scope.date.year : moment().clone().year(),
            monthChunks: chunk(getMonths(), monthsPerRow)
          };

          scope.date = ktDateBounds.getMomentWithinBounds(scope.date, scope.options.minDate, scope.options.maxDate, {
            precision: 'month',
            inclusivity: '[]',
            format: scope.options.format
          });

          scope.$watch(function () {
            return ngModelController.$modelValue;
          }, function(newValue) {
            scope.date = moment(newValue, scope.options.format);
            scope.monthPicker.year = scope.date.year();
          });

          scope.isSelected = function (month) {
            return scope.date.year() === scope.monthPicker.year && scope.date.month() === month;
          };

          scope.isInMinMaxRange = function (month) {
            var date = moment().clone().year(scope.monthPicker.year).month(month);

            return ktDateBounds.isDateWithinBounds(date, scope.options.minDate, scope.options.maxDate, {
              precision: 'month', inclusivity: '[]', format: scope.options.format
            });
          };

          scope.selectMonth = function (month) {
            var date = scope.date.clone().year(scope.monthPicker.year).month(month);

            scope.date = ktDateBounds.getMomentWithinBounds(date, scope.options.minDate, scope.options.maxDate, {
              precision: 'day',
              inclusivity: '[]',
              format: scope.options.format,
              roundTo: 'month'
            });

            ngModelController.$setViewValue(scope.options.format ? scope.date.format(scope.options.format) : scope.date);

            if (ktDatePicker) {
              ktDatePicker.requestPicker('day');
            }
          };

          scope.previousYear = function () {
            scope.monthPicker.year = scope.monthPicker.year - 1;
          };

          scope.hasPreviousYear = function () {
            var date = moment({year: scope.monthPicker.year});
            date.subtract(1, 'year');

            return ktDateBounds.isDateWithinBounds(date, scope.options.minDate, scope.options.maxDate, {
              precision: 'year', inclusivity: '[]', format: scope.options.format
            });
          };

          scope.nextYear = function () {
            scope.monthPicker.year = scope.monthPicker.year + 1;
          };

          scope.hasNextYear = function () {
            var date = moment({year: scope.monthPicker.year});
            date.add(1, 'year');

            return ktDateBounds.isDateWithinBounds(date, scope.options.minDate, scope.options.maxDate, {
              precision: 'year', inclusivity: '[]', format: scope.options.format
            });
          };

          scope.yearClick = function () {
            if (ktDatePicker) {
              ktDatePicker.requestPicker('year');
            }
          };

          scope.canChooseYear = function () {
            return !!ktDatePicker && (scope.hasPreviousYear() || scope.hasNextYear());
          };
        }
      };
    }]);
})();
