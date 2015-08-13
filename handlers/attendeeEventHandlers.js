var database = require('../infrastructure/database.js');
var util = require("util");

var AttendeeRegistered = require('../domain/events/attendeeRegistered.js');
var AttendeeEmailChanged = require('../domain/events/attendeeEmailChanged.js');
var AttendeeChangeEmailConfirmed = require('../domain/events/attendeeChangeEmailConfirmed.js');
var AttendeeConfirmChangeEmailFailed = require('../domain/events/attendeeConfirmChangeEmailFailed.js');

var Handler = require('./handler.js');

util.inherits(AttendeeEventHandlers, Handler);

//declare at the module level since the class is a singleton
var attendees = database.getCollection("attendee");

/*
The  purpose of this module is to handle
attendee based events by populating the read models
*/
function AttendeeEventHandlers(){

  this.onMessage(AttendeeRegistered.EVENT, handleAttendeeRegistered);
  this.onMessage(AttendeeEmailChanged.EVENT, handleAttendeeEmailChanged);
  this.onMessage(AttendeeChangeEmailConfirmed.EVENT, handleAttendeeChangeEmailConfirmed);
  this.onMessage(AttendeeConfirmChangeEmailFailed.EVENT, handleAttendeeConfirmChangeEmailFailed);

}

/*
handle the event that is published when a user attempts to
confirm a changed email address when the confirmation Id does
not match the most recent email change request
*/
function handleAttendeeConfirmChangeEmailFailed(event){

  console.log("handling " + event.name);

  //send an email to the attendee informing them that the confirmation failed.
}

/*
handle the change email confirmed event by updaing
the attendee's email in the read model
*/
function handleAttendeeChangeEmailConfirmed(event){

  console.log("handling " + event.name);

  attendees.findOne({attendeeId:event.aggregateId}, function(err, attendee){
    if(err){

      /*
      In production environment you may want to log this error and/or
      contact IT staff through email to notify them of the issue
      */

      console.log(err);
    }else{
      if(attendee){
        attendee.email = event.email.toLowerCase();

        attendees.update({attendeeId:event.aggregateId}, attendee, function(err){
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
  });
}

/*
handle the email changed event by sending
an email to the new address. The email will
provide a link that allows the user to confirm.
*/
function handleAttendeeEmailChanged(event){
  console.log("handling " + event.name);

  //send email with confirmationId to the attendee's new email

}

/*
handle the attendee registered event by
creating a new attendee record
*/
function handleAttendeeRegistered(event){

    console.log("handling " + event.name);

    //check to see if the email already exists in the read model
    attendees.findOne({email:event.email}, function(err, existingAttendee){

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

          attendees.insert(attendee, function(err){
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

    });
}

module.exports = new AttendeeEventHandlers();
