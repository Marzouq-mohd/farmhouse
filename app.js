/*jshint esversion: 6 */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var path = require('path');
var passport = require('passport');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var config = require('./config/database');
require('./config/passport')(passport);
var routes = require('./routes/investor');
var portNo = 3000; //port no to connect to server

mongoose.connect(config.database,(err)=>{
	if(err){
		console.log(err);
	}
	else {
		console.log('Succesfully connected to MongoDB');
	}
});

// initialise view engine to ejs
app.set('view engine', 'ejs');

app.use(express.static('public'));

// initialize body parser middleware 
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// express session middleware
app.use(session({
	secret: 'secret',
  	resave: true,
  	saveUninitialized: true,
}));

// Express Messages Middleware
app.use(flash());
app.use(function (req, res, next) {
  	res.locals.messages = require('express-messages')(req, res);
  	next();
});

// Express Validator Middleware
app.use(expressValidator({
  	errorFormatter: function(param, msg, value) {
      	var namespace = param.split('.')
      	, root    = namespace.shift()
      	, formParam = root;

    while(namespace.length) {
      	formParam += '[' + namespace.shift() + ']';
    }
    return {
      	param : formParam,
      	msg   : msg,
      	value : value
    };
  	}
}));

function ensureAuthenticated(req, res, next){
  	if(req.isAuthenticated()){
    	return next();
  	}else {
    	req.flash('danger', 'Please login');
    	res.redirect('/investor/login');
  	}
}

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*',(req,res,next)=>{
	res.locals.user = req.user || null;
	next();
});

// initialise routes middleware
app.use('/investor',routes);


app.get('/investor',ensureAuthenticated,(req,res)=>{
	res.sendFile(path.join(__dirname + '/public/investor.html'));
});


//listen to portNo and connect to the server
app.listen(portNo,()=>{
	console.log("Server running on " + portNo);
});