(function () {
  'use strict';

  var util = angular.module('kt.datePicker');

  util.directive('ktDatePickerNextIcon', function () {
    return {
      restrict: 'E',
      template: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><path d="M9 3L7.94 4.06l4.19 4.19H3v1.5h9.13l-4.19 4.19L9 15l6-6z"></path></svg>'
    };
  });

  util.directive('ktDatePickerPreviousIcon', function () {
    return {
      restrict: 'E',
      template: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><path d="M15 8.25H5.87l4.19-4.19L9 3 3 9l6 6 1.06-1.06-4.19-4.19H15v-1.5z"></path></svg>'
    };
  });

  util.factory('ktDatePickerService', function () {
    var service = {};

    service.isDateWithinBounds = function (date, minDate, maxDate, precision, inclusivity) {
      if (minDate && maxDate && minDate.isAfter(maxDate, precision)) {
        return true;
      }

      if (minDate && maxDate) {
        return date.isBetween(minDate, maxDate, precision, inclusivity);
      }

      if (minDate && !maxDate) {
        return date.isSameOrAfter(minDate, precision);
      }

      if (!minDate && maxDate) {
        return date.isSameOrBefore(maxDate, precision);
      }

      return true;
    }

    service.getDateWithinBounds = function (date, minDate, maxDate, precision, inclusivity, roundTo) {
      if (angular.isUndefined(date)) {
        date = moment().clone();
      }

      if (service.isDateWithinBounds(date, minDate, maxDate, precision, inclusivity)) {
        return date.clone();
      }

      switch (roundTo) {
        case 'month': return date.date(1);
        case 'year': return date.dayOfYear(1);
      }

      return angular.isDefined(minDate) ? minDate.clone() : maxDate.clone();
    };

    return service;
  });
})();