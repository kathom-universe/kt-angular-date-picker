(function () {
  'use strict';

  describe('Day Picker Service', function () {
    var ktDayPickerSvc;

    beforeEach(module('kt.datePicker'));

    beforeEach(inject(function (_ktDayPickerSvc_) {
      moment.locale('en');
      ktDayPickerSvc = _ktDayPickerSvc_;
    }));

    describe('getWeeksInMonth', function () {
      it('should return correct number of weeks', function () {
        var data = [
          {year: 2017, month: 0, expected: 5},
          {year: 2017, month: 1, expected: 5},
          {year: 2017, month: 2, expected: 5},
          {year: 2017, month: 3, expected: 6},
          {year: 2017, month: 4, expected: 5},
          {year: 2017, month: 5, expected: 5},
          {year: 2017, month: 6, expected: 6},
          {year: 2017, month: 7, expected: 5},
          {year: 2017, month: 8, expected: 5},
          {year: 2017, month: 9, expected: 5},
          {year: 2017, month: 10, expected: 5},
          {year: 2017, month: 11, expected: 6}
        ];

        data.forEach(function (instance) {
          expect(ktDayPickerSvc.getWeeksInMonth(instance.year, instance.month).length).toEqual(instance.expected);
        });
      });

      it('should return correct number of weeks (locale)', function () {
        moment.locale('de');

        var data = [
          {year: 2017, month: 0, expected: 6},
          {year: 2017, month: 1, expected: 5},
          {year: 2017, month: 2, expected: 5},
          {year: 2017, month: 3, expected: 5},
          {year: 2017, month: 4, expected: 5},
          {year: 2017, month: 5, expected: 5},
          {year: 2017, month: 6, expected: 6},
          {year: 2017, month: 7, expected: 5},
          {year: 2017, month: 8, expected: 5},
          {year: 2017, month: 9, expected: 6},
          {year: 2017, month: 10, expected: 5},
          {year: 2017, month: 11, expected: 5}
        ];

        data.forEach(function (instance) {
          expect(ktDayPickerSvc.getWeeksInMonth(instance.year, instance.month).length).toEqual(instance.expected);
        });
      });

      it('should return correct days', function () {
        var data = [
          {year: 2017, month: 0, date: 1, expectedWeek: 0, expectedDayInWeek: 0},
          {year: 2017, month: 1, date: 7, expectedWeek: 1, expectedDayInWeek: 2},
          {year: 2017, month: 2, date: 13, expectedWeek: 2, expectedDayInWeek: 1},
          {year: 2017, month: 3, date: 19, expectedWeek: 3, expectedDayInWeek: 3},
          {year: 2017, month: 4, date: 25, expectedWeek: 3, expectedDayInWeek: 4},
          {year: 2017, month: 5, date: 1, expectedWeek: 0, expectedDayInWeek: 4},
          {year: 2017, month: 6, date: 7, expectedWeek: 1, expectedDayInWeek: 5},
          {year: 2017, month: 7, date: 13, expectedWeek: 2, expectedDayInWeek: 0},
          {year: 2017, month: 8, date: 19, expectedWeek: 3, expectedDayInWeek: 2},
          {year: 2017, month: 9, date: 25, expectedWeek: 3, expectedDayInWeek: 3},
          {year: 2017, month: 10, date: 1, expectedWeek: 0, expectedDayInWeek: 3},
          {year: 2017, month: 11, date: 7, expectedWeek: 1, expectedDayInWeek: 4}
        ];

        data.forEach(function (instance) {
          var week = ktDayPickerSvc.getWeeksInMonth(instance.year, instance.month)[instance.expectedWeek];
          var momentDate = week.dates[instance.expectedDayInWeek];
          expect(momentDate.date()).toEqual(instance.date);
        });
      });

      it('should return correct days (locale)', function () {
        moment.locale('de');

        var data = [
          {year: 2017, month: 0, date: 1, expectedWeek: 0, expectedDayInWeek: 6},
          {year: 2017, month: 1, date: 7, expectedWeek: 1, expectedDayInWeek: 1},
          {year: 2017, month: 2, date: 13, expectedWeek: 2, expectedDayInWeek: 0},
          {year: 2017, month: 3, date: 19, expectedWeek: 3, expectedDayInWeek: 2},
          {year: 2017, month: 4, date: 25, expectedWeek: 3, expectedDayInWeek: 3},
          {year: 2017, month: 5, date: 1, expectedWeek: 0, expectedDayInWeek: 3},
          {year: 2017, month: 6, date: 7, expectedWeek: 1, expectedDayInWeek: 4},
          {year: 2017, month: 7, date: 13, expectedWeek: 1, expectedDayInWeek: 6},
          {year: 2017, month: 8, date: 19, expectedWeek: 3, expectedDayInWeek: 1},
          {year: 2017, month: 9, date: 25, expectedWeek: 4, expectedDayInWeek: 2},
          {year: 2017, month: 10, date: 1, expectedWeek: 0, expectedDayInWeek: 2},
          {year: 2017, month: 11, date: 7, expectedWeek: 1, expectedDayInWeek: 3}
        ];

        data.forEach(function (instance) {
          var week = ktDayPickerSvc.getWeeksInMonth(instance.year, instance.month)[instance.expectedWeek];
          var momentDate = week.dates[instance.expectedDayInWeek];
          expect(momentDate.date()).toEqual(instance.date);
        });
      });
    });

    describe('getDayHeaders', function () {
      it('should return formatted day names', function () {
        expect(ktDayPickerSvc.getDayHeaders()).toEqual(['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']);
      });

      it('should return formatted day names (locale)', function () {
        moment.locale('de');
        expect(ktDayPickerSvc.getDayHeaders()).toEqual(['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']);
      });
    });
  });
})();