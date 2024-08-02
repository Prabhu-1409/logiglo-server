const express = require("express");
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const axios = require('axios');
const cors = require('cors');
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const config = require('./config/connection');
const nodemailer = require("nodemailer");
const path = require("path");
const jwt = require("jsonwebtoken");
const passport = require('passport');
const LinkedInStrategy = require('./lib/index').Strategy;
const session = require('express-session');
const app = express();
// const getClientCredentials = require("./getClientCredentials");
// const util = require('util');
// mysql2
const moment = require('moment');
var cron = require('node-cron');
const { format } = require('date-fns');


app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET'
  }));


  const multer = require("multer");
  require('dotenv').config();
  
  
  app.use(cors({
      origin:"*"
  }));
  
  
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  
  //Connection to the database
  const con = mysql.createConnection({
      host:config.host,
      user:config.user,
      password:config.password,
      database:config.db,
      port:config.port,
      
  });
  
  

  
  con.connect(function(err) {
      if (err) throw err;
      console.log("Connected to MYSQL Database!");
  });
  
  
  // frappe testing

  // Connection to MySQL database
  // const mysqlCon = mysql.createConnection(config.mysql);

  // mysqlCon.connect(function(err) {
  //   if (err) throw err;
  //   console.log("Connected to MySQL Database!");
  // });

// // Connection to MariaDB database
// const mariadbCon = mysql.createConnection(config.mariadb);

// mariadbCon.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected to MariaDB Database!");
// });

  // frappe testing
  
  
  
  app.use(passport.initialize());
  app.use(passport.session());
  
  passport.serializeUser(function (user, done) {
  done(null, user);
  });
  
  passport.deserializeUser(function (user, done) {
  done(null, user);
  });
  

  passport.use(new LinkedInStrategy({
  // clientID: credentials.client_id,
  // clientSecret: credentials.client_secret,
  clientID: config.linkedinAuth.clientID,
clientSecret : config.linkedinAuth.clientSecret,
  callbackURL: config.linkedinAuth.callbackURL,
  scope: ['profile', 'email', 'openid'],
  passReqToCallback: true,
},   
  function (req, accessToken, refreshToken, profile, done) {
      req.session.accessToken = accessToken;
      process.nextTick(function () {
          return done(null, profile);
      });
  }));




// Routes
require('./routes/basicData')(app, con, axios, cron, moment, jwt);
require('./routes/interest')(app, con, jwt);
require('./routes/post')(app, con, multer, nodemailer);
require('./routes/draft')(app, con, multer);
require('./routes/reply')(app, con, nodemailer);
require('./routes/replyComment')(app, con, nodemailer);
require('./routes/user')(app, con, nodemailer, path, jwt, passport, bcrypt);
require('./routes/admin')(app, con, jwt);

// Serve static files
// app.use('/static', express.static('public'));
// app.use('/assets', express.static('assets'));


// Route for MySql
// require('./routes/basicData')(app, mysqlCon, axios);
// require('./routes/interest')(app, mysqlCon, jwt);
// require('./routes/post')(app, mysqlCon, multer);
// require('./routes/draft')(app, mysqlCon, multer);
// require('./routes/reply')(app, mysqlCon);
// require('./routes/replyComment')(app, mysqlCon);
// require('./routes/user')(app, mysqlCon, nodemailer, path, jwt, passport, bcrypt);


// Route for MariaDB
// require('./routes/')(app, mariadbCon, axios);


app.get("/api", (req, res) => {
    res.send("Hello World")
})


app.listen(3001, () => {
    console.log("Server running on port 3001");
  });







  


  