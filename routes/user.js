const { linkedInHosts } = require("../config/connection");

module.exports = function(app, con, nodemailer, path, jwt, passport, bcrypt) {


 // Backend API to fetch image URLs
// app.get('/api/getImageUrl/:id', function(req, res) {
//   const imageId = req.params.id;
//   const query = `SELECT packinglist_file FROM l_upload_file WHERE id = ?`;

//   con.query(query, [imageId], function(err, result) {
//     if (err) {
//       console.error(err);
//       res.status(500).send(`Error fetching image`);
//     } else {
//       if (result.length > 0) {
//         // Assuming packinglist_file is a URL pointing to the image
//         const imageUrl = result[0].packinglist_file;
//         console.log(imageUrl)
//         res.send(imageUrl); // Send the image URL as response
//       } else {
//         res.status(404).send(`Image not found`);
//       }
//     }
//   });
// });

  
  


// LinkedIn logout API
// app.post('/api/logout', async (req, res) => {
//   try {
//     // Clear the session
//     req.session.destroy(); 

//     // Redirect the user to the LinkedIn login page
//     res.redirect('/');
//     console.log("linkedIn_logout");
//   } catch (error) {
//     console.error('Error logging out:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });


 



  // linkedIn testing
  app.get('/auth/', passport.authenticate('linkedin', {
    scope: ['profile', 'email', 'openid'],
  }));
  
  // Callback route after LinkedIn authentication
app.get(
  "/api/auth/linkedin/callback",
  passport.authenticate("linkedin", { failureRedirect: "/login" }),
  function (req, res) {
   // After successful authentication, access the access token from req.user.accessToken
   const accessToken = req.user.accessToken;
   console.log(accessToken + " in /auth/linkedin/callback");

   // Store the access token in session
   req.session.accessToken = accessToken;
   console.log("Access Token stored in session:", req.session.accessToken);
   // Redirect to profile page
   res.redirect("/api/profile");
  }
);

app.use(function(err,req,res,next){
  if (err.name === 'AuthorizationError' && err.message === 'The user cancelled LinkedIn login') {
   // Handle the cancellation gracefully, maybe redirect to a custom page
   return res.redirect('/');
  }
}) 


app.use(function(err,req,res,next){
  if (err.name === 'AuthorizationError' && err.message === 'The user cancelled LinkedIn login') {
   // Handle the cancellation gracefully, maybe redirect to a custom page
   return res.redirect('/');
  }
})




  // app.get('/api/auth/linkedin/callback', (req, res, next) => {
  //   passport.authenticate('linkedin', (err, user, info) => {
  //     if (err) {
  //       // Log the error
  //       console.error('Error during LinkedIn authentication:', err);
  //       // Redirect the user to the /auth/ endpoint
  //       return res.redirect('/api/auth/');
  //     }    
  //     if (!user) {
  //       // No user found, redirect to /auth/
  //       return res.redirect('/api/auth/');
  //     }
  //     // Successful authentication, handle accordingly
  //     // For example, you can redirect to a profile page
   
  //     return res.redirect('/api/profile');
  //   })(req, res, next);  
  // });



    function isLoggedIn(req, res, next) {
      if (req.isAuthenticated())
        return next();
      
    }

 



   
  
  // LinkedIn Access API
      app.get('/api/profile', isLoggedIn, async function (req, res) {
        console.log("user", req.user);

        const email = req.user.email;
    
        const checkUserQuery = "SELECT * FROM l_account WHERE email = ?";
  
        con.query(checkUserQuery, [email], function(err, checkUserResult) {
          if (checkUserResult.length > 0) {
            // User exists, generate JWT token and send it to the frontend
            const accountId = checkUserResult[0].id;
            const accountType = checkUserResult[0].account_type;
      
            // Create a JWT token
            const token = jwt.sign({ accountId }, 'your_secret_key', {
              expiresIn: '1h',
            });
      
            const accountValues = {   
              accountId: accountId,
              email: email,
              accountType: accountType,
              token: token,
              message: 'Login Successfully',
            };
      
            const encodedData = encodeURIComponent(JSON.stringify(accountValues));
            res.redirect(`https://logiglo.com/linkedInSignup?linkedin_data=${encodedData}`);

          }
  
    
       else {
            // User not found, redirect to signup page
            const linkedInData = req.user;
            console.log(req.user)
            console.log('hi, hellooooooo')
            const encodedData = encodeURIComponent(JSON.stringify(linkedInData));
            res.redirect(`https://logiglo.com/linkedInSignup?linkedin_data=${encodedData}`);
        }
    });
  });













  // linkedIn testing

   // Contact Us SMPT 
   const transporter = nodemailer.createTransport({
    host: "mail.logiglo.com",
    port: 587,
    secure: false,
    // requireTLS: false,
    tls: {
      rejectUnauthorized: false
    },
    auth: {
      user: "webquery@logiglo.com",
      pass: "WebLogiglo@123!",
    },
  });





// API to update the scroll content in l_admin_settings
app.post("/api/updateScrollContent", (req, res) => {
  const { text } = req.body;

  // Assuming you have a function to execute SQL queries
  // You need to replace `executeQuery` with your actual function
  const updateQuery = `UPDATE l_admin_settings SET text = ? where id = 3`;

  con.query(updateQuery, [text], (err, result) => {
    if (err) {
      console.error("Error updating admin settings:", err);
      res.status(500).send("Error updating admin settings");
    } else {
      console.log("Admin settings updated successfully");
      res.status(200).send("Admin settings updated successfully");
    }
  });
});








// Get Feature render Status
app.get('/api/getFeatureStatus', function(req, res) {
  const { feature } = req.query;
  const query = `SELECT render_status AS status FROM l_admin_settings WHERE feature = ?`;
  
  con.query(query, [feature], function(err, result) {
    if (err) {
      console.error(err);
      res.status(500).send(`Error fetching ${feature} status`);
    } else {
      if (result.length > 0) {
        const status = result[0].status;
        res.send({ status, message: `${feature} status fetched successfully` });
        // console.log(status, feature)
      } else {
        res.status(404).send(`No ${feature} status found`);
      }
    }
  });
});

app.get('/api/getScrolMovementStatus', function(req, res) {

  const query = `select scroll_movement, scroll_position from l_admin_settings where id = 3`;
  
  con.query(query, function(err, result) {
    if (err) {
      console.error(err);
      res.status(500).send(`Error fetching status`);
    } else {
      res.status(200).json(result);

        // console.log(status, feature)
  
    }
  });
});



// API for updating feature render status
app.post('/api/updateFeatureStatus', function(req, res) {
  const { feature, status } = req.body;

  const updateQuery = "UPDATE l_admin_settings SET render_status = ? WHERE feature = ?";
  
  con.query(updateQuery, [status ? 1 : 0, feature], function(err, updateResult) {
    if (err) {
      console.error(err);
      res.status(500).send(`Error updating ${feature} status`);
    } else {
      res.send(`${feature} status updated successfully`);
    }
  });
});


// Define API endpoint to update scroll movement status
app.post('/api/updateScrollMovement', (req, res) => {
  // Extract parameters from request body
  const { movement } = req.body;

  // Update scroll_movement status in l_admin_settings table
  const query = 'UPDATE l_admin_settings SET scroll_movement = ? WHERE id = 3';
  con.query(query, [movement], (error, results) => {
    if (error) {
      console.error('Error updating scroll movement status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      console.log('Scroll movement status updated successfully');
      res.status(200).json({ message: 'Scroll movement status updated successfully' });
    }
  });
});


// Scroll position
app.post("/api/updateScrollPosition", (req, res) => {
  // Extract parameters from request body
  const { position } = req.body;
  // Update scroll_position in l_admin_settings table
  const query = 'UPDATE l_admin_settings SET scroll_position = ? WHERE id = 3';
  con.query(query, [position], (error, results) => {
    if (error) {
      console.error('Error updating scroll position:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      console.log('Scroll position updated successfully');
      res.status(200).json({ message: 'Scroll position updated successfully' });
    }
  });
});








// Add Business Account Feature Status
app.get('/api/getAddBusinessAccountStatus', function(req, res) {
  const addBusinessAccountStatus = 'SELECT feature, render_status FROM l_admin_settings WHERE feature = "add_business_acount"';

  con.query(addBusinessAccountStatus, function(err, result) {
    if (err) {
      console.error(err);
      res.status(500).send("Error fetching business account status");
    } else {
      if (result.length > 0) {
        const addBusinessAccountStatus = result[0].render_status;
        // console.log(addBusinessAccountStatus, "status_2");
        res.send({ addBusinessAccountStatus, message: "Add Business Account status fetched successfully" });
      } else {
        res.status(404).send("No Add Business Account status found");
      }
    }
  });
});





// User Info
app.get("/api/userInformation", (req, res) => {
  const { accountId } = req.query;
   // Query the database to retrieve user information from l_contact and l_account tables
   const query = `
   SELECT c.*, a.* 
   FROM l_contact c
   JOIN l_account a ON c.account_id = a.id
   WHERE c.account_id = ?
 `;

  con.query(query, [accountId], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error retrieving countries");
    } else {
      res.status(200).json({ userInfo: result });
    }
  });
});

// User forgot password
app.get("/api/userForgotPassword", (req, res) => {
  const { email } = req.query;
   // Query the database to retrieve user information from l_contact and l_account tables
   const query = `SELECT email from l_account WHERE c.account_id = ? `;

  con.query(query, [email], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error retrieving countries");
    } else {
      res.status(200).json({ userCredentials: result });
    }
  });
});


