module.exports = function(app, con, multer, nodemailer) {
 

  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });


  // Upload Files
  app.post('/api/upload', upload.fields([{ name: 'invoice_file' }, { name: 'packinglist_file' }]), (req, res) => {
    try {
      const { invoice_name, packinglist_name, post_id } = req.body; // Extract post_id from the request body
  
      // console.log(invoice_name, packinglist_name, post_id);


      const invoice_file = req.files['invoice_file'][0];
      const packinglist_file = req.files['packinglist_file'][0];
  
      const invoiceFileName = invoice_file.originalname;
      const packinglistFileName = packinglist_file.originalname;
  
      const invoiceFileBuffer = invoice_file.buffer;
      const packinglistFileBuffer = packinglist_file.buffer;
  
      const sql =
        'INSERT INTO l_upload_file (invoice_name, invoice_file, packinglist_name, packinglist_file, post_id) VALUES (?, ?, ?, ?, ?)';
  
      con.query(
        sql,
        [invoice_name, invoiceFileName, packinglist_name, packinglistFileName, post_id], // Add post_id to the query parameters
        (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).send('Error storing file names in the database');
          }
  
          console.log('File names stored successfully');
          // Send a response indicating success, if needed
          res.status(200).send('File names stored successfully');
        }
      );
    } catch (error) {
      console.error('Error processing file upload:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  // Pincode from and to storage
  app.post("/api/storePincodeDetails", (req, res) => {
    const { fromPincodeDetails, toPincodeDetails } = req.body;
    // console.log(fromPincodeDetails, "from_pin");
    // console.log(toPincodeDetails, "to_pin");
  
    const fromPincodeQuery =
      "INSERT INTO l_from_pincode (post_id, name, block, division, district_name, state_name) VALUES (?, ?, ?, ?, ?, ?)";
    const toPincodeQuery =
      "INSERT INTO l_to_pincode (post_id, name, block, division, district_name, state_name) VALUES (?, ?, ?, ?, ?, ?)";
  
    con.beginTransaction((err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error starting database transaction");
      }
  
      con.query(fromPincodeQuery, [
        fromPincodeDetails.post_id,
        fromPincodeDetails.name,
        fromPincodeDetails.block,
        fromPincodeDetails.division,
        fromPincodeDetails.district_name,
        fromPincodeDetails.state_name,
      ], (err, result) => {
        if (err) {
          console.error(err);
          con.rollback(() => {
            res.status(500).send("Error storing from pincode details in the database");
          });
        } else {
          con.query(toPincodeQuery, [
            toPincodeDetails.post_id,
            toPincodeDetails.name,
            toPincodeDetails.block,
            toPincodeDetails.division,
            toPincodeDetails.district_name,
            toPincodeDetails.state_name,
          ], (err, result) => {
            if (err) {
              console.error(err);
              con.rollback(() => {
                res.status(500).send("Error storing to pincode details in the database");
              });
            } else {
              con.commit((err) => {
                if (err) {
                  console.error(err);
                  con.rollback(() => {
                    res.status(500).send("Error committing database transaction");
                  });
                } else {
                  res.status(200).send("Pincode details stored successfully");
                }
              });
            }
          });
        }
      });
    });
  });

 // Country from and to storage
  app.post("/api/storeCountryDetails", (req, res) => {
    const { fromCountryDetails, toCountryDetails } = req.body;
  
    const fromCountryQuery =
      "INSERT INTO l_from_country (post_id, country_name) VALUES (?, ?)";
    const toCountryQuery =
      "INSERT INTO l_to_country (post_id, country_name) VALUES (?, ?)";
  
    con.beginTransaction((err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error starting database transaction");
      }
  
      con.query(fromCountryQuery, [
        fromCountryDetails.post_id,
        fromCountryDetails.country_name,
      ], (err, result) => {
        if (err) {
          console.error(err);
          con.rollback(() => {
            res.status(500).send("Error storing from country details in the database");
          });
        } else {
          con.query(toCountryQuery, [
            toCountryDetails.post_id,
            toCountryDetails.country_name,
          ], (err, result) => {
            if (err) {
              console.error(err);
              con.rollback(() => {
                res.status(500).send("Error storing to country details in the database");
              });
            } else {
              con.commit((err) => {
                if (err) {
                  console.error(err);
                  con.rollback(() => {
                    res.status(500).send("Error committing database transaction");
                  });
                } else {
                  res.status(200).send("Country details stored successfully");
                }
              });
            }
          });
        }
      });
    });
  });
  
  
  

 
  // Create post Draft
  app.post("/api/createDraftPost", function(req, res) {
    const {
      account_id,
      bus_acc_id,
      title,
      text,
      created_at,
      created_by,
      last_modified,
      last_modified_by,
      last_mod_by_bus,
      status,
      post_type
    } = req.body;


  

    

    // console.log(created_by, "backend")

    // Check the user's `verified` status before creating the post.
    const verifyQuery = "SELECT verified FROM l_account WHERE id = ?";

    con.query(verifyQuery, [account_id], function(verifyErr, verifyResult) {
      if (verifyErr) {
        console.error(verifyErr);
        res.status(500).send("Error checking user verification status");
      } else if (verifyResult.length === 0) {
        // User not found, send an error response.
        res.status(404).send("User not found");
      } else {
        // Check the `verified` status.
        const userVerifiedStatus = verifyResult[0].verified;

        if (userVerifiedStatus == 1) {
          // User is verified, proceed with post creation.
          const query =
            "INSERT INTO l_post (account_id, bus_acc_id, title, text, created_at, created_by, last_modified, last_modified_by, last_mod_by_bus, status, post_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
          con.query(
            query,
            [
              account_id,
              bus_acc_id,
              title,
              text,
              created_at,
              created_by,
              last_modified,
              last_modified_by,
              last_mod_by_bus,
              status,
              post_type
            ],
            
            function(err, result) {
              if (err) {
                console.error(err);
                res.status(500).send("Error creating post");
              } else {
                const postId = result.insertId;
                res.send({ message: "Post created successfully", postId });
              }
            }
          );
        } else {
          // User is not verified, send an error response.

          res.status(403).send("Please verify your account for write access.");
        }
      }
    });
  });

