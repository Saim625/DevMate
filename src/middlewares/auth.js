const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("Please Login")
    }
    const decodedData = await jwt.verify(token, process.env.JWT_SECRET);
    const { id } = decodedData;
    const user = await User.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    req.user = user
    next();
  } catch (err) {
    res.status(400).send("ERROR: " + err.message)
}
};

module.exports = {
  userAuth,
};
