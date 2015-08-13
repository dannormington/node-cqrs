
ConfirmChangeEmail.COMMAND = 'ConfirmChangeEmail';

function ConfirmChangeEmail(attendeeId, confirmationId, email){

  this.attendeeId = attendeeId;
  this.confirmationId = confirmationId;
  this.email = email;

}

module.exports = ConfirmChangeEmail;
