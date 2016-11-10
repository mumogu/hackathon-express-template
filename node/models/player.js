var mongoose = require("mongoose");

var PlayerSchema = new mongoose.Schema({
    name: String,
    word_permutation: Array,
    score_matrix: String
});

module.exports = mongoose.model('Player', PlayerSchema);
