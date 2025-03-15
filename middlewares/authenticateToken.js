const jwt = require("jsonwebtoken");

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).send("Access token required");
  }

  req.user = user; // Attach user data to the request object
  next();

  // jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
  //   if (err) {
  //     return res.status(403).send("Invalid or expired token");
  //   }
  //   req.user = user; // Attach user data to the request object
  //   next();
  // });
};

module.exports = authenticateToken;
