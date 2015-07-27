var fs = require("fs");
var ejs = require("ejs");
var tumblr = require("tumblr.js");
var mandrill = require("mandrill-api/mandrill");
var mandrill_client = new mandrill.Mandrill("exARVb5XxNwJ6SZOC6rvkw"); 

var csvFile = fs.readFileSync("friend_list.csv","utf-8");
var template = fs.readFileSync("email_template.html", "utf-8");

function csvParse(csvFile) {
  var array = csvFile.split("\n");
  var arrayOfContacts = [];
  for (var i = 1; i < array.length; i++){
  	var temp = array[i].split(",");
  	arrayOfContacts.push({
   	  firstName: temp[0],
   	  lastName: temp[1],
  	  numMonthsSinceContact: temp[2],
  	  emailAddress: temp[3]
  	});
  }
 return arrayOfContacts;
};

function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){     
  var message = { "html": message_html, 
                "subject": subject, 
                "from_email": from_email,         
                "from_name": from_name,         
                "to": [{ "email": to_email, "name": to_name}],
                "important": false,         
                "track_opens": true,             
                "auto_html": false,         
                "preserve_recipients": true,         
                "merge": false,         
                "tags": ["Fullstack_Tumblrmailer_Workshop"]};     
                var async = false;     
                var ip_pool = "Main Pool";     
                mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {         
                  console.log(message);         
                  console.log(result);   
                }, function(e) {         
                // Mandrill returns the error as an object with name and message keys         
                console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);         
                // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'     
              });  
}; 

// Authenticate via OAuth
var client = tumblr.createClient({
  consumer_key: '5o6n4z9fYGLcVbZiZADGO9dKnMSM1P2Tw9z8PFBsVUp1UZo5kQ',
  consumer_secret: '6GQJ88ovtoe3Hmm9CeGoYkjeAtP9BJHtVPePMj79Eq34ecN58E',
  token: 'UlDxKslg5IoUIn7WLVz4YDoYIkd5ZoLVk3agbneBAirXnqPoAw',
  token_secret: '5fGoLAWZeDAJxgfKS2TxKf3epwaBnZqNg6q9pFFLetHgvzd7rx'
});

var contactList = csvParse(csvFile);
console.log(contactList);
var recentPosts = [];



client.posts('http://mcdonaldwebdev.tumblr.com/', function (err, data) {
  var len = data.posts.length;
  var diff;
  for (var i = 0; i < len; i++) {
    diff = data.posts[i].date.substring(8, 10) - 18
    if (diff < 7) {
      recentPosts.push(data.posts[i]);
    }
  }
  contactList.forEach(function(contact) {
      // create custom email for each contact
      var customTemp = ejs.render(template, {
          firstName: contact['firstName'],
          numMonthsSinceContact: contact['numMonthsSinceContact'],
          recentPosts: recentPosts
      });
    // send customized email to each person in contact list
    sendEmail(contact.firstName, contact.emailAddress, 'Robbie Ferguson', 'robbieferguson139@gmail.com', 'Universities HATE him!', customTemp);
    });
});
