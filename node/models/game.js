var mongoose = require("mongoose");

var GameSchema = new mongoose.Schema({
    name: String,
    words: [String],
    players: [mongoose.Schema.ObjectId]
});

module.exports = mongoose.model('Game', GameSchema);