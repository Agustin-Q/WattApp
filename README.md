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

[x] Migrate to Mongo DB
[ ] Handle DB connection error
[ ] Define schema for incoming sensor data
[ ] Validate incoming sensor data


------------------------------------------------
### Sensor data schema

```javascript
{
  UserName:"myName",
  DeviceName: "myDeviceName",
  SensorKey:"myKey",
  SensorData: [
    {value: 1234, unit: "kW", timeStamp: 164855498},
    {value: 1234, unit: "kW", timeStamp: 164855498},
    {value: 1234, unit: "kW", timeStamp: 164855498},
    {...},
    {value: 1234, unit: "kW", timeStamp: 164855498},
    ],
  ServerTimeStamp: 1604190950 // added by the server
  }
```