// Password reset email for Web Application
// app.post('/api/sendPasswordResetEmail', (req, res) => {
//   const { email } = req.body;

//   console.log(email, "re")

//   // Generate a JWT token with user email as payload
//   const token = jwt.sign({ email }, 'your_secret_key', { expiresIn: '1h' });

  // Create the reset password link with the token
  // const resetPasswordLink = `https://logiglo.com/resetPassword?token=${token}&email=${email}`;

//   // // Send the email using Nodemailer
//   const transporter = nodemailer.createTransport({
//     host: "mail.logiglo.com",
//     port: 587,
//     secure: false,
//     // requireTLS: false,
//     tls: {
//       rejectUnauthorized: false
//     },
//     auth: {
//       user: "webquery@logiglo.com",
//       pass: "WebLogiglo@123!",
//     },
//   });



//   const mailOptions = {
    

//     from: 'webquery@logiglo.com',
//     to: email,
//     subject: 'Password Reset Request',
//     text: `You have requested to reset your password. Please click on the following link to reset your password: ${resetPasswordLink}`
//   };



//    // Send emails
//    transporter.sendMail(mailOptions, (error1, info1) => {
//     if (error1) {
//       console.log(error1);
//     } else {
//       console.log('Email sent: ' + info1.response);
//       res.status(200).json({ message: 'Password reset email sent successfully' });
//     }
//   });


 
// });

