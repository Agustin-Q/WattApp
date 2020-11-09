# ⚡WattApp⚡


 ## Sensor Logging API, Backend and Frontend

 This is a project made for learning backend development, frontend development and IoT (Front end, hardware and firmware for the Logging sensor is in a separate repository).

 Frontend repo: https://github.com/Agustin-Q/WattApp-frontend
 Arduino library repo: coming soon... 😁

 Backend is built using Node.js and the following libraries:
 
 * express (https://www.npmjs.com/package/express)

 * NeDB (https://www.npmjs.com/package/nedb)

 * joi (https://www.npmjs.com/package/joi)

* jsonwebtoken (https://www.npmjs.com/package/jsonwebtoken)

--------------------------------------------------
## ToDo's 💪

[x] Update User Creation to new schema
[x] Drop the user collection
[x] add route for creating Devices
[x] Modify route for generating DeviceKey
[ ] Add route for creating Sensors
[ ] Modify api/ route for new incoming data
[x] Migrate to Mongo DB
[ ] Handle DB connection error
[x] Define schema for incoming sensor data
[ ] Validate incoming sensor data


------------------------------------------------
### user data schema

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
new user:

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



### sensor data schema

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

Data schema send by device
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




------------
Other option enbedded data model.
Pros:
All data is the same collection
No duplicate data
Cons:
when retreving sensor data for one moment, all data from user must be retrieved.

```javascript
{
  UserName: "myName",
  Password: "myPassword",
  devices: [
    {
    deviceName: "myDeviceName", 
    deviceDescription: "deviceDescription",
    deviceKey: "gRfgGHr4H54fghsfdg"
    sensors:[
      {
      sensorIndex:0, // igual al index en el array
      sensorType:"sensorType",
      sensorUnit: "sensorUnit",
      data: [
        {value: 1234, timestamp: 1699034, serverTimestamp: 168964355},
      ]
      },
    },
  ]
}

db.find({UserName: "myUsername"})
docs.devices[0].sensors[0].data[0].value
```


-----------
test data

[
  {
    "UserName": "myName",
    "Password": "myPassword",
    "devices": [
      {
        "deviceName": "myDeviceName",
        "deviceDescription": "deviceDescription",
        "deviceKey": "a",
        "sensors": [
          {
            "sensorIndex": 0,
            "sensorType": "sensorType",
            "sensorUnit": "sensorUnit",
            
          },
          
        ],
        
      },
      {
        "deviceName": "myDeviceName",
        "deviceDescription": "deviceDescription",
        "deviceKey": "c",
        "sensors": [
          {
            "sensorIndex": 0,
            "sensorType": "sensorType",
            "sensorUnit": "sensorUnit",
            
          },
          
        ],
        
      }
    ]
  },
  {
    "UserName": "user2",
    "Password": "myPassword",
    "devices": [
      {
        "deviceName": "myDeviceName",
        "deviceDescription": "deviceDescription",
        "deviceKey": "b",
        "sensors": [
          {
            "sensorIndex": 0,
            "sensorType": "sensorType",
            "sensorUnit": "sensorUnit",
            
          },
          
        ],
        
      }
    ]
  }
]