var EventStore = require('./eventStore.js');

/*
The purpose of this module is to provide
base repository functionality.
*/
function Repository(){
  this._eventStore = new EventStore();
}

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

module.exports = Repository;