// Password reset email for Web Application
app.post('/api/sendPasswordResetEmail', (req, res) => {
  const { email } = req.body;

  // Check if the email exists in l_account table
  const emailQuery = "SELECT * FROM l_account WHERE email = ?";
  con.query(emailQuery, [email], function(err, emailResult) {
    if (err) {
      console.error(err);
      return res.status(500).send("Error during password reset");
    }

    // If email not found, return user not found response
    if (emailResult.length === 0) {
      return res.status(200).json({ message: 'User not found' });
    }

    // Generate a JWT token with user email as payload
    const token = jwt.sign({ email }, 'your_secret_key', { expiresIn: '1h' });

    // Create the reset password link with the token
    const resetPasswordLink = `https://logiglo.com/resetPassword?token=${token}&email=${email}`;

    // Send the email using Nodemailer
    const transporter = nodemailer.createTransport({
      host: "mail.logiglo.com",
      port: 587,
      secure: false,
      tls: {
        rejectUnauthorized: false
      },
      auth: {
        user: "webquery@logiglo.com",
        pass: "WebLogiglo@123!",
      },
    });

    const mailOptions = {
      from: 'webquery@logiglo.com',
      to: email,
      subject: 'Password Reset Request',
      text: `You have requested to reset your password. Please click on the following link to reset your password: ${resetPasswordLink}`
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending password reset email:', error);
        return res.status(500).json({ error: 'Error sending password reset email' });
      } else {
        console.log('Email sent:', info.response);
        res.status(200).json({ message: 'Password reset email sent successfully' });
      }
    });
  });
});




// Password reset verification code for Mobile Application
app.post('/api/sendVerificationCode', (req, res) => {
  const { email } = req.body;

  // Generate a random 4-digit verification code
  const verificationCode = Math.floor(1000 + Math.random() * 9000);

  // Save the verification code in your database or cache (optional)

  // Send the email using Nodemailer
  const transporter = nodemailer.createTransport({
    host: "mail.logiglo.com",
    port: 587,
    secure: false,
    tls: {
      rejectUnauthorized: false
    },
    auth: {
      user: "webquery@logiglo.com",
      pass: "WebLogiglo@123!",
    },
  });

  const mailOptions = {
    from: 'webquery@logiglo.com',
    to: email,
    subject: 'Verification Code',
    text: `Your verification code is: ${verificationCode}`,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to send verification code' });
    } else {
      console.log('Verification code sent: ' + verificationCode);
      res.status(200).json({ message: 'Verification code sent successfully' });
    }
  });
});




// Reset Password  
app.post('/api/updatePassword', (req, res) => {
  const {email, newPassword, confirmPassword } = req.body;

  console.log(email, newPassword, confirmPassword)
  // Compare the new password and confirm password
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  const saltRounds = 12;

  // Hash the new password
  bcrypt.hash(newPassword, saltRounds, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).send('Error updating password');
    }

    const updateQuery = `UPDATE l_account SET password = ? WHERE email = ?`;

    // Update the password in the database for the user
    con.query(updateQuery, [hashedPassword, email], (updateErr, updateResults) => {
        if (updateErr) {
          console.error('Error updating password:', updateErr);
          return res.status(500).send('Error updating password');
        }

        // Password updated successfully
        res.status(200).json({ message: 'Password updated successfully' });
      });
  });
});


// Reset Password for Mobile
// app.post('/api/resetPassword', (req, res) => {
//   const {email, oldPassword, newPassword, confirmPassword } = req.body;

//   console.log(email, oldPassword, newPassword, confirmPassword)
//   // Compare the new password and confirm password
//   if (newPassword !== confirmPassword) {
//     return res.status(400).json({ error: 'Passwords do not match' });
//   }

//   const saltRounds = 12;

//   // Hash the new password
//   bcrypt.hash(newPassword, saltRounds, (err, hashedPassword) => {
//     if (err) {
//       console.error('Error hashing password:', err);
//       return res.status(500).send('Error updating password');
//     }

//     const updateQuery = `UPDATE l_account SET password = ? WHERE email = ?`;

//     // Update the password in the database for the user
//     con.query(updateQuery, [hashedPassword, email], (updateErr, updateResults) => {
//         if (updateErr) {
//           console.error('Error updating password:', updateErr);
//           return res.status(500).send('Error updating password');
//         }

//         // Password updated successfully
//         res.status(200).json({ message: 'Password updated successfully' });
//       });
//   });
// });

// Reset Password for Mobile
app.post('/api/resetPassword', (req, res) => {
  const { email, oldPassword, newPassword, confirmPassword } = req.body;

  console.log(email, oldPassword, newPassword, confirmPassword);

  // Compare the new password and confirm password
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  const selectQuery = `SELECT password FROM l_account WHERE email = ?`;

  // Retrieve the current hashed password from the database
  con.query(selectQuery, [email], (selectErr, selectResults) => {
    if (selectErr) {
      console.error('Error fetching current password:', selectErr);
      return res.status(500).send('Error fetching current password');
    }

    if (selectResults.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentHashedPassword = selectResults[0].password;

    // Compare the old password with the current hashed password
    bcrypt.compare(oldPassword, currentHashedPassword, (compareErr, isMatch) => {
      if (compareErr) {
        console.error('Error comparing passwords:', compareErr);
        return res.status(500).send('Error verifying current password');
      }

      if (!isMatch) {
        return res.status(400).json({ error: 'Old password is incorrect' });
      }

      const saltRounds = 12;

      // Hash the new password
      bcrypt.hash(newPassword, saltRounds, (hashErr, hashedNewPassword) => {
        if (hashErr) {
          console.error('Error hashing new password:', hashErr);
          return res.status(500).send('Error updating password');
        }

        const updateQuery = `UPDATE l_account SET password = ? WHERE email = ?`;

        // Update the password in the database for the user
        con.query(updateQuery, [hashedNewPassword, email], (updateErr, updateResults) => {
          if (updateErr) {
            console.error('Error updating password:', updateErr);
            return res.status(500).send('Error updating password');
          }

          // Password updated successfully
          res.status(200).json({ message: 'Password updated successfully' });
        });
      });
    });
  });
});




// User Profile Updation
app.put('/api/updateUserInfo', (req, res) => {
  const { accountId, updatedInfo } = req.body;
  const { first_name, last_name, phone_number, email, address_line_1, address_line_2, pin_code, state_id } = updatedInfo;

  console.log(email, last_name)

  // Update the l_contact table
  const contactQuery = `
    UPDATE l_contact 
    SET first_name = ?, last_name = ?, phone_number = ?, address_line_1 = ?, address_line_2 = ? , pin_code = ?, state_id = ?    
    WHERE account_id = ?
  `;
  con.query(contactQuery, [first_name, last_name, phone_number, address_line_1, address_line_2, pin_code, state_id,  accountId], (contactErr, contactResult) => {
    if (contactErr) {
      console.error(contactErr);
      return res.status(500).send('Error updating user information');
    }

    // Update the l_account table (for email)
    const accountQuery = `
      UPDATE l_account 
      SET email = ? 
      WHERE id = ?
    `;
    con.query(accountQuery, [email, accountId], (accountErr, accountResult) => {
      if (accountErr) {
        console.error(accountErr);
        return res.status(500).send('Error updating user information');
      }

      // Return success response
      res.status(200).json({message : 'User information updated successfully'})
     
    });
  });
});



app.get("/api/getStateNameById", (req, res) => {
  const { stateId } = req.query;
  // console.log(stateId, "stateete")
  // Query the database to retrieve the state name from the states table
  const query = `
    SELECT title
    FROM states
    WHERE id = ?
  `;

  con.query(query, [stateId], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error retrieving state name");
    } else {
      // console.log(result)
      if (result.length > 0) {
        const stateName = result[0].state_name;
        res.status(200).json({ stateName : result });
        
      } else {
        res.status(404).json({ error: "State not found" });
      }
    }
  });
});


