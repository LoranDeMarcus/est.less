function InitCabinet() {

    //  активация тултипов
    $('.record-cancel').tooltip();
    $('#notifications-form input').change(function () {
        $('#notifications-form').submit();
    });

    // Обработка настройки оповещений
    $('#notifications-form').submit(function () {
        App.ajaxCall('update_notifications_settings', $(this).serialize());
        $('#notifications').tooltip('show');
        return false;
    });

    var form = $('#record-filter');

    // Обработка сабмита формы
    form.find('select[name=range]').change(submit);
    form.find('button[name=sort_by]').click(function () {
        var all = form.find('button[name=sort_by]'),
            that = $(this);
        if (!that.hasClass('active')) {
            all.removeClass('active').filter(this).addClass('active');
            submit();
        }
    });

    // Обработка фильтра по направлениям
    form.find('select[name=direction]').change(function () {
        var container = $('.history-data'),
            val = $(this).val();
        if (val === 'all') {
            container.children().removeClass('hidden');
        } else {
            container.children().addClass('hidden')
                .filter('*[data-direction-id=' + val + ']')
                .removeClass('hidden');
        }
    });

    // Обработка фильтра по услугам
    // form.find('select[name=service]').change(function () {
    //     var container = $('.history-data'),
    //         val = $(this).val();
    //     if (val === 'all') {
    //         container.children().removeClass('hidden');
    //     } else {
    //         container.children().addClass('hidden')
    //             .filter('*[data-service-id=' + val + ']')
    //             .removeClass('hidden');
    //     }
    // });

    // Обработка кнопки Далее
    $(document).on('click', '.history-data .next > a', function () {
        var that = $(this),
            offset = that.data('offset'),
            params = getParams();
        params += '&offset=' + offset;
        App.ajaxCall('get_records_history', params, function (result) {
            append(result, false);
        });
        return false;
    });

    /* 
     * Подготовить параметры для сабмита
     */
    function getParams() {
        var params = form.serialize();
        params += '&sort_by=' + form.find('button[name=sort_by].active').val();
        return params;
    }

    /*
     * Добавить результат AJAX запроса в список
     * если clear = true, список будет очищен
     */
    function append(result, clear) {
        var container = $('.history-data'),
            filter = form.find('select[name=direction]'),
            empty = container.hasClass('empty');

        if (result.count > 0) {
            // Создаем список 
            if (empty) {
                container.after('<ul class="history-data">');
                container.remove();
                container = $('.history-data');
            }
            if (clear) {
                container.empty();
                //filter.find('option[value!=all]').remove();
            } else {
                container.find('li.next').remove();
            }
            // Добавляем записи
            container.append(result.view);
            // Добавляем услуги в фильтр
            //$.each(result.services, function(id, title) {
            //	if ( ! filter.find('option[value='+id+']').size() ) {
            //		filter.append('<option value="'+id+'">'+title);
            //	}
            //});
        } else {
            // Удаляем список, создаем текстовый блок
            if (!empty) {
                container.after('<div class="history-data empty">Нет записей</div>');
                container.remove();
                container = $('.history-data');
            }
            // Очищаем фильтр по услугам
            //filter.find('option[value!=all]').remove();
        }
    }

    function submit() {
        App.ajaxCall('get_records_history', getParams(), function (result) {
            console.log(result);
            append(result, true);
        });
    }

    submit();

    /* � аздел настроек */

    $('.save-contacts').on('click', function () {
        var email = $('input[name=client_email]').val();
        var phone = $('input[name=client_phone]').val();

        phone = '8' + phone; // format
        //$('.form-contacts-edit').submit(); todo

        App.ajaxCall('update_user_information', {email: email, phone: phone}, function (result) {
            if (result.response == 1) {
                $('.save-contacts')
                    .removeClass('btn-primary')
                    .addClass('btn-success')
                    .addClass('disabled')
                    .text('Сохранено');

                setTimeout(function () {
                    $('.save-contacts')
                        .removeClass('btn-success')
                        .removeClass('disabled')
                        .addClass('btn-primary')
                        .text('Сохранить');
                }, 3000);
            }
            else {
                alert("Ошибка изменения контактных даннх. Возможно клиент с введеными данными существует!");
                console.log(result);
            }
        });
    });
}