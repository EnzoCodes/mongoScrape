var mongoose = require("mongoose");


//Reference constructor.
var Schema = mongoose.Schema;

var NoteSchema = new Schema({
//'title'
  title: String,
//'body'
  body: String
});

// Creates model from schema using mongoose's model method
var Note = mongoose.model("Note", NoteSchema);

// Export Note Model
module.exports = Note;
