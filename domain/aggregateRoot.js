var EventEmitter = require('events').EventEmitter;

/*
The purpose of this module is to provide
base aggregate root functionality to
to load an aggregate from an event stream and
help manage state changes.
*/
function AggregateRoot(id){
  this._id = id;
  this._version = 0;
  this._uncommittedChanges = [];
  this._eventEmitter = new EventEmitter();
}

/*
Get the aggregate's Id
*/
AggregateRoot.prototype.getId = function(){
  return this._id;
};

/*
Hydrate the aggregates state
*/
AggregateRoot.prototype.loadFromHistory = function(events){
  if(events){
    events.forEach(function(event){
      //hydrate all state by emitting the event to the listeners
      this._eventEmitter.emit(event.name, event);

      //increment the version
      this._version++;

    }.bind(this));
  }
};

/*
Get a list of all the state changes
*/
AggregateRoot.prototype.getUncommittedChanges = function(){
  return this._uncommittedChanges;
};

/*
Get the aggregate's current version
*/
AggregateRoot.prototype.getVersion = function(){
  return this._version;
};

/*
Apply the event's state changes and add it to
the list of uncommitted changes.
*/
AggregateRoot.prototype.applyChange = function(event){
  this._uncommittedChanges.push(event);
  this._eventEmitter.emit(event.name, event);
};

/*
Clear the list of uncommitted changes and update
the aggregate's current version
*/
AggregateRoot.prototype.markChangesAsCommitted = function(){

  if(this._uncommittedChanges){

    var numberOfEvents = this._uncommittedChanges.length;

    this._version += numberOfEvents;

    //clear the elements from the array
    for(var index = 0; index < numberOfEvents; index++){
      this._uncommittedChanges.shift();
    }
  }
};

/*
The purpose of this method is to allow classes that
inherit from AggregateRoot to handle state changes
based upon specific events.
*/
AggregateRoot.prototype.onEvent = function(name, listener) {
	return this._eventEmitter.on(name, listener);
};


module.exports = AggregateRoot;
