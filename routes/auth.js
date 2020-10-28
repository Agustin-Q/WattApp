/* jshint esversion: 8 */
const express = require("express");
const router = express.Router();
const Datastore = require("nedb");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const rand = require('generate-key')
const middlewares = require('../middlewares/middlewares.js');


const usersDB = new Datastore("usersDB.db");
usersDB.loadDatabase();

const createUserSchema = Joi.object({
  UserName: Joi.string().alphanum().min(3).max(30).required(),
  Secret: Joi.string().trim().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
});

function  createTokenSendResponse (user, res) {
  const token = jwt.sign({
    UserName: user.UserName,
    userID: user._id
  },
  process.env.JWT_KEY, {
    expiresIn: "1h"
  });
  res.json({
    status: "success",
    token: token
  });
}

// pre-pended with /api/auth

router.get("/login", (req, res) => {
  console.log("la re concha de tu madre!!");
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
    if (docs.length >= 1 && req.body.Secret == docs[0].Secret) {
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
    usersDB.find({
      UserName: req.body.UserName
    }, (DBerror, docs) => {
      var error = 0;
      if (req.body.UserName == null || req.body.Secret == null) error = "missing_field";
      if (docs.length > 0) error = "user_unavailable"; // user exists
      if (!error) {
        //if no error insert user in DB
        //TODO: hash password before
        // crerate key for sensors
        const sensorKey = rand.generateKey(12);
        const doc = {
          UserName: req.body.UserName,
          Secret: req.body.Secret,
          SensorKey: sensorKey
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
    {returnUpdatedDocs: true},
    (dbErr, numAffected, affectedDocuments, upsert) => {
      console.log('DB callback');
      console.log(dbErr);
      if(!dbErr){
        console.log('Update OK, returning affected documents...')
        console.log(affectedDocuments);
        res.json(affectedDocuments)
      } else {
        console.log('update error')
        res.json(dbErr);
      }
  });
});

router.get('/sensorKey', middlewares.checkAuth, (req, res) =>{
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
});


function errorMsg(errorCode) {
  switch (errorCode) {
    case "missing_field":
      return "ERROR: Missing UserName or Secret";
    case "user_unavailable":
      return "ERROR: UserName is already in use. Please select other UserName";
  }
}

module.exports = router;
