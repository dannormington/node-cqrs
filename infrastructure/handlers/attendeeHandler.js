/*
The  purpose of this module is to handle
attendee based events by populating the read models
*/
function AttendeeHandler(database){

  this._attendees = database.collection("attendees");

  /*
  handle the attendee registered event by
  creating a new attendee record
  */
  this.handleAttendeeRegistered = function(event){

    console.log("handling " + event.name);

    var attendee = {
      attendeeId: event.aggregateId,
      firstName: event.firstName,
      lastName: event.lastName,
      email: event.email
    };

    this._attendees.insert(attendee, function(err, result){
      if(err){
        //log the error
      }
    });

  }.bind(this);

  /*
  handle the email changed event by sending
  an email to the new address. The email will
  provide a link that allows the user to confirm.
  */
  this.handleAttendeeEmailChanged = function(event){
    console.log("handling " + event.name);

    //send email with confirmationId
  };

  /*
  handle the change email confirmed event.
  This event is published once the user has confirmed their
  email address. Once confirmed, the attendee read model's
  email is updated
  */
  this.handleAttendeeChangeEmailConfirmed = function(event){
    console.log("handling " + event.name);

    this._attendees.findOne({attendeeId:event.aggregateId}, function(err, attendee){
      if(err){
        //log the error
      }else{
        if(attendee){
          attendee.email = event.email;

          this._attendees.update({attendeeId:event.aggregateId}, attendee, function(err, results){
            if(err){
              //log the error
            }
          });
        }
      }
    }.bind(this));
  }.bind(this);

};


module.exports = AttendeeHandler;
