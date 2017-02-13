(function () {
  'use strict';

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
        });

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
})();
