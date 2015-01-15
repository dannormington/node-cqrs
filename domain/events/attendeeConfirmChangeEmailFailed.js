var Event = require('./event.js');
var util = require("util");

util.inherits(AttendeeConfirmChangeEmailFailed, Event);

AttendeeConfirmChangeEmailFailed.EVENT = 'AttendeeConfirmChangeEmailFailed';

function AttendeeConfirmChangeEmailFailed(attendeeId, confirmationId){

  Event.call(this, AttendeeConfirmChangeEmailFailed.EVENT, attendeeId);
  this.confirmationId = confirmationId;

}

module.exports = AttendeeConfirmChangeEmailFailed;
