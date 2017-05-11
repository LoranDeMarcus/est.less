/**
 * Фильтр удобного времени на шаге выбора времени
 */
$(document).ready(function () {

    var FreetimeFilter = {

        rangeList: {
            '0912': {
                'time_from': 540,
                'time_till': 720
            },
            '1215': {
                'time_from': 720,
                'time_till': 900
            },
            '1518': {
                'time_from': 900,
                'time_till': 1080
            },
            '1822': {
                'time_from': 1080,
                'time_till': 1320
            }
        },

        IsRangeValid: function (range) {
            return (range === 'all') ||
                (range === '0912') ||
                (range === '1215') ||
                (range === '1518') ||
                (range === '1822');
        },

        GetRangeTimes: function () {
            return this.rangeList[this.rangeFilter];
        },

        GetFilterTime: function () {
            App.ajaxCall('filter_date_schedule', {range_filter: this.rangeFilter}, function (result) {
                if (result.response == "err") {
                    console.log(result);
                }
                else {
                    var disabledDatesArray = [];
                    for (var date in result.date_schedule) {
                        if (result.date_schedule[date] === false) {
                            var dateToTimestamp = new Date(Date.parse(date)),
                                formattedDate = dateToTimestamp.getDate() + '-' +
                                    parseInt(dateToTimestamp.getMonth() + 1) + '-' +
                                    dateToTimestamp.getFullYear();
                            disabledDatesArray.push(formattedDate);
                        }
                    }
                    $('#datepicker').datepicker('setDatesDisabled', disabledDatesArray);
                }

                $('.datepicker-days').show();
                $('.preloader-block').hide();
            });
        },

        FilterDates: function (range) {

            if (!this.IsRangeValid(range)) {
                return;
            }

            this.rangeFilter = range;
            this.GetFilterTime();
        }
    };

    $('.free-time-select').on('change', function () {
        var that = $(this);
        var selectedRange = that.find('option:selected').val();

        if (selectedRange !== '') {
            $('.datepicker-days').hide();
            $('.preloader-block').show();

            FreetimeFilter.FilterDates(selectedRange);
        }
    });

});