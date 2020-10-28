/* jshint esversion: 8 */
console.log("WattApp v0.0.1");
const express = require("express");
const Datastore = require("nedb");
const jwt = require("jsonwebtoken");
const volleyball = require("volleyball");
require('dotenv').config();
const auth = require("./routes/auth.js");
const cors = require('cors');
const middlewares = require('./middlewares/middlewares.js');

// Database set
const database = new Datastore("database.db");
database.loadDatabase();
const usersDB = new Datastore("usersDB.db");
usersDB.loadDatabase();

const app = express();
app.use(volleyball);
app.use(express.static("public"));
app.use(express.json({
  limit: "1mb"
}));
app.use(cors({
  origin: '*'
}))
app.use(middlewares.checkTokenSetUser);
app.use("/api/auth", auth);

app.listen(3000, () => {
  console.log("Listening on port 3000");
  console.log(process.env.JWT_KEY);
});


/*
const checkAuth = (req, res,next)=>{
  try {
    //console.log(req.headers.authorization);
    const token = req.headers.authorization.split(" ")[1];
    //console.log(token);
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.userData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Auth failed"
    });
  }
};
*/


/*-----------------
GET, siempre tiene que devolver los registros ordenados en orden tiempo
mas chico primero, es decir del mas antiguo al mas reciente
Solo limit trae la cantidad mas recientes de registros

*/

app.get("/api", middlewares.checkAuth, (req, res) => {
  console.log("got GET request.");
  console.log(req.query);
  let limitRecords = parseInt(req.query.limit);
  let fromTime = 0;
  if(req.query.fromTime){
      fromTime = parseInt(req.query.fromTime);
  }

console.log(fromTime);
  database
  .find({UserName: req.user.UserName, TimeStamp: { $gt: fromTime }})
  .sort({TimeStamp: -1})
  .limit(limitRecords)
  .exec((error, data) => {
    if (error != null) {      
      console.log("Database Query Error:");
      console.log(error);
      res.sendStatus(500);
    } else {
      console.log('Ok, responding...');
      res.json(data.reverse()); //damos vuelta el array para que esetn ordenados del mas viejo al mas nuevo
    }
  });
});


/*----------------------------------------------
POST TODO:
Schema validation all are required:
  UserName
    autentificate with secret
  DeviceName
    Aplhanumeric, no WS
  Current, Voltage, Power
    number
  TimeStamp
    number

-----------------------------------------------*/
app.post("/api", (req, res) => {
  let date = new Date(Date.now()).toLocaleString();
  console.log(date + ": Got a POST request on /api from " + req.hostname + " with body:");
  console.log(req.body);
  usersDB.find({UserName: req.body.UserName}, (dbErr, docs) => {
    if (docs.length && docs[0].SensorKey == req.body.SensorKey) {
      const timeStamp = Date.now();
      const doc = {
        UserName: req.body.UserName,
        DeviceName: req.body.DeviceName,
        Current: req.body.Current,
        Voltage: req.body.Voltage,
        Power: req.body.Power,
        TimeStamp: req.body.TimeStamp,
        ServerTimeStamp: timeStamp
      };
      console.log('Inserting data to DB');
      database.insert(doc);
    
      res.json({
        status: "success"
      });
    } else {
      console.log('Invalid Sensor Key or UserName');
      res.status(401);
      res.json({
        message: 'Invalid Sensor Key or UserName'
      });
    }
  });
});

function notFound(req, res, next) {
  console.log('Not Found =' + req.originalUrl);
  res.status(404);
  const error = new Error('Not Found =' + req.originalUrl);
  next(error);
}

function errorHandeler(err, req, res, next) {
  console.log('Error handeler');
  console.log(res.statusCode);
  console.log(err);
  if(!res.statusCode) res.status(500);
  res.json({
    message: err.message,
    // stack: err.stack,
  });
}

app.use(notFound);
app.use(errorHandeler);
