/*
The purpose of this module is to provide
a series of methods to retieve attendee based
read models.
*/
function DataProvider(database){
  this._attendees = database.collection("attendee");
}


DataProvider.prototype.getAttendee = function(attendeeId, callback){

  //get a single attendee and don't return the _id field from the document
  this._attendees.findOne({attendeeId:attendeeId},{_id:0}, function(err, attendee){

    if(err){
      callback(err,null);
    }else{
      callback(null, attendee);
    }

  }.bind(this));
};

module.exports = DataProvider;
