var express = require('express');
var router = express.Router();
var mysql = require('mysql');
const { forwardAuthenticated, ensureAuthenticated } = require('../config/auth');

const crypto = require('crypto');
const algorithm = 'aes-256-cbc';

var validation_msg_global = "";
var validation_alert_global = "";

//connect DB
var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "password",
	insecureAuth : true,
	database: 'school_system'
});

// routes
router.get('/login', forwardAuthenticated, authenticate_get);
router.get('/logout', logout_get);
router.get('/register', register_get);

router.post('/login', authenticate_post);
router.post('/register', register_post);

module.exports = router;

/* GET home page. */
function authenticate_get(req, res) {
    res.render('login', { 
        title: 'Login Page',   
        validation_msg: validation_msg_global,
        alert: validation_alert_global 
    });

    validation_msg_global = '';
    validation_alert_global = '';
}

function authenticate_post(req, res, next) {
	const email = req.body.email.toLowerCase();
    const password = req.body.password;

    var password_hashed = scryptAndHash(password);

    let auth_query = `SELECT * FROM school_system.accounts WHERE email=? and password=?`;
    let auth_data = [email, password_hashed];
    con.query(auth_query, auth_data, (err, results, fields) => {
    	if(results[0] == undefined) {
    		validation_msg_global = 'Username/password does not match! Try again...';
			validation_alert_global = "danger";
    	} else {
    		console.log("login successfully!!!");
    		req.session.user = email;

    		return res.redirect('/system/home');
    	}

    	return res.redirect('/login');
    });
}

function logout_get(req, res) {
    //req.logout();
    req.session.destroy();
    res.render("login", {
        validation_msg: 'Logged out successfully!',
        alert: 'success'
    });
}

function register_get(req, res) {
	res.render('register', { 
        title: 'Registration',
        validation_msg: validation_msg_global,
        alert: validation_alert_global 
    });

    validation_msg_global = '';
    validation_alert_global = '';
}

function register_post(req, res) {
	const email = req.body.email.toLowerCase();
    const password = req.body.password;
    const c_password = req.body.c_password;
    var date_stamp = new Date();

    if(password !== c_password) {
		validation_msg_global = 'Passwords does not match!';
		validation_alert_global = "danger";

		return res.redirect('/register');
    }

    var password_hashed = scryptAndHash(password)

    // connect to the MySQL server
	con.connect(function(err) {
		if (err) {
			return console.error('error: ' + err.message);
		}

		//insert into db
		let createAccounts = `create table if not exists accounts(
			id int primary key auto_increment,
			email varchar(255)not null,
			password varchar(255)not null,
			students_assigned varchar(5000)not null,
			date_created date)`;

		con.query(createAccounts, function(err, results, fields) {
			if (err) {
				console.log(err.message);
			}
		});
	});

	let checkIfUserExist_sql = `select * from accounts where email=?`;
	let checkIfUserExist_data = [email];
	con.query(checkIfUserExist_sql, checkIfUserExist_data, (err, results, fields) => {
		if (err) {
			console.log(err.message);
		}

		if(results[0] == undefined) { //if account not found in DB
			let stmt = `INSERT INTO accounts(email, password, date_created, students_assigned) VALUES(?, ?, ?, ?) `;
			let accounts = [email, password_hashed, date_stamp, "-"];

			// execute the insert statment
			con.query(stmt, accounts, (err, results, fields) => {
				if (err) {
					console.error(err.message);
				}
				// get inserted rows
				console.log('Row inserted:' + results.affectedRows);
			});

			validation_msg_global = 'Account created!';
			validation_alert_global = "success";
		} else {
			validation_msg_global = 'Account already exist! Try again!';
			validation_alert_global = "danger";
		}

		return res.redirect('/register');
	});
}

// Scrypt and Hash password
function scryptAndHash(password) {
    var password_sha512 = crypto.createHash('sha512').update(String(password)).digest('base64').substr(0, 64);
    var password_scrypt = crypto.scryptSync(password_sha512, String(password), 64);  // computationally and memory-wise expensive --> makes brute-force attacks unrewarding
    var password_final = crypto.createHash('sha512').update(String(password_scrypt)).digest('base64').substr(0, 64);

    return password_final;
};
