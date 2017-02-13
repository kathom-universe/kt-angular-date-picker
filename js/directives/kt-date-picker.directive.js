(function () {
  'use strict';

  angular

    .module('kt.datePicker')

    .directive('ktDatePicker', [function () {
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
})();
