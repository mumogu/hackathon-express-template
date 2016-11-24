var config = {};

config.FACEBOOK_APP_ID              = '928723270595945';
config.FACEBOOK_APP_SECRET          = '2d47fc49af0d741c56c2680a5ba62820';
config.FACEBOOK_LOCAL_CALLBACK_URL  = 'http://localhost:3000/auth/facebook/callback';
config.FACEBOOK_REMOTE_CALLBACK_URL = 'http://bingo.onehot.de/auth/facebook/callback';


config.SESSION_SECRET               = '42';

config.DATABASE_URL                 = 'mongodb://mongo/test';

module.exports = config;