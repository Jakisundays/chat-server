const jwt = require("jsonwebtoken");
require("dotenv").config();

const secret = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, secret, (err, payload) => {
    if (err) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = payload;
    next();
  });
};

module.exports = verifyToken;
