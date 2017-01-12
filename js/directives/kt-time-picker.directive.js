(function () {
  'use strict';

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
})();
