(function () {
  'use strict';

  angular

    .module('kt.datePicker')

    .filter('monthFormat', [function () {
      return function (input) {
        return moment.months()[input];
      };
    }]);
})();
