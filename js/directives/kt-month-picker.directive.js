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
        require: 'ngModel',
        scope      : {
          minDate: '=',
          maxDate: '=',
          format : '@'
        },
        templateUrl: 'html/kt-month-picker.html',
        link       : function (scope, element, attributes, ngModelController) {
          scope.monthPicker = {
            year  : scope.date ? scope.date.year : moment().clone().year(),
            months: getMonths()
          };

          scope.date = ktDateBounds.getDateWithinBounds(
            scope.date, moment(scope.minDate, scope.format), moment(scope.maxDate, scope.format), 'month', '[]'
          );

          scope.$watch(function () {
            return ngModelController.$modelValue;
          }, function(newValue) {
            scope.date = moment(newValue, scope.format);
            scope.monthPicker.year = scope.date.year();
          });

          scope.isSelected = function (month) {
            return scope.date.year() === scope.monthPicker.year && scope.date.month() === month;
          };

          scope.isInMinMaxRange = function (month) {
            var date = moment().clone().year(scope.monthPicker.year).month(month);
            var minDate = scope.minDate ? moment(scope.minDate, scope.format) : undefined;
            var maxDate = scope.maxDate ? moment(scope.maxDate, scope.format) : undefined;

            return ktDateBounds.isDateWithinBounds(date, minDate, maxDate, 'month', '[]');
          };

          scope.selectMonth = function (month) {
            var minDate = scope.minDate ? moment(scope.minDate, scope.format) : undefined;
            var maxDate = scope.maxDate ? moment(scope.maxDate, scope.format) : undefined;

            scope.date = ktDateBounds.getDateWithinBounds(
              scope.date.clone().year(scope.monthPicker.year).month(month), minDate, maxDate, 'day', [], 'month'
            );

            ngModelController.$setViewValue(scope.format ? scope.date.format(scope.format) : scope.date);

            scope.$emit('monthPicker:monthSelect');
          };

          scope.previousYear = function () {
            scope.monthPicker.year = scope.monthPicker.year - 1;
          };

          scope.hasPreviousYear = function () {
            var date = moment({year: scope.monthPicker.year});
            date.subtract(1, 'year');
            var minDate = scope.minDate ? moment(scope.minDate, scope.format) : undefined;
            var maxDate = scope.maxDate ? moment(scope.maxDate, scope.format) : undefined;

            return ktDateBounds.isDateWithinBounds(date, minDate, maxDate, 'year', '[]');
          };

          scope.nextYear = function () {
            scope.monthPicker.year = scope.monthPicker.year + 1;
          };

          scope.hasNextYear = function () {
            var date = moment({year: scope.monthPicker.year});
            date.add(1, 'year');
            var minDate = scope.minDate ? moment(scope.minDate, scope.format) : undefined;
            var maxDate = scope.maxDate ? moment(scope.maxDate, scope.format) : undefined;

            return ktDateBounds.isDateWithinBounds(date, minDate, maxDate, 'year', []);
          };

          scope.yearClick = function () {
            scope.$emit('monthPicker:yearClick');
          };

          scope.canChooseYear = function () {
            return scope.hasPreviousYear() || scope.hasNextYear();
          };
        }
      };
    }]);
})();
