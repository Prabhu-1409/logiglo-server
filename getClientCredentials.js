// const mysql = require("mysql");
// const config = require("./config/connection");

// function getClientCredentials(callback) {
//   const con = mysql.createConnection({
//     host:"localhost",
//     user:"root",
//     password:"Sai@368",
//     database:"logi",
//     port:"3306",
//      linkedinAuth: {
//     clientID: '86bv26n5h5bvsl', // Empty initial value
//     clientSecret: 'hoIhsj0h3NxlgyzH', // Empty initial value
//     'callbackURL': `https://test.logiglo.com/api/auth/linkedin/callback`
//   }
//   });



//   const query = `SELECT client_id, client_secret FROM l_social`;

//   con.query(query, function (err, result) {
//     if (err) {
//       console.error(err);
//       callback(err, null);
//     } else {
    
//       callback(null, result[0]); // Assuming only one row is returned
//     }
//   });

//   con.end();
// }

// module.exports = getClientCredentials;
