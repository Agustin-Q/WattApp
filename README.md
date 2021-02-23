# ⚡WattApp⚡


 ## Sensor Logging API, Backend and Frontend

 This is a project made for learning backend development, frontend development and IoT (Front end, hardware and firmware for the Logging sensor is in a separate repository).

 Backend: https://wattapp-backend.herokuapp.com/api
 
 Frontend: https://wattapp-frontend.herokuapp.com/

 Frontend repo: https://github.com/Agustin-Q/WattApp-frontend
 
 Arduino library repo: coming soon... 😁

 Backend is built using Node.js and the following libraries:
 
 * express (https://www.npmjs.com/package/express)

 * NeDB (https://www.npmjs.com/package/nedb)

 * joi (https://www.npmjs.com/package/joi)

* jsonwebtoken (https://www.npmjs.com/package/jsonwebtoken)

--------------------------------------------------
## ToDo's 💪

- [x] Update User Creation to new schema
- [x] Drop the user collection
- [x] Add route for creating Devices
- [x] Modify route for generating DeviceKey
- [ ] Hash passwords before storing in DB
- [ ] Add route for creating Sensors
- [ ] Modify api/ route for new incoming data
- [x] Migrate to Mongo DB
- [ ] Handle DB connection error
- [x] Define schema for incoming sensor data
- [ ] Validate incoming sensor data
- [ ] Handel bad request when creating devices
- [ ] Handel bad request when creating sensors



------------------------------------------------
### User Data Scheme

```javascript
{
  UserName: "myName",
  Password: "myPassword",
  Devices: [
    {
    DeviceName: "myDeviceName", 
    DeviceDescription: "deviceDescription",
    DeviceKey: "gRfgGHr4H54fghsfdg"
    Sensors:[
      {
      SensorIndex:0, // igual al index en el array
      SensorType:"sensorType",
      SensorUnit: "sensorUnit",
      },
    ]
    },
  ]
}
```
Adding a new user:

```javascript
{
  UserName: "myName",
  Password: "myPassword",
  Devices: [
    {
    DeviceName: "myDeviceName", 
    DeviceDescription: "deviceDescription",
    DeviceKey: "gRfgGHr4H54fghsfdg"
    Sensors:[]
    },
  ]
}
```

```javascript
{
  UserName: "myName",
  Password: "myPassword",
  Devices: [  ]
}
```



### Sensor Data Scheme

```javascript
{
  UserName:"myName", //added by server
  DeviceName: "myDeviceName",  //added by server
  SensorData: [
    {
    sensorIndex: 0,
    sensorName: "mySensor name", //added by server
    value: 1234,
    unit: "kW", //added by server
    timeStamp: 164855498
    },
    {
    sensorIndex: 1,
    sensorName: "my other sensor name", //added by server
    value: 1234,
    unit: "amps", //added by server
    timeStamp: 164855498
    },
  ],
  ServerTimeStamp: 1604190950 // added by the server
  }
```

Sensor data schema send by device:
```javascript
{
  deviceKey: "gRfgGHr4H54fghsfdg",
  values: [
   {sensorIndex: 1, value:123, timeStamp:1601010515},
   {sensorIndex: 2, value:123, timeStamp:1601010515},
   {sensorIndex: 1, value:123, timeStamp:1601010515},
   ...
   {sensorIndex: 1, value:123, timeStamp:1601010515},
  ]
}
```
