/*
The  purpose of this module is to handle
attendee based events by populating the read models
*/
function AttendeeHandler(database){

  this._attendees = database.collection("attendee");

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

    this._attendees.insert(attendee, function(err){
      if(err){
        //log the error. For now just log to the console
        console.log(err);
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
        console.log(err);
      }else{
        if(attendee){
          attendee.email = event.email;

          this._attendees.update({attendeeId:event.aggregateId}, attendee, function(err){
            if(err){
              //log the error. For now just log to the console
              console.log(err);
            }
          });
        }
      }
    }.bind(this));
  }.bind(this);

}


module.exports = AttendeeHandler;
