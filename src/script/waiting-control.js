function WaitingControl(seconds, messageData, redirectLink)
{
    this.seconds = parseInt(seconds);
    this.message_title = messageData.message_title;
    this.message_text = messageData.message_text;
    this.redirectLink = redirectLink;

    this.showNotification = function (title, message, delayMs)
    {
        var notifyText = '<strong>' + title + '</strong><br />' + message;

        $.notify(notifyText , {
            type: 'info',
            allow_dismiss: false,
            delay: delayMs,
        });
    };

    this.waitAndRedirect = function ()
    {
        var delayMillisec = this.seconds * 1000;
        var delayMessage = Math.floor(delayMillisec - delayMillisec / 3);

        var self = this;

        setTimeout(function()
        {
            self.showNotification(self.message_title, self.message_text, delayMessage);

        }, Math.floor(delayMessage));

        setTimeout(function()
        {
            window.location.replace(self.redirectLink);
        }, delayMillisec);

    }

}