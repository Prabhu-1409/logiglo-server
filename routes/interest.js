module.exports = function (app, con, jwt) {
  // Backend API endpoint to fetch all interest names
  app.get("/api/allInterests", (req, res) => {
    con.query("SELECT id, name FROM l_category_ref", (err, results) => {
      if (err) {
        console.error("Error fetching interest names:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      const interestNames = results.map((result) => result.name);
      res.status(200).json({ interests: results });
    });
  });

  app.get("/api/userInterests", (req, res) => {
    const { account_id } = req.query;

    // Query the database to join l_interest and l_category_ref tables
    const query = `
        SELECT l_category_ref.id AS interest_id
        FROM l_interest
        INNER JOIN l_category_ref ON l_interest.category_id = l_category_ref.id
        WHERE l_interest.account_id = ?
    `;

    con.query(query, [account_id], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error retrieving user interests");
      } else {
        if (result.length === 0) {
          res.status(404).send("User interests not found");
        } else {
          const userInterests = result.map((row) => row.interest_id);
          res.status(200).json({ userInterests });
        }
      }
    });
  });

  // Add Interests
  // app.post("/api/addInterests", function (req, res) {
  //   const selectedInterests = req.body.selectedInterests;
  //   const accountId = req.body.accountId;

  //   // Create a JWT token
  //   const token = jwt.sign({ accountId }, "your_secret_key", {
  //     expiresIn: "1h",
  //   });

  //   // Check if there are any selected interests
  //   if (selectedInterests.length === 0) {
  //     res.status(400).send("No interests selected");
  //     return;
  //   }

  //   // Lookup corresponding category IDs for the selected interests
  //   const categoryQuery = "SELECT id FROM l_category_ref WHERE name IN (?)";
  //   con.query(
  //     categoryQuery,
  //     [selectedInterests],
  //     function (err, categoryResult) {
  //       if (err) {
  //         console.error(err);
  //         res.status(500).send("Error adding interests");
  //       } else {
  //         // Prepare the data to be inserted into l_interest table
  //         const interestsData = categoryResult.map((category) => [
  //           accountId,
  //           category.id,
  //         ]);

  //         // Insert the data into l_interest table
  //         const insertQuery =
  //           "INSERT INTO l_interest (account_id, category_id) VALUES ?";
  //         con.query(insertQuery, [interestsData], function (err, insertResult) {
  //           if (err) {
  //             console.error(err);
  //             res.status(500).send("Error adding interests");
  //           } else {
  //             res
  //               .status(200)
  //               .json({ token, message: "Interests added successfully" });
  //           }
  //         });
  //       }
  //     }
  //   );
  // });

  // Add Interests
  app.post("/api/addInterests", function (req, res) {
    const selectedInterests = req.body.selectedInterests;
    const accountId = req.body.accountId;

    // Create a JWT token
    const token = jwt.sign({ accountId }, "your_secret_key", {
      expiresIn: "1h",
    });

    // Check if there are any selected interests
    if (selectedInterests.length === 0) {
      res.status(400).send("No interests selected");
      return;
    }

    // Lookup corresponding category IDs for the selected interests
    const categoryQuery = "SELECT id FROM l_category_ref WHERE name IN (?)";
    con.query(
      categoryQuery,
      [selectedInterests],
      function (err, categoryResult) {
        if (err) {
          console.error(err);
          res.status(500).send("Error adding interests");
        } else {
          // Get the existing interests for the user
          const existingInterestsQuery =
            "SELECT category_id FROM l_interest WHERE account_id = ?";
          con.query(
            existingInterestsQuery,
            [accountId],
            function (err, existingInterestsResult) {
              if (err) {
                console.error(err);
                res.status(500).send("Error adding interests");
              } else {
                const existingInterests = existingInterestsResult.map(
                  (item) => item.category_id
                );

                // Filter out already existing interests
                const newInterests = categoryResult.filter(
                  (item) => !existingInterests.includes(item.id)
                );

                // Prepare the data to be inserted into l_interest table
                const interestsData = newInterests.map((category) => [
                  accountId,
                  category.id,
                ]);

                // Insert the new interests into l_interest table
                if (interestsData.length > 0) {
                  const insertQuery =
                    "INSERT INTO l_interest (account_id, category_id) VALUES ?";
                  con.query(
                    insertQuery,
                    [interestsData],
                    function (err, insertResult) {
                      if (err) {
                        console.error(err);
                        res.status(500).send("Error adding interests");
                      } else {
                        res
                          .status(200)
                          .json({
                            token,
                            message: "Interests added successfully",
                          });
                      }
                    }
                  );
                } else {
                  // No new interests to insert
                  res
                    .status(200)
                    .json({ token, message: "No new interests to add" });
                }
              }
            }
          );
        }
      }
    );
  });

  // Update Interests
  app.post("/api/updateInterests", function (req, res) {
    const selectedInterests = req.body.selectedInterests;
    const accountId = req.body.accountId;
    // console.log(selectedInterests);
    // Create a JWT token
    const token = jwt.sign({ accountId }, "your_secret_key", {
      expiresIn: "1h",
    });

    // Check if there are any selected interests
    if (selectedInterests.length === 0) {
      res.status(400).send("No interests selected");
      return;
    }

    // Delete interests that are not selected anymore
    const deleteQuery =
      "DELETE FROM l_interest WHERE account_id = ? AND category_id NOT IN (?)";
    const categoryIds = selectedInterests.map((interest) => interest); // Assuming selectedInterests contain objects with an 'id' property
    con.query(
      deleteQuery,
      [accountId, categoryIds],
      function (err, deleteResult) {
        if (err) {
          console.error(err);
          res.status(500).send("Error updating interests");
        } else {
          // Insert new interests, ignoring duplicates
          const insertQuery =
            "INSERT IGNORE INTO l_interest (account_id, category_id) VALUES ?";

          const interestsData = selectedInterests.map((interest) => [
            accountId,
            interest, // Assuming selectedInterests contain objects with an 'id' property
          ]);
          con.query(insertQuery, [interestsData], function (err, insertResult) {
            if (err) {
              console.error(err);
              res.status(500).send("Error updating interests");
            } else {
              res
                .status(200)
                .json({ token, message: "Interests updated successfully" });
            }
          });
        }
      }
    );
  });

  // Post Interests
  app.post("/api/postInterests", function (req, res) {
    const selectedInterests = req.body.selectedInterests;
    const postId = req.body.postId;

    // Check if there are any selected interests
    if (selectedInterests.length === 0) {
      res.status(400).send("No interests selected");
      return;
    }

    // Lookup corresponding category IDs for the selected interests
    const categoryQuery = "SELECT id FROM l_category_ref WHERE name IN (?)";
    con.query(
      categoryQuery,
      [selectedInterests],
      function (err, categoryResult) {
        if (err) {
          console.error(err);
          res.status(500).send("Error adding interests");
        } else {
          // Prepare the data to be inserted into l_post_category_int table
          const interestsData = categoryResult.map((category) => [
            postId,
            category.id,
          ]);

          // Insert the data into l_post_category_int table
          const insertQuery =
            "INSERT INTO l_post_category_int (post_id, category_id) VALUES ?";
          con.query(insertQuery, [interestsData], function (err, insertResult) {
            if (err) {
              console.error(err);
              res.status(500).send("Error adding interests");
            } else {
              res.send("Interests added successfully");
            }
          });
        }
      }
    );
  });

  app.post("/api/createPostWithInterests", function (req, res) {
    const {
      account_id,
      bus_acc_id,
      title,
      text,
      created_by,
      created_at,
      last_modified,
      last_modified_by,
      last_mod_by_bus,
      selectedInterests,
    } = req.body;

    const verifyQuery = "SELECT verified FROM l_account WHERE id = ?";
    const createPostQuery =
      "INSERT INTO l_post (account_id, bus_acc_id, title, text, created_at, created_by, last_modified, last_modified_by, last_mod_by_bus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const categoryQuery = "SELECT id FROM l_category_ref WHERE name IN (?)";
    const insertQuery =
      "INSERT INTO l_post_category_int (post_id, category_id) VALUES ?";

    con.query(verifyQuery, [account_id], function (verifyErr, verifyResult) {
      if (verifyErr) {
        console.error(verifyErr);
        return res.status(500).send("Error checking user verification status");
      }

      if (verifyResult.length === 0) {
        return res.status(404).send("User not found");
      }

      const userVerifiedStatus = verifyResult[0].verified;

      if (userVerifiedStatus !== 1) {
        return res
          .status(403)
          .send("Please verify your account for write access");
      }

      con.query(
        createPostQuery,
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
        function (err, result) {
          if (err) {
            console.error(err);
            return res.status(500).send("Error creating post");
          }

          const postId = result.insertId;

          if (selectedInterests.length === 0) {
            return res.send({ message: "Post created successfully", postId });
          }

          con.query(
            categoryQuery,
            [selectedInterests],
            function (err, categoryResult) {
              if (err) {
                console.error(err);
                return res.status(500).send("Error adding interests");
              }

              const interestsData = categoryResult.map((category) => [
                postId,
                category.id,
              ]);

              con.query(
                insertQuery,
                [interestsData],
                function (err, insertResult) {
                  if (err) {
                    console.error(err);
                    return res.status(500).send("Error adding interests");
                  }

                  res.send({
                    message: "Post created successfully with interests",
                    postId,
                  });
                }
              );
            }
          );
        }
      );
    });
  });
};
