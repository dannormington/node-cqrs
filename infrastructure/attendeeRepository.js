var Repository = require('./repository.js');
var Attendee = require('../domain/attendee.js');

var util = require("util");

util.inherits(AttendeeRepository, Repository);

/*
The purpose of this module is to provide the
ability to load and save an attendee aggregate
*/
function AttendeeRepository(){
  Repository.call(this);
}

AttendeeRepository.prototype.getById = function(attendeeId, callback){

  this._eventStore.getEvents(attendeeId, function(err, events){

    if(err){
      callback(err, null);
    }else{

      if(events){
        var attendee = new Attendee(attendeeId);
        attendee.loadFromHistory(events);
        callback(null, attendee);
      }else{
        callback(new Error('No events for aggregate.', null));
      }
    }

  });

};

module.exports = AttendeeRepository;
