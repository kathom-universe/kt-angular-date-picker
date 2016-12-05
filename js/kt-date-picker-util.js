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
})();