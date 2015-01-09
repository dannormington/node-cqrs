/*
The purpose of this module is to
provide base properties for all
events.
*/
function Event(name, aggregateId){
  this.name = name;
  this.version = 0;
  this.aggregateId = aggregateId
};

module.exports = Event;
