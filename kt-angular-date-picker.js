(function (){
  'use strict';

  angular.module('kt.datePicker', []);




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





  angular.module('kt.datePicker').provider('ktDateRangeConfig', function () {
    this.ranges = [
      {
        rangeName: 'past_week',
        start    : function () { return moment().clone().subtract(1, 'weeks').startOf('day'); },
        end      : function () { return moment().clone().endOf('day'); },
        locale   : {
          'en': 'Past Week',
          'de': 'Letzte 7 Tage'
        }
      },
      {
        rangeName: 'past_month',
        start    : function () { return moment().clone().subtract(1, 'months').startOf('day'); },
        end      : function () { return moment().clone().endOf('day'); },
        locale   : {
          'en': 'Past Month',
          'de': 'Letzte 30 Tage'
        }
      },
      {
        rangeName: 'past_year',
        start    : function () { return moment().clone().subtract(1, 'year').startOf('day'); },
        end      : function () { return moment().clone().endOf('day'); },
        locale   : {
          'en': 'Past Year',
          'de': 'Letztes Jahr'
        }
      },
      {
        rangeName: 'upcoming_week',
        start    : function () { return moment().clone().startOf('day'); },
        end      : function () { return moment().clone().add(1, 'weeks').endOf('day'); },
        locale   : {
          'en': 'Upcoming Week',
          'de': 'Nächste 7 Tage'
        }
      },
      {
        rangeName: 'upcoming_month',
        start    : function () { return moment().clone().startOf('day'); },
        end      : function () { return moment().clone().add(1, 'months').endOf('day'); },
        locale   : {
          'en': 'Upcoming Month',
          'de': 'Nächste 30 Tage'
        }
      },
      {
        rangeName: 'upcoming_year',
        start    : function () { return moment().clone().startOf('day'); },
        end      : function () { return moment().clone().add(1, 'years').endOf('day'); },
        locale   : {
          'en': 'Upcoming Year',
          'de': 'Nächste 12 Monate'
        }
      },
      {
        rangeName: 'this_year',
        start    : function () { return moment().clone().startOf('year'); },
        end      : function () { return moment().clone().endOf('year'); },
        locale   : {
          'en': 'This Year',
          'de': 'Dieses Jahr'
        }
      },
      {
        rangeName: 'this_year_past',
        start    : function () { return moment().clone().startOf('year'); },
        end      : function () { return moment().clone().endOf('day'); },
        locale   : {
          'en': 'This Year',
          'de': 'Dieses Jahr'
        }
      },
      {
        rangeName: 'this_year_future',
        start    : function () { return moment().clone().startOf('day'); },
        end      : function () { return moment().clone().endOf('year'); },
        locale   : {
          'en': 'This Year',
          'de': 'Dieses Jahr'
        }
      },
      {
        rangeName: 'custom',
        locale   : {
          'en': 'Custom',
          'de': 'Benutzerdefiniert'
        }
      }
    ];

    this.getRange = function (rangeName) {
      return this.ranges.filter(function (range) {
        return range.rangeName === rangeName;
      })[0];
    };

    this.getRangeTranslation = function (rangeName, locale) {
      return this.getRange(rangeName).locale[locale];
    };

    this.setRangeTranslation = function (rangeName, locale, translation) {
      var range = this.getRange(rangeName);
      range.locale[locale] = translation;

      return this;
    };

    this.getRangeNames = function () {
      return this.ranges.map(function (range) {
        return range.rangeName;
      });
    };

    this.$get = function () {
      return this;
    };
  });




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




  angular.module('kt.datePicker').filter('ktDateRangeDisplay', ['ktDateRangeConfig', function (dateRangeConfig) {
    return function (rangeName) {
      return dateRangeConfig.getRangeTranslation(rangeName, moment.locale());
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

    .directive('ktDatePicker', ['ktDateBoundsService', function (ktDateBounds) {
      return {
        restrict   : 'E',
        scope      : {
          ngModel  : '=',
          options  : '='
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

    .directive('ktDateInput', ['ktDateBoundsService', function (ktDateBounds) {
      return {
        restrict   : 'A',
        require    : 'ngModel',
        scope      : {
          options: '='
        },
        link       : function (scope, elem, attrs, ngModelCtrl) {
          var originalMoment;

          ngModelCtrl.$formatters.push(function (modelValue) {
            ngModelCtrl.$setValidity('date', true);

            originalMoment = angular.copy(
              ktDateBounds.getMomentWithinBounds(modelValue, null, null, {format: scope.options.format})
            );

            return originalMoment.format(scope.options.inputFormat);
          });

          ngModelCtrl.$parsers.push(function (viewValue) {
            var date = moment(viewValue, scope.options.inputFormat, true);

            if (date.isValid()) {
              date = originalMoment.year(date.year()).month(date.month()).date(date.date());
              ngModelCtrl.$setValidity('date', true);
              return scope.options.format ? date.format(scope.options.format) : date;
            }

            ngModelCtrl.$setValidity('date', false);

            return ngModelCtrl.$modelValue;
          });
        }
      };
    }])

    .directive('ktTimeInput', ['ktDateBoundsService', function (ktDateBounds) {
      return {
        restrict   : 'A',
        require    : 'ngModel',
        scope      : {
          options: '='
        },
        link       : function (scope, elem, attrs, ngModelCtrl) {
          var originalMoment;

          ngModelCtrl.$formatters.push(function (modelValue) {
            ngModelCtrl.$setValidity('time', true);

            originalMoment = angular.copy(
              ktDateBounds.getMomentWithinBounds(modelValue, null, null, {format: scope.options.format})
            );

            return originalMoment.format(scope.options.inputFormat);
          });

          ngModelCtrl.$parsers.push(function (viewValue) {
            var date = moment(viewValue, scope.options.inputFormat, true);

            if (date.isValid()) {
              date = originalMoment.hour(date.hour()).minute(date.minute());
              ngModelCtrl.$setValidity('time', true);
              return scope.options.format ? date.format(scope.options.format) : date;
            }

            ngModelCtrl.$setValidity('time', false);

            return ngModelCtrl.$modelValue;
          });
        }
      };
    }]);




  angular.module('kt.datePicker').directive('ktDateRangePicker', ['ktDateBoundsService', 'ktDateRangeConfig', function (ktDateBounds, dateRangeConfig) {
    return {
      restrict   : 'E',
      scope      : {
        startDate: '=',
        endDate  : '=',
        options  : '='
      },
      templateUrl: 'html/kt-date-range-picker.html',
      controller : function ($scope) {
        var currentPicker = 'range';

        $scope.options = $scope.options || {};

        this.requestNextRange = function () {
          currentPicker = currentPicker === 'start' ? 'end' : 'start';
        };

        this.setRange = function (rangeName) {
          if (rangeName === 'custom') {
            currentPicker = 'start';
            return;
          }

          var range = dateRangeConfig.getRange(rangeName);

          $scope.startDate = $scope.options.format ? range.start().format($scope.options.format) : range.start();
          $scope.endDate = $scope.options.format ? range.end().format($scope.options.format) : range.end();
        };

        if ($scope.options.initialRange) {
          this.setRange($scope.options.initialRange);
        }

        $scope.dateRangePicker = {
          startDate: angular.copy($scope.startDate),
          endDate  : angular.copy($scope.endDate)
        };

        $scope.startRangeOptions = {
          minDate        : $scope.options.minDate,
          maxDate        : $scope.options.maxDate,
          format         : $scope.options.format,
          overflowEnabled: $scope.options.overflowEnabled
        };

        $scope.endRangeOptions = {
          minDate        : angular.copy($scope.dateRangePicker.startDate),
          maxDate        : $scope.options.maxDate,
          format         : $scope.options.format,
          overflowEnabled: $scope.options.overflowEnabled
        };

        $scope.$watchGroup(['startDate', 'endDate'], function () {
          $scope.updateBindings();
        }, true);

        $scope.$watch(function () {
          return $scope.dateRangePicker.startDate;
        }, function (startDate) {
          var date = ktDateBounds.getMomentWithinBounds($scope.dateRangePicker.endDate, startDate, $scope.options.maxDate, {
            precision  : 'day',
            inclusivity: '[]',
            format     : $scope.options.format
          });
          $scope.endRangeOptions.minDate = angular.copy(startDate);
          $scope.dateRangePicker.endDate = $scope.options.format ? date.format($scope.options.format) : date;
        });

        $scope.applyChanges = function () {
          $scope.startDate = $scope.dateRangePicker.startDate;
          $scope.endDate = $scope.dateRangePicker.endDate;
        };

        $scope.updateBindings = function () {
          $scope.dateRangePicker.startDate = angular.copy($scope.startDate);
          $scope.dateRangePicker.endDate = angular.copy($scope.endDate);
        };

        $scope.isCurrentPicker = function (picker) {
          return currentPicker === picker;
        };

        $scope.setCurrentPicker = function (picker) {
          currentPicker = picker;
        };

        $scope.getDisplayedDate = function (date) {
          return moment(date, $scope.options.format).format('DD.MM.YYYY');
        }
      }
    };
  }]);


  angular.module('kt.datePicker').directive('ktDateRangeSelect', [function () {
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
        scope.setRange = function (rangeName) {
          ktDateRangePicker.setRange(rangeName);
        };
      }
    };
  }]);


  angular.module('kt.datePicker').directive('ktDateRangeInput', ['ktDateBoundsService', function (ktDateBounds) {
    return {
      restrict   : 'A',
      require    : 'ngModel',
      scope      : {
        options: '='
      },
      link       : function (scope, elem, attrs, ngModelCtrl) {
        var originalStartMoment;
        var originalEndMoment;
        var formatted = false;

        function getMomentsFromRangeString(rangeString) {
          var components = rangeString.split(scope.options.divider);
          return {
            startDate: moment(components[0], scope.options.inputFormat, true),
            endDate: moment(components[1], scope.options.inputFormat, true)
          };
        }

        function formatter(modelValue) {
          formatted = true;

          ngModelCtrl.$setValidity('date-range', true);

          originalStartMoment = angular.copy(
            ktDateBounds.getMomentWithinBounds(modelValue[scope.options.startProperty], null, null, {format: scope.options.format})
          );

          originalEndMoment = angular.copy(
            ktDateBounds.getMomentWithinBounds(modelValue[scope.options.endProperty], null, null, {format: scope.options.format})
          );

          return originalStartMoment.format(scope.options.inputFormat) + scope.options.divider + originalEndMoment.format(scope.options.inputFormat);
        }

        ngModelCtrl.$formatters.push(formatter);

        ngModelCtrl.$parsers.push(function (viewValue) {
          var dates = getMomentsFromRangeString(viewValue);
          var range = {};

          if (!dates.startDate.isValid() || !dates.endDate.isValid()) {
            ngModelCtrl.$setValidity('date-range', false);
            return ngModelCtrl.$modelValue;
          }

          if (!ktDateBounds.isDateWithinBounds(dates.endDate, dates.startDate)) {
            ngModelCtrl.$setValidity('date-range-bounds', false);
            return ngModelCtrl.$modelValue;
          }

          ngModelCtrl.$setValidity('date-range', true);
          ngModelCtrl.$setValidity('date-range-bounds', true);

          originalStartMoment = originalStartMoment.year(dates.startDate.year()).month(dates.startDate.month()).date(dates.startDate.date());
          originalEndMoment = originalEndMoment.year(dates.endDate.year()).month(dates.endDate.month()).date(dates.endDate.date());

          range[scope.options.startProperty] = scope.options.format ? originalStartMoment.format(scope.options.format) : originalStartMoment;
          range[scope.options.endProperty] = scope.options.format ? originalEndMoment.format(scope.options.format) : originalEndMoment;

          return range;
        });

        scope.$watch(function () {
          return ngModelCtrl.$modelValue;
        }, function (model) {
          if (!formatted) {
            ngModelCtrl.$setViewValue(formatter(model));
            ngModelCtrl.$render();
          }

          formatted = false;
        }, true);
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
        options: '='
      },
      link       : function (scope, element, attributes, controllers) {
        var ngModelController = controllers[0];
        var ktDatePicker = controllers[1];
        var ktDateRangePicker = controllers[2];

        scope.options = scope.options || {};

        scope.dayPicker = {
          month: undefined,
          year : undefined,
          weeks: undefined
        };

        scope.date = ktDateBounds.getMomentWithinBounds(scope.date, scope.options.minDate, scope.options.maxDate, {
          precision  : 'day',
          inclusivity: '[]',
          format     : scope.options.format
        });

        scope.$watch(function () {
          return ngModelController.$modelValue;
        }, function(newValue) {
          scope.date = moment(newValue, scope.options.format);
          resetDayPicker(scope.date);
        }, true);

        scope.$watch('options', function (options) {
          var date = ktDateBounds.getMomentWithinBounds(ngModelController.$modelValue, options.minDate, options.maxDate, {
            precision  : 'day',
            inclusivity: '[]',
            format     : options.format
          });

          ngModelController.$setViewValue(options.format ? date.format(options.format) : date);
        }, true);

        scope.selectDate = function (date) {
          scope.date.year(date.year()).month(date.month()).date(date.date());
          ngModelController.$setViewValue(scope.options.format ? scope.date.format(scope.options.format) : scope.date);

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
          return ktDateBounds.isDateWithinBounds(date, scope.options.minDate, scope.options.maxDate, {
            precision: 'month', inclusivity: '[]', format: scope.options.format
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
          return ktDateBounds.isDateWithinBounds(date, scope.options.minDate, scope.options.maxDate, {
            precision: 'month', inclusivity: '[]', format: scope.options.format
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
          return ktDateBounds.isDateWithinBounds(date, scope.options.minDate, scope.options.maxDate, {
            precision: 'day', inclusivity: '[]', format: scope.options.format
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
          options: '='
        },
        link       : function (scope, element, attributes, controllers) {
          var ngModelController = controllers[0];
          var ktDatePicker = controllers[1];
          var decade = getDecade(scope.date ? scope.date.year() : moment().clone().year());
          var yearsPerRow = 3;

          scope.options = scope.options || {};

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

          scope.date = ktDateBounds.getMomentWithinBounds(scope.date, scope.options.minDate, scope.options.maxDate, {
            precision: 'year',
            inclusivity: '[]',
            format: scope.options.format
          });

          scope.$watch(function () {
            return ngModelController.$modelValue;
          }, function(newValue) {
            scope.date = moment(newValue, scope.options.format);
            if (scope.date.year() < scope.yearPicker.decade.start || scope.date.year() > scope.yearPicker.decade.end) {
              scope.yearPicker.decade = getDecade(scope.date.year());
              scope.yearPicker.chunkedYears = chunk(getYears(scope.yearPicker.decade), yearsPerRow);
            }
          });

          scope.selectYear = function (year) {
            var date = scope.date.clone().year(year);

            scope.date = ktDateBounds.getMomentWithinBounds(date, scope.options.minDate, scope.options.maxDate, {
              precision: 'day',
              inclusivity: '[]',
              format: scope.options.format,
              roundTo: 'year'
            });

            ngModelController.$setViewValue(scope.options.format ? scope.date.format(scope.options.format) : scope.date);

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
            return ktDateBounds.isDateWithinBounds(date, scope.options.minDate, scope.options.maxDate, {
              precision: 'year', inclusivity: '[]', format: scope.options.format
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
            return ktDateBounds.isDateWithinBounds(date, scope.options.minDate, scope.options.maxDate, {
              precision: 'year', inclusivity: '[]', format: scope.options.format
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

            return ktDateBounds.isDateWithinBounds(date, scope.options.minDate, scope.options.maxDate, {
              precision: 'year', inclusivity: '[]', format: scope.options.format
            });
          };
        }
      };
    }]);



angular.module('kt.datePicker').run(['$templateCache', function ($templateCache) {
  $templateCache.put("html/kt-date-picker.html",
    "<kt-day-picker\n" +
    "    ng-model=\"ngModel\" options=\"options\"\n" +
    "    ng-show=\"isCurrentPicker('day')\">\n" +
    "</kt-day-picker>\n" +
    "<kt-month-picker\n" +
    "    ng-model=\"ngModel\" options=\"options\"\n" +
    "    ng-show=\"isCurrentPicker('month')\">\n" +
    "</kt-month-picker>\n" +
    "<kt-year-picker\n" +
    "    ng-model=\"ngModel\" options=\"options\"\n" +
    "    ng-show=\"isCurrentPicker('year')\">\n" +
    "</kt-year-picker>\n" +
    "");
  $templateCache.put("html/kt-date-range-picker.html",
    "<div class=\"kt-dp-flex-row kt-dp-range-navigation\">\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button class=\"kt-dp-button\"\n" +
    "            ng-click=\"setCurrentPicker('start')\"\n" +
    "            ng-class=\"{'kt-dp-button--selected': isCurrentPicker('start')}\">\n" +
    "      {{getDisplayedDate(dateRangePicker.startDate)}}\n" +
    "    </button>\n" +
    "  </div>\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button class=\"kt-dp-button\"\n" +
    "            ng-click=\"setCurrentPicker('end')\"\n" +
    "            ng-class=\"{'kt-dp-button--selected': isCurrentPicker('end')}\">\n" +
    "      {{getDisplayedDate(dateRangePicker.endDate)}}\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"kt-dp-picker-container\">\n" +
    "  <kt-date-range-select start-date=\"dateRangePicker.startDate\" end-date=\"dateRangePicker.endDate\" options=\"options\"\n" +
    "                        ng-show=\"isCurrentPicker('range')\">\n" +
    "  </kt-date-range-select>\n" +
    "\n" +
    "  <kt-date-picker ng-model=\"dateRangePicker.startDate\" options=\"startRangeOptions\"\n" +
    "                  ng-show=\"isCurrentPicker('start')\">\n" +
    "  </kt-date-picker>\n" +
    "\n" +
    "  <kt-date-picker ng-model=\"dateRangePicker.endDate\" options=\"endRangeOptions\"\n" +
    "                  ng-show=\"isCurrentPicker('end')\">\n" +
    "  </kt-date-picker>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"kt-dp-flex-row kt-dp-footer\">\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button class=\"kt-dp-button\"\n" +
    "            ng-click=\"setCurrentPicker('range')\"\n" +
    "            ng-class=\"{'kt-dp-button--selected': isCurrentPicker('range')}\">\n" +
    "      <kt-date-picker-icon icon=\"#date_range_24\"></kt-date-picker-icon>\n" +
    "    </button>\n" +
    "  </div>\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button class=\"kt-dp-button\" ng-click=\"applyChanges()\">\n" +
    "      <kt-date-picker-icon icon=\"#done_24\"></kt-date-picker-icon>\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "");
  $templateCache.put("html/kt-date-range-select.html",
    "<div class=\"kt-dp-flex-row\" ng-repeat=\"range in options.ranges\">\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button class=\"kt-dp-button\" ng-click=\"setRange(range)\">{{range | ktDateRangeDisplay}}</button>\n" +
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
    "    <button type=\"button\" class=\"kt-dp-button\" ng-click=\"previousMonth()\" ng-show=\"hasPreviousMonth()\">\n" +
    "      <kt-date-picker-icon icon=\"#chevron_left_18\"></kt-date-picker-icon>\n" +
    "    </button>\n" +
    "  </div>\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button type=\"button\" class=\"kt-dp-button\" ng-click=\"monthClick()\" ng-disabled=\"!canChooseMonth()\">\n" +
    "      {{dayPicker.month | monthFormat}}\n" +
    "      {{dayPicker.year}}\n" +
    "    </button>\n" +
    "  </div>\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button type=\"button\" class=\"kt-dp-button\" ng-click=\"nextMonth()\" ng-show=\"hasNextMonth()\">\n" +
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
    "        class=\"kt-dp-button kt-dp-date\"\n" +
    "        ng-click=\"selectDate(date)\"\n" +
    "        ng-disabled=\"!isInMinMaxRange(date)\"\n" +
    "        ng-class=\"{'kt-dp-button--selected': isSelected(date), 'kt-dp-button--overflow': isOverflowing(date)}\"\n" +
    "        ng-if=\"!isOverflowing(date) || options.overflowEnabled\">\n" +
    "      {{date.format('D')}}\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("html/kt-month-picker.html",
    "<div class=\"kt-dp-flex-row kt-dp-navigation\">\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button type=\"button\" class=\"kt-dp-button\" ng-click=\"previousYear()\" ng-show=\"hasPreviousYear()\">\n" +
    "      <kt-date-picker-icon icon=\"#chevron_left_18\"></kt-date-picker-icon>\n" +
    "    </button>\n" +
    "  </div>\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button type=\"button\" class=\"kt-dp-button\" ng-click=\"yearClick()\" ng-disabled=\"!canChooseYear()\">\n" +
    "      {{monthPicker.year}}\n" +
    "    </button>\n" +
    "  </div>\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button type=\"button\" class=\"kt-dp-button\" ng-click=\"nextYear()\" ng-show=\"hasNextYear()\">\n" +
    "      <kt-date-picker-icon icon=\"#chevron_right_18\"></kt-date-picker-icon>\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"kt-dp-flex-row\" ng-repeat=\"monthChunk in monthPicker.monthChunks\">\n" +
    "  <div class=\"kt-dp-flex-cell\" ng-repeat=\"month in monthChunk\">\n" +
    "    <button type=\"button\"\n" +
    "            class=\"kt-dp-button\"\n" +
    "            ng-click=\"selectMonth(month)\"\n" +
    "            ng-class=\"{'kt-dp-button--selected': isSelected(month)}\"\n" +
    "            ng-disabled=\"!isInMinMaxRange(month)\">\n" +
    "      {{month | monthFormat}}\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "");
  $templateCache.put("html/kt-year-picker.html",
    "<div class=\"kt-dp-flex-row kt-dp-navigation\">\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button type=\"button\" class=\"kt-dp-button\" ng-click=\"previousDecade()\" ng-show=\"hasPreviousDecade()\">\n" +
    "      <kt-date-picker-icon icon=\"#chevron_left_18\"></kt-date-picker-icon>\n" +
    "    </button>\n" +
    "  </div>\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button type=\"button\" class=\"kt-dp-button kt-dp-button--preserve-color\" disabled=\"disabled\">\n" +
    "      {{yearPicker.decade.start}} - {{yearPicker.decade.end}}\n" +
    "    </button>\n" +
    "  </div>\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button type=\"button\" class=\"kt-dp-button\" ng-click=\"nextDecade()\" ng-show=\"hasNextDecade()\">\n" +
    "      <kt-date-picker-icon icon=\"#chevron_right_18\"></kt-date-picker-icon>\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"kt-dp-flex-row\" ng-repeat=\"yearChunk in yearPicker.chunkedYears\">\n" +
    "  <div class=\"kt-dp-flex-cell\" ng-repeat=\"year in yearChunk\">\n" +
    "      <button\n" +
    "          type=\"button\"\n" +
    "          class=\"kt-dp-button\"\n" +
    "          ng-click=\"selectYear(year)\"\n" +
    "          ng-class=\"{'kt-dp-button--selected': isSelected(year), 'kt-dp-button--overflow': isOverflowing(year)}\"\n" +
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
    "    <symbol viewBox=\"0 0 24 24\" id=\"done_24\">\n" +
    "        <title>done_24</title>\n" +
    "        <path d=\"M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z\" />\n" +
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
