/* jshint esversion: 8 */
console.log("WattApp v0.0.1");
const express = require("express");
const Datastore = require("nedb");
const jwt = require("jsonwebtoken");
const volleyball = require("volleyball");
require('dotenv').config();
const auth = require("./routes/auth.js");
const manage = require("./routes/manage.js");
const cors = require('cors');
const middlewares = require('./middlewares/middlewares.js');
const db = require('./database/database.js');

// Setting up DB
const usersDB = db.usersDB;
const database = db.sensorDataDB;

// Setting Middlewares
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
app.use("/api/manage", manage);

// listen to port 3000 or asigned by server env variable
app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port 3000");
  console.log(process.env.JWT_KEY);
});

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
  if (req.query.fromTime) {
    fromTime = parseInt(req.query.fromTime);
  }
  let toTime = Date.now() / 1000; //date now returns ms, our timestamps are in s
  if (req.query.toTime) {
    toTime = parseInt(req.query.toTime);
  }

  console.log(fromTime);
  database.aggregate([{
        "$match": {
          "SensorData.SensorName": req.query.SensorName,
          "SensorData.TimeStamp": {
            "$gte": fromTime,
            "$lte": toTime,
          }
        }
      },
      {
        "$unwind": "$SensorData"
      },
      {
        "$match": {
          "SensorData.SensorName": req.query.SensorName,
          "SensorData.TimeStamp": {
            "$gte": fromTime,
            "$lte": toTime,
          }
        }
      },
      {
        "$group": {
          "_id": "$SensorData.SensorName",
          "SensorData": {
            "$push": "$SensorData"
          }
        }
      }
    ],
    (error, data) => {
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
app.post("/apiv0", (req, res) => {
  let date = new Date(Date.now()).toLocaleString();
  console.log(date + ": Got a POST request on /api from " + req.hostname + " with body:");
  console.log(req.body);
  usersDB.find({ UserName: req.body.UserName }, (dbErr, docs) => {
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

//------------------
app.post("/api", (req, res, next) => {
  console.log('Request on /api with device key: ', req.body.DeviceKey)
  usersDB.find({ 'Devices.DeviceKey': req.body.DeviceKey }, { projection: { Devices: { $elemMatch: { DeviceKey: req.body.DeviceKey } }, UserName: 1 } },
    (dbError, docs) => {
      //falta handel dberror
      console.log(docs);
      if (docs.length != 1) {
        // incorrect key or duplicate key (very very unlikely)
        // respond with auth failed
        console.log("incorrect key or duplicate key (very very unlikely");
        res.statusCode = 401;
        return next(new Error('Auth Failed.'));
      }
      let docToInsert = {
        UserName: docs[0].UserName,
        DeviceName: docs[0].Devices[0].DeviceName,
        ServerTimeStamp: Date.now(),
        SensorData: []
      }
      console.log(req.body);
      let sensors = docs[0].Devices[0].Sensors;
      for (let i = 0; i < req.body.Values.length; i++) {
        let sensIndex = req.body.Values[i].SensorIndex;
        if (sensIndex < sensors.length) {
          console.log('sensor index ' + sensIndex);
          docToInsert.SensorData.push({
            SensorName: sensors[sensIndex].SensorName,
            Value: req.body.Values[i].Value,
            Unit: sensors[sensIndex].SensorUnit,
            TimeStamp: req.body.Values[i].TimeStamp
          });
        } else {
          res.statusCode = 400;
          console.log('Sensor index ' + sensIndex + ' is out of range.')
          return next(new Error('Sensor index out of range.'));
        }
      }
      database.insert(docToInsert, (dbError, result) => {
        if (dbError) return res.json(dbError)
        return res.json({ status: 'success' })
      })
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
  if (!res.statusCode || res.statusCode == 200) res.status(500);
  res.json({
    message: err.message,
    // stack: err.stack,
  });
}

app.use(notFound);
app.use(errorHandeler);
