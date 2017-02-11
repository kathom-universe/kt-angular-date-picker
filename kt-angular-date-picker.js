(function (){
  'use strict';

  angular.module('kt.datePicker', ['kt.util.style', 'kt.dropdown']);




  angular

    .module('kt.datePicker')

    .factory('ktDateBoundsService', function () {
      var service = {};

      function convertToMoment(date, format) {
        if (date instanceof moment || !date) {
          return date;
        }

        var dateMoment = moment(date, format, true);

        if (!dateMoment.isValid()) {
          throw new Error('Cannot convert ' + date.toString() + ' to moment using format \'' + format + '\'');
        }

        return moment(date, format);
      }

      service.isDateWithinBounds = function (date, minDate, maxDate, options) {
        var options = angular.extend({
          precision: undefined,
          inclusivity: undefined,
          format: undefined
        }, options);

        var dateMoment = convertToMoment(date, options.format);
        var minMoment = convertToMoment(minDate, options.format);
        var maxMoment = convertToMoment(maxDate, options.format);

        if (minMoment && maxMoment && minMoment.isAfter(maxMoment, options.precision)) {
          return true;
        }

        if (minMoment && maxMoment) {
          return dateMoment.isBetween(minMoment, maxMoment, options.precision, options.inclusivity);
        }

        if (minMoment && !maxMoment) {
          return dateMoment.isSameOrAfter(minMoment, options.precision);
        }

        if (!minMoment && maxMoment) {
          return dateMoment.isSameOrBefore(maxMoment, options.precision);
        }

        return true;
      };

      service.roundMoment = function (dateMoment, roundTo) {
        switch (roundTo) {
          case 'month': return dateMoment.clone().date(1);
          case 'year' : return dateMoment.clone().dayOfYear(1);
        }

        return dateMoment.clone();
      }

      service.getMomentWithinBounds = function (date, minDate, maxDate, options) {
        var options = angular.extend({
          precision: undefined,
          inclusivity: undefined,
          format: undefined,
          roundTo: undefined
        }, options);

        var dateMoment = convertToMoment(date, options.format);
        var minMoment = convertToMoment(minDate, options.format);
        var maxMoment = convertToMoment(maxDate, options.format);

        dateMoment = dateMoment ? dateMoment.clone() : moment().clone();

        if (service.isDateWithinBounds(dateMoment, minMoment, maxMoment, {
          precision: options.precision, inclusivity: options.inclusivity
        })) {
          return dateMoment;
        }

        if (options.roundTo) {
          return service.roundMoment(dateMoment, options.roundTo);
        }

        return angular.isDefined(minMoment) ? minMoment.clone() : maxMoment.clone();
      };

      return service;
    });





  angular.module('kt.datePicker').value('ktDateRanges', [
    {
      rangeName: 'past_week',
      start    : function () {
        return moment().clone().subtract(1, 'weeks');
      },
      end      : function () {
        return moment().clone();
      }
    },
    {
      rangeName   : 'past_month',
      start       : function () {
        return moment().clone().subtract(1, 'months');
      },
      end         : function () {
        return moment().clone();
      }
    },
    {
      rangeName: 'past_year',
      start    : function () {
        return moment().clone().subtract(1, 'year');
      },
      end      : function () {
        return moment().clone();
      }
    }
  ]);


  angular.module('kt.datePicker').value('ktDateRangeLocales', [
    {
      locale   : 'en',
      dateRange: {
        'past_week' : 'Past Week',
        'past_month': 'Past Month',
        'past_year' : 'Past Year',
        'custom'    : 'Custom'
      }
    },
    {
      locale   : 'de',
      dateRange: {
        'past_week' : 'Letzte 7 Tage',
        'past_month': 'Letzte 30 Tage',
        'past_year' : 'Letztes Jahr',
        'custom'    : 'Benutzerdefiniert'
      }
    }
  ]);


  angular.module('kt.datePicker').factory('ktDateRangeSvc', ['ktDateRanges', function (dateRanges) {
    var service = {};

    service.getDateRangeNames = function () {
      return dateRanges.map(function (dateRange) {
        return dateRange.rangeName;
      });
    };

    service.getDateRange = function (rangeName) {
      return dateRanges.filter(function (dateRange) {
        return dateRange.rangeName === rangeName;
      })[0];
    };

    return service;
  }])



  angular

    .module('kt.datePicker')

    .factory('ktDayPickerSvc', [function () {
      var service = {};
      var dayHeaders;

      function getWeekRangeForMonth(year, month) {
        var date = moment().set({year: year, month: month});
        var start = date.clone().startOf('month');
        var end = date.clone().endOf('month');

        var startWeek = start.week();
        var endWeek = end.week();

        if (start.weekYear() < end.weekYear()) {
          startWeek = month === 0 ? 0 : startWeek;
        }

        if (startWeek > endWeek && startWeek > 40) {
          endWeek = date.weeksInYear() + endWeek;
        }

        return {
          startWeek: startWeek,
          endWeek  : endWeek
        };
      }

      function getDatesInWeek(year, week) {
        var date = moment().year(year).week(week);
        var days = [];
        for (var i = 0; i < 7; i++) {
          days.push(date.clone().weekday(i));
        }

        return days;
      }

      service.getWeeksInMonth = function (year, month) {
        var weeksInMonth = getWeekRangeForMonth(year, month);
        var weeks = [];
        for (var i = weeksInMonth.startWeek; i <= weeksInMonth.endWeek; i++) {
          weeks.push({week: i, dates: getDatesInWeek(year, i)});
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




  angular.module('kt.datePicker').filter('ktDateRangeDisplay', ['ktDateRangeLocales', function (dateRangeLocales) {
    return function (rangeName) {
      var dateRangeLocale = dateRangeLocales.filter(function (dateRangeLocale) {
        return dateRangeLocale.locale === moment.locale();
      })[0];

      return dateRangeLocale.dateRange[rangeName];
    };
  }]);



  angular

    .module('kt.datePicker')

    .filter('monthFormat', [function () {
      return function (input) {
        return moment.months()[input];
      };
    }]);




  angular.module('kt.datePicker').directive('ktDatePickerIcon', function ($document, $templateCache) {
    var svg = angular.element($templateCache.get('html/kt-date-picker-icons.svg')).addClass('ng-hide');

    angular.element($document[0].body).append(svg);

    return {
      restrict: 'E',
      scope: {
        icon: '@'
      },
      template: '<svg><use xlink:href="{{icon}}"></use></svg>',
      link: function (scope, elem) {

      }
    };
  });




  angular

    .module('kt.datePicker')

    .directive('ktDatePicker', [function () {
      return {
        restrict   : 'E',
        scope      : {
          ngModel  : '=',
          minDate: '=',
          maxDate: '=',
          format : '@',
          onDateSelect: '&'
        },
        templateUrl: 'html/kt-date-picker.html',
        controller : function ($scope) {
          var currentPicker = 'day';

          this.requestPicker = function (picker) {
            $scope.setCurrentPicker(picker);
          };

          $scope.setCurrentPicker = function (picker) {
            currentPicker = picker;
          };

          $scope.isCurrentPicker = function (picker) {
            return currentPicker === picker;
          };
        }
      }
    }])

    .directive('ktDatePickerInput', ['ktDateBoundsService', function (ktDateBounds) {
      var instanceCount = 0;

      return {
        restrict   : 'E',
        scope      : {
          date   : '=',
          minDate: '=',
          maxDate: '=',
          format : '@'
        },
        templateUrl: 'html/kt-date-picker-input.html',
        link       : function (scope) {
          scope.instanceCount = instanceCount++;
          scope.dateString = '';

          scope.date = ktDateBounds.getDateWithinBounds(scope.date, scope.minDate, scope.maxDate);

          scope.$watch('date', function (date) {
            scope.dateString = date.format(scope.format);
          }, true);

          scope.dateStringChanged = function () {
            var date = moment(scope.dateString, scope.format, true);

            if (!date.isValid() || !ktDateBounds.isDateWithinBounds(date, scope.minDate, scope.maxDate, {inclusivity: '[]'})) {
              return;
            }

            scope.date.year(date.year()).month(date.month()).date(date.date());
          };
        }
      };
    }]);




  angular.module('kt.datePicker').directive('ktDateRangePicker', ['ktDateBoundsService', function (ktDateBounds) {
    return {
      restrict   : 'E',
      scope      : {
        startDate: '=',
        endDate  : '=',
        minDate  : '=',
        maxDate  : '=',
        format   : '@',
        options  : '='
      },
      templateUrl: 'html/kt-date-range-picker.html',
      controller : function ($scope) {
        // var currentPicker = $scope.options.ranges ? 'range' : 'start';
        var currentPicker = 'start';

        this.requestNextRange = function () {
          currentPicker = currentPicker === 'start' ? 'end' : 'start';
        };

        this.requestCustomRange = function () {
          currentPicker = 'start';
        };

        $scope.$watch('startDate', function (startDate) {
          var date = ktDateBounds.getMomentWithinBounds($scope.endDate, startDate, $scope.maxDate, {
            precision  : 'day',
            inclusivity: '[]',
            format     : $scope.format
          });
          $scope.endDate = $scope.format ? date.format($scope.format) : date;
        });

        $scope.isCurrentPicker = function (picker) {
          return currentPicker === picker;
        };

        $scope.setCurrentPicker = function (picker) {
          currentPicker = picker;
        };

        $scope.getDisplayedDate = function (date) {
          return moment(date, $scope.format).format('D. MMMM YYYY');
        }
      }
    };
  }]);


  angular.module('kt.datePicker').directive('ktDateRangeSelect', ['ktDateRangeSvc', function (dateRangeSvc) {
    return {
      restrict   : 'E',
      require    : '^?ktDateRangePicker',
      scope      : {
        startDate: '=',
        endDate  : '=',
        format   : '@',
        options  : '='
      },
      templateUrl: 'html/kt-date-range-select.html',
      link: function (scope, elem, attrs, ktDateRangePicker) {
        scope.ranges = scope.options.ranges;

        scope.setRange = function (rangeName) {
          if (rangeName === 'custom') {
            ktDateRangePicker.requestCustomRange();
            return;
          }

          var range = dateRangeSvc.getDateRange(rangeName);

          scope.startDate = range.start();
          scope.endDate = range.end();
        };
      }
    };
  }]);


  angular.module('kt.datePicker').directive('ktDateRangePickerInput', ['ktDateBoundsService', function (ktDateBounds) {
    var instanceCount = 0;

    return {
      restrict   : 'E',
      scope      : {
        startDate: '=',
        endDate  : '=',
        minDate  : '=',
        maxDate  : '=',
        format   : '@',
        divider  : '@'
      },
      templateUrl: 'html/kt-date-range-picker-input.html',
      link       : function (scope) {
        scope.instanceCount = instanceCount++;
        scope.dateRangeString = '';

        scope.startDate = ktDateBounds.getDateWithinBounds(scope.startDate, scope.minDate, scope.maxDate);
        scope.endDate = ktDateBounds.getDateWithinBounds(scope.endDate, scope.minDate, scope.maxDate);

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
            !ktDateBounds.isDateWithinBounds(startDate, scope.minDate, scope.maxDate, {inclusivity: '[]'}) || !ktDateBounds.isDateWithinBounds(endDate, startDate, scope.maxDate, {inclusivity: '[]'})
          ) {
            return;
          }

          scope.startDate.year(startDate.year()).month(startDate.month()).date(startDate.date());
          scope.endDate.year(endDate.year()).month(endDate.month()).date(endDate.date());
        };
      }
    };
  }]);




  function ktDayHeader(dayPickerService) {
    return {
      restrict: 'E',
      templateUrl: 'html/kt-day-header.html',
      controller: function ($scope) {
        $scope.dayHeaders = dayPickerService.getDayHeaders()
      }
    };
  }

  ktDayHeader.$inject = ['ktDayPickerSvc'];

  angular.module('kt.datePicker').directive('ktDayHeader', ktDayHeader);



  function ktDayPicker(dayPickerService, ktDateBounds) {
    return {
      restrict   : 'E',
      require    : ['ngModel', '?^ktDatePicker', '^^?ktDateRangePicker'],
      templateUrl: 'html/kt-day-picker.html',
      scope      : {
        minDate: '=',
        maxDate: '=',
        format : '@'
      },
      link       : function (scope, element, attributes, controllers) {
        var ngModelController = controllers[0];
        var ktDatePicker = controllers[1];
        var ktDateRangePicker = controllers[2];

        scope.dayPicker = {
          month: undefined,
          year : undefined,
          weeks: undefined
        };

        scope.date = ktDateBounds.getMomentWithinBounds(scope.date, scope.minDate, scope.maxDate, {
          precision: 'day',
          inclusivity: '[]',
          format: scope.format
        });

        scope.$watch(function () {
          return ngModelController.$modelValue;
        }, function(newValue) {
          scope.date = moment(newValue, scope.format);
          resetDayPicker(scope.date);
        });

        scope.selectDate = function (date) {
          scope.date.year(date.year()).month(date.month()).date(date.date());
          ngModelController.$setViewValue(scope.format ? scope.date.format(scope.format) : scope.date);

          if (ktDateRangePicker) {
            ktDateRangePicker.requestNextRange();
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
          return ktDateBounds.isDateWithinBounds(date, scope.minDate, scope.maxDate, {
            precision: 'month', inclusivity: '[]', format: scope.format
          });
        };

        scope.nextMonth = function () {
          var date = moment({year: scope.dayPicker.year, month: scope.dayPicker.month});
          date.add(1, 'months');
          resetDayPicker(date);
        };

        scope.hasNextMonth = function () {
          var date = moment({year: scope.dayPicker.year, month: scope.dayPicker.month});
          date.add(1, 'months');
          return ktDateBounds.isDateWithinBounds(date, scope.minDate, scope.maxDate, {
            precision: 'month', inclusivity: '[]', format: scope.format
          });
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
          return ktDateBounds.isDateWithinBounds(date, scope.minDate, scope.maxDate, {
            precision: 'day', inclusivity: '[]', format: scope.format
          });
        };

        scope.monthClick = function () {
          if (ktDatePicker) {
            ktDatePicker.requestPicker('month');
          }
        };

        scope.canChooseMonth = function () {
          return !!ktDatePicker && (scope.hasPreviousMonth() || scope.hasNextMonth());
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
  }

  ktDayPicker.$inject = ['ktDayPickerSvc', 'ktDateBoundsService'];

  angular.module('kt.datePicker').directive('ktDayPicker', ktDayPicker);




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
          minDate: '=',
          maxDate: '=',
          format : '@'
        },
        templateUrl: 'html/kt-month-picker.html',
        link       : function (scope, element, attributes, controllers) {
          var ngModelController = controllers[0];
          var ktDatePicker = controllers[1];
          var monthsPerRow = 3;

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

          scope.date = ktDateBounds.getMomentWithinBounds(scope.date, scope.minDate, scope.maxDate, {
            precision: 'month',
            inclusivity: '[]',
            format: scope.format
          });

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

            return ktDateBounds.isDateWithinBounds(date, minDate, maxDate, {precision: 'month', inclusivity: '[]'});
          };

          scope.selectMonth = function (month) {
            var date = scope.date.clone().year(scope.monthPicker.year).month(month);

            scope.date = ktDateBounds.getMomentWithinBounds(date, scope.minDate, scope.maxDate, {
              precision: 'day',
              inclusivity: '[]',
              format: scope.format,
              roundTo: 'month'
            });

            ngModelController.$setViewValue(scope.format ? scope.date.format(scope.format) : scope.date);

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
            var minDate = scope.minDate ? moment(scope.minDate, scope.format) : undefined;
            var maxDate = scope.maxDate ? moment(scope.maxDate, scope.format) : undefined;

            return ktDateBounds.isDateWithinBounds(date, minDate, maxDate, {precision: 'year', inclusivity: '[]'});
          };

          scope.nextYear = function () {
            scope.monthPicker.year = scope.monthPicker.year + 1;
          };

          scope.hasNextYear = function () {
            var date = moment({year: scope.monthPicker.year});
            date.add(1, 'year');
            var minDate = scope.minDate ? moment(scope.minDate, scope.format) : undefined;
            var maxDate = scope.maxDate ? moment(scope.maxDate, scope.format) : undefined;

            return ktDateBounds.isDateWithinBounds(date, minDate, maxDate, {precision: 'year', inclusivity: '[]'});
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




  angular

    .module('kt.datePicker')

    .directive('ktTimePicker', [function () {
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
        restrict   : 'E',
        templateUrl: 'html/kt-time-picker.html',
        scope      : {
          date: '='
        },
        link       : function (scope) {
          scope.timePicker = {
            hours  : getHours(),
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
    }])

    .directive('ktTimePickerInput', [function () {
      var instanceCount = 0;

      return {
        restrict: 'E',
        scope   : {
          date  : '=',
          format: '@'
        },
        template: '<input type="text" ng-model="timeString" ng-change="timeStringChanged()" kt-dropdown=".ktTimePickerInput_{{instanceCount}}">' +
        '<kt-time-picker class="ktTimePickerInput_{{instanceCount}}" date="date"></kt-time-picker>',
        link    : function (scope) {
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



angular.module('kt.datePicker').run(['$templateCache', function($templateCache) {
  $templateCache.put("html/kt-date-picker-input.html",
    "<div>\n" +
    "  <input type=\"text\" ng-model=\"dateString\" ng-change=\"dateStringChanged()\" kt-dropdown=\".ktDatePickerInput_{{instanceCount}}\">\n" +
    "  <kt-date-picker class=\"ktDatePickerInput_{{instanceCount}} kt-dropdown-target\" date=\"date\" min-date=\"minDate\" max-date=\"maxDate\"></kt-date-picker>\n" +
    "</div>\n" +
    "");
  $templateCache.put("html/kt-date-picker.html",
    "<kt-day-picker\n" +
    "    ng-model=\"ngModel\" min-date=\"minDate\" max-date=\"maxDate\" format=\"{{format}}\"\n" +
    "    ng-show=\"isCurrentPicker('day')\">\n" +
    "</kt-day-picker>\n" +
    "<kt-month-picker\n" +
    "    ng-model=\"ngModel\" min-date=\"minDate\" max-date=\"maxDate\" format=\"{{format}}\"\n" +
    "    ng-show=\"isCurrentPicker('month')\">\n" +
    "</kt-month-picker>\n" +
    "<kt-year-picker\n" +
    "    ng-model=\"ngModel\" min-date=\"minDate\" max-date=\"maxDate\" format=\"{{format}}\"\n" +
    "    ng-show=\"isCurrentPicker('year')\">\n" +
    "</kt-year-picker>\n" +
    "");
  $templateCache.put("html/kt-date-range-picker-input.html",
    "<div>\n" +
    "  <input type=\"text\" ng-model=\"dateRangeString\" ng-change=\"dateRangeStringChanged()\" kt-dropdown=\".ktDateRangePickerInput_{{instanceCount}}\">\n" +
    "  <kt-date-range-picker class=\"ktDateRangePickerInput_{{instanceCount}} kt-dropdown-target\" start-date=\"startDate\" end-date=\"endDate\" min-date=\"minDate\" max-date=\"maxDate\"></kt-date-range-picker>\n" +
    "</div>\n" +
    "");
  $templateCache.put("html/kt-date-range-picker.html",
    "<div class=\"kt-dp-flex-row kt-dp-range-navigation\">\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button class=\"kt-dp-date\"\n" +
    "            ng-click=\"setCurrentPicker('start')\"\n" +
    "            ng-class=\"{'kt-dp-date--selected': isCurrentPicker('start')}\">\n" +
    "      {{getDisplayedDate(startDate)}}\n" +
    "    </button>\n" +
    "  </div>\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button class=\"kt-dp-date\"\n" +
    "            ng-click=\"setCurrentPicker('end')\"\n" +
    "            ng-class=\"{'kt-dp-date--selected': isCurrentPicker('end')}\">\n" +
    "      {{getDisplayedDate(endDate)}}\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"kt-dp-picker-container\">\n" +
    "  <kt-date-range-select start-date=\"startDate\" end-date=\"endDate\" options=\"options\"\n" +
    "                        ng-show=\"isCurrentPicker('range')\">\n" +
    "  </kt-date-range-select>\n" +
    "\n" +
    "  <kt-date-picker ng-model=\"startDate\" min-date=\"minDate\" max-date=\"maxDate\" format=\"{{format}}\"\n" +
    "                  ng-show=\"isCurrentPicker('start')\">\n" +
    "  </kt-date-picker>\n" +
    "\n" +
    "  <kt-date-picker ng-model=\"endDate\" min-date=\"startDate\" max-date=\"maxDate\" format=\"{{format}}\"\n" +
    "                  ng-show=\"isCurrentPicker('end')\">\n" +
    "  </kt-date-picker>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"kt-dp-flex-row kt-dp-footer\">\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button class=\"kt-dp-date\"\n" +
    "            ng-click=\"setCurrentPicker('range')\"\n" +
    "            ng-class=\"{'kt-dp-date--selected': isCurrentPicker('range')}\">\n" +
    "      <kt-date-picker-icon icon=\"#date_range_24\"></kt-date-picker-icon>\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "");
  $templateCache.put("html/kt-date-range-select.html",
    "<div class=\"kt-dp-flex-row\" ng-repeat=\"range in ranges\">\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button class=\"kt-dp-date\" ng-click=\"setRange(range)\">{{range | ktDateRangeDisplay}}</button>\n" +
    "  </div>\n" +
    "</div>");
  $templateCache.put("html/kt-day-header.html",
    "<div class=\"kt-dp-flex-row\">\n" +
    "  <div class=\"kt-dp-flex-cell\" ng-repeat=\"dayHeader in dayHeaders\">\n" +
    "    {{dayHeader}}\n" +
    "  </div>\n" +
    "</div>");
  $templateCache.put("html/kt-day-picker.html",
    "<div class=\"kt-dp-flex-row kt-dp-navigation\">\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button\n" +
    "        type=\"button\" class=\"kt-dp-navigation__button kt-button--block\"\n" +
    "        ng-click=\"previousMonth()\" ng-disabled=\"!hasPreviousMonth()\">\n" +
    "      <kt-date-picker-icon icon=\"#chevron_left_18\"></kt-date-picker-icon>\n" +
    "    </button>\n" +
    "  </div>\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button\n" +
    "        type=\"button\" class=\"kt-dp-navigation__button kt-button--block\"\n" +
    "        ng-click=\"monthClick()\" ng-disabled=\"!canChooseMonth()\">\n" +
    "      {{dayPicker.month | monthFormat}}\n" +
    "      {{dayPicker.year}}\n" +
    "    </button>\n" +
    "  </div>\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button\n" +
    "        type=\"button\" class=\"kt-dp-navigation__button kt-button--block\"\n" +
    "        ng-click=\"nextMonth()\" ng-disabled=\"!hasNextMonth()\">\n" +
    "      <kt-date-picker-icon icon=\"#chevron_right_18\"></kt-date-picker-icon>\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<kt-day-header></kt-day-header>\n" +
    "\n" +
    "<div class=\"kt-dp-flex-row\" ng-repeat=\"week in dayPicker.weeks\">\n" +
    "  <div class=\"kt-dp-flex-cell\" ng-repeat=\"date in week.dates\">\n" +
    "    <button\n" +
    "        type=\"button\"\n" +
    "        class=\"kt-dp-date\"\n" +
    "        ng-click=\"selectDate(date)\"\n" +
    "        ng-disabled=\"!isInMinMaxRange(date)\"\n" +
    "        ng-class=\"{'kt-dp-date--selected': isSelected(date), 'kt-dp-date--overflow': isOverflowing(date)}\">\n" +
    "      {{date.format('D')}}\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("html/kt-month-picker.html",
    "<div class=\"kt-dp-flex-row kt-dp-navigation\">\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button type=\"button\" class=\"kt-dp-navigation__button kt-button--block\"\n" +
    "            ng-click=\"previousYear()\" ng-disabled=\"!hasPreviousYear()\">\n" +
    "      <kt-date-picker-icon icon=\"#chevron_left_18\"></kt-date-picker-icon>\n" +
    "    </button>\n" +
    "  </div>\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button type=\"button\" class=\"kt-dp-navigation__button kt-button--block\"\n" +
    "            ng-click=\"yearClick()\" ng-disabled=\"!canChooseYear()\">{{monthPicker.year}}</button>\n" +
    "  </div>\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button type=\"button\" class=\"kt-dp-navigation__button kt-button--block\"\n" +
    "            ng-click=\"nextYear()\" ng-disabled=\"!hasNextYear()\">\n" +
    "      <kt-date-picker-icon icon=\"#chevron_right_18\"></kt-date-picker-icon>\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"kt-dp-flex-row\" ng-repeat=\"monthChunk in monthPicker.monthChunks\">\n" +
    "  <div class=\"kt-dp-flex-cell\" ng-repeat=\"month in monthChunk\">\n" +
    "    <button type=\"button\"\n" +
    "            class=\"kt-dp-date\"\n" +
    "            ng-click=\"selectMonth(month)\"\n" +
    "            ng-class=\"{'kt-dp-date--selected': isSelected(month)}\"\n" +
    "            ng-disabled=\"!isInMinMaxRange(month)\">\n" +
    "      {{month | monthFormat}}\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
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
    "<div class=\"kt-dp-flex-row kt-dp-navigation\">\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button type=\"button\" class=\"kt-dp-navigation__button kt-button--block\"\n" +
    "            ng-click=\"previousDecade()\" ng-disabled=\"!hasPreviousDecade()\">\n" +
    "      <kt-date-picker-icon icon=\"#chevron_left_18\"></kt-date-picker-icon>\n" +
    "    </button>\n" +
    "  </div>\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button type=\"button\" class=\"kt-dp-navigation__button kt-button--block\" disabled=\"disabled\">\n" +
    "      {{yearPicker.decade.start}} - {{yearPicker.decade.end}}\n" +
    "    </button>\n" +
    "  </div>\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button type=\"button\" class=\"kt-dp-navigation__button kt-button--block\"\n" +
    "            ng-click=\"nextDecade()\" ng-disabled=\"!hasNextDecade()\">\n" +
    "      <kt-date-picker-icon icon=\"#chevron_right_18\"></kt-date-picker-icon>\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"kt-dp-flex-row\" ng-repeat=\"yearChunk in yearPicker.chunkedYears\">\n" +
    "  <div class=\"kt-dp-flex-cell\" ng-repeat=\"year in yearChunk\">\n" +
    "      <button\n" +
    "          type=\"button\"\n" +
    "          class=\"kt-dp-date\"\n" +
    "          ng-click=\"selectYear(year)\"\n" +
    "          ng-class=\"{'kt-dp-date--selected': isSelected(year), 'kt-dp-date--overflow': isOverflowing(year)}\"\n" +
    "          ng-disabled=\"!isInMinMaxRange(year)\">\n" +
    "        {{year}}\n" +
    "      </button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("html/kt-date-picker-icons.svg",
    "<svg xmlns=\"http://www.w3.org/2000/svg\">\n" +
    "    <symbol viewBox=\"0 0 24 24\" id=\"date_range_24\">\n" +
    "        <title>date_range_24</title>\n" +
    "        <path d=\"M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z\"\n" +
    "        />\n" +
    "    </symbol>\n" +
    "    <symbol viewBox=\"0 0 18 18\" id=\"chevron_left_18\">\n" +
    "        <title>chevron_left_18</title>\n" +
    "        <path d=\"M11.56 5.56L10.5 4.5 6 9l4.5 4.5 1.06-1.06L8.12 9z\" />\n" +
    "    </symbol>\n" +
    "    <symbol viewBox=\"0 0 18 18\" id=\"chevron_right_18\">\n" +
    "        <title>chevron_right_18</title>\n" +
    "        <path d=\"M7.5 4.5L6.44 5.56 9.88 9l-3.44 3.44L7.5 13.5 12 9z\" />\n" +
    "    </symbol>\n" +
    "</svg>");
}]);
})();
