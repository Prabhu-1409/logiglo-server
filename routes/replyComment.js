module.exports = function(app, con, nodemailer) {
  // get comments for a reply_id
  app.get("/api/getComments/:reply_id", (req, res) => {
    const reply_id = req.params.reply_id;

    // Fetch all comments for the given reply_id from the l_comment table
    const query = "SELECT * FROM l_comment WHERE reply_id = ?";
    con.query(query, [reply_id], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error fetching comments");
      } else {
        res.status(200).json(result);
      }
    });
  });

  // get all comments for a post
  app.get("/api/getAllComments", (req, res) => {
    const post_id = req.params.post_id;

    // Fetch all comments for the given reply_id from the l_comment table
    const query = "SELECT * FROM l_comment ";
    con.query(query, [post_id], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error fetching comments");
      } else {
        res.status(200).json(result);
      }
    });
  });

  // add a comment
  // app.post("/addComment", (req, res) => {
  //   const { reply_id, text, account_id, created_at } = req.body;

  //   // Get the maximum comment_id for the given reply_id from the l_comment table
  //   const getMaxCommentIdQuery =
  //     "SELECT MAX(comment_id) AS max_comment_id FROM l_comment WHERE reply_id = ?";
  //   con.query(getMaxCommentIdQuery, [reply_id], (err, result) => {
  //     if (err) {
  //       console.error(err);
  //       res.status(500).send("Error adding comment");
  //     } else {
  //       // Calculate the next comment_id by incrementing the maximum comment_id by 1
  //       const nextCommentId = (result[0].max_comment_id || 0) + 1;

  //       // Insert the new comment into the l_comment table
  //       const query =
  //         "INSERT INTO l_comment (reply_id, comment_id, text, account_id, created_at) VALUES (?, ?, ?, ?, ?)";
  //       con.query(
  //         query,
  //         [reply_id, nextCommentId, text, account_id, created_at],
  //         (err, result) => {
  //           if (err) {
  //             console.error(err);
  //             res.status(500).send("Error adding comment");
  //           } else {
  //             res.status(200).send("Comment added successfully");
  //           }
  //         }
  //       );
  //     }
  //   });
  // });

  // add a comment
  // app.post("/api/addComment", (req, res) => {
  //   const { reply_id, text, account_id, created_at, created_by } = req.body;

  //   // Check if the user is verified
  //   const verifyUserQuery = "SELECT verified FROM l_account WHERE id = ?";
  //   con.query(verifyUserQuery, [account_id], (err, result) => {
  //     if (err) {
  //       console.error(err);
  //       res.status(500).send("Error adding comment");
  //     }

  //     const userVerified = result[0].verified;

  //     if (userVerified == 0) {
  //       // User is not verified
  //       res.status(403).send("Please verify your account for write access.");
  //     } else {
  //       // User is verified, proceed with adding the comment

  //       // Get the maximum comment_id for the given reply_id from the l_comment table
  //       const getMaxCommentIdQuery =
  //         "SELECT MAX(comment_id) AS max_comment_id FROM l_comment WHERE reply_id = ?";
  //       con.query(getMaxCommentIdQuery, [reply_id], (err, result) => {
  //         if (err) {
  //           console.error(err);
  //           res.status(500).send("Error adding comment");
  //         } else {
  //           // Calculate the next comment_id by incrementing the maximum comment_id by 1
  //           const nextCommentId = (result[0].max_comment_id || 0) + 1;

  //           // Insert the new comment into the l_comment table
  //           const query =
  //             "INSERT INTO l_comment (reply_id, comment_id, text, account_id, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?)";
  //           con.query(
  //             query,
  //             [
  //               reply_id,
  //               nextCommentId,
  //               text,
  //               account_id,
  //               created_at,
  //               created_by,
  //             ],
  //             (err, result) => {
  //               if (err) {
  //                 console.error(err);
  //                 res.status(500).send("Error adding comment");
  //               } else {
  //                 res.status(200).send("Comment added successfully");
  //               }
  //             }
  //           );
  //         }
  //       });
  //     }
  //   });
  // });




// Add a comment
app.post("/api/addComment", (req, res) => {
  const { reply_id, text, account_id, created_at, created_by } = req.body;

  // Check if the user is verified
  const verifyUserQuery = "SELECT verified, email FROM l_account WHERE id = ?";
  const notificationQuery = "SELECT comment_creation FROM l_notifications WHERE account_id = ?";

  con.query(verifyUserQuery, [account_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error adding comment");
    }

    if (result.length === 0) {
      return res.status(404).send("User not found");
    }

    const userVerified = result[0].verified;
    const userEmail = result[0].email;

    if (userVerified == 0) {
      // User is not verified
      return res.status(403).send("Please verify your account for write access.");
    }

    // Check notification settings
    con.query(notificationQuery, [account_id], (notificationErr, notificationResult) => {
      if (notificationErr) {
        console.error(notificationErr);
        return res.status(500).send("Error checking notification settings");
      }

      const commentCreationNotification = notificationResult.length > 0 && notificationResult[0].comment_creation === 1;

      // Get the maximum comment_id for the given reply_id from the l_comment table
      const getMaxCommentIdQuery = "SELECT MAX(comment_id) AS max_comment_id FROM l_comment WHERE reply_id = ?";
      con.query(getMaxCommentIdQuery, [reply_id], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error adding comment");
        }

        // Calculate the next comment_id by incrementing the maximum comment_id by 1
        const nextCommentId = (result[0].max_comment_id || 0) + 1;

        // Insert the new comment into the l_comment table
        const query = "INSERT INTO l_comment (reply_id, comment_id, text, account_id, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?)";
        con.query(query, [reply_id, nextCommentId, text, account_id, created_at, created_by], (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).send("Error adding comment");
          }

          res.status(200).send("Comment added successfully");

          // Optionally, send an email notification if commentCreationNotification is enabled
          if (commentCreationNotification) {
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
              subject: 'Comment Added',
              text: `You have successfully added a comment to the reply. Your comment: ${text}`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.error('Failed to send comment creation email:', error);
              } else {
                console.log('Comment creation email sent:', info.response);
              }
            });
          }
        });
      });
    });
  });
});




  // Update a comment by its reply_id and comment_id
  app.put("/api/updateComment/:reply_id/:comment_id", (req, res) => {
    const reply_id = req.params.reply_id;
    const comment_id = req.params.comment_id;
    const { updatedText } = req.body;

    // Perform the update operation in the database
    const query =
      "UPDATE l_comment SET text = ? WHERE reply_id = ? AND comment_id = ?";
    con.query(query, [updatedText, reply_id, comment_id], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error updating comment");
      } else {
        res.sendStatus(200);
      }
    });
  });

  // Delete a comment by its comment_id
  app.delete("/api/deleteComment/:reply_id/:comment_id", (req, res) => {
    const reply_id = req.params.reply_id;
    const comment_id = req.params.comment_id;

    const query = "DELETE FROM l_comment WHERE reply_id = ? AND comment_id = ?";
    con.query(query, [reply_id, comment_id], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error deleting comment");
      } else {
        res.sendStatus(200);
      }
    });
  });
};
