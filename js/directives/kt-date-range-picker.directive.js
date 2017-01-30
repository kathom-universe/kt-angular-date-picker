(function () {
  'use strict';

  var dateRangePicker = angular.module('kt.datePicker');

  dateRangePicker.directive('ktDateRangePicker', ['$timeout', 'ktDateBoundsService', function ($timeout, ktDateBounds) {
    return {
      restrict   : 'E',
      scope      : {
        startDate: '=',
        endDate  : '=',
        minDate  : '=',
        maxDate  : '=',
        format   : '@'
      },
      templateUrl: 'html/kt-date-range-picker.html',
      link       : function (scope, element) {
        scope.element = element;
        var currentPicker = 'start';

        scope.$watch('startDate', function (startDate) {
          var date = ktDateBounds.getMomentWithinBounds(scope.endDate, startDate, scope.maxDate, {
            precision: 'day',
            inclusivity: '[]',
            format: scope.format
          });
          scope.endDate = scope.format ? date.format(scope.format) : date;
        });

        scope.$on('datePicker:dateSelect', function (ev) {
          ev.stopPropagation();

          $timeout(function () {
            currentPicker = currentPicker === 'start' ? 'end' : 'start';
          }, 0);
        });

        scope.isCurrentPicker = function (picker) {
          return currentPicker === picker;
        };

        scope.setCurrentPicker = function (picker) {
          currentPicker = picker;
        };

        scope.getDisplayedDate = function (date) {
          return moment(date, scope.format).format('D. MMMM YYYY');
        }
      }
    };
  }]);

  dateRangePicker.directive('ktDateRangePickerInput', ['ktDateBoundsService', function (ktDateBounds) {
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
      templateUrl: 'html/kt-date-range-picker-input.html',
      link: function (scope) {
        scope.instanceCount = instanceCount++;
        scope.dateRangeString = '';

        scope.startDate =  ktDateBounds.getDateWithinBounds(scope.startDate, scope.minDate, scope.maxDate);
        scope.endDate =  ktDateBounds.getDateWithinBounds(scope.endDate, scope.minDate, scope.maxDate);

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
            !ktDateBounds.isDateWithinBounds(startDate, scope.minDate, scope.maxDate, {inclusivity: '[]'}) ||
            !ktDateBounds.isDateWithinBounds(endDate, startDate, scope.maxDate, {inclusivity: '[]'})
          ) {
            return;
          }

          scope.startDate.year(startDate.year()).month(startDate.month()).date(startDate.date());
          scope.endDate.year(endDate.year()).month(endDate.month()).date(endDate.date());
        };
      }
    };
  }]);
})();
