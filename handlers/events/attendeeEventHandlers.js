var database = require('../../infrastructure/database.js');

/*
The  purpose of this module is to handle
attendee based events by populating the read models
*/
function AttendeeHandlers(){

  this._attendees = database.getCollection("attendee");

  /*
  handle the attendee registered event by
  creating a new attendee record
  */
  this.handleAttendeeRegistered = function(event){

    console.log("handling " + event.name);

    //check to see if the email already exists in the read model
    this._attendees.findOne({email:event.email}, function(err, existingAttendee){

      if(err){

        /*
        In production environment you may want to log this error and/or
        contact IT staff through email to notify them of the issue
        */

        console.log(err);
      } else {

        if(existingAttendee){

          /*
          Due to a race condition the attendee already exists.
          Best solution may be to send an email to the attendee
          informing them of what happened along with a possible
          solution.
          */
          console.log("Attendee email already registered");

        }else{

          var attendee = {
            attendeeId: event.aggregateId,
            firstName: event.firstName,
            lastName: event.lastName,
            email: event.email
          };

          this._attendees.insert(attendee, function(err){
            if(err){
              /*
              In production environment you may want to log this error and/or
              contact IT staff through email to notify them of the issue
              */

              console.log(err);
            }
          });
        }
      }

    }.bind(this));
  }.bind(this);

  /*
  handle the email changed event by sending
  an email to the new address. The email will
  provide a link that allows the user to confirm.
  */
  this.handleAttendeeEmailChanged = function(event){
    console.log("handling " + event.name);

    //send email with confirmationId to the attendee's new email

  };

  /*
  handle the change email confirmed event by updaing
  the attendee's email in the read model
  */
  this.handleAttendeeChangeEmailConfirmed = function(event){

    console.log("handling " + event.name);

    this._attendees.findOne({attendeeId:event.aggregateId}, function(err, attendee){
      if(err){

        /*
        In production environment you may want to log this error and/or
        contact IT staff through email to notify them of the issue
        */

        console.log(err);
      }else{
        if(attendee){
          attendee.email = event.email.toLowerCase();

          this._attendees.update({attendeeId:event.aggregateId}, attendee, function(err){
            if(err){
              /*
              In production environment you may want to log this error and/or
              contact IT staff through email to notify them of the issue
              */

              console.log(err);
            }
          });
        }else{
          /*
          attendee wasn't found. This shouldn't happen. As with other
          situations when handling events where a problem occurs it might
          be best to log the issue and contact IT staff through email to notify
          them of the issue.
          */
          console.log("Attendee not found. Cannot update email.");

        }
      }
    }.bind(this));
  }.bind(this);

  /*
  handle the event that is published when a user attempts to
  confirm a changed email address when the confirmation Id does
  not match the most recent email change request
  */
  this.handleAttendeeConfirmChangeEmailFailed = function(event){

    console.log("handling " + event.name);

    //send an email to the attendee informing them that the confirmation failed.
  };

}

module.exports = new AttendeeHandlers();
