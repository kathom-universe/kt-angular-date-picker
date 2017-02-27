(function () {
  'use strict';

  describe('Day Picker Service', function () {
    var ktDateBoundsService;

    beforeEach(module('kt.datePicker'));

    beforeEach(inject(function (_ktDateBoundsService_) {
      moment.locale('en');
      ktDateBoundsService = _ktDateBoundsService_;
    }));

    describe('isDateWithinBounds', function () {
      it('should return true if min and max dates are not set', function () {
        expect(ktDateBoundsService.isDateWithinBounds(moment('2017-06-15'))).toBeTruthy();
      });

      it('should return true if min date after max date', function () {
        expect(
          ktDateBoundsService.isDateWithinBounds(moment('2017-06-15'), moment('2017-06-20'), moment('2017-06-10'))
        ).toBeTruthy();
      });

      it('should return correct value if either min or max dates are not set', function () {
        expect(ktDateBoundsService.isDateWithinBounds(moment('2017-06-15'), moment('2017-04-01'))).toBeTruthy();
        expect(ktDateBoundsService.isDateWithinBounds(moment('2017-06-15'), moment('2017-08-30'))).toBeFalsy();

        expect(ktDateBoundsService.isDateWithinBounds(moment('2017-06-15'), undefined, moment('2017-04-01'))).toBeFalsy();
        expect(ktDateBoundsService.isDateWithinBounds(moment('2017-06-15'), undefined, moment('2017-08-30'))).toBeTruthy();
      });

      it('should handle precision and inclusivity', function () {
        var data = [
          [moment('2017-06-15'), moment('2017-04-01'), undefined, 'year', undefined, true],
          [moment('2017-06-15'), moment('2017-06-01'), undefined, 'month', undefined, true],
          [moment('2017-06-15'), moment('2017-06-20'), undefined, 'month', undefined, true],
          [moment('2017-06-15'), moment('2017-06-20'), undefined, 'date', undefined, false],
          [moment('2017-06-15'), undefined, moment('2017-06-20'), 'year', undefined, true],
          [moment('2017-06-15'), undefined, moment('2017-06-15'), 'month', undefined, true],
          [moment('2017-06-15'), undefined, moment('2017-06-10'), 'month', undefined, true],
          [moment('2017-06-15'), undefined, moment('2017-06-10'), 'date', undefined, false],
          [moment('2017-06-15'), moment('2017-06-01'), moment('2017-06-30'), 'month', undefined, false],
          [moment('2017-06-15'), moment('2017-05-01'), moment('2017-07-30'), 'month', undefined, true],
          [moment('2017-06-15'), moment('2017-06-01'), moment('2017-06-30'), 'month', '[]', true],
          [moment('2017-06-15'), moment('2017-06-01'), moment('2017-06-30'), 'date', undefined, true],
          [moment('2017-06-15'), moment('2017-06-15'), moment('2017-06-30'), 'date', undefined, false],
          [moment('2017-06-15'), moment('2017-06-15'), moment('2017-06-30'), 'date', '[]', true]
        ];

        data.forEach(function (instance) {
          expect(ktDateBoundsService.isDateWithinBounds(instance[0], instance[1], instance[2], {
            precision: instance[3], inclusivity: instance[4]
          })).toEqual(instance[5]);
        });
      });

      it('should allow date formats', function () {
        var data = [
          ['15.06.2017', '01.06.2017', '30.06.2017', 'month', '[]', 'DD.MM.YYYY', true],
          [moment('2017-06-15'), '01.06.2017', '30.06.2017', 'month', '[]', 'DD.MM.YYYY', true],
          ['15.06.2017', moment('2017-06-01'), '30.06.2017', 'month', '[]', 'DD.MM.YYYY', true],
          ['15.06.2017', moment('2017-06-01'), moment('2017-06-12'), undefined, undefined, 'DD.MM.YYYY', false],
          ['15.06.2017', moment('2017-06-01'), undefined, 'month', '[]', 'DD.MM.YYYY', true]
        ];

        data.forEach(function (instance) {
          expect(ktDateBoundsService.isDateWithinBounds(instance[0], instance[1], instance[2],
            {precision: instance[3], inclusivity: instance[4], format: instance[5]}
          )).toEqual(instance[6]);
        });
      });

      it('should throw error when invalid format', function () {
        expect(function () {
          ktDateBoundsService.isDateWithinBounds(moment('2017-06-15'), '15.04.2017')
        }).toThrowError();

        expect(function () {
          ktDateBoundsService.isDateWithinBounds(moment('2017-06-15'), '15.04.2017', undefined, {format: 'X'})
        }).toThrowError();
      });
    });

    describe('roundMoment', function () {
      it('should round to year', function () {
        var date = moment('2017-06-02');
        var actual = ktDateBoundsService.roundMoment(date, 'year');
        expect(actual.isSame('2017-01-01')).toBeTruthy();
        expect(actual).not.toBe(date);
      });

      it('should round to month', function () {
        var date = moment('2017-04-15');
        var actual = ktDateBoundsService.roundMoment(date, 'month');
        expect(actual.isSame('2017-04-01')).toBeTruthy();
        expect(actual).not.toBe(date);
      });

      it('should return clone if unsupported roundTo parameter', function () {
        var date = moment('2017-04-15');
        var actual = ktDateBoundsService.roundMoment(date, 'something');
        expect(actual.isSame('2017-04-15')).toBeTruthy();
        expect(actual).not.toBe(date);
      });
    });

    describe('getDateWithinBounds', function () {
      it('should return new moment', function () {
        var data = [
          {date: moment('2017-06-02')},
          {date: '15.04.2017', format: 'DD.MM.YYYY'},
          {date: undefined},
          {date: moment('2017-06-02'), minDate: '15.04.2017', format: 'DD.MM.YYYY'}
        ];

        data.forEach(function (instance) {
          var actual = ktDateBoundsService.getMomentWithinBounds(instance.date, instance.minDate, instance.maxDate, {
            format: instance.format
          });
          expect(actual).not.toBe(instance.date);
        });
      });

      it('should return clone of moment if within bounds', function () {
        var data = [
          {date: moment('2017-04-15'), minDate: '03.03.2017', maxDate: '15.05.2017', format: 'DD.MM.YYYY'},
          {date: '15.04.2017', minDate: undefined, maxDate: '15.05.2017', format: 'DD.MM.YYYY'},
          {date: moment('2017-04-15'), minDate: '03.03.2017', maxDate: undefined, format: 'DD.MM.YYYY'},
          {date: '15.04.2017', minDate: undefined, maxDate: undefined, format: 'DD.MM.YYYY'},
          {date: '15.04.2017', minDate: undefined, maxDate: '15.02.2017', format: 'DD.MM.YYYY', precision: 'year'}
        ];

        data.forEach(function (instance) {
          var actual = ktDateBoundsService.getMomentWithinBounds(instance.date, instance.minDate, instance.maxDate, {
            format: instance.format, precision: instance.precision
          });
          var expected = moment(instance.date, instance.date instanceof moment ? undefined : instance.format);

          expect(actual).not.toBe(instance.date);
          expect(actual.isSame(expected)).toBeTruthy();
        });
      });

      it('should round if outside range and roundTo option specified', function () {
        var actual = ktDateBoundsService.getMomentWithinBounds(moment('2017-06-02'), moment('2017-08-03'), undefined, {
          roundTo: 'month'
        });
        var expected = moment('2017-06-01');
        expect(actual.isSame(expected)).toBeTruthy();
      });

      it('should return min or max date if date outside range and rounding not specified', function () {
        var actual = ktDateBoundsService.getMomentWithinBounds(moment('2017-06-02'), moment('2017-08-03'));
        var expected = moment('2017-08-03');
        expect(actual.isSame(expected)).toBeTruthy();

        var actual = ktDateBoundsService.getMomentWithinBounds(moment('2017-06-02'), undefined, moment('2017-04-03'));
        var expected = moment('2017-04-03');
        expect(actual.isSame(expected)).toBeTruthy();
      });
    });
  });
})();