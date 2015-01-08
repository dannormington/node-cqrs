//Represents a base for all events
function Event(name, aggregateId){
  this.name = name;
  this.version = 0;
  this.aggregateId = aggregateId
};

module.exports = Event;
