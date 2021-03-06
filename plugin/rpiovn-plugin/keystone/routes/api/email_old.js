var keystone = require('keystone');

var Mailgun = require('mailgun-js'); //Mailgun API library.

/**
 * Send an email
 */
exports.send = function(req, res) {
  debugger;
  
  var data = (req.method == 'POST') ? req.body : req.query;

  if(data.html == "true")
    data.html = true;
  if(data.html == "false")
    data.html = false;
  
  var val = sendEmail(data);
  
  //If the first send was successfuly, send a copy to the administrator.
  if(val) {
    data.email = 'chris.troutner@gmail.com';
    val = sendEmail(data);
  } else {
    res.apiError('error', val);
  }
  
  //Return the API response.
  if(val) {
    res.apiResponse({
			success: val
		});
  } else {
    res.apiError('error', val);
  }

}


//This function send an email based on the emailData object passed in
//emailData.email = a single email address to send to
//emailData.from = from address
//emailData.subject = email subject
//emailData.body = email body
//emailData.html = true/false if body is HTML or plain text.
function sendEmail(emailData) {
  debugger;
  
  console.log('sending email...');
  
  //Process email address in query string.
  var email = emailData.email;

  if(email.indexOf('@') == -1) {  //Reject if there is no @ symbol.
    console.log('Invalid email: '+email);
  }
  console.log('Got email address: '+email);
  email = [email];  //Convert into an array.

  
  //Error handling - undefined email
  if( email == undefined ) {
    console.log('Failure: email == undefined');
  }
  
  var subject = emailData.subject;
  var body = emailData.body;
  
  
  
  
  //Send the email log via MailGun email.
  var emailObj = new Object();
  emailObj.email = email;
  emailObj.subject = subject;
  emailObj.message = body
  emailObj.from = emailData.from;
  
  if((emailData.html != undefined) && (typeof(emailData.html) == "boolean")) {
    emailObj.html = true;
  } else {
    emailObj.html = false;
  }
  
  sendMailGun(emailObj);
  
  //Return success.
  return true;
}


//This function sends an email using MailGun using an emailObj.
//emailObj = {
//  email = array of strings containing email addresses
//  subject = string for subject line
//  message = text message to email
//  html = (default = false). True = message contains html and should be treated as html.
//}
function sendMailGun(emailObj) {
  debugger;
  
  //Error Handling - Detect invalid emailObj
  if(
    //Conditions for exiting:
    (emailObj.email == undefined) ||
    (emailObj.subject == undefined) || (emailObj.subject == "") ||
    (emailObj.message == undefined) || (emailObj.message == "")
    ) 
  {
    console.log('Invalid email Object passed to sendMailGun(). Aborting.');
    debugger;
    return false;
  }
  
  //Error Handling - Detect any invalid email addresses
  for(var i=0; i < emailObj.email.length; i++) {
    if(emailObj.email[i].indexOf("@") == -1) {
      if(emailObj.email[i] == "") {
        //debugger;
        emailObj.email.splice(i,1); //Remove any blank entries from the array.
      } else {
        console.log('Error! sendMailGun() - Invalid email address passed: '+emailObj.email[i]); 
        return;
      }
    }
  }
  
  //Sort out the optional input html flag
  var html = false;
  if((emailObj.html != undefined) && (typeof(emailObj.html) == "boolean"))
    html = emailObj.html;
  
  //Send an email for each email address in the array via Mailgun API
  var api_key = 'key-3a4e4494ffe9b328783413ed0da9b332';
  var domain = 'mg.rpiovn.org';
  var from_who = emailObj.from;
  var mailgun = new Mailgun({apiKey: api_key, domain: domain});
  
  for( var i=0; i < emailObj.email.length; i++ ) {
  
    //Error handling.
    if(emailObj.email[i] == "")
      continue;
    
      if(html) {
        var data = {
          from: from_who,
          to: emailObj.email[i],
          subject: emailObj.subject,
          html: emailObj.message
        };
      } else {
        var data = {
          from: from_who,
          to: emailObj.email[i],
          subject: emailObj.subject,
          text: emailObj.message
        };
      }
      
      
      mailgun.messages().send(data, function(err, body) {
        if(err) {
          console.log('Got an error trying to send email with sendMailGun(): ', err);
          debugger;
        } else {
          console.log('Sent email successfully with sendMailGun()');
        }
      });
  }
}

//This function is responsible for sending an error log to the administrator.
exports.sendlog = function(req, res) {
  //Process email address in query string.
  var email = ["chris.troutner@gmail.com"];
  var subject = "[RPiOVN Error Log] "+new Date();
  
  var log = req.query.log;
  var body = "";
  for(var i=0; i < log.length; i++) {
    body += i+'. '+log[i]+'\n';  
  }
  
  //Send the email log via MailGun email.
  var emailObj = new Object();
  emailObj.email = email;
  emailObj.from = "chris.troutner@gmail.com";
  emailObj.subject = subject;
  emailObj.message = body
  sendMailGun(emailObj);
  
  //Return success.
  return res.apiResponse({
    success: true
  });
}
