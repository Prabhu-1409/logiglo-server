module.exports = function(app, con, axios, cron, moment, jwt) {




   // Granting Sub Admin Access
   app.post("/api/updateAdminAccess", (req, res) => {
    const { email } = req.body;
  
    if (!email) {
      res.status(400).send({ success: false, message: "Email is required" });
      return;
    }
  
    const updateQuery = "UPDATE l_account SET account_type = 'subadmin' WHERE email = ?";
    con.query(updateQuery, [email], (error, results) => {
      if (error) {
        console.error('Error executing MySQL query:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
      } else if (results.affectedRows === 0) {
        res.status(404).json({ success: false, message: 'Email not found' });
      } else {
        res.status(200).json({ success: true, message: 'Admin access granted' });
      }
    });
  });
  


  app.post("/api/removeAdminAccess", (req, res) => {
    const { email } = req.body;
  
    console.log(`Received request to remove admin access for email: ${email}`); // Log incoming request
  
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }
  
    const updateQuery = "UPDATE l_account SET account_type = 'user' WHERE email = ?";
    con.query(updateQuery, [email], (error, results) => {
      if (error) {
        console.error('Error executing MySQL query:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      } else if (results.affectedRows === 0) {
        console.log('No rows affected, email not found or already a user');
        res.status(404).json({ message: 'Email not found or already a user' });
      } else {
        console.log('Admin access removed successfully');
        res.status(200).json({ message: 'Admin access removed successfully' });
      }
    });
  });


  // const trackVisit = (req, res, next) => {
  //   const token = req.headers['authorization'];
  //   let isMember = false;
    
  //   if (token) {
  //     try {
        
  //       const user = jwt.verify(token.replace('Bearer ', ''), 'your_secret_key');
  //       req.user = user;
  //       isMember = true;
  //     } catch (err) {
  //       console.error('Invalid token:', err);
  //     }
  //   }
  
  //   const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  // console.log(token, ip, isMember)
  //   const query = 'INSERT INTO l_visit_logs (ip, is_member, timestamp) VALUES (?, ?, ?)';
  //   con.query(query, [ip, isMember, new Date()], (err) => {
  //     if (err) {
  //       console.error('Error logging visit:', err);
  //     }
  //     next();
  //   });
  // };


// app.use(trackVisit);
// app.use('/api/visitorLogs', trackVisit);


// app.get('/api/visitorCounts', (req, res) => {
//   const query = `
//     SELECT 
//       (SELECT COUNT(*) FROM l_visit_logs WHERE is_member = true) AS memberCount,
//       (SELECT COUNT(*) FROM l_visit_logs WHERE is_member = false) AS guestCount
//   `;

//   con.query(query, (err, results) => {
//     if (err) {
//       console.error('Error fetching visitor counts:', err);
//       return res.status(500).send('Error fetching visitor counts');
//     }
//     res.status(200).json(results[0]);
//   });
// });



// const trackVisit = (req, res, next) => {
//   // Ignore static files
//   if (req.path.startsWith('/static') || req.path.startsWith('/assets')) {
//     return next();
//   }

//   const token = req.headers['authorization'];
//   let isMember = false;

//   if (token) {
//     try {
//       const user = jwt.verify(token.replace('Bearer ', ''), 'your_secret_key');
//       req.user = user;
//       isMember = true;
//     } catch (err) {
//       console.error('Invalid token:', err);
//     }
//   }

//   const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//   console.log(token, ip, isMember);

//   const query = 'INSERT INTO l_visit_logs (ip, is_member, timestamp) VALUES (?, ?, ?)';
//   con.query(query, [ip, isMember, new Date()], (err) => {
//     if (err) {
//       console.error('Error logging visit:', err);
//     }
//     next();
//   });
// };

// Apply trackVisit middleware only to relevant API routes
// app.use('/api/visitorLogs', trackVisit);

// app.get('/api/visitorCounts', (req, res) => {
//   const query = `
//     SELECT 
//       (SELECT COUNT(*) FROM l_visit_logs WHERE is_member = true) AS memberCount,
//       (SELECT COUNT(*) FROM l_visit_logs WHERE is_member = false) AS guestCount
//   `;

//   con.query(query, (err, results) => {
//     if (err) {
//       console.error('Error fetching visitor counts:', err);
//       return res.status(500).send('Error fetching visitor counts');
//     }
//     res.status(200).json(results[0]);
//   });
// });






  // New user country ID
  app.get("/api/getCountryId", (req, res) => {
    const { iso_code } = req.query;
    // console.log(iso_code, "from front")

    // Query the database to find the id of the selected country
    const query = "SELECT id FROM l_country_ref WHERE iso_code = ?";

    con.query(query, [iso_code], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error retrieving country id");
      } else {
        if (result.length === 0) {
          res.status(404).send("Country not found");
        } else {
          const countryId = result[0].id;
          res.status(200).json({ country_id: countryId });
        }
      }
    });
  });

  // Get states by country_id
  app.get("/api/getStatesByCountryId", (req, res) => {
    const { country_id } = req.query;

    // console.log(country_id, "from front")

    const query = "SELECT id, title FROM states WHERE country_id = ?";

    con.query(query, [country_id], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error fetching states by country_id");
      } else {
        res.status(200).send(result);
      }
    });
  });
  

  
  app.get("/api/URl", async (req, res) => {
      try{
        const response = await axios.get(`https://restcountries.com/v3.1/all`)
        console.log(response.data.data, "aa")
         res.json(response.data)
        

        
    
      }catch (error){
        console.error('Error fetching Countries data', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
  });

// Countries API
app.get("/api/getAllCountries", (req, res) => {
  // Query the database to retrieve all rows from l_country_ref
  const query = "SELECT * FROM l_country_ref";

  con.query(query, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error retrieving countries");
    } else {
      res.status(200).json({ countries: result });
    }
  });
});

