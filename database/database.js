const monk = require('monk');

// Setting up DB
const db = monk(process.env.DATABASE_URL);
db.then(() => {
  console.log('Connected correctly to database server: '  + process.env.DATABASE_URL)
});

const usersDB = db.get('users');
const sensorDataDB = db.get('sensorData');

module.exports = {
  usersDB,
  sensorDataDB,
}