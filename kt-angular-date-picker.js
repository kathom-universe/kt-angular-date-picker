(function (){
  'use strict';


  var util = angular.module('kt.datePicker');

  util.directive('ktDatePickerNextIcon', function () {
    return {
      restrict: 'E',
      template: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><path d="M9 3L7.94 4.06l4.19 4.19H3v1.5h9.13l-4.19 4.19L9 15l6-6z"></path></svg>'
    };
  });

  util.directive('ktDatePickerPreviousIcon', function () {
    return {
      restrict: 'E',
      template: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><path d="M15 8.25H5.87l4.19-4.19L9 3 3 9l6 6 1.06-1.06-4.19-4.19H15v-1.5z"></path></svg>'
    };
  });

  util.factory('ktDatePickerService', function () {
    var service = {};

    service.isDateWithinBounds = function (date, minDate, maxDate, precision, inclusivity) {
      if (minDate && maxDate && minDate.isAfter(maxDate, precision)) {
        return true;
      }

      if (minDate && maxDate) {
        return date.isBetween(minDate, maxDate, precision, inclusivity);
      }

      if (minDate && !maxDate) {
        return date.isSameOrAfter(minDate, precision);
      }

      if (!minDate && maxDate) {
        return date.isSameOrBefore(maxDate, precision);
      }

      return true;
    }

    service.getDateWithinBounds = function (date, minDate, maxDate, precision, inclusivity, roundTo) {
      if (angular.isUndefined(date)) {
        date = moment().clone();
      }

      if (service.isDateWithinBounds(date, minDate, maxDate, precision, inclusivity)) {
        return date.clone();
      }

      switch (roundTo) {
        case 'month': return date.date(1);
        case 'year': return date.dayOfYear(1);
      }

      return angular.isDefined(minDate) ? minDate.clone() : maxDate.clone();
    };

    return service;
  });




  var datePicker = angular.module('kt.datePicker', ['kt.util.style', 'kt.dropdown']);

  datePicker.directive('ktDatePicker', [function () {
    return {
      restrict: 'E',
      scope: {
        date: '=',
        minDate: '=',
        maxDate: '='
      },
      template:
      '<kt-day-picker date="$parent.date" min-date="$parent.minDate" max-date="$parent.maxDate" ng-if="isCurrentPicker(\'day\')"></kt-day-picker>' +
      '<kt-month-picker date="$parent.date" min-date="$parent.minDate" max-date="$parent.maxDate" ng-if="isCurrentPicker(\'month\')"></kt-month-picker>' +
      '<kt-year-picker date="$parent.date" min-date="$parent.minDate" max-date="$parent.maxDate" ng-if="isCurrentPicker(\'year\')"></kt-year-picker> ',
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
      template:
        '<input type="text" ng-model="dateString" ng-change="dateStringChanged()" kt-dropdown=".ktDatePickerInput_{{instanceCount}}">' +
        '<kt-date-picker class="ktDatePickerInput_{{instanceCount}}" date="date" min-date="minDate" max-date="maxDate"></kt-date-picker>',
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





  var dateRangePicker = angular.module('kt.datePicker');

  dateRangePicker.directive('ktDateRangePicker', ['ktDatePickerService',  function (datePickerService) {
    return {
      restrict: 'E',
      scope: {
        startDate: '=',
        endDate: '=',
        minDate: '=',
        maxDate: '='
      },
      templateUrl: 'html/kt-date-range-picker.html',
      link: function (scope, element) {
        scope.element = element;
        var currentPicker = 'start';

        scope.startDate =  datePickerService.getDateWithinBounds(scope.startDate, scope.minDate, scope.maxDate);
        scope.endDate =  datePickerService.getDateWithinBounds(scope.endDate, scope.minDate, scope.maxDate);

        scope.$watch('startDate', function (startDate) {
          scope.endDate = datePickerService.getDateWithinBounds(scope.endDate, startDate, scope.maxDate, 'day', '[]');
        }, true);

        scope.$on('datePicker:dateSelect', function (ev) {
          ev.stopPropagation();

          currentPicker = currentPicker === 'start' ? 'end' : 'start';
        });

        scope.isCurrentPicker = function (picker) {
          return currentPicker === picker;
        };

        scope.setCurrentPicker = function (picker) {
          currentPicker = picker;
        }
      }
    };
  }]);

  dateRangePicker.directive('ktDateRangePickerInput', ['ktDatePickerService', function (datePickerService) {
    var instanceCount = 0;

    return {
      restrict: 'E',
      scope: {
        startDate: '=',
        endDate: '=',
        minDate: '=',
        maxDate: '=',
        format: '@',
        divider: '@'
      },
      template:
      '<input type="text" ng-model="dateRangeString" ng-change="dateRangeStringChanged()" kt-dropdown=".ktDateRangePickerInput_{{instanceCount}}">' +
      '<kt-date-range-picker class="ktDateRangePickerInput_{{instanceCount}}" start-date="startDate" end-date="endDate" min-date="minDate" max-date="maxDate"></kt-date-range-picker>',
      link: function (scope) {
        scope.instanceCount = instanceCount++;
        scope.dateRangeString = '';

        scope.startDate =  datePickerService.getDateWithinBounds(scope.startDate, scope.minDate, scope.maxDate);
        scope.endDate =  datePickerService.getDateWithinBounds(scope.endDate, scope.minDate, scope.maxDate);

        scope.$watch('[startDate, endDate]', function (dates) {
          scope.dateRangeString = dates[0].format(scope.format) + scope.divider + dates[1].format(scope.format);
        }, true);

        scope.dateRangeStringChanged = function () {
          var dates = scope.dateRangeString.split(scope.divider);

          if (dates.length !== 2) {
            return;
          }

          var startDate = moment(dates[0], scope.format, true);
          var endDate = moment(dates[1], scope.format, true);

          if (!startDate.isValid() || !endDate.isValid()) {
            return;
          }

          if (
            !datePickerService.isDateWithinBounds(startDate, scope.minDate, scope.maxDate, null, '[]') ||
            !datePickerService.isDateWithinBounds(endDate, startDate, scope.maxDate, null, '[]')
          ) {
            return;
          }

          scope.startDate.year(startDate.year()).month(startDate.month()).date(startDate.date());
          scope.endDate.year(endDate.year()).month(endDate.month()).date(endDate.date());
        };
      }
    };
  }]);




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

  dayPicker.directive('ktDayPicker', ['ktDayPickerSvc', 'ktDatePickerService', function (dayPickerService, datePickerService) {
    return {
      restrict: 'E',
      templateUrl: 'html/kt-day-picker.html',
      scope: {
        date: '=',
        minDate: '=',
        maxDate: '='
      },
      link: function (scope) {
        scope.dayPicker = {
          month: undefined,
          year: undefined,
          weeks: undefined,
          dayHeaders: dayPickerService.getDayHeaders()
        };

        scope.date = datePickerService.getDateWithinBounds(scope.date, scope.minDate, scope.maxDate, 'day', '[]');

        scope.$watch('date', function (date) {
          resetDayPicker(date);
        }, true);

        scope.selectDate = function (date) {
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

        scope.hasPreviousMonth = function () {
          var date = moment({year: scope.dayPicker.year, month: scope.dayPicker.month});
          date.subtract(1, 'months');
          return datePickerService.isDateWithinBounds(date, scope.minDate, scope.maxDate, 'month', []);
        };

        scope.nextMonth = function () {
          var date = moment({year: scope.dayPicker.year, month: scope.dayPicker.month});
          date.add(1, 'months');
          resetDayPicker(date);
        };

        scope.hasNextMonth = function () {
          var date = moment({year: scope.dayPicker.year, month: scope.dayPicker.month});
          date.add(1, 'months');
          return datePickerService.isDateWithinBounds(date, scope.minDate, scope.maxDate, 'month', []);
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

        scope.isInMinMaxRange = function (date) {
          return datePickerService.isDateWithinBounds(date, scope.minDate, scope.maxDate, 'day', '[]');
        };

        scope.monthClick = function () {
          var parentElement = scope.$parent.element ? scope.$parent.element : undefined;

          if (parentElement && parentElement.prop('tagName').toLowerCase() === 'kt-date-picker') {
            scope.$emit('dayPicker:monthClick');
          }
        };

        scope.canChooseMonth = function () {
          var parentElement = scope.$parent.element ? scope.$parent.element : undefined;

          if (parentElement && parentElement.prop('tagName').toLowerCase() === 'kt-date-picker' && (scope.hasPreviousMonth() || scope.hasNextMonth())) {
            return true;
          }

          return false;
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
          scope.dayPicker.weeks = dayPickerService.getWeeksInMonth(scope.dayPicker.year, scope.dayPicker.month);
        }
      }
    };
  }]);





  var monthPicker = angular.module('kt.datePicker');

  monthPicker.directive('ktMonthPicker', ['ktDatePickerService', function (datePickerService) {
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

    function getDateWithinBounds(date, minDate, maxDate) {
      var dateWithinBounds = datePickerService.getDateWithinBounds(date, minDate, maxDate, 'day', '[]');
    }

    return {
      restrict: 'E',
      scope: {
        date: '=',
        minDate: '=',
        maxDate: '='
      },
      templateUrl: 'html/kt-month-picker.html',
      link: function (scope) {
        scope.monthPicker = {
          year: scope.date ? scope.date.year : moment().clone().year(),
          months: getMonths()
        };

        scope.date = datePickerService.getDateWithinBounds(scope.date, scope.minDate, scope.maxDate, 'month', '[]');

        scope.$watch('date', function (date) {
          scope.monthPicker.year = date.year();
        }, true);

        scope.isSelected = function (month) {
          return scope.date.year() === scope.monthPicker.year && scope.date.month() === month;
        };

        scope.isInMinMaxRange = function (month) {
          var date = moment().clone().year(scope.monthPicker.year).month(month);
          return datePickerService.isDateWithinBounds(date, scope.minDate, scope.maxDate, 'month', '[]');
        };

        scope.selectMonth = function (month) {
          var date = datePickerService.getDateWithinBounds(
            scope.date.clone().year(scope.monthPicker.year).month(month), scope.minDate, scope.maxDate, 'day', [], 'month'
          );

          scope.date.year(date.year()).month(date.month()).date(date.date());

          var parentElement = scope.$parent.element ? scope.$parent.element : undefined;

          if (parentElement && parentElement.prop('tagName').toLowerCase() === 'kt-date-picker') {
            scope.$emit('monthPicker:monthSelect');
          }
        };

        scope.previousYear = function () {
          scope.monthPicker.year = scope.monthPicker.year - 1;
        };

        scope.hasPreviousYear = function () {
          var date = moment({year: scope.monthPicker.year});
          date.subtract(1, 'year');
          return datePickerService.isDateWithinBounds(date, scope.minDate, scope.maxDate, 'year', []);
        };

        scope.nextYear = function () {
          scope.monthPicker.year = scope.monthPicker.year + 1;
        };

        scope.hasNextYear = function () {
          var date = moment({year: scope.monthPicker.year});
          date.add(1, 'year');
          return datePickerService.isDateWithinBounds(date, scope.minDate, scope.maxDate, 'year', []);
        };

        scope.yearClick = function () {
          var parentElement = scope.$parent.element ? scope.$parent.element : undefined;

          if (parentElement && parentElement.prop('tagName').toLowerCase() === 'kt-date-picker') {
            scope.$emit('monthPicker:yearClick');
          }
        };

        scope.canChooseYear = function () {
          var parentElement = scope.$parent.element ? scope.$parent.element : undefined;

          if (parentElement && parentElement.prop('tagName').toLowerCase() === 'kt-date-picker' && (scope.hasPreviousYear() || scope.hasNextYear())) {
            return true;
          }

          return false;
        };
      }
    };
  }]);





  var timePicker = angular.module('kt.datePicker');

  timePicker.directive('ktTimePicker', [function () {
    var hours, minutes;

    function getHours() {
      if (!hours) {
        hours = [];
        for (var i = 0; i < 24; i++) {
          hours.push(i);
        }
      }

      return hours;
    }

    function getMinutes() {
      if (!minutes) {
        minutes = [];
        for (var i = 0; i < 60; i++) {
          minutes.push(i);
        }
      }

      return minutes;
    }

    return {
      restrict: 'E',
      templateUrl: 'html/kt-time-picker.html',
      scope: {
        date: '='
      },
      link: function (scope) {
        scope.timePicker = {
          hours: getHours(),
          minutes: getMinutes()
        };

        scope.isHourSelected = function (hour) {
          if (!scope.date) {
            return false;
          }

          return scope.date.hour() === hour;
        };

        scope.isMinuteSelected = function (minute) {
          if (!scope.date) {
            return false;
          }

          return scope.date.minute() === minute;
        };

        scope.selectHour = function (hour) {
          if (!scope.date) {
            scope.date = moment().clone().hour(hour);
          } else {
            scope.date.hour(hour);
          }
        };

        scope.selectMinute = function (minute) {
          if (!scope.date) {
            scope.date = moment().clone().minute(minute);
          } else {
            scope.date.minute(minute);
          }
        };
      }
    };
  }]);

  timePicker.directive('ktTimePickerInput', [function () {
    var instanceCount = 0;

    return {
      restrict: 'E',
      scope: {
        date: '=',
        format: '@'
      },
      template:
      '<input type="text" ng-model="timeString" ng-change="timeStringChanged()" kt-dropdown=".ktTimePickerInput_{{instanceCount}}">' +
      '<kt-time-picker class="ktTimePickerInput_{{instanceCount}}" date="date"></kt-time-picker>',
      link: function (scope) {
        scope.instanceCount = instanceCount++;
        scope.timeString = '';

        scope.$watch('date', function (date) {
          if (!date) {
            return;
          }

          scope.timeString = date.format(scope.format);
        }, true);

        scope.timeStringChanged = function () {
          var date = moment(scope.timeString, scope.format, true);

          if (!date.isValid()) {
            return;
          }

          if (!scope.date) {
            scope.date = date.clone();
          } else {
            scope.date.hour(date.hour()).minute(date.minute());
          }
        };
      }
    };
  }]);





  var yearPicker = angular.module('kt.datePicker');

  yearPicker.directive('ktYearPicker', ['ktDatePickerService', function (datePickerService) {
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
        date: '=',
        minDate: '=',
        maxDate: '='
      },
      link: function (scope) {
        var decade = getDecade(scope.date ? scope.date.year() : moment().clone().year());

        scope.yearPicker = {
          decade: decade,
          years: getYears(decade)
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


angular.module('kt.datePicker').run(['$templateCache', function($templateCache) {
  $templateCache.put("html/kt-date-range-picker.html",
    "<div>\n" +
    "    <div class=\"kt-date-range-picker-header\" style=\"display: table; width: 100%\">\n" +
    "        <button ng-click=\"setCurrentPicker('start')\" ng-class=\"{'kt-date-range-picker-active-range': isCurrentPicker('start')}\">{{startDate.format('DD.MM.YYYY')}}</button>\n" +
    "        <button ng-click=\"setCurrentPicker('end')\" ng-class=\"{'kt-date-range-picker-active-range': isCurrentPicker('end')}\">{{endDate.format('DD.MM.YYYY')}}</button>\n" +
    "    </div>\n" +
    "    <kt-date-picker date=\"$parent.startDate\" min-date=\"$parent.minDate\" max-date=\"$parent.maxDate\" ng-if=\"isCurrentPicker('start')\"></kt-date-picker>\n" +
    "    <kt-date-picker date=\"$parent.endDate\" min-date=\"$parent.startDate\" max-date=\"$parent.maxDate\" ng-if=\"isCurrentPicker('end')\"></kt-date-picker>\n" +
    "</div>");
  $templateCache.put("html/kt-day-picker.html",
    "<div>\n" +
    "  <div class=\"kt-date-picker-header\">\n" +
    "    <button type=\"button\" ng-click=\"previousMonth()\" ng-disabled=\"!hasPreviousMonth()\"><kt-date-picker-previous-icon></kt-date-picker-previous-icon></button>\n" +
    "    <button type=\"button\" ng-click=\"monthClick()\" ng-disabled=\"!canChooseMonth()\">{{dayPicker.month | monthFormat}} {{dayPicker.year}}</button>\n" +
    "    <button type=\"button\" ng-click=\"nextMonth()\" ng-disabled=\"!hasNextMonth()\"><kt-date-picker-next-icon></kt-date-picker-next-icon></button>\n" +
    "  </div>\n" +
    "  <div class=\"kt-date-picker-content\">\n" +
    "    <div class=\"kt-day-picker-row\">\n" +
    "      <div class=\"kt-day-picker-day\" ng-repeat=\"dayHeader in dayPicker.dayHeaders\">\n" +
    "        {{dayHeader}}\n" +
    "      </div>\n" +
    "    </div>\n" +
    "    <div class=\"kt-day-picker-row\" ng-repeat=\"week in dayPicker.weeks\">\n" +
    "      <div class=\"kt-day-picker-cell\"\n" +
    "           ng-repeat=\"date in week.dates\"\n" +
    "           ng-class=\"{'kt-date-picker-selected': isSelected(date), 'kt-date-picker-overflow': isOverflowing(date)}\">\n" +
    "        <button type=\"button\" ng-click=\"selectDate(date)\" ng-disabled=\"!isInMinMaxRange(date)\">\n" +
    "          {{date.format('D')}}\n" +
    "        </button>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"kt-date-picker-footer\"></div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("html/kt-month-picker.html",
    "<div>\n" +
    "  <div class=\"kt-date-picker-header\">\n" +
    "    <button type=\"button\" ng-click=\"previousYear()\" ng-disabled=\"!hasPreviousYear()\"><kt-date-picker-previous-icon></kt-date-picker-previous-icon></button>\n" +
    "    <button type=\"button\" ng-click=\"yearClick()\" ng-disabled=\"!canChooseYear()\">{{monthPicker.year}}</button>\n" +
    "    <button type=\"button\" ng-click=\"nextYear()\" ng-disabled=\"!hasNextYear()\"><kt-date-picker-next-icon></kt-date-picker-next-icon></button>\n" +
    "  </div>\n" +
    "  <div class=\"kt-date-picker-content\">\n" +
    "    <div class=\"kt-month-picker-cell\"\n" +
    "         ng-repeat=\"month in monthPicker.months\"\n" +
    "         ng-class=\"{'kt-date-picker-selected': isSelected(month)}\">\n" +
    "      <button type=\"button\" ng-click=\"selectMonth(month)\" ng-disabled=\"!isInMinMaxRange(month)\">{{month | monthFormat}}</button>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"kt-date-picker-footer\"></div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("html/kt-time-picker.html",
    "<div>\n" +
    "  <div class=\"kt-date-picker-header\">\n" +
    "    <div>Hour</div>\n" +
    "    <div>Minute</div>\n" +
    "  </div>\n" +
    "  <div class=\"kt-date-picker-content\">\n" +
    "    <div class=\"kt-time-picker-outer\">\n" +
    "      <div class=\"kt-time-picker-inner\" kt-hide-scrollbar>\n" +
    "        <div class=\"kt-time-picker-cell\"\n" +
    "             ng-repeat=\"hour in timePicker.hours\"\n" +
    "             ng-class=\"{'kt-date-picker-selected': isHourSelected(hour)}\">\n" +
    "          <button type=\"button\" ng-click=\"selectHour(hour)\">{{hour}}</button>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "    <div class=\"kt-time-picker-outer\">\n" +
    "      <div class=\"kt-time-picker-inner\" kt-hide-scrollbar>\n" +
    "        <div class=\"kt-time-picker-cell\"\n" +
    "             ng-repeat=\"minute in timePicker.minutes\"\n" +
    "             ng-class=\"{'kt-date-picker-selected': isMinuteSelected(minute)}\">\n" +
    "          <button type=\"button\" ng-click=\"selectMinute(minute)\">{{minute}}</button>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"kt-date-picker-footer\"></div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("html/kt-year-picker.html",
    "<div>\n" +
    "  <div class=\"kt-date-picker-header\">\n" +
    "    <button type=\"button\" ng-click=\"previousDecade()\" ng-disabled=\"!hasPreviousDecade()\"><kt-date-picker-previous-icon></kt-date-picker-previous-icon></button>\n" +
    "    <button type=\"button\" disabled=\"disabled\">{{yearPicker.decade.start}} - {{yearPicker.decade.end}}</button>\n" +
    "    <button type=\"button\" ng-click=\"nextDecade()\" ng-disabled=\"!hasNextDecade()\"><kt-date-picker-next-icon></kt-date-picker-next-icon></button>\n" +
    "  </div>\n" +
    "  <div class=\"kt-date-picker-content\">\n" +
    "    <div class=\"kt-year-picker-cell\"\n" +
    "         ng-repeat=\"year in yearPicker.years\"\n" +
    "         ng-class=\"{'kt-date-picker-selected': isSelected(year), 'kt-date-picker-overflow': isOverflowing(year)}\">\n" +
    "      <button type=\"button\" ng-click=\"selectYear(year)\" ng-disabled=\"!isInMinMaxRange(year)\">{{year}}</button>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"kt-date-picker-footer\"></div>\n" +
    "</div>\n" +
    "");
}]);
})();