// States based on country API
app.get("/api/getAllStates", (req, res) => {
  const query = "SELECT * FROM states";

  con.query(query, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error retrieving countries");
    } else {
      res.status(200).json({ states: result });
      console.log(result)
    }
  });
});

// get Ads 
app.get("/api/getAdsData", (req, res) => {
  const query = 'SELECT * FROM l_advertisement';
  
  con.query(query, (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.status(200).json(results);
      // console.log(results, "back_car")
    }
  });
});

// Endpoint to create a new ad
app.post('/api/createAd', (req, res) => {
  const { title, text, image_url, type, render_order, render, startDate, endDate, validity } = req.body;
  const query = 'INSERT INTO l_advertisement (title, text, image_url, type, render_order, render, start_date, end_date, validity ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  con.query(query, [title, text, image_url, type, render_order, render, startDate, endDate, validity], (err, result) => {
    if (err) {
      console.error('Error inserting ad:', err);
      res.status(500).send('Error inserting ad');
    } else {
      res.status(200).send('Ad created successfully');
    }
  });
});

// Endpoint to create a new ad
app.delete('/api/deleteAd/:id', (req, res) => {
  const selectedAdId = req.params.id;
  const query = 'delete from l_advertisement where id = ?';
  con.query(query, [selectedAdId], (err, result) => {
    if (err) {
      console.error('Error inserting ad:', err);
      res.status(500).send('Error inserting ad');
    } else {
      res.status(200).send('Ad deleted successfully');
    }
  });
});

app.post('/api/updateSelectedAd/:id', (req, res) => {
  const {
    selectedAdStatus
  } = req.body;
  const selectedAdId = req.params.id; 
  
  const query = 'UPDATE l_advertisement SET  render = ? WHERE id = ?';

  con.query(query, [selectedAdStatus, selectedAdId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error updating selected ad section');
    }
    
    // Send a response back indicating success
    res.status(200).send('Selected ad section updated successfully');
  });
});




//Ad subscription ended
// app.put('/api/removeAdSubscription/:id', (req, res) => {

//   const selectedAdId = req.params.id; 
  
//   const query = 'UPDATE l_advertisement SET  render = 0 WHERE id = ?';

//   con.query(query, [selectedAdId], (err, result) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).send('Error updating selected ad section');
//     }
    
//     // Send a response back indicating success
//     res.status(200).send('Ad subscription ended.');
//   });
// });


