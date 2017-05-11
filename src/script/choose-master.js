function InitChooseMaster() {
    // Р°РєС‚РёРІР°С†РёСЏ РїР»Р°РіРёРЅР° bootstrap tooltip
    $('[data-toggle="tooltip"]').tooltip();

    // РЎРґРµР»Р°С‚СЊ Р°РєС‚РёРЅРІС‹Рј РїРµСЂРІС‹Р№ С‚Р°Р± Рё РїР°РЅРµР»СЊ
    //if ( $('#services-nav > li').size() ) {
    //$('#services-nav > li:first').addClass('active');
    //$('.tab-content > .tab-pane:first').addClass('active');
    //} else {
    //// РџРѕРєР°Р·Р°С‚СЊ С„РѕСЂРјСѓ РґРѕР±Р°РІР»РµРЅРёСЏ СѓСЃР»СѓРіРё
    //$('#add-service-panel').show();
    //$('#services-block, .controls').hide();
    //}

    // РќР°РІРёРіР°С†РёСЏ РїРѕ СѓСЃР»СѓРіР°Рј
    $(document).on('click', '#services-nav a', function () {
        $(this).tab('show');
        return false;
    });

    // Р›РѕРіРёРєР° Р±Р»РѕРєР° РєРЅРѕРїРѕРє "РљР»Р°СЃСЃ РјР°СЃС‚РµСЂР°"
    $(document).on('click', '.master-types label', function (event) {
        // РћР±РЅРѕРІРёС‚СЊ РІРёР·СѓР°Р»СЊРЅРѕРµ СЃРѕСЃС‚РѕСЏРЅРёРµ РєРЅРѕРїРѕРє
        serviceId = $(this).attr('id')
        console.log(serviceId)
        parentId = $('.master-types label #' + serviceId).parent().attr('id')
        //if ($(this).hasClass(serviceId)) {
        if ($('.master-types label #' + serviceId).hasClass('any') && serviceId == parentId) {
            $(this).removeClass('active');
            $(this).siblings('label #' + serviceId).removeClass('active');
        } else {
            $(this).siblings('label.any').removeClass('active');
        }

        // РћР±РЅРѕРІРёС‚СЊ СЃРїРёСЃРѕРє РјР°СЃС‚РµСЂРѕРІ РЅР° РѕСЃРЅРѕРІРµ С„РёР»СЊС‚СЂР°
        setTimeout(function () {
            var $labels = $('.master-types label.active');
            console.log($labels);
            if ($('.master-types label.active').hasClass('any')) {
                // Р’С‹Р±СЂР°РЅС‹ РІСЃРµ РєР»Р°СЃСЃС‹
                $('.' + serviceId + ' .masters-list .master').removeClass('hidden');
            } else {
                $('.master-types label .any').removeClass('hidden')
                $('.' + serviceId + ' .masters-list .master').addClass('hidden');
                $labels.each(function () {
                    var clazz = $(this).data('class');
                    console.log('activating class ' + clazz);
                    $('.' + serviceId + ' .masters-list .master[data-class="' + clazz + '"]').removeClass('hidden');
                });
            }

        }, 10);
        console.log('test service id now: ' + serviceId)
    });

    // Р’С‹Р±РѕСЂ РјР°СЃС‚РµСЂРѕРІ
    $(document).on('click', '.master > a', function () {
        if ($(this).hasClass('master-vacation')) return;
        var master = $(this).parents('.master');
        master.toggleClass('active')
            .find('input[type=checkbox]')
            .attr('checked', master.hasClass('active'));
        // РћР±РЅРѕРІРёС‚СЊ СЃРѕСЃС‚РѕСЏРЅРёРµ РіРѕС‚РѕРІРЅРѕСЃС‚Рё
        updateReadyState();
        return false;
    });

    // Р’С‹Р±СЂР°С‚СЊ РІСЃРµС… РјР°СЃС‚РµСЂРѕРІ
    $(document).on('click', '#select-all-btn', function () {
        $(this).parents('form').find('a.media').addClass('active');
        // РћР±РЅРѕРІРёС‚СЊ СЃРѕСЃС‚РѕСЏРЅРёРµ РіРѕС‚РѕРІРЅРѕСЃС‚Рё
        updateReadyState();
    });

    // РЎР°Р±РјРёС‚ С„РѕСЂРјС‹
    $('#choose-master-submit').on('click', function () {
        var submit = $(this);
        // Р”РµР°РєС‚РёРІРёСЂСѓРµРј РјР°СЃС‚РµСЂРѕРІ СЃРєСЂС‹С‚С‹С… С„РёР»СЊС‚СЂРѕРј
        $('.masters-list .master.hidden input[type=checkbox]').attr('checked', null);
        // РЎРµСЂРёР°Р»РёР·СѓРµРј РїР°СЂР°РјРµС‚СЂС‹ С„РѕСЂРјС‹
        var params = $('.choose-concrete-master:not(.hidden) form[name=master]').serialize();
        submit.attr('disabled', true);
        $.post(submit.data('submit'), params, function () {
            // РЎРѕСЃС‚РѕСЏРЅРёРµ С„РѕСЂРјС‹ СѓСЃРїРµС€РЅРѕ СЃРѕС…СЂР°РЅРµРЅРѕ
            window.location = submit.attr('href');
        });
        return false;
    });

    // РљРЅРѕРїРєР° Р”РѕР±Р°РІРёС‚СЊ СѓСЃР»СѓРіСѓ
    $(document).on('click', '.add-service-btn', function () {
        $('#add-service-panel').show();
        $('#services-block, .controls').hide();
    });

    // РРЅРёС†РёР°Р»РёР·РёСЂСѓРµРј СЃРѕСЃС‚РѕСЏРЅРёРµ РіРѕС‚РѕРІРЅРѕСЃС‚Рё
    updateReadyState();


    function getServicesCount() {
        return $('.tab-pane:not(.hidden) form[name=master]').size();
    }

// Р”РѕР±Р°РІРёС‚СЊ СѓСЃР»СѓРіСѓ РІ DOM
    function uiAddService(id, label) {
        // Р”РµР°РєС‚РёРІРёСЂРѕРІР°С‚СЊ РІСЃРµ С‚Р°Р±С‹
        $('#services-nav li.active').removeClass('active');
        $('.tab-pane.active').removeClass('active');
        // РЎРґРµР»Р°С‚СЊ РЅРµРґРѕСЃС‚СѓРїРЅС‹Рј С‚Р°Р± РґРѕР±Р°РІР»РµРЅРёСЏ СѓСЃР»СѓРіРё
        // $('#services-nav .add-service-tab').attr('disabled', true);
        // Р”РѕР±Р°РІРёС‚СЊ С‚Р°Р± РІ РЅР°РІРёРіР°С†РёСЋ
        var anchor = $('<a>').text(label).attr('href', '#service-' + id);
        $('<li class="active"></li>').append(anchor)
            .appendTo('#services-nav');
        // Р”РѕР±Р°РІРёС‚СЊ РїР°РЅРµР»СЊ С‚Р°Р±Р°
        $.get(App.siteUrl('record/choose_master_service/' + id), function (markup) {
            // РџРѕРєР°Р·С‹РІР°РµРј С‚Р°Р±С‹
            $('#services-block, .controls').show();
            // РЎРєСЂС‹РІР°РµРј С„РѕСЂРјСѓ
            $('#add-service-panel').hide();
            $(markup).addClass('active').appendTo('.tab-content');
            // $('#services-nav .add-service-tab').attr('disabled', false);
            // Р›РёРјРёС‚ СѓСЃР»СѓРі
            if (getServicesCount() >= App.servicesLimit) {
                $('.add-service-tab, .add-service-btn').hide();
            }
            // РћР±РЅРѕРІРёС‚СЊ СЃРѕСЃС‚РѕСЏРЅРёРµ РіРѕС‚РѕРІРЅРѕСЃС‚Рё
            updateReadyState();
        });
        return true;
    }

// РЈРґР°Р»РёС‚СЊ СѓСЃР»СѓРіСѓ РёР· DOM
    function uiRemoveService(service_id) {
        var pane = $('#service-' + service_id),
            li = $('a[href=#service-' + service_id + ']').parent();
        // Р’С‹Р±РёСЂР°РµРј РїСЂРµРґС‹РґСѓС‰РёР№ С‚Р°Р±
        if (li.prev().size()) {
            li.prev().find('a').trigger('click');
        } else if (li.next().size()) { // РёР»Рё РµСЃР»Рё РµРіРѕ РЅРµС‚, С‚Рѕ СЃР»РµРґСѓСЋС‰РёР№
            li.next().find('a').trigger('click');
        } else { // РЅРµС‚ Р±РѕР»СЊС€Рµ СѓСЃР»СѓРі, РїРѕРєР°Р·С‹РІР°РµРј С„РѕСЂРјСѓ
            $('#add-service-panel').show();
            $('#services-block, .controls').hide();
        }
        // РЈРґР°Р»СЏРµРј С‚Р°Р±
        li.remove();
        // РЈРґР°Р»СЏРµРј СЃРѕРґРµСЂР¶РёРјРѕРµ
        pane.remove();
        return true;
    }

    function updateReadyState() {
        var services = $('form[name=master]'),
            isReady = true;
        if (services.length) {
            services.each(function () {
                if (!$(this).find('.master.active').length) {
                    // РЅРµ РІС‹Р±СЂР°РЅ РЅРё РѕРґРёРЅ РјР°СЃС‚РµСЂ РґР»СЏ СЌС‚РѕР№ СѓСЃР»СѓРіРё
                    isReady = false;
                    return false;
                }
            });
        } else { // РЅРµ РІС‹Р±СЂР°РЅРѕ РЅРё РѕРґРЅРѕР№ СѓСЃР»СѓРіРё
            isReady = false;
        }
        // РІ СЃР»СѓС‡Р°Рµ РЅРµ СЃРѕР±Р»СЋРґРµРЅРёСЏ РѕР±СЏР·Р°С‚РµР»СЊРЅС‹С… СѓСЃР»РѕРІРёР№ РїРµСЂРµС…РѕРґ РЅР° СЃР»РµРґ. С€Р°Рі РЅРµРІРѕР·РјРѕР¶РµРЅ
        if (!isReady) {
            $('#choose-master-submit').attr('disabled', true)
                .parent().tooltip();
        } else {
            $('#choose-master-submit').attr('disabled', false)
                .parent().tooltip('destroy');
        }
    }
};