//   app.post("/api/createDraftPost", function(req, res) {
//     const {
//       account_id,
//       bus_acc_id,
//       title,
//       text,
//       created_at,
//       created_by,
//       last_modified,
//       last_modified_by,
//       last_mod_by_bus,
//       status
//     } = req.body;

//     // Check if any required field is empty
//     const requiredFields = [
//       { field: "account_id", value: account_id },
//       { field: "bus_acc_id", value: bus_acc_id },
//       { field: "title", value: title },
//       { field: "text", value: text },
//       { field: "created_at", value: created_at },
//       { field: "created_by", value: created_by },
//       { field: "last_modified", value: last_modified },
//       { field: "last_modified_by", value: last_modified_by },
//       { field: "last_mod_by_bus", value: last_mod_by_bus },
//       { field: "status", value: status }
//     ];

//     const missingFields = requiredFields.filter(field => !field.value);

//     if (missingFields.length > 0) {
//       // Send response indicating that all fields are required
//       return res.status(400).json({ 
//         error: "All fields are required",
//         missingFields: missingFields.map(field => field.field)
//       });
//     }

//     // Continue with verification and post creation
//     const verifyQuery = "SELECT verified FROM l_account WHERE id = ?";
//     con.query(verifyQuery, [account_id], function(verifyErr, verifyResult) {
//       if (verifyErr) {
//         console.error(verifyErr);
//         res.status(500).send("Error checking user verification status");
//       } else if (verifyResult.length === 0) {
//         res.status(404).send("User not found");
//       } else {
//         const userVerifiedStatus = verifyResult[0].verified;
//         if (userVerifiedStatus == 1) {
//           const query =
//             "INSERT INTO l_post (account_id, bus_acc_id, title, text, created_at, created_by, last_modified, last_modified_by, last_mod_by_bus, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
//           con.query(
//             query,
//             [
//               account_id,
//               bus_acc_id,
//               title,
//               text,
//               created_at,
//               created_by,
//               last_modified,
//               last_modified_by,
//               last_mod_by_bus,
//               status
//             ],
//             function(err, result) {
//               if (err) {
//                 console.error(err);
//                 res.status(500).send("Error creating post");
//               } else {
//                 const postId = result.insertId;
//                 res.send({ message: "Post created successfully", postId });
//               }
//             }
//           );
//         } else {
//           res.status(403).send("Please verify your account for write access.");
//         }
//       }
//     });
// });




 
  // Create post 
// app.post("/api/createPost", function(req, res) {
//   const {
//     account_id,
//     bus_acc_id,
//     title,
//     text,
//     created_at,
//     created_by,
//     last_modified,
//     last_modified_by,
//     last_mod_by_bus,
//     status,
//     activity, 
//     updated,
//     comments,
//     post_type
//   } = req.body;

//   const verifyQuery = "SELECT verified FROM l_account WHERE id = ?";
//   const notificationQuery = "SELECT post_creation FROM l_notifications WHERE account_id = ?";
  
//   con.query(verifyQuery, [account_id], function(verifyErr, verifyResult) {
//     if (verifyErr) {
//       console.error(verifyErr);
//       res.status(500).send("Error checking user verification status");
//     } else if (verifyResult.length === 0) {
//       // User not found, send an error response.
//       res.status(404).send("User not found");
//     } else {
//       // Check the `verified` status.
//       const userVerifiedStatus = verifyResult[0].verified;
//       const userEmail = verifyResult[0].email;

//       if (userVerifiedStatus == 1) {
//         // User is verified, proceed with post creation.
//         const query =
//           "INSERT INTO l_post (account_id, bus_acc_id, title, text, created_at, created_by, last_modified, last_modified_by, last_mod_by_bus, status, post_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
//         con.query(
//           query,
//           [
//             account_id,
//             bus_acc_id,
//             title,
//             text,
//             created_at,
//             created_by,
//             last_modified,
//             last_modified_by,
//             last_mod_by_bus,
//             status,
//             post_type
//           ],
//           function(err, result) {
//             if (err) {
//               console.error(err);
//               res.status(500).send("Error creating post");
//             } else {
//               const postId = result.insertId;

             

