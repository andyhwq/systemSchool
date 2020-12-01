const createError = require('http-errors');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');
const logger = require('morgan');
const mysql = require('mysql');
const http = require('http');


//connection to DB
var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "password",
	insecureAuth : true
});

app = express();

// view engine setup
app.engine('pug', require('pug').__express)
app.set('views', [path.join(__dirname, 'views/user'),
				  path.join(__dirname, 'views/controller')]);
app.set('view engine', 'pug');

//Session and cookies setup
app.use(cookieParser());
app.use(cors());
app.use(require('morgan')('dev'));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(session({
	key: 'user_sid', 
	secret: "key12345", 
	resave: true, 
	saveUninitialized: true,
	cookie: {
		expires: 3000000,
		httpOnly: true //to disable accessing cookie via client side js
	} 
}));

app.use((req, res, next) => {
	if(req.cookies.user_sid && !req.session.user) {
		res.clearCookie('user_sid');
	}

	next();
})

con.connect(function(err) {
      if (err) throw err;
      console.log("MYSQL Connected!");
});

app.use('/', require('./routes/user'));
app.use('/system', require('./routes/controller'));


http.createServer(app).listen(3003, function(){
	console.log('Server listening on HTTP port: ' + 3003);
});


module.exports = app;
