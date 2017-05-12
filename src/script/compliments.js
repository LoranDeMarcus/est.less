var Compliments = {

    modalElement: $('#modalComplimentChoose'),
    choosenCompliment: $('input[name=choosen_compliment_id]'),

    SetModalToDefaultState: function () {
        this.modalElement.find('.error').hide();
        this.modalElement.find('form.compliments').show();
        this.modalElement.find('.btn-choose-compliment').hide();
        $('.choose-complement').find('option').remove();
        $('.choose-complement').append($('<option value="">Загрузка комплиментов..</option>'))
    },

    ModalShowError: function (errorText, isDisableChoose) {
        this.modalElement.find('.error')
            .show()
            .text(errorText);

        this.modalElement.find('.btn-choose-compliment').hide();

        if (isDisableChoose) {
            this.modalElement.find('form.compliments').hide();
        }
    },

    GetComplimentsAndSetupUIChoose: function (serviceIds) {
        App.ajaxCall('get_compliments', {service_ids: serviceIds}, function (result) {
            var complimentsOfService = result.ComplimentsOfService,
                compliments = complimentsOfService.Compliments;

            if (!compliments.hasOwnProperty('Compliment')) {
                Compliments.ModalShowError('Для этой услуги нет доступных комплиментов для выбора!', true);
                return;
            }

            Compliments.SetComplimentsInSelect(compliments.Compliment);
        });
    },

    SetComplimentsInSelect: function (complimentsArray) {
        var chooseForm = this.modalElement.find('form.compliments'),
            complimentChoosenSelect = chooseForm.find('select.choose-complement');

        complimentChoosenSelect.find('option').remove();
        complimentChoosenSelect.append($('<option value="">Выбрать комплимент</option>'));

        complimentsArray.forEach(function (compliment) {
            var option = '<option value="' + compliment.service_id + '" data-info="' + compliment.info + '">'
                + compliment.title + '</option>';
            complimentChoosenSelect.append($(option));
        });
    },

    SetSelectedComplimentInServiceList: function () {

        var chooseForm = Compliments.modalElement.find('form.compliments'),
            selectedComplimentOption = chooseForm.find('select.choose-complement :selected');

        var newComplimentHTML =
            '<li class="selected-compliment">' +
            '<h4 class="when"></h4>' +
            '<div class="photo">' +
            '<img src="/images/podarok1.png" />' +
            '</div>' +
            '<div class="info">' +
            '<h5 class="service-title">' + selectedComplimentOption.text() + '</h5>' +
            '<p>' + selectedComplimentOption.data('info') + '</p>' +
            '<b>Цена: <span class="value">бесплатно</span></b><br>' +
            '<a href="#" class="delete-selected-compliment link color-gold">Удалить и выбрать другой</a>' +
            '</div>' +
            '<input type="hidden" name="selected_compliment_id" value="' + selectedComplimentOption.val() + '"' +
            '<br/>' +
            '</li>';

        $('.review-services-list').append(newComplimentHTML);
    },

    RemoveSelectedComplimentFromUI: function () {
        $('.selected-compliment').remove();
    },

    SetSelectedCompliment: function () {
        var chooseForm = this.modalElement.find('form.compliments'),
            selectedComplimentOption = chooseForm.find('select.choose-complement :selected');

        var compliment = {
          compliment_id: selectedComplimentOption.val(),
          compliment_title: selectedComplimentOption.text(),
          compliment_info: selectedComplimentOption.data('info'),
        };

        App.ajaxCall('set_compliment', compliment, function (result) {
            if (!result.response || result.response !== 1) {
                // todo: notification global func
                $.notify("Ошибка сохранения вашего комплимента, пожалуйста, попробуйте еще раз!" , {
                    type: 'danger',
                    allow_dismiss: true,
                    delay: 100000,
                });
                return;
            }

            Compliments.SetSelectedComplimentInServiceList();
        });
    },

    DeleteComplimentIdFromSession: function () {
        App.ajaxCall('delete_compliment_id', {}, function (result) {
            if (!result.response || result.response !== 1) {
                // todo: notification global func
                $.notify("Сеть недоступна. Попробуйте еще раз." , {
                    type: 'danger',
                    allow_dismiss: true,
                    delay: 100000,
                });
                return;
            }
        });
    },

    AllowConfirmation: function() {
        $('#review-logged-in-confirm').removeClass('disabled');
        $('.btn-confirm-hint').hide();
        $('#review-confirm').removeClass('disabled');
    },

    DisallowConfirmation: function() {
        $('#review-logged-in-confirm').addClass('disabled');
        $('.btn-confirm-hint').show();
        $('#review-confirm').addClass('disabled');
    },


};