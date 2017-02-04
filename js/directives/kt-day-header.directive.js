(function () {
  'use strict';

  function ktDayHeader(dayPickerService) {
    return {
      restrict: 'E',
      templateUrl: 'html/kt-day-header.html',
      controller: function ($scope) {
        $scope.dayHeaders = dayPickerService.getDayHeaders()
      }
    };
  }

  ktDayHeader.$inject = ['ktDayPickerSvc'];

  angular.module('kt.datePicker').directive('ktDayHeader', ktDayHeader);
})();