

module.exports = function(app, con, jwt) {


 
  

// Removing Sub Admin Access
// API to remove admin access
// app.post("/api/removeAdminAccess", (req, res) => {
//   const { email } = req.body;

//   if (!email) {
//     res.status(400).json({ error: 'Email is required' });
//     return;
//   }

//   const updateQuery = "UPDATE l_account SET account_type = 'user' WHERE email = ?";
//   con.query(updateQuery, [email], (error, results) => {
//     if (error) {
//       console.error('Error executing MySQL query:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     } else {
//       res.status(200).json({ message: 'Admin access removed successfully' });
//     }
//   });
// });







// API endpoint to create a new career entry
app.post("/api/createCareer", (req, res) => {
  const { title, description, company, source, tags, created_at } = req.body;

  const query =
    "INSERT INTO l_careers (title, description, company, source, tags,  created_at) VALUES (?, ?, ?, ?, ?, ?)";

  con.query(
    query,
    [title, description, company, source, tags, created_at],
    (err, result) => {
      if (err) {
        console.error("Error inserting career:", err);
        return res.status(500).send("Error inserting career");
      }
      // console.log("New career inserted:", result);
      res.status(200).send("Career inserted successfully");
    }
  );
});




// API endpoint to fetch all careers
app.get("/api/getCareers", (req, res) => {
  const query = "SELECT * FROM l_careers";

  con.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching careers:", err);
      return res.status(500).send("Error fetching careers");
    }
    res.status(200).json(results);
  });
});






// API endpoint to update a selected career post
app.put("/api/updateSelectedCareerPostContent/:id", (req, res) => {
  const { selectedTitle, selectedDescription, selectedCompany, selectedSource, selectedtags, created_at } = req.body;
  const selectedPostId = req.params.id;

  const query = "UPDATE l_careers SET title = ?, description = ?, company = ?, source = ?, tags = ?, created_at = ? WHERE id = ?";

  con.query(query, [selectedTitle, selectedDescription, selectedCompany, selectedSource, selectedtags, created_at, selectedPostId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error updating career post content");
    }

    res.send("Selected career post updated successfully");
  });
});



// API endpoint to delete a career post
app.delete("/api/deleteCareerPost/:id", (req, res) => {
  const selectedPostId = req.params.id;

  const query = "DELETE FROM l_careers WHERE id = ?";

  con.query(query, [selectedPostId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error deleting career post");
    }

    res.send("Selected career post deleted successfully");
  });
});



// API endpoint to fetch all corses from education table
app.get("/api/getCourses", (req, res) => {
  const query = "SELECT * FROM l_education";

  con.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching course:", err);
      return res.status(500).send("Error fetching courses");
    }
    res.status(200).json(results);
  });
});


// Endpoint to get a course by ID
app.get("/api/getCourse/:id", (req, res) => {
  const courseId = req.params.id;

  // SQL query to fetch the course from the database using courseId
  const query = 'SELECT * FROM l_education WHERE id = ?';

  con.query(query, [courseId], (err, results) => {
    if (err) {
      console.error('Error fetching course:', err.stack);
      res.status(500).send('Error fetching course');
      return;
    }

    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).send('Course not found');
    }
  });
});


// Endpoint to get a careers by ID
app.get("/api/getCareers/:id", (req, res) => {
  const careerId = req.params.id;

  // SQL query to fetch the careers from the database using careersId
  const query = 'SELECT * FROM l_careers WHERE id = ?';

  con.query(query, [careerId], (err, results) => {
    if (err) {
      console.error('Error fetching careers:', err.stack);
      res.status(500).send('Error fetching careers');
      return;
    }

    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).send('Career post not found');
    }
  });
});





// API endpoint to fetch all corses from education table
app.get("/api/getCourses", (req, res) => {
  const query = "SELECT * FROM l_education";

  con.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching course:", err);
      return res.status(500).send("Error fetching courses");
    }
    res.status(200).json(results);
  });
});


// Endpoint to get a course by ID
app.get("/api/getCourse/:id", (req, res) => {
  const courseId = req.params.id;

  // SQL query to fetch the course from the database using courseId
  const query = 'SELECT * FROM l_education WHERE id = ?';

  con.query(query, [courseId], (err, results) => {
    if (err) {
      console.error('Error fetching course:', err.stack);
      res.status(500).send('Error fetching course');
      return;
    }

    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).send('Course not found');
    }
  });
});





   
  
  };
