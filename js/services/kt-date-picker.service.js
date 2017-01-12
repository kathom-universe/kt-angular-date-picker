(function () {
  'use strict';

  var datePickerService = angular.module('kt.datePicker');

  datePickerService.factory('ktDatePickerService', function () {
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
    };

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

