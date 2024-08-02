module.exports = function(app, con, nodemailer) {
 


  // Create Reply for Post 
  // app.post("/api/createReply", function(req, res) {
  //   const {
  //     account_id,
  //     business_account_id,
  //     text,
  //     post_id,
  //     created_at,
  //     created_by,
  //     last_modified_by,
  //     last_mod_bus,
  //     last_modified_at,
  //   } = req.body;

  //   // Check if any field is left blank
  //   if (!text) {
  //     res.status(400).send("Text field required");
  //     return;
  //   }

  //   // Check if the user is verified
  //   const verificationQuery = "SELECT verified FROM l_account WHERE id = ?";
  //   con.query(verificationQuery, [account_id], function(err, result) {
  //     if (err) {
  //       console.error(err);
  //       res.status(500).send("Error checking verification status");
  //       return;
  //     }

  //     const userVerified = result[0].verified;

  //     if (userVerified == 0) {
  //       // User is not verified
  //       res.status(403).send("Please verify your account for write access.");
  //     } else {
  //       // User is verified, proceed to create the reply
  //       const query = `INSERT INTO l_reply (account_id, business_account_id, text, post_id, created_at, created_by, last_modified_by, last_mod_bus, last_modified_at) 
  //                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  //       con.query(
  //         query,
  //         [
  //           account_id,
  //           business_account_id,
  //           text,
  //           post_id,
  //           created_at,
  //           created_by,
  //           last_modified_by,
  //           last_mod_bus,
  //           last_modified_at,
  //         ],
  //         function(err, result) {
  //           if (err) {
  //             console.error(err);
  //             res.send("Please give correct inputs");
  //           } else {
  //             // Fetch the newly created reply with the user's first name
  //             const fetchQuery = `SELECT r.*, c.first_name
  //                                   FROM l_reply r
  //                                   INNER JOIN l_contact c ON r.account_id = c.account_id
  //                                   WHERE r.id = ?
  //                                   ORDER BY r.id DESC
  //                                   LIMIT 1`;

  //             con.query(fetchQuery, [result.insertId], function(
  //               err,
  //               fetchResult
  //             ) {
  //               if (err) {
  //                 console.error(err);
  //                 res.status(500).send("Error fetching reply");
  //               } else {
  //                 res.send(fetchResult[0]);
  //               }
  //             });
  //           }
  //         }
  //       );
  //     }
  //   });
  // });





// Create reply
app.post("/api/createReply", function(req, res) {
  const {
    account_id,
    business_account_id,
    text,
    post_id,
    created_at,
    created_by,
    last_modified_by,
    last_mod_bus,
    last_modified_at,
  } = req.body;

  // Check if any field is left blank
  if (!text) {
    res.status(400).send("Text field required");
    return;
  }

  // Step 1: Retrieve the user's email and verification status based on account_id
  const verifyQuery = "SELECT verified, email FROM l_account WHERE id = ?";
  const notificationQuery = "SELECT reply_creation FROM l_notifications WHERE account_id = ?";

  con.query(verifyQuery, [account_id], function(verifyErr, verifyResult) {
    if (verifyErr) {
      console.error(verifyErr);
      res.status(500).send("Error checking user verification status");
    } else if (verifyResult.length === 0) {
      res.status(404).send("User not found");
    } else {
      const userVerifiedStatus = verifyResult[0].verified;
      const userEmail = verifyResult[0].email;

      if (userVerifiedStatus == 0) {
        res.status(403).send("Please verify your account for write access.");
      } else {
        con.query(notificationQuery, [account_id], function(notificationErr, notificationResult) {
          if (notificationErr) {
            console.error(notificationErr);
            res.status(500).send("Error checking notification settings");
          } else {
            const replyCreationNotification = notificationResult.length > 0 && notificationResult[0].reply_creation === 1;

            // Step 2: Insert the reply into l_reply table
            const query = `INSERT INTO l_reply (account_id, business_account_id, text, post_id, created_at, created_by, last_modified_by, last_mod_bus, last_modified_at) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            con.query(
              query,
              [
                account_id,
                business_account_id,
                text,
                post_id,
                created_at,
                created_by,
                last_modified_by,
                last_mod_bus,
                last_modified_at,
              ],
              function(err, result) {
                if (err) {
                  console.error(err);
                  res.status(500).send("Error creating reply");
                } else {
                  const replyId = result.insertId;

                  // Step 3: Fetch the newly created reply with the user's first name
                  const fetchQuery = `SELECT r.*, c.first_name
                                      FROM l_reply r
                                      INNER JOIN l_contact c ON r.account_id = c.account_id
                                      WHERE r.id = ?
                                      ORDER BY r.id DESC
                                      LIMIT 1`;

                  con.query(fetchQuery, [replyId], function(fetchErr, fetchResult) {
                    if (fetchErr) {
                      console.error(fetchErr);
                      res.status(500).send("Error fetching reply");
                    } else {
                      res.status(200).send(fetchResult[0]);

                      // Step 4: Optionally, send an email notification if replyCreationNotification is enabled
                      if (replyCreationNotification) {
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
                          subject: 'Reply Created',
                          text: `You have successfully posted a reply in the forum. Your reply: ${text}`,
                        };

                        transporter.sendMail(mailOptions, (error, info) => {
                          if (error) {
                            console.error('Failed to send reply creation email:', error);
                          } else {
                            console.log('Reply creation email sent:', info.response);
                          }
                        });
                      }
                    }
                  });
                }
              }
            );
          }
        });
      }
    }
  });
});



  // Get All Replies for User based on post_id
  app.get("/api/getReplies/:post_id", function(req, res) {
    const post_id = req.params.post_id;

    const query = "SELECT * FROM l_reply WHERE post_id = ?";
    con.query(query, [post_id], function(err, result) {
      if (err) {
        console.error(err);
        res.status(500).send("Error retrieving replies");
      } else {
        res.send(result);
      }
    });
  });

  // Update Reply based on reply_id, presentText, updatedText
  app.put("/api/updateReply/:reply_id", function(req, res) {
    const reply_id = req.params.reply_id;
    const presentText = req.body.presentText;
    const updatedText = req.body.updatedText;
    // console.log(reply_id, presentText, updatedText)

    const query = "UPDATE l_reply SET text = ? WHERE id = ? AND text = ?";
    con.query(query, [updatedText, reply_id, presentText], function(
      err,
      result
    ) {
      if (err) {
        console.error(err);
        res.status(500).send("Error updating reply");
      } else {
        if (result.affectedRows > 0) {
          res.send("Reply updated successfully");
        } else {
          res.status(404).send("Reply not found");
        }
      }
    });
  });

  // Delete Reply based on id(l_reply)
  app.delete("/api/deleteReply/:id", function(req, res) {
    const id = req.params.id;

    const query = "DELETE FROM l_reply WHERE id = ?";
    con.query(query, [id], function(err, result) {
      if (err) {
        console.error(err);
        res.status(500).send("Error deleting reply");
      } else {
        if (result.affectedRows > 0) {
          res.send("Reply deleted successfully");
        } else {
          res.status(404).send("Reply not found");
        }
      }
    });
  });




  
};
