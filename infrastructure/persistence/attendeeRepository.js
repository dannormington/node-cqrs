var Repository = require('./repository.js');
var Attendee = require('../../domain/attendee.js');

var util = require("util");

util.inherits(AttendeeRepository, Repository);

function AttendeeRepository(database){
  Repository.call(this, database);
};

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
