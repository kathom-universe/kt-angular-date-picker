(function () {
  'use strict';

  angular

    .module('kt.datePicker')

    .directive('ktYearPicker', ['ktDateBoundsService', function (ktDateBounds) {
      function getDecade(year) {
        var start = year - year % 10;
        var end = start + 9;

        return {
          start: start,
          end  : end
        }
      }

      function getYears(decade) {
        var years = [];

        for (var i = decade.start - 1; i <= decade.end + 1; i++) {
          years.push(i);
        }

        return years;
      }

      return {
        restrict   : 'E',
        require    : 'ngModel',
        templateUrl: 'html/kt-year-picker.html',
        scope      : {
          minDate: '=',
          maxDate: '=',
          format : '@'
        },
        link       : function (scope, element, attributes, ngModelController) {
          var decade = getDecade(scope.date ? scope.date.year() : moment().clone().year());

          scope.yearPicker = {
            decade: decade,
            years : getYears(decade)
          };

          scope.date = ktDateBounds.getMomentWithinBounds(scope.date, scope.minDate, scope.maxDate, {
            precision: 'year',
            inclusivity: '[]',
            format: scope.format
          });

          scope.$watch(function () {
            return ngModelController.$modelValue;
          }, function(newValue) {
            scope.date = moment(newValue, scope.format);
            if (scope.yearPicker.years.indexOf(scope.date.year()) === -1) {
              scope.yearPicker.decade = getDecade(scope.date.year());
              scope.yearPicker.years = getYears(scope.yearPicker.decade);
            }
          });

          scope.selectYear = function (year) {
            var date = scope.date.clone().year(year);

            scope.date = ktDateBounds.getMomentWithinBounds(date, scope.minDate, scope.maxDate, {
              precision: 'day',
              inclusivity: '[]',
              format: scope.format,
              roundTo: 'year'
            });

            ngModelController.$setViewValue(scope.format ? scope.date.format(scope.format) : scope.date);

            scope.$emit('yearPicker:yearSelect');
          };

          scope.previousDecade = function () {
            scope.yearPicker.decade.start -= 10;
            scope.yearPicker.decade.end -= 10;
            scope.yearPicker.years = getYears(scope.yearPicker.decade);
          };

          scope.hasPreviousDecade = function () {
            var date = moment().clone().year(scope.yearPicker.years[0]);
            date.subtract(1, 'years');
            return ktDateBounds.isDateWithinBounds(date, scope.minDate, scope.maxDate, {
              precision: 'year', inclusivity: '[]', format: scope.format
            });
          };

          scope.nextDecade = function () {
            scope.yearPicker.decade.start += 10;
            scope.yearPicker.decade.end += 10;
            scope.yearPicker.years = getYears(scope.yearPicker.decade);
          };

          scope.hasNextDecade = function () {
            var date = moment().clone().year(scope.yearPicker.years[0]);
            date.add(10, 'years');
            return ktDateBounds.isDateWithinBounds(date, scope.minDate, scope.maxDate, {
              precision: 'year', inclusivity: '[]', format: scope.format
            });
          };

          scope.isSelected = function (year) {
            if (!scope.date) {
              return false;
            }

            return year === scope.date.year();
          };

          scope.isOverflowing = function (year) {
            return year < scope.yearPicker.decade.start || year > scope.yearPicker.decade.end;
          };

          scope.isInMinMaxRange = function (year) {
            var date = moment().clone().year(year);
            var minDate = scope.minDate ? moment(scope.minDate, scope.format) : undefined;
            var maxDate = scope.maxDate ? moment(scope.maxDate, scope.format) : undefined;

            return ktDateBounds.isDateWithinBounds(date, minDate, maxDate, {precision: 'year', inclusivity: '[]'});
          };
        }
      };
    }]);
})();
