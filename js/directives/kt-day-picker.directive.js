(function () {
  'use strict';

  angular

    .module('kt.datePicker')

    .directive('ktDayPicker', ['ktDayPickerSvc', 'ktDateBoundsService', function (dayPickerService, ktDateBounds) {
      return {
        restrict   : 'E',
        templateUrl: 'html/kt-day-picker.html',
        scope      : {
          date   : '=',
          minDate: '=',
          maxDate: '='
        },
        link       : function (scope) {
          scope.dayPicker = {
            month     : undefined,
            year      : undefined,
            weeks     : undefined,
            dayHeaders: dayPickerService.getDayHeaders()
          };

          scope.date = ktDateBounds.getDateWithinBounds(scope.date, scope.minDate, scope.maxDate, 'day', '[]');

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
            return ktDateBounds.isDateWithinBounds(date, scope.minDate, scope.maxDate, 'month', []);
          };

          scope.nextMonth = function () {
            var date = moment({year: scope.dayPicker.year, month: scope.dayPicker.month});
            date.add(1, 'months');
            resetDayPicker(date);
          };

          scope.hasNextMonth = function () {
            var date = moment({year: scope.dayPicker.year, month: scope.dayPicker.month});
            date.add(1, 'months');
            return ktDateBounds.isDateWithinBounds(date, scope.minDate, scope.maxDate, 'month', []);
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
            return ktDateBounds.isDateWithinBounds(date, scope.minDate, scope.maxDate, 'day', '[]');
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
})();
