// User Signup  
    // app.post("/createUser", function(req, res) {
    //     const { email, password, verified } = req.body;
    
    //     // Check if user with the same email already exists
    //     const checkUserQuery = "SELECT * FROM l_account WHERE email = ?";
    //     con.query(checkUserQuery, [email], function(err, checkUserResult) {
    //     if (err) {
    //         console.error(err);
    //         res.status(500).send("Error creating user");
    //         return;
    //     }
    
    //     if (checkUserResult.length > 0) {
    //         res.status(400).send("User already exists. Please choose a different email.");
    //         return;
    //     }
    
    //     // Create a new user in l_account table
    //     const accountQuery = "INSERT INTO l_account (email, password, verified) VALUES (?, ?, ?)";
    //     con.query(accountQuery, [email, password, verified], function(err, accountResult) {
    //         if (err) {
    //         console.error(err);
    //         res.status(500).send("Error creating user");
    //         } else {
    //         // Retrieve the auto-generated account_id
    //         const accountId = accountResult.insertId;
    
    //         // Create a new contact in l_contact table
    //         const { first_name, last_name, isd_code, phone_number, address_line_1, address_line_2, country_id, state_id, pin_code } = req.body;
    //         const contactQuery = "INSERT INTO l_contact (account_id, first_name, last_name, isd_code, phone_number, address_line_1, address_line_2, country_id, state_id, pin_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    //         // Ensure the phone_number is exactly 10 digits long
    //         const formattedPhoneNumber = phone_number.toString().padStart(10, "0");
    
    //         con.query(contactQuery, [accountId, first_name, last_name, isd_code, formattedPhoneNumber, address_line_1, address_line_2, country_id, state_id, pin_code], function(err, contactResult) {
    //             if (err) {
    //             console.error(err);
    //             res.status(500).send("Error creating user contact");
    //             } else {
    //             res.send("User created successfully");
    //             }
    //         });
    //         }
    //     });
    //     });
    // });




// User Login
    // app.post("/loginUser", function(req, res) {
    //     const { email, password } = req.body;
    
    //     // Check if the email and password exist in l_account table
    //     const query = "SELECT * FROM l_account WHERE email = ? AND password = ?";
    //     con.query(query, [email, password], function(err, result) {
    //     if (err) {
    //         console.error(err);
    //         res.status(500).send("Error during login");
    //     } else {
    //         if (result.length > 0) {
    //         res.send("Login successful");
    //         } else {
    //         res.status(401).send("Invalid credentials");
    //         }
    //     }
    //     });
    // });


 // signup API 
     // app.post("/createUser", function(req, res) {
    //   const { email, password, verified, first_name, last_name, isd_code, phone_number, address_line_1, address_line_2, country_id, state_id, pin_code } = req.body;
    
    //   // Check if user with the same email already exists
    //   const checkUserQuery = "SELECT * FROM l_account WHERE email = ?";
    //   con.query(checkUserQuery, [email], function(err, checkUserResult) {
    //     if (err) {
    //       console.error(err);
    //       res.status(500).send("Error creating user");
    //       return;
    //     }
    
    //     if (checkUserResult.length > 0) {
    //       res.status(400).send("User already exists. Please choose a different email.");
    //       return;
    //     }
    
    //     // Check if phone_number is 10 digits
    //     if (phone_number.toString().length !== 10) {
    //       res.status(400).send("Phone Number must be 10 digits");
    //       return;
    //     }
    
    //     // Check if any field is left blank
    //     if (!email || !password || !verified || !first_name || !last_name || !isd_code || !phone_number || !address_line_1 || !address_line_2 || !country_id || !state_id || !pin_code) {
    //       res.status(400).send("All fields required");
    //       return;
    //     }
    
    //     // Create a new user in l_account table
    //     const accountQuery = "INSERT INTO l_account (email, password, verified) VALUES (?, ?, ?)";
    //     con.query(accountQuery, [email, password, verified], function(err, accountResult) {
    //       if (err) {
    //         console.error(err);
    //         res.status(500).send("Error creating user");
    //       } else {
    //         // Retrieve the auto-generated account_id
    //         const accountId = accountResult.insertId;
    
    //         // Create a new contact in l_contact table
    //         const contactQuery = "INSERT INTO l_contact (account_id, first_name, last_name, isd_code, phone_number, address_line_1, address_line_2, country_id, state_id, pin_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    //         con.query(contactQuery, [accountId, first_name, last_name, isd_code, phone_number, address_line_1, address_line_2, country_id, state_id, pin_code], function(err, contactResult) {
    //           if (err) {
    //             console.error(err);
    //             res.status(500).send("Error creating user contact");
    //           } else {
    //             res.send("User created successfully");
    //           }
    //         });l
    //       }
    //     });
    //   });
    // });



    //   html: `
//   <p>Name: ${name}</p>
//   <p>Email: ${email}</p>
//   <p>Phone Number: ${phoneNumber}</p>
//   <p>City: ${city}</p>
//   <p>Message:</p>
//   <p>${message}</p>
//   <img
//     className="navbar-brand"
//     style="width: 150px; height: 90px;"
//     src="https://res.cloudinary.com/dwwzfhucu/image/upload/v1700240317/output-onlinepngtools_xtk9af.png"
//     alt="Logiglo"
//   />
// `