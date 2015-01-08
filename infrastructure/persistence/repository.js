var EventStore = require('./eventStore.js');

function Repository(database){
  this._eventStore = new EventStore(database);
};

Repository.prototype.save = function(aggregateRoot, callback){

  var id = aggregateRoot.getId();
  var currentVersion = aggregateRoot.getCurrentVersion();
  var loadedVersion = aggregateRoot.getLoadedVersion();
  var events = aggregateRoot.getUncommittedChanges();

  this._eventStore.saveEvents(id, loadedVersion, currentVersion, events, function(err, result){

    if(err == null && result){
      aggregateRoot.markChangesAsCommitted();
    }

    callback(err, result);
  });

};

module.exports = Repository;
