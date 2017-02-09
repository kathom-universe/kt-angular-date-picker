(function () {
  'use strict';

  angular.module('kt.datePicker').value('ktDateRanges', [
    {
      rangeName: 'past_week',
      start    : function () {
        return moment().clone().subtract(1, 'weeks');
      },
      end      : function () {
        return moment().clone();
      }
    },
    {
      rangeName   : 'past_month',
      start       : function () {
        return moment().clone().subtract(1, 'months');
      },
      end         : function () {
        return moment().clone();
      }
    },
    {
      rangeName: 'past_year',
      start    : function () {
        return moment().clone().subtract(1, 'year');
      },
      end      : function () {
        return moment().clone();
      }
    }
  ]);


  angular.module('kt.datePicker').value('ktDateRangeLocales', [
    {
      locale   : 'en',
      dateRange: {
        'past_week' : 'Past Week',
        'past_month': 'Past Month',
        'past_year' : 'Past Year',
        'custom'    : 'Custom'
      }
    },
    {
      locale   : 'de',
      dateRange: {
        'past_week' : 'Letzte 7 Tage',
        'past_month': 'Letzte 30 Tage',
        'past_year' : 'Letztes Jahr',
        'custom'    : 'Benutzerdefiniert'
      }
    }
  ]);


  angular.module('kt.datePicker').factory('ktDateRangeSvc', ['ktDateRanges', function (dateRanges) {
    var service = {};

    service.getDateRangeNames = function () {
      return dateRanges.map(function (dateRange) {
        return dateRange.rangeName;
      });
    };

    service.getDateRange = function (rangeName) {
      return dateRanges.filter(function (dateRange) {
        return dateRange.rangeName === rangeName;
      })[0];
    };

    return service;
  }])
})();