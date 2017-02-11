angular.module('kt.datePicker').run(['$templateCache', function($templateCache) {
  $templateCache.put("html/kt-date-picker-input.html",
    "<div>\n" +
    "  <input type=\"text\" ng-model=\"dateString\" ng-change=\"dateStringChanged()\" kt-dropdown=\".ktDatePickerInput_{{instanceCount}}\">\n" +
    "  <kt-date-picker class=\"ktDatePickerInput_{{instanceCount}} kt-dropdown-target\" date=\"date\" min-date=\"minDate\" max-date=\"maxDate\"></kt-date-picker>\n" +
    "</div>\n" +
    "");
  $templateCache.put("html/kt-date-picker.html",
    "<kt-day-picker\n" +
    "    ng-model=\"ngModel\" min-date=\"minDate\" max-date=\"maxDate\" format=\"{{format}}\"\n" +
    "    ng-show=\"isCurrentPicker('day')\">\n" +
    "</kt-day-picker>\n" +
    "<kt-month-picker\n" +
    "    ng-model=\"ngModel\" min-date=\"minDate\" max-date=\"maxDate\" format=\"{{format}}\"\n" +
    "    ng-show=\"isCurrentPicker('month')\">\n" +
    "</kt-month-picker>\n" +
    "<kt-year-picker\n" +
    "    ng-model=\"ngModel\" min-date=\"minDate\" max-date=\"maxDate\" format=\"{{format}}\"\n" +
    "    ng-show=\"isCurrentPicker('year')\">\n" +
    "</kt-year-picker>\n" +
    "");
  $templateCache.put("html/kt-date-range-picker-input.html",
    "<div>\n" +
    "  <input type=\"text\" ng-model=\"dateRangeString\" ng-change=\"dateRangeStringChanged()\" kt-dropdown=\".ktDateRangePickerInput_{{instanceCount}}\">\n" +
    "  <kt-date-range-picker class=\"ktDateRangePickerInput_{{instanceCount}} kt-dropdown-target\" start-date=\"startDate\" end-date=\"endDate\" min-date=\"minDate\" max-date=\"maxDate\"></kt-date-range-picker>\n" +
    "</div>\n" +
    "");
  $templateCache.put("html/kt-date-range-picker.html",
    "<div class=\"kt-dp-flex-row kt-dp-range-navigation\">\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button class=\"kt-dp-date\"\n" +
    "            ng-click=\"setCurrentPicker('start')\"\n" +
    "            ng-class=\"{'kt-dp-date--selected': isCurrentPicker('start')}\">\n" +
    "      {{getDisplayedDate(startDate)}}\n" +
    "    </button>\n" +
    "  </div>\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button class=\"kt-dp-date\"\n" +
    "            ng-click=\"setCurrentPicker('end')\"\n" +
    "            ng-class=\"{'kt-dp-date--selected': isCurrentPicker('end')}\">\n" +
    "      {{getDisplayedDate(endDate)}}\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"kt-dp-picker-container\">\n" +
    "  <kt-date-range-select start-date=\"startDate\" end-date=\"endDate\" options=\"options\"\n" +
    "                        ng-show=\"isCurrentPicker('range')\">\n" +
    "  </kt-date-range-select>\n" +
    "\n" +
    "  <kt-date-picker ng-model=\"startDate\" min-date=\"minDate\" max-date=\"maxDate\" format=\"{{format}}\"\n" +
    "                  ng-show=\"isCurrentPicker('start')\">\n" +
    "  </kt-date-picker>\n" +
    "\n" +
    "  <kt-date-picker ng-model=\"endDate\" min-date=\"startDate\" max-date=\"maxDate\" format=\"{{format}}\"\n" +
    "                  ng-show=\"isCurrentPicker('end')\">\n" +
    "  </kt-date-picker>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"kt-dp-flex-row kt-dp-footer\">\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button class=\"kt-dp-date\"\n" +
    "            ng-click=\"setCurrentPicker('range')\"\n" +
    "            ng-class=\"{'kt-dp-date--selected': isCurrentPicker('range')}\">\n" +
    "      <kt-date-picker-icon icon=\"#date_range_24\"></kt-date-picker-icon>\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "");
  $templateCache.put("html/kt-date-range-select.html",
    "<div class=\"kt-dp-flex-row\" ng-repeat=\"range in ranges\">\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button class=\"kt-dp-date\" ng-click=\"setRange(range)\">{{range | ktDateRangeDisplay}}</button>\n" +
    "  </div>\n" +
    "</div>");
  $templateCache.put("html/kt-day-header.html",
    "<div class=\"kt-dp-flex-row\">\n" +
    "  <div class=\"kt-dp-flex-cell\" ng-repeat=\"dayHeader in dayHeaders\">\n" +
    "    {{dayHeader}}\n" +
    "  </div>\n" +
    "</div>");
  $templateCache.put("html/kt-day-picker.html",
    "<div class=\"kt-dp-flex-row kt-dp-navigation\">\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button\n" +
    "        type=\"button\" class=\"kt-dp-navigation__button kt-button--block\"\n" +
    "        ng-click=\"previousMonth()\" ng-disabled=\"!hasPreviousMonth()\">\n" +
    "      <kt-date-picker-icon icon=\"#chevron_left_18\"></kt-date-picker-icon>\n" +
    "    </button>\n" +
    "  </div>\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button\n" +
    "        type=\"button\" class=\"kt-dp-navigation__button kt-button--block\"\n" +
    "        ng-click=\"monthClick()\" ng-disabled=\"!canChooseMonth()\">\n" +
    "      {{dayPicker.month | monthFormat}}\n" +
    "      {{dayPicker.year}}\n" +
    "    </button>\n" +
    "  </div>\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button\n" +
    "        type=\"button\" class=\"kt-dp-navigation__button kt-button--block\"\n" +
    "        ng-click=\"nextMonth()\" ng-disabled=\"!hasNextMonth()\">\n" +
    "      <kt-date-picker-icon icon=\"#chevron_right_18\"></kt-date-picker-icon>\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<kt-day-header></kt-day-header>\n" +
    "\n" +
    "<div class=\"kt-dp-flex-row\" ng-repeat=\"week in dayPicker.weeks\">\n" +
    "  <div class=\"kt-dp-flex-cell\" ng-repeat=\"date in week.dates\">\n" +
    "    <button\n" +
    "        type=\"button\"\n" +
    "        class=\"kt-dp-date\"\n" +
    "        ng-click=\"selectDate(date)\"\n" +
    "        ng-disabled=\"!isInMinMaxRange(date)\"\n" +
    "        ng-class=\"{'kt-dp-date--selected': isSelected(date), 'kt-dp-date--overflow': isOverflowing(date)}\">\n" +
    "      {{date.format('D')}}\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("html/kt-month-picker.html",
    "<div class=\"kt-dp-flex-row kt-dp-navigation\">\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button type=\"button\" class=\"kt-dp-navigation__button kt-button--block\"\n" +
    "            ng-click=\"previousYear()\" ng-disabled=\"!hasPreviousYear()\">\n" +
    "      <kt-date-picker-icon icon=\"#chevron_left_18\"></kt-date-picker-icon>\n" +
    "    </button>\n" +
    "  </div>\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button type=\"button\" class=\"kt-dp-navigation__button kt-button--block\"\n" +
    "            ng-click=\"yearClick()\" ng-disabled=\"!canChooseYear()\">{{monthPicker.year}}</button>\n" +
    "  </div>\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button type=\"button\" class=\"kt-dp-navigation__button kt-button--block\"\n" +
    "            ng-click=\"nextYear()\" ng-disabled=\"!hasNextYear()\">\n" +
    "      <kt-date-picker-icon icon=\"#chevron_right_18\"></kt-date-picker-icon>\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"kt-dp-flex-row\" ng-repeat=\"monthChunk in monthPicker.monthChunks\">\n" +
    "  <div class=\"kt-dp-flex-cell\" ng-repeat=\"month in monthChunk\">\n" +
    "    <button type=\"button\"\n" +
    "            class=\"kt-dp-date\"\n" +
    "            ng-click=\"selectMonth(month)\"\n" +
    "            ng-class=\"{'kt-dp-date--selected': isSelected(month)}\"\n" +
    "            ng-disabled=\"!isInMinMaxRange(month)\">\n" +
    "      {{month | monthFormat}}\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
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
    "<div class=\"kt-dp-flex-row kt-dp-navigation\">\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button type=\"button\" class=\"kt-dp-navigation__button kt-button--block\"\n" +
    "            ng-click=\"previousDecade()\" ng-disabled=\"!hasPreviousDecade()\">\n" +
    "      <kt-date-picker-icon icon=\"#chevron_left_18\"></kt-date-picker-icon>\n" +
    "    </button>\n" +
    "  </div>\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button type=\"button\" class=\"kt-dp-navigation__button kt-button--block\" disabled=\"disabled\">\n" +
    "      {{yearPicker.decade.start}} - {{yearPicker.decade.end}}\n" +
    "    </button>\n" +
    "  </div>\n" +
    "  <div class=\"kt-dp-flex-cell\">\n" +
    "    <button type=\"button\" class=\"kt-dp-navigation__button kt-button--block\"\n" +
    "            ng-click=\"nextDecade()\" ng-disabled=\"!hasNextDecade()\">\n" +
    "      <kt-date-picker-icon icon=\"#chevron_right_18\"></kt-date-picker-icon>\n" +
    "    </button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"kt-dp-flex-row\" ng-repeat=\"yearChunk in yearPicker.chunkedYears\">\n" +
    "  <div class=\"kt-dp-flex-cell\" ng-repeat=\"year in yearChunk\">\n" +
    "      <button\n" +
    "          type=\"button\"\n" +
    "          class=\"kt-dp-date\"\n" +
    "          ng-click=\"selectYear(year)\"\n" +
    "          ng-class=\"{'kt-dp-date--selected': isSelected(year), 'kt-dp-date--overflow': isOverflowing(year)}\"\n" +
    "          ng-disabled=\"!isInMinMaxRange(year)\">\n" +
    "        {{year}}\n" +
    "      </button>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("html/kt-date-picker-icons.svg",
    "<svg xmlns=\"http://www.w3.org/2000/svg\">\n" +
    "    <symbol viewBox=\"0 0 24 24\" id=\"date_range_24\">\n" +
    "        <title>date_range_24</title>\n" +
    "        <path d=\"M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z\"\n" +
    "        />\n" +
    "    </symbol>\n" +
    "    <symbol viewBox=\"0 0 18 18\" id=\"chevron_left_18\">\n" +
    "        <title>chevron_left_18</title>\n" +
    "        <path d=\"M11.56 5.56L10.5 4.5 6 9l4.5 4.5 1.06-1.06L8.12 9z\" />\n" +
    "    </symbol>\n" +
    "    <symbol viewBox=\"0 0 18 18\" id=\"chevron_right_18\">\n" +
    "        <title>chevron_right_18</title>\n" +
    "        <path d=\"M7.5 4.5L6.44 5.56 9.88 9l-3.44 3.44L7.5 13.5 12 9z\" />\n" +
    "    </symbol>\n" +
    "</svg>");
}]);
