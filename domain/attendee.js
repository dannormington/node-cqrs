var AggregateRoot = require('./aggregateRoot.js');
var AttendeeRegistered = require('./events/attendeeRegistered.js');
var AttendeeEmailChanged = require('./events/attendeeEmailChanged.js');
var AttendeeChangeEmailConfirmed = require('./events/attendeeChangeEmailConfirmed.js');
var AttendeeConfirmChangeEmailFailed = require('./events/attendeeConfirmChangeEmailFailed.js');

var util = require("util");
var uuid = require("uuid/v4");

util.inherits(Attendee, AggregateRoot);

/*
The purpose of this module to to help
manage state changes for an attendee
*/
function Attendee(id){

  AggregateRoot.call(this, id);

  /*
  represents the confirmation Id created
  when an attendee changes their email address.
  only the most recent Id is kept in state
  */
  this._confirmationId = null;

  /*
  represents the current email address.
  */
  this._email = null;

  this.onEvent(AttendeeRegistered.EVENT, function(event) {
    this._email = event.email;
  }.bind(this));

  this.onEvent(AttendeeEmailChanged.EVENT, function(event) {
    //assign the confirmation Id and email
    this._confirmationId = event.confirmationId;
    this._email = event.email;
  }.bind(this));

  this.onEvent(AttendeeChangeEmailConfirmed.EVENT, function(/*event*/) {
    //reset the Id and email to null since the confirmation has occurred
    this._confirmationId = null;
  }.bind(this));

}

Attendee.prototype.init = function(firstName, lastName, email){

  //validate that first, last and email all contain something
  if(!firstName || !lastName || !email ||
      firstName.trim().length === 0 ||
      lastName.trim().length === 0 ||
      email.trim().length === 0){
    return null;
  }

  this.applyChange(new AttendeeRegistered(this.getId(), firstName.trim(), lastName.trim(), email.trim().toLowerCase()));

  return this;
};

Attendee.prototype.changeEmail = function(email){

  //validate the email exists
  if(email && email.trim().length > 0){
    this.applyChange(new AttendeeEmailChanged(uuid(), this.getId(), email.trim().toLowerCase()));
  }

};

Attendee.prototype.confirmChangeEmail = function(confirmationId){

  if(confirmationId === this._confirmationId){
    this.applyChange(new AttendeeChangeEmailConfirmed(this.getId(), confirmationId, this._email));
  }else{
    this.applyChange(new AttendeeConfirmChangeEmailFailed(this.getId(), confirmationId));
  }

};


module.exports = Attendee;
