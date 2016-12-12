angular.module('kt.datePicker').run(['$templateCache', function($templateCache) {
  $templateCache.put("html/kt-date-range-picker.html",
    "<div>\n" +
    "    <div class=\"kt-date-range-picker-header\" style=\"display: table; width: 100%\">\n" +
    "        <button ng-click=\"setCurrentPicker('start')\" ng-class=\"{'kt-date-range-picker-active-range': isCurrentPicker('start')}\">{{startDate.format('DD.MM.YYYY')}}</button>\n" +
    "        <button ng-click=\"setCurrentPicker('end')\" ng-class=\"{'kt-date-range-picker-active-range': isCurrentPicker('end')}\">{{endDate.format('DD.MM.YYYY')}}</button>\n" +
    "    </div>\n" +
    "    <kt-date-picker date=\"$parent.startDate\" min-date=\"$parent.minDate\" max-date=\"$parent.maxDate\" ng-if=\"isCurrentPicker('start')\"></kt-date-picker>\n" +
    "    <kt-date-picker date=\"$parent.endDate\" min-date=\"$parent.startDate\" max-date=\"$parent.maxDate\" ng-if=\"isCurrentPicker('end')\"></kt-date-picker>\n" +
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
    "    <div class=\"kt-day-picker-row\" ng-repeat=\"week in dayPicker.weeks\">\n" +
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
