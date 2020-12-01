const express = require('express');
const router = express.Router();
var mysql = require('mysql');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

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
router.get('/home', ensureAuthenticated, homePage_get);
router.get('/retrieve', ensureAuthenticated, retrievePage_get);
router.post('/api/register', apiRegister_post);
router.post('/api/suspend', ensureAuthenticated, suspendStudent_post);

module.exports = router;

function homePage_get(req, res) {
	//prevent the browser from caching when the page is reloaded
	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	var currUser = req.session.user;

	let accounts_query = `SELECT email, students_assigned FROM school_system.accounts`;
    con.query(accounts_query, (err, results1, fields1) => {
    	//console.log(JSON.stringify(results[0]));

    	let student_query = `select distinct email, suspend from school_system.accounts_student`;
    	con.query(student_query, (err, results2, fields2) => {
	    	res.render('home', { 
			    title: 'Home',
			    username: currUser,
			    accounts: results1,
			    accounts_student: results2,
		        validation_msg: validation_msg_global,
		        alert: validation_alert_global 
			})
			validation_msg_global = "";
			validation_alert_global = "";
    	});
    });
}

function retrievePage_get(req, res) {
	//prevent the browser from caching when the page is reloaded
	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	var currUser = req.session.user;

	console.log(currUser)
	let studentRegisteredWithUser_query = `select students_assigned from school_system.accounts where email=?`;
	var studentRegisteredWithUser_data = [currUser];
	con.query(studentRegisteredWithUser_query, studentRegisteredWithUser_data, (err, results1, fields1) => {
		var students_assigned = results1[0].students_assigned;

		let student_query = `select distinct email, suspend from school_system.accounts_student where suspend='NO'`;
		con.query(student_query, (err, results2, fields2) => {
		    res.render('retrieve', { 
			    title: 'Retrieve Data',
			    username: currUser,
			    accounts_student: results2,
			    registered_students: students_assigned,
		        validation_msg: validation_msg_global,
		        alert: validation_alert_global 
			})
			validation_msg_global = "";
			validation_alert_global = "";
		});
	});

}

function apiRegister_post(req, res) {
	var teacher_email = req.body.teacher_selected;
	var students_email = req.body.students_selected;

	var updateAccount_sql = `UPDATE school_system.accounts SET students_assigned=? WHERE email=?`;
	var updateAccount_data = [students_email, teacher_email];

	// execute the update statement
	con.query(updateAccount_sql, updateAccount_data, (err, results, fields) => {
		if (err) {
			console.error(err.message);
			validation_msg_global = 'Error registering!';
			validation_alert_global = "danger";
		} else {
			validation_msg_global = 'Student(s) registered to teacher successfully!';
			validation_alert_global = "success";
		}

		return res.redirect('/system/home');
	});
}

function suspendStudent_post(req, res) {
	var students_email = req.body.email;

	var updateAccountStudents_sql = `UPDATE school_system.accounts_student SET suspend='YES' WHERE email=?`;
	var updateAccountStudents_data = [students_email];

	// execute the update statement
	con.query(updateAccountStudents_sql, updateAccountStudents_data, (err, results, fields) => {
		if (err) {
			console.error(err.message);
			validation_msg_global = 'Error suspending student!';
			validation_alert_global = "danger";
		} else {
			validation_msg_global = 'Student Suspended Successfully!';
			validation_alert_global = "success";
		}

		return res.redirect('/system/home');
	});
}


