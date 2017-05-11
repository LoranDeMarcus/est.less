function InitChooseTime() {

    var isReadySubmit = true;
    // получение timestamp загрузки страницы
    var pageloadTimeStamp = Math.floor(new Date().getTime() / 1000);

    // инилициализация мобильной версии для selectpicker
    // Слайдер временного интервала
    //$('#time-range').slider();

    // Обработка кнопки "Добавить услугу" и сабмита формы добавления
    $('#add-service-btn').click(function () {
        $('#time-form, .controls').hide();
        $('#add-service-panel').show();
    });

    $('#add-service-form button').click(function () {
        $('#add-service-panel').hide();
        $('#time-form, .controls').show();
    });

    // Выбор мастера из popover
    $(document).on('click', '.service .popover .popover-content a', function () {
        var that = $(this),
            service = that.parents('.service'),
            select = service.find('.service-master-select'),
            master_id = that.data('master-id'),
            duration = that.data('duration');
        if (master_id) {
            // Сбрасываем текущй выбор мастера в select
            select.find('option:selected').removeAttr('selected');
            // Выбираем мастера в select
            var option = select.find('option[value=' + master_id + ']');
            option.attr('selected', true);
            // Скрыть popover
            service.find('select[name^=services-time]').popover('hide');
            // Обновляем продолжительность услуги и делаем нактивным выбранное время
            // в других select по времени
            //service.find('select[name^=services-time]').data('duration', duration);
            // todo
            var master = option.data(),
                input = service.find('input[name^=master]');
            if (service.find('select[name^=services-time] option:selected:not(.null)').size() >= 1) {
                service.find('.data > .master > .value').text(master.fullname);
                service.find('.data > .master-class > .value').text(master.class);
                service.find('.data > .price > .value').text(master.price + ' руб.');
                service.find('.data > .duration > .value').text(formatDuration(master.duration));
                input.val(master_id);
            } else {
                service.find('.data > .master > .value').text('?');
                service.find('.data > .master-class > .value').text('?');
                service.find('.data > .price > .value').text('?');
                input.val(null);
            }
            //select.trigger('change');

            updateReadyState();


        }
        return false;
    });

    $(document).on('change', '.service-master-select', function () {
        var that = $(this),
            service = that.parents('.service'),
        //label = service.find('.data > .master > .value'),
            input = service.find('input[name^=master]'),
            master = that.find('option:selected').data();

        // Если время выбрано
        if (service.find('select[name^=services-time] option:selected:not(.null)').size()) {
            service.find('.data > .master > .value').text(master.fullname);
            service.find('.data > .master-class > .value').text(master.class);
            service.find('.data > .price > .value').text(master.price + ' руб.');
            input.val(that.val());
        } else {
            service.find('.data > .master > .value').text('?');
            service.find('.data > .master-class > .value').text('?');
            service.find('.data > .price > .value').text('?');
            input.val(null);
        }
        // Обновляем состояние готовности
        updateReadyState();
    });

    $(document).on('click', '.btn-remove-service', function () {
        var that = $(this),
            service = that.parents('.service'),
            service_id = service.attr('data-service-id');
        if (confirm('Вы действительно хотите УДАЛИТЬ услугу?')) {
            if ($('.service').size() > 1) {
                $('#service-' + service_id).remove();
                updateReadyState();
                return true;
            }
            ShowModalMessage('Уважаемый клиент', 'Для выбора других услуг вернитесь на шаг назад!');
            //alert('Для выбора других услуг вернитесь на шаг назад!');
        }
        return false;
    });

    $(document).on('focus', 'ul.dropdown-menu li', function () {
        var that = $(this),
            service = that.parents('.service'),
            select = service.find('select[name^=services-time]'),
        //bs_original_index = $(this).attr("data-original-index"),
            selected_hour = service.find('select[name^=services-time] option:eq("' + bs_original_index + '")'),
            allSelects = $('select[name^=services-time]'),
            otherSelects = allSelects.not(select);

        otherSelects.each(function () {
            var other = $(this);
            other.find('option:not(.null)').each(function () {
                var option = $(this);
                option.attr('data-icon', "");
            });
        });
        select.selectpicker('val', selected_hour.val());
        select.trigger('change');

        if ($(document).width() > 480) {
            select.selectpicker('show');
        }
    });

    $(document).on('mouseout', 'ul.dropdown-menu li', function () {
        var that = $(this),
            service = that.parents('.service'),
            input = service.find('input[name^=master]'),
            master = that.find('option:selected').data(),
            select = service.find('select[name^=services-time]'),
            allSelects = $('select[name^=services-time]'),
            otherSelects = allSelects.not(select),
            bs_original_index = $(this).attr("data-original-index"),
            selected_hour = service.find('select[name^=services-time] option:eq("' + bs_original_index + '")');
        // выделение с продолжительностью
        var duration = service.find('.duration .hidden'), hour, hStep,
            allocationHours = [],
            isGroup = service.find('.is_group');

        otherSelects.each(function () {
            var other = $(this);
            other.find('option:not(.null)').each(function () {
                var option = $(this);
                option.attr('data-icon', "");
            });
        });

        // для групповых отменяем интерактивное выделение
        if (isGroup.text() === '1') {
            return false;
        } else {
            hStep = 0;
            duration = parseInt(duration.text());
            $('select[name^=services-time]  > option').each(function () {
                $(this).css('background', '');
                hour = parseInt($(this).val());
                if (hour >= parseInt(selected_hour.val()) && hStep <= (duration - 15)) {
                    if (allocationHours !== undefined) {
                        if ($('select[name^=services-time] option[value="' + hour + '"]').hasClass('active')) {
                            allocationHours.push(hour);
                        } else {
                            allocationHours = undefined;
                            return;
                        }
                    }
                    hStep += 15;
                }
            });
            // paint hours
            if (allocationHours !== undefined) {
                var option;
                $(allocationHours).each(function (index, hour) {
                    if (index !== allocationHours.length) {
                        option = $('select[name^=services-time] option[value="' + hour + '"]', service);
                        option.css('background', '#d6edc9');
                    }
                });
                otherSelects.each(function () {
                    var other = $(this);
                    other.find('option:not(.null)').each(function () {
                        var option = $(this);
                        if ($.inArray(parseInt(option.val()), allocationHours) > -1) {
                            option.attr('data-icon', "glyphicon-lock");
                            //option.attr('disabled', true);
                        }
                    });
                });
                if (selected_hour.hasClass('active')) {
                    //select.trigger('change');
                    select.selectpicker('hide');
                    if ($(document).width() > 480) {
                        select.selectpicker('show');
                    }
                }
                select.selectpicker('refresh');
            }
        }
    });


    $(document).on('change', '.service-master-select', function () {
        // Lull: по умолчанию hide
        $('.service-master-select').show();
        var that = $(this),
            service = that.parents('.service'),
        //label = service.find('.data > .master > .value'),
            input = service.find('input[name^=master]'),
            master = that.find('option:selected').data(),
            select = service.find('select[name^=services-time]');

        // Если время выбрано
        var selected_hour = service.find('select[name^=services-time] option:selected:not(.null)');
        if (selected_hour.size()) {
            service.find('.data > .master > .value').text(master.fullname);
            service.find('.data > .master-class > .value').text(master.class);
            service.find('.data > .price > .value').text(master.price + ' руб.');

            // признак группового занятия
            if (master.group) {
                service.find('.data > .group_count').show();
                service.find('.data > .group_busy').show();
                service.find('.data > .group_count > .value').text(master.group.group_count);
                // выбранное время
                var time = formatTime(service.find('select[name^=services-time]').val());
                var datetime = master.date + "-" + time;
                App.ajaxCall('get_service_busy', {
                    service_id: master.service_remote_id,
                    master_id: master.master_remote_id,
                    datetime: datetime
                }, function (result) {
                    service.find('.data > .err').text('').hide();
                    if (result == 400) { //todo
                        service.find('.data > .group_busy > .value').text(0);
                    }
                    else if (result == 500) {
                        service.find('.data > .err').text("Ошибка получения данных о групповом занятии, попробуйте позже.");
                        service.find('.data > .err').show();
                        $('#choose-time-submit').attr('disabled', true);
                    } else {
                        if (result >= master.group.group_count) {
                            // мест для записи нет
                            service.find('.data > .err').text("Нет свободных мест для записи. Выберете другое время.");
                            service.find('.data > .err').show();
                            // не даем записаться
                            $('#choose-time-submit').attr('disabled', true);
                            service.find('.data > .group_busy > .value').text(master.group.group_count);
                        } else {
                            service.find('.data > .group_busy > .value').text(result);
                        }
                    }

                });
            }
            input.val(that.val());
        } else {
            service.find('.data > .master > .value').text('?');
            service.find('.data > .master-class > .value').text('?');
            service.find('.data > .price > .value').text('?');
            input.val(null);
        }
        // Обновляем состояние готовности
        updateReadyState();
    });


    // Отключаем стандартный компонтент Bootstrap для выбора даты
    // и инициализируем свой, в виде календаря

    App.ajaxCall('get_date_schedule', {}, function (result) {
        $('.preloader-block').hide();

        $('.datepicker-block').show();
        $('#datepicker').attr('data-dates-available', JSON.stringify(result));
        var datesAvailable = $('#datepicker').data('dates-available');


        $('#datepicker').datepicker({
                language: 'ru',
                format: 'dd/mm/yyyy',
                startDate: new Date(),
                weekStart: 1,
                todayHighlight: true,
                toggleActive: false,
                beforeShowDay: function (date) {
                    date = covertDate(date);
                    //console.log(date, datesAvailable);
                    return datesAvailable && (datesAvailable[date] === true);
                }
            })
            .on('changeDate', function (event) {
                var eventTimeStamp = Math.floor(event.timeStamp / 1000);
                $('#date').val(getSelectedDate());
                // Собираем все идентификаторы услуг
                var service_ids = $('.service').map(function () {
                    return $(this).data('service-id');
                }).get();
                // Инициализируем времена на основе текущей даты
                ajaxGetTime(service_ids, function () {
                    // Выбираем время (только один раз, при первой загрузке)
                    var first_service = '#service-' + service_ids[0],
                        bootstrap_select = first_service + " .bootstrap-select";
                    $(bootstrap_select).removeClass('open');
                    /*
                     Открываем автоматически список с часами (определяется по timestamp)
                     по умолчанию от загрузки страницы 3 секунды до срабатывания
                     * */
                    if ((eventTimeStamp - pageloadTimeStamp) > 1) {
                        setTimeout(function () {
                            if ($(first_service + " #select-time").children('.active').length > 0) {
                                if ($(document).width() > 480) {
                                    // $(bootstrap_select).addClass('open');
                                    $(bootstrap_select).select('open');
                                    $('.dropdown-toggle[data-id=select-time]')[0].click();
                                }
                            }
                        }, 400);
                    }
                    $('select[name^=services-time]').each(function () {
                        var select = $(this);
                        if (select.data('time')) {
                            select.find('option').each(function () {
                                var option = $(this),
                                    time = option.data('time');
                                if (time && time.from + '-' + time.till === select.data('time')) {
                                    option.attr('selected', true);
                                    select.trigger('change');
                                    return false;
                                }
                            });
                        }
                    });
                });
            });

        //.datepicker('setDate', '+1d')
        //.datepicker('update', '+1d');
        //.trigger('changeDate');

        var minDateAvailable;
        for (var date in datesAvailable) {
            if (datesAvailable[date]) {
                var parsed = parseDate(date);
                if (!minDateAvailable || minDateAvailable > parsed) {
                    minDateAvailable = parsed;
                }
            }
        }

        if (minDateAvailable) {
            $('#datepicker').datepicker('setDate', minDateAvailable);
            //.datepicker('update', minDateAvailable);
        } else {
            //alert('Нет дат со свободными мастерами сразу по всем выбранным услугам! Вернитесь на шаг назад и удалите некоторые услуги.');
            //ShowModalMessage('Уважаемый клиент', '<strong>Нет дат со свободными мастерами сразу по всем выбранным услугам!</strong><br>' +
            //    'Вернитесь на шаг назад и удалите некоторые услуги.');

        }

        if (getServicesCount() === 0) {
            $('#add-service-btn').trigger('click');
        }

        // Обработка сабмита формы
        $('#choose-time-submit').on('click', function () {
            var submit = $(this),
                params = $('#time-form').serialize();
            // Проверить, позволен ли сабмит формы
            if (submit.attr('disabled')) {
                return false;
            }
            submit.attr('disabled', true);
            $.post(submit.data('submit'), params, function (data) {
                if (data === 'ok') {
                    // Состояние формы успешно сохранено
                    window.location = submit.attr('href');
                } else {
                    console.log(data);
                    //alert("Выбранная вами услуга, занимает больше времени, чем свободно у мастера (аппарата). Выберите другое время или дату.");
                    ShowModalMessage('Уважаемый клиент', '<strong>Вы не можете записаться на услугу по одной из следующих причин:</strong><br>' +
                        '1. Выбранная Вами услуга занимает больше времени чем есть у мастера.<br>' +
                        '2. Выбранный Вами аппарат занят другим специалистом.<br>' +
                        '3. Все кабинеты для проведения данной услуги заняты.');
                    submit.attr('disabled', false);
                }
            });
            return false;
        });

        // Инициализируем все select для выбора времени
        $('select[name^=services-time]').selectTime();

        // Инициализируем подсказки
        $('[data-toggle=tooltip]').tooltip();

        // Инициализируем состояние готовности
        updateReadyState();
    });


    jQuery.fn.extend({

        selectTime: function () {
            // Один или несколько select
            var select = $(this);
            //masters = select.parents('.service').find('.service-master-select');

            // Форматирование вывода имени мастера

            function getMasterTitle(master) {
                return master.fullname + ' ' + formatDuration(master.duration);
            }


            // Выпадающий список мастеров
            select.popover({
                trigger: 'manual',
                title: 'Выбери мастера',
                html: true,
                content: function () {
                    var that = $(this),
                        option = that.find('option:selected'),
                        masters = option.data('time').masters;
                    // Только если есть выбор мастеров
                    if (masters) {
                        var cont = $('<ul class="masters-popover">');
                        $.each(masters, function (i, master) {
                            //console.log(master);
                            $('<a href="#">')
                                .attr('data-master-id', master.master_id)
                                .attr('data-duration', master.duration)
                                .append('<span class="name">' + master.fullname)
                                .append('<span class="class">' + master.class)
                                .append('<span class="duration">' + formatDuration(master.duration))
                                .append('<span class="price">' + master.price + ' руб.')
                                .appendTo('<li>')
                                .parent().appendTo(cont);
                        });
                        cont = cont.wrap('<div>').parent();
                        return cont.html();
                    }
                }
            }).change(function () {
                // Выпадающий список и popover с мастерами
                var that = $(this),
                    service = that.parents('.service'),
                    label = service.find('.service-master'),
                    option = that.find('option:selected'),
                    time = option.data('time');
                // Не показываем мастеров, если время не выбрано
                if (option.hasClass('null')) {
                    service.find('.service-master-select').addClass('hidden');
                    return;
                }
                if (time && time.masters) {
                    /*
                     * Наполнить список мастеров для мобильных устройств
                     */
                    var select = service.find('.service-master-select'),
                        input = service.find('input[name^=master]'),
                        active = null,
                        length = Object.keys(time.masters).length;
                    // Проверяем, если ли ранее выбранный мастер в новом множестве
                    $.each(time.masters, function (i, master) {
                        if (master.master_id === input.val()) {
                            active = master;
                            return false;
                        }
                    });
                    // Если мастеров больше 1, показываем список или popover
                    if (length > 1) {
                        that.popover('show');
                        // костыль для bootstrap-select
                        $('.popover').css("top", "-90px").css("left", "370px");
                        // Для мобильных устройств
                        select.empty().removeClass('hidden');
                        $.each(time.masters, function (i, master) {
                            $('<option value="' + master.master_id + '">')
                                .data(master)
                                .text(getMasterTitle(master))
                                .attr('selected', !active || active === master)
                                .appendTo(select);
                            // Автоматически выбираем первого мастера, если ни один не выбран
                            if (!active) {
                                active = master;
                            }
                        });
                        label.addClass('hidden-xs');
                    } else { // если мастер только один, список и popover не нужен
                        that.popover('hide');
                        select.empty().addClass('hidden');
                        label.removeClass('hidden-xs');
                        if (time.masters.length === 1) {
                            var master = time.masters[0];
                            $('<option value="' + master.master_id + '">')
                                .data(master)
                                .text(getMasterTitle(master))
                                .attr('selected', true)
                                .appendTo(select);
                            active = master;
                        }
                    }
                    // Если мастеров больше одного
                    var duration = service.find('.duration .value');
                    var duration_hidden = service.find('.duration .hidden');
                    if (active) {
                        console.log(active);
                        label.text(getMasterTitle(active));
                        input.val(active.master_id);
                        duration.text(formatDuration(active.duration));
                        duration_hidden.text(active.duration);
                        select.data('duration', parseInt(active.duration));
                        select.data('duration_hidden', parseInt(active.duration));
                        that.data('duration', parseInt(active.duration));
                    } else {
                        label.text('Нет мастеров на это время!');
                        input.val('');
                        duration.text('?');
                        select.data('duration', null);
                    }
                    // Обновляем активное для выбора время
                    service.find('.service-master-select').trigger('change');
                    // Обновляем состояние готовности
                    updateReadyState();
                } else {
                    // нет мастеров на это время
                    ShowModalMessage('Уважаемый клиент', '<strong>Вы не можете записаться на услугу по одной из следующих причин:</strong><br>' +
                        '1. Выбранная Вами услуга занимает больше времени чем есть у мастера.<br>' +
                        '2. Выбранный Вами аппарат занят другим специалистом.<br>' +
                        '3. Все кабинеты для проведения данной услуги заняты.<br>' +
                        '4. Возможно у вас уже имеются записи на выбранное время');
                    //service.find('.data > .err').text('Возможно у вас уже имеются записи на выбранное время! ' +
                    //  'Проверьте записи в личном кабинете или обратитесь к администратору.');
                    service.find('.data > .err').show();
                    //alert('Возможно у вас уже имеются записи на выбранное время! Проверьте записи в личном кабинете или обратитесь к администратору.');
                    $('#choose-time-submit').attr('disabled', true);
                }
            });

            // При выборе времени делать неактивным пересекающееся с ним у других услуг
            var updateOtherTime = function () {
                var thatSelect = $(this),
                    thatDuration = thatSelect.data('duration') || 15,
                    allSelects = $('select[name^=services-time]'),
                    otherSelects = allSelects.not(thatSelect),
                    thatOptionSelected = thatSelect.find('option:selected'),
                    thatTimeSelected = thatOptionSelected.data('time');
                if (!thatTimeSelected) {
                    return;
                }
                otherSelects.each(function () {
                    var other = $(this),
                        otherDuration = other.data('duration') || 15;
                    // Делаем неактивными времена в других select на основе текущего
                    other.find('option:not(.null)').each(function () {
                        var option = $(this),
                            otherTime = option.data('time');
                        if (isTimesIntersect(thatTimeSelected.time, thatDuration,
                                otherTime.time, otherDuration)) {
                            //console.log(
                            //	formatTime(thatTimeSelected.time), thatTimeSelected.time, thatDuration,
                            //	formatTime(otherTime.time), otherTime.time, otherDuration);
                            // Если времена пересекаются
                            option.attr('disabled', true);
                            option.attr('data-icon', "");
                            if (option.is(':selected')) {
                                option.removeAttr('selected');
                                other.find('option.null').attr('selected', true);
                            }
                        }
                    });
                });
            };

            select.parents('.service').find('.service-master-select').change(function () {
                // Инициализируем активные времена для выбора
                initTimeSelectsState();
                // Делаем неактивным выбранное время у других select
                $('select[name^=services-time]').each(updateOtherTime);
                // Обновляем состояние готовности
                updateReadyState();
            });
        }

    });

// Показать хинт (только один из двух)

    function showHint(h) {
        $(h).show().siblings().hide();
    }

// Обновляет списки выбора времени для услуг перечесленных в service_ids

    function ajaxGetTime(service_ids, callback) {
        if (!service_ids || !service_ids.length)
            return;
        // На время загрузки сделать неактывными списки выбора времени
        $.each(service_ids, function (i, id) {
            $('#service-' + id + ' select[name^=services-time]').attr('disabled', true);
        });
        // Делаем запрос на сервер
        //console.log(service_ids);
        App.ajaxCall('get-time', {
            date: getSelectedDate(service_ids),
            service_ids: service_ids
        }, function (result) {
            if (result.error) {
                console.log(result.error);
                ShowModalMessage('Уважаемый клиент', 'Выбранное вами время занято. <br> <strong>Выберете другое время.</strong>');
                //alert("Выбранное вами время занято. Выберете другое время.");
                return;
            }
            //console.log(result.services);
            $.each(result.services, function (service_id, service) {
                var $service = $('#service-' + service_id),
                    select = $service.find('select[name^=services-time]'),
                    duration = $service.find('.duration .value'),
                    duration_hidden = $service.find('.duration .hidden'),
                    service_schedule = makeSchedule(service.time_from, service.time_till),
                    free_time = [],
                    minDuration,
                    make_schedule;
                // Список мастеров на выбор для каждого времени
                if (service.masters) {
                    $.each(service.masters, function (master_id, master) {
                        // получаем свободные часы на которые можно записаться из master_free_time
                        // для групповых занятий получаем только начальные часы занятия
                        if (master.group) {
                            for (var i in master.master_free_time) {
                                free_time.push(master.master_free_time[i].time_from);
                            }
                            free_time = array_unique(free_time);
                            free_time = jQuery.grep(free_time, function (elem) {
                                return elem !== master.time_till;
                            });
                            //$.each(free_time, function(timeIndex, time){
                            //
                            //});
                        } else {
                            // для не групповых получаем с разбитое по 15 мин время
                            for (var i in master.master_free_time) {
                                make_schedule = makeSchedule(master.master_free_time[i].time_from,
                                    master.master_free_time[i].time_till)
                                $.each(make_schedule, function (schedule_id, schedule_time) {
                                    free_time.push(schedule_time.time);
                                });
                            }
                        }
                        var master_schedule = makeSchedule(master.time_from, master.time_till),
                            masterActive = false;
                        // � асписание работы для каждого мастера
                        var errFlag = false;
                        $.each(master_schedule, function (i, time_for_master) {
                            // 1. Только если мастер не занят в это время
                            // 2. Только если сам клиент не записан на это время
                            // 3. Позволяем записаться только на +10 минут от текущего времени
                            if (!isMasterFreeAt(master, time_for_master.time) || !isUserFreeAt(result.user, time_for_master.time)
                                || !isMoreThan10MinsFromNow(time_for_master.time)) {
                                return true;
                            }
                            // Ищем точное совпадение в общем расписании
                            $.each(service_schedule, function (j, time_in_schedule) {
                                if (time_in_schedule.time === time_for_master.time) {
                                    // Добавляем мастера ко времени в расписании
                                    time_in_schedule.masters = time_in_schedule.masters || [];
                                    time_in_schedule.masters.push({
                                        master_id: master_id,
                                        fullname: master.fullname,
                                        duration: master.duration,
                                        class: master.class,
                                        price: master.price,
                                        group: master.group,
                                        service_remote_id: master.service_remote_id,
                                        master_remote_id: master.master_remote_id,
                                        date: master.date
                                    });
                                    // Время доступно для выбора, помечаем мастера как активного
                                    masterActive = true;
                                }
                            });
                        });
                        // Если мастер активен, вычисляем минимальную продолжительность оказания услуги
                        if (masterActive && ( minDuration === undefined || master.duration < minDuration )) {
                            minDuration = parseInt(master.duration);
                        }
                    });
                }
                select.prop('disabled', false);
                select.empty().removeAttr('disabled');
                select.append('<option class="null" value="" selected="selected">- Выбери время -</option>');
                $.each(service_schedule, function (i, time_in_schedule) {
                    //свободные часы красим в зеленый заняты в красный
                    if ($.inArray(time_in_schedule.time, free_time) !== -1) {
                        $("<option>").attr('value', time_in_schedule.time)
                            .addClass('active')
                            .css('color', 'green')
                            .data('time', time_in_schedule)
                            .text(formatTime(time_in_schedule.time) + " [cвободно]")
                            .appendTo(select);
                    } else {
                        $("<option>").attr('value', time_in_schedule.time)
                            .attr('disabled', true)
                            .css('color', 'darkred')
                            .data('time', time_in_schedule)
                            .text(formatTime(time_in_schedule.time) + " [занято]")
                            .appendTo(select);
                    }
                });
                select.selectpicker('refresh');
                // Обновить duration
                select.data('duration', minDuration ? minDuration : 0);
                select.data('duration_hidden');
                duration.text(minDuration ? formatDuration(minDuration) : '?');
                duration_hidden.text(minDuration ? minDuration : '?');
                // Сбросить данные о мастере
                $service.removeClass('no-time')
                    .find('.master-class .value, .master .value, .price .value')
                    .text('?');
                $service.removeClass('no-time')
                    .find('.group_count, .group_busy').hide();
                $service.removeClass('no-time')
                    .find('.group_count, .group_busy').hide();
                $service.find('.data > .err').hide();
            });

            // Если для каких-то услуг не найдено время в расписании
            service_ids.forEach(function (service_id) {
                var $select = $('#service-' + service_id + ' select[name^=services-time]');
                if (!result.services[service_id]) {
                    // Показываем ошибку в выборе времени
                    $select.empty().append('<option class="null">Не найдено мастеров (аппаратов) на ' + getSelectedDate());
                }
            });

            // Вызываем внешний коллбек
            if (typeof callback === 'function') {
                callback.apply(this);
            }

            // Инициализируем активные времена для выбора
            initTimeSelectsState();

            // Автоматически выбираем время для каждой услуги
            $('select[name^=services-time]:first').trigger('change');
        });
    }

    function initTimeSelectsState() {
        //$('#choose-time-submit').parent().attr("data-original-title", 'Выбери время и мастера для каждой услуги');
        $('select[name^=services-time]').each(function () {
            var $select = $(this),
                $options = $select.children('option:not(.null)');
            // Сбрасываем активные времена во всех select
            $options.removeAttr('disabled');
            // Делаем неактивным время на основе изначальных данных с сервера
            //$options.each(function () {
            //    var $option = $(this),
            //        time = $option.data('time');
            //    if (time.masters === undefined) {
            //        $option.remove();
            //    }
            //});
            // Показываем ошибку, если не осталось времени для выбора
            //console.log(isDurationFit($select));
            if (!$select.children('option:not(.null)').size() || $select.children('.active').size() === 0) {
                //|| !isDurationFit($select)) {
                $select
                    .empty()
                    .attr('disabled', true)
                    .append('<option class="null">Нет свободного времени');
                $select.parents('.service').addClass('no-time');
                $('#choose-time-submit').parent().attr("data-original-title",
                    'Выберите другую дату или услугу. Свободного времени у мастера (аппарата) не хватает для выполнения услуги.');
            }
            $select.selectpicker('refresh');
        });
    }


    function isDurationFit(select) {
        var service = select.parents('.service'),
            select = service.find('select[name^=services-time] > option'),
            duration = service.find('.duration .hidden'),
            isFitOption = true,
            isFit = false,
            hStep,
            isGroup = service.find('.is_group'),
            option;

        if (isGroup.text() != '1') {
            duration = parseInt(duration.text());
            select.each(function () {
                option = $(this);
                if (option.hasClass('active') && !option.hasClass('null')) {
                    hStep = 0;
                    select.each(function () {
                        if ($(this).val() > option.val() && hStep <= duration) {
                            if (!$(this).hasClass('active') && !$(this).hasClass('null')) {
                                isFitOption = false;
                                return;
                            }
                        }
                        hStep += 15;
                    });
                    if (isFitOption) {
                        isFit = true;
                        return;
                    }
                }
            });
            return isFit;
        } else {
            return true; // for group record
        }

    }

// Создает список времен с шагом 15 минут
    function makeSchedule(timeFrom, timeTill) {
        var times = [],
            duration = 15;
        for (var i = timeFrom; i < timeTill; i += duration) {
            times.push({
                time: i
            });
        }
        return times;
    }

// Конвертирует числовое значение в "xx:yy"

    function formatTime(time) {
        var hours = "0" + Math.floor(time / 60);
        var mins = "0" + time % 60;
        return hours.substr(hours.length - 2) + ":" + mins.substr(mins.length - 2);
    }

// Конвертирует числовое значение в "x ч. yy мин."

    function formatDuration(duration) {
        var hours = Math.floor(duration / 60),
            mins = duration % 60,
            out = '';
        if (hours > 0) {
            out += hours + ' ч.';
        }
        if (mins > 0 || hours == 0) {
            out += mins + ' мин.';
        }
        return out.trim();
    }

// Проверка на пересечение временных интервалов

    function isTimesIntersect(time1, duration1, time2, duration2) {
        return ( time1 < (time2 + duration2) ) && ( time2 < (time1 + duration1) );
    }

    function isMasterFreeAt(master, time) {
        if (master.master_free_time && master.master_free_time.length) {
            for (var i = 0; i < master.master_free_time.length; ++i) {
                var free = master.master_free_time[i],
                    duration = free.time_till - free.time_from;
                if (isTimesIntersect(free.time_from, duration, time, 15)) {
                    return true;
                }
            }
        }
        return false;
    }

    function isUserFreeAt(user, at) {
        if (user && user !== undefined) {
            var free = true,
                times = user["times"],
                date = user["date"];
            if (date === getSelectedDate()) {
                times && times.forEach(function (time) {
                    var from = parseInt(time.time_from),
                        till = parseInt(time.time_till);
                    if (isTimesIntersect(at, 15, from, till - from)) {
                        free = false;
                    }
                });
            }
            return free;
        }
        return false;
    }

    function covertDate(date) {
        var day = "0" + date.getDate(),
            month = "0" + (date.getMonth() + 1);
        return date.getFullYear() + '-' + month.substr(month.length - 2) + '-' + day.substr(day.length - 2);
    }

    function parseDate(date) {
        var parts = date.split('-');
        return new Date(parts[0], parseInt(parts[1]) - 1, parts[2]);
    }

    function getSelectedDate(service_ids) {
        return covertDate($('#datepicker').datepicker('getDate'));
    }

    function getServicesCount() {
        return $('#services-list .service').size();
    }

    function isMoreThan10MinsFromNow(time) {
        var now = new Date(),
            selected = $('#datepicker').datepicker('getDate');
        selected.setHours(Math.floor(time / 60));
        selected.setMinutes(time % 60);
        //console.log(selected, now);
        return selected.getTime() - now.getTime() > 1000 * 60 * 10;
    }

// Добавить услугу в DOM

    function uiAddService(id, label) {
        $.get(App.siteUrl('record/choose_time_service/' + id), function (markup) {
            // Добавляем новую услугу в DOM
            $('#services-list').append(markup);
            // Инициализируем select
            $('#service-' + id + ' select[name^=services-time]').selectTime();
            showHint('#choose-time-hint');
            ajaxGetTime([id]);
            // Лимит услуг
            if (getServicesCount() >= App.servicesLimit) {
                $('#services-nav .add-service-tab').hide();
            }
            // Обновляем состояние готовности
            updateReadyState();
        });
        return true;
    }

// Удаление услуги из DOM

    function uiRemoveService(service_id) {
        var service = $('#service-' + service_id);
        if (confirm('Вы действительно хотите УДАЛИТЬ услугу?')) {
            service.slideUp(function () {
                service.remove();
            });
            // Удалить услуги из формы
            App.ajaxCall('record-form/delete-service', {
                service_id: service_id
            });
            // Обновляем состояние готовности
            updateReadyState();
            return true;
        }
        return false;
    }

    function updateReadyState() {
        //$('#choose-time-submit').parent().attr("data-original-title", 'Выбери время и мастера для каждой услуги');
        var services = $('#services-list > .service'),
            isReady = true;
        if (services.length > 0) {
            services.each(function () {
                if (!$('select[name^=services-time]', this).val() || !$('input[name^=master]', this).val()) { //todo
                    // не выбрано время или мастер для одной из услуг
                    isReady = false;
                    return false;
                } else {
                    $(this).find('.data > .err').hide();
                }

            });
        } else { // не выбрано ни одной услуги
            //console.log('не выбрано ни одной услуги');
            isReady = false;
        }
        // в случае не соблюдения обязательных условий переход на след. шаг невозможен
        if (!isReady) {
            $('#choose-time-submit').attr('disabled', true)
                .parent().tooltip();
        } else {
            $('#choose-time-submit').attr('disabled', false)
                .parent().tooltip('destroy');
        }
    }

    function array_unique(array) {
        var uniqueNames = [];
        $.each(array, function (i, el) {
            if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
        });
        return uniqueNames;
    }

    var service;

    $(document).on('click', '.writeClientFact', function () {
        service = $(this).parents('.service');
        $('#clientFactModal').modal('show');
    });


    $(document).on('click', '.client-fact-save', function () {
        var client_fact = $('#clientFactModal input[name^=info]');
        var input = client_fact.val();
        if (input !== '' && input.length > 3) {
            service.find('.data > .info .title').text('Клиент:');
            service.find('.data > .info .writeClientFact').html('<span class="glyphicon glyphicon-edit"/>');
            service.find('.data > .info .value').text(client_fact.val());
            service.find('.data > .info #info').val(client_fact.val());
        } else {
            service.find('.data > .info .writeClientFact').text('Записать друга или родственника');
            service.find('.data > .info .title').text('');
            service.find('.data > .info .value').text('');
        }
        $('#clientFactModal').modal('hide');
    });

    /* Waiting list module */
    $(function () {

        var MIN_HOUR = 540,
            MAX_HOUR = 1320;

        var date = $('input[name=wldate]'),
            hour_from = $('select[name=hour_from]'),
            hour_till = $('select[name=hour_till]'),
            client_phone = $('input[name=client_phone]'),
            client_id = $('input[name=client_id]'),
            wl_form = $('#formWaitingList'),
            service;


        var validatePhone = function (phone) {
            var phoneRule = /((8|\+7)-?)?\(?\d{3}\)?-?\d{1}-?\d{1}-?\d{1}-?\d{1}-?\d{1}-?\d{1}-?\d{1}/;
            if ((phone.match(phoneRule))) {
                return true;
            } else {
                return false;
            }
        }

        /* Add to WL, sending ajax to endpoint */
        var sendToWaitingList = function (service_id, datetime_from, datetime_till, client_phone, master_id, client_id) {
            //console.log(service_id, datetime_from, seconds_till, client_phone, client_id);
            App.ajaxCall('add_waiting_list', {
                service_id: service_id,
                datetime_from: datetime_from,
                datetime_till: datetime_till,
                client_phone: client_phone,
                master_id: master_id,
                client_id: client_id
            }, function (result) {
                if (result !== null || result !== '500') {
                    return false;
                }
            });
            return true;
        }

        /* Click on open modal href */
        $('.openModalWaitingList').click(function () {
            var hours = [];
            service = $(this).parents('.service');
            $('#modalWaitingList').modal('show');
            /* Default value to date */
            $('#modalWaitingList #date').val(getSelectedDate());

            /* reset fields */
            //wl_form.trigger('reset');
            date.parent().removeClass('has-error');
            hour_from.val('').parent().removeClass('has-error');
            hour_till.val('').parent().removeClass('has-error');
            client_phone.parent().removeClass('has-error');

            /* favorite master add to select */
            var favorite_master = service.find('.favorite-master');
            if (favorite_master.length > 0) {
                /* add masters to select */
                $('select[name=favorite_master] option').remove();
                favorite_master.children('.fav-master').each(function (i, val) {
                    $('select[name=favorite_master]').append(
                        new Option($(val).children().text(), $(val).data('id'))
                    );
                });
                $('select[name=favorite_master]').append(new Option("Не имеет значения", ""));
            } else {
                /* hide select favorite master */
                $('select[name=favorite_master] option').remove();
                $('select[name=favorite_master]').hide().parent().hide();
                $('select[name=favorite_master]').append(new Option("Не имеет значения", ""));
                $("select[name=favorite_master] [value='']").attr("selected", "selected");
            }
            $('#wlAlertErr').hide();
            $('#wlAlertSuccess').hide();

            hours = makeSchedule(MIN_HOUR, MAX_HOUR);
            hours.forEach(function (hour, i) {
                hour_from.append(new Option(formatTime(hour.time), hour.time));
                hour_till.append(new Option(formatTime(hour.time), hour.time));
            });
        });

        /* Validate hour_till by hour_from */
        $('select[name=hour_from]').change(function () {
            var hour_from = parseInt($('select[name=hour_from]').val()),
                hours_till = [];
            hours_till = makeSchedule(hour_from, MAX_HOUR);
            $('select[name=hour_till]').empty();
            hour_till.append(new Option("По", ""));
            hours_till.forEach(function (hour, i) {
                hour_till.append(new Option(formatTime(hour.time), hour.time));
            });
        });

        /* Click on send wait list */
        $('#btnWaitingListSend').click(function () {
            $('#wlAlertSuccess').hide();
            var now = new Date(),
                today = new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                wl_date = new Date(date.val());
            /* Validate form */
            if (wl_date >= today) {
                date.parent().removeClass('has-error');
                if ((hour_from.val() !== '' && hour_till.val() !== '') && parseInt(hour_from.val()) <= parseInt(hour_till.val())) {
                    hour_from.parent().removeClass('has-error');
                    hour_till.parent().removeClass('has-error');
                    if (validatePhone(client_phone.val())) {
                        client_phone.parent().removeClass('has-error');
                        /* Preparing data for sending */
                        var hour_from_text = $('select[name=hour_from] option:selected').text(),
                            hour_till_text = $('select[name=hour_till] option:selected').text(),
                            datetime_from = date.val() + '-' + hour_from_text + ':00',
                            datetime_till = date.val() + '-' + hour_till_text + ':00',
                            phone = '8' + client_phone.val(),
                            service_id = service.find('input[name=service_remote_id]').val(),
                            master = $("select[name=favorite_master]").val();
                        /* Send waiting list */

                        var send = sendToWaitingList(
                            service_id,
                            datetime_from,
                            datetime_till,
                            phone,
                            master, //master_id
                            client_id.val()
                        );

                        if (send) {
                            //service.find('.data .success').text('Ваша заявка добавлена в лист ожидания!');
                            //$('#modalWaitingList').modal('hide');
                            $('#wlAlertSuccess').show();
                        } else {
                            /* show alert */
                            $('#wlAlertErr').show();
                        }

                    } else {
                        /* Invalid client phone */
                        client_phone.parent().addClass('has-error');
                    }
                } else {
                    /* Invalid hours */
                    hour_from.parent().addClass('has-error');
                    hour_till.parent().addClass('has-error');
                }
            } else {
                /* Invalid date */
                date.parent().addClass('has-error');
            }
        });
    });

    function ShowModalMessage(title, message) {
        $('#modalMessage .modal-title').text(title);
        $('#modalMessage .modal-body').html(message);
        $('#modalMessage').modal('show');
    }

}