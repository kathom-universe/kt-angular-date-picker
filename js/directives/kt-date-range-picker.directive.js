(function () {
  'use strict';

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
})();
