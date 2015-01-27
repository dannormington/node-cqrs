var MongoClient = require('mongodb').MongoClient;

/*
The purpose of this module is to act
as a simple wrapper around Mongo DB
*/
function Database(){
  this._database = null;
}

/*
Connect to the database
*/
Database.prototype.connect = function(callback){

  MongoClient.connect("mongodb://localhost:27017/nodeSimpleCQRSExample", function(err, database) {
    if(err){
      callback(err);
      return;
    }

    console.log("connected to mongodb");

    this._database = database;
    callback(null);
    
  }.bind(this));

};

/*
Close the database
*/
Database.prototype.close = function(){
  this._database.close(function(){
    console.log('mongodb closed');
  });
};

/*
Get a specific collection
*/
Database.prototype.getCollection = function(collectionName){
  return this._database.collection(collectionName);
};

module.exports = new Database();