// Cron job to update advertisement render status every half an hour
// For every 1 Minute '* * * * *'
// For 30 Minutes '*/30 * * * *'

cron.schedule('*/30 * * * *', async () => {
  console.log('Running cron job to update advertisement render status...');

  try {
    // Fetch all advertisements from the database
    const query = 'SELECT id, end_date FROM l_advertisement'; 
    con.query(query, async (err, results) => {
      if (err) {
        console.error('Error fetching advertisements:', err);
        return;
      }

      // Process each advertisement to update render status
      for (let i = 0; i < results.length; i++) {
        const { id, end_date } = results[i];
        const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const isEndDateExceeded = moment(currentDate).isAfter(end_date);


       // Only update render value if end date is exceeded and current render value is not already 0
       if (isEndDateExceeded) {
        const updateQuery = 'UPDATE l_advertisement SET render = ? WHERE id = ?';
        con.query(updateQuery, [0, id], (updateErr, updateResult) => {
          if (updateErr) {
            console.error(`Error updating advertisement ${id}:`, updateErr);
          } 
          // else {
          //   console.log(`Advertisement ${id} render updated to 0 successfully.`);
          // }
        });
      }
    }
  });
} catch (error) {
  console.error('Error in cron job:', error);
}
});


// Update Selected Ad Content
app.put('/api/updateSelectedAdContent/:id', (req, res) => {
  const {
    selectedAdTitle,
    selectedAdDescription,
    selectedAdImgUrl,
    selectedAdRenderOrder,
    selectedAdType,
    startDate,
    validity,
    endDate
  } = req.body;
  const selectedAdId = req.params.id; 

  
  const query = 'UPDATE l_advertisement SET title = ?, text = ?, image_url = ?, render_order = ?, type = ?, start_date = ?, validity = ?, end_date = ? WHERE id = ?';

 con.query(query, [selectedAdTitle, selectedAdDescription, selectedAdImgUrl, selectedAdRenderOrder, selectedAdType, startDate, validity, endDate, selectedAdId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error Updating Ad Content');
    }
    
    res.send('Selected Ad updated successfully');
  });

});

  
// Endpoint to fetch carousel data
app.get('/api/getCarouselData', (req, res) => {
  const query = 'SELECT * FROM l_carousel_section';
  
  con.query(query, (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.status(200).json(results);
      // console.log(results, "back_car")
    }
  });
});





// Update the Carousel section table
// app.put('/api/updateCarouselSection/:id', (req, res) => {
//   const {
//     carouselSectionHeader,
//       carouselTitle,
//       carouselDescription,
//       carouselImgUrl,
//       carouselSectionStatus
//   } = req.body;
//   const carouselId = req.params.id; 

  
//   const query = 'UPDATE l_carousel_section SET header = ?, title = ?, description_text = ?, image_url = ?, render_status = ? WHERE id = ?';

//  con.query(query, [carouselSectionHeader, carouselTitle, carouselDescription, carouselImgUrl, carouselSectionStatus, carouselId], (err, result) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).send('Error updating carousel section');
//     }
    
//     res.send('Carousel section updated successfully');
//   });

// });

app.put('/api/updateCarouselSection/:id', (req, res) => {
  const {
    carouselSectionHeader,
    carouselTitle,
    carouselDescription,
    carouselImgUrl,
    carouselSectionStatus
  } = req.body;
  const carouselId = req.params.id; 
  
  const query = 'UPDATE l_carousel_section SET header = ?, title = ?, description_text = ?, image_url = ?, render_status = ? WHERE id = ?';

  con.query(query, [carouselSectionHeader, carouselTitle, carouselDescription, carouselImgUrl, carouselSectionStatus, carouselId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error updating carousel section');
    }
    
    // Fetch the updated carousel section data
    const updatedCarouselQuery = 'SELECT * FROM l_carousel_section WHERE id = ?';
    con.query(updatedCarouselQuery, [carouselId], (err, updatedResult) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error fetching updated carousel section');
      }

      // Send the updated carousel section data along with the success message
      res.send({ message: 'Carousel section updated successfully', updatedCarouselSection: updatedResult });
    });
  });
});



