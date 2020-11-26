const express = require("express");
const router = express.Router();
const Joi = require("joi");
const rand = require('generate-key')
const middlewares = require('../middlewares/middlewares.js');
const db = require('../database/database.js');

//Device Schema
const deviceSchema = Joi.object({
  DeviceName: Joi.string().alphanum().min(3).max(30).required(),
  DeviceDescription: Joi.string().min(3).max(140).required()
});

//Sensor Schema
const sensorSchema = Joi.object({
  DeviceName: Joi.string().alphanum().min(3).max(30).required(),
  SensorName: Joi.string().alphanum().min(3).max(30).required(),
  SensorType: Joi.string().alphanum().min(3).max(30).required(),
  SensorUnit: Joi.string().alphanum().min(1).max(30).required()
});

router.use(middlewares.checkAuth);

router.post('/sensors', (req, res, next)=>{
  console.log('Here we create sensors!');
  console.log(req.body);
  let validationResult = sensorSchema.validate(req.body);
  if (validationResult.error) throw new Error(validationResult.error);
  db.usersDB.find({UserName: req.user.UserName, "Devices.Sensors.SensorName": req.body.SensorName}, (dbError, docs) =>{
    if (docs.length>0) return next(new Error('Failed.Sensor already exists.'));
    db.usersDB.update({UserName: req.user.UserName,
      "Devices.DeviceName": req.body.DeviceName},
      {$push:{
        "Devices.$.Sensors": {
          SensorName: req.body.SensorName,
          SensorType: req.body.SensorType,
          SensorUnit: req.body.SensorUnit
        }
      }
    }, (dbError, matchedCount) => {
      if(dbError) return next(dbError);
      res.json({status: 'success'});
    });
  });
});

router.post('/devices', (req, res, next) => {
  console.log('Here we create devices!');
  console.log(req.body);
  let validationResult = deviceSchema.validate(req.body);
  console.log(validationResult.error);
  if (validationResult.error) throw new Error(validationResult.error);
  //get user data form db
  db.usersDB.find({UserName: req.user.UserName, "Devices.DeviceName": req.body.DeviceName}, (dbError, docs) => {
    console.log('DB callback')
    console.log('DB Error: ' + dbError);
    if (dbError) return next(new Error(dbError));
    console.log('Number of docs: ' + docs.length);
    if (docs.length > 0) {
      const err = new Error('Failed, device all ready exists');
      res.statusCode = 400;
      return next(err);
    }
    console.log(docs[0]);
    console.log('Inserting device to DB!');
    db.usersDB.update({
      UserName: req.user.UserName
    },
    {
      $push: {
        Devices: {
          DeviceName: req.body.DeviceName,
          DeviceDescription: req.body.DeviceDescription,
          DeviceKey: rand.generateKey(12),
          Sensors: [],  
        }
      }
    });
    res.json(req.body);
  });
  

});

router.get('/devices', (req, res, next) => {
  db.usersDB.find({UserName: req.user.UserName}, (dbError, docs) => {
    if (dbError) return next(dbError);
    res.json(docs[0].Devices);
  });
});


router.post('/DeviceKey', (req, res, next) =>{
  console.log('New Device Key Request for user: ' + req.user.UserName);
  db.usersDB.update(
    {UserName: req.user.UserName, "Devices.DeviceName": req.body.DeviceName},
    {$set: {"Devices.$.DeviceKey": rand.generateKey(12)}},
    {},
    (dbErr, matchedCount,) => {
      console.log('DB callback');
      console.log(matchedCount);
      console.log(dbErr);
      if (matchedCount.n < 1){
        return next(new Error('Device does not exists.'));
      }
      if(!dbErr){
        console.log('Update OK, returning affected documents...')
        console.log('matchedCount: ');
        console.log(matchedCount);
        respondWithDeviceKey(req,res, next);
      } else {
        console.log('update error')
        res.json(dbErr);
      }
  });
});

router.get('/deviceKey', (req, res, next) =>{
  respondWithDeviceKey(req, res, next);
});

function respondWithDeviceKey(req, res, next){
  console.log('Device Key Request for user: ' + req.user.UserName);
  db.usersDB.find(
    {UserName: req.user.UserName, "Devices.DeviceName": req.body.DeviceName},
    {projection: {Devices: {$elemMatch:{DeviceName: req.body.DeviceName}}}},
    (dbErr, docs) => {
      if(docs.length == 0) return next(new Error("Device not Found"));
      console.log('DB callback');
      console.log(dbErr);
      if(!dbErr){
        console.log('Ok, returning key')
        console.log(docs);
        res.json({DeviceKey: docs[0].Devices[0].DeviceKey})
      } else {
        console.log('db error')
        res.json(dbErr);
      }
  });
}

module.exports = router;