//               const postHistoryQuery =
//                 "INSERT INTO l_post_history (post_id, activity, account_id, bus_acc_id, created_by, created_at, updated, comments, post_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
              
              
//               con.query(
//                 postHistoryQuery,
//                 [
//                   postId,
//                   activity,
//                   account_id,
//                   bus_acc_id,
//                   created_by,
//                   created_at,
//                   updated,
//                   comments,
//                   post_type
//                 ],
//                 function(historyErr) {
//                   if (historyErr) {
//                     console.error(historyErr);
//                     res.status(500).send("Error creating post history");
//                   } else {
//                     res.send({ message: "Post created successfully", postId });
//                   }
//                 }
//               );
//             }
//           }
//         );
//       } else {
//         // User is not verified, send an error response.
//         res.status(403).send("Please verify your account for write access.");
//       }
//     }
//   });
// });



// Create post
app.post("/api/createPost", function(req, res) {
  const {
    account_id,
    bus_acc_id,
    title,
    text,
    created_at,
    created_by,
    last_modified,
    last_modified_by,
    last_mod_by_bus,
    status,
    activity, 
    updated,
    comments,
    post_type
  } = req.body;

  const verifyQuery = "SELECT verified, email FROM l_account WHERE id = ?";
  const notificationQuery = "SELECT post_creation FROM l_notifications WHERE account_id = ?";

  con.query(verifyQuery, [account_id], function(verifyErr, verifyResult) {
    if (verifyErr) {
      console.error(verifyErr);
      res.status(500).send("Error checking user verification status");
    } else if (verifyResult.length === 0) {
      res.status(404).send("User not found");
    } else {
      const userVerifiedStatus = verifyResult[0].verified;
      const userEmail = verifyResult[0].email;

      if (userVerifiedStatus == 1) {
        con.query(notificationQuery, [account_id], function(notificationErr, notificationResult) {
          if (notificationErr) {
            console.error(notificationErr);
            res.status(500).send("Error checking notification settings");
          } else {
            const postCreationNotification = notificationResult.length > 0 && notificationResult[0].post_creation === 1;

            const query =
              "INSERT INTO l_post (account_id, bus_acc_id, title, text, created_at, created_by, last_modified, last_modified_by, last_mod_by_bus, status, post_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            con.query(
              query,
              [
                account_id,
                bus_acc_id,
                title,
                text,
                created_at,
                created_by,
                last_modified,
                last_modified_by,
                last_mod_by_bus,
                status,
                post_type
              ],
              function(err, result) {
                if (err) {
                  console.error(err);
                  res.status(500).send("Error creating post");
                } else {
                  const postId = result.insertId;

                  const postHistoryQuery =
                    "INSERT INTO l_post_history (post_id, activity, account_id, bus_acc_id, created_by, created_at, updated, comments, post_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
                  
                  con.query(
                    postHistoryQuery,
                    [
                      postId,
                      activity,
                      account_id,
                      bus_acc_id,
                      created_by,
                      created_at,
                      updated,
                      comments,
                      post_type
                    ],
                    function(historyErr) {
                      if (historyErr) {
                        console.error(historyErr);
                        res.status(500).send("Error creating post history");
                      } else {
                        res.send({ message: "Post created successfully", postId });

                        if (postCreationNotification) {
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
                            to: userEmail,
                            subject: 'Post Creation',
                            text: `You have successfully posted in the forum and it is currently under moderation. We'll get back to you with post status.`,
                          };

                          transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                              console.error('Failed to send post creation email:', error);
                            } else {
                              console.log('Post creation email sent:', info.response);
                            }
                          });
                        }
                      }
                    }
                  );
                }
              }
            );
          }
        });
      } else {
        res.status(403).send("Please verify your account for write access.");
      }
    }
  });
});

  

//   // Update post approval
// app.put('/api/updatePostStatus/:postId', (req, res) => {
//   const { postId } = req.params;
  
//   const query = 'UPDATE l_post SET status = "active" WHERE id = ?';
  
//   con.query(query, [postId], (err, result) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).send('Error updating post status');
//     }
//     res.send('Post status updated successfully');
//   });
// });


// Update post approval
// app.put('/api/updatePostStatus/:postId', (req, res) => {
//   const { postId } = req.params;
//   const {
//     account_id,
//     bus_acc_id,
//     created_by,
//     created_at,
//     updated,
//     comments,
//     activity,
//     post_type,
//   } = req.body;


//   console.log(post_type, created_by)


//   // Step 1: Retrieve the user's email based on account_id
//   const getEmailQuery = 'SELECT email FROM l_account WHERE id = ?';

//   con.query(getEmailQuery, [account_id], (emailErr, emailResult) => {
//     if (emailErr) {
//       console.error('Error fetching user email:', emailErr);
//       return res.status(500).send('Error fetching user email');
//     }

//     if (emailResult.length === 0) {
//       return res.status(404).send('User not found');
//     }

//     const userEmail = emailResult[0].email;
//     console.log(userEmail, "approve_use_email")


