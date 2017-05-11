function InitRecordConfirm()
{
    var hash = window.location.hash.split('#')[1];

    $('.btn-confirm-record').on('click', function () {
        $(this).addClass('active');
        $('.btn-confirm-registration').removeClass('active');
        $('.btn-confirm-cabinet').removeClass('active');

        $('.confirm-registration').hide();
        $('.confirm-cabinet').hide();
        $('.confirm-record').show();
    });

    $('.btn-confirm-registration').on('click', function () {
        $(this).addClass('active');
        $('.btn-confirm-record').removeClass('active');
        $('.btn-confirm-cabinet').removeClass('active');

        $('.confirm-registration').show();
        $('.confirm-cabinet').hide();
        $('.confirm-record').hide();
    });

    $('.btn-confirm-cabinet').on('click', function () {
        $(this).addClass('active');
        $('.btn-confirm-record').removeClass('active');
        $('.btn-confirm-registration').removeClass('active');

        $('.confirm-registration').hide();
        $('.confirm-cabinet').show();
        $('.confirm-record').hide();
    });

    /*
    if (hash == 'registration') {
        $('.confirm-panel-title').show().text('� егистрация');

        $('.confirm-page').hide();
        $('.auth-panel').hide();
        $('.registration-panel-bycard').hide();

        $('.confirm-preview').show();
        $('.registration-panel').show();
    }

    // кнопка назад для всех панелей
    $(document).on('click', '.confirm-btn-go-back', function () {

        $('.confirm-page').show();
        $('.confirm-preview').hide();

        $('form').trigger('reset');

        $('.auth-panel').hide();
        $('.registration-panel-bycard').hide();
        $('.registration-panel').hide();
        $('.confirm-panel-title').hide();

    });
    // кнопка confirm-btn-go-writenobody - активация панели регистрации (заполнения анкеты)
    $(document).on('click', '.confirm-btn-go-register', function () {

        window.location.href = "/record/review#registration";
        $('.confirm-panel-title').show().text('� егистрация');

        $('.confirm-page').hide();
        $('.auth-panel').hide();
        $('.registration-panel-bycard').hide();

        $('.confirm-preview').show();
        $('.registration-panel').show();
    });
    // кнопка confirm-btn-go-register-bycard- активация панели регистрации по карте
    $(document).on('click', '.confirm-btn-go-register-bycard', function () {

        $('.confirm-panel-title').show().text('� егистрация');

        $('.confirm-page').hide();
        $('.registration-panel').hide();
        $('.auth-panel').hide();

        $('.confirm-preview').show();
        $('.registration-panel-bycard').show();

    });
    // кнопка confirm-btn-go-auth - активация панели входа
    $(document).on('click', '.confirm-btn-go-auth', function () {

        $('.confirm-panel-title').show().text('Войти в личный кабинет');

        $('.confirm-page').hide();
        $('.registration-panel').hide();
        $('.registration-panel-bycard').hide();

        $('.confirm-preview').show();
        $('.auth-panel').show();

    });
    */

    $(document).ready(function() {

        $('.auth-toggle').click(function() {
            var $toggle = $(this),
                text = $toggle.text().trim();
            // Rotate toggle text
            $toggle.text($toggle.data('alt-text'))
                .data('alt-text', text);
            // Toggle panes
            $('.auth').toggleClass('hidden');
            return false; // Prevent default
        });
    });

    $('#review-logged-in-confirm').click(function () {
        //window.location = '/record/confirm';
        $.post('/ajax/set_utail_user', { // todo short url
            utail_user_id: $('input[name=utail-user-id]').val()
        }, function (data) {
            window.location.href = '/record/confirm';
        });
    });
}