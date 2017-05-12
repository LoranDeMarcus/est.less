$('.confirm-preview').ready(function () {

    if ($('.confirm-preview').length === 0) {
        return;
    }

    $('.review-services-list li').each(function (i, service) {
        var serviceElem = $(service);
        var date = serviceElem.children('.date').val();
        var serviceId = serviceElem.children('.service-id').val();
        var masterId = serviceElem.children('.master-id').val();
        var timeFrom = serviceElem.children('.time-from').val();

        // С‚РѕР»СЊРєРѕ РґР»СЏ id-С€РЅРёРєРѕРІ РёРЅС„СЂРѕРєСЂР°СЃРЅРѕР№ СЃР°СѓРЅС‹
        var allowAdServicesList = [
            '00000102305',
            '00000102306',
            '00000103463',
            '00000105609',
            '00000105610',
        ];

        var allowMasterId = '84'; // С‚РѕР»СЊРєРѕ РґР»СЏ РјР°СЃС‚РµСЂР° "РРљ-СЃР°СѓРЅР°"

        App.ajaxCall('get_recommendations_for_service', {
            service_id: serviceId
        }, function (result) {
            if (result.response !== 0) {
                return false;
            }

            if (!result.hasOwnProperty('recommendations_for_service') || result.recommendations_for_service.length === 0) {
                return false;
            }

            $('#review-logged-in-confirm').addClass('disabled');

            var serviceRecommendations = result.recommendations_for_service;
            if (typeof serviceRecommendations === 'object')
            {
                serviceRecommendations = [serviceRecommendations];
            }

            var ad = {};
            serviceRecommendations.forEach(function(recommendation) {
                if (allowAdServicesList.indexOf(recommendation.service_remote_id) > -1) {
                    ad = recommendation;
                    return;
                }
            });

            if (ad.hasOwnProperty('info')) {
                var adHTMLContent = '' +
                    '<p>' + ad.info + '</p>' +
                    '<div class="button-group btn-group-sm">' +
                        '<button class="btn btn-success ad-button-yes" ' +
                        'data-date="' + date + '"' +
                        'data-master-id="' + allowMasterId + '"' +
                        'data-time-from="' + timeFrom + '"' +
                        'data-service-id="' + ad.service_id + '">Р”Р°</button>&nbsp;' +
                        '<button class="btn btn-default ad-button-no">РќРµС‚</button>' +
                    '</div>';

                serviceElem.popover({
                    title: ad.title,
                    placement: 'top',
                    html: true,
                    content: adHTMLContent
                });

                serviceElem.popover('show');
            }

        });
    });
});

$(document).on('click', '.ad-button-yes', function () {
    var date = $(this).data('date');
    var serviceId = $(this).data('service-id');
    var masterId = $(this).data('master-id');
    var timeFrom = $(this).data('time-from');
    var popover = $(this).parents().find('.popover');

    $('#review-logged-in-confirm').removeClass('disabled');

    App.ajaxCall('record_confirm_ad_record', {
        date: date,
        service_id: serviceId,
        master_id: masterId,
        time_from: timeFrom
    }, function (result) {

        console.log(result);
        switch (result.response) {
            case 'err':
                var notifyType = 'danger';
                var errCode = parseInt(result.code);
                switch (errCode) {
                    case 10:
                        var notifyText = 'РЈ РІР°СЃ СѓР¶Рµ РёРјРµСЋС‚СЃСЏ Р·Р°РїРёСЃРё РЅР° РІСЂРµРјСЏ, РєРѕС‚РѕСЂРѕРµ РїР»Р°РЅРёСЂРѕРІР°Р»РѕСЃСЊ РґР»СЏ Р±СЂРѕРЅРё РРљ-СЃР°СѓРЅС‹!';
                        break;
                    default:
                        var notifyText = 'Рљ СЃРѕР¶Р°Р»РµРЅРёСЋ РІ РРљ-СЃР°СѓРЅСѓ РІСЂРµРјСЏ Р·Р°Р±СЂРѕРЅРёСЂРѕРІР°РЅРѕ РёР»Рё РЅРµРґРѕСЃС‚СѓРїРЅРѕ.';
                        break;
                }
                break;
            case 'ok':
                var notifyText = 'Р’СЂРµРјСЏ РЅР° РРљ-СЃР°СѓРЅСѓ СѓСЃРїРµС€РЅРѕ Р·Р°Р±СЂРѕРЅРёСЂРѕРІР°РЅРѕ РІ РІР°С€РµРј Р»РёС‡РЅРѕРј РєР°Р±РёРЅРµС‚Рµ!';
                var notifyType = 'success';
                break;
            default:
                var notifyText = 'Р’РѕР·РЅРёРєР»Р° РѕС€РёР±РєР° СЃРµСЂРІРµСЂР°. РџРѕРїСЂРѕР±СѓР№С‚Рµ РїРѕР·Р¶Рµ.';
                var notifyType = 'danger';
                break;
        }

        $.notify(notifyText , {
            type: notifyType,
            allow_dismiss: false,
            delay: 5000
        });

        popover.popover('destroy');
    });

});

$(document).on('click', '.ad-button-no', function () {
    var popover = $(this).parents().find('.popover');
    $('#review-logged-in-confirm').removeClass('disabled');
    popover.popover('destroy');
});