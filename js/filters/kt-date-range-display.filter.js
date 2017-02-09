(function () {
  'use strict';

  angular.module('kt.datePicker').filter('ktDateRangeDisplay', ['ktDateRangeLocales', function (dateRangeLocales) {
    return function (rangeName) {
      var dateRangeLocale = dateRangeLocales.filter(function (dateRangeLocale) {
        return dateRangeLocale.locale === moment.locale();
      })[0];

      return dateRangeLocale.dateRange[rangeName];
    };
  }]);
})();