// Endpoint to fetch why us section data
app.get('/api/getWhyUsSectionData', (req, res) => {
  const query = 'SELECT * FROM l_why_us_section';
  
  con.query(query, (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.status(200).json(results);
      // console.log(results, "back_car")
    }
  });
});


app.put('/api/updateWhyUsSection/:id', (req, res) => {
  const {
    whyUsSectionTitle,
    whyUsSectionStatus
  } = req.body;
  const whyUsSectionId = req.params.id; 
  
  const query = 'UPDATE l_why_us_section SET title = ?, render_status = ? WHERE id = ?';

  con.query(query, [whyUsSectionTitle, whyUsSectionStatus, whyUsSectionId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error updating carousel section');
    }
    
    // Fetch the updated carousel section data
    const updatedWhyUsQuery = 'SELECT * FROM l_why_us_section WHERE id = ?';
    con.query(updatedWhyUsQuery, [whyUsSectionId], (err, updatedResult) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error fetching updated Why Us section');
      }

      // Send the updated carousel section data along with the success message
      res.send({ message: 'Why Us section updated successfully', updatedWhyUsSection: updatedResult });
    });
  });
});



// Endpoint to fetch data what We Do Section
// app.get('/api/whatWeDoSection', (req, res) => {
//   const query = 'SELECT * FROM l_what_we_do_section';
  
//   con.query(query, (error, results) => {
//     if (error) {
//       console.error('Error executing MySQL query:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     } else {
//       res.status(200).json(results);
//       // console.log(results)
//     }
//   });
// });


// Endpoint to fetch data We Do Section Category Section
// app.get('/api/whatWeDoCategorySection', (req, res) => {
//   const query = 'SELECT * FROM l_what_we_do_category_section_content';
  
//   con.query(query, (error, results) => {
//     if (error) {
//       console.error('Error executing MySQL query:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     } else {
//       res.status(200).json(results);
//       // console.log(results)
//     }
//   });
// });

// // Endpoint to fetch data what We Do Section Category Section
// app.get('/api/whatWeDoCategorySectionTextDetails', (req, res) => {
//   const query = 'SELECT * FROM l_what_we_do_category_section';
  
//   con.query(query, (error, results) => {
//     if (error) {
//       console.error('Error executing MySQL query:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     } else {
//       res.status(200).json(results);
//       // console.log(results)
//     }
//   });
// });


// Endpoint to fetch data from careers Section
app.get('/api/whatWeDoSection', (req, res) => {
  const query1 = 'SELECT * FROM l_what_we_do_category_section';
  const query2 = 'SELECT * FROM l_what_we_do_category_section_content';

  con.query(query1, (error1, results1) => {
    if (error1) {
      console.error('Error executing MySQL query:', error1);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      con.query(query2, (error2, results2) => {
        if (error2) {
          console.error('Error executing MySQL query:', error2);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          // Combine the results from both queries
          const combinedResults = {
            whatWeDoSection: results1,
            whatWeDoSectionContent: results2
          };
          res.status(200).json(combinedResults);
        }
      });
    }
  });
});


// // Update whatWeDosection options like Icon and Icon, title
app.put('/api/updateWhatWeDoContentSection/:id', (req, res) => {
  const {
    selectedoptionTitle,
    selectedIcon
  } = req.body;
  const selectedOptionId = req.params.id; 

  
  const query = 'UPDATE l_what_we_do_category_section_content SET title = ?, icon = ? WHERE id = ?';

 con.query(query, [selectedoptionTitle, selectedIcon, selectedOptionId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error updating What we do section option');
    }
    
    res.send('What we do section option updated successfully');
  });

});


// // Update whatWeDosection Main text content
app.put('/api/updateWhatWeDoSectionTextContent/:id', (req, res) => {
  const {
    whatWeDoSectionHeader,
    whatWeDoSectionTitle,
    whatWeDoSectionStatus
  } = req.body;
  const whatWeDoSectionId = req.params.id; 

  
  const query = 'UPDATE l_what_we_do_category_section SET header = ?, title = ?, render_status = ? WHERE id = ?';

 con.query(query, [whatWeDoSectionHeader, whatWeDoSectionTitle, whatWeDoSectionStatus ,whatWeDoSectionId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error updating What we do section main content');
    }
    
    res.send('What we do section main content updated successfully');
  });

});

