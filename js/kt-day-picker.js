(function () {
  'use strict';

  var dayPicker = angular.module('kt.datePicker');

  dayPicker.filter('monthFormat', [function () {
    return function (input) {
      return moment.months()[input];
    };
  }]);

  dayPicker.factory('ktDayPickerSvc', [function () {
    var service = {};
    var dayHeaders;

    service.getNumberOfWeeksInMonth = function (year, month) {
      var date = moment().set({year: year, month: month});
      var startWeek = date.clone().startOf('month').week();
      var endWeek = date.clone().endOf('month').week();

      if (startWeek > endWeek) {
        endWeek = startWeek + endWeek;
      }

      return endWeek - startWeek + 1;
    };

    service.getWeekRangeForMonth = function (year, month) {
      var date = moment().set({year: year, month: month});
      var startWeek = date.clone().startOf('month').week();
      var endWeek = date.clone().endOf('month').week();

      if (startWeek > endWeek && startWeek < 10) {
        startWeek = 0;
      }

      if (startWeek > endWeek && startWeek > 40) {
        endWeek = date.weeksInYear() + endWeek;
      }

      return {
        startWeek: startWeek,
        endWeek: endWeek
      };
    };

    service.getDatesInWeek = function (year, month, week) {
      var date = moment().year(year).month(month).week(week);
      var days = [];
      for (var i = 0; i < 7; i++) {
        days.push(date.clone().weekday(i));
      }

      return days;
    };

    service.getWeeksInMonth = function (year, month) {
      var weeksInMonth = service.getWeekRangeForMonth(year, month);
      var weeks = [];
      for (var i = weeksInMonth.startWeek; i <= weeksInMonth.endWeek; i++) {
        weeks.push({week: i, dates: service.getDatesInWeek(year, month, i)});
      }

      return weeks;
    };

    service.getDayHeaders = function () {
      if (!dayHeaders) {
        dayHeaders = [];
        for (var i = 0; i < 7; i++) {
          dayHeaders.push(moment().clone().weekday(i).format('dd'));
        }
      }

      return dayHeaders;
    };

    return service;
  }]);

  dayPicker.directive('ktDayPicker', ['ktDayPickerSvc', function (service) {
    return {
      restrict: 'E',
      templateUrl: 'html/kt-day-picker.html',
      scope: {
        date: '='
      },
      link: function (scope) {
        scope.dayPicker = {
          month: undefined,
          year: undefined,
          weeks: undefined,
          dayHeaders: service.getDayHeaders()
        };

        scope.$watch('date', function (date) {
          if (!date) {
            date = moment().clone();
          }

          resetDayPicker(date);
        }, true);

        scope.selectDate = function (date) {
          if (!scope.date) {
            scope.date = date.clone();
          }
          scope.date.year(date.year()).month(date.month()).date(date.date());

          var parentElement = scope.$parent.element ? scope.$parent.element : undefined;

          if (parentElement && parentElement.prop('tagName').toLowerCase() === 'kt-date-picker') {
            scope.$emit('dayPicker:daySelect');
          }
        };

        scope.previousMonth = function () {
          var date = moment({year: scope.dayPicker.year, month: scope.dayPicker.month});
          date.subtract(1, 'months');
          resetDayPicker(date);
        };

        scope.nextMonth = function () {
          var date = moment({year: scope.dayPicker.year, month: scope.dayPicker.month});
          date.add(1, 'months');
          resetDayPicker(date);
        };

        scope.isSelected = function (date) {
          if (!scope.date) {
            return false;
          }

          return date.year() === scope.date.year()
            && date.month() === scope.date.month()
            && date.date() === scope.date.date();
        };

        scope.isOverflowing = function (date) {
          return date.month() !== scope.dayPicker.month;
        };

        scope.monthClick = function () {
          var parentElement = scope.$parent.element ? scope.$parent.element : undefined;

          if (parentElement && parentElement.prop('tagName').toLowerCase() === 'kt-date-picker') {
            scope.$emit('dayPicker:monthClick');
          }
        };


        scope.$on('monthPickerSelect', function (event, month) {
          var date = moment({year: scope.dayPicker.year, month: month});
          resetDayPicker(date);
        });

        function resetDayPicker(date) {
          if (scope.dayPicker.month === date.month() && scope.dayPicker.year === date.year()) {
            return;
          }

          scope.dayPicker.month = date.month();
          scope.dayPicker.year = date.year();
          scope.dayPicker.weeks = service.getWeeksInMonth(scope.dayPicker.year, scope.dayPicker.month);
        }
      }
    };
  }]);
})();
