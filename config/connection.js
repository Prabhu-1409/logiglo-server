// const getClientCredentials = require("../getClientCredentials");

// // Get client credentials from the database
// getClientCredentials((err, credentials) => {
//   if (err) {
//     console.error("Error fetching client credentials:", err);
//     return;
//   }

// //   console.log(credentials.client_id, "p")

  



// //   // Update linkedinAuth configuration with fetched credentials
// //   module.exports.linkedinAuth.clientID = credentials.client_id;
// //   module.exports.linkedinAuth.clientSecret = credentials.client_secret;
// });




const constanst = {
    env:{
        prod:'logiglo.com',
        test:'test.logiglo.com',
        prodBaseUrl : 'logiglo.com',
        testBaseUrl : 'test.logiglo.com' 
    }
}

const env = 'prod'

exports.linkedInHosts = env === 'prod' ? constanst.env.prod : constanst.env.test


const user = env === 'prod' ? 'logiglo_prod' : 'logiglo_test';
     
const hostvalue = env === 'prod' ? constanst.env.prod : constanst.env.test  




  

      

// Prod connection      
module.exports = {
    host:"localhost",
    user:"logiglo_prod",
    password:"Admin@123!",    
    db:"logi",
    port:"3306",    
    ssl:{
        rejectUnauthorized:false       
    },          
    'linkedinAuth': {
        'clientID': '86bv26n5h5bvsl',
        'clientSecret': 'hoIhsj0h3NxlgyzH',
        'callbackURL': `https://${hostvalue}/api/auth/linkedin/callback`
    }
}  
                   

                   
   
// localhost
// module.exports = {   
//     host:"localhost",   
//     user:"root",    
//     password:"Sai@368",    
//     db:"logi",       
//     port:"3306",
//     'linkedinAuth': {
//     'clientID': '86bv26n5h5bvsl',
//     'clientSecret': 'hoIhsj0h3NxlgyzH',
//         'callbackURL': 'http://logiglo.com/auth/linkedin/callback'
//     }
// }
    
      
    
// localhost
// module.exports = {
//     mysql: {
//         host:"localhost",   
//         user:"root",    
//         password:"Sai@368",
//         database:"logi",
//         port:"3306",
//         'linkedinAuth': {
//             'clientID': '86bv26n5h5bvsl',
//             'clientSecret': 'hoIhsj0h3NxlgyzH',
//             'callbackURL': `https://test.logiglo.com/api/auth/linkedin/callback`
//             // 'callbackURL': 'http://127.0.0.1:3001/auth/linkedin/callback'
//         }
//     },
//     // mariadb: {
//     //   host: '_119eb9d51d397396', 
//     //   user: 'administrator', 
//     //   password: 'ENMAIAZ68cFQeemw', 
//     //   database: 'mariadb',
//     //   port: 3306 
//     // }
//   };



 
       

            


              



   






