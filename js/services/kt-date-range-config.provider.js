(function () {
  'use strict';

  angular.module('kt.datePicker').provider('ktDateRangeConfig', function () {
    this.ranges = [
      {
        rangeName: 'past_week',
        start    : function () { return moment().clone().subtract(1, 'weeks').startOf('day'); },
        end      : function () { return moment().clone().endOf('day'); },
        locale   : {
          'en': 'Past Week',
          'de': 'Letzte 7 Tage'
        }
      },
      {
        rangeName: 'past_month',
        start    : function () { return moment().clone().subtract(1, 'months').startOf('day'); },
        end      : function () { return moment().clone().endOf('day'); },
        locale   : {
          'en': 'Past Month',
          'de': 'Letzte 30 Tage'
        }
      },
      {
        rangeName: 'past_year',
        start    : function () { return moment().clone().subtract(1, 'year').startOf('day'); },
        end      : function () { return moment().clone().endOf('day'); },
        locale   : {
          'en': 'Past Year',
          'de': 'Letztes Jahr'
        }
      },
      {
        rangeName: 'upcoming_week',
        start    : function () { return moment().clone().startOf('day'); },
        end      : function () { return moment().clone().add(1, 'weeks').endOf('day'); },
        locale   : {
          'en': 'Upcoming Week',
          'de': 'Nächste 7 Tage'
        }
      },
      {
        rangeName: 'upcoming_month',
        start    : function () { return moment().clone().startOf('day'); },
        end      : function () { return moment().clone().add(1, 'months').endOf('day'); },
        locale   : {
          'en': 'Upcoming Month',
          'de': 'Nächste 30 Tage'
        }
      },
      {
        rangeName: 'upcoming_year',
        start    : function () { return moment().clone().startOf('day'); },
        end      : function () { return moment().clone().add(1, 'years').endOf('day'); },
        locale   : {
          'en': 'Upcoming Year',
          'de': 'Nächste 12 Monate'
        }
      },
      {
        rangeName: 'this_year',
        start    : function () { return moment().clone().startOf('year'); },
        end      : function () { return moment().clone().endOf('year'); },
        locale   : {
          'en': 'This Year',
          'de': 'Dieses Jahr'
        }
      },
      {
        rangeName: 'this_year_past',
        start    : function () { return moment().clone().startOf('year'); },
        end      : function () { return moment().clone().endOf('day'); },
        locale   : {
          'en': 'This Year',
          'de': 'Dieses Jahr'
        }
      },
      {
        rangeName: 'this_year_future',
        start    : function () { return moment().clone().startOf('day'); },
        end      : function () { return moment().clone().endOf('year'); },
        locale   : {
          'en': 'This Year',
          'de': 'Dieses Jahr'
        }
      },
      {
        rangeName: 'custom',
        locale   : {
          'en': 'Custom',
          'de': 'Benutzerdefiniert'
        }
      }
    ];

    this.getRange = function (rangeName) {
      return this.ranges.filter(function (range) {
        return range.rangeName === rangeName;
      })[0];
    };

    this.getRangeTranslation = function (rangeName, locale) {
      return this.getRange(rangeName).locale[locale];
    };

    this.setRangeTranslation = function (rangeName, locale, translation) {
      var range = this.getRange(rangeName);
      range.locale[locale] = translation;

      return this;
    };

    this.getRangeNames = function () {
      return this.ranges.map(function (range) {
        return range.rangeName;
      });
    };

    this.$get = function () {
      return this;
    };
  });
})();
