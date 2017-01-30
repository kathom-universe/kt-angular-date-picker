(function (){
  'use strict';

  angular.module('kt.util', [
    'kt.util.dom',
    'kt.util.style'
  ]);




  var domUtil = angular.module('kt.util.dom', []);

  domUtil.factory('ktDomTree', [function () {
    var service = {};

    function findParentByTag(element, tag) {
      while (element.parentNode) {
        element = element.parentNode;
        if (element.tagName === tag)
          return element;
      }
      return null;
    }

    function findParentByClass(element, className) {
      while (element.parentNode) {
        element = element.parentNode;
        if ((' ' + element.className + ' ').indexOf(' ' + className + ' ') > -1) {
          return element;
        }
      }
      return null;
    }

    service.closest = function (element, selector) {
      switch (selector.charAt(0)) {
        case '.': return findParentByClass(element, selector.substring(1));
        default: return findParentByTag(element, selector.toUpperCase());
      }
    };

    return service;
  }]);

  domUtil.factory('ktOffset', ['ktDimensions', function (ktDimensions) {
    var service = {};

    service.offset = function (element) {
      var box = element.getBoundingClientRect();

      var body = document.body;
      var docElement = document.documentElement;

      var scrollTop = window.pageYOffset || docElement.scrollTop || body.scrollTop;
      var scrollLeft = window.pageXOffset || docElement.scrollLeft || body.scrollLeft;

      var clientTop = docElement.clientTop || body.clientTop || 0;
      var clientLeft = docElement.clientLeft || body.clientLeft || 0;

      return {
        top : Math.round(box.top + scrollTop - clientTop),
        left: Math.round(box.left + scrollLeft - clientLeft)
      };
    };

    service.boundingRectangle = function (element) {
      var offset = service.offset(element);
      var width = ktDimensions.outerWidth(element);
      var height = ktDimensions.outerHeight(element);

      return {
        left  : offset.left,
        right : offset.left + width,
        top   : offset.top,
        bottom: offset.top + height
      };
    };

    return service;
  }]);

  domUtil.factory('ktDimensions', [function () {
    var service = {};

    service.outerWidth = function (element, includeMargin) {
      if (!includeMargin) {
        return element.offsetWidth;
      }

      var width = element.offsetWidth;
      var style = getComputedStyle(element);

      width += parseInt(style.marginLeft) + parseInt(style.marginRight);
      return width;
    };

    service.outerHeight = function (element, includeMargin) {
      if (!includeMargin) {
        return element.offsetHeight;
      }

      var height = element.offsetHeight;
      var style = getComputedStyle(element);

      height += parseInt(style.marginTop) + parseInt(style.marginBottom);
      return height;
    };

    return service;
  }]);




  var styleUtil = angular.module('kt.util.style', []);

  styleUtil.directive('ktHideScrollbar', [function () {
    var scrollbarWidth = getScrollBarWidth();

    function getScrollBarWidth () {
      var inner = document.createElement('p');
      inner.style.width = "100%";
      inner.style.height = "200px";

      var outer = document.createElement('div');
      outer.style.position = "absolute";
      outer.style.top = "0px";
      outer.style.left = "0px";
      outer.style.visibility = "hidden";
      outer.style.width = "200px";
      outer.style.height = "150px";
      outer.style.overflow = "hidden";
      outer.appendChild (inner);

      document.body.appendChild (outer);
      var w1 = inner.offsetWidth;
      outer.style.overflow = 'scroll';
      var w2 = inner.offsetWidth;
      if (w1 == w2) w2 = outer.clientWidth;

      document.body.removeChild (outer);

      return (w1 - w2);
    }

    return {
      restrict: 'A',
      link: function (scope, element) {
        element.css('margin-right', -Math.abs(scrollbarWidth) + 'px');
      }
    };
  }]);





  var dropdown = angular.module('kt.dropdown', ['kt.util.dom']);

  dropdown.factory('ktDropdownSvc', ['$timeout', 'ktOffset', function ($timeout, ktOffset) {
    var current = undefined;
    var dropdowns = [];
    var service = {};

    service.addDropdown = function (element, targets) {
      var dropdown = {
        element: element,
        targets: targets
      };
      dropdowns.push(dropdown);

      return dropdown;
    };

    service.removeDropdown = function (dropdown) {
      if (service.isOpen(dropdown)) {
        service.closeDropdown(dropdown);
      }
      var index = dropdowns.indexOf(dropdown);
      dropdowns.splice(index, 1);
    };

    service.openDropdown = function (dropdown) {
      service.closeCurrent();
      dropdown.targets.forEach(function (target) {
        service.openTarget(target);
        target.bounds = ktOffset.boundingRectangle(target[0]);
        target.bind('DOMSubtreeModified', function () {
          $timeout(function () {
            target.bounds = ktOffset.boundingRectangle(target[0]);
          });
        });
      });
      dropdown.element.addClass('kt-dropdown-open');
      current = dropdown;
    };

    service.closeDropdown = function (dropdown) {
      dropdown.targets.forEach(function (target) {
        service.closeTarget(target);
      });
      dropdown.element.removeClass('kt-dropdown-open');
      current = undefined;
    };

    service.closeCurrent = function () {
      if (current) {
        service.closeDropdown(current);
      }
    };

    service.toggleDropdown = function (dropdown) {
      if (service.isOpen(dropdown)) {
        service.closeDropdown(dropdown);
      } else {
        service.openDropdown(dropdown);
      }
    };

    service.isCurrent = function (dropdown) {
      return current === dropdown;
    };

    service.openTarget = function (target) {
      target.removeClass('kt-dropdown-target-closed');
      target.addClass('kt-dropdown-target-open');
    };

    service.closeTarget = function (target) {
      target.removeClass('kt-dropdown-target-open');
      target.addClass('kt-dropdown-target-closed');
    };

    service.isOpen = function (dropdown) {
      return dropdown.element.hasClass('kt-dropdown-open');
    };

    service.getCurrent = function () {
      return current;
    };

    return service;
  }]);

  dropdown.directive('ktDropdown', ['$timeout', 'ktDropdownSvc', function ($timeout, ktDropdownSvc) {
    function link(scope, element, attributes) {
      if (!attributes.ktDropdown) {
        return;
      }

      var dropdown = undefined;

      scope.isOpen = function () {
        return ktDropdownSvc.isCurrent(dropdown);
      };

      $timeout(function () {
        var targets = [];
        Array.prototype.slice.call(document.querySelectorAll(attributes.ktDropdown)).forEach(function (target) {
          var t = angular.element(target);
          ktDropdownSvc.closeTarget(t);
          targets.push(t);
        });
        dropdown = ktDropdownSvc.addDropdown(element, targets);
      });

      element.on('click', function () {
        document.removeEventListener('click', onDocumentClick, false);

        if (!ktDropdownSvc.isCurrent(dropdown)) {
          ktDropdownSvc.openDropdown(dropdown);
        } else if (attributes.ktDropdownToggle == true) {
          ktDropdownSvc.toggleDropdown(dropdown);
        }

        $timeout(function () {
          document.addEventListener('click', onDocumentClick, false);
        });
      });

      scope.$on('$destroy', function () {
        ktDropdownSvc.removeDropdown(dropdown);
      });
    }

    var onDocumentClick = function(e) {
      var dropdown = ktDropdownSvc.getCurrent();
      if (!dropdown || !dropdown.targets) {
        return;
      }

      var clickedInsideCurrent = false;

      dropdown.targets.forEach(function (target) {
        if (e.pageX >= target.bounds.left && e.pageX <= target.bounds.right
          && e.pageY >= target.bounds.top && e.pageY <= target.bounds.bottom) {
          clickedInsideCurrent = true;
        }
      });

      if (!clickedInsideCurrent && e.target.tagName !== 'OPTION') {
        ktDropdownSvc.closeCurrent();
      }
    };

    return {
      restrict: 'A',
      link    : link
    };
  }]);




  angular.module('kt.datePicker', ['kt.util.style', 'kt.dropdown']);




  angular

    .module('kt.datePicker')

    .factory('ktDateBoundsService', function () {
      var service = {};

      function convertToMoment(date, format) {
        if (date instanceof moment || !date) {
          return date;
        }

        var dateMoment = moment(date, format, true);

        if (!dateMoment.isValid()) {
          throw new Error('Cannot convert ' + date.toString() + ' to moment using format \'' + format + '\'');
        }

        return moment(date, format);
      }

      service.isDateWithinBounds = function (date, minDate, maxDate, options) {
        var options = angular.extend({
          precision: undefined,
          inclusivity: undefined,
          format: undefined
        }, options);

        var dateMoment = convertToMoment(date, options.format);
        var minMoment = convertToMoment(minDate, options.format);
        var maxMoment = convertToMoment(maxDate, options.format);

        if (minMoment && maxMoment && minMoment.isAfter(maxMoment, options.precision)) {
          return true;
        }

        if (minMoment && maxMoment) {
          return dateMoment.isBetween(minMoment, maxMoment, options.precision, options.inclusivity);
        }

        if (minMoment && !maxMoment) {
          return dateMoment.isSameOrAfter(minMoment, options.precision);
        }

        if (!minMoment && maxMoment) {
          return dateMoment.isSameOrBefore(maxMoment, options.precision);
        }

        return true;
      };

      service.roundMoment = function (dateMoment, roundTo) {
        switch (roundTo) {
          case 'month': return dateMoment.clone().date(1);
          case 'year' : return dateMoment.clone().dayOfYear(1);
        }

        return dateMoment.clone();
      }

      service.getMomentWithinBounds = function (date, minDate, maxDate, options) {
        var options = angular.extend({
          precision: undefined,
          inclusivity: undefined,
          format: undefined,
          roundTo: undefined
        }, options);

        var dateMoment = convertToMoment(date, options.format);
        var minMoment = convertToMoment(minDate, options.format);
        var maxMoment = convertToMoment(maxDate, options.format);

        dateMoment = dateMoment ? dateMoment.clone() : moment().clone();

        if (service.isDateWithinBounds(dateMoment, minMoment, maxMoment, {
          precision: options.precision, inclusivity: options.inclusivity
        })) {
          return dateMoment;
        }

        if (options.roundTo) {
          return service.roundMoment(dateMoment, options.roundTo);
        }

        return angular.isDefined(minMoment) ? minMoment.clone() : maxMoment.clone();
      };

      return service;
    });





  angular

    .module('kt.datePicker')

    .factory('ktDayPickerSvc', [function () {
      var service = {};
      var dayHeaders;

      function getWeekRangeForMonth(year, month) {
        var date = moment().set({year: year, month: month});
        var start = date.clone().startOf('month');
        var end = date.clone().endOf('month');

        var startWeek = start.week();
        var endWeek = end.week();

        if (start.weekYear() < end.weekYear()) {
          startWeek = month === 0 ? 0 : startWeek;
        }

        if (startWeek > endWeek && startWeek > 40) {
          endWeek = date.weeksInYear() + endWeek;
        }

        return {
          startWeek: startWeek,
          endWeek  : endWeek
        };
      }

      function getDatesInWeek(year, week) {
        var date = moment().year(year).week(week);
        var days = [];
        for (var i = 0; i < 7; i++) {
          days.push(date.clone().weekday(i));
        }

        return days;
      }

      service.getWeeksInMonth = function (year, month) {
        var weeksInMonth = getWeekRangeForMonth(year, month);
        var weeks = [];
        for (var i = weeksInMonth.startWeek; i <= weeksInMonth.endWeek; i++) {
          weeks.push({week: i, dates: getDatesInWeek(year, i)});
        }

        return weeks;
      };

      service.getDayHeaders = function () {
        if (!dayHeaders) {
          dayHeaders = [];
          for (var i = 0; i < 7; i++) {
            dayHeaders.push(moment().clone().weekday(i).format('dd'));
          }
        }

        return dayHeaders;
      };

      return service;
    }]);




  angular

    .module('kt.datePicker')

    .filter('monthFormat', [function () {
      return function (input) {
        return moment.months()[input];
      };
    }]);




  angular

    .module('kt.datePicker')

    .directive('ktDatePickerNextIcon', function () {
      return {
        restrict: 'E',
        template: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><path d="M9 3L7.94 4.06l4.19 4.19H3v1.5h9.13l-4.19 4.19L9 15l6-6z"></path></svg>'
      };
    })

    .directive('ktDatePickerPreviousIcon', function () {
      return {
        restrict: 'E',
        template: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><path d="M15 8.25H5.87l4.19-4.19L9 3 3 9l6 6 1.06-1.06-4.19-4.19H15v-1.5z"></path></svg>'
      };
    });




  angular

    .module('kt.datePicker')

    .directive('ktDatePicker', [function () {
      return {
        restrict   : 'E',
        scope      : {
          ngModel  : '=',
          minDate: '=',
          maxDate: '=',
          format : '@'
        },
        templateUrl: 'html/kt-date-picker.html',
        link       : function (scope, element) {
          scope.element = element;
          var currentPicker = 'day';

          scope.setCurrentPicker = function (picker) {
            currentPicker = picker;
          };

          scope.isCurrentPicker = function (picker) {
            return currentPicker === picker;
          };

          scope.$on('dayPicker:daySelect', function (ev) {
            scope.$emit('datePicker:dateSelect');

            ev.stopPropagation();
          });

          scope.$on('dayPicker:monthClick', function (ev) {
            currentPicker = 'month';
            ev.stopPropagation();
          });

          scope.$on('monthPicker:monthSelect', function (ev) {
            currentPicker = 'day';
            ev.stopPropagation();
          });

          scope.$on('yearPicker:yearSelect', function (ev) {
            currentPicker = 'month';
            ev.stopPropagation();
          });

          scope.$on('monthPicker:yearClick', function (ev) {
            currentPicker = 'year';
            ev.stopPropagation();
          });
        }
      }
    }])

    .directive('ktDatePickerInput', ['ktDateBoundsService', function (ktDateBounds) {
      var instanceCount = 0;

      return {
        restrict   : 'E',
        scope      : {
          date   : '=',
          minDate: '=',
          maxDate: '=',
          format : '@'
        },
        templateUrl: 'html/kt-date-picker-input.html',
        link       : function (scope) {
          scope.instanceCount = instanceCount++;
          scope.dateString = '';

          scope.date = ktDateBounds.getDateWithinBounds(scope.date, scope.minDate, scope.maxDate);

          scope.$watch('date', function (date) {
            scope.dateString = date.format(scope.format);
          }, true);

          scope.dateStringChanged = function () {
            var date = moment(scope.dateString, scope.format, true);

            if (!date.isValid() || !ktDateBounds.isDateWithinBounds(date, scope.minDate, scope.maxDate, {inclusivity: '[]'})) {
              return;
            }

            scope.date.year(date.year()).month(date.month()).date(date.date());
          };
        }
      };
    }]);




  var dateRangePicker = angular.module('kt.datePicker');

  dateRangePicker.directive('ktDateRangePicker', ['$timeout', 'ktDateBoundsService', function ($timeout, ktDateBounds) {
    return {
      restrict   : 'E',
      scope      : {
        startDate: '=',
        endDate  : '=',
        minDate  : '=',
        maxDate  : '=',
        format   : '@'
      },
      templateUrl: 'html/kt-date-range-picker.html',
      link       : function (scope, element) {
        scope.element = element;
        var currentPicker = 'start';

        scope.$watch('startDate', function (startDate) {
          var date = ktDateBounds.getMomentWithinBounds(scope.endDate, startDate, scope.maxDate, {
            precision: 'day',
            inclusivity: '[]',
            format: scope.format
          });
          scope.endDate = scope.format ? date.format(scope.format) : date;
        });

        scope.$on('datePicker:dateSelect', function (ev) {
          ev.stopPropagation();

          $timeout(function () {
            currentPicker = currentPicker === 'start' ? 'end' : 'start';
          }, 0);
        });

        scope.isCurrentPicker = function (picker) {
          return currentPicker === picker;
        };

        scope.setCurrentPicker = function (picker) {
          currentPicker = picker;
        };

        scope.getDisplayedDate = function (date) {
          return moment(date, scope.format).format('D. MMMM YYYY');
        }
      }
    };
  }]);

  dateRangePicker.directive('ktDateRangePickerInput', ['ktDateBoundsService', function (ktDateBounds) {
    var instanceCount = 0;

    return {
      restrict: 'E',
      scope: {
        startDate: '=',
        endDate: '=',
        minDate: '=',
        maxDate: '=',
        format: '@',
        divider: '@'
      },
      templateUrl: 'html/kt-date-range-picker-input.html',
      link: function (scope) {
        scope.instanceCount = instanceCount++;
        scope.dateRangeString = '';

        scope.startDate =  ktDateBounds.getDateWithinBounds(scope.startDate, scope.minDate, scope.maxDate);
        scope.endDate =  ktDateBounds.getDateWithinBounds(scope.endDate, scope.minDate, scope.maxDate);

        scope.$watch('[startDate, endDate]', function (dates) {
          scope.dateRangeString = dates[0].format(scope.format) + scope.divider + dates[1].format(scope.format);
        }, true);

        scope.dateRangeStringChanged = function () {
          var dates = scope.dateRangeString.split(scope.divider);

          if (dates.length !== 2) {
            return;
          }

          var startDate = moment(dates[0], scope.format, true);
          var endDate = moment(dates[1], scope.format, true);

          if (!startDate.isValid() || !endDate.isValid()) {
            return;
          }

          if (
            !ktDateBounds.isDateWithinBounds(startDate, scope.minDate, scope.maxDate, {inclusivity: '[]'}) ||
            !ktDateBounds.isDateWithinBounds(endDate, startDate, scope.maxDate, {inclusivity: '[]'})
          ) {
            return;
          }

          scope.startDate.year(startDate.year()).month(startDate.month()).date(startDate.date());
          scope.endDate.year(endDate.year()).month(endDate.month()).date(endDate.date());
        };
      }
    };
  }]);




  angular

    .module('kt.datePicker')

    .directive('ktDayPicker', ['ktDayPickerSvc', 'ktDateBoundsService', function (dayPickerService, ktDateBounds) {
      return {
        restrict   : 'E',
        require    : 'ngModel',
        templateUrl: 'html/kt-day-picker.html',
        scope      : {
          minDate: '=',
          maxDate: '=',
          format : '@'
        },
        link       : function (scope, element, attributes, ngModelController) {
          scope.dayPicker = {
            month     : undefined,
            year      : undefined,
            weeks     : undefined,
            dayHeaders: dayPickerService.getDayHeaders()
          };

          scope.date = ktDateBounds.getMomentWithinBounds(scope.date, scope.minDate, scope.maxDate, {
            precision: 'day',
            inclusivity: '[]',
            format: scope.format
          });

          scope.$watch(function () {
            return ngModelController.$modelValue;
          }, function(newValue) {
            scope.date = moment(newValue, scope.format);
            resetDayPicker(scope.date);
          });

          scope.selectDate = function (date) {
            scope.date.year(date.year()).month(date.month()).date(date.date());
            ngModelController.$setViewValue(scope.format ? scope.date.format(scope.format) : scope.date);

            scope.$emit('dayPicker:daySelect');
          };

          scope.previousMonth = function () {
            var date = moment({year: scope.dayPicker.year, month: scope.dayPicker.month});
            date.subtract(1, 'months');
            resetDayPicker(date);
          };

          scope.hasPreviousMonth = function () {
            var minDate = scope.minDate ? moment(scope.minDate, scope.format) : undefined;
            var maxDate = scope.maxDate ? moment(scope.maxDate, scope.format) : undefined;

            var date = moment({year: scope.dayPicker.year, month: scope.dayPicker.month});
            date.subtract(1, 'months');
            return ktDateBounds.isDateWithinBounds(date, minDate, maxDate, {precision: 'month', inclusivity: '[]'});
          };

          scope.nextMonth = function () {
            var date = moment({year: scope.dayPicker.year, month: scope.dayPicker.month});
            date.add(1, 'months');
            resetDayPicker(date);
          };

          scope.hasNextMonth = function () {
            var minDate = scope.minDate ? moment(scope.minDate, scope.format) : undefined;
            var maxDate = scope.maxDate ? moment(scope.maxDate, scope.format) : undefined;

            var date = moment({year: scope.dayPicker.year, month: scope.dayPicker.month});
            date.add(1, 'months');
            return ktDateBounds.isDateWithinBounds(date, minDate, maxDate, {precision: 'month', inclusivity: '[]'});
          };

          scope.isSelected = function (date) {
            if (!scope.date) {
              return false;
            }

            return date.year() === scope.date.year()
              && date.month() === scope.date.month()
              && date.date() === scope.date.date();
          };

          scope.isOverflowing = function (date) {
            return date.month() !== scope.dayPicker.month;
          };

          scope.isInMinMaxRange = function (date) {
            var minDate = scope.minDate ? moment(scope.minDate, scope.format) : undefined;
            var maxDate = scope.maxDate ? moment(scope.maxDate, scope.format) : undefined;

            return ktDateBounds.isDateWithinBounds(date, minDate, maxDate, {precision: 'day', inclusivity: '[]'});
          };

          scope.monthClick = function () {
            scope.$emit('dayPicker:monthClick');
          };

          scope.canChooseMonth = function () {
            var parentElement = scope.$parent.element ? scope.$parent.element : undefined;

            if (parentElement && parentElement.prop('tagName').toLowerCase() === 'kt-date-picker' && (scope.hasPreviousMonth() || scope.hasNextMonth())) {
              return true;
            }

            return false;
          };


          scope.$on('monthPickerSelect', function (event, month) {
            var date = moment({year: scope.dayPicker.year, month: month});
            resetDayPicker(date);
          });

          function resetDayPicker(date) {
            if (scope.dayPicker.month === date.month() && scope.dayPicker.year === date.year()) {
              return;
            }

            scope.dayPicker.month = date.month();
            scope.dayPicker.year = date.year();
            scope.dayPicker.weeks = dayPickerService.getWeeksInMonth(scope.dayPicker.year, scope.dayPicker.month);
          }
        }
      };
    }]);




  angular.module('kt.datePicker')

    .directive('ktMonthPicker', ['ktDateBoundsService', function (ktDateBounds) {
      var months;

      function getMonths() {
        if (!months) {
          months = [];
          for (var i = 0; i < 12; i++) {
            months.push(i);
          }
        }

        return months;
      }

      return {
        restrict   : 'E',
        require: 'ngModel',
        scope      : {
          minDate: '=',
          maxDate: '=',
          format : '@'
        },
        templateUrl: 'html/kt-month-picker.html',
        link       : function (scope, element, attributes, ngModelController) {
          scope.monthPicker = {
            year  : scope.date ? scope.date.year : moment().clone().year(),
            months: getMonths()
          };

          scope.date = ktDateBounds.getMomentWithinBounds(scope.date, scope.minDate, scope.maxDate, {
            precision: 'month',
            inclusivity: '[]',
            format: scope.format
          });

          scope.$watch(function () {
            return ngModelController.$modelValue;
          }, function(newValue) {
            scope.date = moment(newValue, scope.format);
            scope.monthPicker.year = scope.date.year();
          });

          scope.isSelected = function (month) {
            return scope.date.year() === scope.monthPicker.year && scope.date.month() === month;
          };

          scope.isInMinMaxRange = function (month) {
            var date = moment().clone().year(scope.monthPicker.year).month(month);
            var minDate = scope.minDate ? moment(scope.minDate, scope.format) : undefined;
            var maxDate = scope.maxDate ? moment(scope.maxDate, scope.format) : undefined;

            return ktDateBounds.isDateWithinBounds(date, minDate, maxDate, {precision: 'month', inclusivity: '[]'});
          };

          scope.selectMonth = function (month) {
            var date = scope.date.clone().year(scope.monthPicker.year).month(month);

            scope.date = ktDateBounds.getMomentWithinBounds(date, scope.minDate, scope.maxDate, {
              precision: 'day',
              inclusivity: '[]',
              format: scope.format,
              roundTo: 'month'
            });

            ngModelController.$setViewValue(scope.format ? scope.date.format(scope.format) : scope.date);

            scope.$emit('monthPicker:monthSelect');
          };

          scope.previousYear = function () {
            scope.monthPicker.year = scope.monthPicker.year - 1;
          };

          scope.hasPreviousYear = function () {
            var date = moment({year: scope.monthPicker.year});
            date.subtract(1, 'year');
            var minDate = scope.minDate ? moment(scope.minDate, scope.format) : undefined;
            var maxDate = scope.maxDate ? moment(scope.maxDate, scope.format) : undefined;

            return ktDateBounds.isDateWithinBounds(date, minDate, maxDate, {precision: 'year', inclusivity: '[]'});
          };

          scope.nextYear = function () {
            scope.monthPicker.year = scope.monthPicker.year + 1;
          };

          scope.hasNextYear = function () {
            var date = moment({year: scope.monthPicker.year});
            date.add(1, 'year');
            var minDate = scope.minDate ? moment(scope.minDate, scope.format) : undefined;
            var maxDate = scope.maxDate ? moment(scope.maxDate, scope.format) : undefined;

            return ktDateBounds.isDateWithinBounds(date, minDate, maxDate, {precision: 'year', inclusivity: '[]'});
          };

          scope.yearClick = function () {
            scope.$emit('monthPicker:yearClick');
          };

          scope.canChooseYear = function () {
            return scope.hasPreviousYear() || scope.hasNextYear();
          };
        }
      };
    }]);




  angular

    .module('kt.datePicker')

    .directive('ktTimePicker', [function () {
      var hours, minutes;

      function getHours() {
        if (!hours) {
          hours = [];
          for (var i = 0; i < 24; i++) {
            hours.push(i);
          }
        }

        return hours;
      }

      function getMinutes() {
        if (!minutes) {
          minutes = [];
          for (var i = 0; i < 60; i++) {
            minutes.push(i);
          }
        }

        return minutes;
      }

      return {
        restrict   : 'E',
        templateUrl: 'html/kt-time-picker.html',
        scope      : {
          date: '='
        },
        link       : function (scope) {
          scope.timePicker = {
            hours  : getHours(),
            minutes: getMinutes()
          };

          scope.isHourSelected = function (hour) {
            if (!scope.date) {
              return false;
            }

            return scope.date.hour() === hour;
          };

          scope.isMinuteSelected = function (minute) {
            if (!scope.date) {
              return false;
            }

            return scope.date.minute() === minute;
          };

          scope.selectHour = function (hour) {
            if (!scope.date) {
              scope.date = moment().clone().hour(hour);
            } else {
              scope.date.hour(hour);
            }
          };

          scope.selectMinute = function (minute) {
            if (!scope.date) {
              scope.date = moment().clone().minute(minute);
            } else {
              scope.date.minute(minute);
            }
          };
        }
      };
    }])

    .directive('ktTimePickerInput', [function () {
      var instanceCount = 0;

      return {
        restrict: 'E',
        scope   : {
          date  : '=',
          format: '@'
        },
        template: '<input type="text" ng-model="timeString" ng-change="timeStringChanged()" kt-dropdown=".ktTimePickerInput_{{instanceCount}}">' +
        '<kt-time-picker class="ktTimePickerInput_{{instanceCount}}" date="date"></kt-time-picker>',
        link    : function (scope) {
          scope.instanceCount = instanceCount++;
          scope.timeString = '';

          scope.$watch('date', function (date) {
            if (!date) {
              return;
            }

            scope.timeString = date.format(scope.format);
          }, true);

          scope.timeStringChanged = function () {
            var date = moment(scope.timeString, scope.format, true);

            if (!date.isValid()) {
              return;
            }

            if (!scope.date) {
              scope.date = date.clone();
            } else {
              scope.date.hour(date.hour()).minute(date.minute());
            }
          };
        }
      };
    }]);




  angular

    .module('kt.datePicker')

    .directive('ktYearPicker', ['ktDateBoundsService', function (ktDateBounds) {
      function getDecade(year) {
        var start = year - year % 10;
        var end = start + 9;

        return {
          start: start,
          end  : end
        }
      }

      function getYears(decade) {
        var years = [];

        for (var i = decade.start - 1; i <= decade.end + 1; i++) {
          years.push(i);
        }

        return years;
      }

      return {
        restrict   : 'E',
        require    : 'ngModel',
        templateUrl: 'html/kt-year-picker.html',
        scope      : {
          minDate: '=',
          maxDate: '=',
          format : '@'
        },
        link       : function (scope, element, attributes, ngModelController) {
          var decade = getDecade(scope.date ? scope.date.year() : moment().clone().year());

          scope.yearPicker = {
            decade: decade,
            years : getYears(decade)
          };

          scope.date = ktDateBounds.getMomentWithinBounds(scope.date, scope.minDate, scope.maxDate, {
            precision: 'year',
            inclusivity: '[]',
            format: scope.format
          });

          scope.$watch(function () {
            return ngModelController.$modelValue;
          }, function(newValue) {
            scope.date = moment(newValue, scope.format);
            if (scope.yearPicker.years.indexOf(scope.date.year()) === -1) {
              scope.yearPicker.decade = getDecade(scope.date.year());
              scope.yearPicker.years = getYears(scope.yearPicker.decade);
            }
          });

          scope.selectYear = function (year) {
            var date = scope.date.clone().year(year);

            scope.date = ktDateBounds.getMomentWithinBounds(date, scope.minDate, scope.maxDate, {
              precision: 'day',
              inclusivity: '[]',
              format: scope.format,
              roundTo: 'year'
            });

            ngModelController.$setViewValue(scope.format ? scope.date.format(scope.format) : scope.date);

            scope.$emit('yearPicker:yearSelect');
          };

          scope.previousDecade = function () {
            scope.yearPicker.decade.start -= 10;
            scope.yearPicker.decade.end -= 10;
            scope.yearPicker.years = getYears(scope.yearPicker.decade);
          };

          scope.hasPreviousDecade = function () {
            var date = moment().clone().year(scope.yearPicker.years[0]);
            date.subtract(1, 'years');
            return ktDateBounds.isDateWithinBounds(date, scope.minDate, scope.maxDate, {
              precision: 'year', inclusivity: '[]', format: scope.format
            });
          };

          scope.nextDecade = function () {
            scope.yearPicker.decade.start += 10;
            scope.yearPicker.decade.end += 10;
            scope.yearPicker.years = getYears(scope.yearPicker.decade);
          };

          scope.hasNextDecade = function () {
            var date = moment().clone().year(scope.yearPicker.years[0]);
            date.add(10, 'years');
            return ktDateBounds.isDateWithinBounds(date, scope.minDate, scope.maxDate, {
              precision: 'year', inclusivity: '[]', format: scope.format
            });
          };

          scope.isSelected = function (year) {
            if (!scope.date) {
              return false;
            }

            return year === scope.date.year();
          };

          scope.isOverflowing = function (year) {
            return year < scope.yearPicker.decade.start || year > scope.yearPicker.decade.end;
          };

          scope.isInMinMaxRange = function (year) {
            var date = moment().clone().year(year);
            var minDate = scope.minDate ? moment(scope.minDate, scope.format) : undefined;
            var maxDate = scope.maxDate ? moment(scope.maxDate, scope.format) : undefined;

            return ktDateBounds.isDateWithinBounds(date, minDate, maxDate, {precision: 'year', inclusivity: '[]'});
          };
        }
      };
    }]);


angular.module('kt.datePicker').run(['$templateCache', function($templateCache) {
  $templateCache.put("html/kt-date-picker-input.html",
    "<div>\n" +
    "  <input type=\"text\" ng-model=\"dateString\" ng-change=\"dateStringChanged()\" kt-dropdown=\".ktDatePickerInput_{{instanceCount}}\">\n" +
    "  <kt-date-picker class=\"ktDatePickerInput_{{instanceCount}} kt-dropdown-target\" date=\"date\" min-date=\"minDate\" max-date=\"maxDate\"></kt-date-picker>\n" +
    "</div>\n" +
    "");
  $templateCache.put("html/kt-date-picker.html",
    "<div>\n" +
    "  <kt-day-picker ng-model=\"$parent.ngModel\" min-date=\"$parent.minDate\" max-date=\"$parent.maxDate\" format=\"{{$parent.format}}\" ng-if=\"isCurrentPicker('day')\"></kt-day-picker>\n" +
    "  <kt-month-picker ng-model=\"$parent.ngModel\" min-date=\"$parent.minDate\" max-date=\"$parent.maxDate\" format=\"{{$parent.format}}\" ng-if=\"isCurrentPicker('month')\"></kt-month-picker>\n" +
    "  <kt-year-picker ng-model=\"$parent.ngModel\" min-date=\"$parent.minDate\" max-date=\"$parent.maxDate\" format=\"{{$parent.format}}\" ng-if=\"isCurrentPicker('year')\"></kt-year-picker>\n" +
    "</div>\n" +
    "");
  $templateCache.put("html/kt-date-range-picker-input.html",
    "<div>\n" +
    "  <input type=\"text\" ng-model=\"dateRangeString\" ng-change=\"dateRangeStringChanged()\" kt-dropdown=\".ktDateRangePickerInput_{{instanceCount}}\">\n" +
    "  <kt-date-range-picker class=\"ktDateRangePickerInput_{{instanceCount}} kt-dropdown-target\" start-date=\"startDate\" end-date=\"endDate\" min-date=\"minDate\" max-date=\"maxDate\"></kt-date-range-picker>\n" +
    "</div>\n" +
    "");
  $templateCache.put("html/kt-date-range-picker.html",
    "<div>\n" +
    "    <div class=\"kt-date-range-picker-header\" style=\"display: table; width: 100%\">\n" +
    "        <button ng-click=\"setCurrentPicker('start')\" ng-class=\"{'kt-date-range-picker-active-range': isCurrentPicker('start')}\">{{getDisplayedDate(startDate)}}</button>\n" +
    "        <button ng-click=\"setCurrentPicker('end')\" ng-class=\"{'kt-date-range-picker-active-range': isCurrentPicker('end')}\">{{getDisplayedDate(endDate)}}</button>\n" +
    "    </div>\n" +
    "    <kt-date-picker ng-model=\"$parent.startDate\" min-date=\"$parent.minDate\" max-date=\"$parent.maxDate\" format=\"{{$parent.format}}\" ng-if=\"isCurrentPicker('start')\"></kt-date-picker>\n" +
    "    <kt-date-picker ng-model=\"$parent.endDate\" min-date=\"$parent.startDate\" max-date=\"$parent.maxDate\" format=\"{{$parent.format}}\" ng-if=\"isCurrentPicker('end')\"></kt-date-picker>\n" +
    "</div>");
  $templateCache.put("html/kt-day-picker.html",
    "<div>\n" +
    "  <div class=\"kt-date-picker-header\">\n" +
    "    <button type=\"button\" ng-click=\"previousMonth()\" ng-disabled=\"!hasPreviousMonth()\"><kt-date-picker-previous-icon></kt-date-picker-previous-icon></button>\n" +
    "    <button type=\"button\" ng-click=\"monthClick()\" ng-disabled=\"!canChooseMonth()\">{{dayPicker.month | monthFormat}} {{dayPicker.year}}</button>\n" +
    "    <button type=\"button\" ng-click=\"nextMonth()\" ng-disabled=\"!hasNextMonth()\"><kt-date-picker-next-icon></kt-date-picker-next-icon></button>\n" +
    "  </div>\n" +
    "  <div class=\"kt-date-picker-content\">\n" +
    "    <div class=\"kt-day-picker-row\">\n" +
    "      <div class=\"kt-day-picker-day\" ng-repeat=\"dayHeader in dayPicker.dayHeaders\">\n" +
    "        {{dayHeader}}\n" +
    "      </div>\n" +
    "    </div>\n" +
    "    <div class=\"kt-day-picker-row kt-day-picker-week\" ng-repeat=\"week in dayPicker.weeks\">\n" +
    "      <div class=\"kt-day-picker-cell\"\n" +
    "           ng-repeat=\"date in week.dates\"\n" +
    "           ng-class=\"{'kt-date-picker-selected': isSelected(date), 'kt-date-picker-overflow': isOverflowing(date)}\">\n" +
    "        <button type=\"button\" ng-click=\"selectDate(date)\" ng-disabled=\"!isInMinMaxRange(date)\">\n" +
    "          {{date.format('D')}}\n" +
    "        </button>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"kt-date-picker-footer\"></div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("html/kt-month-picker.html",
    "<div>\n" +
    "  <div class=\"kt-date-picker-header\">\n" +
    "    <button type=\"button\" ng-click=\"previousYear()\" ng-disabled=\"!hasPreviousYear()\"><kt-date-picker-previous-icon></kt-date-picker-previous-icon></button>\n" +
    "    <button type=\"button\" ng-click=\"yearClick()\" ng-disabled=\"!canChooseYear()\">{{monthPicker.year}}</button>\n" +
    "    <button type=\"button\" ng-click=\"nextYear()\" ng-disabled=\"!hasNextYear()\"><kt-date-picker-next-icon></kt-date-picker-next-icon></button>\n" +
    "  </div>\n" +
    "  <div class=\"kt-date-picker-content\">\n" +
    "    <div class=\"kt-month-picker-cell\"\n" +
    "         ng-repeat=\"month in monthPicker.months\"\n" +
    "         ng-class=\"{'kt-date-picker-selected': isSelected(month)}\">\n" +
    "      <button type=\"button\" ng-click=\"selectMonth(month)\" ng-disabled=\"!isInMinMaxRange(month)\">{{month | monthFormat}}</button>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"kt-date-picker-footer\"></div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("html/kt-time-picker.html",
    "<div>\n" +
    "  <div class=\"kt-date-picker-header\">\n" +
    "    <div>Hour</div>\n" +
    "    <div>Minute</div>\n" +
    "  </div>\n" +
    "  <div class=\"kt-date-picker-content\">\n" +
    "    <div class=\"kt-time-picker-outer\">\n" +
    "      <div class=\"kt-time-picker-inner\" kt-hide-scrollbar>\n" +
    "        <div class=\"kt-time-picker-cell\"\n" +
    "             ng-repeat=\"hour in timePicker.hours\"\n" +
    "             ng-class=\"{'kt-date-picker-selected': isHourSelected(hour)}\">\n" +
    "          <button type=\"button\" ng-click=\"selectHour(hour)\">{{hour}}</button>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "    <div class=\"kt-time-picker-outer\">\n" +
    "      <div class=\"kt-time-picker-inner\" kt-hide-scrollbar>\n" +
    "        <div class=\"kt-time-picker-cell\"\n" +
    "             ng-repeat=\"minute in timePicker.minutes\"\n" +
    "             ng-class=\"{'kt-date-picker-selected': isMinuteSelected(minute)}\">\n" +
    "          <button type=\"button\" ng-click=\"selectMinute(minute)\">{{minute}}</button>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"kt-date-picker-footer\"></div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("html/kt-year-picker.html",
    "<div>\n" +
    "  <div class=\"kt-date-picker-header\">\n" +
    "    <button type=\"button\" ng-click=\"previousDecade()\" ng-disabled=\"!hasPreviousDecade()\"><kt-date-picker-previous-icon></kt-date-picker-previous-icon></button>\n" +
    "    <button type=\"button\" disabled=\"disabled\">{{yearPicker.decade.start}} - {{yearPicker.decade.end}}</button>\n" +
    "    <button type=\"button\" ng-click=\"nextDecade()\" ng-disabled=\"!hasNextDecade()\"><kt-date-picker-next-icon></kt-date-picker-next-icon></button>\n" +
    "  </div>\n" +
    "  <div class=\"kt-date-picker-content\">\n" +
    "    <div class=\"kt-year-picker-cell\"\n" +
    "         ng-repeat=\"year in yearPicker.years\"\n" +
    "         ng-class=\"{'kt-date-picker-selected': isSelected(year), 'kt-date-picker-overflow': isOverflowing(year)}\">\n" +
    "      <button type=\"button\" ng-click=\"selectYear(year)\" ng-disabled=\"!isInMinMaxRange(year)\">{{year}}</button>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"kt-date-picker-footer\"></div>\n" +
    "</div>\n" +
    "");
}]);
})();
