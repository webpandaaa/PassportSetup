var express = require('express');
const passport = require('passport');
var router = express.Router();
const expressSession = require('express-session');
var UserModel = require('./users');
const localStrategy = require('passport-local');
const path = require("path");
const multer = require("multer"); 


// code for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/upload')
  },
  filename: function (req, file, cb) {
    var dt = new Date();
    var fn = dt.getTime() + Math.floor(Math.random()*100000000) + path.extname(file.originalname);
    cb(null,fn)
  }
})

// code for filetype
function fileFilter (req, file, cb) {

  if(
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" 
  ){
    cb(null, true)

  }
  else{
  cb(new Error('dont walk fast!') , false)
  }
}

const upload = multer({ storage: storage,fileFilter : fileFilter})


// picture ko upload krne ke liye 
router.post('/upload',isLoggedIn, upload.single("filename"), function(req, res, next) {
  UserModel.findOne({username:req.session.passport.user})
  .then(function(loggeduser){
    loggeduser.image = req.file.filename;
    loggeduser.save()
  })
  .then(function(){
    res.redirect("back")
  })
  
});

// border ko user ke according black and red krne ke lie !!!
router.get('/username/:val', function(req, res, next) {
  UserModel.findOne({username : req.params.val})
  .then(function(foundUser){
    if(foundUser){
      res.json({found : true})
    }
    else{
      res.json({found : false})
    }
  });
})


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/feed', function(req, res, next) {
  UserModel.find()
  .then(function(allusers){
    res.render('feed' , {allusers})
  })
});

router.get('/loginUser', function(req, res, next) {
  res.render('loginUser', { title: 'Express' });
});


passport.use(new localStrategy(UserModel.authenticate()))

/// 
router.get('/profile',isLoggedIn, function(req, res, next) {
  UserModel.findOne({username : req.session.passport.user})
  .then(function(foundUser){
    res.render('profile' , {user:foundUser});
  })
});

// like ko show krane ke liye aur use bdane ke liye 
router.get('/like/:id' ,isLoggedIn, function(req, res, next) {
  UserModel.findOne({_id: req.params.id})
  .then(function(user){
    var foundUser = user.like.indexOf(req.session.passport.user)
    if(foundUser === -1){
      user.like.push(req.session.passport.user);
    }
    else{
      user.like.splice(foundUser , 1)
    }
    user.save().then(function(){
      res.redirect("back")
    })
  })
});

router.post("/register", function(req, res, next) {
  var newUser  = new UserModel({
    username: req.body.username,
    email: req.body.email,
    number: req.body.number,
    image: req.body.image
  })

  
  UserModel.register(newUser,req.body.password)
  .then(function(registeredUser) {
    passport.authenticate('local')(req,res,function(){
      res.redirect('/profile')
    });
  })
  .catch(function(err) {
    res.send(err);
  });
});


router.post('/login',passport.authenticate('local',{
  successRedirect: "/profile",
  failureRedirect: "/"
}),function(req,res,next){ });


router.get("/logout",function(req,res,next){
  req.logout(function(err){
    if (err) {return next(err);}
    res.redirect('/');
  });
});


function isLoggedIn(req, res, next){
  if (req.isAuthenticated()){
    return next();
  }else{
    res.redirect('/');
  }
}

// for show all users in search bar !!
router.get('/users/:username', isLoggedIn, function(req, res, next) {
  var regex = new RegExp("^" + req.params.username);
  UserModel.find({ username : regex  })
  .then(function(allusers){
    res.json(allusers)
  })
});

module.exports = router;
