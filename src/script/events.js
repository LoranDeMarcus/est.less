$('.activate-compliments-modal').on('click', function () {
    var thatElem = $(this);
    var thatElemParent = thatElem.parent();
    var infoElem = thatElemParent.parent().find('.info');

    var serviceTitle = infoElem.find('.service-title').text();
    var choosenServiceRemoteId = thatElemParent.parent().find('input[name=service_remote_id]').val();

    Compliments.SetModalToDefaultState();
    Compliments.modalElement.find('.service-title').text(serviceTitle);
    Compliments.GetComplimentsAndSetupUIChoose([choosenServiceRemoteId]);
    // testing
    // Compliments.GetComplimentsAndSetupUIChoose(['00000004511']);
});

$('.choose-complement').on('change', function () {
    var thatElem = $(this);

    if (thatElem.val() === '') {
        Compliments.modalElement.find('.btn-choose-compliment').hide();
        return;
    }

    Compliments.modalElement.find('.btn-choose-compliment').show();
});

// Compliments.modalElement.on('hide.bs.modal', function () {
//     Compliments.SetModalToDefaultState();
// });

$('.btn-choose-compliment').on('click', function () {
    Compliments.SetSelectedCompliment();
    Compliments.modalElement.modal('hide');
    $('.activate-compliments-modal').hide();
    Compliments.AllowConfirmation();
});

$('.review-services-list').on('click', '.delete-selected-compliment', function () {
    Compliments.DeleteComplimentIdFromSession();
    Compliments.RemoveSelectedComplimentFromUI();
    $('.activate-compliments-modal').show();
    Compliments.DisallowConfirmation();
});