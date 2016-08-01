(function () {
  'use strict';

  var yearPicker = angular.module('kt.datePicker');

  yearPicker.directive('ktYearPicker', [function () {
    function getDecade(year) {
      var start = year - year % 10;
      var end = start + 9;

      return {
        start: start,
        end: end
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
      restrict: 'E',
      templateUrl: 'html/kt-year-picker.html',
      scope: {
        date: '='
      },
      link: function (scope) {
        var decade = getDecade(scope.date ? scope.date.year() : moment().clone().year());

        scope.yearPicker = {
          decade: decade,
          years: getYears(decade)
        };

        scope.$watch('date', function (date) {
          if (!date) {
            date = moment().clone();
          }

          if (scope.yearPicker.years.indexOf(date.year()) === -1) {
            scope.yearPicker.decade = getDecade(date.year());
            scope.yearPicker.years = getYears(scope.yearPicker.decade);
          }
        }, true);

        scope.selectYear = function (year) {
          if (!scope.date) {
            scope.date = moment().clone().year(year);
          } else {
            scope.date.year(year);
          }

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

        scope.nextDecade = function () {
          scope.yearPicker.decade.start += 10;
          scope.yearPicker.decade.end += 10;
          scope.yearPicker.years = getYears(scope.yearPicker.decade);
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
      }
    };
  }]);
})();
