var EventEmitter = require('events').EventEmitter;

/*
The purpose of this module is to provide
a simple singlton message bus. In an enterprise
environment it is suggested to use a more sophisticated
approach
*/
function MessageBus(){

  console.log("creating message bus instance");

  this._emitter = new EventEmitter();
}

MessageBus.prototype.publish = function(events){

  if(events && events.length > 0){

    events.forEach(function(event){

      console.log("publishing event " + event.name);

      this._emitter.emit(event.name, event);

    }.bind(this));

  }
};

MessageBus.prototype.subscribe = function(eventName, listener){

  console.log("subscribing to event " + eventName);

  this._emitter.on(eventName, listener);
};

MessageBus.prototype.unsubscribe = function(eventName, listener){

  console.log("unsubscribing event " + eventName);

  this._emitter.removeListener(eventName, listener);
};

module.exports = new MessageBus();
