var express = require('express');
var router = express.Router();

// Load models
var User = require('../models/user');

/* GET home page. */
router.get('/', function(req, res, next) {

  User.findOne({'name': 'lol'}, function(err, doc) {
    if(err || !doc)
      res.render('users', { user: 'not found' });
    else
      res.render('users', { user: doc });

  });
});

module.exports = router;
