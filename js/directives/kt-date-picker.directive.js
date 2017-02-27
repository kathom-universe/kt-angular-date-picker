(function () {
  'use strict';

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
})();