// Endpoint to fetch data from Why Us Section
app.get('/api/whyUsSection', (req, res) => {
  const query = 'SELECT * FROM l_why_us_section';
  
  con.query(query, (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.status(200).json(results);
      // console.log(results)
    }
  });
});

// Endpoint to fetch data from careers Section
app.get('/api/careersSection', (req, res) => {
  const query1 = 'SELECT * FROM l_careers_section';
  const query2 = 'SELECT * FROM l_careers_section_company_logos';

  con.query(query1, (error1, results1) => {
    if (error1) {
      console.error('Error executing MySQL query:', error1);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      con.query(query2, (error2, results2) => {
        if (error2) {
          console.error('Error executing MySQL query:', error2);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          // Combine the results from both queries
          const combinedResults = {
            careersSection: results1,
            companyLogos: results2
          };
          res.status(200).json(combinedResults);
        }
      });
    }
  });
});


// Endpoint to fetch data from connectingGlobe Section
app.get('/api/connectingGlobeSection', (req, res) => {
  const query1 = 'SELECT * FROM l_connecting_section';
  const query2 = 'SELECT * FROM l_connecting_section_content';

  con.query(query1, (error1, results1) => {
    if (error1) {
      console.error('Error executing MySQL query:', error1);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      con.query(query2, (error2, results2) => {
        if (error2) {
          console.error('Error executing MySQL query:', error2);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          // Combine the results from both queries
          const combinedResults = {
            connectingSection: results1,
            connectingSectionContent: results2
          };
          res.status(200).json(combinedResults);
        }
      });
    }
  });
});

// Update the Connecting globe section table
app.put('/api/updateConnectingGlobeSection/:id', (req, res) => {
  const {
    selectedOptionImgUrl,
    selectedoptionTitle,
    selectedOptionSubTitle,
      
  } = req.body;
  const selectedOptionId = req.params.id; 

  
  const query = 'UPDATE l_connecting_section_content SET section_img_url = ?, title = ?, description = ? WHERE id = ?';

 con.query(query, [selectedOptionImgUrl, selectedoptionTitle, selectedOptionSubTitle, selectedOptionId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error updating connecting section');
    }
    
    res.send('connecting section updated successfully');
  });

});



// Update Update Connecting Gblobe Sectin Activation
app.put('/api/updateConnectingGlobeSectionActivation/:id', (req, res) => {
  const {
    connectingGlobeSectionStatus
  } = req.body;
  const connectSectionId = req.params.id; 

  
  const query = 'UPDATE l_connecting_section SET render_status = ? WHERE id = ?';

 con.query(query, [connectingGlobeSectionStatus, connectSectionId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error updating Connect section main content');
    }
    
 
    const updatedConnectGlobeQuery = 'SELECT * FROM l_connecting_section';
    con.query(updatedConnectGlobeQuery, [connectSectionId], (err, updatedResult) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error fetching updated Connect section');
      }

      // Send the updated carousel section data along with the success message
      res.send({ message: 'Connecting Globe section main content updated successfully', updatedConnectSection: updatedResult });
    });
  });
});






// // Update whatWeDosection Main text content
app.put('/api/updateTestimonialSectionActivation/:id', (req, res) => {
  const {
    testimonialStatus
  } = req.body; // Extract testimonialStatus from the request body
  console.log(testimonialStatus)
  const sectionId = req.params.id;

  const query = 'UPDATE l_testimonial_section SET render_status = ? WHERE id = ?';

  con.query(query, [testimonialStatus, sectionId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error updating testimonial section');
    }
    res.send('Testimonial section updated successfully'); // Send a success response
  });
});