// Endpoint to fetch data totalUsers and onlineUsers Count
app.get('/api/userCounts', (req, res) => {
  const totalUsersQuery = 'SELECT COUNT(id) AS user_count FROM l_account';
  const onlineUsersQuery = 'SELECT COUNT(id) AS online_user_count FROM l_account WHERE status = "online"';

  con.query(totalUsersQuery, (totalErr, totalResults) => {
    if (totalErr) {
      console.error('Error executing MySQL query:', totalErr);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const totalUserCount = totalResults[0].user_count;

      con.query(onlineUsersQuery, (onlineErr, onlineResults) => {
        if (onlineErr) {
          console.error('Error executing MySQL query:', onlineErr);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          const onlineUserCount = onlineResults[0].online_user_count;
          res.status(200).json({ totalUserCount, onlineUserCount });
        }
      });
    }
  });
});




  // User Signup
//   app.post("/api/createUser", function(req, res) {
//     const {
//       email,
//       password,
//       first_name,
//       last_name,
//       phone_number,
//       address_line_1,
//       address_line_2,
//       country_id,
//       state_id,
//       pin_code,
//       account_type,
//       user_linkedIn_id,
//       source,
//       verified,
      

//     } = req.body;

//     console.log(user_linkedIn_id, "user")

//     const checkUserQuery = "SELECT * FROM l_account WHERE email = ?";
//     con.query(checkUserQuery, [email], function(err, checkUserResult) {
//       if (
//         !email ||
//         !password ||
//         !first_name ||
//         !last_name ||
//         !country_id ||
//         !phone_number 
//         // !address_line_1 ||
//         // !address_line_2 ||
//         // !state_id ||
//         // !pin_code
//       ) {
//         res.status(400).send("All fields required");
//         return;
//       } else if (checkUserResult.length > 0) {
//         res
//           .status(400)
//           .send("User already exists. Please choose a different email.");
//         return;
//       }

//       // Check if phone_number is 10 digits
//       else if (phone_number.toString().length !== 10) {
//         res.status(400).send("Phone Number must be 10 digits");
//         return;
//       // } else if (pin_code.toString().length !== 6) {
//       //   res.status(400).send("Pin code must be 6 digits");
//       //   return;
//       // } 

//       }else if (err) {
//         console.error(err);
//         res.status(500).send("Error creating user");
//         return;
//       }

//       const saltRounds = 12; // Adjust based on your security requirements

//       bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
//         if (err) {
//             console.error('Error hashing password:', err);
//             return res.status(500).send('Error creating user');
//         }

//         console.log(hashedPassword, "hashed_pass")


   


//       // Create a new user in l_account table with verified = 0
//       const accountQuery =
//         "INSERT INTO l_account (email, password, verified, account_type, source, user_linkedIn_id) VALUES (?, ?, ?, ?, ?, ?)";
//       con.query(accountQuery, [email, hashedPassword, verified, account_type, source, user_linkedIn_id], function(
//         err,
//         accountResult
//       ) {
//         if (err) {
//           console.error(err);
//           res.status(500).send("Error creating user");
//         } else {
//           // Retrieve the auto-generated account_id
//           const accountId = accountResult.insertId;

//                 // Create a JWT token
//     const token = jwt.sign({ accountId }, "your_secret_key", {
//       expiresIn: "1h",
//     });

//           // Create a new contact in l_contact table
//           const contactQuery =
//             "INSERT INTO l_contact (account_id, first_name, last_name, phone_number, address_line_1, address_line_2, country_id, state_id, pin_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
//           const contactValues = [
//             accountId,
//             first_name,
//             last_name,
//             phone_number,
//             null,
//             null,
//             country_id,
//             null,
//             null,
//           ];

//           con.query(contactQuery, contactValues, function(err, contactResult) {
//             if (err) {
//               console.error(err);
//               res.status(500).send("Error creating user contact");
//             } else {
//               res.send({
//                 message: "User Created Successfully",
//                 contactValues,
//                 token
//               });
//               // Send verification email
//               // const transporter = nodemailer.createTransport({
//               //   host: "smtp.gmail.com",
//               //   port: 587,
//               //   secure: false,
//               //   requireTLS: false,
//               //   auth: {
//               //     user: "saitejamacha123@gmail.com",
//               //     pass: "xhruutkbsofpdzaa",
//               //   },
//               // });

//               console.log(source === "manual", "check_before")

