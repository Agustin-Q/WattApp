const jwt = require('jsonwebtoken');

function checkTokenSetUser(req, res, next) {
  const authHeader = req.get('authorization');
  console.log('This is the checkTokenSetUser middleware!')
  if(authHeader){
    const token = authHeader.split(' ')[1];
    if (token){
      console.log(token);
      // verify token
      jwt.verify(token, process.env.JWT_KEY, (error, user) => {
        if (error){
          console.log('Token verification error!')
          // console.log(error);
        } else {
          req.user = user
          console.log(req.user);
          console.log('token verified!');
        }
        next();
      });
    } else {
      // no token in auth header
      console.log("No Token!");
      next();
    }
  } else {
    // No authorization header
    console.log("No auth header!");
    next();
  }
}

function checkAuth(req, res, next) {
  console.log('checkLoggedin');
  if (req.user){
    console.log('User loggedin!');
    next();
  } else {
    console.log('User NOT loggedin!');
    res.status(401);
    throw new Error('Auth Failed')
  }
}

module.exports = {
  checkTokenSetUser,
  checkAuth,
}