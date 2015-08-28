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

/*
Publish the events to all
listeners who are subscribers
*/
MessageBus.prototype.publish = function(events){

  if(events && events.length > 0){

    events.forEach(function(event){

      console.log("publishing event " + event.name);

      this._emitter.emit(event.name, event);

    }.bind(this));

  }
};

/*
Subscribe the listener to a specific event
*/
MessageBus.prototype.subscribe = function(eventName, listener){

  console.log("subscribing to " + eventName);

  this._emitter.on(eventName, listener);
};

/*
Unsubscribe the listener from a specific event
*/
MessageBus.prototype.unsubscribe = function(eventName, listener){

  console.log("unsubscribing from " + eventName);

  this._emitter.removeListener(eventName, listener);
};

/*
Send the command to the command handler
*/
MessageBus.prototype.send = function(commandName, command, callback){

  console.log("sending command " + commandName);

  this._emitter.emit(commandName, command, callback);
};

/*
Unregister and unsubscribe all commands and events
*/
MessageBus.prototype.unsubscribeAll = function(){

  this._emitter.removeAllListeners();

};

module.exports = MessageBus;
module.exports.Instance = new MessageBus();
