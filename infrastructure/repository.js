var EventStore = require('./eventStore.js');

/*
The purpose of this module is to provide
basic repository functionality.
*/
function Repository(aggregateType){
  
  this._eventStore = new EventStore();

  /*
  Assign the type of the aggregate. It is expected that the
  type passed has a constructor function that expects an Id
  */
  this._aggregateType = aggregateType;
}

/*
Persist the aggregate's uncommitted
changes to the event store
*/
Repository.prototype.save = function(aggregateRoot, callback){

  var id = aggregateRoot.getId();
  var version = aggregateRoot.getVersion();
  var events = aggregateRoot.getUncommittedChanges();

  this._eventStore.saveEvents(id, version, events, function(err, result){

    if(!err && result){
      aggregateRoot.markChangesAsCommitted();
    }

    callback(err, result);
  });

};

/*
Get an aggregate by Id
*/
Repository.prototype.getById = function(aggregateId, callback){

  this._eventStore.getEvents(aggregateId, function(err, events){

    if(err){
      callback(err, null);
    }else{

      if(events){
        var aggregate = new this._aggregateType(aggregateId);
        aggregate.loadFromHistory(events);
        callback(null, aggregate);
      }else{
        callback(new Error('No events for aggregate.', null));
      }
    }

  }.bind(this));

};

module.exports = Repository;