//   // Second, update the post status in l_post table
//   const updatePostQuery = 'UPDATE l_post SET status = "active" WHERE id = ?';
//   con.query(updatePostQuery, [postId], (err, result) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).send('Error updating post status');
//     }
    
//     // Third step after updating the status, insert data into l_post_history table
//     const postHistoryQuery = `
//       INSERT INTO l_post_history 
//         (post_id, activity, account_id, bus_acc_id, created_by, created_at, updated, comments, post_type) 
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;
    
//     con.query(
//       postHistoryQuery,
//       [
//         postId,
//         activity,
//         account_id,
//         bus_acc_id,
//         created_by,
//         created_at,
//         updated,
//         comments,
//         post_type,
//       ],
//       (historyErr) => {
//         if (historyErr) {
//           console.error(historyErr);
//           return res.status(500).send('Error creating post history');
//         }
//         res.send('Post status updated and history created successfully');
//       }
//     );
//   });
// });
// });



// Update post approval
app.put('/api/updatePostStatus/:postId', (req, res) => {
  const { postId } = req.params;
  const {
    account_id,
    bus_acc_id,
    created_by,
    created_at,
    updated,
    comments,
    activity,
    post_type,
  } = req.body;

  console.log(post_type, created_by);

  // Step 1: Retrieve the user's email based on account_id
  const getEmailQuery = 'SELECT email FROM l_account WHERE id = ?';

  con.query(getEmailQuery, [account_id], (emailErr, emailResult) => {
    if (emailErr) {
      console.error('Error fetching user email:', emailErr);
      return res.status(500).send('Error fetching user email');
    }

    if (emailResult.length === 0) {
      return res.status(404).send('User not found');
    }

    const userEmail = emailResult[0].email;
    console.log(userEmail, "approve_use_email");

    // Step 2: Retrieve the user's notification settings based on account_id
    const getNotificationQuery = 'SELECT post_moderation FROM l_notifications WHERE account_id = ?';

    con.query(getNotificationQuery, [account_id], (notificationErr, notificationResult) => {
      if (notificationErr) {
        console.error('Error fetching notification settings:', notificationErr);
        return res.status(500).send('Error fetching notification settings');
      }

      // if (notificationResult.length === 0) {
      //   return res.status(404).send('Notification settings not found');
      // }

      const postModerationNotification = notificationResult.length === 0 ? false : notificationResult[0].post_moderation;
      console.log(postModerationNotification, "post_moderation_notification");

      // Step 3: Update the post status in l_post table
      const updatePostQuery = 'UPDATE l_post SET status = "active" WHERE id = ?';
      con.query(updatePostQuery, [postId], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error updating post status');
        }

        // Step 4: Insert data into l_post_history table
        const postHistoryQuery = `
          INSERT INTO l_post_history 
            (post_id, activity, account_id, bus_acc_id, created_by, created_at, updated, comments, post_type) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        con.query(
          postHistoryQuery,
          [
            postId,
            activity,
            account_id,
            bus_acc_id,
            created_by,
            created_at,
            updated,
            comments,
            post_type,
          ],
          (historyErr) => {
            if (historyErr) {
              console.error(historyErr);
              return res.status(500).send('Error creating post history');
            }

            // Step 5: Optionally, send an email notification if postModerationNotification is enabled
            if (postModerationNotification) {
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
                to: userEmail,
                subject: 'Post Approved',
                text: `Your recent post has been approved and is now active.`,
                
              };

              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.error('Failed to send approval email:', error);
                } else {
                  console.log('Approval email sent:', info.response);
                }
              });
            }

            res.send('Post status updated and history created successfully');
          }
        );
      });
    });
  });
});




// Re-post API
app.put('/api/rePost/:postId', (req, res) => {
  const { postId } = req.params;
  const {
    account_id,
    bus_acc_id,
    title,
    text,
    created_by,
    created_at,
    updated,
    comments,
    status,
    activity
  } = req.body;

  console.log(created_at, "created_at")

  // First, update the post status in l_post table
  const updatePostQuery = 'UPDATE l_post SET title = ?, text = ?, status = ?, created_at = ?, l_reject_comments = " " WHERE id = ?';
  con.query(updatePostQuery, [title, text, status, created_at, postId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error updating post status');
    }
    
    // After updating the status, insert data into l_post_history table
    const postHistoryQuery = `
      INSERT INTO l_post_history 
        (post_id, activity, account_id, bus_acc_id, created_by, created_at, updated, comments) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    con.query(
      postHistoryQuery,
      [
        postId,
        activity,
        account_id,
        bus_acc_id,
        created_by,
        created_at,
        updated,
        comments
      ],
      (historyErr) => {
        if (historyErr) {
          console.error(historyErr);
          return res.status(500).send('Error creating post history');
        }
       
        // res.send('Post status updated and history created successfully');
        res.status(200).json({message : "Posted Successfully"})
      }
    );
  });
});




// post rejection
// app.put('/api/rejectStatus/:postId', (req, res) => {
//   const { postId } = req.params;
//   const { comment } = req.body;  // Assuming the comment is sent in the request body
  
//   console.log(postId, comment)

//   const query = 'UPDATE l_post SET status = "rejected", l_reject_comments = ?, l_parent_Id = ? WHERE id = ?';
  
//   con.query(query, [comment, postId, postId], (err, result) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).send('Error updating post status');
//     }
//      // After updating the status, insert data into l_post_history table
//      const postHistoryQuery = `
//      INSERT INTO l_post_history 
//        (post_id, activity, account_id, bus_acc_id, created_by, created_at, updated, comments) 
//      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//    `;
   
//    con.query(
//      postHistoryQuery,
//      [
//        postId,
//        activity,
//        account_id,
//        bus_acc_id,
//        created_by,
//        created_at,
//        updated,
//        comments
//      ],
//      (historyErr) => {
//        if (historyErr) {
//          console.error(historyErr);
//          return res.status(500).send('Error creating post history');
//        }
//        res.send('Post status updated and history created successfully');
//      }
//    );
//  });
// });




// Post Rejection by Admin or subAdmin
// app.put('/api/rejectStatus/:postId', (req, res) => {
//   const { postId } = req.params;
//   const {
//     account_id,
//     bus_acc_id,
//     created_by,
//     created_at,
//     updated,
//     comments,
//     activity,
//     post_type,
//   } = req.body;

//   // First, update the post status in l_post table
//   const query = 'UPDATE l_post SET status = "rejected", l_reject_comments = ? WHERE id = ?';

//  con.query(query, [comments, postId], (err, result) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).send('Error updating post status');
//     }
    
//     // After updating the status, insert data into l_post_history table
//     const postHistoryQuery = `
//       INSERT INTO l_post_history 
//             (post_id, activity, account_id, bus_acc_id, created_by, created_at, updated, comments, post_type) 
//           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;
    
//     con.query(
//       postHistoryQuery,
//       [
//         postId,
//         activity,
//         account_id,
//         bus_acc_id,
//         created_by,
//         created_at,
//         updated,
//         comments
//       ],
//       (historyErr) => {
//         if (historyErr) {
//           console.error(historyErr);
//           return res.status(500).send('Error creating post history');
//         }
//         res.send('Post status updated and history created successfully');
//       }
//     );
//   });
// });




// Update post rejection
app.put('/api/rejectStatus/:postId', (req, res) => {
  const { postId } = req.params;
  const {
    account_id,
    bus_acc_id,
    created_by,
    created_at,
    updated,
    comments,
    activity,
    post_type,
  } = req.body;

  // Step 1: Retrieve the user's email based on account_id
  const getEmailQuery = 'SELECT email FROM l_account WHERE id = ?';
  
  con.query(getEmailQuery, [account_id], (emailErr, emailResult) => {
    if (emailErr) {
      console.error('Error fetching user email:', emailErr);
      return res.status(500).send('Error fetching user email');
    }

    if (emailResult.length === 0) {
      return res.status(404).send('User not found');
    }

    const userEmail = emailResult[0].email;
    console.log(userEmail, "reject_user_email");

    // Step 2: Retrieve the user's notification settings based on account_id
    const getNotificationQuery = 'SELECT post_rejection FROM l_notifications WHERE account_id = ?';

    con.query(getNotificationQuery, [account_id], (notificationErr, notificationResult) => {
      if (notificationErr) {
        console.error('Error fetching notification settings:', notificationErr);
        return res.status(500).send('Error fetching notification settings');
      }

      

      const postRejectionNotification = notificationResult.length === 0 ? false : notificationResult[0].post_rejection;
      console.log(postRejectionNotification, "post_rejection_notification");

      // Step 3: Update the post status in l_post table
      const query = 'UPDATE l_post SET status = "rejected", l_reject_comments = ? WHERE id = ?';
      con.query(query, [comments, postId], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error updating post status');
        }

        // Step 4: Insert data into l_post_history table
        const postHistoryQuery = `
          INSERT INTO l_post_history 
            (post_id, activity, account_id, bus_acc_id, created_by, created_at, updated, comments, post_type) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        con.query(
          postHistoryQuery,
          [
            postId,
            activity,
            account_id,
            bus_acc_id,
            created_by,
            created_at,
            updated,
            comments,
            post_type,
          ],
          (historyErr) => {
            if (historyErr) {
              console.error(historyErr);
              return res.status(500).send('Error creating post history');
            }

            // Step 5: Optionally, send an email notification if postRejectionNotification is enabled
            if (postRejectionNotification) {
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
                to: userEmail,
                subject: 'Post Rejected',
                html: `Your recent post has been rejected. <br>Reason: <span style="color: Red;">${comments}</span>`,
              };

              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.error('Failed to send rejection email:', error);
                } else {
                  console.log('Rejection email sent:', info.response);
                }
              });
            }

            res.send('Post status updated and history created successfully');
          }
        );
      });
    });
  });
});





  // Get Posts
  // app.get("/api/getAllPostsData", function(req, res) {
 
  //   const query = `SELECT
  //   p.id,
  //   p.account_id,
  //   p.bus_acc_id,
  //   p.text,
  //   p.title,
  //   p.created_at,
  //   p.created_by,
  //   p.status,
  //   (
  //    SELECT COUNT(*) 
  //    FROM l_reply r 
  //    WHERE r.post_id = p.id
  //   ) AS reply_count,
  //   GROUP_CONCAT(cr.name) AS category_names
  //  FROM l_post p
  //  LEFT JOIN l_post_category_int pci ON p.id = pci.post_id
  //  LEFT JOIN l_category_ref cr ON pci.category_id = cr.id
  //  GROUP BY p.id, p.account_id, p.created_at`;
  //   con.query(query, function(err, result) {
  //     if (err) {
  //       console.error(err);
  //       res.status(500).send("Error retrieving posts");
  //     } else {
  //       res.send(result);
        
  //     }
  //   });
  // });

   // Get Posts With Pagination
  //  app.get("/api/getAllPostsData", function(req, res) {
    
  //   const page = req.query.page || 1;  // default to page 1
  //   const limit = 5;  // number of posts per page
  //   const offset = (page - 1) * limit;

  //   const query = `SELECT
  //   p.id,
  //   p.account_id,
  //   p.bus_acc_id,
  //   p.text,
  //   p.title,
  //   p.created_at,
  //   p.created_by,
  //   p.status,
  //   (
  //    SELECT COUNT(*) 
  //    FROM l_reply r 
  //    WHERE r.post_id = p.id
  //   ) AS reply_count,
  //   GROUP_CONCAT(cr.name) AS category_names
  //  FROM l_post p
  //  LEFT JOIN l_post_category_int pci ON p.id = pci.post_id
  //  LEFT JOIN l_category_ref cr ON pci.category_id = cr.id
  //  GROUP BY p.id, p.account_id, p.created_at  LIMIT ${limit} OFFSET ${offset} `;
  //   con.query(query, function(err, result) {
  //     if (err) {
  //       console.error(err);
  //       res.status(500).send("Error retrieving posts");
  //     } else {
  //       res.send(result);
        
  //     }
  //   });
  // });


  // User Active posts
  app.get("/api/getAllPostsData", function (req, res) {
    const page = req.query.page || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    // console.log(page, offset)
  
    // Count total posts without LIMIT and OFFSET
    const countQuery = "SELECT COUNT(*) as totalCount FROM l_post";
    con.query(countQuery, function (countErr, countResult) {
      if (countErr) {
        console.error(countErr);
        res.status(500).send("Error counting posts");
      } else {
        const totalCount = countResult[0].totalCount;
  
        // Query to get paginated posts
        const query = `
          SELECT
            p.id,
            p.account_id,
            p.bus_acc_id,
            p.text,
            p.title,
            p.created_at,
            p.created_by,
            p.status,
          
            (
              SELECT COUNT(*) 
              FROM l_reply r 
              WHERE r.post_id = p.id
            ) AS reply_count,
            GROUP_CONCAT(cr.name) AS category_names
          FROM l_post p
          LEFT JOIN l_post_category_int pci ON p.id = pci.post_id
          LEFT JOIN l_category_ref cr ON pci.category_id = cr.id
          WHERE p.status = 'active'
          GROUP BY p.id, p.account_id, p.created_at
          ORDER BY p.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
  
        con.query(query, function (err, result) {
          if (err) {
            console.error(err);
            res.status(500).send("Error retrieving posts");
          } else {
            res.send({ posts: result, totalCount });
            // console.log({posts: result, totalCount} )
          }
        });
      }
    });
  });


   // Under moderation posts for Admin
   app.get("/api/undermoderationPosts", function (req, res) {
    const page = req.query.page || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    // console.log(page, offset)
  
    // Count total posts without LIMIT and OFFSET
    const countQuery = `
  SELECT COUNT(*) as totalCount
  FROM l_post
  WHERE status = 'under moderation';
`;


    con.query(countQuery, function (countErr, countResult) {
      if (countErr) {
        console.error(countErr);
        res.status(500).send("Error counting posts");
      } else {
        const totalCount = countResult[0].totalCount;
  
        // Query to get paginated posts
        const query = `
          SELECT
            p.id,
            p.account_id,
            p.bus_acc_id,
            p.text,
            p.title,
            p.created_at,
            p.created_by,
            p.status,
            p.post_type,
            (
              SELECT COUNT(*) 
              FROM l_reply r 
              WHERE r.post_id = p.id
            ) AS reply_count,
            GROUP_CONCAT(cr.name) AS category_names
          FROM l_post p
          LEFT JOIN l_post_category_int pci ON p.id = pci.post_id
          LEFT JOIN l_category_ref cr ON pci.category_id = cr.id
          WHERE p.status = 'under moderation'
          GROUP BY p.id, p.account_id, p.created_at
          ORDER BY p.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
  
        con.query(query, function (err, result) {
          if (err) {
            console.error(err);
            res.status(500).send("Error retrieving posts");
          } else {
            res.send({ posts: result, totalCount });

            // console.log(totalCount, "po")
          }
        });
      }
    });
  });
  


    // Get Drafted or Under Moderation Posts With Pagination
app.get("/api/getDraftedPosts/:account_id", function(req, res) {
    
  const accountId = req.params.account_id;  // Get the account_id from the URL parameter

  const query = `
  SELECT * from l_post
  WHERE 
    account_id = ? AND (status = 'draft')`;

  con.query(query, [accountId], function(err, result) {
    if (err) {
      console.error(err);
      res.status(500).send("Error retrieving posts");
    } else {
      // console.log("Result:", result.length);  // Log the result
      res.send(result);
    }
  });
});

  // Get subbmitted or Under Moderation Posts With Pagination
  app.get("/api/getSubbmittedPosts/:account_id", function(req, res) {
    
      const accountId = req.params.account_id;  // Get the account_id from the URL parameter
    
      const query = `
      SELECT * from l_post
      WHERE 
        account_id = ? AND (status = 'rejected' OR status = 'under moderation')`;
    
      con.query(query, [accountId], function(err, result) {
        if (err) {
          console.error(err);
          res.status(500).send("Error retrieving posts");
        } else {
          // console.log("Result:", result.length);  // Log the result
          res.send(result);
        }
      });
  });


  // Get draftecd or Under Moderation Posts With Pagination
  app.get("/api/getDraftedPosts/:account_id", function(req, res) {
    const accountId = req.params.account_id;
    const page = req.query.page || 1;  // default to page 1
      const limit = 5;  // number of posts per page
      const offset = (page - 1) * limit;
  
    const query = `
        SELECT * from l_post
        WHERE account_id = ?
        LIMIT ? OFFSET ?`;
  
    con.query(query, [accountId, limit, offset], function(err, result) {
        if (err) {
            console.error(err);
            res.status(500).send("Error retrieving posts");
        } else {
            res.send(result);
        }
    });
  });



  // Get Posts based on account_id and  account_name
  app.get("/api/getUserPostsData/:account_id/:account_name", function(req, res) {
    const account_id = req.params.account_id;
    const account_name = req.params.account_name;
    const page = req.query.page || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    console.log(page, offset)

  
    const countQuery = "SELECT COUNT(*) as totalCount FROM l_post WHERE created_by = ? AND account_id = ?";
  con.query(countQuery, [account_name, account_id], function (countErr, countResult) {
    if (countErr) {
      console.error(countErr);
      res.status(500).send("Error counting user-specific posts");
    } else {
      const totalCount = countResult[0].totalCount;

      const query = `
        SELECT
          p.id,
          p.account_id,
          p.bus_acc_id,
          p.text,
          p.title,
          p.status,
          p.created_at,
          p.created_by,
          (
            SELECT COUNT(*)
            FROM l_reply r
            WHERE r.post_id = p.id
          ) AS reply_count,
          GROUP_CONCAT(cr.name) AS category_names
        FROM l_post p
        LEFT JOIN l_post_category_int pci ON p.id = pci.post_id
        LEFT JOIN l_category_ref cr ON pci.category_id = cr.id
        WHERE p.created_by = ? AND p.account_id = ? AND p.status = 'active'
        GROUP BY p.id, p.account_id, p.created_at
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      con.query(query, [account_name, account_id], function (err, result) {
        if (err) {
          console.error(err);
          res.status(500).send("Error retrieving user-specific posts");
        } else {
          res.send({ posts: result, totalCount });
        }
      });
    }
  });
});


   // Define a route to fetch bus_acc_id based on account_id
   app.get("/api/getBusAccId", (req, res) => {
    const { account_id } = req.query;

    // Query the database to fetch bus_acc_id based on account_id
    const query = "SELECT bus_acc_id FROM l_business_user WHERE account_id = ?";

    con.query(query, [account_id], (err, result) => {
      if (err) {
        console.error("Error fetching bus_acc_id: " + err.message);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }

      if (result.length === 0) {
        // No matching record found, return null
        res.json({ bus_acc_id: 0 });
      } else {
        const bus_acc_id = result[0].bus_acc_id;

        // console.log(bus_acc_id, "hi")
        res.json({ bus_acc_id });
        
      }
    });
  });

// Get Post based on post_id in reply page
  app.get("/api/getPostData/:post_id_number", function(req, res) {
    const post_id_number = req.params.post_id_number;
  
    const query = `
    SELECT
      p.id,
      p.account_id,
      bus_acc_id,
      p.text,
      p.title,
      DATE_FORMAT(p.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
      p.created_by,
      post_type,
      (
        SELECT COUNT(*)
        FROM l_reply r
        WHERE r.post_id = p.id
      ) AS reply_count,
      GROUP_CONCAT(cr.name) AS category_names
    FROM l_post p
    LEFT JOIN l_post_category_int pci ON p.id = pci.post_id
    LEFT JOIN l_category_ref cr ON pci.category_id = cr.id
    WHERE p.id = ?
    GROUP BY p.id, p.account_id, p.created_at`;
  
    con.query(query, [post_id_number], function(err, result) {
      if (err) {
        console.error(err);
        res.status(500).send("Error retrieving posts");
      } else {
        // console.log(result)
        res.send(result);

        
      }
    });
  });
// });
  
// Posts for Global Search
  app.get("/api/filteredPosts", function(req, res) {
    const post_key_word = req.query.keyword;
  
    let query = `
      SELECT
        p.id,
        p.account_id,
        p.bus_acc_id,
        p.text,
        p.title,
        p.created_at,
        p.created_by,
        (
          SELECT COUNT(*) 
          FROM l_reply r 
          WHERE r.post_id = p.id
        ) AS reply_count,
        GROUP_CONCAT(cr.name) AS category_names
      FROM l_post p
      LEFT JOIN l_post_category_int pci ON p.id = pci.post_id
      LEFT JOIN l_category_ref cr ON pci.category_id = cr.id`;
  
    if (post_key_word) {
      query += ` WHERE title LIKE ?`;
    }
  
    query += `
      GROUP BY
        p.id,
        p.account_id,
        p.bus_acc_id,
        p.text,
        p.title,
        p.created_at,
        p.created_by`;
  
    con.query(query, [post_key_word ? `%${post_key_word}%` : null], function(err, result) {
      if (err) {
        console.error(err);
        res.status(500).send("Error retrieving posts");
      } else {
        res.send(result);
      }
    });
  });
  
  // Update Post by id(l_post)
  app.put("/api/updatePost/:id", function(req, res) {
    const id = req.params.id;
    const {
      account_id,
      bus_acc_id,
      title,
      text,
      created_at,
      last_modified,
      last_modified_by,
      last_mod_by_bus,
    } = req.body;

    const query =
      "UPDATE l_post SET account_id = ?, bus_acc_id = ?, title = ?, text = ?, created_at = ?, last_modified = ?, last_modified_by = ?, last_mod_by_bus = ? WHERE id = ?";
    con.query(
      query,
      [
        account_id,
        bus_acc_id,
        title,
        text,
        created_at,
        last_modified,
        last_modified_by,
        last_mod_by_bus,
        id,
      ],
      function(err, result) {
        if (err) {
          console.error(err);
          res.status(500).send("Error updating post");
        } else {
          if (result.affectedRows > 0) {
            res.status(200).json({ message: "Post updated successfully" });
          } else {
            res.status(404).send("Post not found");
          }
        }
      }
    );
  });

    // Get Post by id(l_post)
  app.get("/api/getPost/:id", function(req, res) {
    const id = req.params.id;

    const query = "SELECT * FROM l_post WHERE id = ?";
    con.query(query, [id], function(err, result) {
      if (err) {
        console.error(err);
        res.status(500).send("Error retrieving post");
      } else {
        if (result.length > 0) {
          res.send(result[0]);
        } else {
          res.status(404).send("Post not found");
        }
      }
    });
  });




  app.get("/api/getPostsData/:account_id?/:account_name?", function (req, res) {
    const account_id = req.params.account_id;
    const account_name = req.params.account_name;
    const page = req.query.page || 1;
    const limit = 5;
    const offset = (page - 1) * limit;
    
    const countQuery = account_id
        ? "SELECT COUNT(*) as totalCount FROM l_post WHERE created_by = ? AND account_id = ?"
        : "SELECT COUNT(*) as totalCount FROM l_post";
    
    const queryParams = account_id ? [account_name, account_id] : [];
    
    con.query(countQuery, queryParams, function (countErr, countResult) {
        if (countErr) {
         console.error(countErr);
         res.status(500).send("Error counting posts");
        } else {
         const totalCount = countResult[0].totalCount;
    
         const query = account_id
            ? `
             SELECT
                p.id,
                p.account_id,
                p.bus_acc_id,
                p.text,
                p.title,
                p.status,
                p.created_at,
                p.created_by,
                (
                 SELECT COUNT(*)
                 FROM l_reply r
                 WHERE r.post_id = p.id
                ) AS reply_count,
                GROUP_CONCAT(cr.name) AS category_names
             FROM l_post p
             LEFT JOIN l_post_category_int pci ON p.id = pci.post_id
             LEFT JOIN l_category_ref cr ON pci.category_id = cr.id
             WHERE p.created_by = ? AND p.account_id = ? AND p.status = 'active'
             GROUP BY p.id, p.account_id, p.created_at
             ORDER BY p.created_at DESC
             LIMIT ${limit} OFFSET ${offset}
            `
            : `
             SELECT
                p.id,
                p.account_id,
                p.bus_acc_id,
                p.text,
                p.title,
                p.status,
                p.created_at,
                p.created_by,
                (
                 SELECT COUNT(*)
                 FROM l_reply r
                 WHERE r.post_id = p.id
                ) AS reply_count,
                GROUP_CONCAT(cr.name) AS category_names
             FROM l_post p
             LEFT JOIN l_post_category_int pci ON p.id = pci.post_id
             LEFT JOIN l_category_ref cr ON pci.category_id = cr.id
             WHERE p.status = 'active'
             GROUP BY p.id, p.account_id, p.created_at
             ORDER BY p.created_at DESC
             LIMIT ${limit} OFFSET ${offset}
            `;
    
         con.query(query, queryParams, function (err, result) {
            if (err) {
             console.error(err);
             res.status(500).send("Error retrieving posts");
            } else {
             res.send({ posts: result, totalCount });
            }
         });
        }
    });
    });
    
};
