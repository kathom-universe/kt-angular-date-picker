(function () {
  'use strict';

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
})();
