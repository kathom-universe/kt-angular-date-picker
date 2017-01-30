(function () {
  'use strict';

  angular

    .module('kt.datePicker')

    .directive('ktDayPicker', ['ktDayPickerSvc', 'ktDateBoundsService', function (dayPickerService, ktDateBounds) {
      return {
        restrict   : 'E',
        require    : 'ngModel',
        templateUrl: 'html/kt-day-picker.html',
        scope      : {
          minDate: '=',
          maxDate: '=',
          format : '@'
        },
        link       : function (scope, element, attributes, ngModelController) {
          scope.dayPicker = {
            month     : undefined,
            year      : undefined,
            weeks     : undefined,
            dayHeaders: dayPickerService.getDayHeaders()
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

            scope.$emit('dayPicker:daySelect');
          };

          scope.previousMonth = function () {
            var date = moment({year: scope.dayPicker.year, month: scope.dayPicker.month});
            date.subtract(1, 'months');
            resetDayPicker(date);
          };

          scope.hasPreviousMonth = function () {
            var minDate = scope.minDate ? moment(scope.minDate, scope.format) : undefined;
            var maxDate = scope.maxDate ? moment(scope.maxDate, scope.format) : undefined;

            var date = moment({year: scope.dayPicker.year, month: scope.dayPicker.month});
            date.subtract(1, 'months');
            return ktDateBounds.isDateWithinBounds(date, minDate, maxDate, {precision: 'month', inclusivity: '[]'});
          };

          scope.nextMonth = function () {
            var date = moment({year: scope.dayPicker.year, month: scope.dayPicker.month});
            date.add(1, 'months');
            resetDayPicker(date);
          };

          scope.hasNextMonth = function () {
            var minDate = scope.minDate ? moment(scope.minDate, scope.format) : undefined;
            var maxDate = scope.maxDate ? moment(scope.maxDate, scope.format) : undefined;

            var date = moment({year: scope.dayPicker.year, month: scope.dayPicker.month});
            date.add(1, 'months');
            return ktDateBounds.isDateWithinBounds(date, minDate, maxDate, {precision: 'month', inclusivity: '[]'});
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
            var minDate = scope.minDate ? moment(scope.minDate, scope.format) : undefined;
            var maxDate = scope.maxDate ? moment(scope.maxDate, scope.format) : undefined;

            return ktDateBounds.isDateWithinBounds(date, minDate, maxDate, {precision: 'day', inclusivity: '[]'});
          };

          scope.monthClick = function () {
            scope.$emit('dayPicker:monthClick');
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
