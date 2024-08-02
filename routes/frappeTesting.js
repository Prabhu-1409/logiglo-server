// routes/career.js
module.exports = function(app, mariadbCon, axios) {
    app.get('/api/careers', (req, res) => {
      const query = 'SELECT * FROM `${tabjob Opening}';
      mariadbCon.query(query, (err, results) => {
        if (err) {
          console.error('Error executing MariaDB query:', err);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          res.status(200).json(results);
        }
      });
    });
  };
  