//invalid character symbols list
var prohibited_char = "!@#$%^&*+=;:`~\|'?/><, \"";

/*************************************************************Login Page************************************************************/
(function ($) {
    "use strict";

    var input = $('.validate-input .input100');

    $('.validate-form').on('submit',function(){
        var check = true;

        for(var i=0; i<input.length; i++) {
            if(validate(input[i]) == false){
                showValidate(input[i]);
                check=false;
            }
        }

        return check;
    });

    $('.validate-form .input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });

    function validate (input) {
        if($(input).attr('type') == 'username' || $(input).attr('name') == 'username') {
            if($(input).val().trim().match(/^[a-zA-Z0-9_-]{1,23}$/) === null) {
                return false;
            }
        }
        else {
            if($(input).val().trim() == ''){
                return false;
            }
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }
    
})(jQuery);

function selectTeacher(email) {
	document.getElementById("teacher_selected").value = email;

}

var student_emails = "";
function selectStudent(email) {
	if(!student_emails.includes(email)) {
		student_emails += email + ",";
	}
	document.getElementById("students_selected").value = student_emails.slice(0, -1);
}

$(document).ready(function() {
	if($(location).attr('pathname') === "/system/retrieve") {
		student_emails_retrieve = document.getElementById("students_selected_retrieve").value + ",";
	} 
});

var student_emails_retrieve = "";
function selectStudent_retrieve(email) {
	if(!student_emails_retrieve.includes(email)) {
		student_emails_retrieve += email + ",";
	}
	document.getElementById("students_selected_retrieve").value = student_emails_retrieve.slice(0, -1);
}

function suspendStudent_post(params, method='post') {

	var path = "/system/api/suspend";
	// The rest of this code assumes you are not using a library.
	// It can be made less wordy if you use one.
	const form = document.createElement('form');
	form.method = method;
	form.action = path;


	const hiddenField = document.createElement('input');
	hiddenField.type = 'hidden';
	hiddenField.name = "email";
	hiddenField.value = params;

	form.appendChild(hiddenField);


	document.body.appendChild(form);
	form.submit();
}