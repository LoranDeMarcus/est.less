function InitChooseService() {

    $('#services-groups').prop('disabled', true).selectpicker('refresh');
    $('#services').prop('disabled', true).selectpicker('refresh');


    // $('#services-distincts').on('shown.bs.select', function (e) {
    //     var selectSelector = $('#services-distincts');
    //     var optionCount = parseInt(selectSelector.children('option').length);
    //     if (optionCount > 10) {
    //         selectSelector.data('live-search', true);
    //     }
    //     else {
    //         selectSelector.data('live-search', false);
    //     }
    //     selectSelector.selectpicker('refresh');
    //     return false;
    // });

    // Услуги
    var groupsUsed = {};
    var allServices = $('#services option').map(function () {
        var service = $(this);
        groupsUsed[service.data('group-id')] = true;
        return {
            id: parseInt(service.val()),
            group_id: parseInt(service.data('group-id')),
            title: service.text(),
            selected: !!service.attr('disabled')
        };
    }).get();

    function getServiceById(service_id) {
        for (var i in allServices) {
            if (allServices[i].id == service_id)
                return allServices[i];
        }
        return null;
    }

    function getServiceByGroupId(group_id) {
        return $.grep(allServices, function (service) {
            return service.group_id == group_id;
        });
    }

    // Исключаем пустые группы
    $('#services-groups option').each(function () {
        var group_id = $(this).val();
        if (groupsUsed[group_id] === undefined) {
            $(this).remove();
        }
    });

    // Группы услуг
    var distinctsUsed = {};
    var allGroups = $('#services-groups option').map(function () {
        var group = $(this);
        var unselectedServices = $.grep(allServices, function (service) {
            return service.group_id == parseInt(group.val())
                && !service.selected;
        });

        distinctsUsed[group.data('parent-id')] = true;
        return {
            id: parseInt(group.val()),
            parent_id: parseInt(group.data('parent-id')),
            title: group.text(),
            disabled: !unselectedServices.length
        };
    }).get();


    function getGroupById(group_id) {
        for (var i in allGroups) {
            if (allGroups[i].id == group_id)
                return allGroups[i];
        }
        return null;
    }


    // Исключаем пустые направления
    $('#services-distincts option').each(function () {
        var distinct_id = $(this).val();
        if (distinct_id && distinctsUsed[distinct_id] === undefined) {
            $(this).remove();
        }
    });


    // Направления
    //$('#services-distincts').change(function () {
    $('#services-distincts').on('changed.bs.select', function (e) {
        //var distinct_id = $(this).val();
        var distinct_id = $(this).selectpicker('val');
        // Направление не выбрано
        if (!distinct_id) {
            $('#services-groups, #services').empty().attr('disabled', true);
            return;
        }
        var groups = $.grep(allGroups, function (group) {
            return group.parent_id == distinct_id;
        });
        // Очищаем выбор групп услуг
        // Добавляем пустой выбор
        $('#services-groups').empty().attr('disabled', null)
            .append('<option value="">- Выбери -');
        // Добавляем группы услуг из выбранного направления
        groups.forEach(function (group) {
            $('<option value="' + group.id + '">')
                .text(group.title)
                .attr('disabled', group.disabled)
                .appendTo('#services-groups');
        });
        // Обновляем список услуг
        $('#services-groups').trigger('change');
        $('#services-groups').selectpicker('refresh');
    });

    // Группы услуг
    $('#services-groups').on('changed.bs.select', function (e) {
        var group_id = $(this).selectpicker('val');
        // Группа услуг не выбрана
        if (!group_id) {
            $('#services').empty().attr('disabled', true);
        } else {
            var services = $.grep(allServices, function (service) {
                return service.group_id == group_id;
            });
            // Очищаем выбор услуг
            // Добавляем пустой выбор
            $('#services').empty().attr('disabled', null)
                .append('<option value="">- Выбери -');
            // Добавляем услуги из выбранной группы
            services.forEach(function (service) {
                $('<option value="' + service.id + '">')
                    .text(service.title)
                    .attr('disabled', service.selected)
                    .appendTo('#services');
            });
        }
        $('#services').selectpicker('refresh').prop('disabled', false);
        UpdateServiceSelectState();
    });

    // Услуги
    $('#services').on('changed.bs.select', function (e) {
        var serviceId = $(this).val();
        $('#add-service-btn').attr('disabled', !serviceId);
        $('#add-service-form').trigger('submit');
        UpdateServiceSelectState();
    });

    $('#services-distincts').trigger('change');

    // Добавление услуги
    $('#add-service-form').submit(function () {
        var id = parseInt($('#services').val());
        var label = $('#services option:selected').text();
        // Добавить в интерфейс
        if (id && uiAddService(id, label)) {
            // Сделать эту услугу недоступной для повторного выбора
            toggleService(id, true);
            // Получить рекомендации и подгрузить их к услуге.
            GetRecommendationsAndSetToUI(id);
        }
        // lull: очищаем форму после нажатия Добавить услугу
        $('#add-service-form').trigger('reset');
        $('#services-groups').prop('disabled', true).attr("disabled", true).selectpicker('refresh');
        $('#services').prop('disabled', true).attr("disabled", true).selectpicker('refresh');

        var countServiceChoosen = getServicesChosen().length;
        if (countServiceChoosen > 0) {
            $('.choosen-service-block').removeClass('empty-block');
            $('.services-not-choosen').hide();
            $('#add-service-btn').text('Добавить услугу для себя или родственника');
            $('#add-service-btn').attr('disabled', true);
        }
        return false;

    });

    // Всплывающие подсказки
    $('#add-service-form label > a').click(function () {
            return false;
    }).tooltip();

    // Удаление услуги
    $(document).on('click', '.remove-service-btn', function () {
        var service_id = $(this).parent().attr("data-id");
        if (uiRemoveService(service_id)) {
            toggleService(service_id, false);
        }
        $('#add-service-btn').attr('disabled', true);

        // show message
        var choosenServices = getServicesChosen();
        if (choosenServices.length === 0)
        {
            $('#choose-services-submit').attr('disabled', true);
            $('.choosen-service-block').addClass('empty-block');
            $('.services-not-choosen').show();
        }

        return false;
    });

    // Сабмит страницы
    $('#choose-services-submit').click(function () {
        var $submit = $(this),
            services = getServicesChosen();
        // Auto add service
        //if ( !services.length ) {
        $('#add-service-form').trigger('submit');
        services = getServicesChosen();
        //}
        // Submit the page
        $.post($submit.data('submit'), {services: services}, function () {
            window.location = $submit.data('redirect');
        });
        return false;
    });

    $('#delete-all').click(function () {
        getServicesChosen().forEach(function (id) {
            uiRemoveService(id);
        });
        UpdateServiceSelectState();
    });

    $(document).on('click', '.recommend-service', function () {
        var service_id = $(this).parent().attr("data-service-id");
        var service_title = $(this).text();
        if (service_id && uiAddService(service_id, service_title)) {
            toggleService(service_id, true);
            GetRecommendationsAndSetToUI(service_id);
            $('.selected-service').popover('destroy');
            $(this).remove();
        }
        return false;
    });

    UpdateServiceSelectState();

    function getServicesChosen() {
        return $('#services-chosen li').map(function () {
            return $(this).data('id');
        }).get();
    }

    // Обработчик добавления/удаления услуги
    // added true при добавлении, false при удалении
    function toggleService(service_id, added) {
        var service = getServiceById(service_id);

        if (!service)
        {
            return false;
        }

        service.selected = added;

        // Статус услуги в списке активна/неактивна для выбора
        $('#services option[value=' + service_id + ']').attr({
            selected: false,
            disabled: added
        });

        // Автоматический выбор первой активной услуги в списке
        //$('#services option').not(':disabled')
        //    .first()
        //    .attr('selected', true);

        // А теперь группа услуг..
        var group = getGroupById(service.group_id),
            //groupServices = getServiceByGroupId(service.group_id);
            groupOption = $('#services-groups option[value=' + service.group_id + ']');
        if (added) {
            // Если больше нет активных услуг в группе
            if ($('#services option').not(':disabled').size() === 0) {
                // Делаем группу неактивной
                groupOption.attr('disabled', true);
                group.disabled = true;
            }
        } else {
            // Активируем группу услуг
            groupOption.attr('disabled', false);
            group.disabled = false;
            // Активируем направление
            $('#services-distincts option[value=' + group.parent_id + ']').attr('disabled', null);
        }

        return true;
    }

    function uiAddService(id, label) {

        // var newServiceItemHTML = '<a href="#" class="remove-service-btn" data-service-id="' + id + '">' +
        //     '<span class="glyphicon glyphicon-remove-sign glyphicon-red"/></a>' +
        //     '<span data-toggle="tooltip" data-placement="right" title="Удалить услугу" style="margin-left: 5px;">' +
        //     '</span>';

        $('#services-chosen').show()
            .children('ul:first')
            .append(
                $('<li data-id="' + id + '" class="list-group-item selected-service">')
                // .text(label)
                    .append(
                        '<h4 class="service-title">' + label + '</h4>' +
                        '<button class="remove-service-btn label label-danger remove-label" data-service-id="">удалить</button>')
            );
        $('a').data('service-id', id).parent().tooltip();
        $('#choose-services-submit').tooltip('show');
        UpdateServiceSelectState();
        return true;
    }

    function uiRemoveService(id) {
        $('#services-chosen li[data-id=' + id + ']').remove();
        if (!$('#services-chosen li').length) {
            $('#services-chosen').hide();
        }
        return true;
    }

    function UpdateServiceSelectState() {
        var services = getServicesChosen();
        // Показывать форму только если можно добавить еще услуги
        $('#service-form-block').toggle(services.length < $('#services-chosen').data('limit'));
        //  Показывать кнопку "Добавить услугу" только если услуга выбрана
        $('#add-service-form button[type=submit]').attr('disabled', !$('#services').val());
        // Если есть выбранные услуги
        if (services.length) {
            $('#services-chosen').show();
            $('#choose-services-submit').attr('disabled', null)
                .parent().tooltip('destroy');
        } else {
            $('#services-chosen').hide();
            // Если услуга в форме выбрана, делаем кнопку активной
            if ($('#services').val()) {
                $('#choose-services-submit').attr('disabled', null)
                    .parent().tooltip('destroy');
            } else {
                $('#choose-services-submit').attr('disabled', true)
                    .parent().tooltip();
            }
        }
    }

    function GetRecommendationsAndSetToUI(service_id) {
        App.ajaxCall('get_recommendations_for_service', {
            service_id: service_id
        }, function (result) {
            if (result.response !== 0)
            {
                return false;
            }

            if (!result.hasOwnProperty('recommendations_for_service') || result.recommendations_for_service.length === 0)
            {
                return false;
            }

            var serviceRecommendations = result.recommendations_for_service;
            if (typeof serviceRecommendations === 'object')
            {
                serviceRecommendations = [serviceRecommendations];
            }

            var serviceLists = '';

            serviceRecommendations.forEach(function(recommendation) {
                serviceLists += '<li class="recommend-service-item" data-service-id="' + recommendation.service_id + '">' +
                    '<div href="#" class="btn-link color-gold recommend-service"><span class="glyphicon glyphicon-plus"></span> ' +
                    recommendation.title + '</div>' +
                    '</li>';
            });

            var recommendationsHtml = '<ul class="list-unstyled popover-recommendations">' + serviceLists + '</ul>';

            var selectedServiceElem = $('.selected-service[data-id="'+ service_id +'"]');
            selectedServiceElem.popover('destroy');
            $('#choose-services-submit').tooltip('hide');

            selectedServiceElem.popover({
                title: '� екомендуем вместе с этой услугой',
                placement: 'top',
                html: true,
                content: recommendationsHtml
            });
            selectedServiceElem.popover('show');
        });
        return false;
    }


};