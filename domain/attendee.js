var AggregateRoot = require('./aggregateRoot.js');
var AttendeeRegistered = require('./events/attendeeRegistered.js');
var AttendeeEmailChanged = require('./events/attendeeEmailChanged.js');
var AttendeeChangeEmailConfirmed = require('./events/attendeeChangeEmailConfirmed.js');

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

  /*
  represents the unconfirmed email address that the user
  made a request to change to
  */
  this._unconfirmedEmail = null;

  this.onEvent(AttendeeRegistered.EVENT, function(event) {
    this._email = event.email;
  }.bind(this));

  this.onEvent(AttendeeEmailChanged.EVENT, function(event) {
    this._confirmationId = event.confirmationId;
    this._unconfirmedEmail = event.email;
  }.bind(this));

  this.onEvent(AttendeeChangeEmailConfirmed.EVENT, function(event) {
    this._email = event.email;
    this._confirmationId = null;
    this._unconfirmedEmail = null;
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

  //validate that the confirmation Ids match
  if(confirmationId === this._confirmationId){
    this.applyChange(new AttendeeChangeEmailConfirmed(this.getId(), confirmationId, this._unconfirmedEmail));
  }

};


module.exports = Attendee;
