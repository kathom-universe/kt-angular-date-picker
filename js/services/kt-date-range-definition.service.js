(function () {
  'use strict';

  angular.module('kt.datePicker').value('ktDateRanges', [
    {
      rangeName: 'past_week',
      start    : function () { return moment().clone().subtract(1, 'weeks').startOf('day'); },
      end      : function () { return moment().clone().endOf('day'); }
    },
    {
      rangeName: 'past_month',
      start    : function () { return moment().clone().subtract(1, 'months').startOf('day'); },
      end      : function () { return moment().clone().endOf('day'); }
    },
    {
      rangeName: 'past_year',
      start    : function () { return moment().clone().subtract(1, 'year').startOf('day'); },
      end      : function () { return moment().clone().endOf('day'); }
    },
    {
      rangeName: 'upcoming_week',
      start    : function () { return moment().clone().startOf('day'); },
      end      : function () { return moment().clone().add(1, 'weeks').endOf('day'); }
    },
    {
      rangeName: 'upcoming_month',
      start    : function () { return moment().clone().startOf('day'); },
      end      : function () { return moment().clone().add(1, 'months').endOf('day'); }
    },
    {
      rangeName: 'upcoming_year',
      start    : function () { return moment().clone().startOf('day'); },
      end      : function () { return moment().clone().add(1, 'years').endOf('day'); }
    },
    {
      rangeName: 'this_year',
      start    : function () { return moment().clone().startOf('year'); },
      end      : function () { return moment().clone().endOf('year'); }
    },
    {
      rangeName: 'this_year_past',
      start    : function () { return moment().clone().startOf('year'); },
      end      : function () { return moment().clone().endOf('day'); }
    },
    {
      rangeName: 'this_year_future',
      start    : function () { return moment().clone().startOf('day'); },
      end      : function () { return moment().clone().endOf('year'); }
    }
  ]);


  angular.module('kt.datePicker').value('ktDateRangeLocales', [
    {
      locale   : 'en',
      dateRange: {
        'past_week'       : 'Past Week',
        'past_month'      : 'Past Month',
        'past_year'       : 'Past Year',
        'upcoming_week'   : 'Upcoming Week',
        'upcoming_month'  : 'Upcoming Month',
        'upcoming_year'   : 'Upcoming Year',
        'this_year'       : 'This Year',
        'this_year_past'  : 'This Year',
        'this_year_future': 'This Year',
        'custom'          : 'Custom'
      }
    },
    {
      locale   : 'de',
      dateRange: {
        'past_week'       : 'Letzte 7 Tage',
        'past_month'      : 'Letzte 30 Tage',
        'past_year'       : 'Letztes Jahr',
        'upcoming_week'   : 'Nächste 7 Tage',
        'upcoming_month'  : 'Nächste 30 Tage',
        'upcoming_year'   : 'Nächstes Jahr',
        'this_year'       : 'Dieses Jahr',
        'this_year_past'  : 'Dieses Jahr',
        'this_year_future': 'Dieses Jahr',
        'custom'          : 'Benutzerdefiniert'
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