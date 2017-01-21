
ConfirmChangeEmail.COMMAND = 'ConfirmChangeEmail';

function ConfirmChangeEmail(attendeeId, confirmationId){

  this.attendeeId = attendeeId;
  this.confirmationId = confirmationId;

}

module.exports = ConfirmChangeEmail;