// Update Update Conneting Globe Section
app.put('/api/updateConnectingGlobeSectionActivation/:id', (req, res) => {
  const {
    connectingGlobeSectionStatus
  } = req.body;
  const connectSectionId = req.params.id; 

  
  const query = 'UPDATE l_connecting_section SET render_status = ? WHERE id = ?';

 con.query(query, [connectingGlobeSectionStatus, connectSectionId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error updating Connect section main content');
    }
    
 
    const updatedConnectGlobeQuery = 'SELECT * FROM l_connecting_section';
    con.query(updatedConnectGlobeQuery, [connectSectionId], (err, updatedResult) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error fetching updated Connect section');
      }

      // Send the updated carousel section data along with the success message
      res.send({ message: 'Connecting Globe section main content updated successfully', updatedConnectSection: updatedResult });
    });
  });
});


// // Update testimonial activation
// app.put('/api/updateTestimonialSectionActivation/:id', (req, res) => {
//   const {
//     testimonialObject
//   } = req.body;

//   console.log(testimonialObject)
//   const sectionId = req.params.id; 

  
//   const query = 'UPDATE l_testimonial_section SET render_status = ? WHERE id = ?';

//  con.query(query, [testimonialObject, sectionId], (err, result) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).send('Error updating testimonial section');
//     }
  
//   });
// });


// Endpoint to fetch data from connectingGlobe Section
app.get('/api/testimonialSection', (req, res) => {
  const query1 = 'SELECT * FROM l_testimonial_section';
  const query2 = 'SELECT * FROM l_testimonial_content_section';

  con.query(query1, (error1, results1) => {
    if (error1) {
      console.error('Error executing MySQL query:', error1);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      con.query(query2, (error2, results2) => {
        if (error2) {
          console.error('Error executing MySQL query:', error2);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          // Combine the results from both queries
          const combinedResults = {
            testimonialSection: results1,
            testimonialContentSection: results2
          };
          res.status(200).json(combinedResults);
        }
      });
    }
  });
});


// Endpoint to handle DELETE request for deleting a user by ID
app.delete('/api/testimonialContentSection/:userId', (req, res) => {
  const userId = req.params.userId;

  // SQL query to delete user from the database
  const query = 'DELETE FROM l_testimonial_content_section WHERE id = ?';

  // Execute the query with the user's ID
  con.query(query, userId, (error, results) => {
    if (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      // Check if any rows were affected (user deleted successfully)
      if (results.affectedRows > 0) {
        res.status(200).json({ message: 'User deleted successfully' });
      } else {
        // No user found with the given ID
        res.status(404).json({ error: 'User not found' });
      }
    }
  });
});


// Endpoint to insert a new user into the l_testimonial_content_section table
app.post('/api/addUserTestimonial', (req, res) => {
  // Extract data from the request body
  const { userImageUrl, userName, companyName, description, userStarRating, renderStatus } = req.body;

  // SQL query to insert a new user into the database
  const query = 'INSERT INTO l_testimonial_content_section (user_profile_img_url, user_name, company_name, description, user_star_rating, render_status) VALUES (?, ?, ?, ?, ?, ?)';

  // Execute the query with the provided data
  con.query(query, [userImageUrl, userName, companyName, description, userStarRating, renderStatus], (error, results) => {
    if (error) {
      console.error('Error inserting user testimonial:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      // Respond with the ID of the newly inserted user
      res.status(200).json({ id: results.insertId });
    }
  });
});






// Endpoint to fetch data what We Do Section
app.get('/api/contactUsSection', (req, res) => {
  const query = 'SELECT * FROM l_contactus_section';
  
  con.query(query, (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.status(200).json(results);
      // console.log(results)
    }
  });
});


app.put('/api/updateContactUsSection/:id', (req, res) => {
  const {
    contactUsSectionHeader,
      contactUsTitle,
      contactUsDescription,
      contactEmail,
      contactNumber,
      contactTime,
      contactUsSectionStatus
  } = req.body;
  const contactUsId = req.params.id; 
  
  const query = 'UPDATE l_contactus_section SET header = ?, title = ?, description_text = ?, email = ?, contact_number = ?, timings = ?, render_status = ? WHERE id = ?';

  con.query(query, [contactUsSectionHeader, contactUsTitle, contactUsDescription, contactEmail, contactNumber, contactTime, contactUsSectionStatus, contactUsId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error updating contact section');
    }
    
    // Fetch the updated Contact section data
    const updatedContactQuery = 'SELECT * FROM l_contactus_section WHERE id = ?';
    con.query(updatedContactQuery, [contactUsId], (err, updatedResult) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error fetching updated Contact section');
      }

      // Send the updated carousel section data along with the success message
      res.send({ message: 'Contact section updated successfully', updatedContactSection: updatedResult });
    });
  });
});


