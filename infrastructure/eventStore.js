var messageBus = require('./messageBus.js');

/*
the purpose of this module is to manage
the persistence and retrieval of events
*/
function EventStore(database){

  this._eventStore = database.collection("eventStore");

};

EventStore.prototype.saveEvents = function(aggregateId, loadedVersion, newVersion, events, callback){

  //no need to process if there aren't any events
  if(!events || events.length == 0){
    callback(null, true);
    return;
  }

  this._eventStore.findOne({aggregateId: aggregateId}, function(err, aggregate){

    if(err){
      callback(err,false);
    }else{

      if(aggregate){

        var currentVersion = aggregate.currentVersion;

        /*
        if the current aggregate's version doesn't match what we are expecting
        then back out. Somebody must have changed it.
        */
        if(aggregate.currentVersion && aggregate.currentVersion == loadedVersion){

          /*
          check if the events are null. This shouldn't happen
          since the first check above looks for null or
          empty events before even processing
          */
          if(!aggregate.events){
            aggregate.events = [];
          }

          //add all events
          events.forEach(function(event){
            aggregate.events.push(event);
          });

          //update the current version version
          aggregate.currentVersion = newVersion;

          //update the document where the aggregate id matches and the version matches
          this._eventStore.update({aggregateId: aggregateId, currentVersion: loadedVersion}, aggregate,
            function(err, result){

              if(err){
                callback(err, false)
              }else{
                messageBus.publish(events);
                callback(null, true);
              }

            }.bind(this));

        }else{
          callback(new Error("Data has been changed between loading and state changes."), null);
        }

      }else{

        /*
        normally the currentVersion would be 1 for a new aggregate
        but it is possible that multiple events were needed so we will
        assign the currentVersion to the length of the events array
        */
        this._eventStore.insert({aggregateId: aggregateId,currentVersion: events.length, events: events},
          function(err, result){

            if(err){
              callback(err, false)
            }else{
              messageBus.publish(events);
              callback(null, true);
            }
          }.bind(this));
      }
    }
  }.bind(this));
};

EventStore.prototype.getEvents = function(aggregateId, callback){

  this._eventStore.findOne({aggregateId: aggregateId}, function(err, aggregate){
    if(err){
      callback(err, null);
    }else{

      if(aggregate){
        callback(null, aggregate.events);
      }else{
        callback(null, null);
      }
    }
  });

};


module.exports = EventStore;
