var messageBus = require('../infrastructure/messageBus.js').Instance;

/*
Base class for handlers
*/
function Handler(){

}

Handler.prototype.onMessage = function(name, listener) {
	messageBus.subscribe(name, listener);
};

module.exports = Handler;
