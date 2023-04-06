const Users = require("../models/userModel");
const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization");

    if (!token) {
      return res.status(400).json({ message: "InValid Authorization." });
    }


    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decoded) {
      return res.status(400).json({ message: "InValid Authorization." });
    }

    const user = await Users.findOne({ _id: decoded.id });
    req.user = user;
    next();

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = auth;
