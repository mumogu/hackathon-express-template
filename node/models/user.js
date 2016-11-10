var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
    name: String,
    display: String
});

module.exports = mongoose.model('User', UserSchema);

// Now `require('user')` will return a mongoose Model,
// without needing to do require('user').User