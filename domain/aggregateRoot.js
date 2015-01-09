var EventEmitter = require('events').EventEmitter

/*
The purpose of this module is to provide
base aggregate root functionality to
to load an aggregate from an event stream and
help manage state changes.
*/
function AggregateRoot(id){
  this._id = id;
  this._currentVersion = 0;
  this._loadedVersion = 0;
  this._uncommittedChanges = [];
  this._eventEmitter = new EventEmitter();
};

AggregateRoot.prototype.getId = function(){
  return this._id;
};

AggregateRoot.prototype.loadFromHistory = function(events){
  if(events){
    events.forEach(function(event){
      //hydrate all state by emitting the event to the listeners
      this._eventEmitter.emit(event.name, event);

      //increment the loaded and current version
      this._currentVersion++;
      this._loadedVersion++;

    }.bind(this));
  }
};

AggregateRoot.prototype.getUncommittedChanges = function(){
  return this._uncommittedChanges;
};

AggregateRoot.prototype.getCurrentVersion = function(){
  return this._currentVersion;
};

AggregateRoot.prototype.getLoadedVersion = function(){
  return this._loadedVersion;
};

AggregateRoot.prototype.applyChange = function(event){

  //increment the version and assign to the event
  this._currentVersion++;
  event.version = this._currentVersion;

  this._uncommittedChanges.push(event);
  this._eventEmitter.emit(event.name, event);
};

AggregateRoot.prototype.markChangesAsCommitted = function(){

  if(this._uncommittedChanges){

    var numberOfEvents = this._uncommittedChanges.length;

    //clear the elements from the array
    for(index = 0; index < numberOfEvents; index++){
      this._uncommittedChanges.shift();
    }
  }
};

AggregateRoot.prototype.onEvent = function(name, listener) {
	return this._eventEmitter.on(name, listener);
};


module.exports = AggregateRoot;
