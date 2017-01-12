(function () {
  'use strict';

  angular

    .module('kt.datePicker')

    .directive('ktYearPicker', ['ktDatePickerService', function (datePickerService) {
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
        templateUrl: 'html/kt-year-picker.html',
        scope      : {
          date   : '=',
          minDate: '=',
          maxDate: '='
        },
        link       : function (scope) {
          var decade = getDecade(scope.date ? scope.date.year() : moment().clone().year());

          scope.yearPicker = {
            decade: decade,
            years : getYears(decade)
          };

          scope.date = datePickerService.getDateWithinBounds(scope.date, scope.minDate, scope.maxDate, 'year', '[]');

          scope.$watch('date', function (date) {
            if (scope.yearPicker.years.indexOf(date.year()) === -1) {
              scope.yearPicker.decade = getDecade(date.year());
              scope.yearPicker.years = getYears(scope.yearPicker.decade);
            }
          }, true);

          scope.selectYear = function (year) {
            var date = datePickerService.getDateWithinBounds(
              scope.date.clone().year(year), scope.minDate, scope.maxDate, 'day', [], 'year'
            );

            scope.date.year(date.year()).month(date.month()).date(date.date());

            var parentElement = scope.$parent.element ? scope.$parent.element : undefined;
            if (parentElement && parentElement.prop('tagName').toLowerCase() === 'kt-date-picker') {
              scope.$emit('yearPicker:yearSelect');
            }
          };

          scope.previousDecade = function () {
            scope.yearPicker.decade.start -= 10;
            scope.yearPicker.decade.end -= 10;
            scope.yearPicker.years = getYears(scope.yearPicker.decade);
          };

          scope.hasPreviousDecade = function () {
            var date = moment().clone().year(scope.yearPicker.years[0]);
            date.subtract(1, 'years');
            return datePickerService.isDateWithinBounds(date, scope.minDate, scope.maxDate, 'year', '[]');
          };

          scope.nextDecade = function () {
            scope.yearPicker.decade.start += 10;
            scope.yearPicker.decade.end += 10;
            scope.yearPicker.years = getYears(scope.yearPicker.decade);
          };

          scope.hasNextDecade = function () {
            var date = moment().clone().year(scope.yearPicker.years[0]);
            date.add(10, 'years');
            return datePickerService.isDateWithinBounds(date, scope.minDate, scope.maxDate, 'year', '[]');
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
            return datePickerService.isDateWithinBounds(date, scope.minDate, scope.maxDate, 'year', '[]')
          };
        }
      };
    }]);
})();
