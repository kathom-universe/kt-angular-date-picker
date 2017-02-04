(function () {
  'use strict';

  angular.module('kt.datePicker').directive('ktYearPicker', ['ktDateBoundsService', function (ktDateBounds) {
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
        require    : ['ngModel', '?^ktDatePicker'],
        templateUrl: 'html/kt-year-picker.html',
        scope      : {
          minDate: '=',
          maxDate: '=',
          format : '@'
        },
        link       : function (scope, element, attributes, controllers) {
          var ngModelController = controllers[0];
          var ktDatePicker = controllers[1];
          var decade = getDecade(scope.date ? scope.date.year() : moment().clone().year());
          var yearsPerRow = 3;

          function chunk(arr, size) {
            var newArr = [];
            for (var i = 0; i < arr.length; i += size) {
              newArr.push(arr.slice(i, i + size));
            }
            return newArr;
          }

          scope.yearPicker = {
            decade: decade,
            chunkedYears : chunk(getYears(decade), yearsPerRow)
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
            if (scope.date.year() < scope.yearPicker.decade.start || scope.date.year() > scope.yearPicker.decade.end) {
              scope.yearPicker.decade = getDecade(scope.date.year());
              scope.yearPicker.chunkedYears = chunk(getYears(scope.yearPicker.decade), yearsPerRow);
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

            if (ktDatePicker) {
              ktDatePicker.requestPicker('month');
            }
          };

          scope.previousDecade = function () {
            scope.yearPicker.decade.start -= 10;
            scope.yearPicker.decade.end -= 10;
            scope.yearPicker.chunkedYears = chunk(getYears(scope.yearPicker.decade), yearsPerRow);
          };

          scope.hasPreviousDecade = function () {
            var date = moment().clone().year(scope.yearPicker.decade.start);
            date.subtract(1, 'years');
            return ktDateBounds.isDateWithinBounds(date, scope.minDate, scope.maxDate, {
              precision: 'year', inclusivity: '[]', format: scope.format
            });
          };

          scope.nextDecade = function () {
            scope.yearPicker.decade.start += 10;
            scope.yearPicker.decade.end += 10;
            scope.yearPicker.chunkedYears = chunk(getYears(scope.yearPicker.decade), yearsPerRow);
          };

          scope.hasNextDecade = function () {
            var date = moment().clone().year(scope.yearPicker.decade.end);
            date.add(1, 'years');
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

            return ktDateBounds.isDateWithinBounds(date, scope.minDate, scope.maxDate, {
              precision: 'year', inclusivity: '[]', format: scope.format
            });
          };
        }
      };
    }]);

})();
