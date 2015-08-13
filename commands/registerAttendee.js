
RegisterAttendee.COMMAND = 'RegisterAttendee';

function RegisterAttendee(attendeeId, firstName, lastName, email){

  this.attendeeId = attendeeId;
  this.email = email;
  this.firstName = firstName;
  this.lastName = lastName;

}

module.exports = RegisterAttendee;
