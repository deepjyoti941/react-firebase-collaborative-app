var Firebase = require('firebase-admin');
var crypto = require('crypto');

// var firebase = new Firebase('https://react-wiki-app.firebaseio.com/');
// Initialize Firebase
// var firebase = new Firebase(config);

var serviceAccount = require("./config/serviceAccountKey.json");

Firebase.initializeApp({
  credential: Firebase.credential.cert(serviceAccount),
  databaseURL: "https://react-wiki-app.firebaseio.com"
});

var db = Firebase.database();

var users = db.ref('users');

var router = require('express').Router();

function hash(password) {
  return crypto.createHash('sha512').update(password).digest('hex');
}
//set the middlewares
router.use(require('body-parser').json());
router.use(require('cookie-parser')());
router.use(require('express-session')({
  resave: false,
  saveUninitialized: true,
  secret: 'asdaldljaldjljlj][[]];skdksdshkhdhs121323627677jkjkkj'
}));

router.post('/api/signup', function (req, res) {
  var username = req.body.username,
      password = req.body.password;

  if(!username || !password)
    return res.json({ signedIn: false, message: 'no username or password'});

  users.child(username).once('value', function (snapshot) {
    if (snapshot.exists())
      return res.json({ signedIn: false, message: 'username already in use' });

    var userObj = {
      username: username,
      passwordHash: hash(password)
    };

    users.child(username).set(userObj);
    req.session.user = userObj;

    res.json({
      signedIn: true,
      user: userObj
    });
  });
});

router.post('/api/signin', function (req, res) {
  var username = req.body.username,
      password = req.body.password;

  if(!username || !password)
    return res.json({ signedIn: false, message: 'no username or password'});

  users.child(username).once('value', function (snapshot) {
    if(!snapshot.exists() || snapshot.child('passwordHash').val() !== hash(password))
      return res.json({ signedIn: false, message: 'wrong username or password' });

      var user = snapshot.exportVal();

      req.session.user = user;
      res.json({
        signedIn: true,
        user: user
      })
  });
});

router.post('/api/signout', function (req, res) {
  delete req.session.user;
  res.json({
    signedIn: false,
    message: 'You have been signed out'
  });
});

module.exports = router;
