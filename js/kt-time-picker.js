(function () {
  'use strict';

  var timePicker = angular.module('kt.datePicker');

  timePicker.directive('ktTimePicker', [function () {
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
      restrict: 'E',
      templateUrl: 'html/kt-time-picker.html',
      scope: {
        date: '='
      },
      link: function (scope) {
        scope.timePicker = {
          hours: getHours(),
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
  }]);
})();