// Endpoint to fetch data Nav bar Menu Items 
app.get('/api/menuItems', (req, res) => {
  const query = 'SELECT * FROM l_menu_section';
  
  con.query(query, (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.status(200).json(results);
      // console.log(results)
    }
  });
});

// Endpoint to handle updating menu item display
app.post('/api/updateMenuItemDisplay/:id', (req, res) => {
  const { id } = req.params;
  const { display } = req.body;

  // Query to update the display value in the database
  const sql = `UPDATE l_menu_section SET display = ? WHERE id = ?`;

  // Execute the query
  con.query(sql, [display, id], (error, results) => {
    if (error) {
      console.error('Error updating menu item display:', error);
      res.status(500).json({ success: false, message: 'An error occurred while updating menu item display' });
    } else {
      console.log('Menu item display updated successfully');
      res.status(200).json({ success: true, message: 'Menu item display updated successfully' });
    }
  });
});

// // Update whatWeDosection options like Icon and Icon, title
app.put('/api/updateMenuItem/:id', (req, res) => {
  const {
    selectedoptionTitle,
    selectedIcon
  } = req.body;
  const selectedOptionId = req.params.id; 

  
  const query = 'UPDATE l_menu_section SET menu_items = ?, icon_path = ? WHERE id = ?';

 con.query(query, [selectedoptionTitle, selectedIcon, selectedOptionId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error updating What we do section option');
    }
    
    res.send('Menu items updated successfully');
  });

});


app.get('/api/dropdownMenu', (req, res) => {
  const query = 'SELECT * FROM l_dropdown_menu';
  
  con.query(query, (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.status(200).json(results);
    }
  });
});


app.get('/api/advertisementData', (req, res) => {
  const query = 'SELECT * FROM l_advertisement ORDER BY `render_order` ASC';
  
  con.query(query, (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.status(200).json(results);
      // console.log(results)
    }
  });
});

app.get('/api/getLeftAdvertisingData', (req, res) => {
  const query = 'SELECT * FROM l_left_advertising_section ORDER BY `render_order` ASC';
  
  con.query(query, (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.status(200).json(results);
    }
  });
});


app.get('/api/getRightAdvertisingData', (req, res) => {
  const query = 'SELECT * FROM l_right_advertising_section ORDER BY `render_order` ASC';
  
  con.query(query, (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.status(200).json(results);
    }
  });
});



// Endpoint to fetch data based on table name
// app.get('/api/getMobileData', (req, res) => {
//   // Extract the table name from the query parameters
//   const tableName = req.query.table_name;

//   // Construct the SQL query dynamically based on the table name
//   const query = `
//     SELECT 
//         n.id,
//         n.icon_name,
//         n.path_name,
//         n.path_status
//     FROM 
//         ${tableName} n
//     JOIN 
//         l_mobile_settings s ON n.reference_id = s.reference_id
//     WHERE 
//         s.table_name = ?`;

//   con.query(query, [tableName], (error, results) => {
//     if (error) {
//       console.error('Error executing MySQL query:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     } else {
//       res.status(200).json(results);
//     }
//   });
// });



// Color by its name from l_colors table
app.get("/api/getColorByName/:postHeaderColor/:descriptionColorName", (req, res) => {
  const { descriptionColorName, postHeaderColor } = req.params;

  // Query the database to retrieve the color with the specified name
  const query = "SELECT * FROM l_colors WHERE color_name IN (?, ?)";
  const colorNames = [postHeaderColor, descriptionColorName ];

  // Execute the query
  con.query(query, colorNames, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error retrieving color");
    } else {
      if (result.length > 0) {
        const colors = result.map(color => ({
          id: color.id,
          color_name: color.color_name,
          hex_code: color.hex_code,
          type: color.color_name === descriptionColorName ? 'description' : 'postHeader'
        }));

        res.status(200).json({ colors });
      } else {
        res.status(404).send("Color not found");
      }
    }
  });
});


