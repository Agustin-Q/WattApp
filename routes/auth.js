/* jshint esversion: 8 */
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const rand = require('generate-key')
const middlewares = require('../middlewares/middlewares.js');
const db = require('../database/database.js');

//setting up DBs
const usersDB = db.usersDB;


const createUserSchema = Joi.object({
  UserName: Joi.string().alphanum().min(3).max(30).required(),
  Password: Joi.string().trim().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
});

function  createTokenSendResponse (user, res) {
  const token = jwt.sign({
    UserName: user.UserName,
    userID: user._id
  },
  process.env.JWT_KEY, {
    expiresIn: "1y"
  });
  res.json({
    status: "success",
    token: token
  });
}

// pre-pended with /api/auth

router.get("/login", (req, res) => {
  console.log("Login request");
  if (req.user){
    res.json(req.user);
  } else {
    res.status(401).json({
      status: "failed",
      message: "Auth failed"
    });
  }
});

router.post("/login", (req, res) => {
  console.log('login route');
  console.log(req.body);
  const schemaResult = createUserSchema.validate(req.body);
  if (schemaResult.error) {
    //body schema is not valid, return an error.
    console.log("shcema error");
    res.status(400);
    res.json(schemaResult.error);
    return;
  }
  usersDB.find({
    UserName: req.body.UserName
  }, (DBerror, docs) => {
    if (docs.length >= 1 && req.body.Password == docs[0].Password) {
      //succes, respond with token
      console.log('Responding with token.');
      createTokenSendResponse(docs[0], res);
    } else {
      console.log('Auth failed.');
      res.status(401).json({
        status: "failed",
        message: "Auth failed"
      });
    }
  });
});

router.post("/create_user", (req, res) => {
  //debug msgs
  let date = new Date(Date.now()).toLocaleString();
  console.log(date + ": Got a POST request on /api/auth/create_user from " + req.hostname + " with body:");
  console.log(req.body);
  //schema validation of body
  const schemaResult = createUserSchema.validate(req.body);
  console.log("joi result", schemaResult);
  if (schemaResult.error) {
    //schema does not match, return error
    console.log("Shcema error");
    res.status(400); // bad request
    res.json(schemaResult.error); //respond with schema error
  } else {
    //request body is valid schema
    //check if user exists
    console.log("Schema Ok, checking for user in DB");
    usersDB.find({
      UserName: req.body.UserName
    }, (DBerror, docs) => {
      console.log("DB callback");
      var error = 0;
      if (docs.length > 0) error = "user_unavailable"; // user exists
      if (!error) {
        //if no error insert user in DB
        //TODO: hash password before
        console.log("no DB error, generating key");
        // create key for sensors
        const doc = {
          UserName: req.body.UserName,
          Password: req.body.Password,
          Devices: []
        };
        usersDB.insert(doc, (err, newUser) =>{
          if (!err) {
            console.log("User Created");
            //return success response
            createTokenSendResponse(newUser, res);
          } else {
            console.log('Database insertion error!');
            console.log(err);
          }
        });
        
      } else {
        //user allready exists return an error
        res.status(400).json({
          status: "failed",
          message: errorMsg(error),
          error_code: error
        });
      }
    });
  }
});

router.post('/sensorKey', middlewares.checkAuth, (req, res) =>{
  console.log('New Sensor Key Request for user: ' + req.user.UserName);
  usersDB.update(
    {UserName: req.user.UserName},
    {$set: {SensorKey: rand.generateKey(12)}},
    {},
    (dbErr, matchedCount,) => {
      console.log('DB callback');
      console.log(dbErr);
      if(!dbErr){
        console.log('Update OK, returning affected documents...')
        console.log('matchedCount: ');
        console.log(matchedCount);
        respondeWithSensorKey(req,res);
      } else {
        console.log('update error')
        res.json(dbErr);
      }
  });
});

router.get('/sensorKey', middlewares.checkAuth, (req, res) =>{
  respondeWithSensorKey(req, res);
});

function respondeWithSensorKey(req, res){
  console.log('Sensor Key Request for user: ' + req.user.UserName);
  usersDB.find(
    {UserName: req.user.UserName},
    (dbErr, docs) => {
      console.log('DB callback');
      console.log(dbErr);
      if(!dbErr){
        console.log('Ok, returning key')
        console.log(docs);
        res.json({SensorKey: docs[0].SensorKey})
      } else {
        console.log('db error')
        res.json(dbErr);
      }
  });
}


function errorMsg(errorCode) {
  switch (errorCode) {
    case "missing_field":
      return "ERROR: Missing UserName or Password";
    case "user_unavailable":
      return "ERROR: UserName is already in use. Please select other UserName";
  }
}

module.exports = router;
