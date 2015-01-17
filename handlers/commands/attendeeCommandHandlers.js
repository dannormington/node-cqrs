var AttendeeDataProvider = require('../../infrastructure/attendeeDataProvider.js');
var AttendeeRepository = require('../../infrastructure/attendeeRepository.js');
var Attendee = require('../../domain/attendee.js');

function AttendeeCommandHandlers(){

  /*
  handles the registration of an attendee
  */
  this.handleRegisterAttendee = function(command, callback){

    //validate the command
    if(!command || !command.firstName || !command.lastName || !command.email || !command.id ||
      command.firstName.trim().length === 0 ||
      command.lastName.trim().length === 0 ||
      command.email.trim().length === 0){

      callback(new Error('invalid parameters'),false);

      return;
    }

    var attendeeDataProvider = new AttendeeDataProvider();

    //check to see if the email already exists in the read model
    attendeeDataProvider.getAttendeeByEmail(command.email, function(err, existingAttendee){

      if(err){
        callback(err, true);
      }else{

        if(existingAttendee){
          callback(new Error('email already exists.'), false);
        }else{

          var attendee = new Attendee(command.id).init(command.firstName, command.lastName, command.email);

          var repository = new AttendeeRepository();

          repository.save(attendee, function(err){

            if(err){
              callback(err, true);
            }else{
              callback(null);
            }
          });
        }
      }
    });
  };

  //Handles changing an attendee's email
  this.handleChangeEmail = function(command, callback){

    //validate the command
    if(!command.email || command.email.trim().length === 0){
      callback(new Error('invalid parameters'), false);
      return;
    }

    var attendeeDataProvider = new AttendeeDataProvider();

    //check to see if the email already exists in the read model
    attendeeDataProvider.getAttendeeByEmail(command.email, function(err, existingAttendee){

      if(err){
        callback(err, true);
      }else{

        if(existingAttendee){
          callback(new Error('email already exists.'), false);
        }else{

          var id = parseInt(command.id);
          var email = command.email.trim();

          var repository = new AttendeeRepository();

          repository.getById(id, function(err, attendee){
            if(err){
              callback(err, true);
            }else{

              attendee.changeEmail(email);

              repository.save(attendee, function(err){
                if(err){
                  callback(err, true);
                }else{
                  callback(null);
                }
              });
            }
          });
        }
      }
    });
  };

  //Handle confirming an email change
  this.handleConfirmChangeEmail = function(command, callback){

    //validate the command
    if(!command.confirmationId || command.confirmationId.trim().length === 0){
      callback(new Error('invalid parameters'), false);
      return;
    }

    var id = parseInt(command.id);
    var confirmationId = command.confirmationId;

    var repository = new AttendeeRepository();

    repository.getById(id, function(err, attendee){
      if(err){
        callback(err, true);
      }else{

        attendee.confirmChangeEmail(confirmationId);

        repository.save(attendee, function(err){
          if(err){
            callback(err, true);
          }else{
            callback(null);
          }
        });
      }
    });
  };

}

module.exports = new AttendeeCommandHandlers();
