(function () {
  'use strict';

  angular.module('kt.datePicker').filter('ktDateRangeDisplay', ['ktDateRangeConfig', function (dateRangeConfig) {
    return function (rangeName) {
      return dateRangeConfig.getRangeTranslation(rangeName, moment.locale());
    };
  }]);
})();