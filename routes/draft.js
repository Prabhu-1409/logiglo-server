module.exports = function(app, con, multer) {
 
   // Create post Draft
   app.post("/api/saveAsDraft", function(req, res) {
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
            "INSERT INTO l_drafted_posts (account_id, bus_acc_id, title, text, created_at, created_by, last_modified, last_modified_by, last_mod_by_bus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
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


//    // Get Drafted Posts With Pagination
//   app.get("/api/getDraftedPosts/:account_id", function(req, res) {
    
//     const accountId = req.params.account_id;  // Get the account_id from the URL parameter

//   const query = `
//   SELECT * from l_drafted_posts
//     WHERE 
//       account_id = ?`;

//   con.query(query, [accountId], function(err, result) {
//     if (err) {
//       console.error(err);
//       res.status(500).send("Error retrieving posts");
//     } else {
//       // console.log("Result:", result.length);  // Log the result
//       res.send(result);
//     }
//   });
// });

// app.get("/api/getDraftedPosts/:account_id", function(req, res) {
//   const accountId = req.params.account_id;
//   const page = req.query.page || 1;  // default to page 1
//     const limit = 5;  // number of posts per page
//     const offset = (page - 1) * limit;

//   const query = `
//       SELECT * from l_drafted_posts
//       WHERE account_id = ?
//       LIMIT ? OFFSET ?`;

//   con.query(query, [accountId, limit, offset], function(err, result) {
//       if (err) {
//           console.error(err);
//           res.status(500).send("Error retrieving posts");
//       } else {
//           res.send(result);
//       }
//   });
// });



 // Update Post by id(l_post)
 app.put("/api/updateDraft/:id", function(req, res) {
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
    "UPDATE l_drafted_posts SET account_id = ?, bus_acc_id = ?, title = ?, text = ?, created_at = ?, last_modified = ?, last_modified_by = ?, last_mod_by_bus = ? WHERE id = ?";
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


// DELETE endpoint to delete a drafted post
app.delete('/api/deleteDraftedPost/:postId', (req, res) => {
  const postId = req.params.postId;

  const query = 'DELETE FROM l_drafted_posts WHERE id = ?';

  con.query(query, [postId], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error deleting drafted post');
    } else if (result.affectedRows > 0) {
      res.status(200).send('Drafted post deleted successfully.');
    } else {
      res.status(404).send('Drafted post not found.');
    }
  });
});



};