app.get('/api/getScrollData', function(req, res) {
  // const linkedInSignupOptionStaus = 'SELECT linkedIn_signup FROM l_settings LIMIT 1';
 const scrollingData = `SELECT text FROM l_admin_settings WHERE feature = 'navbar_scrolling'`;

  con.query(scrollingData, function(err, result) {
    if (err) {
      console.error(err);
      res.status(500).send("Error fetching scrolling data");
    } else {
      if (result.length > 0) {
        const scrollingText = result[0];
        res.send({ scrollingText, message: "scrolling data fetched successfully" });
        // console.log(scrollingText);
      } else {
        res.status(404).send("No scrolling data found");
      }
    }
  });
});



app.get('/api/socialSignup', function(req, res) {
 const query = `SELECT * FROM l_social`;

  con.query(query, function(err, result) {
    if (err) {
      console.error(err);
      res.status(500).send("Error fetching social data");
    } else {
      // console.log(result)  
      res.send({ result, message: "social data fetched successfully" });

      }
    })
});


// API for updating feature render status
app.post('/api/updateSocialIds', function(req, res) {
  const { socialType, clientID, clientSecret } = req.body;

  // console.log(socialType, clientID, clientSecret, "lllllll")

  const updateQuery = "UPDATE l_social SET client_id = ?, client_secret = ? WHERE type = ?";
  
  con.query(updateQuery, [clientID , clientSecret, socialType], function(err, result) {
    if (err) {
      console.error(err);
      res.status(500).send(`Error updating ${socialType}`);
    } else {
      res.send(`${socialType} fields updated successfully`);
    }
  });
});



// Endpoint to fetch color code
app.get('/api/getButtonColor', (req, res) => {
  const query = 'SELECT color_code FROM l_theme WHERE property_name = ? AND id = 1';
  
  con.query(query, ['button'], (err, result) => {
    if (err) {
      console.error('Error fetching color from the database:', err);
      return res.status(500).send('Error fetching color from the database');
    }
    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(404).send('No color found for the specified property');
    }
  });
});

// update web color picker for button 
app.put('/api/saveButtonColor', (req, res) => {
  const { property_name, color_code } = req.body;
  const query = 'UPDATE l_theme SET property_name = ?, color_code = ? WHERE id = 1';

  con.query(query, [property_name, color_code], (err, result) => {
    if (err) {
      console.error('Error saving color to the database:', err);
      return res.status(500).send('Error saving color to the database');
    }
    res.send('Button Color Saved Successfully');
  });
});



// update Mobile color picker for button 
// app.put('/api/saveMobileButtonColor', (req, res) => {
//   const { property_name, color_code } = req.body;
//   const query = 'UPDATE l_mobile_theme_settings SET property_name = ?, color_code = ? WHERE id = 1';

//   con.query(query, [property_name, color_code], (err, result) => {
//     if (err) {
//       console.error('Error saving color to the database:', err);
//       return res.status(500).send('Error saving color to the database');
//     }
//     res.send('Button Color Saved Successfully');
//   });
// });


// update Mobile color picker for button 
app.put('/api/saveMobileButtonColor', (req, res) => {
  const { property_name, color_code } = req.body;
  
  // Determine which ID to use based on property_name
  let id;
  if (property_name === 'PrimaryColor') {
    id = 1;
  } else if (property_name === 'SecondaryColor') {
    id = 2;
  } else {
    return res.status(400).send('Invalid property name');
  }

  const query = 'UPDATE l_mobile_theme_settings SET color_code = ? WHERE id = ?';

  con.query(query, [color_code, id], (err, result) => {
    if (err) {
      console.error('Error saving color to the database:', err);
      return res.status(500).send('Error saving color to the database');
    }
    res.send('Button Color Saved Successfully');
  });
});



// Get all mobile theme settings
app.get('/api/getMobileThemeSettings', (req, res) => {
  const query = 'SELECT * FROM l_mobile_theme_settings';
  con.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching mobile theme settings:', err);
      return res.status(500).send('Error fetching mobile theme settings');
    }
    res.json(results);
  });
});







};