//               if(source === "manual"){
//                  console.log(source === "manual", "check_in")
//                 const mailOptions = {
//                   from: "webquery@logiglo.com",
//                   to: email,
//                   subject: "Email Verification",
//                   html: `<p>Please verify your email by clicking the link: <a href="https://logiglo.com/api/verify-email/${accountId}">Verify Email</a></p>`,
//                 };
  
//                 console.log("mail")
//                 // Create a transporter using the default SMTP transport
//                 transporter.sendMail(mailOptions, (error, info) => {
//                   if (error) {
//                     console.error("Error sending email:", error);
//                     res.status(500).send("Error sending verification email");
//                   } else {
//                     console.log("Email sent:", info.response);
//                     // res.send({
//                     //   message: "User Created Successfully",
//                     //   contactValues,
//                     // });
//                   }
//                 });
//               }
           
             
            


//             }
//           });
//         }
//       });
//     });
//   });
// });


// User Signup
app.post("/api/createUser", function (req, res) {
  const {
    email,
    password,
    first_name,
    last_name,
    phone_number,
    address_line_1,
    address_line_2,
    country_id,
    state_id,
    pin_code,
    account_type,
    user_linkedIn_id,
    source,
    verified,
  } = req.body;

  console.log(user_linkedIn_id, "user");

  const checkUserQuery = "SELECT * FROM l_account WHERE email = ?";
  con.query(checkUserQuery, [email], function (err, checkUserResult) {
    if (!email || !password || !first_name || !last_name || !country_id || !phone_number) {
      res.status(400).send("All fields required");
      return;
    } else if (checkUserResult.length > 0) {
      res.status(400).send("User already exists. Please choose a different email.");
      return;
    } else if (phone_number.toString().length !== 10) {
      res.status(400).send("Phone Number must be 10 digits");
      return;
    } else if (err) {
      console.error(err);
      res.status(500).send("Error creating user");
      return;
    }

    const saltRounds = 12; // Adjust based on your security requirements

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
      if (err) {
        console.error('Error hashing password:', err);
        return res.status(500).send('Error creating user');
      }

      console.log(hashedPassword, "hashed_pass");

      // Create a new user in l_account table with verified = 0
      const accountQuery = "INSERT INTO l_account (email, password, verified, account_type, source, user_linkedIn_id) VALUES (?, ?, ?, ?, ?, ?)";
      con.query(accountQuery, [email, hashedPassword, verified, account_type, source, user_linkedIn_id], function (err, accountResult) {
        if (err) {
          console.error(err);
          res.status(500).send("Error creating user");
        } else {
          // Retrieve the auto-generated account_id
          const accountId = accountResult.insertId;

          // Create a JWT token
          const token = jwt.sign({ accountId }, "your_secret_key", {
            expiresIn: "1h",
          });

          // Create a new contact in l_contact table
          const contactQuery = "INSERT INTO l_contact (account_id, first_name, last_name, phone_number, address_line_1, address_line_2, country_id, state_id, pin_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
          const contactValues = [
            accountId,
            first_name,
            last_name,
            phone_number,
            address_line_1,
            address_line_2,
            country_id,
            state_id,
            pin_code,
          ];

          con.query(contactQuery, contactValues, function (err, contactResult) {
            if (err) {
              console.error(err);
              res.status(500).send("Error creating user contact");
            } else {
              // Insert into l_notifications table
              const notificationsQuery = "INSERT INTO l_notifications (account_id, post_creation, post_moderation, post_rejection, reply_creation, comment_creation) VALUES (?, ?, ?, ?, ?, ?)";
              const notificationsValues = [accountId, true, true, true, true, true];

              con.query(notificationsQuery, notificationsValues, function (err, notificationsResult) {
                if (err) {
                  console.error(err);
                  res.status(500).send("Error creating user notifications");
                } else {
                  res.send({
                    message: "User Created Successfully",
                    contactValues,
                    token,
                  });

                  // Send verification email
                  if (source === "manual") {
                    const transporter = nodemailer.createTransport({
                      host: "smtp.gmail.com",
                      port: 587,
                      secure: false,
                      requireTLS: false,
                      auth: {
                        user: "saitejamacha123@gmail.com",
                        pass: "xhruutkbsofpdzaa",
                      },
                    });

                    const mailOptions = {
                      from: "webquery@logiglo.com",
                      to: email,
                      subject: "Email Verification",
                      html: `<p>Please verify your email by clicking the link: <a href="https://logiglo.com/api/verify-email/${accountId}">Verify Email</a></p>`,
                    };

                    console.log("mail");

                    transporter.sendMail(mailOptions, (error, info) => {
                      if (error) {
                        console.error("Error sending email:", error);
                        res.status(500).send("Error sending verification email");
                      } else {
                        console.log("Email sent:", info.response);
                      }
                    });
                  }
                }
              });
            }
          });
        }
      });
    });
  });
});



 
  
  app.post('/api/sendEmail', (req, res) => {
    const { name, email, phoneNumber, city, message } = req.body;
    // console.log(name, "NAME")
  
    // Acknowledgment email to user
    const userMailOptions = {
      from: 'webquery@logiglo.com',
      to: email,
      subject: 'Acknowledgment - We have received your message',
      text: 'Thank you for reaching out. We will get back to you shortly.\n\n- Team Logiglo'
    };



  
    // Email containing the query to the author
    const authorMailOptions = {
      from: 'webquery@logiglo.com',
      to: ['webquery@logiglo.com', 'saitejam333@gmail.com'],   // array of author's email addresses
      subject: 'New Query from Contact Us',
      text: `Name: ${name}\nEmail: ${email}\nPhone Number: ${phoneNumber}\nCity: ${city}\nMessage:\n${message}`
     
    };
  
    // Send emails
    transporter.sendMail(userMailOptions, (error1, info1) => {
      if (error1) {
        console.log(error1);
      } else {
        console.log('Email sent: ' + info1.response);
      }
    });
  
    transporter.sendMail(authorMailOptions, (error2, info2) => {
      if (error2) {
        console.log(error2);
      } else {
        console.log('Email sent: ' + info2.response);
      }
    });
  
    res.status(200).json({ message: 'Emails sent successfully' });
  }); 

  // Email Verification
  app.get("/api/verify-email/:accountId", function(req, res) {
    console.log("Verification route triggered");
    const accountId = req.params.accountId;

    // Perform verification logic using the accountId

    // Update the verified status in your database
    const updateQuery = "UPDATE l_account SET verified = ? WHERE id = ?";
    con.query(updateQuery, [1, accountId], function(err, updateResult) {
      if (err) {
        console.error(err);
        res.status(500).send("Error updating verification status");
      } else {
        // Redirect the user to a success page or show a success message
        // const filePath = path.join(__dirname, "emailVerification");
        // res.render("emailVerification");
        // res.sendFile(filePath);
        res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
        </head>
        <body>
          <h1>Email verified Successfully...</h1>
         
          <a href="https://logiglo.com/">Login</>
        </body>
        </html> 
      `);
      }
    });
  });

  // Business_Account_Signup
  app.post("/api/createBusinessAccount", function(req, res) {
    const {
      name,
      role,
      cin,
      gstin,
      entity_type,
      verified,
      address,
      city,
      country,
    } = req.body;

    // Check if required fields are provided
    if (
      !name ||
      !cin ||
      !gstin ||
      !entity_type ||
      !address ||
      !city ||
      !country ||
      !role
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Insert the record into the database
    const BusinessQuery = `
      INSERT INTO l_business_account (name, cin, gstin, entity_type, verified, address, city, country)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const BusinessValues = [
      name,
      cin,
      gstin,
      entity_type,
      0,
      address,
      city,
      country,
    ];

    con.query(BusinessQuery, BusinessValues, function(err, result) {
      if (err) {
        console.error("Error creating l_business_account:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      } else {
        const insertedId = result.insertId;

        // Assuming you have a mechanism to retrieve the account_id
        const account_id = req.body.account_id;

        // Insert the user record into l_business_user
        const UserQuery = `
          INSERT INTO l_business_user (bus_acc_id, account_id, role)
          VALUES (?, ?, ?)`;

        const UserValues = [insertedId, account_id, role];

        con.query(UserQuery, UserValues, function(userErr, userResult) {
          if (userErr) {
            console.error("Error creating l_business_user:", userErr);
            return res.status(500).json({ error: "Internal Server Error" });
          } else {
            res.status(201).json({
              id: insertedId,
              message: "Business Account created successfully",
            });
          }
        });
      }
    });
  });

  // User Login
  // app.post("/api/loginUser", function(req, res) {
  //   const { email, password } = req.body;
  //   // console.log(email, password)

  //   if (!email || !password) {
  //     res.send("email and password required");
  //     return;
  //   }

  //   // Check if the email exists in l_account table
  //   const emailQuery = "SELECT * FROM l_account WHERE email = ?";
  //   con.query(emailQuery, [email], function(err, emailResult) {
  //     if (err) {
  //       console.error(err);
  //       res.status(500).send("Error during login");
  //     } else {
  //       if (emailResult.length === 0) {
  //         res.send("Invalid email");
  //       } else {
  //         const query =
  //           "SELECT * FROM l_account WHERE email = ? AND password = ?";
  //         // const query = "SELECT id, email, account_type FROM l_account WHERE email = ? AND password = ?";


  //         con.query(query, [email, password], function(err, result) {
  //           if (err) {
  //             console.error(err);
  //             res.status(500).send("Error during login");
  //           } else {
  //             if (result.length > 0) {
  //               const accountId = emailResult[0].id; // Get the accountId from the emailResult

  //               // Create a JWT token
  //               const token = jwt.sign({ accountId }, "your_secret_key", {
  //                 expiresIn: "1h", // Set the token expiration time
  //               });

  //               const accountValues = {
  //                 accountId: accountId,
  //                 email: email,
  //                 // accountType: accountType, 
  //                 token: token,
  //                 message: "Login Successfully",
  //               };
  //               res.send(accountValues); // Send the accountId and email in the response
  //             } else {
  //               res.send("Invalid password");
  //             }
  //           }
  //         });
  //       }
  //     }
  //   });
  // });

  // User Login
app.post("/api/loginUser", function(req, res) {
  const { email, password } = req.body;



  if (!email || !password) {
    res.send("email and password required");
    return;
  }

  // Check if the email exists in l_account table
  const emailQuery = "SELECT * FROM l_account WHERE email = ?";
  con.query(emailQuery, [email], function(err, emailResult) {
    if (err) {
      console.error(err);
      res.status(500).send("Error during login");
    } else {
      if (emailResult.length === 0) {
       
        
        res.send( {message: "Invalid email"} );
      } else {
        const storedHashedPassword = emailResult[0].password;
        // console.log(password, storedHashedPassword)

          // Compare the entered password with the stored hashed password
          bcrypt.compare(password, storedHashedPassword, (compareErr, passwordMatch) => {
            if (compareErr) {
                console.error(compareErr);
                res.status(500).send('Error during login');
            } else {
                if (passwordMatch) {
                    const accountId = emailResult[0].id;
                    const accountType = emailResult[0].account_type;


                // Increment login count
                const updateLoginCountQuery = "UPDATE l_account SET login_count = login_count + 1 WHERE id = ?";
                con.query(updateLoginCountQuery, [accountId], (updateErr) => {
                  if (updateErr) {
                    console.error(updateErr);
                    res.status(500).send("Error during login");
                    return;
                  }

                    

            // Update the user's status to 'online'
                const updateStatusQuery = "UPDATE l_account SET status = 'online' WHERE id = ?";
                con.query(updateStatusQuery, [accountId], function(updateStatusErr) {
                  if (updateStatusErr) {
                    console.error(updateStatusErr);
                    res.status(500).send("Error updating user status");
                    return;
                  }

                  // Create a JWT token
                  const token = jwt.sign({ accountId }, 'your_secret_key', { expiresIn: '5h' });

                  const accountValues = {
                    accountId: accountId,
                    email: email,
                    accountType: accountType,
                    token: token,
                    message: "Login Successfully",
                  };

                  res.send(accountValues);
                });
              });
            } else {
              res.status(401).send({ message: "Incorrect Password or Email" });
            }
          }
        });
      }
    }
  });
});


// User Logout
app.post("/api/logoutUser", function(req, res) {
  const { accountId } = req.body;

  if (!accountId) {
    res.status(400).send("Account ID required");
    return;
  }

  const updateStatusQuery = "UPDATE l_account SET status = 'offline' WHERE id = ?";
  con.query(updateStatusQuery, [accountId], function(err) {
    if (err) {
      console.error(err);
      res.status(500).send("Error during logout");
    } else {
      res.send({ message: "Logout Successfully" });
    }
  });
});

 // topActiveExperts API
// app.get('/api/topActiveExperts', (req, res) => {
//   const query = `
//     SELECT id, email, login_count
//     FROM l_account
//     ORDER BY login_count DESC
//     LIMIT 5;
//   `;

//   con.query(query, (error, results) => {
//     if (error) {
//       console.error('Error executing MySQL query:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     } else {
//       res.status(200).json(results);
//     }
//   });
// });

// topActiveExperts API
app.get('/api/topActiveExperts', (req, res) => {
  const query = `
    SELECT a.id, a.email, a.login_count, c.first_name, c.last_name, c.phone_number, c.address_line_1, c.address_line_2, c.country_id, c.state_id, c.pin_code
    FROM l_account a
    INNER JOIN l_contact c ON a.id = c.account_id
    ORDER BY a.login_count DESC
    LIMIT 5;
  `;

  con.query(query, (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.status(200).json(results);
    }
  });
});




  // Update User by id(l_account) and account_id(l_contact)
  app.put("/api/updateUser/:id", function(req, res) {
    const accountId = req.params.id;

    const {
      email,
      password,
      verified,
      first_name,
      last_name,
      phone_number,
      address_line_1,
      address_line_2,
      country_id,
      state_id,
      pin_code,
    } = req.body;

    // Update l_account table
    const accountQuery =
      "UPDATE l_account SET email = ?, password = ?, verified = ? WHERE id = ?";
    con.query(accountQuery, [email, password, verified, accountId], function(
      err,
      accountResult
    ) {
      if (err) {
        console.error(err);
        res.status(500).send("Error updating user");
        return;
      }

      // Update l_contact table
      const contactQuery =
        "UPDATE l_contact SET first_name = ?, last_name = ?, phone_number = ?, address_line_1 = ?, address_line_2 = ?, country_id = ?, state_id = ?, pin_code = ? WHERE account_id = ?";
      con.query(
        contactQuery,
        [
          first_name,
          last_name,
          country_id,
          phone_number,
          address_line_1,
          address_line_2,
          state_id,
          pin_code,
          accountId,
        ],

        function(err, contactResult) {
          if (err) {
            console.error(err);
            res.status(500).send("Error updating user");
          } else {
            res.send("User updated successfully");
          }
        }
      );
    });
  });


    // Create an API endpoint to retrieve the Business Account name based on account_id
    app.get("/api/getBussAccName", (req, res) => {
      const account_id = req.query.account_id; // Assuming you pass account_id as a query parameter
  
      // SQL query to retrieve the name based on account_id
      const query =
        "SELECT name FROM l_business_account WHERE id = (SELECT bus_acc_id FROM l_business_user WHERE account_id = ?)";
  
      con.query(query, [account_id], (err, result) => {
        if (err) {
          console.error("Error retrieving account name:", err);
          res.status(500).json({ error: "Internal Server Error" });
        } else {
          if (result.length === 0) {
            res.status(404).json({ error: "Account not found" });
          } else {
            const name = result[0].name;
            res.status(200).json({ name });
          }
        }
      });
    });
  
    // Create an API endpoint to retrieve the Contact's First Name based on account_id
    app.get("/api/getContactFirstName", (req, res) => {
      const account_id = req.query.account_id; // Assuming you pass account_id as a query parameter
  
      // SQL query to retrieve the first name based on account_id from l_contact table
      const query = "SELECT first_name FROM l_contact WHERE account_id = ?";
  
      con.query(query, [account_id], (err, result) => {
        if (err) {
          console.error("Error retrieving contact first name:", err);
          res.status(500).json({ error: "Internal Server Error" });
        } else {
          if (result.length === 0) {
            res.status(404).json({ error: "Contact not found" });
          } else {
            const first_name = result[0].first_name;
  
            res.status(200).json({ first_name });
          }
        }
      });
    });


  // Route to get user names
  app.get("/api/getUserNames", function(req, res) {
    // Query the database to get user names based on account_id
    const query = "SELECT account_id, first_name FROM l_contact";
    con.query(query, function(err, result) {
      if (err) {
        console.error(err);
        res.status(500).send("Error fetching user names");
      } else {
        // Convert the result array into an object with account_id as keys
        const userNames = result.reduce((acc, user) => {
          acc[user.account_id] = { first_name: user.first_name };
          return acc;
        }, {});

        res.send(userNames);
      }
    });
  });

  // Route to business account names
  app.get("/api/getAllBusinessNames", function(req, res) {
    // Query the database to get all business names
    const query = "SELECT id, name FROM l_business_account";

    con.query(query, function(err, result) {
      if (err) {
        console.error("Error fetching business names: " + err.message);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        // Initialize an empty object to store business names
        const businessNames = {};

        // Iterate through the result array and log each business
        result.forEach((business) => {
          // console.log("Business ID:", business.id);
          // console.log("Business Name:", business.name);

          // Store the business name in the object
          businessNames[business.id] = business.name;
        });

        // Log the entire object
        // console.log("Business Names Object:", businessNames);

        // Send the object as JSON response
        res.json(businessNames);
      }
    });
  });

  // API endpoint to fetch user's first name based on account_id
  app.get("/api/getUserName/:account_id", (req, res) => {
    const accountId = req.params.account_id;
    // Make a MySQL query to fetch the first name from l_contact table
    const query = "SELECT first_name FROM l_contact WHERE account_id = ?";
    con.query(query, [accountId], (error, results) => {
      if (error) {
        console.error("Error fetching user first name:", error);
        res.status(500).json({ error: "Error fetching user first name" });
      } else {
        if (results.length === 0) {
          res.status(404).json({ error: "User not found" });
        } else {
          const firstName = results[0].first_name;
          res.json({ first_name: firstName });
        }
      }
    });
  });

  // Set Quote Price API
  app.post("/api/quotedPriceforPost", (req, res) => {
    const { account_id, post_id, quoted_price, created_by } = req.body;

    // Check if an entry with the same 'post_id' and same user created_by which means user already exists.
    const checkQuery =
      "SELECT * FROM l_quoted_price WHERE post_id = ? and created_by = ?";

    con.query(checkQuery, [post_id, created_by], (checkErr, checkResult) => {
      if (checkErr) {
        console.error(checkErr);
        res.status(500).send("Error checking existing entries");
      } else if (checkResult.length > 0) {
        // An entry with the same 'created_by' name already exists
        // Update the 'quoted_price' for the existing entry
        const updateQuery =
          "UPDATE l_quoted_price SET quoted_price = ? WHERE post_id = ? and created_by = ?";

        con.query(
          updateQuery,
          [quoted_price, post_id, created_by],
          (updateErr, result) => {
            if (updateErr) {
              console.error(updateErr);
              res.status(500).send("Error updating quoted price");
            } else {
              res
                .status(200)
                .json({ message: "Quoted price updated successfully" });
            }
          }
        );
      } else {
        // Insert a new entry into the l_quoted_price table
        const insertQuery =
          "INSERT INTO l_quoted_price (account_id, post_id, quoted_price, created_by) VALUES (?, ?, ?, ?)";

        con.query(
          insertQuery,
          [account_id, post_id, quoted_price, created_by],
          (insertErr, result) => {
            if (insertErr) {
              console.error(insertErr);
              res.status(500).send("Error creating quoted price");
            } else {
              res
                .status(200)
                .json({ message: "Quoted price created successfully" });
            }
          }
        );
      }
    });
  });

  // Quote price for single user
  app.get("/api/getQuotedPrice", (req, res) => {
    const { post_id, created_by } = req.query;
    
    // Check if a quoted price entry exists for the provided post_id and created_by
    const checkQuery =
      "SELECT quoted_price FROM l_quoted_price WHERE post_id = ? AND created_by = ?";

    con.query(checkQuery, [post_id, created_by], (checkErr, checkResult) => {
      if (checkErr) {
        console.error(checkErr);
        res.status(500).send("Error checking quoted price");
      } else if (checkResult.length > 0) {
        // Quoted price entry found, return the quoted_price
        res.status(200).json({ quoted_price: checkResult[0].quoted_price });
        
      } else {
        // No quoted price entry found, return a default or error message
        res
          .status(200)
          .json({ quoted_price: null, message: "Quoted price not found" });
      }
    });
  });

  // Get quoted_price by post_id and created_by
  app.get("/api/getAllUsersQuotedPrices", function(req, res) {
    const { post_id, created_by } = req.query;

    const query = `
      SELECT DISTINCT qp.quoted_price, qp.created_by
      FROM l_quoted_price qp
      LEFT JOIN l_reply p ON p.post_id = qp.post_id
      WHERE p.post_id = ?`;

    con.query(query, [post_id], function(err, result) {
      if (err) {
        console.error(err);
        res.status(500).send("Error retrieving quoted price for the post");
      } else {
        if (result.length === 0) {
          res.status(404).send("No quoted price found for the given post_id");
        } else {
          res.status(200).json({ usersQuotedList: result });
          // console.log(result)
          // res.status(200).json({ quoted_price: result[0].quoted_price });
          // console.log(`quoted_price: ${result[0].quoted_price}`)
        }
      }
    });
  });



// user notifications
  app.post("/api/updateNotificationSettings", (req, res) => {
    const { accountId, postCreation, postModeration, postRejection, replyCreation, commentCreation } = req.body;
  
    const query = `
      INSERT INTO l_notifications (account_id, post_creation, post_moderation, post_rejection, reply_creation, comment_creation)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      post_creation = VALUES(post_creation),
      post_moderation = VALUES(post_moderation),
      post_rejection = VALUES(post_rejection),
      reply_creation = VALUES(reply_creation),
      comment_creation = VALUES(comment_creation)
    `;
  
    con.query(query, [accountId, postCreation, postModeration, postRejection, replyCreation, commentCreation], (err) => {
      if (err) {
        console.error('Error updating notification settings:', err);
        return res.status(500).json({ error: 'Error updating notification settings' });
      }
      res.status(200).json({ message: 'Notification settings updated successfully' });
    });
  });
  


  // Fetch user notification settings
app.get("/api/getNotificationSettings", (req, res) => {
  const { accountId } = req.query;

  const query = `
    SELECT *
    FROM l_notifications
    WHERE account_id = ?
  `;

  con.query(query, [accountId], (err, results) => {
    if (err) {
      console.error('Error fetching notification settings:', err);
      return res.status(500).json({ error: 'Error fetching notification settings' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Notification settings not found' });
    }

    res.status(200).json(results[0]);
  });
});






  
  };
